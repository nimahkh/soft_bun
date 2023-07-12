"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
// Example usage:
var data = { a: 1, b: 1, c: { d: 2, k: 4 } };
var r = new src_1.default(data);
r.reactive('c.d', '2 + $b');
r.reactive('c.k', '5 * $a * $b');
console.time('Task');
r.state.a = 3;
r.state.b = 4;
for (var i = 0; i < 100000; i++) {
    r.state.b += 4;
}
for (var i = 0; i < 100000; i++) {
    r.state.a += 4;
}
console.timeEnd('Task');
console.log(r.state);
var data2 = {
    name: 'Nima',
    family: 'HKH',
    age: 30,
    address: {
        postal: '2A',
        city: 'Utrecht',
        house_number: 3,
    },
};
var person = new src_1.default(data2);
// const expression = new String('$name - $family');
// person.reactive('address.postal', expression);
// person.state.age = 10;
person.reactive('full_name', '$name $family');
console.log(person.state);
person.state.name = 'Mo';
person.state.family = 'Mahabadi';
console.log(person.state);
