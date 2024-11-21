import { DefaultTransporter, IRequestOptions } from '../transporters';

/**
 * 抽象認証クライアント
 */
export abstract class AuthClient {
    public abstract fetch(
        url: string, options: RequestInit, requestOptions: IRequestOptions, expectedStatusCodes: number[]
    ): Promise<Response>;
    public abstract getAccessToken(): Promise<string>;
}
/**
 * テスト認証クライアント
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export class StubAuthClient implements AuthClient {
    // tslint:disable-next-line:prefer-function-over-method
    public async fetch(
        url: string, options: RequestInit, requestOptions: IRequestOptions, expectedStatusCodes: number[]
    ): Promise<Response> {
        return (new DefaultTransporter(expectedStatusCodes)).fetch(url, options, requestOptions);
    }
    // tslint:disable-next-line:prefer-function-over-method
    public async getAccessToken(): Promise<string> {
        return 'access_token';
    }
}
