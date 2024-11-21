// tslint:disable:max-classes-per-file
/**
 * transporters
 */
import AbortController from 'abort-controller';
import * as createDebug from 'debug';
import * as fetch from 'isomorphic-fetch';

const debug = createDebug('surfrock-abstract-sdk:transporters');
// tslint:disable-next-line
// const pkg = require('../package.json');

export interface IRequestOptions {
    timeout?: number;
}

/**
 * トランスポーター抽象クラス
 */
export abstract class Transporter {
    public abstract fetch(url: string, options: RequestInit, requestOptions: IRequestOptions): Promise<Response>;
}
export type IBodyResponseCallback = Promise<Response>;
/**
 * RequestError
 */
export class RequestError extends Error {
    public code: number;
    public errors: Error[];

    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    constructor(message?: string) {
        super(message);
        this.name = 'MovieticketReserveRequestError';
    }
}
/**
 * DefaultTransporter
 */
export class DefaultTransporter implements Transporter {
    /**
     * Default user agent.
     */
    // public static readonly USER_AGENT: string = `surfrock-abstract-sdk/${pkg.version}`;
    public expectedStatusCodes: number[];
    constructor(expectedStatusCodes: number[]) {
        this.expectedStatusCodes = expectedStatusCodes;
    }
    /**
     * Configures request options before making a request.
     */
    public static CONFIGURE(options: RequestInit): RequestInit {
        // set transporter user agent
        // options.headers = (options.headers !== undefined) ? options.headers : {};
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        // if (!(<any>options.headers)['User-Agent']) {
        //     (<any>options.headers)['User-Agent'] = DefaultTransporter.USER_AGENT;
        // } else if ((<any>options.headers)['User-Agent'].indexOf(DefaultTransporter.USER_AGENT) === -1) {
        //     (<any>options.headers)['User-Agent'] = `${(<any>options.headers)['User-Agent']} ${DefaultTransporter.USER_AGENT}`;
        // }

        return options;
    }
    /**
     * Makes a request with given options and invokes callback.
     */
    public async fetch(url: string, options: RequestInit, requestOptions: IRequestOptions) {
        const fetchOptions = DefaultTransporter.CONFIGURE(options);
        debug('fetching...', url, fetchOptions, requestOptions);

        // タイムアウト処理を追加
        // return fetch(url, fetchOptions)
        //     .then(async (response) => this.wrapCallback(response));
        return fetchWithTimeout(url, fetchOptions, requestOptions)
            .then(async (response) => this.wrapCallback(response));
    }

    /**
     * Wraps the response callback.
     */
    private async wrapCallback(response: Response): Promise<Response> {
        let err: RequestError = new RequestError('An unexpected error occurred');
        debug('request processed', response.status);
        if (this.expectedStatusCodes.indexOf(response.status) < 0) {
            // Consider all 4xx and 5xx responses errors.
            let body: any;
            try {
                // Only and only application/json responses should
                // be decoded back to JSON, but there are cases API back-ends
                // responds without proper content-type.
                body = await response.clone()
                    .json();
            } catch (error) {
                body = await response.clone()
                    .text();
            }
            if (typeof body === 'object' && body.error !== undefined) {
                err = new RequestError(body.error.message);
                err.code = response.status;
                err.errors = body.error.errors;
            } else {
                err = new RequestError(body);
                err.code = response.status;
                err.errors = [];
            }
        } else {
            return response;
        }
        throw err;
    }
}

export async function fetchWithTimeout(url: string, fetchOptions: RequestInit, requestOptions: IRequestOptions) {
    const requestInit: RequestInit = {
        ...fetchOptions
    };
    let abortTimer: NodeJS.Timeout | undefined;
    if (typeof requestOptions.timeout === 'number' && requestOptions.timeout > 0) {
        const controller = new AbortController();
        abortTimer = setTimeout(
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore next */
            () => {
                debug('abortController aborting...');
                controller.abort();
            },
            requestOptions.timeout
        );
        requestInit.signal = <any>controller.signal;
    }

    let abortError: any;
    let response: any;

    try {
        debug('fetching with timeout...', requestOptions.timeout, 'ms');
        response = await fetch(url, requestInit);
        debug('fetched with timeout', requestOptions.timeout, 'ms');
    } catch (error) {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        debug('request was aborted', error.name);
        // if (error instanceof fetch.AbortError) {
        // }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        abortError = error;
    } finally {
        if (abortTimer !== undefined) {
            debug('clearing abort timer...');
            clearTimeout(abortTimer);
        }
    }

    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore if */
    if (abortError !== undefined) {
        throw abortError;
    }

    return response;
}
