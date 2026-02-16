# Mini JavaScript Interpreter 🚀

A custom JavaScript interpreter built from scratch in C++! This project implements a working JavaScript runtime that can execute modern JavaScript features including async/await, promises, classes, and more.

![C++](https://img.shields.io/badge/C++-00599C?style=flat&logo=c%2B%2B&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Active-green)

## ✨ Features

- **Modern JavaScript Support**
  - Variables: `let`, `const`, `var`
  - Functions: Regular, Arrow, Async
  - Classes with inheritance
  - Template literals
  - Destructuring assignments

- **Async Operations**
  - Promises with `.then()` and `.catch()`
  - `async/await` syntax
  - Event loop implementation
  - Timers: `setTimeout`, `setInterval`

- **Built-in Objects & APIs**
  - Console: `log`, `error`, `warn`
  - Math object with common functions
  - JSON: `parse` and `stringify`
  - Date handling
  - RegExp support
  - Set and Map data structures

- **File System Module**
  - Read and write files
  - Directory operations
  - File existence checks

- **HTTP Server**
  - Create basic web servers
  - Handle requests and responses

- **Advanced Features**
  - Module system (import/export)
  - Try-catch error handling
  - Array methods: map, filter, reduce, etc.
  - String manipulation methods
  - For-of loops

## 🚀 Getting Started

### Prerequisites

- C++ compiler (GCC, Clang, or MSVC)
- CMake (optional, for building)
- Basic understanding of JavaScript

### Building the Project

**On Linux/Mac:**
```bash
g++ -std=c++17 -o mini_js src/Interpreter.cpp src/main.cpp -lpthread
```

**On Windows:**
```bash
g++ -std=c++17 -o mini_js.exe src/Interpreter.cpp src/main.cpp -lws2_32
```

### Running JavaScript Files

```bash
./mini_js examples/hello.mjs
```

**Note:** Files must use the `.mjs` extension!

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:

- [Language Features](docs/language-features.md) - JavaScript syntax supported
- [Built-in Objects](docs/builtin-objects.md) - Console, Math, JSON, etc.
- [Async Programming](docs/async-programming.md) - Promises and async/await
- [Modules](docs/modules.md) - Import/export system
- [File System API](docs/file-system.md) - Working with files
- [HTTP Server](docs/http-server.md) - Creating web servers
- [Examples](docs/examples.md) - Code samples and tutorials

## 🎯 Quick Example

```javascript
// hello.mjs
async function greet(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Hello, ${name}!`);
    }, 1000);
  });
}

const message = await greet("World");
console.log(message); // Prints after 1 second: Hello, World!
```

Run it:
```bash
./mini_js hello.mjs
```

## 🛠️ Project Structure

```
mini-js/
├── src/
│   ├── Interpreter.cpp    # Main interpreter implementation
│   └── main.cpp           # Entry point
├── examples/              # Sample JavaScript files
├── docs/                  # Documentation
├── build/                 # Build output
└── README.md
```

## 🔧 How It Works

The interpreter works in several stages:

1. **Lexer** - Breaks source code into tokens
2. **Parser** - Builds an Abstract Syntax Tree (AST)
3. **Interpreter** - Executes the AST with runtime support
4. **Event Loop** - Manages async operations

## 📝 Supported JavaScript Syntax

### Variables
```javascript
let x = 10;
const name = "John";
var oldStyle = true;
```

### Functions
```javascript
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function
const multiply = (a, b) => a * b;

// Async function
async function fetchData() {
  return await getData();
}
```

### Classes
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks`);
  }
}
```

### Promises & Async/Await
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Done!"), 1000);
});

promise.then(result => console.log(result));

// Or with async/await
const result = await promise;
console.log(result);
```

## 🧪 Testing

Run the test files in the `examples/` directory:

```bash
./mini_js examples/test_01_variables.mjs
./mini_js examples/test_02_functions.mjs
./mini_js examples/test_03_promises.mjs
```

## 🤝 Contributing

This is a student project, but contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📚 Learning Resources

If you're interested in building interpreters, check out:

- **Crafting Interpreters** by Robert Nystrom
- **Modern Compiler Implementation in C** by Andrew Appel
- **Programming Language Pragmatics** by Michael Scott

## ⚠️ Limitations

This is an educational project with some limitations:

- Not all JavaScript features are implemented
- Performance is not optimized
- Some edge cases may not be handled
- Limited standard library compared to Node.js

## 📄 License

This project is created for educational purposes. Feel free to use it for learning!

## 👨‍💻 Author

Created as a learning project to understand:
- How programming languages work
- Lexical analysis and parsing
- Runtime environments
- Asynchronous programming models

## 🙏 Acknowledgments

Inspired by various interpreter tutorials and JavaScript specifications.

---

⭐ If you found this helpful for learning, please star the repository!

**Questions?** Check out the [documentation](docs/) or open an issue!
