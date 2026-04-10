/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, afterEach, beforeAll, afterAll, it, vi, expect } from 'vitest';
import { status } from '../httpStatus';
import nock from 'nock';
import { AbstractCredentialsRepo } from '../auth/repo/credentials';
import { OAuth2client } from './oAuth2client';

/**
 * テスト認証情報リポジトリ
 */
export class StubCredentialsRepo implements AbstractCredentialsRepo {
    public async save(): Promise<void> {
        // no op
    }

    public async find() {
        return {
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored',
            access_token: 'xxx'
        };
    }
}

const DOMAIN = 'DOMAIN';
const CLIENT_ID = 'CLIENT_ID';
const CLIENT_SECRET = 'CLIENT_SECRET';
const REDIRECT_URI = 'REDIRECT_URI';
// const LOGOUT_URI = 'LOGOUT_URI';
// const STATE = 'state';
// const CODE_VERIFIER = 'codeVerifier';
// const SCOPES = ['scopex', 'scopey'];

describe('setCredentials()', () => {
    it('認証情報を正しくセットできる', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        auth.setCredentials({
            refresh_token: 'refresh_token_placeholder',
            access_token: 'access_token',
            token_type: 'Bearer'
        });

        const accessToken = await auth.getAccessToken();
        expect(accessToken).toBe('access_token');
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

    it('リフレッシュトークンが設定されていなければ、アクセストークンをリフレッシュできないはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        const refreshAccessTokenError = await auth.refreshAccessToken()
            .catch((error) => {
                return error;
            });
        expect(refreshAccessTokenError).toBeInstanceOf(Error);
    });

    [status.BAD_REQUEST, status.INTERNAL_SERVER_ERROR].forEach((statusCode) => {
        it(`認可サーバーが次のステータスコードを返却されば、アクセストークンをリフレッシュできないはず  ${statusCode}`, async () => {
            const scope = nock(`https://${DOMAIN}`)
                .post('/token')
                .reply(statusCode, {});

            const auth = new OAuth2client({
                domain: DOMAIN,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUri: REDIRECT_URI
            });

            auth.credentials = {
                refresh_token: 'refresh-token-placeholder'
            };

            const refreshAccessTokenError = await auth.refreshAccessToken()
                .catch((error) => {
                    return error;
                });
            expect(refreshAccessTokenError).toBeInstanceOf(Error);
            expect(scope.isDone()).toBeTruthy();
        });
    });

    it('認証情報リポジトリをセットすれば、リポジトリへ保管するはず', async () => {
        const scope = nock(`https://${DOMAIN}`)
            .post('/token')
            .reply(status.OK, { access_token: 'abc123', refresh_token: 'abc123', expires_in: 1000, token_type: 'Bearer' });
        const credentialsRepo = new StubCredentialsRepo();

        const saveSpy = vi.spyOn(credentialsRepo, 'save').mockResolvedValue();
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            credentialsRepo
        });
        auth.setCredentials({ refresh_token: 'ignore' });
        await auth.refreshAccessToken();
        expect(scope.isDone()).toBeTruthy();
        expect(saveSpy).toHaveBeenCalledOnce();
    });

    // it('リフレッシュトークンがあればアクセストークンを取得できるはず', async () => {
    //     const auth = new client.auth.OAuth2({
    //         domain: DOMAIN,
    //         clientId: CLIENT_ID,
    //         clientSecret: CLIENT_SECRET,
    //         redirectUri: REDIRECT_URI
    //     });

    //     auth.credentials = { refresh_token: 'refresh_token' };
    //     const accessToken = await auth.getAccessToken();
    //     assert.equal(typeof accessToken, 'string');
    // });

    // it('should set access token type to Bearer if none is set', (done) => {
    //     const oauth2client = new client.auth.OAuth2(
    //         CLIENT_ID,
    //         CLIENT_SECRET,
    //         REDIRECT_URI
    //     );
    //     oauth2client.credentials = { access_token: 'foo', refresh_token: '' };
    //     const scope = nock('https://www.client.com')
    //         .get('/urlshortener/v1/url/history')
    //         .times(2)
    //         .reply(200);

    //     testNoBearer(localUrlshortener, oauth2client, (err) => {
    //         if (err) {
    //             return done(err);
    //         }
    //     });
    // });

    // it('should refresh if access token is expired', (done) => {
    //     const scope = nock('https://accounts.google.com')
    //         .post('/o/oauth2/token')
    //         .times(2)
    //         .reply(200, { access_token: 'abc123', expires_in: 1 });
    //     let oauth2client = new client.auth.OAuth2(
    //         CLIENT_ID,
    //         CLIENT_SECRET,
    //         REDIRECT_URI
    //     );
    //     let now = new Date().getTime();
    //     let twoSecondsAgo = now - 2000;
    //     oauth2client.credentials = { refresh_token: 'abc', expiry_date: twoSecondsAgo };
    //     testExpired(localDrive, oauth2client, now, () => {
    //         oauth2client = new client.auth.OAuth2(
    //             CLIENT_ID,
    //             CLIENT_SECRET,
    //             REDIRECT_URI
    //         );
    //         now = new Date().getTime();
    //         twoSecondsAgo = now - 2000;
    //         oauth2client.credentials = {
    //             refresh_token: 'abc',
    //             expiry_date: twoSecondsAgo
    //         };
    //     });
    // });

    // it('should make request if access token not expired', (done) => {
    //     const scope = nock('https://accounts.google.com')
    //         .post('/o/oauth2/token')
    //         .times(2)
    //         .reply(200, { access_token: 'abc123', expires_in: 10000 });
    //     let oauth2client = new client.auth.OAuth2(
    //         CLIENT_ID,
    //         CLIENT_SECRET,
    //         REDIRECT_URI
    //     );
    //     let now = (new Date()).getTime();
    //     let tenSecondsFromNow = now + 10000;
    //     oauth2client.credentials = {
    //         access_token: 'abc123',
    //         refresh_token: 'abc',
    //         expiry_date: tenSecondsFromNow
    //     };
    //     localDrive.files.get({ fileId: 'wat', auth: oauth2client }, () => {
    //         assert.equal(JSON.stringify(oauth2client.credentials), JSON.stringify({
    //             access_token: 'abc123',
    //             refresh_token: 'abc',
    //             expiry_date: tenSecondsFromNow,
    //             token_type: 'Bearer'
    //         }));

    //         assert.throws(() => {
    //             scope.done();
    //         }, 'AssertionError');
    //         oauth2client = new client.auth.OAuth2(
    //             CLIENT_ID,
    //             CLIENT_SECRET,
    //             REDIRECT_URI
    //         );
    //         now = (new Date()).getTime();
    //         tenSecondsFromNow = now + 10000;
    //         oauth2client.credentials = {
    //             access_token: 'abc123',
    //             refresh_token: 'abc',
    //             expiry_date: tenSecondsFromNow
    //         };
    //     });
    // });

    // it('should refresh if have refresh token but no access token', (done) => {
    //     const scope = nock('https://accounts.google.com')
    //         .post('/o/oauth2/token')
    //         .times(2)
    //         .reply(200, { access_token: 'abc123', expires_in: 1 });
    //     let oauth2client = new client.auth.OAuth2(
    //         CLIENT_ID,
    //         CLIENT_SECRET,
    //         REDIRECT_URI
    //     );
    //     let now = (new Date()).getTime();
    //     oauth2client.credentials = { refresh_token: 'abc' };
    //     testNoAccessToken(localDrive, oauth2client, now, () => {
    //         now = (new Date()).getTime();
    //         oauth2client.credentials = { refresh_token: 'abc' };
    //     });
    // });

    // describe('revokeCredentials()', () => {
    //     it('should revoke credentials if access token present', (done) => {
    //         const scope = nock('https://accounts.google.com')
    //             .get('/o/oauth2/revoke?token=abc')
    //             .reply(200, { success: true });
    //         const oauth2client = new client.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    //         oauth2client.credentials = { access_token: 'abc', refresh_token: 'abc' };
    //         oauth2client.revokeCredentials((err, result) => {
    //             assert.equal(err, null);
    //             assert.equal(result.success, true);
    //             assert.equal(JSON.stringify(oauth2client.credentials), '{}');
    //             scope.done();
    //             done();
    //         });
    //     });

    //     it('should clear credentials and return error if no access token to revoke', (done) => {
    //         const oauth2client = new client.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    //         oauth2client.credentials = { refresh_token: 'abc' };
    //         oauth2client.revokeCredentials((err, result) => {
    //             assert.equal(err.message, 'No access token to revoke.');
    //             assert.equal(result, null);
    //             assert.equal(JSON.stringify(oauth2client.credentials), '{}');
    //             done();
    //         });
    //     });
    // });

    // describe('getToken()', () => {
    //     it('should return expiry_date', (done) => {
    //         const now = (new Date()).getTime();
    //         const scope = nock('https://accounts.google.com')
    //             .post('/o/oauth2/token')
    //             .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
    //         const oauth2client = new client.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    //         oauth2client.getToken('code here', (err, tokens) => {
    //             if (err) {
    //                 return done(err);
    //             }
    //             assert(tokens.expiry_date >= now + (10 * 1000));
    //             assert(tokens.expiry_date <= now + (15 * 1000));
    //             scope.done();
    //             done();
    //         });
    //     });
    // });

    afterAll(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });
});

