// tslint:disable:no-implicit-dependencies
/**
 * ログインチケットテスト
 */
import * as assert from 'power-assert';
import { LoginTicket } from './loginTicket';

describe('LoginTicket.getUsername()', () => {
    it('id tokenのペイロードからユーザーネームを取得できるはず', () => {
        const username = 'username';
        const payload: any = {
            'cognito:username': username
        };
        const loginTicket = new LoginTicket({
            envelope: { kid: 'xxx' },
            payload: payload
        });

        const result = loginTicket.getUsername();
        assert.equal(result, username);
    });
});
