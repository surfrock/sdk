import { describe, beforeEach, afterEach, beforeAll, afterAll, it, expect } from 'vitest';
import { status } from '../httpStatus';
import nock from 'nock';
import { ClientCredentialsClient } from './clientCredentialsClient';

const DOMAIN = 'DOMAIN';
const CLIENT_ID = 'CLIENT_ID';
const CLIENT_SECRET = 'CLIENT_SECRET';
const STATE = 'state';
const SCOPES = ['scopex', 'scopey'];

describe('getToken()', () => {
    let scope: nock.Scope;

    beforeAll(() => {
        nock.cleanAll();
    });

    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('認可サーバーが正常であれば、認可コードとアクセストークンを交換できるはず', async () => {
        scope = nock(`https://${DOMAIN}`)
            .post('/token')
            .reply(status.OK, { access_token: 'abc123', refresh_token: 'abc123', expires_in: 1000, token_type: 'Bearer' });

        const auth = new ClientCredentialsClient({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            scopes: SCOPES,
            state: STATE
        });

        const credentials = await auth.getToken();
        expect(credentials.access_token).toBeTypeOf('string');
        expect(credentials.refresh_token).toBeTypeOf('string');
        expect(credentials.expiry_date).toBeTypeOf('number');
        expect(credentials.token_type).toBe('Bearer');
        expect(scope.isDone()).toBeTruthy();
    });

    [status.BAD_REQUEST, status.INTERNAL_SERVER_ERROR].forEach((statusCode) => {
        it(`認可サーバーが次のステータスコードを返却されば、トークンを取得できないはず  ${statusCode}`, async () => {
            scope = nock(`https://${DOMAIN}`)
                .post('/token')
                .reply(statusCode, {});

            const auth = new ClientCredentialsClient({
                domain: DOMAIN,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                scopes: SCOPES,
                state: STATE
            });

            const getTokenError = await auth.getToken()
                .catch((error) => {
                    return error;
                });
            expect(getTokenError).toBeInstanceOf(Error);
            expect(scope.isDone()).toBeTruthy();
        });
    });
});

describe('refreshAccessToken()', () => {
    beforeAll(() => {
        nock.cleanAll();
    });

    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
    });

    it('認可サーバーが正常であれば、アクセストークンをリフレッシュできるはず', async () => {
        const scope = nock(`https://${DOMAIN}`)
            .post('/token')
            .reply(status.OK, { access_token: 'abc123', refresh_token: 'abc123', expires_in: 1000, token_type: 'Bearer' });

        const auth = new ClientCredentialsClient({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            scopes: SCOPES,
            state: STATE
        });

        const credentials = await auth.refreshAccessToken();
        expect(credentials.access_token).toBeTypeOf('string');
        expect(credentials.refresh_token).toBeTypeOf('string');
        expect(credentials.expiry_date).toBeTypeOf('number');
        expect(credentials.token_type).toBe('Bearer');
        expect(scope.isDone()).toBeTruthy();
    });

    afterAll(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });
});
