// ===================================================================
// TEST FILE 3: ARRAYS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 3: ARRAYS");
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

// Array Creation and Access
console.log("\n--- ARRAY CREATION AND ACCESS ---");
let arr1 = [1, 2, 3, 4, 5];
let arr2 = [];
let arr3 = [1, "two", true, null];

assert(arr1.length === 5, "Array length");
assert(arr1[0] === 1, "Array indexing [0]");
assert(arr1[4] === 5, "Array last element");
assert(arr3[1] === "two", "Mixed type array");

// Array Modification
console.log("\n--- ARRAY MODIFICATION ---");
arr1[2] = 99;
assert(arr1[2] === 99, "Array element modification");

// Push and Pop
console.log("\n--- PUSH AND POP ---");
let pushArr = [];
pushArr.push(10);
assert(pushArr.length === 1 && pushArr[0] === 10, "push single element");
pushArr.push(20);
pushArr.push(30);
assert(pushArr.length === 3, "multiple push");

let popped = pushArr.pop();
assert(popped === 30, "pop returns last element");
assert(pushArr.length === 2, "pop reduces length");

// Unshift and Shift
console.log("\n--- UNSHIFT AND SHIFT ---");
let shiftArr = [2, 3, 4];
shiftArr.unshift(1);
assert(shiftArr[0] === 1, "unshift adds to front");
assert(shiftArr.length === 4, "unshift increases length");

let shifted = shiftArr.shift();
assert(shifted === 1, "shift returns first element");
assert(shiftArr.length === 3, "shift reduces length");

// Join
console.log("\n--- JOIN ---");
let joinArr = [1, 2, 3];
assert(joinArr.join(",") === "1,2,3", "join with comma");
assert(joinArr.join("-") === "1-2-3", "join with dash");
assert(joinArr.join("") === "123", "join with empty string");

// Concat
console.log("\n--- CONCAT ---");
let concat1 = [1, 2, 3].concat([4, 5]);
assert(concat1.length === 5, "concat length");
assert(concat1[3] === 4 && concat1[4] === 5, "concat elements");

// Slice
console.log("\n--- SLICE ---");
let sliceArr = [1, 2, 3, 4, 5];
let sliced = sliceArr.slice(1, 4);
assert(sliced.length === 3, "slice length");
assert(sliced[0] === 2 && sliced[2] === 4, "slice content");
assert(sliceArr.length === 5, "slice doesn't modify original");

// Includes and IndexOf
console.log("\n--- INCLUDES AND INDEXOF ---");
let searchArr = [1, 2, 3, 4, 5];
assert(searchArr.includes(3), "includes (true)");
assert(!searchArr.includes(10), "includes (false)");
assert(searchArr.indexOf(3) === 2, "indexOf found");
assert(searchArr.indexOf(10) === -1, "indexOf not found");

// Reverse
console.log("\n--- REVERSE ---");
let revArr = [1, 2, 3, 4, 5];
revArr.reverse();
assert(revArr[0] === 5 && revArr[4] === 1, "reverse modifies array");

// Fill
console.log("\n--- FILL ---");
let fillArr = [1, 2, 3, 4, 5];
fillArr.fill(0, 1, 4);
assert(fillArr[0] === 1, "fill doesn't affect before start");
assert(fillArr[1] === 0 && fillArr[2] === 0 && fillArr[3] === 0, "fill range");
assert(fillArr[4] === 5, "fill doesn't affect after end");

// Empty Array Operations
console.log("\n--- EMPTY ARRAY OPERATIONS ---");
let emptyArr = [];
assert(emptyArr.length === 0, "Empty array length");
assert(emptyArr.pop() === undefined, "Pop from empty array");
assert(emptyArr.shift() === undefined, "Shift from empty array");

// Nested Arrays
console.log("\n--- NESTED ARRAYS ---");
let nested = [[1, 2], [3, 4], [5, 6]];
assert(nested.length === 3, "Nested array outer length");
assert(nested[0][0] === 1, "Nested array access [0][0]");
assert(nested[2][1] === 6, "Nested array access [2][1]");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
