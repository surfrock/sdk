/**
 * レスポンスステータス
 */
export enum ResultStatus {
    /**
     * 正常
     */
    Success = 'N000',
    /**
     * 回復不能ｴﾗｰ
     */
    CriticalError = 'E001',
    /**
     * DataNotFound
     */
    CheckError = 'L001',
    /**
     * DUPLICATE
     */
    ReplicationError = 'L002',
    /**
     * ﾊﾟﾗﾒｰﾀ型ｴﾗｰ
     */
    ClientError = 'L003',
    /**
     * ﾘｽﾄ数上限超
     */
    OverflowError = 'L004'
}
