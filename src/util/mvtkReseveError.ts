/**
 * MvtkReserveServiceError
 */
export class MvtkReserveServiceError extends Error {
    public code: number;
    public status: string;

    constructor(code: number, status: string, message?: string) {
        super(message);

        this.name = 'MvtkReserveServiceError';
        this.code = code;
        this.status = status;
    }
}
