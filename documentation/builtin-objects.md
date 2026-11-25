# Built-in Objects

NanoJS provides several built-in objects similar to standard JavaScript.

## Table of Contents
- [Console](#console)
- [Math](#math)
- [JSON](#json)
- [Object](#object)
- [Array Methods](#array-methods)
- [String Methods](#string-methods)
- [Date](#date)
- [Set](#set)
- [Map](#map)
- [RegExp](#regexp)

---

## Console

The console object provides methods for logging messages.

### console.log()
```javascript
console.log("Hello, World!");
console.log("Number:", 42);
console.log("Multiple", "values", 123);

let user = {name: "John", age: 30};
console.log("User:", user); // User: { name: John, age: 30 }
```

### console.error()
```javascript
console.error("Something went wrong!");
console.error("Error code:", 404);
```

### console.warn()
```javascript
console.warn("This is deprecated!");
console.warn("Warning: Low memory");
```

### console.dir()
```javascript
let obj = {a: 1, b: 2};
console.dir(obj); // Displays object structure
```

---

## Math

The Math object provides mathematical functions and constants.

### Constants
```javascript
Math.PI;  // 3.141592653589793
Math.E;   // 2.718281828459045
```

### Basic Functions

**Math.abs()** - Absolute value
```javascript
Math.abs(-5);    // 5
Math.abs(3.14);  // 3.14
```

**Math.floor()** - Round down
```javascript
Math.floor(4.9);  // 4
Math.floor(-4.1); // -5
```

**Math.ceil()** - Round up
```javascript
Math.ceil(4.1);   // 5
Math.ceil(-4.9);  // -4
```

**Math.round()** - Round to nearest
```javascript
Math.round(4.5);  // 5
Math.round(4.4);  // 4
Math.round(-4.5); // -4
```

**Math.sqrt()** - Square root
```javascript
Math.sqrt(16);    // 4
Math.sqrt(2);     // 1.414...
```

**Math.pow()** - Power
```javascript
Math.pow(2, 3);   // 8
Math.pow(5, 2);   // 25
```

**Math.max()** - Maximum value
```javascript
Math.max(1, 5, 3);      // 5
Math.max(-1, -5, -3);   // -1
```

**Math.min()** - Minimum value
```javascript
Math.min(1, 5, 3);      // 1
Math.min(-1, -5, -3);   // -5
```

**Math.random()** - Random number [0, 1)
```javascript
Math.random();  // 0.123... (random)

// Random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let dice = randomInt(1, 6); // 1 to 6
```

### Trigonometric Functions

**Math.sin()** - Sine (radians)
```javascript
Math.sin(0);           // 0
Math.sin(Math.PI / 2); // 1
```

**Math.cos()** - Cosine (radians)
```javascript
Math.cos(0);           // 1
Math.cos(Math.PI);     // -1
```

### Practical Examples

**Generate random color:**
```javascript
function randomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}
```

**Calculate distance:**
```javascript
function distance(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
```

---

## JSON

JSON provides methods for parsing and stringifying JSON data.

### JSON.stringify()
Convert JavaScript values to JSON string:

```javascript
let obj = {
  name: "John",
  age: 30,
  active: true
};

let json = JSON.stringify(obj);
// '{"name":"John","age":30,"active":true}'

// Arrays
let arr = [1, 2, 3];
JSON.stringify(arr); // '[1,2,3]'

// Nested objects
let complex = {
  user: {name: "John"},
  scores: [95, 87, 92]
};
JSON.stringify(complex);
// '{"user":{"name":"John"},"scores":[95,87,92]}'
```

### JSON.parse()
Convert JSON string to JavaScript value:

```javascript
let json = '{"name":"John","age":30}';
let obj = JSON.parse(json);

console.log(obj.name); // "John"
console.log(obj.age);  // 30

// Arrays
let arrJson = '[1,2,3]';
let arr = JSON.parse(arrJson);
console.log(arr[0]); // 1
```

### Practical Use Cases

**Save data to file:**
```javascript
let userData = {
  username: "john_doe",
  preferences: {
    theme: "dark",
    notifications: true
  }
};

let jsonData = JSON.stringify(userData);
fs.writeFile("config.json", jsonData);
```

**Load data from file:**
```javascript
let jsonData = fs.readFile("config.json");
let userData = JSON.parse(jsonData);
console.log(userData.username);
```

---

## Object

The Object constructor provides utility methods for working with objects.

### Object.keys()
Get array of object keys:

```javascript
let person = {
  name: "John",
  age: 30,
  city: "NYC"
};

let keys = Object.keys(person);
// ["name", "age", "city"]

for (let key of keys) {
  console.log(key);
}
```

### Object.values()
Get array of object values:

```javascript
let person = {
  name: "John",
  age: 30,
  city: "NYC"
};

let values = Object.values(person);
// ["John", 30, "NYC"]

for (let value of values) {
  console.log(value);
}
```

### Object.entries()
Get array of [key, value] pairs:

```javascript
let person = {
  name: "John",
  age: 30
};

let entries = Object.entries(person);
// [["name", "John"], ["age", 30]]

for (let [key, value] of entries) {
  console.log(`${key}: ${value}`);
}
// name: John
// age: 30
```

### Object.assign()
Copy properties from source to target:

```javascript
let target = {a: 1};
let source = {b: 2, c: 3};

Object.assign(target, source);
console.log(target); // {a: 1, b: 2, c: 3}

// Merge multiple objects
let obj1 = {a: 1};
let obj2 = {b: 2};
let obj3 = {c: 3};
let merged = Object.assign({}, obj1, obj2, obj3);
// {a: 1, b: 2, c: 3}
```

---

## Array Methods

Arrays in NanoJS support many useful methods.

### push() & pop()
```javascript
let fruits = ["apple", "banana"];

fruits.push("orange");    // ["apple", "banana", "orange"]
let last = fruits.pop();  // "orange"
// fruits is now ["apple", "banana"]
```

### shift() & unshift()
```javascript
let numbers = [2, 3, 4];

let first = numbers.shift();  // 2
// numbers is now [3, 4]

numbers.unshift(1);  // [1, 3, 4]
```

### map()
Transform each element:

```javascript
let numbers = [1, 2, 3, 4];
let doubled = numbers.map(x => x * 2);
// [2, 4, 6, 8]

let names = ["john", "jane"];
let capitalized = names.map(name => name.toUpperCase());
// ["JOHN", "JANE"]
```

### filter()
Keep only elements that pass test:

```javascript
let numbers = [1, 2, 3, 4, 5, 6];
let evens = numbers.filter(x => x % 2 === 0);
// [2, 4, 6]

let users = [
  {name: "John", age: 25},
  {name: "Jane", age: 30},
  {name: "Bob", age: 20}
];
let adults = users.filter(user => user.age >= 25);
// [{name: "John", age: 25}, {name: "Jane", age: 30}]
```

### reduce()
Reduce array to single value:

```javascript
let numbers = [1, 2, 3, 4];
let sum = numbers.reduce((acc, x) => acc + x, 0);
// 10

let max = numbers.reduce((max, x) => x > max ? x : max);
// 4
```

### find() & findIndex()
```javascript
let numbers = [1, 2, 3, 4, 5];

let found = numbers.find(x => x > 3);     // 4
let index = numbers.findIndex(x => x > 3); // 3
```

### some() & every()
```javascript
let numbers = [1, 2, 3, 4, 5];

let hasEven = numbers.some(x => x % 2 === 0);  // true
let allPositive = numbers.every(x => x > 0);   // true
let allEven = numbers.every(x => x % 2 === 0); // false
```

### forEach()
```javascript
let fruits = ["apple", "banana", "orange"];

fruits.forEach((fruit, index) => {
  console.log(`${index}: ${fruit}`);
});
// 0: apple
// 1: banana
// 2: orange
```

### includes()
```javascript
let fruits = ["apple", "banana"];

fruits.includes("apple");   // true
fruits.includes("orange");  // false
```

### indexOf()
```javascript
let numbers = [1, 2, 3, 2, 1];

numbers.indexOf(2);     // 1 (first occurrence)
numbers.indexOf(5);     // -1 (not found)
numbers.indexOf(2, 2);  // 3 (start searching from index 2)
```

### join()
```javascript
let words = ["Hello", "World"];
let sentence = words.join(" ");  // "Hello World"

let numbers = [1, 2, 3];
let csv = numbers.join(",");     // "1,2,3"
```

### slice()
```javascript
let numbers = [1, 2, 3, 4, 5];

let middle = numbers.slice(1, 4);   // [2, 3, 4]
let last2 = numbers.slice(-2);      // [4, 5]
```

### concat()
```javascript
let arr1 = [1, 2];
let arr2 = [3, 4];
let combined = arr1.concat(arr2);  // [1, 2, 3, 4]

let mixed = arr1.concat(arr2, 5, 6);  // [1, 2, 3, 4, 5, 6]
```

### reverse()
```javascript
let numbers = [1, 2, 3];
numbers.reverse();  // [3, 2, 1]
// Modifies original array!
```

### fill()
```javascript
let arr = new Array(5).fill(0);  // [0, 0, 0, 0, 0]

let numbers = [1, 2, 3, 4, 5];
numbers.fill(9, 1, 4);  // [1, 9, 9, 9, 5]
```

---

## String Methods

### length
```javascript
let str = "Hello";
console.log(str.length); // 5
```

### charAt()
```javascript
let str = "Hello";
str.charAt(0);  // "H"
str.charAt(4);  // "o"
```

### indexOf()
```javascript
let str = "Hello World";
str.indexOf("o");      // 4
str.indexOf("World");  // 6
str.indexOf("x");      // -1
```

### slice()
```javascript
let str = "Hello World";
str.slice(0, 5);   // "Hello"
str.slice(6);      // "World"
str.slice(-5);     // "World"
```

### substring()
```javascript
let str = "Hello World";
str.substring(0, 5);  // "Hello"
str.substring(6, 11); // "World"
```

### toUpperCase() & toLowerCase()
```javascript
let str = "Hello World";
str.toUpperCase();  // "HELLO WORLD"
str.toLowerCase();  // "hello world"
```

### trim()
```javascript
let str = "  Hello  ";
str.trim();  // "Hello"
```

### split()
```javascript
let str = "apple,banana,orange";
let fruits = str.split(",");  // ["apple", "banana", "orange"]

let sentence = "Hello World";
let words = sentence.split(" ");  // ["Hello", "World"]

let chars = "abc".split("");  // ["a", "b", "c"]
```

### replace()
```javascript
let str = "Hello World";
str.replace("World", "JavaScript");  // "Hello JavaScript"

// Only replaces first occurrence
let text = "foo foo foo";
text.replace("foo", "bar");  // "bar foo foo"
```

### includes()
```javascript
let str = "Hello World";
str.includes("World");  // true
str.includes("x");      // false
```

### startsWith() & endsWith()
```javascript
let str = "Hello World";
str.startsWith("Hello");  // true
str.startsWith("World");  // false
str.endsWith("World");    // true
```

### repeat()
```javascript
let str = "Ha";
str.repeat(3);  // "HaHaHa"

"=".repeat(20);  // "===================="
```

### match()
```javascript
let str = "The year is 2024";
let pattern = /\d+/;  // Match digits
let result = str.match(pattern);  // ["2024"]
```

---

## Date

Create and work with dates.

### Creating Dates
```javascript
// Current date and time
let now = new Date();

// From timestamp (milliseconds since Jan 1, 1970)
let date = new Date(1609459200000);
```

### Date Methods

**getTime()** - Get timestamp
```javascript
let now = new Date();
let timestamp = now.getTime();  // e.g., 1609459200000
```

**toISOString()** - ISO format string
```javascript
let date = new Date();
date.toISOString();  // "2024-01-01T00:00:00Z"
```

### Date.now()
```javascript
let timestamp = Date.now();  // Current timestamp
```

---

## Set

A collection of unique values.

### Creating Sets
```javascript
let set = new Set();

// Add values
set.add(1);
set.add(2);
set.add(3);
set.add(2);  // Duplicate, not added

console.log(set.size);  // 3
```

### Set Methods

**add()** - Add value
```javascript
let set = new Set();
set.add("apple");
set.add("banana");
```

**has()** - Check if value exists
```javascript
let set = new Set([1, 2, 3]);
set.has(2);  // true
set.has(5);  // false
```

**delete()** - Remove value
```javascript
let set = new Set([1, 2, 3]);
set.delete(2);  // true (removed)
set.delete(5);  // false (not found)
```

**clear()** - Remove all values
```javascript
let set = new Set([1, 2, 3]);
set.clear();
console.log(set.size);  // 0
```

### Practical Use

**Remove duplicates from array:**
```javascript
let numbers = [1, 2, 2, 3, 3, 3, 4];
let unique = new Set(numbers);
// Set(4) {1, 2, 3, 4}
```

---

## Map

A collection of key-value pairs.

### Creating Maps
```javascript
let map = new Map();

// Add entries
map.set("name", "John");
map.set("age", 30);
map.set(1, "one");  // Keys can be any type
```

### Map Methods

**set()** - Add key-value pair
```javascript
let map = new Map();
map.set("key", "value");
```

**get()** - Get value by key
```javascript
let map = new Map();
map.set("name", "John");
console.log(map.get("name"));  // "John"
console.log(map.get("age"));   // undefined
```

**has()** - Check if key exists
```javascript
let map = new Map();
map.set("name", "John");
map.has("name");  // true
map.has("age");   // false
```

**delete()** - Remove entry
```javascript
let map = new Map();
map.set("name", "John");
map.delete("name");  // true
map.delete("age");   // false
```

**clear()** - Remove all entries
```javascript
let map = new Map();
map.set("a", 1);
map.set("b", 2);
map.clear();
console.log(map.size);  // 0
```

### Practical Use

**Count word occurrences:**
```javascript
let text = "hello world hello";
let words = text.split(" ");
let counts = new Map();

for (let word of words) {
  let count = counts.get(word) || 0;
  counts.set(word, count + 1);
}

console.log(counts.get("hello"));  // 2
```

---

## RegExp

Regular expressions for pattern matching.

### Creating RegExp
```javascript
// Constructor
let pattern = new RegExp("\\d+", "g");

// Literal (in code, not runtime)
// /\d+/g in JavaScript
```

### RegExp Methods

**test()** - Check if pattern matches
```javascript
let pattern = new RegExp("\\d+");
pattern.test("abc123");  // true
pattern.test("abc");     // false
```

### String match()
```javascript
let str = "The year is 2024";
let pattern = new RegExp("\\d+");
let result = str.match(pattern);  // ["2024"]
```

---

## Type Conversion

### Number()
```javascript
Number("42");     // 42
Number("3.14");   // 3.14
Number("hello");  // NaN
```

### String()
```javascript
String(42);    // "42"
String(true);  // "true"
String(null);  // "null"
```

### Boolean()
```javascript
Boolean(1);        // true
Boolean(0);        // false
Boolean("hello");  // true
Boolean("");       // false
```

### parseInt() & parseFloat()
```javascript
parseInt("42");      // 42
parseInt("42.5");    // 42
parseFloat("3.14");  // 3.14
```

### isNaN() & isFinite()
```javascript
isNaN(NaN);       // true
isNaN(42);        // false
isFinite(42);     // true
isFinite(Infinity); // false
```

---

Next: [Async Programming →](async-programming.md)
