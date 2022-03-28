/**
 * seatInfoSync
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
    const seatService = new client.service.seat.SeatService({
        endpoint: process.env.API_ENDPOINT,
        auth: authClient
    });
    const result = await seatService.seatInfoSync({
        kgygishCd: 'SSK000', //興行会社コード
        yykDvcTyp: client.service.seat.factory.ReserveDeviceType.EntertainerSitePC, //予約デバイス区分
        trkshFlg: client.service.seat.factory.DeleteFlag.False, //取消フラグ
        kgygishSstmZskyykNo: '118124', //興行会社システム座席予約番号
        kgygishUsrZskyykNo: '124', //興行会社ユーザー座席予約番号
        jeiDt: '2017/03/02 10:00:00', //上映日時
        kijYmd: '2017/03/02', //計上年月日
        stCd: '18', //サイトコード
        screnCd: '10', //スクリーンコード
        knyknrNoInfo: [
            {
                knyknrNo: '4450899842', //購入管理番号（ムビチケ購入番号）
                pinCd: '7648', //pinコード（ムビチケ暗証番号）
                knshInfo: [
                    {
                        knshTyp: '01', //券種区分
                        miNum: 2 //枚数
                    }
                ]
            }
        ],
        zskInfo: [
            { zskCd: 'Ａ－２' }, { zskCd: 'Ａ－３' }
        ],
        skhnCd: '1622700' //作品コード
    });
    console.log(result);
}

main().catch(console.error);
