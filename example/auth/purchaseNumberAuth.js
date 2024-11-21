/**
 * purchaseNumberAuth
 */
const client = require('../../lib');
const redis = require('redis');

/**
 * 認証情報リポジトリ
 */
class CredentialsRepo {
    redisClient;
    options;

    constructor(redisClient, options) {
        this.redisClient = redisClient;
        this.options = options;
    }

    async save(credentials) {
        // const { access_token, expired_at } = credentials;
        // if (typeof credentials.access_token !== 'string') {
        //     throw new Error('access_token must be string');
        // }
        // if (typeof credentials.expired_at !== 'string') {
        //     throw new Error('expired_at must be string');
        // }

        const key = this.createKey();
        const value = JSON.stringify(credentials);
        const multi = this.redisClient.multi();
        const results = await multi.set(key, value)
            // .expireAt(key, Number(expired_at))
            .expire(key, 60)
            .exec();
        console.log('credential saved', results);
        // if (Array.isArray(results) && (results[0] === 1 || (<any>results)[0] === true)) {
        //     return true;
        // } else {
        //     throw new Error('unexpected');
        // }
    }

    async find() {
        const key = this.createKey();

        let credentials;
        try {
            const credentialsStr = await this.redisClient.get(key);
            if (typeof credentialsStr === 'string') {
                credentials = JSON.parse(credentialsStr);
            }
        } catch (error) {
            console.error('credential parse error:', error);
        }

        return credentials;
    }

    createKey() {
        return `Surfrock:credentials:${this.options.scope}`;
    }
}

async function main() {

    const redisClient = redis.createClient({
        socket: {
            port: Number(process.env.REDIS_PORT),
            host: process.env.REDIS_HOST
        },
        password: process.env.REDIS_KEY
    });
    await redisClient.connect();

    const credentialsRepo = new CredentialsRepo(redisClient, { scope: 'xxx' });
    const authClient = new client.auth.ClientCredentials({
        domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.API_CLIENT_ID,
        clientSecret: process.env.API_CLIENT_SECRET,
        scopes: [],
        state: '',
        credentialsRepo
    });
    const authService = new client.service.auth.AuthService(
        {
            endpoint: process.env.API_ENDPOINT,
            auth: authClient
        },
        {
            timeout: 5000
            // timeout: 1
        }
    );
    const result = await authService.purchaseNumberAuth({
        kgygishCd: 'SSK000', //興行会社コード
        jhshbtsCd: client.factory.service.auth.purchaseNumberAuth.InformationTypeCode.All, //情報種別コード
        knyknrNoInfoIn: [
            {
                knyknrNo: '3472695908', //購入管理番号
                // knyknrNo: 'invalid', //購入管理番号
                pinCd: '7648' // PINコード
            }
        ],
        skhnCd: '1622100', //作品コード
        stCd: '18', //サイトコード
        jeiYmd: '2017/02/16' //上映年月日
    });
    console.log(result.resultInfo.status);
    console.log('success!');
}

main().catch(console.error);
