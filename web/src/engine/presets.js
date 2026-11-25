// NanoJS Showcase Presets demonstrating C++ engine capabilities

export const PRESETS = [
  {
    id: "closures",
    title: "1. Closures & Lexical Scope Chain",
    badge: "Memory & Env",
    description: "Demonstrates how C++ shared_ptr<Environment> preserves variables across outer stack frames.",
    code: `// NanoJS Closure & Lexical Environment Demo
function createCounter(initialValue, step) {
    let count = initialValue;
    
    return {
        increment: function() {
            count = count + step;
            return count;
        },
        decrement: function() {
            count = count - step;
            return count;
        },
        get: function() {
            return count;
        }
    };
}

let counterA = createCounter(10, 5);
let counterB = createCounter(100, 25);

console.log("Counter A (+5):", counterA.increment());
console.log("Counter A (+5):", counterA.increment());
console.log("Counter B (-25):", counterB.decrement());
console.log("Counter A Current:", counterA.get());
console.log("Counter B Current:", counterB.get());
`
  },
  {
    id: "eventloop",
    title: "2. Async/Await & Event Loop Ticks",
    badge: "Async Engine",
    description: "Visualizes the non-blocking event loop, macrotask queue, and promise microtasks.",
    code: `// NanoJS Event Loop & Microtask/Macrotask Demo
console.log("1. [Synchronous] Script Execution Starts");

setTimeout(function() {
    console.log("4. [Macrotask] Timer 1 executed (delay: 20ms)");
}, 20);

setTimeout(function() {
    console.log("5. [Macrotask] Timer 2 executed (delay: 0ms)");
}, 0);

async function performTask() {
    console.log("2. [Synchronous] Inside async function body");
    
    // Simulate non-blocking microtask resolution
    let result = await Promise.resolve("3. [Microtask] Promise resolved via await");
    console.log(result);
}

performTask();
console.log("=== End of Main Frame ===");
`
  },
  {
    id: "classes",
    title: "3. Classes, Methods & Inheritance",
    badge: "OOP Hierarchy",
    description: "Showcases class declaration, constructor initialization, method delegation, and prototypes.",
    code: `// NanoJS Object-Oriented System
class Vehicle {
    constructor(brand, speed) {
        this.brand = brand;
        this.speed = speed;
    }

    accelerate(amount) {
        this.speed = this.speed + amount;
        return this.brand + " running at " + this.speed + " km/h";
    }
}

class SuperCar extends Vehicle {
    constructor(brand, speed, nitro) {
        super(brand, speed);
        this.nitro = nitro;
    }

    boost() {
        this.speed = this.speed + this.nitro;
        return "🔥 Nitro Boosted! " + this.brand + " hit " + this.speed + " km/h!";
    }
}

let gt = new SuperCar("NanoGT", 120, 80);
console.log(gt.accelerate(40));
console.log(gt.boost());
console.log("Is instance of Vehicle?", gt instanceof Vehicle);
`
  },
  {
    id: "arrays_functional",
    title: "4. Arrays & Higher-Order Functions",
    badge: "Functional APIs",
    description: "Demonstrates map, filter, and reduce chaining over dynamic ValuePtr collections.",
    code: `// NanoJS Array Processing
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let evens = numbers.filter(function(n) {
    return n % 2 === 0;
});

let squared = evens.map(function(n) {
    return n * n;
});

let sum = squared.reduce(function(acc, val) {
    return acc + val;
}, 0);

console.log("Original: ", numbers);
console.log("Evens:    ", evens);
console.log("Squared:  ", squared);
console.log("Sum:      ", sum);
`
  },
  {
    id: "recursion_stress",
    title: "5. Deep Recursion & Call Stack",
    badge: "Engine Stress",
    description: "Tracks stack frames, call stack depth, and execution timing on algorithmic recursion.",
    code: `// NanoJS Call Stack Depth & Algorithm Stress
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Calculating Fibonacci numbers...");
for (let i = 0; i <= 10; i = i + 1) {
    console.log("fib(" + i + ") = " + fibonacci(i));
}
`
  },
  {
    id: "try_catch",
    title: "6. Error Handling & Unwinding",
    badge: "Exception Engine",
    description: "Inspects stack unwinding and try/catch/finally block guarantees.",
    code: `// NanoJS Exception Handling
function validateUser(age) {
    if (age < 0) {
        throw new Error("Age cannot be negative: " + age);
    }
    if (age < 18) {
        throw new Error("User must be at least 18 years old");
    }
    return { status: "Verified", age: age };
}

try {
    console.log("Testing valid user...");
    let user = validateUser(25);
    console.log("Result:", user);

    console.log("Testing invalid user...");
    validateUser(-5);
} catch (err) {
    console.error("Caught expected exception:", err.message);
} finally {
    console.log("Finally block executed regardless of exception!");
}
`
  }
];
