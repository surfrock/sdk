/**
 * 座席指定情報連携
 */
import * as mvtk from '@motionpicture/mvtk-reserve-service';
import * as request from 'request-promise-native';

/**
 * 取消フラグ
 */
export import DeleteFlag = mvtk.services.seat.seatInfoSync.DeleteFlag;
/**
 * 座席予約結果
 */
export import ReservationResult = mvtk.services.seat.seatInfoSync.ReservationResult;
/**
 * 購入管理番号無効事由区分
 */
export import InvalidityCategory = mvtk.services.seat.seatInfoSync.InvalidityCategory;
/**
 * 予約デバイス区分
 */
export import ReserveDeviceType = mvtk.services.seat.seatInfoSync.ReserveDeviceType;
/**
 * 購入管理番号情報
 */
export import IKnyknrNoInfo = mvtk.services.seat.seatInfoSync.IKnyknrNoInfo;
/**
 * 座席指定情報連携In
 */
export import ISeatInfoSyncIn = mvtk.services.seat.seatInfoSync.ISeatInfoSyncIn;
/**
 * 無効購入管理番号情報
 */
export import IInvalidPurchaseNumberInfo = mvtk.services.seat.seatInfoSync.IInvalidPurchaseNumberInfo;
/**
 * 無効券種情報
 */
export import InvalidTicketTypeInfo = mvtk.services.seat.seatInfoSync.InvalidTicketTypeInfo;
/**
 * 無効券詳細情報
 */
export import InvalidTicketDetailInfo = mvtk.services.seat.seatInfoSync.InvalidTicketDetailInfo;
/**
 * 座席指定情報連携Out
 */
export import ISeatInfoSyncResult = mvtk.services.seat.seatInfoSync.ISeatInfoSyncResult;
/**
 * 座席指定情報連携
 */
export async function seatInfoSync(
    args: ISeatInfoSyncIn,
    _: any
): Promise<ISeatInfoSyncResult> {
    return request.post({
        url: `${process.env.MVTK_RESERVE_ENDPOINT}/seat/seatInfoSync`,
        json: true,
        simple: false,
        body: args
    });
}
