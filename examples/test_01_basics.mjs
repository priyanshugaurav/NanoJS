// ===================================================================
// TEST FILE 1: BASIC DATA TYPES AND OPERATORS
// ===================================================================

// console.log("=".repeat(70)); 
console.log("TEST FILE 1: BASIC DATA TYPES AND OPERATORS");
// console.log("=".repeat(70));

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(" PASS: " + testName);
        testsPassed = testsPassed + 1;
    } else {
        console.log("FAIL: " + testName);
        testsFailed = testsFailed + 1;
    }
}

// Numbers
console.log("\n--- NUMBERS ---");
let num1 = 42;
let num2 = 3.14159;
let num3 = -17.5;
let num4 = 0;
assert(num1 === 42, "Integer number");
assert(num2 > 3.14 && num2 < 3.15, "Float number");
assert(num3 === -17.5, "Negative number");
assert(num4 === 0, "Zero");

// Strings
console.log("\n--- STRINGS ---");
let str1 = "hello";
let str2 = "world";
let str3 = "";
assert(str1 === "hello", "String literal");
assert(str3 === "", "Empty string");
assert(str1 + " " + str2 === "hello world", "String concatenation");

// Booleans
console.log("\n--- BOOLEANS ---");
let bool1 = true;
let bool2 = false;
assert(bool1 === true, "Boolean true");
assert(bool2 === false, "Boolean false");

// Null and Undefined
console.log("\n--- NULL AND UNDEFINED ---");
let nullVal = null;
let undefVal;
assert(nullVal === null, "Null value");
assert(undefVal === undefined, "Undefined value");

// Arithmetic Operators
console.log("\n--- ARITHMETIC OPERATORS ---");
assert(10 + 5 === 15, "Addition");
assert(10 - 5 === 5, "Subtraction");
assert(10 * 5 === 50, "Multiplication");
assert(10 / 5 === 2, "Division");
assert(10 % 3 === 1, "Modulo");
assert(2 ** 3 === 8, "Exponentiation");
assert(-5 === 0 - 5, "Unary minus");
assert(+(42) === 42, "Unary plus");

// Operator Precedence
console.log("\n--- OPERATOR PRECEDENCE ---");
assert((2 + 3) * 4 === 20, "Parentheses precedence");
assert(2 + 3 * 4 === 14, "Multiplication before addition");
assert(10 / 2 / 5 === 1, "Left associativity");
assert(2 ** 3 ** 2 === 512, "Exponentiation right associativity");

// Comparison Operators
console.log("\n--- COMPARISON OPERATORS ---");
assert(5 === 5, "Strict equality (numbers)");
assert(5 !== 6, "Strict inequality");
assert("hello" === "hello", "Strict equality (strings)");
assert(true === true, "Strict equality (booleans)");
assert(5 == 5, "Loose equality");
assert(5 != 6, "Loose inequality");
assert(5 > 3, "Greater than");
assert(5 >= 5, "Greater than or equal");
assert(3 < 5, "Less than");
assert(3 <= 3, "Less than or equal");

// Logical Operators
console.log("\n--- LOGICAL OPERATORS ---");
assert(true && true, "Logical AND (true)");
assert(!(true && false), "Logical AND (false)");
assert(true || false, "Logical OR (true)");
assert(!(false || false), "Logical OR (false)");
assert(!false, "Logical NOT (true)");
assert(!(!true), "Logical NOT (false)");

// Short-circuit evaluation
console.log("\n--- SHORT-CIRCUIT EVALUATION ---");
let sideEffect = 0;
false && (sideEffect = 1);
assert(sideEffect === 0, "AND short-circuit");
true || (sideEffect = 2);
assert(sideEffect === 0, "OR short-circuit");

// Typeof Operator
console.log("\n--- TYPEOF OPERATOR ---");
assert(typeof 42 === "number", "typeof number");
assert(typeof "hello" === "string", "typeof string");
assert(typeof true === "boolean", "typeof boolean");
assert(typeof undefined === "undefined", "typeof undefined");
assert(typeof null === "object", "typeof null");
assert(typeof {} === "object", "typeof object");
assert(typeof [] === "object", "typeof array");

// Ternary Operator
console.log("\n--- TERNARY OPERATOR ---");
let ternary1 = true ? "yes" : "no";
assert(ternary1 === "yes", "Ternary (true)");
let ternary2 = false ? "yes" : "no";
assert(ternary2 === "no", "Ternary (false)");
let ternary3 = 5 > 3 ? "greater" : "less";
assert(ternary3 === "greater", "Ternary with comparison");

// Results
// console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
// console.log("=".repeat(70));
