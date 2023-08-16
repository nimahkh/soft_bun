import {v4 as uuidv4} from 'uuid';

type NestedObject<T> = {
  [K in keyof T]: T[K] extends object ? NestedObject<T[K]> : T[K];
};

export default class State<T extends object> {
  public state: NestedObject<T>;
  private reactive_keys: Record<string, {mainKey: string; value: string}> = {};
  private delimiter = '~';
  private keyValuePairs: {[key: string]: unknown} = {};

  constructor(initialState: NestedObject<T>) {
    this.state = initialState;
    this.reactive_keys = {};

    const handler: ProxyHandler<NestedObject<T>> = {
      get: (target: T, key: keyof T & string & symbol) => {
        const value: object | null = target[key];
        if (typeof value === 'object') {
          return new Proxy(value, handler);
        } else {
          return value;
        }
      },
      set: (target: T, key: PropertyKey, value: any) => {
        if (!(key in target)) {
          target[key as keyof T];
        }

        const keyofT = key as keyof T;
        target[key as keyof T] = value;
        this.triggerUpdate(target, keyofT);
        this.updateChainedObject(keyofT);
        return true;
      },
    };

    this.state = new Proxy(initialState, handler);
  }

  public reactive(key: string, value: string) {
    if (!this.isKeyPath(key)) {
      this.state[key as keyof T] = this.evaluateExpression(value, this.state);
    }
    const includedExpresionInValues = Object.keys(
      this.pairValues(value, this.state)
    );

    const unknownVariables = value;
    includedExpresionInValues.forEach(includedExpresionInValue => {
      this.keyValuePairs[key] = unknownVariables;
      this.reactive_keys = {
        ...this.reactive_keys,
        ...{
          [`${includedExpresionInValue}${this.delimiter}${uuidv4()}`]: {
            mainKey: key,
            value,
          },
        },
      };
    });
  }

  private getNestedPropertyValue(keyPath: string, obj: NestedObject<T>): any {
    const keys = keyPath.split('.');
    let value: any = obj;
    for (const key of keys) {
      value = value[key];
      if (!value) {
        break;
      }
    }

    return value;
  }

  private pairValues(str: string, obj: NestedObject<T>): {[K: string]: any} {
    const regExp = /\$(\w+(?:\.\w+)*)/g;
    let match;
    const values: {[K: string]: any} = {};
    while ((match = regExp.exec(str)) !== null) {
      const keyPath = match[1];
      const value = this.getNestedPropertyValue(keyPath, obj);
      if (value !== undefined) {
        values[keyPath] = value;
      } else {
        throw new Error(`Object does not contain key ${keyPath}`);
      }
    }
    return values;
  }
  private evaluateExpression(str: string, obj: NestedObject<T>): any {
    const values = this.pairValues(str, obj);
    const expression = str.replace(/\$(\w+)/g, (_, key: string) =>
      (values[key] ?? '').toString()
    );
    return this.eval(expression);
  }
  private eval(expression: string) {
    'use strict';
    if (
      this.isNumericMath(expression) &&
      typeof eval?.(expression) === 'number'
    ) {
      return new Function(`return ${expression}`)();
    } else {
      return expression;
    }
  }

  private isKeyPath(key: string) {
    return key.split('.').length > 1;
  }

  private updateChainedObject(variable: keyof T) {
    const getKeys: Array<string> = Object.keys(this.reactive_keys);

    getKeys.forEach(variable_name => {
      const regex = new RegExp(`${this.delimiter}[^${this.delimiter}]+$`);

      let variableWithoutUUID = variable_name.replace(regex, '');
      if (this.isKeyPath(variableWithoutUUID)) {
        const keys = variableWithoutUUID.split('.');
        const lastKey = keys.pop();

        variableWithoutUUID = lastKey;
      }
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
            (values[key] ?? '').toString()
          );
        }

        this.mutateNestedObject(mainKey, this.eval(reCalculate), this.state);
      }
    });
  }

  private isNumericMath(str: string): boolean {
    return /^[\d+\-*/()\s]+$/.test(str);
  }

  private mutateNestedObject(
    path: string,
    value: unknown,
    obj: NestedObject<T>
  ) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let nestedObj = obj;
    for (const key of keys) {
      if (
        typeof nestedObj[key as keyof T] === 'object' &&
        nestedObj[key as keyof T] !== null
      ) {
        nestedObj = nestedObj[key as keyof T] as unknown as NestedObject<T>;
      }
    }

    if (
      typeof nestedObj === 'object' &&
      nestedObj !== null &&
      lastKey !== undefined
    ) {
      const castedLastKey = lastKey as keyof T;
      nestedObj[castedLastKey] = value as T[keyof T];

      if (
        typeof nestedObj[castedLastKey] === 'object' &&
        nestedObj[castedLastKey] !== null
      ) {
        for (const subKey in nestedObj[
          castedLastKey
        ] as unknown as NestedObject<T>) {
          this.updateChainedObject(subKey as keyof T);
        }
      } else {
        this.updateChainedObject(castedLastKey);
      }
    }
  }

  private triggerUpdate(target: any, key: keyof T) {
    if (typeof target[key] === 'object') {
      for (const subKey in target[key]) {
        this.triggerUpdate(target[key], subKey as unknown as keyof T);
      }
    }
  }
}
