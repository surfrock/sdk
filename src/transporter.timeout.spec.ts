/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { status } from './httpStatus';
import nock from 'nock';
// import { MockAgent, setGlobalDispatcher } from 'undici';

import { fetchWithTimeout } from './transporters';

const API_ENDPOINT = 'https://example.com';

describe('fetchWithTimeout()', () => {
    let scope: nock.Scope;

    beforeEach(() => {
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
        expect(result).toStrictEqual(body);
        expect(scope.isDone()).toBeTruthy();
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
        expect(result).toBeInstanceOf(Error);
        // assert.equal(result.name, 'AbortError');
        expect(result.name).toBe('TimeoutError');
        expect(scope.isDone()).toBeTruthy();
    });

    it('AbortError以外の場合、そのまま例外が投げられる', async () => {
        const errorMessage = 'unknown error';
        scope = nock(API_ENDPOINT)
            .get('/uri')
            .replyWithError(errorMessage);

        const result = await fetchWithTimeout(`${API_ENDPOINT}/uri`, {}, { timeout: 10000 })
            .catch((err) => err);
        expect(result).toBeInstanceOf(Error);
        // assert.equal(result.name, 'FetchError');
        expect(scope.isDone()).toBeTruthy();
    });
});
