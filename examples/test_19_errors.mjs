// ===================================================================
// TEST FILE 18: ERROR TYPES AND RUNTIME ERROR HANDLING
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 18: ERROR TYPES AND RUNTIME ERRORS");
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

// ===================================================================
// REFERENCE ERRORS
// ===================================================================
console.log("\n--- REFERENCE ERRORS ---");

let refError1 = false;
try {
    let x = undefinedVariable;
} catch (e) {
    refError1 = e.message.includes("not defined");
}
assert(refError1, "ReferenceError for undefined variable");

let refError2 = false;
try {
    someFunction();
} catch (e) {
    refError2 = e.message.includes("not defined");
}
assert(refError2, "ReferenceError for undefined function");

// ===================================================================
// TYPE ERRORS
// ===================================================================
console.log("\n--- TYPE ERRORS ---");

let typeError1 = false;
try {
    let notAFunction = 42;
    notAFunction();
} catch (e) {
    typeError1 = e.message.includes("non-function");
}
assert(typeError1, "TypeError for calling non-function");

let typeError2 = false;
try {
    const constVar = 10;
    constVar = 20;
} catch (e) {
    typeError2 = e.message.includes("const");
}
assert(typeError2, "TypeError for const reassignment");

// ===================================================================
// CUSTOM ERRORS
// ===================================================================
console.log("\n--- CUSTOM ERRORS ---");

let customErr1 = false;
let customMsg = "";
try {
    throw new Error("Custom error message");
} catch (e) {
    customErr1 = true;
    customMsg = e.message;
}
assert(customErr1, "Custom Error thrown");
assert(customMsg === "Custom error message", "Custom Error message");

// Error with different types
let customErr2 = false;
try {
    throw new Error("Validation failed");
} catch (e) {
    customErr2 = e.message === "Validation failed";
}
assert(customErr2, "Custom validation error");

// ===================================================================
// ERROR PROPERTIES
// ===================================================================
console.log("\n--- ERROR PROPERTIES ---");

let errorProp1 = false;
let errorProp2 = false;
try {
    throw new Error("Test message");
} catch (e) {
    errorProp1 = e.message === "Test message";
    errorProp2 = typeof e.message === "string";
}
assert(errorProp1, "Error has message property");
assert(errorProp2, "Error message is string");

// ===================================================================
// NESTED TRY-CATCH
// ===================================================================
console.log("\n--- NESTED TRY-CATCH ---");

let nestedError = 0;
try {
    try {
        throw new Error("inner");
    } catch (inner) {
        nestedError = 1;
        throw new Error("outer");
    }
} catch (outer) {
    nestedError = 2;
}
assert(nestedError === 2, "Nested try-catch execution order");

// ===================================================================
// TRY-CATCH-FINALLY EXECUTION ORDER
// ===================================================================
console.log("\n--- TRY-CATCH-FINALLY EXECUTION ORDER ---");

let executionOrder = "";
try {
    executionOrder = executionOrder + "try";
    throw new Error("test");
} catch (e) {
    executionOrder = executionOrder + "-catch";
} finally {
    executionOrder = executionOrder + "-finally";
}
assert(executionOrder === "try-catch-finally", "Try-catch-finally order");

let finallyOrder = "";
try {
    finallyOrder = finallyOrder + "try";
} finally {
    finallyOrder = finallyOrder + "-finally";
}
assert(finallyOrder === "try-finally", "Try-finally order (no error)");

// ===================================================================
// ERROR IN FUNCTIONS
// ===================================================================
console.log("\n--- ERRORS IN FUNCTIONS ---");

function throwingFunction() {
    throw new Error("Function error");
}

let funcError = false;
try {
    throwingFunction();
} catch (e) {
    funcError = e.message === "Function error";
}
assert(funcError, "Error thrown from function");

// Error in nested function calls
function outer() {
    function inner() {
        throw new Error("Nested error");
    }
    return inner();
}

let nestedFuncError = false;
try {
    outer();
} catch (e) {
    nestedFuncError = e.message === "Nested error";
}
assert(nestedFuncError, "Error from nested function");

// ===================================================================
// ERROR RETHROWING
// ===================================================================
console.log("\n--- ERROR RETHROWING ---");

let rethrowTest = 0;
try {
    try {
        throw new Error("original");
    } catch (e) {
        rethrowTest = 1;
        throw e;
    }
} catch (e) {
    rethrowTest = 2;
}
assert(rethrowTest === 2, "Error rethrowing");

// ===================================================================
// ERRORS WITH DIFFERENT DATA TYPES
// ===================================================================
console.log("\n--- THROW DIFFERENT TYPES ---");

let stringThrow = false;
try {
    throw "string error";
} catch (e) {
    stringThrow = e === "string error";
}
assert(stringThrow, "Throw string");

let numberThrow = false;
try {
    throw 404;
} catch (e) {
    numberThrow = e === 404;
}
assert(numberThrow, "Throw number");

let objectThrow = false;
try {
    throw { code: 500, message: "Server error" };
} catch (e) {
    objectThrow = e.code === 500;
}
assert(objectThrow, "Throw object");

// ===================================================================
// FINALLY WITHOUT CATCH
// ===================================================================
console.log("\n--- FINALLY WITHOUT CATCH ---");

let finallyOnly = 0;
try {
    finallyOnly = 1;
} finally {
    finallyOnly = 2;
}
assert(finallyOnly === 2, "Finally without catch");

// ===================================================================
// MULTIPLE CATCH PATTERNS
// ===================================================================
console.log("\n--- MULTIPLE ERROR HANDLING ---");

function testErrorType(errorType) {
    try {
        if (errorType === "reference") {
            let x = undefinedVar;
        } else if (errorType === "custom") {
            throw new Error("Custom");
        }
    } catch (e) {
        return e.message;
    }
    return "no error";
}

assert(testErrorType("reference").includes("not defined"), "Handle ReferenceError");
assert(testErrorType("custom") === "Custom", "Handle custom Error");
assert(testErrorType("none") === "no error", "No error case");

// ===================================================================
// RESULTS
// ===================================================================
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
