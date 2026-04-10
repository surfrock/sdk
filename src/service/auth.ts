import { SurfrockFactory } from '@surfrock/factory';
import { status } from '../httpStatus';
import { Service } from '../service';

/**
 * 認証サービス
 */
export class AuthService extends Service {
    /**
     * 購入番号認証
     */
    public async purchaseNumberAuth(
        params: SurfrockFactory.service.auth.purchaseNumberAuth.IPurchaseNumberAuthIn
    ): Promise<SurfrockFactory.service.auth.purchaseNumberAuth.IPurchaseNumberAuthResult> {
        return this.fetch({
            uri: '/auth/purchaseNumberAuth',
            method: 'POST',
            body: params,
            expectedStatusCodes: [status.OK]
        })
            .then(async (response) => response.json() as Promise<SurfrockFactory.service.auth.purchaseNumberAuth.IPurchaseNumberAuthResult>);
    }
}
