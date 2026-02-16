// ===================================================================
// TEST FILE 10: SET, MAP, ERROR HANDLING
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 10: SET, MAP, ERROR HANDLING");
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

// Set - Creation and Add
console.log("\n--- SET CREATION AND ADD ---");
let set1 = new Set();
set1.add("apple");
assert(set1.size === 1, "Set.add first item");

set1.add("banana");
assert(set1.size === 2, "Set.add second item");

set1.add("apple");
assert(set1.size === 2, "Set.add duplicate (no effect)");

// Set - Has
console.log("\n--- SET HAS ---");
assert(set1.has("apple"), "Set.has existing item (true)");
assert(set1.has("banana"), "Set.has second item (true)");
assert(!set1.has("orange"), "Set.has non-existing item (false)");

// Set - Delete
console.log("\n--- SET DELETE ---");
set1.delete("banana");
assert(set1.size === 1, "Set.delete reduces size");
assert(!set1.has("banana"), "Set.delete removes item");
assert(set1.has("apple"), "Set.delete preserves other items");

// Set - Clear
console.log("\n--- SET CLEAR ---");
let set2 = new Set();
set2.add("a");
set2.add("b");
set2.add("c");
assert(set2.size === 3, "Set with multiple items");
set2.clear();
assert(set2.size === 0, "Set.clear empties set");

// Set - Multiple Operations
console.log("\n--- SET MULTIPLE OPERATIONS ---");
let set3 = new Set();
set3.add("1");
set3.add("2");
set3.add("3");
set3.add("2");
assert(set3.size === 3, "Set ignores duplicates");
set3.delete("1");
assert(set3.size === 2, "Set after delete");
assert(set3.has("2") && set3.has("3"), "Set remaining items");

// Map - Creation and Set
console.log("\n--- MAP CREATION AND SET ---");
let map1 = new Map();
map1.set("key1", "value1");
assert(map1.size === 1, "Map.set first item");

map1.set("key2", "value2");
assert(map1.size === 2, "Map.set second item");

map1.set("key1", "newvalue1");
assert(map1.size === 2, "Map.set overwrites existing key");

// Map - Get
console.log("\n--- MAP GET ---");
assert(map1.get("key1") === "newvalue1", "Map.get updated value");
assert(map1.get("key2") === "value2", "Map.get second value");
assert(map1.get("key3") === undefined, "Map.get non-existing key");

// Map - Has
console.log("\n--- MAP HAS ---");
assert(map1.has("key1"), "Map.has existing key (true)");
assert(map1.has("key2"), "Map.has second key (true)");
assert(!map1.has("key3"), "Map.has non-existing key (false)");

// Map - Delete
console.log("\n--- MAP DELETE ---");
map1.delete("key2");
assert(map1.size === 1, "Map.delete reduces size");
assert(!map1.has("key2"), "Map.delete removes key");
assert(map1.has("key1"), "Map.delete preserves other keys");

// Map - Clear
console.log("\n--- MAP CLEAR ---");
let map2 = new Map();
map2.set("a", 1);
map2.set("b", 2);
map2.set("c", 3);
assert(map2.size === 3, "Map with multiple entries");
map2.clear();
assert(map2.size === 0, "Map.clear empties map");

// Map - Different Value Types
console.log("\n--- MAP VALUE TYPES ---");
let map3 = new Map();
map3.set("num", 42);
map3.set("str", "hello");
map3.set("bool", true);
assert(map3.get("num") === 42, "Map stores number");
assert(map3.get("str") === "hello", "Map stores string");
assert(map3.get("bool") === true, "Map stores boolean");

// Try-Catch - Basic
console.log("\n--- TRY-CATCH BASIC ---");
let caught1 = false;
try {
    throw new Error("test error");
} catch (e) {
    caught1 = true;
}
assert(caught1, "try-catch catches error");

// Try-Catch - Error Message
console.log("\n--- TRY-CATCH ERROR MESSAGE ---");
let errorMsg = "";
try {
    throw new Error("custom error");
} catch (e) {
    errorMsg = e.message;
}
assert(errorMsg === "custom error", "catch receives error message");

// Try-Finally
console.log("\n--- TRY-FINALLY ---");
let finallyExecuted = false;
try {
    let x = 5;
} finally {
    finallyExecuted = true;
}
assert(finallyExecuted, "finally block executes");

// Try-Catch-Finally
console.log("\n--- TRY-CATCH-FINALLY ---");
let sequence = "";
try {
    sequence = sequence + "try";
    throw new Error("test");
} catch (e) {
    sequence = sequence + "-catch";
} finally {
    sequence = sequence + "-finally";
}
assert(sequence === "try-catch-finally", "try-catch-finally execution order");

// Catch Without Throw
console.log("\n--- TRY WITHOUT THROW ---");
let noThrow = 0;
try {
    noThrow = 1;
} catch (e) {
    noThrow = 2;
}
assert(noThrow === 1, "try without throw skips catch");

// Nested Try-Catch
console.log("\n--- NESTED TRY-CATCH ---");
let nested = 0;
try {
    try {
        throw new Error("inner");
    } catch (e) {
        nested = 1;
        throw new Error("outer");
    }
} catch (e) {
    nested = 2;
}
assert(nested === 2, "nested try-catch");

// Error Object
console.log("\n--- ERROR OBJECT ---");
let err = new Error("test message");
assert(err.message === "test message", "Error object has message");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
