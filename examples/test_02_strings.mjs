// ===================================================================
// TEST FILE 2: STRING OPERATIONS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 2: STRING OPERATIONS");
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

// Basic String Properties
console.log("\n--- STRING PROPERTIES ---");
let testStr = "Hello World";
assert(testStr.length === 11, "String length");

// String Methods
console.log("\n--- STRING METHODS ---");
assert(testStr.charAt(0) === "H", "charAt(0)");
assert(testStr.charAt(6) === "W", "charAt(6)");
assert(testStr.indexOf("World") === 6, "indexOf");
assert(testStr.indexOf("xyz") === -1, "indexOf (not found)");
assert(testStr.substring(0, 5) === "Hello", "substring");
assert(testStr.substring(6, 11) === "World", "substring (end)");
assert(testStr.slice(0, 5) === "Hello", "slice");
assert(testStr.slice(-5) === "World", "slice (negative)");

// Case Conversion
console.log("\n--- CASE CONVERSION ---");
assert(testStr.toUpperCase() === "HELLO WORLD", "toUpperCase");
assert(testStr.toLowerCase() === "hello world", "toLowerCase");
assert("MiXeD".toUpperCase() === "MIXED", "toUpperCase mixed");
assert("MiXeD".toLowerCase() === "mixed", "toLowerCase mixed");

// String Trimming
console.log("\n--- TRIMMING ---");
assert("  trim  ".trim() === "trim", "trim spaces");
assert("\ttab\t".trim() === "tab", "trim tabs");
assert("  multiple   spaces  ".trim() === "multiple   spaces", "trim preserves internal spaces");

// String Splitting
console.log("\n--- SPLITTING ---");
let split1 = "a,b,c".split(",");
assert(split1.length === 3, "split length");
assert(split1[0] === "a", "split[0]");
assert(split1[1] === "b", "split[1]");
assert(split1[2] === "c", "split[2]");

let split2 = "hello world".split(" ");
assert(split2.length === 2, "split by space");
assert(split2[0] === "hello" && split2[1] === "world", "split content");

// String Searching
console.log("\n--- SEARCHING ---");
assert("hello".includes("ell"), "includes (true)");
assert(!"hello".includes("xyz"), "includes (false)");
assert("hello".startsWith("hel"), "startsWith (true)");
assert(!"hello".startsWith("llo"), "startsWith (false)");
assert("hello".endsWith("llo"), "endsWith (true)");
assert(!"hello".endsWith("hel"), "endsWith (false)");

// String Repetition
console.log("\n--- REPETITION ---");
assert("hello".repeat(3) === "hellohellohello", "repeat(3)");
assert("x".repeat(5) === "xxxxx", "repeat single char");
assert("ab".repeat(2) === "abab", "repeat two chars");

// String Replacement
console.log("\n--- REPLACEMENT ---");
assert("hello".replace("l", "L") === "heLlo", "replace first occurrence");
assert("hello world".replace("o", "0") === "hell0 world", "replace in sentence");

// String Concatenation
console.log("\n--- CONCATENATION ---");
assert("hello" + " " + "world" === "hello world", "Concatenation with +");
assert("test" + 123 === "test123", "String + number");
assert(123 + "test" === "123test", "Number + string");
assert("a" + "b" + "c" === "abc", "Multiple concatenation");

// Edge Cases
console.log("\n--- EDGE CASES ---");
assert("".length === 0, "Empty string length");
assert("".charAt(0) === "", "charAt on empty string");
assert("".toUpperCase() === "", "toUpperCase on empty");
assert("single".split("x").length === 1, "split with no delimiter match");

// Complex Operations
console.log("\n--- COMPLEX OPERATIONS ---");
let complex = "  JavaScript  ";
let result = complex.trim().toLowerCase().replace("java", "type");
assert(result === "typescript", "Chained string operations");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
