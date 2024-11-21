// tslint:disable:no-implicit-dependencies
/**
 * Seat service test
 */
import * as fetchMock from 'fetch-mock';
import { } from 'mocha';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as client from '../index';

import { StubAuthClient } from '../auth/authClient';

const API_ENDPOINT = 'https://localhost';

describe('着券サービス', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('着券結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const seatService = new client.service.seat.SeatService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        const myMock = fetchMock.sandbox()
            .mock('*', data);
        sandbox.mock(seatService)
            .expects('fetch')
            .once()
            .resolves(await myMock());
        const result = await seatService.seatInfoSync(<any>{});
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
        const myMock = fetchMock.sandbox()
            .mock('*', data);
        sandbox.mock(seatService)
            .expects('fetch')
            .once()
            .resolves(await myMock());
        const result = await seatService.seatInfoSyncCancel(<any>{});
        assert.deepEqual(result, data);
        sandbox.verify();
    });
});
