"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
/* eslint-disable @typescript-eslint/ban-ts-comment */
var uuid_1 = require("uuid");
var State = /** @class */ (function () {
    function State(initialState) {
        var _this = this;
        this.delimiter = '~';
        this.keyValuePairs = [];
        this.state = initialState;
        this.reactive_keys = {};
        var handler = {
            get: function (target, key) {
                var value = target[key];
                if (typeof value === 'object') {
                    return new Proxy(value, handler);
                }
                else {
                    return value;
                }
            },
            // @ts-ignore:next-line
            set: function (target, key, value) {
                target[key] = value;
                _this.triggerUpdate(target, key);
                _this.updateChainedObject(key);
                return true;
            }
        };
        this.state = new Proxy(initialState, handler);
    }
    State.prototype.reactive = function (key, value) {
        var _this = this;
        if (!this.isKeyPath(key)) {
            this.state[key] = this.evaluateExpression(value, this.state);
        }
        var includedExpresionInValues = Object.keys(this.pairValues(value, this.state));
        var unknownVariables = value;
        includedExpresionInValues.forEach(function (includedExpresionInValue) {
            var _a;
            _this.keyValuePairs[key] = unknownVariables;
            _this.reactive_keys = __assign(__assign({}, _this.reactive_keys), (_a = {},
                _a["".concat(includedExpresionInValue).concat(_this.delimiter).concat((0, uuid_1.v4)())] = {
                    mainKey: key,
                    value: value
                },
                _a));
        });
    };
    State.prototype.pairValues = function (str, obj) {
        var regExp = /\$(\w+)/g;
        var match;
        var values = {};
        while ((match = regExp.exec(str)) !== null) {
            var key = match[1];
            var value = obj[key];
            if (value !== undefined) {
                values[key] = value;
            }
            else {
                throw new Error("Object does not contain key ".concat(key));
            }
        }
        return values;
    };
    State.prototype.evaluateExpression = function (str, obj) {
        var values = this.pairValues(str, obj);
        var expression = str.replace(/\$(\w+)/g, function (_, key) {
            return values[key].toString();
        });
        return this.eval(expression);
    };
    State.prototype.eval = function (expression) {
        'use strict';
        if (this.isNumericMath(expression) &&
            typeof (eval === null || eval === void 0 ? void 0 : eval(expression)) === 'number') {
            return new Function("return ".concat(expression))();
        }
        else {
            return expression;
        }
    };
    State.prototype.isKeyPath = function (key) {
        return key.split('.').length > 1;
    };
    State.prototype.updateChainedObject = function (variable) {
        var _this = this;
        var getKeys = Object.keys(this.reactive_keys);
        getKeys.forEach(function (variable_name) {
            var _a;
            var regex = new RegExp("".concat(_this.delimiter, "[^").concat(_this.delimiter, "]+$"));
            var variableWithoutUUID = variable_name.replace(regex, '');
            if (((_a = _this.reactive_keys[variable_name]) === null || _a === void 0 ? void 0 : _a.mainKey) &&
                variable === variableWithoutUUID) {
                var _b = _this.reactive_keys[variable_name], mainKey = _b.mainKey, value = _b.value;
                var values = _this.pairValues(value, _this.state);
                var reCalculate = value;
                for (var key in values) {
                    reCalculate = reCalculate.replace(new RegExp("\\$".concat(key, "\\b"), 'g'), values[key].toString());
                }
                _this.mutateNestedObject(mainKey, _this.eval(reCalculate), _this.state);
            }
        });
    };
    State.prototype.isNumericMath = function (str) {
        return /^[\d+\-*/()\s]+$/.test(str);
    };
    State.prototype.mutateNestedObject = function (path, value, obj) {
        var keys = path.split('.');
        var lastKey = keys.pop();
        var nestedObj = obj;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            nestedObj = nestedObj[key];
        }
        nestedObj[lastKey] = value;
        if (typeof nestedObj[lastKey] === 'object') {
            for (var subKey in nestedObj[lastKey]) {
                this.updateChainedObject(subKey);
            }
        }
        else {
            this.updateChainedObject(lastKey);
        }
    };
    State.prototype.triggerUpdate = function (target, key) {
        if (typeof target[key] === 'object') {
            for (var subKey in target[key]) {
                this.triggerUpdate(target[key], subKey);
            }
        }
    };
    return State;
}());
exports["default"] = State;
