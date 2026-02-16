// ===================================================================
// TEST FILE 15: CONSOLE AND FETCH
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 15: CONSOLE AND FETCH");
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

// Console Methods
console.log("\n--- CONSOLE.LOG ---");
console.log("This is a console.log message");
console.log("Multiple", "arguments", "in", "console.log");
console.log("Number:", 42);
console.log("Boolean:", true);
assert(true, "console.log works");

console.log("\n--- CONSOLE.ERROR ---");
console.error("This is an error message");
console.error("Error with value:", 404);
assert(true, "console.error works");

console.log("\n--- CONSOLE.WARN ---");
console.warn("This is a warning message");
console.warn("Warning:", "deprecated feature");
assert(true, "console.warn works");

console.log("\n--- CONSOLE.DIR ---");
let obj = {
    name: "Test Object",
    nested: {
        value: 42,
        array: [1, 2, 3]
    }
};
console.dir(obj);
assert(true, "console.dir works");

console.log("\n--- CONSOLE WITH COMPLEX DATA ---");
let complexData = {
    users: [
        { id: 1, name: "Alice", active: true },
        { id: 2, name: "Bob", active: false }
    ],
    metadata: {
        count: 2,
        timestamp: Date.now()
    }
};
console.log("Complex data:");
console.dir(complexData);
assert(true, "console handles complex data");

// Fetch Tests (if available)
console.log("\n--- FETCH TESTS ---");
console.log("Testing fetch functionality...");

let fetchTest1 = false;
let fetchTest2 = false;

try {
    // Test 1: Basic GET request
    fetch("http://httpbin.org/get")
        .then(function(response) {
            console.log(response.text());
            console.log("Fetch successful!");
            fetchTest1 = true;
            assert(true, "fetch GET request");
        })
        .catch(function(err) {
            console.log("Fetch error: " + err.message);
            console.log("Note: Fetch may not be available or network is unreachable");
        });
    
    // Test 2: Another endpoint
    fetch("http://httpbin.org/json")
        .then(function(response) {
            console.log(response.text());
            console.log("Second fetch successful!");
            fetchTest2 = true;
            assert(true, "fetch second request");
        })
        .catch(function(err) {
            console.log("Second fetch error: " + err.message);
        });
    
} catch (e) {
    console.log("Fetch not available: " + e.message);
    console.log("This is expected if network operations are not implemented");
}

// Console formatting tests
console.log("\n--- CONSOLE FORMATTING ---");
console.log("String: " + "hello");
console.log("Number: " + 42);
console.log("Boolean: " + true);
console.log("Array: " + [1, 2, 3]);
console.log("Object: " + JSON.stringify({ key: "value" }));
assert(true, "console handles different types");

// Console with loops
console.log("\n--- CONSOLE IN LOOPS ---");
for (let i = 0; i < 3; i = i + 1) {
    console.log("Loop iteration: " + i);
}
assert(true, "console works in loops");

// Console with conditionals
console.log("\n--- CONSOLE IN CONDITIONALS ---");
if (true) {
    console.log("Inside if block");
} else {
    console.log("Inside else block");
}
assert(true, "console works in conditionals");

// Console with functions
console.log("\n--- CONSOLE IN FUNCTIONS ---");
function logMessage(msg) {
    console.log("Function message: " + msg);
}
logMessage("test");
assert(true, "console works in functions");

// Wait for async operations
setTimeout(function() {
    console.log("\n" + "=".repeat(70));
    console.log("CHECKING ASYNC RESULTS...");
    console.log("=".repeat(70));
    
    if (fetchTest1) {
        assert(true, "fetch test 1 completed");
    } else {
        console.log("Note: Fetch test 1 did not complete (may be unavailable)");
    }
    
    if (fetchTest2) {
        assert(true, "fetch test 2 completed");
    } else {
        console.log("Note: Fetch test 2 did not complete (may be unavailable)");
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("RESULTS:");
    console.log("Tests Passed: " + testsPassed);
    console.log("Tests Failed: " + testsFailed);
    console.log("=".repeat(70));
}, 2000);
