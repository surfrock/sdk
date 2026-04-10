/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { status } from '../httpStatus';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { SeatService } from './seat';

import { StubAuthClient } from '../auth/authClient';

const API_ENDPOINT = 'https://localhost';

describe('着券サービス', () => {
    let mockAgent: MockAgent;
    let mockPool: any;

    beforeEach(() => {
        // 1. MockAgent の初期化
        mockAgent = new MockAgent();
        mockAgent.disableNetConnect(); // 実際の通信を遮断
        setGlobalDispatcher(mockAgent);

        // エンドポイントに対するプールを作成
        mockPool = mockAgent.get(API_ENDPOINT);
    });
    afterEach(() => {
        // 未実行のモックがないか検証
        mockAgent.assertNoPendingInterceptors();
    });

    it('着券結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const seatService = new SeatService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        mockPool.intercept({
            method: 'POST',
            path: (p: string) => p.includes('/seat/seatInfoSync')
        }).reply(status.OK, data);
        const result = await seatService.seatInfoSync({} as any);
        expect(result).toStrictEqual(data);
    });

    it('座席解放結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const seatService = new SeatService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        mockPool.intercept({
            method: 'POST',
            path: (p: string) => p.includes('/seat/seatInfoSyncCancel')
        }).reply(status.OK, data);
        const result = await seatService.seatInfoSyncCancel({} as any);
        expect(result).toStrictEqual(data);
    });
});
