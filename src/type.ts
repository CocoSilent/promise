export type OnFulfilled = (value?: any) => void;
export type OnRejected  = (reason?: any) => void;
export type Executor = (onFulfilled:OnFulfilled, onRejected: OnRejected) => void;

export enum PromiseState {
    'PENDING',
    'FULLFILLED',
    'REJECTED'
}
