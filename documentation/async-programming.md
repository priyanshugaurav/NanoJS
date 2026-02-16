# Async Programming

Learn how to write asynchronous code with Promises and async/await.

## Table of Contents
- [Introduction](#introduction)
- [Promises](#promises)
- [Async/Await](#asyncawait)
- [Timers](#timers)
- [Event Loop](#event-loop)
- [Common Patterns](#common-patterns)

---

## Introduction

Asynchronous programming allows code to run without blocking. This is useful for:
- File operations
- Network requests
- Timers and delays
- Event handling

### Synchronous vs Asynchronous

**Synchronous (Blocking):**
```javascript
console.log("Start");
// This blocks for 3 seconds
let count = 0;
for (let i = 0; i < 3000000000; i++) {
  count++;
}
console.log("End");  // Runs after 3 seconds
```

**Asynchronous (Non-blocking):**
```javascript
console.log("Start");
setTimeout(() => {
  console.log("After timeout");
}, 1000);
console.log("End");

// Output:
// Start
// End
// After timeout (after 1 second)
```

---

## Promises

A Promise represents a value that may be available now, in the future, or never.

### Promise States

A Promise can be in one of three states:
- **Pending**: Initial state, not fulfilled or rejected
- **Fulfilled**: Operation completed successfully
- **Rejected**: Operation failed

### Creating Promises

```javascript
let promise = new Promise((resolve, reject) => {
  // Do async operation
  let success = true;
  
  if (success) {
    resolve("Operation successful!");
  } else {
    reject("Something went wrong");
  }
});
```

### Promise Example
```javascript
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Waited ${ms}ms`);
    }, ms);
  });
}

// Use the promise
let promise = wait(1000);
console.log("Waiting...");
```

### Consuming Promises: .then()

```javascript
promise.then((result) => {
  console.log(result);  // "Waited 1000ms" (after 1 second)
});
```

### Handling Errors: .catch()

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("Error occurred!");
  }, 1000);
});

promise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error("Caught:", error);  // "Caught: Error occurred!"
  });
```

### Chaining Promises

```javascript
function step1() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Step 1 done"), 1000);
  });
}

function step2(message) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(message + " -> Step 2 done"), 1000);
  });
}

function step3(message) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(message + " -> Step 3 done"), 1000);
  });
}

// Chain them
step1()
  .then((result) => {
    console.log(result);  // "Step 1 done" (after 1s)
    return step2(result);
  })
  .then((result) => {
    console.log(result);  // "Step 1 done -> Step 2 done" (after 2s)
    return step3(result);
  })
  .then((result) => {
    console.log(result);  // Full chain (after 3s)
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Promise.resolve() & Promise.reject()

Create already-resolved/rejected promises:

```javascript
// Resolved promise
let resolved = Promise.resolve("Already done!");
resolved.then((msg) => console.log(msg));

// Rejected promise
let rejected = Promise.reject("Failed!");
rejected.catch((err) => console.error(err));
```

### Real-World Example: Simulated API Call

```javascript
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    console.log("Fetching user...");
    
    setTimeout(() => {
      if (id === 1) {
        resolve({
          id: 1,
          name: "John Doe",
          email: "john@example.com"
        });
      } else {
        reject("User not found");
      }
    }, 1500);
  });
}

// Use it
fetchUser(1)
  .then((user) => {
    console.log("User found:", user.name);
    console.log("Email:", user.email);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

---

## Async/Await

Async/await makes asynchronous code look and behave like synchronous code.

### Async Functions

An `async` function always returns a Promise:

```javascript
async function greet() {
  return "Hello!";
}

// Equivalent to:
function greet() {
  return Promise.resolve("Hello!");
}

// Usage
greet().then((msg) => console.log(msg));
```

### Await Keyword

`await` pauses execution until a Promise resolves:

```javascript
async function example() {
  console.log("Start");
  
  let result = await wait(1000);
  console.log(result);  // Runs after 1 second
  
  console.log("End");
}

example();
```

### Error Handling with Try-Catch

```javascript
async function fetchData() {
  try {
    let result = await riskyOperation();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### Sequential vs Parallel Execution

**Sequential (one after another):**
```javascript
async function sequential() {
  console.log("Start");
  
  let result1 = await wait(1000);
  console.log(result1);  // After 1 second
  
  let result2 = await wait(1000);
  console.log(result2);  // After 2 seconds total
  
  console.log("Done");  // After 2 seconds total
}
```

**Parallel (at the same time):**
```javascript
async function parallel() {
  console.log("Start");
  
  // Start both at once
  let promise1 = wait(1000);
  let promise2 = wait(1000);
  
  // Wait for both
  let result1 = await promise1;
  let result2 = await promise2;
  
  console.log(result1);
  console.log(result2);
  console.log("Done");  // After 1 second (not 2!)
}
```

### Real-World Example: Data Processing

```javascript
async function processUser(id) {
  try {
    // Fetch user
    console.log("Fetching user...");
    let user = await fetchUser(id);
    
    // Process user data
    console.log(`Processing ${user.name}...`);
    let processed = await processData(user);
    
    // Save results
    console.log("Saving...");
    let saved = await saveToDatabase(processed);
    
    console.log("Complete!");
    return saved;
    
  } catch (error) {
    console.error("Failed:", error);
    throw error;  // Re-throw to caller
  }
}

// Helper functions
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({id: id, name: "John", score: 85});
    }, 500);
  });
}

function processData(user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({...user, grade: user.score >= 90 ? "A" : "B"});
    }, 500);
  });
}

function saveToDatabase(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({success: true, id: data.id});
    }, 500);
  });
}

// Run it
processUser(1);
```

### Async Arrow Functions

```javascript
const wait = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`Done!`), ms);
  });
};

