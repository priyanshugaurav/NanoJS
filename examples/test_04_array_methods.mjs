// ===================================================================
// TEST FILE 4: ARRAY HIGHER-ORDER METHODS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 4: ARRAY HIGHER-ORDER METHODS");
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

let numbers = [1, 2, 3, 4, 5];

// Map
console.log("\n--- MAP ---");
let doubled = numbers.map(function(x) { return x * 2; });
assert(doubled.length === 5, "map preserves length");
assert(doubled[0] === 2, "map transforms first element");
assert(doubled[4] === 10, "map transforms last element");

let squared = numbers.map(function(x) { return x * x; });
assert(squared[2] === 9, "map squares");

// Filter
console.log("\n--- FILTER ---");
let evens = numbers.filter(function(x) { return x % 2 === 0; });
assert(evens.length === 2, "filter evens length");
assert(evens[0] === 2 && evens[1] === 4, "filter evens content");

let greaterThanThree = numbers.filter(function(x) { return x > 3; });
assert(greaterThanThree.length === 2, "filter greater than 3");

let allPass = numbers.filter(function(x) { return true; });
assert(allPass.length === 5, "filter with all true");

let nonePass = numbers.filter(function(x) { return false; });
assert(nonePass.length === 0, "filter with all false");

// Reduce
console.log("\n--- REDUCE ---");
let sum = numbers.reduce(function(acc, x) { return acc + x; }, 0);
assert(sum === 15, "reduce sum");

let product = numbers.reduce(function(acc, x) { return acc * x; }, 1);
assert(product === 120, "reduce product");

let max = numbers.reduce(function(acc, x) { return x > acc ? x : acc; }, 0);
assert(max === 5, "reduce max");

// ForEach
console.log("\n--- FOREACH ---");
let forEachSum = 0;
numbers.forEach(function(x) { forEachSum = forEachSum + x; });
assert(forEachSum === 15, "forEach sum");

let forEachCount = 0;
numbers.forEach(function(x) { forEachCount = forEachCount + 1; });
assert(forEachCount === 5, "forEach count");

// Find
console.log("\n--- FIND ---");
let found = numbers.find(function(x) { return x > 3; });
assert(found === 4, "find first element > 3");

let foundEven = numbers.find(function(x) { return x % 2 === 0; });
assert(foundEven === 2, "find first even");

let notFound = numbers.find(function(x) { return x > 10; });
assert(notFound === undefined, "find returns undefined when not found");

// FindIndex
console.log("\n--- FINDINDEX ---");
let foundIdx = numbers.findIndex(function(x) { return x > 3; });
assert(foundIdx === 3, "findIndex returns correct index");

let foundIdxEven = numbers.findIndex(function(x) { return x % 2 === 0; });
assert(foundIdxEven === 1, "findIndex first even");

let notFoundIdx = numbers.findIndex(function(x) { return x > 10; });
assert(notFoundIdx === -1, "findIndex returns -1 when not found");

// Some
console.log("\n--- SOME ---");
assert(numbers.some(function(x) { return x > 4; }), "some (true case 1)");
assert(numbers.some(function(x) { return x === 3; }), "some (true case 2)");
assert(!numbers.some(function(x) { return x > 10; }), "some (false)");
assert(!numbers.some(function(x) { return x < 0; }), "some (false negative)");

// Every
console.log("\n--- EVERY ---");
assert(numbers.every(function(x) { return x > 0; }), "every (true)");
assert(numbers.every(function(x) { return x <= 5; }), "every (true upper bound)");
assert(!numbers.every(function(x) { return x > 2; }), "every (false)");
assert(!numbers.every(function(x) { return x % 2 === 0; }), "every (false evens)");

// Chaining
console.log("\n--- CHAINING ---");
let chained = numbers
    .map(function(x) { return x * 2; })
    .filter(function(x) { return x > 5; })
    .reduce(function(a, b) { return a + b; }, 0);
assert(chained === 24, "chained map-filter-reduce");

let chained2 = numbers
    .filter(function(x) { return x % 2 === 0; })
    .map(function(x) { return x * x; });
assert(chained2.length === 2 && chained2[0] === 4 && chained2[1] === 16, "chained filter-map");

// Complex Callbacks
console.log("\n--- COMPLEX CALLBACKS ---");
let arr = [1, 2, 3, 4, 5];
let result = arr.map(function(x, index) {
    return x + index;
});
assert(result[0] === 1 && result[4] === 9, "map with index parameter");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
