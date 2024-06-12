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
        kgygishCd: 'SSK000',
        yykDvcTyp: client.factory.service.seat.seatInfoSync.ReserveDeviceType.EntertainerSitePC,
        trkshFlg: client.factory.service.seat.seatInfoSync.DeleteFlag.False,
        kgygishSstmZskyykNo: '118124',
        kgygishUsrZskyykNo: '124',
        jeiDt: '2017/03/02 10:00:00',
        kijYmd: '2017/03/02',
        stCd: '18',
        screnCd: '10',
        knyknrNoInfo: [
            {
                knyknrNo: '4450899842',
                pinCd: '7648',
                knshInfo: [
                    {
                        knshTyp: '01',
                        miNum: 2
                    }
                ]
            }
        ],
        zskInfo: [
            { zskCd: 'Ａ－２' }, { zskCd: 'Ａ－３' }
        ],
        skhnCd: '1622700'
    });
    console.log(result);
}

main().catch((error) => {
    console.dir(error, { depth: null });
});
