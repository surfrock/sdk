/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vi, expect } from 'vitest';

import { StubAuthClient } from './auth/authClient';
import { Service } from './service';
import { DefaultTransporter, Transporter } from './transporters';

/**
 * スタブトランポーター
 */
class StubTransporter implements Transporter {
    public body: any;
    constructor(body: any) {
        this.body = body;
    }
    public async fetch(_: string, options: RequestInit) {
        return new Response(this.body, options);
    }
}
const API_ENDPOINT = 'https://example.com';

describe('fetch()', () => {
    it('認証クライアントが正常であれば、レスポンスを取得できるはず', async () => {
        const response: any = { key: 'value' };

        const auth = new StubAuthClient();
        const service = new Service(
            {
                auth: auth,
                endpoint: API_ENDPOINT
            },
            { timeout: 10000 }
        );

        const fetchSpy = vi.spyOn(auth, 'fetch').mockResolvedValue(response);

        const result = await service.fetch({} as any);

        expect(result).toEqual(response);
        expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('認証不要な場合、transporterが正常であれば、レスポンスを取得できるはず', async () => {
        const response: any = JSON.stringify({ key: 'value' });

        const service = new Service({
            endpoint: API_ENDPOINT,
            transporter: new StubTransporter(response)
        });

        const result = await service.fetch({} as any);
        expect(await result.json()).toEqual(JSON.parse(response));
    });

    it('authオプションもtransporterオプションも未定義であれば、内部的にDefaultTransporterインスタンスが生成されてfetchメソッドが呼ばれるはず', async () => {
        const options = {};
        const service = new Service({
            endpoint: API_ENDPOINT
        });

        const fetchSpy = vi.spyOn(DefaultTransporter.prototype, 'fetch').mockResolvedValue({} as any);

        await service.fetch(options as any);
        expect(fetchSpy).toHaveBeenCalledOnce();
    });
});
