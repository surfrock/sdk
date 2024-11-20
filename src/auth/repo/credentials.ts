import type { ICredentials } from '../credentials';
export type ISaveParams = ICredentials;
export type IFindResult = ICredentials | undefined;

/**
 * 抽象認証情報リポジトリ
 */
export abstract class AbstractCredentialsRepo {
    public abstract save(params: ISaveParams): Promise<void>;
    public abstract find(): Promise<IFindResult>;
}
