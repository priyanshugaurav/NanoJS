// ===================================================================
// TEST FILE 17: MODULE SYSTEM (IMPORT/EXPORT)
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 17: MODULE SYSTEM");
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

// NOTE: This test file requires creating module files to test import/export
console.log("\n--- MODULE SYSTEM TESTS ---");
console.log("Note: Module tests require separate .mjs files");
console.log("Creating test modules...");

// Create a test module file
fs.writeFile("test_module_math.mjs", `
export let pi = 3.14159;
export function double(x) {
    return x * 2;
}
export function square(x) {
    return x * x;
}
`);

fs.writeFile("test_module_utils.mjs", `
export function greet(name) {
    return "Hello, " + name;
}
export let version = "1.0.0";
`);

console.log("Test modules created successfully");

// Import tests will be in a separate test file that imports these modules
console.log("\nTo test imports, create a file test_17b_imports.mjs with:");
console.log('import { pi, double, square } from "./test_module_math.mjs";');
console.log('import { greet, version } from "./test_module_utils.mjs";');

assert(fs.exists("test_module_math.mjs"), "Math module file created");
assert(fs.exists("test_module_utils.mjs"), "Utils module file created");

// Test export syntax (within this file)
console.log("\n--- EXPORT SYNTAX ---");

export let exportedVar = 42;
export function exportedFunc() {
    return "exported";
}

assert(exportedVar === 42, "Export variable");
assert(exportedFunc() === "exported", "Export function");

// Cleanup
console.log("\n--- CLEANUP ---");
fs.deleteFile("test_module_math.mjs");
fs.deleteFile("test_module_utils.mjs");

console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("Note: Full module testing requires multi-file setup");
console.log("=".repeat(70));
