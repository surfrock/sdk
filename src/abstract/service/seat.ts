import { factory as SFR } from '@surfrock/soap-parser';
import { OK } from 'http-status';
import { Service } from '../service';

export namespace factory {
    export import seatInfoSync = SFR.service.seat.seatInfoSync;
    export import seatInfoSyncCancel = SFR.service.seat.seatInfoSyncCancel;
}

/**
 * 着券サービス
 */
export class SeatService extends Service {
    /**
     * 座席指定情報連携
     */
    public async seatInfoSync(params: factory.seatInfoSync.ISeatInfoSyncIn): Promise<factory.seatInfoSync.ISeatInfoSyncResult> {
        return this.fetch({
            uri: '/seat/seatInfoSync',
            method: 'POST',
            body: params,
            expectedStatusCodes: [OK]
        })
            .then(async (response) => response.json() as Promise<factory.seatInfoSync.ISeatInfoSyncResult>);
    }
    /**
     * 座席開放連携
     */
    public async seatInfoSyncCancel(
        params: factory.seatInfoSyncCancel.ISeatInfoSyncCancelIn
    ): Promise<factory.seatInfoSyncCancel.ISeatInfoSyncCancelResult> {
        return this.fetch({
            uri: '/seat/seatInfoSyncCancel',
            method: 'POST',
            body: params,
            expectedStatusCodes: [OK]
        })
            .then(async (response) => response.json() as Promise<factory.seatInfoSyncCancel.ISeatInfoSyncCancelResult>);
    }
}
