/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auth service test
 */
import { describe, beforeEach, afterEach, afterAll, it, expect } from 'vitest';
import { status } from '../httpStatus';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { AuthService } from './auth';

import { StubAuthClient } from '../auth/authClient';

const API_ENDPOINT = 'https://localhost';

describe('認証サービス', () => {
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
    afterAll(async () => {
        await mockAgent.close();
    });

    it('購入番号認証結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const authService = new AuthService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        mockPool.intercept({
            method: 'POST',
            path: (p: string) => p.includes('/auth/purchaseNumberAuth')
        }).reply(status.OK, data);

        const result = await authService.purchaseNumberAuth({} as any);
        expect(result).toStrictEqual(data);
    });
});
