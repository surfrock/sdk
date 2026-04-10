/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * transporter test
 */
import assert from 'assert';
import { status } from './httpStatus';
import { } from 'mocha';
import nock from 'nock';
import * as sinon from 'sinon';
// import { MockAgent, setGlobalDispatcher } from 'undici';

import { fetchWithTimeout } from './transporters';

const API_ENDPOINT = 'https://example.com';

describe('fetchWithTimeout()', () => {
    let scope: nock.Scope;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.restore();
        nock.cleanAll();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    it('timeoutを設定してもレスポンスを取得できるはず', async () => {
        const body: any = { key: 'value' };

        scope = nock(API_ENDPOINT)
            .get('/uri')
            .reply(status.OK, body);

        const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
            .then(async (res) => res.json());
        assert.deepEqual(result, body);
        sandbox.verify();
        assert(scope.isDone());
    });

    it('AbortErrorの場合、エラーオブジェクトにrequestOptionが拡張される', async () => {
        const body: any = { key: 'value' };

        // const transporter = new DefaultTransporter([OK]);

        scope = nock(API_ENDPOINT)
            .get('/uri')
            .delay(3000)
            .reply(status.OK, body);

        const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 1 })
            .catch((err) => err);
        assert(result instanceof Error);
        // assert.equal(result.name, 'AbortError');
        assert.equal(result.name, 'TimeoutError');
        sandbox.verify();
        assert(scope.isDone());
    });

    it('AbortError以外の場合、そのまま例外が投げられる', async () => {
        const errorMessage = 'unknown error';
        scope = nock(API_ENDPOINT)
            .get('/uri')
            .replyWithError(errorMessage);

        const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
            .catch((err) => err);
        assert(result instanceof Error);
        // assert.equal(result.name, 'FetchError');
        sandbox.verify();
        assert(scope.isDone());
    });
});

// describe('fetchWithTimeout()', () => {
//     // let scope: nock.Scope;
//     let sandbox: sinon.SinonSandbox;
//     let mockAgent: MockAgent;
//     let mockPool: any;

//     beforeEach(() => {
//         sandbox = sinon.createSandbox();
//         sandbox.restore();
//         // nock.cleanAll();
//         // nock.disableNetConnect();

//         // 1. MockAgent の初期化
//         mockAgent = new MockAgent();
//         mockAgent.disableNetConnect(); // 実際の通信を遮断
//         setGlobalDispatcher(mockAgent);

//         // エンドポイントに対するプールを作成
//         mockPool = mockAgent.get(API_ENDPOINT);
//     });

//     afterEach(() => {
//         nock.cleanAll();
//         nock.enableNetConnect();
//         // 未実行のモックがないか検証
//         mockAgent.assertNoPendingInterceptors();
//     });
//     after(async () => {
//         await mockAgent.close();
//     });

//     it('timeoutを設定してもレスポンスを取得できるはず', async () => {
//         const body: any = { key: 'value' };

//         mockPool.intercept({
//             method: 'GET',
//             path: (p: string) => p.includes(`/uri`)
//         })
//             .reply(OK, body);
//         // scope = nock(API_ENDPOINT)
//         //     .get('/uri')
//         //     .reply(OK, body);

//         const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
//             .then(async (res) => res.json());
//         assert.deepEqual(result, body);
//         sandbox.verify();
//         // assert(scope.isDone());
//     });

//     it('AbortErrorの場合、エラーオブジェクトにrequestOptionが拡張される', async () => {
//         const body: any = { key: 'value' };

//         // const transporter = new DefaultTransporter([OK]);

//         mockPool.intercept({
//             method: 'GET',
//             path: (p: string) => p.includes(`/uri`)
//         })
//             // .delay(3000)
//             // .reply(OK, body);
//             .reply(async () => {
//                 // 1. ここで意図的にレスポンスを遅らせる
//                 // タイムアウト設定(1ms)よりも長い時間を指定します
//                 await new Promise((resolve) => setTimeout(resolve, 100));

//                 return {
//                     statusCode: OK,
//                     data: body
//                 };
//             });
//         // scope = nock(API_ENDPOINT)
//         //     .get('/uri')
//         //     .delay(3000)
//         //     .reply(OK, body);

//         const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 1 })
//             .catch((err) => err);

//         // // --- ここが重要！ ---
//         // // タイムアウトで通信が切れたため、残ってしまったこのテスト用のモックを強制的に掃除します
//         // // これをしないと afterEach の assertNoPendingInterceptors でコケます
//         // mockAgent.assertNoPendingInterceptors();
//         // --- ここがポイント！ ---
//         // タイムアウトで中断されたインターセプターを強制終了させます。
//         // これにより、afterEach での pending エラーを防げます。
//         await mockAgent.close();

//         assert(result instanceof Error);
//         // assert.equal(result.name, 'AbortError');
//         assert.equal(result.name, 'TimeoutError');
//         sandbox.verify();
//         // assert(scope.isDone());
//     });

//     it('AbortError以外の場合、そのまま例外が投げられる', async () => {
//         const errorMessage = 'unknown error';

//         mockPool.intercept({
//             method: 'GET',
//             path: (p: string) => p.includes(`/uri`)
//         })
//             .replyWithError(errorMessage);
//         // scope = nock(API_ENDPOINT)
//         //     .get('/uri')
//         //     .replyWithError(errorMessage);

//         const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
//             .catch((err) => err);
//         assert(result instanceof Error);
//         // assert.equal(result.name, 'FetchError');
//         sandbox.verify();
//         // assert(scope.isDone());
//     });
// });
