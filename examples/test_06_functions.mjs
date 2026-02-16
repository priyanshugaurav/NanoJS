// ===================================================================
// TEST FILE 6: FUNCTIONS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 6: FUNCTIONS");
console.log("=".repeat(70));

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log("✓ PASS: " + testName);
        testsPassed = testsPassed + 1;
    } else {
        console.log("✗ FAIL: " + testName);
        testsFailed = testsFailed + 1;
    }
}

// Basic Function Declaration
console.log("\n--- BASIC FUNCTION DECLARATION ---");
function add(a, b) {
    return a + b;
}
assert(add(3, 4) === 7, "Simple function");
assert(add(0, 0) === 0, "Function with zeros");
assert(add(-5, 5) === 0, "Function with negative");

// Function with No Return
console.log("\n--- FUNCTION WITH NO RETURN ---");
function noReturn() {
    let x = 5;
}
assert(noReturn() === undefined, "Function returns undefined by default");

// Multiple Parameters
console.log("\n--- MULTIPLE PARAMETERS ---");
function multiply(a, b, c) {
    return a * b * c;
}
assert(multiply(2, 3, 4) === 24, "Three parameters");

function concatenate(a, b, c, d) {
    return a + b + c + d;
}
assert(concatenate("a", "b", "c", "d") === "abcd", "Four parameters");

// Recursive Functions
console.log("\n--- RECURSIVE FUNCTIONS ---");
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
assert(factorial(5) === 120, "Factorial recursive");
assert(factorial(1) === 1, "Factorial base case");
assert(factorial(0) === 1, "Factorial zero");

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
assert(fibonacci(6) === 8, "Fibonacci recursive");
assert(fibonacci(0) === 0, "Fibonacci base case 0");
assert(fibonacci(1) === 1, "Fibonacci base case 1");

// Closures
console.log("\n--- CLOSURES ---");
function makeCounter() {
    let count = 0;
    return function() {
        count = count + 1;
        return count;
    };
}
let counter1 = makeCounter();
assert(counter1() === 1, "Closure first call");
assert(counter1() === 2, "Closure second call");
assert(counter1() === 3, "Closure third call");

let counter2 = makeCounter();
assert(counter2() === 1, "Independent closure");

// Closure with Parameters
console.log("\n--- CLOSURE WITH PARAMETERS ---");
function makeAdder(x) {
    return function(y) {
        return x + y;
    };
}
let add5 = makeAdder(5);
assert(add5(3) === 8, "Closure with parameter");
assert(add5(10) === 15, "Closure reuse");

let add10 = makeAdder(10);
assert(add10(5) === 15, "Different closure instance");

// Higher-Order Functions
console.log("\n--- HIGHER-ORDER FUNCTIONS ---");
function applyFunc(f, x) {
    return f(x);
}
function double(n) {
    return n * 2;
}
assert(applyFunc(double, 5) === 10, "Higher-order function");

function square(n) {
    return n * n;
}
assert(applyFunc(square, 4) === 16, "Higher-order with different function");

// Function Returning Function
console.log("\n--- FUNCTION RETURNING FUNCTION ---");
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}
let triple = multiplier(3);
assert(triple(4) === 12, "Function returning function");

// Nested Functions
console.log("\n--- NESTED FUNCTIONS ---");
function outer(x) {
    function inner(y) {
        return x + y;
    }
    return inner(10);
}
assert(outer(5) === 15, "Nested function");

// Function as Parameter
console.log("\n--- FUNCTION AS PARAMETER ---");
function compute(a, b, operation) {
    return operation(a, b);
}
function addFunc(x, y) { return x + y; }
function multiplyFunc(x, y) { return x * y; }

assert(compute(5, 3, addFunc) === 8, "Function as parameter (add)");
assert(compute(5, 3, multiplyFunc) === 15, "Function as parameter (multiply)");

// Immediately Invoked Function
console.log("\n--- IMMEDIATELY INVOKED FUNCTION ---");
let result = (function(x) {
    return x * 2;
})(5);
assert(result === 10, "Immediately invoked function");

// Function with Conditional Return
console.log("\n--- CONDITIONAL RETURN ---");
function checkSign(n) {
    if (n > 0) return "positive";
    if (n < 0) return "negative";
    return "zero";
}
assert(checkSign(5) === "positive", "Conditional return positive");
assert(checkSign(-5) === "negative", "Conditional return negative");
assert(checkSign(0) === "zero", "Conditional return zero");

// Complex Function
console.log("\n--- COMPLEX FUNCTION ---");
function processArray(arr, threshold) {
    let result = 0;
    for (let i = 0; i < arr.length; i = i + 1) {
        if (arr[i] > threshold) {
            result = result + arr[i];
        }
    }
    return result;
}
assert(processArray([1, 5, 10, 15, 20], 10) === 35, "Complex function");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
