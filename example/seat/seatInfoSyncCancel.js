/**
 * seatInfoSyncCancel
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
    const seatService = new Surfrock.service.seat.SeatService({
        endpoint: process.env.API_ENDPOINT,
        auth: authClient
    });
    const result = await seatService.seatInfoSyncCancel({
        kgygishCd: 'SSK000',
        kgysystmzskyykNo: '439355702944053',
        kgysystmzskyykNoIkktsCnclFlg: '1',
        jyuTyp: Surfrock.factory.service.seat.seatInfoSyncCancel.JyuTyp.JyuTyp05,
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

    if (error.name === 'MovieticketReserveRequestError') {
        if (error.code === 400) {
            if (Array.isArray(error.errors) && error.errors.length > 0) {
                const mvtkReserveServiceError = error.errors[0];
                if (mvtkReserveServiceError.status === Surfrock.factory.resultInfo.ResultStatus.Success) {
                    const cnclResult = mvtkReserveServiceError.rawResult?.cnclResult;
                    if (cnclResult === Surfrock.factory.service.seat.seatInfoSyncCancel.CancelResult.CancelResult02) {
                        console.log('興行会社システム座席予約番号存在無の場合、取消済なのでok');
                    }
                }
            }
        }
    }

});


