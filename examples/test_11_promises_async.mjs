// ===================================================================
// TEST FILE 11: PROMISES AND ASYNC/AWAIT
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 11: PROMISES AND ASYNC/AWAIT");
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

// Promise - Basic Resolve
console.log("\n--- PROMISE BASIC RESOLVE ---");
let promiseTest1 = 0;
let p1 = new Promise(function(resolve, reject) {
    resolve(42);
});
p1.then(function(value) {
    promiseTest1 = value;
});

// Promise - Basic Reject
console.log("\n--- PROMISE BASIC REJECT ---");
let promiseTest2 = 0;
let p2 = new Promise(function(resolve, reject) {
    reject("error");
});
p2.catch(function(err) {
    promiseTest2 = 1;
});

// Promise.resolve
console.log("\n--- PROMISE.RESOLVE ---");
let promiseTest3 = 0;
let p3 = Promise.resolve(100);
p3.then(function(v) {
    promiseTest3 = v;
});

// Promise.reject
console.log("\n--- PROMISE.REJECT ---");
let promiseTest4 = 0;
let p4 = Promise.reject("fail");
p4.catch(function(e) {
    promiseTest4 = 1;
});

// Promise Chaining - Then
console.log("\n--- PROMISE CHAINING ---");
let promiseTest5 = 0;
let p5 = Promise.resolve(10);
p5.then(function(v) {
    return v * 2;
}).then(function(v) {
    promiseTest5 = v;
});

// Promise - Multiple Then Handlers
console.log("\n--- PROMISE MULTIPLE THEN ---");
let promiseTest6 = 0;
let promiseTest7 = 0;
let p6 = Promise.resolve(50);
p6.then(function(v) {
    promiseTest6 = v;
});
p6.then(function(v) {
    promiseTest7 = v + 10;
});

// Async Function - Basic
console.log("\n--- ASYNC FUNCTION BASIC ---");
async function asyncTest1() {
    return 42;
}
let asyncResult1 = 0;
asyncTest1().then(function(v) {
    asyncResult1 = v;
});

// Async Function - With Await
console.log("\n--- ASYNC FUNCTION WITH AWAIT ---");
async function asyncTest2() {
    let p = Promise.resolve(100);
    let result = await p;
    return result * 2;
}
let asyncResult2 = 0;
asyncTest2().then(function(v) {
    asyncResult2 = v;
});

// Async Function - Multiple Awaits
console.log("\n--- ASYNC MULTIPLE AWAITS ---");
async function asyncTest3() {
    let p1 = Promise.resolve(10);
    let p2 = Promise.resolve(20);
    let v1 = await p1;
    let v2 = await p2;
    return v1 + v2;
}
let asyncResult3 = 0;
asyncTest3().then(function(v) {
    asyncResult3 = v;
});

// Async Function - Error Handling
console.log("\n--- ASYNC ERROR HANDLING ---");
async function asyncTest4() {
    throw new Error("async error");
}
let asyncResult4 = 0;
asyncTest4().catch(function(e) {
    asyncResult4 = 1;
});

// Async Function - Try-Catch
console.log("\n--- ASYNC TRY-CATCH ---");
async function asyncTest5() {
    try {
        throw new Error("test");
    } catch (e) {
        return "caught";
    }
}
let asyncResult5 = "";
asyncTest5().then(function(v) {
    asyncResult5 = v;
});

// Async Function - Await Rejected Promise
console.log("\n--- ASYNC AWAIT REJECTED ---");
async function asyncTest6() {
    try {
        let p = Promise.reject("rejected");
        let result = await p;
        return "not reached";
    } catch (e) {
        return "caught rejection";
    }
}
let asyncResult6 = "";
asyncTest6().then(function(v) {
    asyncResult6 = v;
});

// Promise with Computation
console.log("\n--- PROMISE WITH COMPUTATION ---");
let promiseTest8 = 0;
let p8 = new Promise(function(resolve, reject) {
    let sum = 0;
    for (let i = 1; i <= 10; i = i + 1) {
        sum = sum + i;
    }
    resolve(sum);
});
p8.then(function(v) {
    promiseTest8 = v;
});

// Async Function Returning Value
console.log("\n--- ASYNC RETURN VALUE ---");
async function asyncTest7() {
    let x = 5;
    let y = 10;
    return x + y;
}
let asyncResult7 = 0;
asyncTest7().then(function(v) {
    asyncResult7 = v;
});

// Wait for async operations to complete
setTimeout(function() {
    console.log("\n" + "=".repeat(70));
    console.log("CHECKING ASYNC RESULTS...");
    console.log("=".repeat(70));
    
    assert(promiseTest1 === 42, "Promise resolve");
    assert(promiseTest2 === 1, "Promise reject");
    assert(promiseTest3 === 100, "Promise.resolve");
    assert(promiseTest4 === 1, "Promise.reject");
    assert(promiseTest5 === 20, "Promise chaining");
    assert(promiseTest6 === 50, "Promise multiple then 1");
    assert(promiseTest7 === 60, "Promise multiple then 2");
    assert(promiseTest8 === 55, "Promise with computation");
    
    assert(asyncResult1 === 42, "Async function return");
    assert(asyncResult2 === 200, "Async with await");
    assert(asyncResult3 === 30, "Async multiple awaits");
    assert(asyncResult4 === 1, "Async error handling");
    assert(asyncResult5 === "caught", "Async try-catch");
    assert(asyncResult6 === "caught rejection", "Async await rejected");
    assert(asyncResult7 === 15, "Async return value");
    
    console.log("\n" + "=".repeat(70));
    console.log("RESULTS:");
    console.log("Tests Passed: " + testsPassed);
    console.log("Tests Failed: " + testsFailed);
    console.log("=".repeat(70));
}, 200);