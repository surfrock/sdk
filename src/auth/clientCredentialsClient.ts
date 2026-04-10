import { status } from '../httpStatus';
import { stringify } from 'querystring';

import { fetchWithTimeout } from '../transporters';
import { ICredentials } from './credentials';
import { DEFAULT_TIMEOUT_GET_TOKEN_IN_MILLISECONDS, IOptions as IOAuth2clientOptions, OAuth2client } from './oAuth2client';

export type IOptions = Pick<IOAuth2clientOptions, 'domain' | 'credentialsRepo'> & {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    state: string;
};

/**
 * クライアント認証OAuthクライアント
 */
export class ClientCredentialsClient extends OAuth2client {
    public options: IOptions;

    constructor(options: IOptions) {
        // TODO add minimum validation

        super(options);
        this.options = options;

        this.credentials = { refresh_token: 'ignored' };
    }

    /**
     * クライアント認証でアクセストークンを取得します。
     */
    public async getToken(): Promise<ICredentials> {
        const form = {
            scope: this.options.scopes.join(' '),
            state: this.options.state,
            grant_type: 'client_credentials'
        };
        const secret = Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`, 'utf8').toString('base64');
        const options: RequestInit = {
            // credentials: 'include', // 不要か(2025-07-31~)
            body: stringify(form),
            method: 'POST',
            headers: {
                Authorization: `Basic ${secret}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // timeout設定(2022-12-03~)
        return fetchWithTimeout(
            `https://${this.options.domain}${OAuth2client.OAUTH2_TOKEN_URI}`,
            options,
            { timeout: DEFAULT_TIMEOUT_GET_TOKEN_IN_MILLISECONDS }
        ).then(async (response) => {
            if (response.status !== status.OK) {
                if (response.status === status.BAD_REQUEST) {
                    const body = await response.json() as { error?: string };
                    throw new Error(body.error);
                } else {
                    const body = await response.text();
                    throw new Error(body);
                }
            } else {
                const tokens = await response.json() as { expires_in?: number; expiry_date?: number; refresh_token?: string };
                /* istanbul ignore else */
                if (tokens && tokens.expires_in) {
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }

                tokens.refresh_token = 'ignored';

                return tokens;
            }
        });
    }

    /**
     * Refreshes the access token.
     */
    protected async refreshToken(__: string): Promise<ICredentials> {
        return this.getToken();
    }
}
