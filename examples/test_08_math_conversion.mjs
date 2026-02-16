// ===================================================================
// TEST FILE 8: MATH AND TYPE CONVERSION
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 8: MATH AND TYPE CONVERSION");
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

// Math.abs
console.log("\n--- MATH.ABS ---");
assert(Math.abs(-5) === 5, "Math.abs negative");
assert(Math.abs(5) === 5, "Math.abs positive");
assert(Math.abs(0) === 0, "Math.abs zero");
assert(Math.abs(-3.14) === 3.14, "Math.abs negative float");

// Math.floor
console.log("\n--- MATH.FLOOR ---");
assert(Math.floor(3.7) === 3, "Math.floor positive");
assert(Math.floor(3.2) === 3, "Math.floor rounds down");
assert(Math.floor(-3.7) === -4, "Math.floor negative");
assert(Math.floor(5) === 5, "Math.floor integer");

// Math.ceil
console.log("\n--- MATH.CEIL ---");
assert(Math.ceil(3.2) === 4, "Math.ceil positive");
assert(Math.ceil(3.9) === 4, "Math.ceil rounds up");
assert(Math.ceil(-3.2) === -3, "Math.ceil negative");
assert(Math.ceil(5) === 5, "Math.ceil integer");

// Math.round
console.log("\n--- MATH.ROUND ---");
assert(Math.round(3.5) === 4, "Math.round up");
assert(Math.round(3.4) === 3, "Math.round down");
assert(Math.round(3.6) === 4, "Math.round up 2");
assert(Math.round(-3.5) === -3, "Math.round negative");

// Math.max
console.log("\n--- MATH.MAX ---");
assert(Math.max(1, 5, 3) === 5, "Math.max three numbers");
assert(Math.max(10, 2) === 10, "Math.max two numbers");
assert(Math.max(-5, -10, -3) === -3, "Math.max negatives");
assert(Math.max(0, 0, 0) === 0, "Math.max zeros");

// Math.min
console.log("\n--- MATH.MIN ---");
assert(Math.min(1, 5, 3) === 1, "Math.min three numbers");
assert(Math.min(10, 2) === 2, "Math.min two numbers");
assert(Math.min(-5, -10, -3) === -10, "Math.min negatives");
assert(Math.min(0, 0, 0) === 0, "Math.min zeros");

// Math.pow
console.log("\n--- MATH.POW ---");
assert(Math.pow(2, 3) === 8, "Math.pow 2^3");
assert(Math.pow(5, 2) === 25, "Math.pow 5^2");
assert(Math.pow(10, 0) === 1, "Math.pow to zero");
assert(Math.pow(2, 10) === 1024, "Math.pow large");

// Math.sqrt
console.log("\n--- MATH.SQRT ---");
assert(Math.sqrt(16) === 4, "Math.sqrt 16");
assert(Math.sqrt(25) === 5, "Math.sqrt 25");
assert(Math.sqrt(1) === 1, "Math.sqrt 1");
assert(Math.sqrt(0) === 0, "Math.sqrt 0");

// Math.PI and Math.E
console.log("\n--- MATH CONSTANTS ---");
assert(Math.PI > 3.14 && Math.PI < 3.15, "Math.PI value");
assert(Math.E > 2.71 && Math.E < 2.72, "Math.E value");

// Math.random
console.log("\n--- MATH.RANDOM ---");
let random1 = Math.random();
assert(random1 >= 0 && random1 < 1, "Math.random range");

let random2 = Math.random();
let random3 = Math.random();
assert(random2 >= 0 && random2 < 1, "Math.random second call");
assert(random3 >= 0 && random3 < 1, "Math.random third call");

// Number Conversion
console.log("\n--- NUMBER CONVERSION ---");
assert(Number("42") === 42, "Number from string integer");
assert(Number("3.14") === 3.14, "Number from string float");
assert(Number("0") === 0, "Number from string zero");
assert(Number("-17") === -17, "Number from string negative");

// String Conversion
console.log("\n--- STRING CONVERSION ---");
assert(String(42) === "42", "String from number");
assert(String(3.14) === "3.14", "String from float");
assert(String(true) === "true", "String from true");
assert(String(false) === "false", "String from false");
assert(String(0) === "0", "String from zero");

// Boolean Conversion
console.log("\n--- BOOLEAN CONVERSION ---");
assert(Boolean(1) === true, "Boolean from 1");
assert(Boolean(0) === false, "Boolean from 0");
assert(Boolean("hello") === true, "Boolean from non-empty string");
assert(Boolean("") === false, "Boolean from empty string");
assert(Boolean(null) === false, "Boolean from null");
assert(Boolean(undefined) === false, "Boolean from undefined");

// parseInt
console.log("\n--- PARSEINT ---");
assert(parseInt("42") === 42, "parseInt simple");
assert(parseInt("42.7") === 42, "parseInt truncates decimals");
assert(parseInt("100") === 100, "parseInt three digits");
assert(parseInt("0") === 0, "parseInt zero");

// parseFloat
console.log("\n--- PARSEFLOAT ---");
assert(parseFloat("3.14") === 3.14, "parseFloat simple");
assert(parseFloat("42") === 42, "parseFloat integer");
assert(parseFloat("0.5") === 0.5, "parseFloat less than one");
assert(parseFloat("123.456") === 123.456, "parseFloat multiple decimals");

// Truthy/Falsy Values
console.log("\n--- TRUTHY/FALSY VALUES ---");
assert(Boolean(1), "1 is truthy");
assert(Boolean(-1), "-1 is truthy");
assert(Boolean("text"), "non-empty string is truthy");
assert(!Boolean(0), "0 is falsy");
assert(!Boolean(""), "empty string is falsy");
assert(!Boolean(null), "null is falsy");
assert(!Boolean(undefined), "undefined is falsy");

// Type Coercion in Operations
console.log("\n--- TYPE COERCION ---");
assert("5" + 5 === "55", "string + number concatenates");
assert(5 + "5" === "55", "number + string concatenates");
assert("10" - 5 === 5, "string - number coerces to number");

// Infinity and Division by Zero
console.log("\n--- INFINITY ---");
let inf = 10 / 0;
assert(inf === Infinity, "division by zero equals Infinity");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
