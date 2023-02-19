// @ts-nocheck

type NestedObject<T> = {
  [K in keyof T]: T[K] extends object ? NestedObject<T[K]> : T[K];
};
type Obj = {[key: string]: number};

class State<T extends object> {
  public state: T;
  private reactive_keys: object;
  private delimiter = '~';
  private keyValuePairs: unknown[] = [];

  constructor(initialState: T) {
    this.state = initialState;
    this.reactive_keys = {};

    const handler: ProxyHandler<T> = {
      get: (target: T, key: keyof T) => {
        const value: unknown = target[key];
        if (typeof value === 'object') {
          return new Proxy(value, handler);
        } else {
          return value;
        }
      },
      set: (target: T, key: keyof T, value: T[keyof T]) => {
        target[key] = value;
        this.triggerUpdate(target, key);
        this.updateChainedObject(key);
        return true;
      },
    };

    this.state = new Proxy(initialState, handler);
  }
  public reactive(key: string, value: unknown) {
    if (!this.isKeyPath(key)) {
      this.state[key] = this.evaluateExpression(value, this.state);
    }
    const includedExpresionInValues = Object.keys(
      this.pairValues(value, this.state)
    );
    const unknownVariables = value;
    includedExpresionInValues.forEach(includedExpresionInValue => {
      console.log(includedExpresionInValue, key, value);
      // It seems, b exists once and we have to think how it is possible to not overriding the b and add new one
      this.keyValuePairs[key] = unknownVariables;
      this.reactive_keys = {
        ...this.reactive_keys,
        ...{
          [`${includedExpresionInValue}${this.delimiter}${this.uuid()}`]: {
            mainKey: key,
            value,
          },
        },
      };
    });
  }

  private uuid(): string {
    let d = new Date().getTime();
    if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      d += performance.now(); // use high-precision timer if available
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }

  private pairValues(str: string, obj: Obj): {[K in keyof T]?: number} {
    const regExp = /\$(\w+)/g;
    let match;
    const values: {[K in keyof T]?: number} = {};
    while ((match = regExp.exec(str)) !== null) {
      const key = match[1];
      const value = obj[key];
      if (value !== undefined) {
        values[key as keyof T] = value;
      } else {
        throw new Error(`Object does not contain key ${key}`);
      }
    }
    return values;
  }

  private evaluateExpression(str: string, obj: NestedObject<T>): number {
    const values = this.pairValues(str, obj);
    const expression = str.replace(/\$(\w+)/g, (_, key) =>
      values[key].toString()
    );
    return eval(expression);
  }

  private isKeyPath(key) {
    return key.split('.').length > 1;
  }

  private updateChainedObject(variable: keyof T) {
    const getKeys: Array<unknown> = Object.keys(this.reactive_keys);
    getKeys.forEach(variable_name => {
      const regex = new RegExp(`${this.delimiter}[^${this.delimiter}]+$`);

      const variableWithoutUUID = variable_name.replace(regex, '');
      if (
        this.reactive_keys[variable_name]?.mainKey &&
        variable === variableWithoutUUID
      ) {
        const {mainKey, value} = this.reactive_keys[variable_name];
        const values = this.pairValues(value, this.state);
        let reCalculate = value;
        for (const key in values) {
          reCalculate = reCalculate.replace(
            new RegExp(`\\$${key}\\b`, 'g'),
            values[key].toString()
          );
        }
        this.mutateNestedObject(mainKey, eval(reCalculate), this.state);
      }
    });
  }

  private mutateNestedObject(path: string, value: any, obj: any) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let nestedObj = obj;
    for (const key of keys) {
      nestedObj = nestedObj[key];
    }
    nestedObj[lastKey] = value;
    this.updateChainedObject(lastKey);
    if (typeof nestedObj[lastKey] === 'object') {
      for (const subKey in nestedObj[lastKey]) {
        this.updateChainedObject(subKey);
      }
    }
  }

  private triggerUpdate(target: T, key: keyof T) {
    if (typeof target[key] === 'object') {
      for (const subKey in target[key]) {
        this.triggerUpdate(target[key], subKey as keyof (typeof target)[key]);
      }
    }
  }
}

// Example usage:
const data = {a: 1, b: 1, c: {d: 2, k: 4}};
const r = new State(data);

r.reactive('c.d', '2 + $b');
r.reactive('c.k', '5 * $a * $b');
console.time('Task');
r.state.a = 3;
r.state.b = 4;
for (let i = 0; i < 1000000; i++) {
  r.state.b = 4;
}
console.timeEnd('Task');
console.log(r.state);
