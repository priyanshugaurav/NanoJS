# Quick Reference

A quick reference guide for NanoJS syntax and features.

## Variables

```javascript
let x = 10;           // Reassignable
const PI = 3.14;      // Constant
var old = 5;          // Function-scoped
```

## Data Types

```javascript
let num = 42;                    // Number
let str = "hello";               // String
let bool = true;                 // Boolean
let arr = [1, 2, 3];            // Array
let obj = {a: 1, b: 2};         // Object
let nothing = null;              // Null
let notDefined = undefined;      // Undefined
```

## Functions

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

## Control Flow

```javascript
// If-else
if (condition) {
  // code
} else if (other) {
  // code
} else {
  // code
}

// Switch
switch (value) {
  case 1:
    break;
  default:
    break;
}

// For loop
for (let i = 0; i < 10; i++) {
  // code
}

// While loop
while (condition) {
  // code
}

// For-of loop
for (let item of array) {
  // code
}
```

## Arrays

```javascript
let arr = [1, 2, 3, 4, 5];

arr.push(6);              // Add to end
arr.pop();                // Remove from end
arr.shift();              // Remove from start
arr.unshift(0);           // Add to start

arr.map(x => x * 2);      // Transform
arr.filter(x => x > 2);   // Filter
arr.reduce((a, b) => a + b, 0);  // Reduce
arr.find(x => x > 3);     // Find first
arr.includes(3);          // Check exists
```

## Objects

```javascript
let obj = { name: "John", age: 30 };

obj.name;                 // Access property
obj["age"];               // Bracket notation

Object.keys(obj);         // ["name", "age"]
Object.values(obj);       // ["John", 30]
Object.entries(obj);      // [["name", "John"], ["age", 30]]
```

## Strings

```javascript
let str = "hello world";

str.length;               // 11
str.toUpperCase();        // "HELLO WORLD"
str.toLowerCase();        // "hello world"
str.trim();               // Remove whitespace
str.split(" ");           // ["hello", "world"]
str.includes("world");    // true
str.startsWith("hello");  // true
str.endsWith("world");    // true
str.slice(0, 5);          // "hello"
str.replace("world", "!"); // "hello !"
```

## Promises

```javascript
// Create promise
let promise = new Promise((resolve, reject) => {
  if (success) {
    resolve(result);
  } else {
    reject(error);
  }
});

// Use promise
promise
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Async/await
async function example() {
  try {
    let result = await promise;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

## Timers

```javascript
// Execute after delay
setTimeout(() => {
  console.log("After 1 second");
}, 1000);

// Execute repeatedly
let id = setInterval(() => {
  console.log("Every second");
}, 1000);

// Stop timer
clearInterval(id);
clearTimeout(id);
```

## File System

```javascript
// Read file
let content = fs.readFile('file.txt');

// Write file
fs.writeFile('file.txt', 'content');

// Append to file
fs.appendFile('log.txt', 'entry\n');

// Check exists
if (fs.exists('file.txt')) { }

// Delete file
fs.deleteFile('file.txt');

// Create directory
fs.mkdir('folder');

// List directory
let files = fs.readdir('.');
```

## HTTP Server

```javascript
const server = http.createServer((req, res) => {
  // req.method - GET, POST, etc.
  // req.url - /path
  
  if (req.url === '/') {
    res.end('Home Page');
  } else {
    res.end('404 Not Found');
  }
});

server.listen(8080);
console.log('Server at http://localhost:8080/');
```

## Classes

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
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

let dog = new Dog("Buddy", "Retriever");
```

## Modules

```javascript
// Export (math.mjs)
export function add(a, b) {
  return a + b;
}

export const PI = 3.14;

// Import (main.mjs)
import { add, PI } from './math.mjs';

console.log(add(5, 3));
```

## Error Handling

```javascript
try {
  // Risky code
  riskyOperation();
} catch (error) {
  // Handle error
  console.error(error.message);
} finally {
  // Always runs
  cleanup();
}

// Throw error
throw new Error('Something went wrong');
```

## JSON

```javascript
// Object to JSON string
let json = JSON.stringify({ name: "John" });

// JSON string to object
let obj = JSON.parse('{"name":"John"}');
```

## Math

```javascript
Math.PI;                  // 3.14159...
Math.E;                   // 2.71828...

Math.abs(-5);            // 5
Math.floor(4.7);         // 4
Math.ceil(4.2);          // 5
Math.round(4.5);         // 5
Math.sqrt(16);           // 4
Math.pow(2, 3);          // 8
Math.max(1, 5, 3);       // 5
Math.min(1, 5, 3);       // 1
Math.random();           // 0.0 - 1.0
```

## Console

```javascript
console.log("Message");       // Log message
console.error("Error");       // Error message
console.warn("Warning");      // Warning
console.dir(object);          // Display object
```

## Type Conversion

```javascript
Number("42");            // 42
String(42);              // "42"
Boolean(1);              // true

parseInt("42");          // 42
parseFloat("3.14");      // 3.14

isNaN(NaN);              // true
isFinite(42);            // true
```

## Template Literals

```javascript
let name = "John";
let age = 30;

let message = `Hello, ${name}! You are ${age} years old.`;

// Multiline
let html = `
  <div>
    <h1>${name}</h1>
  </div>
`;
```

## Destructuring

```javascript
// Array destructuring
let [a, b, c] = [1, 2, 3];

// Object destructuring
let { name, age } = { name: "John", age: 30 };
```

## Operators

```javascript
// Arithmetic
+ - * / % **

// Comparison
== === != !== < > <= >=

// Logical
&& || !

// Assignment
= += -= *= /=

// Increment/Decrement
++ --

// Bitwise
& | ^ ~ << >>

// Ternary
condition ? true : false
```

## Common Patterns

```javascript
// Retry logic
async function retry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
    }
  }
}

// Timeout
function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// Safe read
function safeRead(file, defaultValue) {
  if (fs.exists(file)) {
    return fs.readFile(file);
  }
  return defaultValue;
}
```

## Tips

- Use `const` by default, `let` when needed
- Always use `===` instead of `==`
- Check file existence before reading
- Always call `res.end()` in HTTP handlers
- Use `await` with async functions
- Files must have `.mjs` extension
- Handle errors with try-catch

---

For more details, see the full documentation!
