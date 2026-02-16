# Troubleshooting & FAQ

Common issues and their solutions.

## Table of Contents
- [Building Issues](#building-issues)
- [Runtime Errors](#runtime-errors)
- [Language Features](#language-features)
- [File System Issues](#file-system-issues)
- [Server Issues](#server-issues)
- [Frequently Asked Questions](#frequently-asked-questions)

---

## Building Issues

### Error: g++ not found

**Problem:** Compiler not installed

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install g++

# macOS
xcode-select --install

# Windows
# Install MinGW or use WSL
```

### Error: Cannot find -lpthread

**Problem:** Missing pthread library (Linux/Mac only)

**Solution:**
```bash
# Make sure you include -lpthread flag
g++ -std=c++17 -o mini_js src/Interpreter.cpp -lpthread
```

### Error: ws2_32.lib not found (Windows)

**Problem:** Missing Windows socket library

**Solution:**
```bash
# Make sure you include -lws2_32 flag
g++ -std=c++17 -o mini_js.exe src/Interpreter.cpp -lws2_32
```

### Build succeeds but executable doesn't run

**Problem:** Wrong architecture or missing dependencies

**Solution:**
```bash
# Check if executable was created
ls -l mini_js

# Try running with full path
./mini_js

# Check permissions (Linux/Mac)
chmod +x mini_js
```

---

## Runtime Errors

### ReferenceError: Variable is not defined

**Problem:** Using a variable before declaring it

```javascript
// Wrong
console.log(x);  // ReferenceError: x is not defined

// Correct
let x = 5;
console.log(x);
```

### TypeError: Assignment to constant variable

**Problem:** Trying to reassign a `const` variable

```javascript
// Wrong
const PI = 3.14;
PI = 3.14159;  // TypeError

// Correct
let pi = 3.14;
pi = 3.14159;  // OK

// Or use const correctly
const PI = 3.14159;  // Never reassign
```

### TypeError: Attempted to call a non-function value

**Problem:** Calling something that's not a function

```javascript
// Wrong
let notAFunction = 42;
notAFunction();  // TypeError

// Correct
function myFunction() {
  return 42;
}
myFunction();  // OK
```

### SyntaxError: Expected ';'

**Problem:** Missing semicolon

```javascript
// Wrong
let x = 5
let y = 10  // Missing semicolons

// Correct
let x = 5;
let y = 10;
```

### Error: Could not open file

**Problem:** File doesn't exist or wrong path

```javascript
// Check if file exists first
if (fs.exists('data.txt')) {
  let content = fs.readFile('data.txt');
} else {
  console.log('File not found!');
}
```

---

## Language Features

### Why doesn't my code run?

**Check:**
1. File has `.mjs` extension
2. No syntax errors
3. All variables are declared before use
4. Functions are defined before calling

### Async code not working?

**Problem:** Not using `await` or `.then()`

```javascript
// Wrong - Returns Promise
async function getData() {
  return fetchData();  // Returns immediately
}
let data = getData();
console.log(data);  // [Promise]

// Correct - Wait for result
async function getData() {
  let data = await fetchData();  // Wait for completion
  return data;
}
let data = await getData();
console.log(data);  // Actual data
```

### Class inheritance not working?

**Problem:** Forgetting `super()` in constructor

```javascript
// Wrong
class Dog extends Animal {
  constructor(name, breed) {
    this.name = name;  // Error!
    this.breed = breed;
  }
}

// Correct
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call parent constructor first
    this.breed = breed;
  }
}
```

### Import/Export errors?

**Common issues:**

```javascript
// Wrong - Missing .mjs extension
import { func } from './utils';

// Correct
import { func } from './utils.mjs';

// Wrong - Variable not exported
// In utils.mjs:
function myFunc() { }  // Not exported

// Correct
export function myFunc() { }
```

---

## File System Issues

### File operations not working?

**Check:**
1. File/directory exists
2. Correct path (relative vs absolute)
3. Proper permissions
4. No typos in filename

### Cannot read file

```javascript
// Always check existence first
if (!fs.exists('data.txt')) {
  console.error('File not found!');
  // Create default file or exit
  fs.writeFile('data.txt', 'default content');
}

let content = fs.readFile('data.txt');
```

### Directory operations failing?

```javascript
// Create directory if doesn't exist
if (!fs.exists('data')) {
  fs.mkdir('data');
}

// Check before removing
if (fs.exists('temp') && fs.readdir('temp').length === 0) {
  fs.rmdir('temp');
}
```

---

## Server Issues

### Port already in use

**Problem:** Another server using the same port

**Solution:**
```javascript
// Try a different port
const PORT = 8081;  // Instead of 8080

const server = http.createServer(handler);
server.listen(PORT);
```

### Cannot access server from browser

**Check:**
1. Server is running (check terminal)
2. Using correct URL: `http://localhost:PORT/`
3. Port number matches
4. Firewall not blocking

### Server hangs or doesn't respond

**Problem:** Forgot to call `res.end()`

```javascript
// Wrong - Never sends response
const server = http.createServer((req, res) => {
  let html = '<h1>Hello</h1>';
  // Missing res.end()!
});

// Correct
const server = http.createServer((req, res) => {
  let html = '<h1>Hello</h1>';
  res.end(html);  // Always call this!
});
```

### Routes not working

```javascript
// Common mistake: Order matters
const server = http.createServer((req, res) => {
  // This catches everything first!
  if (req.url.startsWith('/')) {
    res.end('Root');
  }
  // This never runs
  else if (req.url === '/about') {
    res.end('About');
  }
});

// Correct - Specific routes first
const server = http.createServer((req, res) => {
  if (req.url === '/about') {
    res.end('About');
  }
  else if (req.url === '/') {
    res.end('Root');
  }
});
```

---

## Frequently Asked Questions

### Why .mjs extension?

The `.mjs` extension identifies module files. This helps the interpreter know the file uses the module system (import/export).

### Can I use npm packages?

No, this interpreter doesn't support npm packages. It's a standalone runtime with built-in modules only.

### What JavaScript features are supported?

**Supported:**
- Modern syntax (let, const, arrow functions)
- Classes with inheritance
- Async/await and Promises
- Template literals
- Destructuring
- For-of loops
- Many built-in objects (Array, Object, Math, etc.)

**Not supported:**
- Some ES6+ features
- Web APIs (DOM, fetch, etc.)
- Node.js specific APIs
- Some advanced features

### How do I debug my code?

**Use console.log:**
```javascript
function problematic(x) {
  console.log('Input:', x);  // Debug
  let result = x * 2;
  console.log('Result:', result);  // Debug
  return result;
}
```

**Check values:**
```javascript
let data = getData();
console.log('Data type:', typeof data);
console.log('Data value:', data);
```

**Use try-catch:**
```javascript
try {
  riskyOperation();
} catch (error) {
  console.error('Error:', error.message);
  console.error('Type:', error.type);
}
```

### Can I build a real website with this?

Yes, for learning purposes! The HTTP server can serve:
- Static HTML pages
- JSON APIs
- Simple web applications

But for production, use Node.js or a proper web framework.

### How do I stop a running server?

Press `Ctrl + C` in the terminal where the server is running.

### Why is my code slow?

**Common reasons:**
1. Large loops without optimization
2. Blocking operations (use async)
3. Reading large files repeatedly
4. Inefficient algorithms

**Solutions:**
```javascript
// Bad - Reads file in loop
for (let i = 0; i < 1000; i++) {
  let data = fs.readFile('large.txt');  // Slow!
}

// Good - Read once
let data = fs.readFile('large.txt');
for (let i = 0; i < 1000; i++) {
  // Use data
}
```

### Can I use this for my school project?

Absolutely! This is a great learning tool. Make sure to:
1. Understand the code you write
2. Document your work
3. Test thoroughly
4. Credit the interpreter if required

### How do I save data permanently?

Use the file system:

```javascript
// Save
let data = { name: 'John', age: 30 };
fs.writeFile('data.json', JSON.stringify(data));

// Load later
let loaded = fs.readFile('data.json');
let data = JSON.parse(loaded);
```

### Why can't I use `window` or `document`?

This is a server-side interpreter, not a browser. There's no DOM or window object. Use the HTTP server to serve HTML to browsers instead.

### How do I handle user input?

For console input, this interpreter doesn't have built-in support. For web input, use an HTTP server with forms.

### Can I connect to a real database?

Not directly. This interpreter doesn't have database drivers. Use the file system as a simple database:

```javascript
class SimpleDB {
  // See examples.md for full implementation
}
```

### Is this production-ready?

No, this is an educational project. For production:
- Use Node.js
- Use proper databases
- Use frameworks (Express, etc.)
- Add security measures
- Handle errors properly
- Add logging
- Add tests

---

## Getting Help

### Where to find answers?

1. **Read the docs** - Check the documentation folder
2. **Look at examples** - See examples.md
3. **Error messages** - They usually tell you what's wrong
4. **Try-catch** - Use to catch and display errors

### Reporting Issues

When reporting issues, include:
1. The code that causes the problem
2. The exact error message
3. What you expected to happen
4. Your operating system

### Learning Resources

- Read the [Language Features](language-features.md) guide
- Try the [Examples](examples.md)
- Study the [Built-in Objects](builtin-objects.md) documentation
- Practice with small programs
- Build projects

---

## Common Patterns

### Safe File Reading

```javascript
function safeRead(filename, defaultValue = null) {
  if (fs.exists(filename)) {
    return fs.readFile(filename);
  }
  return defaultValue;
}

let config = safeRead('config.json', '{}');
```

### Error Handling

```javascript
async function safeOperation() {
  try {
    let result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Retry Logic

```javascript
async function retry(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
    }
  }
}
```

---

## Performance Tips

1. **Cache file reads**
   ```javascript
   // Bad
   for (let i = 0; i < 100; i++) {
     let data = fs.readFile('config.json');
   }
   
   // Good
   let data = fs.readFile('config.json');
   for (let i = 0; i < 100; i++) {
     // Use data
   }
   ```

2. **Use appropriate data structures**
   ```javascript
   // Bad - Linear search
   let users = [...]; // Array of users
   let found = users.find(u => u.id === targetId);
   
   // Good - O(1) lookup
   let usersMap = new Map();
   // ... populate map ...
   let found = usersMap.get(targetId);
   ```

3. **Avoid nested loops**
   ```javascript
   // Bad - O(n²)
   for (let i = 0; i < arr1.length; i++) {
     for (let j = 0; j < arr2.length; j++) {
       // ...
     }
   }
   
   // Better - O(n)
   let set = new Set(arr2);
   for (let item of arr1) {
     if (set.has(item)) {
       // ...
     }
   }
   ```

---

## Best Practices

1. **Always use const by default**
2. **Check file existence before reading**
3. **Handle all errors with try-catch**
4. **Use meaningful variable names**
5. **Keep functions small and focused**
6. **Comment complex logic**
7. **Test your code incrementally**
8. **Use console.log for debugging**

---

## Quick Reference

### File must end with .mjs
```bash
# Correct
./mini_js app.mjs

# Wrong
./mini_js app.js
```

### Always await async functions
```javascript
// Correct
let result = await asyncFunction();

// Wrong
let result = asyncFunction();  // Returns Promise
```

### Always end responses in servers
```javascript
// Correct
res.end('Response');

// Wrong
// Missing res.end()
```

### Check file existence
```javascript
// Correct
if (fs.exists('file.txt')) {
  let data = fs.readFile('file.txt');
}

// Wrong
let data = fs.readFile('file.txt');  // Might be null!
```

---

Need more help? Check the other documentation files or try the examples!
