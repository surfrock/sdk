/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * transporter test
 */
import assert from 'assert';
import { status } from './httpStatus';
// import * as fetch from 'isomorphic-fetch';
import { } from 'mocha';
import nock from 'nock';
import * as sinon from 'sinon';

import { DefaultTransporter, RequestError } from './transporters';

const API_ENDPOINT = 'https://example.com';

describe('fetch()', () => {
    let scope: nock.Scope;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nock.cleanAll();
        nock.disableNetConnect();
    });

    afterEach(() => {
        sandbox.restore();
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
            assert.deepEqual(result, body);
            sandbox.verify();
            assert(scope.isDone());
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

            assert(result instanceof Error);
            assert.equal((result as RequestError).code, statusCode);
            assert.equal((result as RequestError).message, body.error.message);
            sandbox.verify();
            assert(scope.isDone());
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
        assert.deepEqual(result, body);
        sandbox.verify();
        assert(scope.isDone());
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
        assert(result instanceof Error);
        assert.equal((result as RequestError).code, statusCode);
        assert.equal((result as RequestError).message, body);
        sandbox.verify();
        assert(scope.isDone());
    });
});

describe('CONFIGURE()', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    // it('既存のUser-Agentヘッダーにパッケージ情報がなければ、ヘッダーに情報が追加されるはず', async () => {
    //     const options = {
    //         headers: {
    //             'User-Agent': 'useragent'
    //         }
    //     };

    //     const result = DefaultTransporter.CONFIGURE(options);
    //     assert((<any>result.headers)['User-Agent'].indexOf(DefaultTransporter.USER_AGENT) > 0);
    //     sandbox.verify();
    // });
});
