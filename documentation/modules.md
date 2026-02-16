# Modules

Learn how to organize code with the import/export system.

## Table of Contents
- [Introduction](#introduction)
- [Exporting](#exporting)
- [Importing](#importing)
- [Module Examples](#module-examples)
- [Best Practices](#best-practices)

---

## Introduction

Modules let you split code into separate files and reuse them across your project.

### Why Use Modules?

- **Organization**: Keep related code together
- **Reusability**: Use the same code in multiple places
- **Maintainability**: Easier to update and debug
- **Namespace**: Avoid naming conflicts

### File Extension

**Important:** Module files must use the `.mjs` extension!

```bash
# Correct
utils.mjs
helpers.mjs
math-lib.mjs

# Wrong
utils.js
helpers.js
```

---

## Exporting

Export makes variables, functions, or classes available to other modules.

### Named Exports

Export multiple items from a module:

**math.mjs:**
```javascript
// Export variables
export let PI = 3.14159;
export let E = 2.71828;

// Export functions
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// Export classes
export class Calculator {
  add(a, b) {
    return a + b;
  }
}
```

### Exporting After Declaration

You can also declare first, then export:

**utils.mjs:**
```javascript
function formatDate(date) {
  return date.toISOString();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const MAX_USERS = 100;

// Export at the end
export { formatDate, capitalize, MAX_USERS };
```

### Export Examples

**colors.mjs:**
```javascript
export const RED = "#FF0000";
export const GREEN = "#00FF00";
export const BLUE = "#0000FF";

export function hexToRgb(hex) {
  // Convert hex color to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
```

---

## Importing

Import brings exported items from other modules into your file.

### Named Imports

Import specific items by name:

**main.mjs:**
```javascript
import { add, multiply, PI } from './math.mjs';

console.log(add(5, 3));       // 8
console.log(multiply(4, 2));  // 8
console.log(PI);              // 3.14159
```

### Import All Items

Import everything at once:

**main.mjs:**
```javascript
import { add, multiply, PI, E, Calculator } from './math.mjs';

// Use them
let sum = add(10, 20);
let product = multiply(5, 6);
let calc = new Calculator();
```

### Import with Aliases

Rename imports to avoid conflicts:

**main.mjs:**
```javascript
import { add as sum, multiply as mult } from './math.mjs';

console.log(sum(5, 3));   // 8
console.log(mult(4, 2));  // 8
```

This is useful when you have naming conflicts:

```javascript
import { format as formatDate } from './date-utils.mjs';
import { format as formatCurrency } from './money-utils.mjs';

let date = formatDate(new Date());
let price = formatCurrency(19.99);
```

### Module Paths

**Relative paths** (recommended):
```javascript
import { func } from './utils.mjs';        // Same directory
import { func } from './lib/utils.mjs';    // Subdirectory
import { func } from '../utils.mjs';       // Parent directory
```

**Absolute paths** (from project root):
```javascript
import { func } from 'utils.mjs';          // No ./
```

---

## Module Examples

### Example 1: Math Library

**math-lib.mjs:**
```javascript
export function square(x) {
  return x * x;
}

export function cube(x) {
  return x * x * x;
}

export function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export const CONSTANTS = {
  PI: 3.14159265359,
  E: 2.71828182846,
  PHI: 1.61803398875
};
```

**app.mjs:**
```javascript
import { square, cube, factorial, CONSTANTS } from './math-lib.mjs';

console.log(square(5));           // 25
console.log(cube(3));             // 27
console.log(factorial(5));        // 120
console.log(CONSTANTS.PI);        // 3.14159265359
```

### Example 2: User Management

**user.mjs:**
```javascript
export class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }
  
  getProfile() {
    return {
      name: this.name,
      email: this.email,
      memberSince: this.createdAt
    };
  }
}

export function validateEmail(email) {
  return email.includes('@');
}

export function createUser(name, email) {
  if (!validateEmail(email)) {
    throw new Error('Invalid email');
  }
  return new User(name, email);
}
```

**main.mjs:**
```javascript
import { User, createUser, validateEmail } from './user.mjs';

// Create user
let user = createUser('John Doe', 'john@example.com');
console.log(user.getProfile());

// Validate email
console.log(validateEmail('test@test.com'));  // true
console.log(validateEmail('invalid'));        // false
```

### Example 3: Configuration Module

**config.mjs:**
```javascript
export const CONFIG = {
  apiUrl: 'https://api.example.com',
  apiKey: 'your-api-key-here',
  timeout: 5000,
  maxRetries: 3
};

export function getApiUrl(endpoint) {
  return `${CONFIG.apiUrl}/${endpoint}`;
}

export function isProduction() {
  return CONFIG.apiUrl.includes('api.example.com');
}
```

**api.mjs:**
```javascript
import { CONFIG, getApiUrl } from './config.mjs';

export async function fetchUsers() {
  let url = getApiUrl('users');
  console.log(`Fetching from: ${url}`);
  // Fetch logic here
}

export async function fetchPosts() {
  let url = getApiUrl('posts');
  console.log(`Fetching from: ${url}`);
  // Fetch logic here
}
```

**main.mjs:**
```javascript
import { fetchUsers, fetchPosts } from './api.mjs';

await fetchUsers();
await fetchPosts();
```

### Example 4: Utility Functions

**string-utils.mjs:**
```javascript
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
```

**array-utils.mjs:**
```javascript
export function unique(arr) {
  let seen = new Set();
  return arr.filter(item => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

export function chunk(arr, size) {
  let chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function shuffle(arr) {
  let shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**main.mjs:**
```javascript
import { capitalize, slugify } from './string-utils.mjs';
import { unique, chunk } from './array-utils.mjs';

// String operations
console.log(capitalize('hello'));        // "Hello"
console.log(slugify('Hello World!'));   // "hello-world"

// Array operations
let numbers = [1, 2, 2, 3, 3, 3];
console.log(unique(numbers));           // [1, 2, 3]

let items = [1, 2, 3, 4, 5, 6];
console.log(chunk(items, 2));           // [[1,2], [3,4], [5,6]]
```

### Example 5: Logger Module

**logger.mjs:**
```javascript
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLevel = LOG_LEVELS.INFO;

export function setLogLevel(level) {
  currentLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;
}

export function debug(message) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.log(`[DEBUG] ${message}`);
  }
}

export function info(message) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(`[INFO] ${message}`);
  }
}

export function warn(message) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(`[WARN] ${message}`);
  }
}

