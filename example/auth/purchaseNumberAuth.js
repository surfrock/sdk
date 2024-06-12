/**
 * purchaseNumberAuth
 */
const client = require('../../lib');

async function main() {
    const authClient = new client.auth.ClientCredentials({
        domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.API_CLIENT_ID,
        clientSecret: process.env.API_CLIENT_SECRET,
        scopes: [],
        state: ''
    });
    const authService = new client.service.auth.AuthService(
        {
            endpoint: process.env.API_ENDPOINT,
            auth: authClient
        },
        {
            timeout: 10000
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
