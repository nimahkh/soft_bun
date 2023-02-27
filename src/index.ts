/* eslint-disable @typescript-eslint/ban-ts-comment */
import {v4 as uuidv4} from 'uuid';

type NestedObject<T> = {
  [K in keyof T]: T[K] extends object ? NestedObject<T[K]> : T[K];
};

export default class State<T extends object> {
  public state: NestedObject<T>;
  private reactive_keys: object;
  private delimiter = '~';
  private keyValuePairs: unknown[] = [];

  constructor(initialState: T) {
    this.state = initialState;
    this.reactive_keys = {};

    const handler: ProxyHandler<T> = {
      get: (target: T, key: keyof T & string & symbol) => {
        const value: object | null = target[key];
        if (typeof value === 'object') {
          return new Proxy(value, handler);
        } else {
          return value;
        }
      },
      // @ts-ignore:next-line
      set: (target: T, key: keyof T, value: T[keyof T]) => {
        target[key] = value;
        this.triggerUpdate(target, key);
        this.updateChainedObject(key);
        return true;
      },
    };

    this.state = new Proxy(initialState, handler);
  }

  public reactive(key: string, value: string) {
    if (!this.isKeyPath(key)) {
      this.state[key] = this.evaluateExpression(value, this.state);
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

  private pairValues(
    str: string,
    obj: NestedObject<T>
  ): {[K in keyof T]?: number} {
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
        this.mutateNestedObject(mainKey, this.eval(reCalculate), this.state);
      }
    });
  }

  private isNumericMath(str: string): boolean {
    return /^[\d+\-*/()\s]+$/.test(str);
  }

  private mutateNestedObject(path: string, value: unknown, obj: unknown) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let nestedObj = obj;
    for (const key of keys) {
      nestedObj = nestedObj[key];
    }
    nestedObj[lastKey] = value;
    if (typeof nestedObj[lastKey] === 'object') {
      for (const subKey in nestedObj[lastKey]) {
        this.updateChainedObject(subKey as keyof T);
      }
    } else {
      this.updateChainedObject(lastKey as keyof T);
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
