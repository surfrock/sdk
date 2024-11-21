// tslint:disable:no-implicit-dependencies
/**
 * Auth service test
 */
import * as fetchMock from 'fetch-mock';
import { } from 'mocha';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as client from '../index';

import { StubAuthClient } from '../auth/authClient';

const API_ENDPOINT = 'https://localhost';

describe('認証サービス', () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('購入番号認証結果が期待通り', async () => {
        const auth = new StubAuthClient();
        const authService = new client.service.auth.AuthService({
            auth: auth,
            endpoint: API_ENDPOINT
        });
        const data = {};
        const myMock = fetchMock.sandbox()
            .mock('*', data);
        sandbox.mock(authService)
            .expects('fetch')
            .once()
            .resolves(await myMock());
        const result = await authService.purchaseNumberAuth(<any>{});
        assert.deepEqual(result, data);
        sandbox.verify();
    });
});