describe('getAccessToken()', () => {
    beforeAll(() => {
        nock.cleanAll();
    });

    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
    });

    it('リフレッシュトークンもアクセストークンもなければ、アクセストークンを取得できないはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        const transferError = await auth.getAccessToken()
            .catch((error) => {
                return error;
            });
        expect(transferError).toBeInstanceOf(Error);
    });

    it('認証情報リポジトリをセットすれば、リポジトリから検索するはず', async () => {
        const credentialsRepo = new StubCredentialsRepo();
        const findSpy = vi.spyOn(credentialsRepo, 'find').mockResolvedValue({
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored',
            access_token: 'xxx'
        });
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            credentialsRepo
        });
        const refreshAccessTokenSpy = vi.spyOn(auth, 'refreshAccessToken').mockResolvedValue({
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored',
            access_token: 'xxx'
        });

        const result = await auth.getAccessToken();
        expect(result).toBeTypeOf('string');
        expect(findSpy).toHaveBeenCalledOnce();
        expect(refreshAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('リモートリポジトリに認証情報が存在しなければトークンを発行する', async () => {
        const credentialsRepo = new StubCredentialsRepo();
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            credentialsRepo
        });
        auth.setCredentials({ refresh_token: 'ignore' });

        const findSpy = vi.spyOn(credentialsRepo, 'find').mockResolvedValue(undefined as any);
        const refreshAccessTokenSpy = vi.spyOn(auth, 'refreshAccessToken').mockResolvedValue({
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored',
            access_token: 'xxx'
        });

        await auth.getAccessToken();
        expect(findSpy).toHaveBeenCalledOnce();
        expect(refreshAccessTokenSpy).toHaveBeenCalledOnce();
    });

    it('万が一リモートリポジトリからの情報にアクセストークンが含まれなければ採用しない', async () => {
        const credentialsRepo = new StubCredentialsRepo();
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            credentialsRepo
        });
        auth.setCredentials({ refresh_token: 'ignore' });

        const findSpy = vi.spyOn(credentialsRepo, 'find').mockResolvedValue({
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored'
            // access_token: 'xxx' // <-アクセストークンが含まれない
        } as any);
        const refreshAccessTokenSpy = vi.spyOn(auth, 'refreshAccessToken').mockResolvedValue({
            token_type: 'Bearer',
            expiry_date: 2732084594461,
            refresh_token: 'ignored',
            access_token: 'xxx'
        });

        await auth.getAccessToken();
        expect(findSpy).toHaveBeenCalledOnce();
        expect(refreshAccessTokenSpy).toHaveBeenCalledOnce();
    });

    afterAll(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });
});

