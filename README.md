![Build status](https://github.com/nimatrengo/sweet_bun/actions/workflows/release.yml/badge.svg)

# Soft Bun

Soft Bun is a lightweight and framework-agnostic reactivity library for JavaScript and TypeScript projects. It allows you to easily introduce reactivity into your applications, enabling automatic updates and dynamic behavior based on changes to your state.

## Features

- **Reactivity**: Define reactive dependencies between variables in your state object using expressions.
- **Automatic Updates**: Soft Bun automatically recalculates dependent values when their dependencies change, ensuring your data is always up to date.
- **Framework-Agnostic**: Soft Bun can be seamlessly integrated into any JavaScript or TypeScript project, regardless of the framework or library being used.
- **Simple API**: With a concise and intuitive API, Soft Bun makes it easy to introduce reactivity into your codebase without adding unnecessary complexity.

## Installation

You can install Soft Bun using npm or Yarn:

```shell
npm install soft_bun
```

or

```shell
yarn add soft_bun
```

## Usage

Here's a basic example of how to use Soft Bun:

```javascript
import SoftBun from 'soft_bun';

const data = {a: 2, b: 1};
const state = new SoftBun(data);

state.reactive('c', '1 + $a * $b');

console.log(state.state.c); // Output: 3

state.state.a = 3;

console.log(state.state.c); // Output: 4
```

In the above example, we create a new `SoftBun` instance with an initial data object. We define a reactive dependency using the `reactive` method, which computes the value of `c` based on the variables `a` and `b`. Whenever `a` or `b` changes, Soft Bun automatically updates the value of `c`.

## Contributing

Soft Bun is an open-source project, and contributions are welcome! If you find a bug, have a suggestion, or want to contribute new features or improvements, please feel free to submit a pull request.

## License

Soft Bun is released under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgements

We would like to express our gratitude to the developers and contributors of Svelte and Rich Harris for their inspiring presentations on reactivity, which motivated and influenced the development of Soft Bun.

## Contact

If you have any questions, suggestions, or feedback, please don't hesitate to reach out to me at [nima.2004hkh@gmail.com].

Happy coding with Soft Bun!

```

Feel free to customize this template based on your specific project requirements and guidelines.
```
