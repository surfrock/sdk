/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { status } from './httpStatus';
import nock from 'nock';

import { DefaultTransporter, RequestError } from './transporters';

const API_ENDPOINT = 'https://example.com';

describe('fetch()', () => {
    let scope: nock.Scope;

    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    [status.CREATED, status.OK].forEach((statusCode) => {
        it(`次のステータスコードが返却されれば、レスポンスを取得できるはず ${statusCode}`, async () => {
            const body: any = { key: 'value' };

            const transporter = new DefaultTransporter([statusCode]);

            scope = nock(API_ENDPOINT)
                .get('/uri')
                .reply(statusCode, body);

            const result = await transporter.fetch(`${API_ENDPOINT}/uri`, {}, {})
                .then(async (res) => res.json());
            expect(result).toStrictEqual(body);
            expect(scope.isDone()).toBeTruthy();
        });
    });

    [
        status.BAD_REQUEST,
        status.FORBIDDEN,
        status.INTERNAL_SERVER_ERROR,
        status.NOT_FOUND,
        status.NOT_IMPLEMENTED,
        status.UNAUTHORIZED
    ].forEach((statusCode) => {
        it(`次のステータスコードが返却されれば、リクエストエラーが投げられるはず ${statusCode}`, async () => {
            const body = {
                error: {
                    errors: [],
                    code: statusCode,
                    message: 'message'
                }
            };

            const transporter = new DefaultTransporter([status.OK]);

            scope = nock(API_ENDPOINT)
                .get('/uri')
                .reply(statusCode, body);

            const result = await transporter.fetch(`${API_ENDPOINT}/uri`, {}, {})
                .catch((err) => err);

            expect(result).toBeInstanceOf(Error);
            expect((result as RequestError).code).toBe(statusCode);
            expect((result as RequestError).message).toBe(body.error.message);
            expect(scope.isDone()).toBeTruthy();
        });
    });

    it('timeoutを設定してもレスポンスを取得できるはず', async () => {
        const body: any = { key: 'value' };

        const transporter = new DefaultTransporter([status.OK]);

        scope = nock(API_ENDPOINT)
            .get('/uri')
            .reply(status.OK, body);

        const result = await transporter
            .fetch(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
            .then(async (res) => res.json());
        expect(result).toStrictEqual(body);
        expect(scope.isDone()).toBeTruthy();
    });

    it('レスポンスボディがjsonでなければ、適切なエラーが投げられるはず', async () => {
        const body = 'body text';
        const statusCode = status.INTERNAL_SERVER_ERROR;

        const transporter = new DefaultTransporter([status.OK]);

        scope = nock(API_ENDPOINT)
            .get('/uri')
            .reply(statusCode, body);

        const result = await transporter.fetch(`${API_ENDPOINT}/uri`, {}, {})
            .catch((err) => err);
        expect(result).toBeInstanceOf(Error);
        expect((result as RequestError).code).toBe(statusCode);
        expect((result as RequestError).message).toBe(body);
        expect(scope.isDone()).toBeTruthy();
    });
});

// describe('CONFIGURE()', () => {
//     // it('既存のUser-Agentヘッダーにパッケージ情報がなければ、ヘッダーに情報が追加されるはず', async () => {
//     //     const options = {
//     //         headers: {
//     //             'User-Agent': 'useragent'
//     //         }
//     //     };

//     //     const result = DefaultTransporter.CONFIGURE(options);
//     //     assert((<any>result.headers)['User-Agent'].indexOf(DefaultTransporter.USER_AGENT) > 0);
//     //     sandbox.verify();
//     // });
// });