describe('fetch()', () => {
    let scope: nock.Scope;
    const API_ENDPOINT = 'https://example.com';

    beforeEach(() => {
        nock.cleanAll();
        scope = nock(`https://${DOMAIN}`)
            .post('/token')
            .reply(status.OK, { access_token: 'abc123', expires_in: 1 });

        nock(API_ENDPOINT).get('/').reply(status.OK, {});
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('アクセストークンがなければリフレッシュするはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        auth.credentials = { refresh_token: 'refresh-token-placeholder' };

        await auth.fetch(`${API_ENDPOINT}/`, { method: 'GET' }, {}, [status.OK]);
        expect(auth.credentials.access_token).toBe('abc123');
    });

    it('アクセストークンの期限が切れていればリフレッシュされるはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        auth.credentials = {
            access_token: 'initial-access-token',
            refresh_token: 'refresh-token-placeholder',
            expiry_date: (new Date()).getTime() - 1000
        };

        await auth.fetch(`${API_ENDPOINT}/`, { method: 'GET' }, {}, [status.OK]);
        expect(auth.credentials.access_token).toBe('abc123');

    });

    it('アクセストークンの期限が切れていなければリフレッシュされないはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        auth.credentials = {
            access_token: 'initial-access-token',
            refresh_token: 'refresh-token-placeholder',
            expiry_date: (new Date()).getTime() + 1000
        };

        await auth.fetch(`${API_ENDPOINT}/`, { method: 'GET' }, {}, [status.OK]);
        expect(auth.credentials.access_token).toBe('initial-access-token');
    });

    it('アクセストークンの期限が設定されていなければ、期限は切れていないとみなすはず', async () => {
        const auth = new OAuth2client({
            domain: DOMAIN,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });

        auth.credentials = {
            access_token: 'initial-access-token',
            refresh_token: 'refresh-token-placeholder'
        };

        await auth.fetch(`${API_ENDPOINT}/`, { method: 'GET' }, {}, [status.OK]);
        expect(auth.credentials.access_token).toBe('initial-access-token');
        expect(scope.isDone()).toBeFalsy();
    });

    [status.UNAUTHORIZED, status.FORBIDDEN].forEach((statusCode) => {
        it(`リソースサーバーが次のステータスコードを返却されば、アクセストークンはリフレッシュされるはず  ${statusCode}`, async () => {
            nock(API_ENDPOINT)
                .get('/access')
                .times(2)
                .reply(statusCode, { error: { code: statusCode, message: 'Invalid Credentials' } });

            const auth = new OAuth2client({
                domain: DOMAIN,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUri: REDIRECT_URI
            });

            auth.credentials = {
                access_token: 'initial-access-token',
                refresh_token: 'refresh-token-placeholder'
            };

            await auth.fetch(`${API_ENDPOINT}/access`, { method: 'GET' }, {}, [status.OK]).catch((err) => err);
            expect(auth.credentials.access_token).toBe('abc123');
            expect(scope.isDone()).toBeTruthy();
        });
    });

    [{}, undefined, null].forEach((headers) => {
        it(`オプションに指定されたヘッダーが${typeof headers}の場合、正常に動作するはず`, async () => {
            const options = {
                method: 'GET',
                headers: headers as Record<string, string>
            };
            const auth = new OAuth2client({
                domain: DOMAIN,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUri: REDIRECT_URI
            });
            auth.credentials = { refresh_token: 'refresh-token-placeholder' };

            await auth.fetch(`${API_ENDPOINT}/`, options, {}, [status.OK]);
            expect(auth.credentials.access_token).toBe('abc123');
        });
    });
});