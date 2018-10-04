/**
 * index module
 */
import * as purchaseNumberAuthService from './services/auth/purchaseNumberAuth.service';
import * as seatInfoSyncService from './services/seat/seatInfoSync.service';
import * as utilConstants from './util/constants';
import * as utilEnums from './util/enums';

/**
 * サービスモジュール群
 */
export namespace services {
    export namespace auth {
        export import purchaseNumberAuth = purchaseNumberAuthService;
    }
    export namespace seat {
        export import seatInfoSync = seatInfoSyncService;
    }
}

/**
 * ユーティリティモジュール群
 */
export namespace util {
    export import enums = utilEnums;
    export import constants = utilConstants;
}
