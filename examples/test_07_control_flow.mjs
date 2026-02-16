// ===================================================================
// TEST FILE 7: CONTROL FLOW (IF/ELSE, LOOPS)
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 7: CONTROL FLOW");
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

// Basic If Statement
console.log("\n--- IF STATEMENT ---");
let ifTest1 = 0;
if (true) {
    ifTest1 = 1;
}
assert(ifTest1 === 1, "if statement (true condition)");

let ifTest2 = 0;
if (false) {
    ifTest2 = 1;
}
assert(ifTest2 === 0, "if statement (false condition)");

// If-Else Statement
console.log("\n--- IF-ELSE STATEMENT ---");
let ifElseTest1 = 0;
if (true) {
    ifElseTest1 = 1;
} else {
    ifElseTest1 = 2;
}
assert(ifElseTest1 === 1, "if-else (true branch)");

let ifElseTest2 = 0;
if (false) {
    ifElseTest2 = 1;
} else {
    ifElseTest2 = 2;
}
assert(ifElseTest2 === 2, "if-else (else branch)");

// If-Else If-Else
console.log("\n--- IF-ELSE IF-ELSE ---");
let ifElseIfTest1 = 0;
if (false) {
    ifElseIfTest1 = 1;
} else if (true) {
    ifElseIfTest1 = 2;
} else {
    ifElseIfTest1 = 3;
}
assert(ifElseIfTest1 === 2, "if-else if-else (else if branch)");

let ifElseIfTest2 = 0;
if (false) {
    ifElseIfTest2 = 1;
} else if (false) {
    ifElseIfTest2 = 2;
} else {
    ifElseIfTest2 = 3;
}
assert(ifElseIfTest2 === 3, "if-else if-else (else branch)");

// Nested If
console.log("\n--- NESTED IF ---");
let nestedIfTest = 0;
if (true) {
    if (true) {
        nestedIfTest = 1;
    }
}
assert(nestedIfTest === 1, "nested if (both true)");

let nestedIfTest2 = 0;
if (true) {
    if (false) {
        nestedIfTest2 = 1;
    } else {
        nestedIfTest2 = 2;
    }
}
assert(nestedIfTest2 === 2, "nested if-else");

// While Loop
console.log("\n--- WHILE LOOP ---");
let whileSum = 0;
let i = 1;
while (i <= 5) {
    whileSum = whileSum + i;
    i = i + 1;
}
assert(whileSum === 15, "while loop sum");

let whileCount = 0;
let j = 0;
while (j < 10) {
    whileCount = whileCount + 1;
    j = j + 1;
}
assert(whileCount === 10, "while loop count");

// For Loop
console.log("\n--- FOR LOOP ---");
let forSum = 0;
for (let k = 1; k <= 5; k = k + 1) {
    forSum = forSum + k;
}
assert(forSum === 15, "for loop sum");

let forProduct = 1;
for (let m = 1; m <= 5; m = m + 1) {
    forProduct = forProduct * m;
}
assert(forProduct === 120, "for loop product");

// Break Statement
console.log("\n--- BREAK STATEMENT ---");
let breakTest = 0;
for (let n = 0; n < 10; n = n + 1) {
    if (n === 5) break;
    breakTest = breakTest + 1;
}
assert(breakTest === 5, "break in for loop");

let breakWhile = 0;
let p = 0;
while (p < 100) {
    if (p === 10) break;
    breakWhile = breakWhile + 1;
    p = p + 1;
}
assert(breakWhile === 10, "break in while loop");

// Continue Statement
console.log("\n--- CONTINUE STATEMENT ---");
let continueTest = 0;
for (let q = 0; q < 10; q = q + 1) {
    if (q % 2 === 0) continue;
    continueTest = continueTest + 1;
}
assert(continueTest === 5, "continue in for loop");

let continueSum = 0;
for (let r = 1; r <= 10; r = r + 1) {
    if (r === 5) continue;
    continueSum = continueSum + r;
}
assert(continueSum === 50, "continue skips one iteration");

// Nested Loops
console.log("\n--- NESTED LOOPS ---");
let nestedSum = 0;
for (let s = 1; s <= 3; s = s + 1) {
    for (let t = 1; t <= 3; t = t + 1) {
        nestedSum = nestedSum + 1;
    }
}
assert(nestedSum === 9, "nested loops count");

let nestedProduct = 1;
for (let u = 1; u <= 2; u = u + 1) {
    for (let v = 1; v <= 3; v = v + 1) {
        nestedProduct = nestedProduct * 2;
    }
}
assert(nestedProduct === 64, "nested loops product");

// Break in Nested Loop
console.log("\n--- BREAK IN NESTED LOOP ---");
let breakNested = 0;
for (let w = 0; w < 5; w = w + 1) {
    for (let x = 0; x < 5; x = x + 1) {
        if (x === 3) break;
        breakNested = breakNested + 1;
    }
}
assert(breakNested === 15, "break in nested loop");

// Complex Loop Logic
// Complex Loop Logic
console.log("\n--- COMPLEX LOOP LOGIC ---");
let complexSum = 0;
for (let y = 0; y < 20; y = y + 1) {
    if (y < 5) continue;
    if (y > 15) break;
    if (y % 2 === 0) {
        complexSum = complexSum + y;
    }
}
assert(complexSum === 50, "complex loop with continue and break");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
