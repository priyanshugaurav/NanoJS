// ===================================================================
// TEST FILE 12: TIMERS (setTimeout, setInterval)
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 12: TIMERS");
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

console.log("\nStarting timer tests...");

// setTimeout - Basic
console.log("\n--- SETTIMEOUT BASIC ---");
let timeoutTest1 = 0;
setTimeout(function() {
    timeoutTest1 = 1;
    console.log("setTimeout callback executed");
}, 50);

// setTimeout - With Value
console.log("\n--- SETTIMEOUT WITH VALUE ---");
let timeoutTest2 = 0;
setTimeout(function() {
    timeoutTest2 = 42;
    console.log("setTimeout with value executed");
}, 60);

// setTimeout - Multiple
console.log("\n--- MULTIPLE SETTIMEOUTS ---");
let timeoutTest3 = 0;
let timeoutTest4 = 0;
setTimeout(function() {
    timeoutTest3 = 1;
    console.log("First timeout executed");
}, 70);
setTimeout(function() {
    timeoutTest4 = 2;
    console.log("Second timeout executed");
}, 80);

// setTimeout - Zero Delay
console.log("\n--- SETTIMEOUT ZERO DELAY ---");
let timeoutTest5 = 0;
setTimeout(function() {
    timeoutTest5 = 100;
    console.log("Zero delay timeout executed");
}, 0);

// setInterval and clearInterval
console.log("\n--- SETINTERVAL AND CLEARINTERVAL ---");
let intervalTest1 = 0;
let intervalId1 = setInterval(function() {
    intervalTest1 = intervalTest1 + 1;
    console.log("Interval tick: " + intervalTest1);
    if (intervalTest1 >= 3) {
        clearInterval(intervalId1);
        console.log("Interval cleared");
    }
}, 30);

// setInterval - Different Interval
console.log("\n--- SETINTERVAL DIFFERENT TIMING ---");
let intervalTest2 = 0;
let intervalId2 = setInterval(function() {
    intervalTest2 = intervalTest2 + 10;
    console.log("Interval 2 value: " + intervalTest2);
    if (intervalTest2 >= 30) {
        clearInterval(intervalId2);
        console.log("Interval 2 cleared");
    }
}, 25);

// Nested setTimeout
console.log("\n--- NESTED SETTIMEOUT ---");
let nestedTest = 0;
setTimeout(function() {
    nestedTest = 1;
    console.log("Outer timeout executed");
    setTimeout(function() {
        nestedTest = 2;
        console.log("Inner timeout executed");
    }, 20);
}, 90);

// setTimeout with Closure
console.log("\n--- SETTIMEOUT WITH CLOSURE ---");
function createTimer(value) {
    let result = 0;
    setTimeout(function() {
        result = value;
    }, 100);
    return function() { return result; };
}
let getTimerResult = createTimer(999);

// Wait for all timers to complete and check results
setTimeout(function() {
    console.log("\n" + "=".repeat(70));
    console.log("CHECKING TIMER RESULTS...");
    console.log("=".repeat(70));
    
    assert(timeoutTest1 === 1, "setTimeout basic");
    assert(timeoutTest2 === 42, "setTimeout with value");
    assert(timeoutTest3 === 1, "Multiple setTimeout 1");
    assert(timeoutTest4 === 2, "Multiple setTimeout 2");
    assert(timeoutTest5 === 100, "setTimeout zero delay");
    assert(intervalTest1 >= 3, "setInterval executed multiple times");
    assert(intervalTest2 >= 30, "setInterval 2 executed");
    assert(nestedTest === 2, "Nested setTimeout");
    
    console.log("\n" + "=".repeat(70));
    console.log("RESULTS:");
    console.log("Tests Passed: " + testsPassed);
    console.log("Tests Failed: " + testsFailed);
    console.log("=".repeat(70));
}, 300);
