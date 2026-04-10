/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthClient } from './auth/authClient';
import { DefaultTransporter, IRequestOptions, Transporter } from './transporters';

/**
 * service constructor options
 */
export interface IOptions {
    /**
     * API endpoint
     * @example
     * http://localhost:8081
     */
    endpoint: string;
    /**
     * OAuth2 client object
     */
    auth?: AuthClient;
    /**
     * transporter object
     */
    transporter?: Transporter;
}
export interface IFetchOptions {
    uri: string;
    method: string;
    headers?: Record<string, any>;
    body?: any;
    expectedStatusCodes: number[];
    /**
     * クエリは不使用なので廃止
     */
    qs?: never;
    /**
     * formは不使用なので廃止
     */
    form?: never;
}
/**
 * base service class
 */
export class Service {
    public options: IOptions;
    public requestOptions: IRequestOptions;
    constructor(options: IOptions, requestOptions?: IRequestOptions) {
        this.options = options;
        this.requestOptions = {};
        /* istanbul ignore else */
        if (requestOptions !== undefined) {
            this.requestOptions = { ...this.requestOptions, ...requestOptions };
        }
    }
    /**
     * Create and send request to API
     */
    public async fetch(options: IFetchOptions) {
        const defaultOptions = {
            headers: {},
            method: 'GET'
        };
        options = { ...defaultOptions, ...options };

        const baseUrl = this.options.endpoint;
        const url = `${baseUrl}${options.uri}`;

        // クエリは不使用なので廃止(2026-03-31~)
        // const querystrings = qs.stringify(options.qs);
        // url += (querystrings.length > 0) ? `?${querystrings}` : '';

        const headers = {
            ...{
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            ...options.headers
        };

        const fetchOptions: RequestInit = {
            method: options.method,
            headers: headers,
            body: JSON.stringify(options.body)
        };

        // create request (using authClient or otherwise and return request obj)
        if (this.options.auth !== undefined) {
            return this.options.auth.fetch(url, fetchOptions, this.requestOptions, options.expectedStatusCodes);
        } else {
            const transporter =
                (this.options.transporter !== undefined) ? this.options.transporter : new DefaultTransporter(options.expectedStatusCodes);

            return transporter.fetch(url, fetchOptions, this.requestOptions);
        }
    }
}
/**
 * 検索結果インターフェース
 */
export interface ISearchResult<T> {
    /**
     * マッチ数
     */
    totalCount: number;
    /**
     * マッチデータ
     */
    data: T;
}
