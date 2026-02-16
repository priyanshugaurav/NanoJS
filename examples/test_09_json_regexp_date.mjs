// ===================================================================
// TEST FILE 9: JSON, REGEXP, DATE
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 9: JSON, REGEXP, DATE");
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

// JSON.stringify - Objects
console.log("\n--- JSON.STRINGIFY OBJECTS ---");
let obj1 = { name: "Alice", age: 25 };
let jsonStr1 = JSON.stringify(obj1);
assert(jsonStr1.includes("Alice"), "JSON.stringify contains name");
assert(jsonStr1.includes("25"), "JSON.stringify contains age");

let obj2 = { active: true, count: 0 };
let jsonStr2 = JSON.stringify(obj2);
assert(jsonStr2.includes("true"), "JSON.stringify boolean");
assert(jsonStr2.includes("0"), "JSON.stringify zero");

// JSON.parse - Objects
console.log("\n--- JSON.PARSE OBJECTS ---");
let parsed1 = JSON.parse(jsonStr1);
assert(parsed1.name === "Alice", "JSON.parse name");
assert(parsed1.age === 25, "JSON.parse age");

// JSON with Arrays
console.log("\n--- JSON WITH ARRAYS ---");
let arr1 = [1, 2, 3, 4, 5];
let jsonArr1 = JSON.stringify(arr1);
assert(jsonArr1.includes("1"), "JSON.stringify array");

let parsedArr1 = JSON.parse(jsonArr1);
assert(parsedArr1.length === 5, "JSON.parse array length");
assert(parsedArr1[0] === 1, "JSON.parse array first");
assert(parsedArr1[4] === 5, "JSON.parse array last");

// JSON Nested Objects
console.log("\n--- JSON NESTED OBJECTS ---");
let nested = { user: { name: "Bob", details: { age: 30 } } };
let nestedStr = JSON.stringify(nested);
let parsedNested = JSON.parse(nestedStr);
assert(parsedNested.user.name === "Bob", "JSON nested name");
assert(parsedNested.user.details.age === 30, "JSON nested age");

// JSON Round-trip
console.log("\n--- JSON ROUND-TRIP ---");
let original = { x: 10, y: 20, z: [1, 2, 3] };
let stringified = JSON.stringify(original);
let parsed = JSON.parse(stringified);
assert(parsed.x === 10 && parsed.y === 20, "JSON round-trip values");
assert(parsed.z.length === 3, "JSON round-trip nested array");

// RegExp - Basic Test
console.log("\n--- REGEXP BASIC TEST ---");
let regex1 = new RegExp("hello");
assert(regex1.test("hello world"), "RegExp.test match");
assert(!regex1.test("goodbye world"), "RegExp.test no match");

let regex2 = new RegExp("world");
assert(regex2.test("hello world"), "RegExp.test in middle");

// RegExp - Patterns
console.log("\n--- REGEXP PATTERNS ---");
let digitRegex = new RegExp("[0-9]+");
assert(digitRegex.test("abc123"), "RegExp digit pattern match");
assert(!digitRegex.test("abcdef"), "RegExp digit pattern no match");

let letterRegex = new RegExp("[a-z]+");
assert(letterRegex.test("hello"), "RegExp letter pattern");

// RegExp - Match
console.log("\n--- REGEXP MATCH ---");
let matchRegex = new RegExp("world");
let matchResult = "hello world".match(matchRegex);
assert(matchResult !== null, "String.match returns result");
assert(matchResult[0] === "world", "String.match content");

// RegExp - Global Flag
console.log("\n--- REGEXP GLOBAL FLAG ---");
let globalRegex = new RegExp("l", "g");
let globalMatch = "hello".match(globalRegex);
assert(globalMatch !== null, "Global match returns result");
assert(globalMatch.length === 2, "Global match finds all");

// RegExp - Case Insensitive
console.log("\n--- REGEXP CASE INSENSITIVE ---");
let caseRegex = new RegExp("HELLO", "i");
assert(caseRegex.test("hello"), "Case insensitive match lowercase");
assert(caseRegex.test("HELLO"), "Case insensitive match uppercase");
assert(caseRegex.test("HeLLo"), "Case insensitive match mixed");

// RegExp - Complex Pattern
console.log("\n--- REGEXP COMPLEX PATTERNS ---");
let emailPattern = new RegExp("[a-z]+@[a-z]+");
assert(emailPattern.test("user@domain"), "Email pattern match");
assert(!emailPattern.test("invalid"), "Email pattern no match");

// Date - Creation
console.log("\n--- DATE CREATION ---");
let date1 = new Date();
assert(date1.getTime() > 0, "Date.getTime returns positive");

let date2 = new Date(1000000000000);
assert(date2.getTime() === 1000000000000, "Date from timestamp");

// Date.now
console.log("\n--- DATE.NOW ---");
let now1 = Date.now();
assert(now1 > 0, "Date.now returns positive");
assert(now1 > 1000000000000, "Date.now is recent timestamp");

// Date Comparison
console.log("\n--- DATE COMPARISON ---");
let dateA = new Date(1000000000000);
let dateB = new Date(2000000000000);
assert(dateA.getTime() < dateB.getTime(), "Date comparison");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
