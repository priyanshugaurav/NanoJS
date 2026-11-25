// NanoJS Showcase Presets demonstrating C++ engine capabilities

export const PRESETS = [
  {
    id: "closures",
    title: "1. Closures & Scope",
    badge: "Scope",
    description: "Shows how nested functions remember variables from outer scopes.",
    output: `> Counter A (+5): 15\n> Counter A (+5): 20\n> Counter B (-25): 75\n> Counter A Current: 20\n> Counter B Current: 75`,
    code: `// NanoJS Closure & Lexical Scope Demo
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
    title: "2. Async/Await & Event Loop",
    badge: "Async",
    description: "Shows setTimeout timers and Promise microtasks running in order.",
    output: `> 1. Synchronous script start\n> 2. Inside async function\n> Script end (event loop running...)\n> 3. Promise resolved via await\n> 5. Timer 2 finished (0ms)\n> 4. Timer 1 finished (20ms)`,
    code: `// NanoJS Event Loop & Microtask Demo
console.log("1. Synchronous script start");

setTimeout(function() {
    console.log("4. Timer 1 finished (20ms)");
}, 20);

setTimeout(function() {
    console.log("5. Timer 2 finished (0ms)");
}, 0);

async function performTask() {
    console.log("2. Inside async function");
    let result = await Promise.resolve("3. Promise resolved via await");
    console.log(result);
}

performTask();
console.log("Script end (event loop running...)");
`
  },
  {
    id: "classes",
    title: "3. Classes & Inheritance",
    badge: "OOP",
    description: "Shows ES6 class syntax, constructors, methods, and super calls.",
    output: `> NanoGT running at 160 km/h\n> Nitro Boosted! NanoGT hit 240 km/h!\n> Vehicle brand: NanoGT\n> Current speed: 240`,
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
        return "Nitro Boosted! " + this.brand + " hit " + this.speed + " km/h!";
    }
}

let gt = new SuperCar("NanoGT", 120, 80);
console.log(gt.accelerate(40));
console.log(gt.boost());
console.log("Vehicle brand:", gt.brand);
console.log("Current speed:", gt.speed);
`
  },
  {
    id: "arrays_functional",
    title: "4. Arrays & Built-in Methods",
    badge: "Arrays",
    description: "Shows map, filter, and reduce working over arrays.",
    output: `> Original:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n> Evens:     [2, 4, 6, 8, 10]\n> Squared:   [4, 16, 36, 64, 100]\n> Sum:       220`,
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
    title: "5. Recursion & Call Stack",
    badge: "Stack",
    description: "Computes Fibonacci numbers with recursive function calls.",
    output: `> Calculating Fibonacci numbers...\n> fib(0) = 0\n> fib(1) = 1\n> fib(2) = 1\n> fib(3) = 2\n> fib(4) = 3\n> fib(5) = 5\n> fib(6) = 8\n> fib(7) = 13\n> fib(8) = 21\n> fib(9) = 34\n> fib(10) = 55`,
    code: `// NanoJS Call Stack & Recursion
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
    title: "6. Error Handling & Try-Catch",
    badge: "Errors",
    description: "Catches thrown errors with try, catch, and finally blocks.",
    output: `> Testing valid user...\n> Result: {"status":"Verified","age":25}\n> Testing invalid user...\n> Caught expected error: Age cannot be negative: -5\n> Finally block executed regardless of error!`,
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
    console.log("Caught expected error:", err.message);
} finally {
    console.log("Finally block executed regardless of error!");
}
`
  }
];
