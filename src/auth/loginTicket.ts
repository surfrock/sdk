/**
 * APIログインチケット
 * id tokenからユーザーネームを取り出すためのシンプルなクラス
 */
export class LoginTicket {
    public envelope?: any;
    public payload: ITokenPayload;

    /**
     * constructor
     */
    constructor(params: {
        envelope?: any;
        payload: ITokenPayload;
    }) {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.envelope !== undefined) {
            this.envelope = params.envelope;
        }
        this.payload = params.payload;
    }

    /**
     * ユーザーネームを取り出す
     */
    public getUsername() {
        return this.payload['cognito:username'];
    }
}

/**
 * トークン情報インターフェース
 */
export interface ITokenPayload {
    /**
     * The Issuer Identifier for the Issuer of the response. Always
     * https://accounts.google.com or accounts.google.com for Google ID tokens.
     */
    iss: string;
    at_hash?: string;
    sub: string;
    token_use: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    aud: string;
    iat: number;
    exp: number;
    auth_time: number;
    nonce?: string;
    'cognito:username'?: string;
}
