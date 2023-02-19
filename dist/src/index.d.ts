declare type NestedObject<T> = {
    [K in keyof T]: T[K] extends object ? NestedObject<T[K]> : T[K];
};
declare type Obj = {
    [key: string]: number;
};
declare class State<T extends object> {
    state: T;
    private reactive_keys;
    private delimiter;
    private keyValuePairs;
    constructor(initialState: T);
    reactive(key: string, value: unknown): void;
    private uuid;
    private pairValues;
    private evaluateExpression;
    private isKeyPath;
    private updateChainedObject;
    private mutateNestedObject;
    private triggerUpdate;
}
declare const data: {
    a: number;
    b: number;
    c: {
        d: number;
        k: number;
    };
};
declare const r: State<{
    a: number;
    b: number;
    c: {
        d: number;
        k: number;
    };
}>;