export function error(message) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(`[ERROR] ${message}`);
  }
}
```

**main.mjs:**
```javascript
import { setLogLevel, debug, info, warn, error } from './logger.mjs';

setLogLevel('DEBUG');

debug('Application starting...');
info('Connected to database');
warn('Cache miss, fetching from API');
error('Failed to save user data');
```

---

## Module Patterns

### Pattern 1: Facade Pattern

Hide complex logic behind a simple interface:

**database.mjs:**
```javascript
function connect() {
  console.log('Connecting to database...');
}

function disconnect() {
  console.log('Disconnecting from database...');
}

function query(sql) {
  console.log(`Executing: ${sql}`);
  return [];
}

// Only export the simple interface
export function getUsers() {
  connect();
  let users = query('SELECT * FROM users');
  disconnect();
  return users;
}

export function getUser(id) {
  connect();
  let user = query(`SELECT * FROM users WHERE id = ${id}`);
  disconnect();
  return user;
}
```

### Pattern 2: Singleton Pattern

Share a single instance:

**cache.mjs:**
```javascript
class Cache {
  constructor() {
    this.data = new Map();
  }
  
  set(key, value) {
    this.data.set(key, value);
  }
  
  get(key) {
    return this.data.get(key);
  }
  
  clear() {
    this.data.clear();
  }
}

// Create and export single instance
const cache = new Cache();
export { cache };
```

**main.mjs:**
```javascript
import { cache } from './cache.mjs';

