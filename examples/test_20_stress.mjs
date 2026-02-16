// ===================================================================
// TEST FILE 19: STRESS TEST - COMPLEX COMBINATIONS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 19: STRESS TEST - COMPLEX SCENARIOS");
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
// COMPLEX NESTED STRUCTURES
// ===================================================================
console.log("\n--- COMPLEX NESTED STRUCTURES ---");

let complex1 = {
    users: [
        {
            id: 1,
            profile: {
                name: "Alice",
                settings: {
                    theme: "dark",
                    notifications: true
                }
            },
            posts: [
                { id: 101, title: "First post" },
                { id: 102, title: "Second post" }
            ]
        },
        {
            id: 2,
            profile: {
                name: "Bob",
                settings: {
                    theme: "light",
                    notifications: false
                }
            },
            posts: []
        }
    ]
};

assert(complex1.users[0].profile.name === "Alice", "Deep nested object access 1");
assert(complex1.users[0].posts[1].title === "Second post", "Deep nested array in object");
assert(complex1.users[1].profile.settings.theme === "light", "Deep nested settings");

// ===================================================================
// COMPLEX FUNCTION COMPOSITIONS
// ===================================================================
console.log("\n--- COMPLEX FUNCTION COMPOSITIONS ---");

function compose(f, g) {
    return function(x) {
        return f(g(x));
    };
}

function add10(x) { return x + 10; }
function multiply2(x) { return x * 2; }

let composed = compose(add10, multiply2);
assert(composed(5) === 20, "Function composition");

// Triple composition
function compose3(f, g, h) {
    return function(x) {
        return f(g(h(x)));
    };
}

let triple = compose3(add10, multiply2, function(x) { return x + 1; });
assert(triple(5) === 22, "Triple composition");

// ===================================================================
// CLOSURE STRESS TEST
// ===================================================================
console.log("\n--- CLOSURE STRESS TEST ---");

function makeMultiplierFactory(base) {
    return function(factor) {
        return function(value) {
            return base * factor * value;
        };
    };
}

let factory = makeMultiplierFactory(2);
let multiplier = factory(3);
assert(multiplier(4) === 24, "Triple nested closure");

// Array of closures
let closureArray = [];
for (let i = 0; i < 5; i = i + 1) {
    closureArray.push((function(n) {
        return function() { return n * n; };
    })(i));
}
assert(closureArray[0]() === 0, "Closure array [0]");
assert(closureArray[3]() === 9, "Closure array [3]");
assert(closureArray[4]() === 16, "Closure array [4]");

// ===================================================================
// ARRAY METHOD CHAINING STRESS
// ===================================================================
console.log("\n--- ARRAY METHOD CHAINING STRESS ---");

let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let complexChain = numbers
    .filter(function(x) { return x % 2 === 0; })
    .map(function(x) { return x * x; })
    .filter(function(x) { return x > 20; })
    .reduce(function(acc, x) { return acc + x; }, 0);

assert(complexChain === 200, "Complex chain: filter-map-filter-reduce");


let multiChain = [1, 2, 3, 4, 5]
    .map(function(x) { return x + 1; })
    .map(function(x) { return x * 2; })
    .map(function(x) { return x - 1; })
    .reduce(function(acc, x) { return acc + x; }, 0);

assert(multiChain === 35, "Multi-map chain");

// ===================================================================
// RECURSIVE ALGORITHMS STRESS
// ===================================================================
console.log("\n--- RECURSIVE ALGORITHMS STRESS ---");

// Deep recursion - Factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
assert(factorial(10) === 3628800, "Deep factorial recursion");

// Mutual recursion
function isEven(n) {
    if (n === 0) return true;
    return isOdd(n - 1);
}

function isOdd(n) {
    if (n === 0) return false;
    return isEven(n - 1);
}

assert(isEven(10), "Mutual recursion: even");
assert(isOdd(11), "Mutual recursion: odd");

// Tree recursion (Fibonacci)
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
assert(fib(15) === 610, "Tree recursion: Fibonacci(15)");

// ===================================================================
// OBJECT AND ARRAY MANIPULATION STRESS
// ===================================================================
console.log("\n--- OBJECT AND ARRAY MANIPULATION STRESS ---");

// Build complex structure programmatically
let dynamicStructure = { items: [] };
for (let i = 0; i < 10; i = i + 1) {
    dynamicStructure.items.push({
        id: i,
        value: i * i,
        nested: { depth: 1 }
    });
}

assert(dynamicStructure.items.length === 10, "Dynamic array construction");
assert(dynamicStructure.items[5].value === 25, "Dynamic array values");

// Transform the structure
let transformed = dynamicStructure.items
    .filter(function(item) { return item.id > 5; })
    .map(function(item) { return item.value; });

