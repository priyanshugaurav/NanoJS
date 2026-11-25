# NanoJS Documentation

Complete technical documentation for the NanoJS runtime, compiler architecture, standard library, and APIs.

- **Live Site & Playground:** [https://nanojs.priyanshugaurav.space](https://nanojs.priyanshugaurav.space)
- **Repository:** [https://github.com/priyanshugaurav/NanoJS](https://github.com/priyanshugaurav/NanoJS)

---

## Documentation Index

1. **[Quick Reference](quick-reference.md)**
   - Quick syntax cheat sheet: variables, functions, classes, control flow, async patterns, and error handling.

2. **[Language Features](language-features.md)**
   - Supported JavaScript syntax: lexical scoping (`let`, `const`, `var`), arrow functions, default arguments, rest/spread, destructuring, template literals, and ES6 classes.

3. **[Built-in Objects & Standard Library](builtin-objects.md)**
   - API reference for `console`, `Math`, `JSON`, `Array`, `String`, `Map`, `Set`, `Date`, and `RegExp`.

4. **[Asynchronous Programming](async-programming.md)**
   - How `Promise`, `async/await`, `setTimeout`, `setInterval`, and the custom event loop work under the hood.

5. **[Module System](modules.md)**
   - File-based ES modules: `export`, `import`, named exports, default exports, and relative path resolution.

6. **[File System API](file-system.md)**
   - The built-in `fs` module: `readFile`, `writeFile`, `appendFile`, `existsSync`, `unlinkSync`, and `mkdirSync`.

7. **[HTTP Server & Client](http-server.md)**
   - The built-in `http` module: `http.createServer((req, res) => ...)`, routing, headers, body streams, and `fetch(url)`.

8. **[Troubleshooting & FAQ](troubleshooting.md)**
   - Common compilation errors, runtime issues, extension requirements (`.mjs`), and platform-specific tips.

9. **[Code Examples](examples.md)**
   - End-to-end runnable scripts demonstrating closures, REST API servers, async data pipelines, and algorithms.

---

## Architecture Overview

NanoJS is built in C++17 across three primary phases:

```
Source Code (.mjs)
       │
       ▼
[ Lexer.cpp ] ─────────► Token Stream (Keywords, Identifiers, Literals, Operators)
       │
       ▼
[ Parser.cpp ] ────────► Abstract Syntax Tree (AST nodes defined in AST.h)
       │
       ▼
[ Interpreter.cpp ] ───► Tree-walk evaluation with Lexical Environments
       │
       ▼
[ Eventloop.cpp ] ─────► Microtasks (Promises) & Macrotasks (Timers, I/O)
```

### Key Source Files

- `include/AST.h`: Abstract Syntax Tree node hierarchy using `std::unique_ptr`.
- `include/runtime/JSValue.h`: Dynamic value tagging (`JSValueType::Number`, `String`, `Boolean`, `Null`, `Undefined`, `Object`, `Function`).
- `include/runtime/Environment.h`: Scope chain environment supporting lexical scoping and closures.
- `include/runtime/EventLoop.h`: Event loop coordinator with timer heap and microtask queue.
- `src/Lexer.cpp`: Tokenizer.
- `src/Parser.cpp`: Recursive-descent grammar parser.
- `src/Interpreter.cpp`: AST visitor evaluator and built-in global APIs.
- `src/main.cpp`: CLI argument parser and file execution entry point.
