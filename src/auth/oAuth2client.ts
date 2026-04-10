/**
 * OAuth2クライアント
 */
import createDebug from 'debug';
import { status } from '../httpStatus';
import * as querystring from 'querystring';

import { AuthClient } from '../auth/authClient';
import { IRequestOptions, RequestError, DefaultTransporter, fetchWithTimeout } from '../transporters';
import { ICredentials } from './credentials';
import { AbstractCredentialsRepo } from './repo/credentials';

const debug = createDebug('surfrock-sdk:auth:oAuth2client');
export const DEFAULT_TIMEOUT_GET_TOKEN_IN_MILLISECONDS = 20000;

export interface IGenerateAuthUrlOpts {
    scopes: string[];
    state: string;
    codeVerifier?: string;
}

export interface IOptions {
    domain: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    logoutUri?: string;
    responseType?: string;
    responseMode?: string;
    scopes?: string[];
    state?: string;
    nonce?: string | null;
    audience?: string;
    tokenIssuer?: string;
    /**
     * カスタム認証情報リポジトリ
     */
    credentialsRepo?: AbstractCredentialsRepo;
}

/**
 * OAuth2 client
 */
export class OAuth2client implements AuthClient {
    /**
     * The base endpoint for token retrieval.
     */
    protected static readonly OAUTH2_TOKEN_URI: string = '/token';

    public credentials: ICredentials;
    public options: IOptions;

    constructor(options: IOptions) {
        // TODO add minimum validation

        this.options = options;
        this.credentials = {};
    }

    /**
     * OAuthクライアントに認証情報をセットします。
     */
    public setCredentials(credentials: ICredentials) {
        this.credentials = credentials;
    }

    public async refreshAccessToken(): Promise<ICredentials> {
        const refreshTokenByCredentials = this.credentials.refresh_token;
        if (typeof refreshTokenByCredentials !== 'string') {
            throw new Error('No refresh token is set.');
        }

        const tokens = await this.refreshToken(refreshTokenByCredentials);
        tokens.refresh_token = refreshTokenByCredentials;
        debug('setting credentials...', tokens);
        this.credentials = tokens;

        // save in remote(2024-11-20~)
        if (this.options.credentialsRepo !== undefined) {
            debug('saving in repo...', this.credentials);
            await this.options.credentialsRepo.save(this.credentials);
        }

        return this.credentials;
    }

    /**
     * 期限の切れていないアクセストークンを取得します。
     * 必要であれば更新してから取得します。
     */
    public async getAccessToken(): Promise<string> {
        // find from remote(2024-11-20~)
        if (typeof this.credentials.access_token !== 'string') {
            if (this.options.credentialsRepo !== undefined) {
                const credentialsFromRepo = await this.options.credentialsRepo.find();
                debug('credentials in repo found,', credentialsFromRepo);
                if (typeof credentialsFromRepo?.access_token === 'string') {
                    this.credentials = credentialsFromRepo;
                }
            }
        }

        const expiryDate = this.credentials.expiry_date;

        // if no expiry time, assume it's not expired
        const isTokenExpired = (expiryDate !== undefined) ? (expiryDate <= (new Date()).getTime()) : false;

        if (this.credentials.access_token === undefined && this.credentials.refresh_token === undefined) {
            throw new Error('No access or refresh token is set.');
        }

        const shouldRefresh = (this.credentials.access_token === undefined) || isTokenExpired;
        if (shouldRefresh && this.credentials.refresh_token !== undefined) {
            await this.refreshAccessToken();
        }

        return this.credentials.access_token as string;
    }

    /**
     * Revokes the access given to token.
     * @param token The existing token to be revoked.
     */
    // public revokeToken(token: string) {
    // }

    /**
     * Provides a request implementation with OAuth 2.0 flow.
     * If credentials have a refresh_token, in cases of HTTP
     * 401 and 403 responses, it automatically asks for a new
     * access token and replays the unsuccessful request.
     * @param options Request options.
     */
    public async fetch(url: string, options: RequestInit, requestOptions: IRequestOptions, expectedStatusCodes: number[]) {
        // Callbacks will close over this to ensure that we only retry once
        let retry = true;

        options.headers = (options.headers === undefined || options.headers === null) ? {} : options.headers;

        // let result: Response;
        let numberOfTry = 0;
        while (true) {
            try {
                numberOfTry += 1;
                // 1リトライしたら、もうリトライしない
                if (numberOfTry > 1) {
                    retry = false;
                }

                (options.headers as Record<string, string>).Authorization = `Bearer ${await this.getAccessToken()}`;
                // result = await this.makeFetch(url, options, requestOptions, expectedStatusCodes);
                // 変数に代入せず、そのまま return して関数を抜ける
                return await this.makeFetch(url, options, requestOptions, expectedStatusCodes);
                // break;
            } catch (error) {
                /* istanbul ignore else */
                if (error instanceof Error) {
                    const statusCode = (error as RequestError).code;

                    if (retry && (statusCode === status.UNAUTHORIZED || statusCode === status.FORBIDDEN)) {
                        /* It only makes sense to retry once, because the retry is intended
                         * to handle expiration-related failures. If refreshing the token
                         * does not fix the failure, then refreshing again probably won't
                         * help */

                        // Force token refresh
                        await this.refreshAccessToken();

                        continue;
                    }
                }

                throw error;
            }
        }

        // return result;
    }

    /**
     * Makes a request without paying attention to refreshing or anything
     * Assumes that all credentials are set correctly.
     */
    protected async makeFetch(
        url: string, options: RequestInit, requestOptions: IRequestOptions, expectedStatusCodes: number[]
    ) {
        const transporter = new DefaultTransporter(expectedStatusCodes);

        return transporter.fetch(url, options, requestOptions);
    }

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(refreshToken: string): Promise<ICredentials> {
        // request for new token
        debug('refreshing access token...', this.credentials, refreshToken);

        const form = {
            client_id: this.options.clientId,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        };
        const secret = Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`, 'utf8').toString('base64');
        const options: RequestInit = {
            body: querystring.stringify(form),
            method: 'POST',
            headers: {
                Authorization: `Basic ${secret}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // timeout設定(2022-12-03~)
        return fetchWithTimeout(
            // return fetch(
            `https://${this.options.domain}${OAuth2client.OAUTH2_TOKEN_URI}`,
            options,
            { timeout: DEFAULT_TIMEOUT_GET_TOKEN_IN_MILLISECONDS }
        ).then(async (response) => {
            debug('response:', response.status);
            if (response.status !== status.OK) {
                if (response.status === status.BAD_REQUEST) {
                    const body = await response.json() as { error?: string };
                    throw new Error(body.error);
                } else {
                    const body = await response.text();
                    throw new Error(body);
                }
            } else {
                const tokens = await response.json() as { expires_in?: number; expiry_date?: number };
                /* istanbul ignore else */
                if (tokens && tokens.expires_in) {
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }

                return tokens;
            }
        });
    }
}
