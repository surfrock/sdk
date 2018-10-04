/**
 * purchaseNumberAuth
 */
const client = require('../../lib');

client.services.auth.purchaseNumberAuth.purchaseNumberAuth({
    kgygishCd: 'SSK000', //興行会社コード
    jhshbtsCd: client.services.auth.purchaseNumberAuth.InformationTypeCode.All, //情報種別コード
    knyknrNoInfoIn: [
        {
            knyknrNo: '3472695908', //購入管理番号
            pinCd: '7648' // PINコード
        }
    ],
    skhnCd: '1622100', //作品コード
    stCd: '18', //サイトコード
    jeiYmd: '2017/02/16' //上映年月日
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});
