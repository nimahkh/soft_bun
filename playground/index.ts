import SoftBun from '../src';

// Example usage:

const data = {a: 1, b: 1, c: {d: 2, k: 4}};
const r = new SoftBun(data);

r.reactive('c.d', '2 + $b');
r.reactive('c.k', '5 * $a * $b');
console.time('Task');
r.state.a = 3;
r.state.b = 4;
for (let i = 0; i < 100000; i++) {
  r.state.b += 4;
}
for (let i = 0; i < 100000; i++) {
  r.state.a += 4;
}
console.timeEnd('Task');
console.log(r.state);

interface IAddress {
  postal: string;
  city: string;
  house_number: number;
}

interface IPerson {
  name: string;
  family: string;
  address: IAddress;
  age: number;
}
const data2: IPerson = {
  name: 'Nima',
  family: 'HKH',
  age: 30,
  address: {
    postal: '2A',
    city: 'Utrecht',
    house_number: 3,
  },
};
const person = new SoftBun(data2);
person.reactive('full_name', '$name $family');
console.log(person.state);
person.state.name = 'John';
person.state.family = 'Doe';
console.log(person.state);
