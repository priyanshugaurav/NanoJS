# NanoJS

A lightweight, standalone JavaScript runtime and interpreter written from scratch in modern C++17. Zero external dependencies — built strictly using the C++ standard library and OS networking primitives.

- **Live Playground & Downloads:** [https://nanojs.priyanshugaurav.space](https://nanojs.priyanshugaurav.space)
- **Repository:** [https://github.com/priyanshugaurav/NanoJS](https://github.com/priyanshugaurav/NanoJS)

---

## Overview

NanoJS is a educational and experimental JavaScript runtime designed to show how a language engine works under the hood:
1. **Lexer (`src/Lexer.cpp`)**: Tokenizes raw source code into keyword, literal, identifier, and operator tokens.
2. **Parser (`src/Parser.cpp`)**: Recursive-descent parser producing an Abstract Syntax Tree (AST).
3. **Interpreter (`src/Interpreter.cpp`)**: AST tree-walk evaluator with lexical environment scope chains for closures.
4. **Event Loop (`src/runtime/Eventloop.cpp`)**: Non-blocking microtask and macrotask scheduler for Promises, `setTimeout`, and async I/O.
5. **Runtime System (`src/runtime/`)**: Value tagging (`JSValue`), prototype inheritance, and garbage collection simulation.

---

## Features

- **Language Grammar**: `let`, `const`, `var`, closures, nested scopes, lexical `this`, arrow functions, ternary operators, template literals.
- **Object-Oriented**: ES6 `class`, `constructor`, `extends`, `super`, and prototype method dispatch.
- **Async Execution**: `async` / `await`, Promises (`.then`, `.catch`, `Promise.all`), `setTimeout`, `setInterval`.
- **Standard Library**:
  - `console.log`, `console.error`, `console.warn`, `console.dir`
  - `Math` (`abs`, `floor`, `ceil`, `min`, `max`, `random`, `pow`, `sqrt`, `PI`, `E`)
  - `JSON` (`parse`, `stringify`)
  - `Array` methods (`push`, `pop`, `shift`, `unshift`, `map`, `filter`, `reduce`, `forEach`, `join`, `slice`, `indexOf`, `includes`)
  - `String` methods (`slice`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `split`, `includes`, `replace`, `repeat`)
  - `Map` & `Set` data structures
  - `Date` & `RegExp` basic patterns
- **System & I/O**:
  - `fs.readFile`, `fs.writeFile`, `fs.appendFile`, `fs.existsSync`, `fs.unlinkSync`, `fs.mkdirSync`
  - `http.createServer((req, res) => ...)` with request routing and socket lifecycle
  - `fetch(url)` client implementation
- **ES Modules**: `import` and `export` across `.mjs` files.

---

## Quick Start

### 1. Download Prebuilt Binaries

Prebuilt binaries are available from the website: [https://nanojs.priyanshugaurav.space](https://nanojs.priyanshugaurav.space)

#### macOS (Universal: Apple Silicon & Intel)
```bash
curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash
```
Or download manually:
```bash
curl -O https://nanojs.priyanshugaurav.space/downloads/nanojs-v1.0.0-macos-universal.tar.gz
tar -xzf nanojs-v1.0.0-macos-universal.tar.gz
sudo mv nanojs /usr/local/bin/
```

#### Linux (x86_64)
```bash
curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash
```

#### Windows (x64 PowerShell)
```powershell
irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex
```

---

### 2. Building from Source

#### Prerequisites
- C++17 compatible compiler (`clang++` 10+ or `g++` 9+)
- (Optional) CMake 3.10+

#### macOS
```bash
clang++ -std=c++17 -O3 -Iinclude src/*.cpp src/runtime/*.cpp -o nanojs
```

#### Linux
```bash
g++ -std=c++17 -O3 -Iinclude src/*.cpp src/runtime/*.cpp -o nanojs
```

#### Windows (MinGW)
```bash
g++ -std=c++17 -O3 -Iinclude src/*.cpp src/runtime/*.cpp -o nanojs.exe -lws2_32
```

#### Using CMake (Cross-Platform)
```bash
cmake -B build
cmake --build build --config Release
# Binary is in build/nanojs (or build/Release/nanojs.exe on Windows)
```

---

## Running JavaScript Code

NanoJS executes files with the `.mjs` extension:

```bash
./nanojs examples/test_01_basics.mjs
```

### Example: Async / Await with Closures

Save as `counter.mjs`:
```javascript
function makeCounter(initial) {
  let count = initial;
  return {
    increment: () => { count = count + 1; return count; },
    get: () => count
  };
}

async function run() {
  const counter = makeCounter(10);
  console.log("Initial count:", counter.get());
  
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("After tick:", counter.increment());
  console.log("Next tick:", counter.increment());
}

run();
```

Run with:
```bash
./nanojs counter.mjs
```

Output:
```
==================================================
   NanoJS Interpreter v1.0                        
   Running: counter.mjs
==================================================

Initial count: 10
After tick: 11
Next tick: 12
```

---

## Running Tests

An automated test suite is provided in `scripts/test_engine.py`. It runs all 20 language test suites against the C++ engine:

```bash
python3 scripts/test_engine.py
```

Test coverage includes:
- `test_01_basics.mjs`: Variable declarations, arithmetic, types
- `test_02_strings.mjs`: String prototype methods, concatenation, template literals
- `test_03_arrays.mjs`: Array index access, manipulation
- `test_04_array_methods.mjs`: `map`, `filter`, `reduce`, `forEach`, `join`
- `test_05_objects.mjs`: Object literals, property getters/setters, prototypes
- `test_06_functions.mjs`: Closures, recursion, default parameters
- `test_07_control_flow.mjs`: `if`, `else`, `while`, `for`, `switch`, `for-of`
- `test_08_math_conversion.mjs`: `Math` API and type coercions
- `test_09_json_regexp_date.mjs`: `JSON.parse`, `JSON.stringify`, `Date`, `RegExp`
- `test_10_set_map_errors.mjs`: `Set`, `Map`, `try/catch/finally`, `throw`
- `test_11_promises_async.mjs`: `Promise`, `async/await`, chaining
- `test_12_timers.mjs`: `setTimeout`, `setInterval`, timer cancellation
- `test_13_filesystem.mjs`: `fs` reading, writing, unlinking
- `test_14_edge_cases.mjs`: Complex scope shadowing, hoist semantics
- `test_15_console_fetch.mjs`: `console` formatting and HTTP `fetch`
- `test_16_http_extreme.mjs`: `http.createServer` socket stress test
- `test_17_advanced_features.mjs`: Classes, inheritance, `super`
- `test_18_modules.mjs`: `import` and `export` statements
- `test_19_errors.mjs`: Runtime error handling and call stack unwinding
- `test_20_stress.mjs`: Heavy allocations and event loop throughput
- `test_21_https_backend.mjs`: HTTPS `fetch(url, options)`, TLS, `process.env`, and `http.createServer` POST/CORS/body buffering

---

## Project Structure

```
nanojs/
├── include/              # Public C++ header files
│   ├── AST.h             # AST node class declarations
│   ├── Forward.h         # Forward declarations & common typedefs
│   ├── Interpreter.h     # Evaluation engine & environment coordinator
│   ├── Lexer.h           # Token scanner
│   ├── Parser.h          # Recursive-descent grammar parser
│   ├── Utils.h           # Cross-platform socket and utility helpers
│   └── runtime/          # Environment, JSValue, and EventLoop headers
├── src/                  # Implementation files
│   ├── Lexer.cpp
│   ├── Parser.cpp
│   ├── Interpreter.cpp
│   ├── Utils.cpp
│   ├── main.cpp          # CLI entry point
│   └── runtime/
│       ├── Environment.cpp # Lexical scope bindings
│       ├── Eventloop.cpp   # Timer and microtask queues
│       └── JSValue.cpp     # Dynamic value representation
├── examples/             # 20 test and benchmark .mjs files
├── documentation/        # Detailed technical documentation
├── web/                  # Vite + React web playground and download center
├── scripts/              # Verification & testing scripts
└── CMakeLists.txt        # Cross-platform CMake build file
```

---

## Documentation

Full guides and API documentation:
- [Language Features](documentation/language-features.md)
- [Built-in Objects](documentation/builtin-objects.md)
- [Async Programming](documentation/async-programming.md)
- [File System API](documentation/file-system.md)
- [HTTP Server](documentation/http-server.md)
- [Modules (Import / Export)](documentation/modules.md)
- [Quick Reference](documentation/quick-reference.md)
- [Troubleshooting & FAQ](documentation/troubleshooting.md)
- [Code Examples](documentation/examples.md)

---

## License

MIT License. Free to use, modify, and distribute for educational or commercial purposes.
