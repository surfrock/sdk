/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seat service test
 */
import * as assert from 'assert';
import { OK } from 'http-status';
import { } from 'mocha';
import * as sinon from 'sinon';
import { MockAgent, setGlobalDispatcher } from 'undici';
import * as client from '../index';

import { StubAuthClient } from '../auth/authClient';

const API_ENDPOINT = 'https://localhost';

describe('着券サービス', () => {
    let sandbox: sinon.SinonSandbox;
    let mockAgent: MockAgent;
    let mockPool: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // 1. MockAgent の初期化
        mockAgent = new MockAgent();
        mockAgent.disableNetConnect(); // 実際の通信を遮断
        setGlobalDispatcher(mockAgent);

        // エンドポイントに対するプールを作成
        mockPool = mockAgent.get(API_ENDPOINT);
    });
    afterEach(() => {
        sandbox.restore();
        // 未実行のモックがないか検証
        mockAgent.assertNoPendingInterceptors();
    });

    it('着券結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const seatService = new client.service.seat.SeatService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        mockPool.intercept({
            method: 'POST',
            path: (p: string) => p.includes('/seat/seatInfoSync')
        }).reply(OK, data);
        const result = await seatService.seatInfoSync({} as any);
        assert.deepEqual(result, data);
        sandbox.verify();
    });

    it('座席解放結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const seatService = new client.service.seat.SeatService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        mockPool.intercept({
            method: 'POST',
            path: (p: string) => p.includes('/seat/seatInfoSyncCancel')
        }).reply(OK, data);
        const result = await seatService.seatInfoSyncCancel({} as any);
        assert.deepEqual(result, data);
        sandbox.verify();
    });
});
