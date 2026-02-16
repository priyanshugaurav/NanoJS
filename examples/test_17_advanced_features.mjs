// ===================================================================
// TEST FILE 16: DESTRUCTURING AND ADVANCED FEATURES
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 16: DESTRUCTURING AND ADVANCED FEATURES");
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
// OBJECT DESTRUCTURING
// ===================================================================
console.log("\n--- OBJECT DESTRUCTURING ---");

let obj1 = { name: "Alice", age: 25, city: "NYC" };
let { name, age, city } = obj1;

assert(name === "Alice", "Destructure name");
assert(age === 25, "Destructure age");
assert(city === "NYC", "Destructure city");

// Multiple destructuring
let person1 = { firstName: "John", lastName: "Doe", profession: "Engineer" };
let { firstName, lastName, profession } = person1;

assert(firstName === "John", "Destructure firstName");
assert(lastName === "Doe", "Destructure lastName");
assert(profession === "Engineer", "Destructure profession");

// Nested object destructuring
let nested = { 
    user: { 
        id: 1, 
        profile: { username: "alice123" } 
    } 
};
let { user } = nested;
assert(user.id === 1, "Destructure nested object");
assert(user.profile.username === "alice123", "Access nested destructured property");

// ===================================================================
// REST PARAMETERS
// ===================================================================
console.log("\n--- REST PARAMETERS ---");

function sum(...numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i = i + 1) {
        total = total + numbers[i];
    }
    return total;
}

assert(sum(1, 2, 3) === 6, "Rest parameters: 3 args");
assert(sum(1, 2, 3, 4, 5) === 15, "Rest parameters: 5 args");
assert(sum() === 0, "Rest parameters: no args");
assert(sum(10) === 10, "Rest parameters: 1 arg");

function firstAndRest(first, ...rest) {
    return first + rest.length; 
}

assert(firstAndRest(1, 2, 3, 4) === 4, "Mixed params + rest");
assert(firstAndRest(5) === 5, "Mixed params + rest (no rest args)");

// ===================================================================
// SWITCH STATEMENTS
// ===================================================================
console.log("\n--- SWITCH STATEMENTS ---");

function testSwitch(value) {
    let result = "";
    switch(value) {
        case 1:
            result = "one";
            break;
        case 2:
            result = "two";
            break;
        case 3:
            result = "three";
            break;
        default:
            result = "other";
    }
    return result;
}

assert(testSwitch(1) === "one", "Switch case 1");
assert(testSwitch(2) === "two", "Switch case 2");
assert(testSwitch(3) === "three", "Switch case 3");
assert(testSwitch(99) === "other", "Switch default");

// Switch with fallthrough
function testFallthrough(value) {
    let result = "";
    switch(value) {
        case 1:
        case 2:
            result = "one or two";
            break;
        case 3:
            result = "three";
            break;
        default:
            result = "other";
    }
    return result;
}

assert(testFallthrough(1) === "one or two", "Switch fallthrough case 1");
assert(testFallthrough(2) === "one or two", "Switch fallthrough case 2");
assert(testFallthrough(3) === "three", "Switch no fallthrough");

// Switch with strings
function colorSwitch(color) {
    let result = "";
    switch(color) {
        case "red":
            result = "stop";
            break;
        case "yellow":
            result = "slow";
            break;
        case "green":
            result = "go";
            break;
        default:
            result = "unknown";
    }
    return result;
}

assert(colorSwitch("red") === "stop", "Switch string: red");
assert(colorSwitch("green") === "go", "Switch string: green");
assert(colorSwitch("blue") === "unknown", "Switch string: default");

// ===================================================================
// DO-WHILE LOOPS
// ===================================================================
console.log("\n--- DO-WHILE LOOPS ---");

let doCount = 0;
do {
    doCount = doCount + 1;
} while (doCount < 5);
assert(doCount === 5, "Do-while loop");

// Do-while executes at least once
let doOnce = 0;
do {
    doOnce = doOnce + 1;
} while (false);
assert(doOnce === 1, "Do-while executes once even if false");

// ===================================================================
// FOR-OF LOOPS
// ===================================================================
console.log("\n--- FOR-OF LOOPS ---");