const result = await wait(1000);
console.log(result);
```

---

## Timers

JavaScript provides timer functions for delayed execution.

### setTimeout()

Execute code after a delay:

```javascript
setTimeout(() => {
  console.log("This runs after 2 seconds");
}, 2000);

// With function reference
function sayHello() {
  console.log("Hello!");
}

setTimeout(sayHello, 1000);
```

**Canceling setTimeout:**
```javascript
let timerId = setTimeout(() => {
  console.log("This will not run");
}, 5000);

// Cancel it
clearTimeout(timerId);
```

### setInterval()

Execute code repeatedly:

```javascript
let count = 0;

let intervalId = setInterval(() => {
  count++;
  console.log(`Count: ${count}`);
  
  if (count >= 5) {
    clearInterval(intervalId);
    console.log("Done!");
  }
}, 1000);

// Output (each line 1 second apart):
// Count: 1
// Count: 2
// Count: 3
// Count: 4
// Count: 5
// Done!
```

### clearInterval()

Stop a repeating timer:

```javascript
let intervalId = setInterval(() => {
  console.log("Tick");
}, 1000);

// Stop after 5 seconds
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Stopped");
}, 5000);
```

### Timer Examples

**Countdown:**
```javascript
async function countdown(seconds) {
  for (let i = seconds; i >= 0; i--) {
    console.log(i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("Blast off!");
}

countdown(3);
// 3
// 2
// 1
// 0
// Blast off!
```

**Timeout with Promise:**
```javascript
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Timeout!"), ms);
  });
}

async function example() {
  let result = await timeout(2000);
  console.log(result);  // "Timeout!" after 2 seconds
}
```

---

## Event Loop

The event loop manages asynchronous operations.

### How It Works

1. **Call Stack**: Executes synchronous code
2. **Event Queue**: Holds completed async operations
3. **Event Loop**: Moves tasks from queue to stack

### Example

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

console.log("3");

// Output:
// 1
// 3
// 2 (even though timeout is 0ms!)
```

**Why?**
1. "1" executes immediately
2. setTimeout puts callback in event queue
3. "3" executes immediately
4. Event loop moves callback to stack
5. "2" executes

### Microtasks vs Macrotasks

**Microtasks** (higher priority):
- Promise callbacks (.then, .catch)

**Macrotasks** (lower priority):
- setTimeout
- setInterval

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Output:
// 1
// 4
// 3 (Promise - microtask)
// 2 (setTimeout - macrotask)
```

---

## Common Patterns

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

// Usage
async function unreliableOperation() {
  if (Math.random() < 0.7) {
    throw new Error("Random failure");
  }
  return "Success!";
}

let result = await retry(unreliableOperation);
console.log(result);
```

### Timeout Wrapper

```javascript
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), ms);
    })
  ]);
}

// Usage
async function slowOperation() {
  await wait(5000);
  return "Done";
}

try {
  let result = await withTimeout(slowOperation(), 2000);
  console.log(result);
} catch (error) {
  console.error("Took too long!");  // This will run
}
```

### Sequential Processing

```javascript
async function processAll(items) {
  let results = [];
  
  for (let item of items) {
    let result = await processItem(item);
    results.push(result);
  }
  
  return results;
}

// Usage
let items = [1, 2, 3, 4, 5];
let results = await processAll(items);
console.log(results);
```

### Loading Indicator

```javascript
async function loadData() {
  console.log("Loading...");
  
  try {
    let data = await fetchData();
    console.log("Loaded:", data);
  } catch (error) {
    console.error("Load failed:", error);
  } finally {
    console.log("Done loading");  // Always runs
  }
}
```

### Debounce (Async Version)

```javascript
function debounce(fn, ms) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        let result = await fn(...args);
        resolve(result);
      }, ms);
    });
  };
}

// Usage
let search = debounce(async (query) => {
  console.log("Searching for:", query);
  await wait(500);
  return `Results for ${query}`;
}, 300);

await search("test");  // Only runs after 300ms of no more calls
```

---

## Best Practices

1. **Always handle errors** with `.catch()` or `try-catch`
2. **Use async/await** for cleaner code (instead of .then chains)
3. **Avoid nesting** promises or async functions deeply
4. **Clean up timers** with clearTimeout/clearInterval
5. **Consider parallel execution** when operations don't depend on each other
6. **Be careful with loops** - use `for...of` with await, not `.forEach()`

### Good Pattern
```javascript
async function good() {
  try {
    let user = await fetchUser();
    let posts = await fetchPosts(user.id);
    return {user, posts};
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}
```

### Bad Pattern (Avoid)
```javascript
// Don't do this!
async function bad() {
  fetchUser().then(user => {
    fetchPosts(user.id).then(posts => {
      // Nested promises - hard to read
    });
  });
}
```

---

## Troubleshooting

### Common Issues

**Forgetting await:**
```javascript
// Wrong - returns Promise, not result
async function wrong() {
  let result = someAsyncFunction();  // Missing await!
  console.log(result);  // [Promise]
}

// Correct
async function correct() {
  let result = await someAsyncFunction();
  console.log(result);  // Actual value
}
```

**Forgetting to make function async:**
```javascript
// Wrong
function wrong() {
  let result = await something();  // Error!
}

// Correct
async function correct() {
  let result = await something();
}
```

**Unhandled promise rejection:**
```javascript
// Wrong - error is swallowed
async function wrong() {
  await riskyOperation();  // No try-catch!
}

// Correct
async function correct() {
  try {
    await riskyOperation();
  } catch (error) {
    console.error("Handled:", error);
  }
}
```

---

Next: [Modules →](modules.md)