cache.set('user:1', { name: 'John' });
console.log(cache.get('user:1'));
```

### Pattern 3: Factory Pattern

**user-factory.mjs:**
```javascript
export function createAdmin(name, email) {
  return {
    name,
    email,
    role: 'admin',
    permissions: ['read', 'write', 'delete']
  };
}

export function createGuest(name) {
  return {
    name,
    email: null,
    role: 'guest',
    permissions: ['read']
  };
}

export function createModerator(name, email) {
  return {
    name,
    email,
    role: 'moderator',
    permissions: ['read', 'write']
  };
}
```

---

## Best Practices

### 1. One Purpose Per Module

**Good:**
```javascript
// user-validation.mjs
export function validateEmail(email) { ... }
export function validatePassword(password) { ... }

// user-creation.mjs
export function createUser(data) { ... }
export function deleteUser(id) { ... }
```

**Bad:**
```javascript
// utils.mjs (too generic)
export function validateEmail(email) { ... }
export function formatDate(date) { ... }
export function fetchUsers() { ... }
export function calculateTax(price) { ... }
```

### 2. Use Descriptive Names

**Good:**
```javascript
import { validateUserEmail } from './validators.mjs';
import { formatCurrency } from './formatters.mjs';
```

**Bad:**
```javascript
import { validate } from './validators.mjs';
import { format } from './formatters.mjs';
```

### 3. Group Related Exports

**Good:**
```javascript
// constants.mjs
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};
```

### 4. Document Your Modules

```javascript
/**
 * User management utilities
 * Provides functions for creating and validating users
 */

/**
 * Creates a new user with validation
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @returns {Object} User object
 */
export function createUser(name, email) {
  // Implementation
}
```

### 5. Avoid Circular Dependencies

**Bad:**
```javascript
// a.mjs
import { funcB } from './b.mjs';
export function funcA() { funcB(); }

// b.mjs
import { funcA } from './a.mjs';  // Circular!
export function funcB() { funcA(); }
```

**Good:**
```javascript
// shared.mjs
export function sharedFunc() { ... }

// a.mjs
import { sharedFunc } from './shared.mjs';
export function funcA() { sharedFunc(); }

// b.mjs
import { sharedFunc } from './shared.mjs';
export function funcB() { sharedFunc(); }
```

---

## Project Structure

Organize modules in a logical structure:

```
project/
├── main.mjs                 # Entry point
├── config.mjs               # Configuration
├── lib/
│   ├── math.mjs            # Math utilities
│   ├── string.mjs          # String utilities
│   └── array.mjs           # Array utilities
├── models/
│   ├── user.mjs            # User model
│   └── post.mjs            # Post model
├── services/
│   ├── auth.mjs            # Authentication
│   └── database.mjs        # Database access
└── utils/
    ├── logger.mjs          # Logging
    └── validator.mjs       # Validation
```

**Example main.mjs:**
```javascript
import { CONFIG } from './config.mjs';
import { add, multiply } from './lib/math.mjs';
import { User } from './models/user.mjs';
import { authenticate } from './services/auth.mjs';
import { info } from './utils/logger.mjs';

info('Application started');

let user = new User('John', 'john@example.com');
console.log(user.getProfile());
```

---

## Troubleshooting

### Common Issues

**1. Module not found:**
```javascript
// Error: Could not resolve module './utils.mjs'

// Check:
// - File exists
// - Path is correct (relative vs absolute)
// - File has .mjs extension
```

**2. Variable not exported:**
```javascript
// Error: 'funcName' is not exported

// Check:
// - Function is marked with 'export'
// - Name matches exactly (case-sensitive)
```

**3. Circular dependency:**
```javascript
// Error: Cannot access before initialization

// Solution:
// - Restructure code to break the cycle
// - Move shared code to a new module
```

---

## Summary

- **Export** makes code available to other modules
- **Import** brings code from other modules
- Use `.mjs` extension for module files
- Organize code logically in directories
- Avoid circular dependencies
- Use descriptive names
- Document your exports

---

Next: [File System →](file-system.md)
