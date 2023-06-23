export type Resolve = (value?: any) => void;
export type Reject = (reson?: any) => void;
export type Executor = (resolve: Resolve, reject: Reject) => void;
export enum PromiseState {
    'pending',
    'fullfilled',
    'rejected'
}

export type Onfulfilled = (value?: any) => any;
export type Onrejected = (reason?: any) => any;
