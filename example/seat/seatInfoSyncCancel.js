/**
 * seatInfoSyncCancel
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
    const result = await seatService.seatInfoSyncCancel({
        kgygishCd: 'SSK000',
        kgysystmzskyykNo: '439355702944053',
        kgysystmzskyykNoIkktsCnclFlg: '1',
        jyuTyp: client.service.seat.factory.seatInfoSyncCancel.JyuTyp.IJyuTyp05,
        jyuTypRmk: '',
        // knyknrNoInfoIn: [
        //     {
        //         knyknrNo: "2412171273",
        //         knyknrNoIkktsCnclFlg: '1',
        //         knshInfoIn: [
        //             {
        //                 "knshTyp": "01",
        //                 "miNum": 1
        //             }
        //         ]
        //     }
        // ],
    });
    console.dir(result, { depth: null });
}

main().catch((error) => {
    console.dir(error, { depth: null });
});