assert(transformed.length === 4, "Transformed array length");
assert(transformed[0] === 36, "Transformed values");

// ===================================================================
// MIXED CONTROL FLOW STRESS
// ===================================================================
console.log("\n--- MIXED CONTROL FLOW STRESS ---");

function complexControl(n) {
    let result = 0;
    
    for (let i = 0; i < n; i = i + 1) {
        if (i % 2 === 0) {
            let j = 0;
            while (j < i) {
                if (j === 3) {
                    j = j + 1;
                    continue;
                }
                result = result + 1;
                j = j + 1;
            }
        } else {
            for (let k = 0; k < i; k = k + 1) {
                if (k > 2) break;
                result = result + 2;
            }
        }
    }
    
    return result;
}

assert(complexControl(10) === 43, "Complex nested control flow");

// ===================================================================
// SCOPE COMPLEXITY
// ===================================================================
console.log("\n--- SCOPE COMPLEXITY ---");

let global = 1;

function scopeTest() {
    let local = 2;
    
    function inner1() {
        let innerLocal = 3;
        
        function deepest() {
            return global + local + innerLocal;
        }
        
        return deepest();
    }
    
    function inner2() {
        let innerLocal = 4;
        return global + local + innerLocal;
    }
    
    return inner1() + inner2();
}

assert(scopeTest() === 13, "Complex scope nesting");

// ===================================================================
// ERROR HANDLING IN COMPLEX SCENARIOS
// ===================================================================
console.log("\n--- ERROR HANDLING IN COMPLEX SCENARIOS ---");

function complexErrorHandling(data) {
    let result = [];
    
    for (let i = 0; i < data.length; i = i + 1) {
        try {
            if (data[i] < 0) {
                throw new Error("Negative value");
            }
            
            try {
                if (data[i] === 0) {
                    throw new Error("Zero value");
                }
                result.push(100 / data[i]);
            } catch (inner) {
                result.push(-1);
            }
        } catch (outer) {
            result.push(-2);
        }
    }
    
    return result;
}

let errorResult = complexErrorHandling([1, 0, -1, 2, 5]);
assert(errorResult[0] === 100, "Complex error: normal value");
assert(errorResult[1] === -1, "Complex error: inner catch");
assert(errorResult[2] === -2, "Complex error: outer catch");
assert(errorResult[3] === 50, "Complex error: normal after error");

// ===================================================================
// PROMISE CHAINING STRESS
// ===================================================================
console.log("\n--- PROMISE CHAINING STRESS ---");

let promiseChainResult = 0;

Promise.resolve(1)
    .then(function(v) { return v + 1; })
    .then(function(v) { return v * 2; })
    .then(function(v) { return v + 10; })
    .then(function(v) { 
        promiseChainResult = v;
    });

setTimeout(function() {
    assert(promiseChainResult === 14, "Long promise chain");
}, 100);

// ===================================================================
// MIXED ASYNC PATTERNS
// ===================================================================
console.log("\n--- MIXED ASYNC PATTERNS ---");

let asyncMixedResult = 0;

async function asyncComplex() {
    let p1 = Promise.resolve(10);
    let p2 = Promise.resolve(20);
    
    let v1 = await p1;
    let v2 = await p2;
    
    return v1 + v2;
}

asyncComplex().then(function(v) {
    asyncMixedResult = v;
});

setTimeout(function() {
    assert(asyncMixedResult === 30, "Mixed async/await");
}, 150);

// ===================================================================
// OBJECT PROTOTYPE CHAIN
// ===================================================================
console.log("\n--- OBJECT PROTOTYPE PATTERNS ---");

let proto = { sharedMethod: function() { return "shared"; } };
let obj1 = Object.assign({}, proto);
obj1.ownProp = "own";

assert(obj1.ownProp === "own", "Own property");
assert(obj1.sharedMethod() === "shared", "Inherited method");

// ===================================================================
// ARRAY OPERATIONS AT SCALE
// ===================================================================
console.log("\n--- ARRAY OPERATIONS AT SCALE ---");

let largeArray = [];
for (let i = 0; i < 100; i = i + 1) {
    largeArray.push(i);
}

let largeSum = largeArray.reduce(function(acc, x) { return acc + x; }, 0);
assert(largeSum === 4950, "Large array sum");

let largeFiltered = largeArray.filter(function(x) { return x % 10 === 0; });
assert(largeFiltered.length === 10, "Large array filter");

// ===================================================================
// WAIT FOR ASYNC TESTS
// ===================================================================
setTimeout(function() {
    console.log("\n" + "=".repeat(70));
    console.log("FINAL RESULTS:");
    console.log("Tests Passed: " + testsPassed);
    console.log("Tests Failed: " + testsFailed);
    console.log("=".repeat(70));
}, 200);
