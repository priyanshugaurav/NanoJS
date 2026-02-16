// ===================================================================
// TEST FILE 14: EDGE CASES AND COMPLEX SCENARIOS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 14: EDGE CASES AND COMPLEX SCENARIOS");
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

// Division by Zero
console.log("\n--- DIVISION BY ZERO ---");
let divByZero = 10 / 0;
assert(divByZero === Infinity, "Division by zero equals Infinity");

let negDivByZero = -10 / 0;
assert(negDivByZero === -Infinity, "Negative division by zero");

// Empty Array Operations
console.log("\n--- EMPTY ARRAY OPERATIONS ---");
let emptyArr = [];
assert(emptyArr.length === 0, "Empty array length");
assert(emptyArr.pop() === undefined, "Pop from empty array");
assert(emptyArr.shift() === undefined, "Shift from empty array");

// Undefined Property Access
console.log("\n--- UNDEFINED PROPERTY ACCESS ---");
let emptyObj = {};
assert(emptyObj.nonexistent === undefined, "Access undefined property");
assert(emptyObj.deep === undefined, "Access deeply undefined");

// Multiple Return Statements
console.log("\n--- MULTIPLE RETURN STATEMENTS ---");
function multiReturn(x) {
    if (x > 0) return "positive";
    if (x < 0) return "negative";
    return "zero";
}
assert(multiReturn(5) === "positive", "Multiple returns: positive");
assert(multiReturn(-5) === "negative", "Multiple returns: negative");
assert(multiReturn(0) === "zero", "Multiple returns: zero");

// Deep Nesting
console.log("\n--- DEEP NESTING ---");
let deep = { a: { b: { c: { d: { e: 42 } } } } };
assert(deep.a.b.c.d.e === 42, "Deep nested object access");
deep.a.b.c.d.e = 100;
assert(deep.a.b.c.d.e === 100, "Deep nested object modification");

// Array of Objects
console.log("\n--- ARRAY OF OBJECTS ---");
let arrOfObjs = [
    { id: 1, name: "A", score: 90 },
    { id: 2, name: "B", score: 85 },
    { id: 3, name: "C", score: 95 }
];
assert(arrOfObjs[1].name === "B", "Array of objects access");
let filtered = arrOfObjs.filter(function(obj) { return obj.score > 87; });
assert(filtered.length === 2, "Filter array of objects");

// Function Returning Function
console.log("\n--- FUNCTION RETURNING FUNCTION ---");
function makeMultiplier(x) {
    return function(y) {
        return x * y;
    };
}
let triple = makeMultiplier(3);
let quadruple = makeMultiplier(4);
assert(triple(5) === 15, "Function returning function: triple");
assert(quadruple(5) === 20, "Function returning function: quadruple");

// Chaining Array Methods
console.log("\n--- CHAINING ARRAY METHODS ---");
let chained = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .filter(function(x) { return x % 2 === 0; })
    .map(function(x) { return x * x; })
    .reduce(function(a, b) { return a + b; }, 0);
assert(chained === 220, "Chained filter-map-reduce");

// Boolean Coercion in Conditions
console.log("\n--- BOOLEAN COERCION ---");
let coerceTest1 = 0;
if (1) coerceTest1 = 1;
assert(coerceTest1 === 1, "Truthy number 1");

let coerceTest2 = 0;
if ("hello") coerceTest2 = 1;
assert(coerceTest2 === 1, "Truthy non-empty string");

let coerceTest3 = 0;
if (0) coerceTest3 = 1;
assert(coerceTest3 === 0, "Falsy number 0");

let coerceTest4 = 0;
if ("") coerceTest4 = 1;
assert(coerceTest4 === 0, "Falsy empty string");

// Fibonacci Sequence
console.log("\n--- FIBONACCI SEQUENCE ---");
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
assert(fibonacci(0) === 0, "Fibonacci 0");
assert(fibonacci(1) === 1, "Fibonacci 1");
assert(fibonacci(5) === 5, "Fibonacci 5");
assert(fibonacci(10) === 55, "Fibonacci 10");

// Bubble Sort
console.log("\n--- BUBBLE SORT ---");
function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i = i + 1) {
        for (let j = 0; j < n - i - 1; j = j + 1) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}
let unsorted = [64, 34, 25, 12, 22, 11, 90];
let sorted = bubbleSort(unsorted);
assert(sorted[0] === 11, "Bubble sort first element");
assert(sorted[6] === 90, "Bubble sort last element");
assert(sorted[3] === 25, "Bubble sort middle element");

// Prime Number Checker
console.log("\n--- PRIME NUMBER CHECKER ---");
function isPrime(n) {
    if (n <= 1) return false;
    if (n === 2) return true;
    for (let i = 2; i * i <= n; i = i + 1) {
        if (n % i === 0) return false;
    }
    return true;
}
assert(isPrime(2), "Prime: 2");
assert(isPrime(17), "Prime: 17");
assert(isPrime(29), "Prime: 29");
assert(!isPrime(4), "Not prime: 4");
assert(!isPrime(18), "Not prime: 18");
assert(!isPrime(1), "Not prime: 1");

// String Reversal
console.log("\n--- STRING REVERSAL ---");
function reverseString(str) {
    let result = "";
    for (let i = str.length - 1; i >= 0; i = i - 1) {
        result = result + str.charAt(i);
    }
    return result;
}
assert(reverseString("hello") === "olleh", "Reverse 'hello'");
assert(reverseString("abc") === "cba", "Reverse 'abc'");
assert(reverseString("") === "", "Reverse empty string");

// Palindrome Checker
console.log("\n--- PALINDROME CHECKER ---");
function isPalindrome(str) {
    let reversed = reverseString(str);
    return str === reversed;
}
assert(isPalindrome("racecar"), "Palindrome: racecar");
assert(isPalindrome("noon"), "Palindrome: noon");
assert(!isPalindrome("hello"), "Not palindrome: hello");

// Factorial
console.log("\n--- FACTORIAL ---");
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
assert(factorial(0) === 1, "Factorial 0");
assert(factorial(1) === 1, "Factorial 1");
assert(factorial(5) === 120, "Factorial 5");
assert(factorial(7) === 5040, "Factorial 7");

// Array Flattening
console.log("\n--- ARRAY FLATTENING ---");
function flattenArray(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i = i + 1) {
        if (typeof arr[i] === "object" && arr[i].length !== undefined) {
            let flattened = flattenArray(arr[i]);
            for (let j = 0; j < flattened.length; j = j + 1) {
                result.push(flattened[j]);
            }
        } else {
            result.push(arr[i]);
        }
    }
    return result;
}
let nested = [1, [2, [3, 4]], 5];
let flattened = flattenArray(nested);
assert(flattened.length === 5, "Flatten array length");
assert(flattened[0] === 1 && flattened[4] === 5, "Flatten array content");

// Maximum Subarray Sum (Kadane's Algorithm)
console.log("\n--- MAXIMUM SUBARRAY SUM ---");
function maxSubarraySum(arr) {
    let maxSoFar = arr[0];
    let maxEndingHere = arr[0];
    for (let i = 1; i < arr.length; i = i + 1) {
        maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
}
assert(maxSubarraySum([1, 2, 3, 4, 5]) === 15, "Max subarray all positive");
assert(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6, "Max subarray mixed");

// Greatest Common Divisor
console.log("\n--- GREATEST COMMON DIVISOR ---");
function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}
assert(gcd(48, 18) === 6, "GCD of 48 and 18");
assert(gcd(100, 50) === 50, "GCD of 100 and 50");
assert(gcd(17, 19) === 1, "GCD of coprime numbers");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
