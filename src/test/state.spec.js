import { expect } from 'chai';
import { describe, it } from 'mocha';
import State from '../index';
describe('State', () => {
    describe('#reactive', () => {
        it('should create a reactive property for a nested object', () => {
            const data = { a: 1, b: 2, c: { d: 2 } };
            const state = new State(data);
            state.reactive('c.d', '2 * $a + $b');
            state.state.a = 1;
            expect(state.state.c.d).to.equal(4);
            state.state.a = 3;
            expect(state.state.c.d).to.equal(8);
            state.state.b = 4;
            expect(state.state.c.d).to.equal(10);
        });
    });
    describe('#isKeyPath', () => {
        it('should return true for a key path', () => {
            const state = new State({ a: { b: 1 } });
            expect(state['isKeyPath']('a.b')).to.be.true;
        });
        it('should return false for a non-key path', () => {
            const state = new State({ a: 1 });
            expect(state['isKeyPath']('a')).to.be.false;
        });
    });
    describe('#pairValues', () => {
        it('should pair variables in a string with their values from the object', () => {
            const state = new State({ a: 1, b: 2 });
            const pairs = state['pairValues']('$a + $b', state.state);
            expect(pairs['a']).to.equal(1);
            expect(pairs['b']).to.equal(2);
        });
        it('should throw an error for an undefined variable', () => {
            const state = new State({ a: 1 });
            expect(() => state['pairValues']('$a + $b', state.state)).to.throw(Error);
        });
    });
    describe('#evaluateExpression', () => {
        it('should evaluate an expression with variables from the object', () => {
            const state = new State({ a: 1, b: 2 });
            const result = state['evaluateExpression']('$a + $b', state.state);
            expect(result).to.equal(3);
        });
    });
    describe('#isNumericMath', () => {
        it('should return true for a valid math expression', () => {
            const state = new State({ a: 1, b: 2 });
            expect(state['isNumericMath'](`${state.state.a} + ${state.state.b}`)).to
                .be.true;
        });
        it('should return false for a non-math expression', () => {
            const state = new State({ a: 1 });
            expect(state['isNumericMath']('$a + "foo"')).to.be.false;
        });
    });
    describe('#mutateNestedObject', () => {
        it('should set a nested property in the object to the given value', () => {
            const state = new State({ a: { b: { c: 1 } } });
            state['mutateNestedObject']('a.b.c', 2, state.state);
            expect(state.state.a.b.c).to.equal(2);
        });
    });
});
