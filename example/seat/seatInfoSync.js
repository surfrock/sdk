/**
 * seatInfoSync
 */
const { Surfrock } = require('../../lib');

async function main() {
    const authClient = new Surfrock.auth.ClientCredentials({
        domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
        clientId: process.env.API_CLIENT_ID,
        clientSecret: process.env.API_CLIENT_SECRET,
        scopes: [],
        state: ''
    });
    const seatService = new Surfrock.service.seat.SeatService(
        {
            endpoint: process.env.API_ENDPOINT,
            auth: authClient
        },
        {
            timeout: 5000
            // timeout: 1
        }
    );
    const result = await seatService.seatInfoSync({
        kgygishCd: 'SSK000',
        yykDvcTyp: Surfrock.factory.service.seat.seatInfoSync.ReserveDeviceType.EntertainerSitePC,
        trkshFlg: Surfrock.factory.service.seat.seatInfoSync.DeleteFlag.False,
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
    console.log(error.name);
});
