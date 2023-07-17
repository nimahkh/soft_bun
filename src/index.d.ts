export declare type NestedObject<T> = {
  [K in keyof T]: T[K] extends object ? NestedObject<T[K]> : T[K];
};
export default class State<T extends object> {
  state: NestedObject<T>;
  private reactive_keys;
  private delimiter;
  private keyValuePairs;
  constructor(initialState: NestedObject<T>);
  reactive(key: string, value: string): void;
  private pairValues;
  private evaluateExpression;
  private eval;
  private isKeyPath;
  private updateChainedObject;
  private isNumericMath;
  private mutateNestedObject;
  private triggerUpdate;
}
export {};