let forOfSum = 0;
for (let num of [1, 2, 3, 4, 5]) {
    forOfSum = forOfSum + num;
}
assert(forOfSum === 15, "For-of with array");

let forOfStr = "";
for (let char of "hello") {
    forOfStr = forOfStr + char;
}
assert(forOfStr === "hello", "For-of with string");

// For-of with const
let forOfConst = 0;
for (const val of [10, 20, 30]) {
    forOfConst = forOfConst + val;
}
assert(forOfConst === 60, "For-of with const");

// ===================================================================
// ARROW FUNCTIONS
// ===================================================================
console.log("\n--- ARROW FUNCTIONS ---");

let arrow1 = (x) => x * 2;
assert(arrow1(5) === 10, "Arrow function single param");

let arrow2 = (a, b) => a + b;
assert(arrow2(3, 4) === 7, "Arrow function multiple params");

let arrow3 = () => 42;
assert(arrow3() === 42, "Arrow function no params");

let arrow4 = (x) => {
    let result = x * 2;
    return result + 1;
};
assert(arrow4(5) === 11, "Arrow function with block body");

// Arrow function implicit return
let arrow5 = (x) => x + 10;
assert(arrow5(5) === 15, "Arrow implicit return");

// ===================================================================
// BITWISE OPERATORS
// ===================================================================
console.log("\n--- BITWISE OPERATORS ---");

assert((5 & 3) === 1, "Bitwise AND");
assert((5 | 3) === 7, "Bitwise OR");
assert((5 ^ 3) === 6, "Bitwise XOR");
assert((~5) === -6, "Bitwise NOT");
assert((5 << 1) === 10, "Left shift");
assert((10 >> 1) === 5, "Right shift");

// Complex bitwise operations
assert((12 & 10) === 8, "Bitwise AND complex");
assert((12 | 10) === 14, "Bitwise OR complex");
assert((8 << 2) === 32, "Left shift by 2");

// ===================================================================
// CLASSES
// ===================================================================
console.log("\n--- CLASSES ---");

class Animal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return "Animal speaks";
    }
    
    getName() {
        return this.name;
    }
}

let animal1 = new Animal("Generic");
assert(animal1.getName() === "Generic", "Class constructor and method");
assert(animal1.speak() === "Animal speaks", "Class method");

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
    
    speak() {
        return "Woof!";
    }
    
    getBreed() {
        return this.breed;
    }
}

let dog1 = new Dog("Buddy", "Golden Retriever");
assert(dog1.getName() === "Buddy", "Class inheritance: parent method");
assert(dog1.speak() === "Woof!", "Class inheritance: override method");
assert(dog1.getBreed() === "Golden Retriever", "Class inheritance: child method");

// ===================================================================
// POSTFIX INCREMENT/DECREMENT
// ===================================================================
console.log("\n--- POSTFIX INCREMENT/DECREMENT ---");

let post1 = 5;
let post2 = post1++;
assert(post2 === 5, "Postfix increment returns old value");
assert(post1 === 6, "Postfix increment updates variable");

let post3 = 10;
let post4 = post3--;
assert(post4 === 10, "Postfix decrement returns old value");
assert(post3 === 9, "Postfix decrement updates variable");

// PREFIX INCREMENT/DECREMENT
console.log("\n--- PREFIX INCREMENT/DECREMENT ---");

let pre1 = 5;
let pre2 = ++pre1;
assert(pre2 === 6, "Prefix increment returns new value");
assert(pre1 === 6, "Prefix increment updates variable");

let pre3 = 10;
let pre4 = --pre3;
assert(pre4 === 9, "Prefix decrement returns new value");
assert(pre3 === 9, "Prefix decrement updates variable");

// ===================================================================
// EXPONENTIATION OPERATOR
// ===================================================================
console.log("\n--- EXPONENTIATION OPERATOR ---");

assert(2 ** 3 === 8, "Exponentiation 2^3");
assert(5 ** 2 === 25, "Exponentiation 5^2");
assert(10 ** 0 === 1, "Exponentiation to power 0");
assert(2 ** 10 === 1024, "Exponentiation large");

// Precedence test
assert(2 ** 3 ** 2 === 512, "Exponentiation right associativity");
assert((2 ** 3) ** 2 === 64, "Exponentiation with parentheses");

// ===================================================================
// RESULTS
// ===================================================================
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
