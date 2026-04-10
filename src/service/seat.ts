import { SurfrockFactory } from '@surfrock/factory';
import { status } from '../httpStatus';
import { Service } from '../service';

/**
 * 着券サービス
 */
export class SeatService extends Service {
    /**
     * 座席指定情報連携
     */
    public async seatInfoSync(params: SurfrockFactory.service.seat.seatInfoSync.ISeatInfoSyncIn): Promise<SurfrockFactory.service.seat.seatInfoSync.ISeatInfoSyncResult> {
        return this.fetch({
            uri: '/seat/seatInfoSync',
            method: 'POST',
            body: params,
            expectedStatusCodes: [status.OK]
        })
            .then(async (response) => response.json() as Promise<SurfrockFactory.service.seat.seatInfoSync.ISeatInfoSyncResult>);
    }
    /**
     * 座席開放連携
     */
    public async seatInfoSyncCancel(
        params: SurfrockFactory.service.seat.seatInfoSyncCancel.ISeatInfoSyncCancelIn
    ): Promise<SurfrockFactory.service.seat.seatInfoSyncCancel.ISeatInfoSyncCancelResult> {
        return this.fetch({
            uri: '/seat/seatInfoSyncCancel',
            method: 'POST',
            body: params,
            expectedStatusCodes: [status.OK]
        })
            .then(async (response) => response.json() as Promise<SurfrockFactory.service.seat.seatInfoSyncCancel.ISeatInfoSyncCancelResult>);
    }
}
