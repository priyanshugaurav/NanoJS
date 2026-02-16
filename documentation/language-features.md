# Language Features

This document covers all the JavaScript language features supported by the Mini-JS interpreter.

## Table of Contents
- [Variables](#variables)
- [Data Types](#data-types)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Functions](#functions)
- [Classes](#classes)
- [Template Literals](#template-literals)
- [Destructuring](#destructuring)

---

## Variables

Mini-JS supports all three variable declaration keywords:

### `let` - Block Scoped
```javascript
let x = 10;
x = 20; // ✓ Can be reassigned

if (true) {
  let y = 5;
  console.log(y); // 5
}
console.log(y); // Error: y is not defined
```

### `const` - Block Scoped, Cannot Reassign
```javascript
const PI = 3.14159;
PI = 3.14; // ✗ Error: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4); // ✓ Can modify object/array contents
```

### `var` - Function Scoped (Legacy)
```javascript
var name = "John";
name = "Jane"; // ✓ Can be reassigned

function test() {
  var local = "inside";
}
console.log(local); // Error: local is not defined
```

---

## Data Types

### Numbers
```javascript
let integer = 42;
let decimal = 3.14;
let negative = -10;
let scientific = 1e6; // 1000000

// Special values
let infinity = Infinity;
let negInfinity = -Infinity;
let notANumber = NaN;
```

### Strings
```javascript
let single = 'Hello';
let double = "World";
let template = `Hello ${name}`; // Template literals

// String operations
let concat = "Hello" + " " + "World";
let length = "Hello".length; // 5
```

### Booleans
```javascript
let isTrue = true;
let isFalse = false;

// Truthy/Falsy values
let falsy1 = 0;        // false
let falsy2 = "";       // false
let falsy3 = null;     // false
let falsy4 = undefined; // false
let falsy5 = NaN;      // false
```

### Arrays
```javascript
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", true, null];
let nested = [[1, 2], [3, 4]];

// Access elements
let first = numbers[0]; // 1
numbers[0] = 10; // Modify element
```

### Objects
```javascript
let person = {
  name: "John",
  age: 30,
  greet: function() {
    console.log("Hello!");
  }
};

// Access properties
let name = person.name; // Dot notation
let age = person["age"]; // Bracket notation

// Modify
person.city = "New York"; // Add new property
```

### null and undefined
```javascript
let nothing = null;
let notDefined = undefined;

let obj = {};
console.log(obj.prop); // undefined (missing property)
```

---

## Operators

### Arithmetic Operators
```javascript
let a = 10, b = 3;

let sum = a + b;        // 13
let diff = a - b;       // 7
let product = a * b;    // 30
let quotient = a / b;   // 3.333...
let remainder = a % b;  // 1
let power = a ** b;     // 1000 (exponentiation)
```

### Comparison Operators
```javascript
let x = 5, y = "5";

// Equality
x == y;   // true (loose equality, converts types)
x === y;  // false (strict equality, checks type)
x != y;   // false
x !== y;  // true

// Relational
x > 3;    // true
x < 10;   // true
x >= 5;   // true
x <= 5;   // true
```

### Logical Operators
```javascript
let a = true, b = false;

a && b;   // false (AND)
a || b;   // true (OR)
!a;       // false (NOT)

// Short-circuit evaluation
let result = a || expensiveFunction(); // Doesn't call function
```

### Assignment Operators
```javascript
let x = 10;

x += 5;   // x = x + 5
x -= 3;   // x = x - 3
x *= 2;   // x = x * 2
x /= 4;   // x = x / 4
```

### Increment/Decrement
```javascript
let i = 5;

i++;      // Post-increment (returns 5, then i becomes 6)
++i;      // Pre-increment (i becomes 7, returns 7)
i--;      // Post-decrement
--i;      // Pre-decrement
```

### Bitwise Operators
```javascript
let a = 5;  // Binary: 101
let b = 3;  // Binary: 011

a & b;   // 1 (AND)
a | b;   // 7 (OR)
a ^ b;   // 6 (XOR)
~a;      // -6 (NOT)
a << 1;  // 10 (Left shift)
a >> 1;  // 2 (Right shift)
```

### Ternary Operator
```javascript
let age = 18;
let status = age >= 18 ? "Adult" : "Minor";

// Equivalent to:
let status;
if (age >= 18) {
  status = "Adult";
} else {
  status = "Minor";
}
```

---

## Control Flow

### if...else
```javascript
let score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("F");
}
```

### switch
```javascript
let day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of week");
    break;
  case "Friday":
    console.log("Almost weekend!");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend!");
    break;
  default:
    console.log("Regular day");
}
```

### while Loop
```javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
```

### do...while Loop
```javascript
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);

// Runs at least once even if condition is false
```

### for Loop
```javascript
// Traditional for loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// Multiple variables
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
```

### for...of Loop
```javascript
let fruits = ["apple", "banana", "orange"];

for (let fruit of fruits) {
  console.log(fruit);
}

// Works with strings too
for (let char of "Hello") {
  console.log(char);
}
```

### break and continue
```javascript
// break - exit loop completely
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i); // 0, 1, 2, 3, 4
}

// continue - skip to next iteration
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i); // 0, 1, 3, 4
}
```

---

## Functions

### Function Declaration
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

let message = greet("World"); // "Hello, World!"
```

### Function Expression
```javascript
const add = function(a, b) {
  return a + b;
};

console.log(add(2, 3)); // 5
```

### Arrow Functions
```javascript
// Single expression (implicit return)
const square = x => x * x;

// Multiple parameters
const add = (a, b) => a + b;

// Block body (explicit return)
const multiply = (a, b) => {
  let result = a * b;
  return result;
};

// No parameters
const sayHi = () => console.log("Hi!");
```

### Parameters

**Default Parameters:**
```javascript
function greet(name = "Guest") {
  console.log(`Hello, ${name}!`);
}

greet();        // "Hello, Guest!"
greet("John");  // "Hello, John!"
```

**Rest Parameters:**
```javascript
function sum(...numbers) {
  let total = 0;
  for (let num of numbers) {
    total += num;
  }
  return total;
}

console.log(sum(1, 2, 3, 4)); // 10
```

### Return Values
```javascript
function divide(a, b) {
  if (b === 0) {
    return undefined; // Early return
  }
  return a / b;
}

// Functions without return statement return undefined
function noReturn() {
  console.log("Hi");
}
let result = noReturn(); // undefined
```

---

## Classes

### Basic Class
```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
  
  haveBirthday() {
    this.age++;
  }
}

let john = new Person("John", 30);
john.greet(); // "Hi, I'm John"
```

### Inheritance
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
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

let buddy = new Dog("Buddy", "Golden Retriever");
buddy.speak(); // "Buddy barks"
```

---

## Template Literals

### Basic Usage
```javascript
let name = "John";
let age = 30;

let message = `My name is ${name} and I am ${age} years old.`;
console.log(message);
```

### Multiline Strings
```javascript
let html = `
  <div>
    <h1>Title</h1>
    <p>Content here</p>
  </div>
`;
```

### Expressions in Templates
```javascript
let a = 5, b = 10;
console.log(`${a} + ${b} = ${a + b}`); // "5 + 10 = 15"

console.log(`Price: $${(price * 1.1).toFixed(2)}`);
```

---

## Destructuring

### Object Destructuring
```javascript
let person = {
  name: "John",
  age: 30,
  city: "New York"
};

// Extract properties
let {name, age} = person;
console.log(name); // "John"
console.log(age);  // 30

// With different variable names
let {name: personName, age: personAge} = person;
```

### Array Destructuring
```javascript
let numbers = [1, 2, 3, 4, 5];

// Extract elements
let [first, second] = numbers;
console.log(first);  // 1
console.log(second); // 2

// Skip elements
let [a, , b] = numbers; // Skip second element
console.log(a); // 1
console.log(b); // 3
```

---

## Error Handling

### try...catch
```javascript
try {
  // Code that might throw an error
  let result = riskyOperation();
  console.log(result);
} catch (error) {
  // Handle error
  console.log("Error occurred:", error.message);
} finally {
  // Always runs (optional)
  console.log("Cleanup");
}
```

### Throwing Errors
```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero!");
  }
  return a / b;
}

try {
  let result = divide(10, 0);
} catch (e) {
  console.log(e.message); // "Division by zero!"
}
```

---

## Best Practices

1. **Use `const` by default**, only use `let` when you need to reassign
2. **Use `===` instead of `==`** to avoid type coercion bugs
3. **Use arrow functions** for callbacks and simple functions
4. **Use template literals** for string interpolation
5. **Use descriptive variable names**
6. **Handle errors** with try-catch blocks
7. **Use `for...of`** instead of traditional for loops when possible

---

Next: [Built-in Objects →](builtin-objects.md)
