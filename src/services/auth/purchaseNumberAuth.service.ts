/**
 * 購入管理番号認証
 */
import * as mvtk from '@motionpicture/mvtk-reserve-service';
import * as request from 'request-promise-native';

/**
 * 情報種別コード
 */
export import InformationTypeCode = mvtk.services.auth.purchaseNumberAuth.InformationTypeCode;
/**
 * 購入管理番号無効事由
 */
export import PurchaseInvalidityReason = mvtk.services.auth.purchaseNumberAuth.PurchaseInvalidityReason;
/**
 * 購入管理番号情報
 */
export import IKnyknrNoInfoIn = mvtk.services.auth.purchaseNumberAuth.IKnyknrNoInfoIn;
/**
 * 購入管理番号認証In
 */
export import IPurchaseNumberAuthIn = mvtk.services.auth.purchaseNumberAuth.IPurchaseNumberAuthIn;
/**
 * 有効券情報
 */
export import IValidTicket = mvtk.services.auth.purchaseNumberAuth.IValidTicket;
/**
 * 無効券情報
 */
export import INvalidTicket = mvtk.services.auth.purchaseNumberAuth.INvalidTicket;
/**
 * 購入管理番号情報Out
 */
export import IPurchaseNumberInfo = mvtk.services.auth.purchaseNumberAuth.IPurchaseNumberInfo;
/**
 * 購入管理番号認証Out
 */
export import IPurchaseNumberAuthResult = mvtk.services.auth.purchaseNumberAuth.IPurchaseNumberAuthResult;
/**
 * 購入管理番号認証
 */
export async function purchaseNumberAuth(
    args: IPurchaseNumberAuthIn,
    _: any
): Promise<IPurchaseNumberAuthResult> {
    return request.post({
        url: `${process.env.MVTK_RESERVE_ENDPOINT}/auth/purchaseNumberAuth`,
        json: true,
        simple: false,
        body: args
    });
}
