// ===================================================================
// TEST FILE 5: OBJECTS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 5: OBJECTS");
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

// Object Creation and Access
console.log("\n--- OBJECT CREATION AND ACCESS ---");
let obj1 = { name: "John", age: 30, city: "NYC" };
assert(obj1.name === "John", "Object property access (dot notation)");
assert(obj1["age"] === 30, "Object property access (bracket notation)");
assert(obj1.city === "NYC", "Object multiple properties");

// Property Addition
console.log("\n--- PROPERTY ADDITION ---");
obj1.country = "USA";
assert(obj1.country === "USA", "Add property with dot notation");

obj1["zipcode"] = "10001";
assert(obj1["zipcode"] === "10001", "Add property with bracket notation");

// Property Modification
console.log("\n--- PROPERTY MODIFICATION ---");
obj1.age = 31;
assert(obj1.age === 31, "Modify property");

obj1["city"] = "LA";
assert(obj1.city === "LA", "Modify property with bracket");

// Object.keys
console.log("\n--- OBJECT.KEYS ---");
let keys = Object.keys(obj1);
assert(keys.length === 5, "Object.keys length");
assert(keys.includes("name"), "Object.keys includes name");
assert(keys.includes("age"), "Object.keys includes age");

// Object.values
console.log("\n--- OBJECT.VALUES ---");
let values = Object.values(obj1);
assert(values.length === 5, "Object.values length");
assert(values.includes("John"), "Object.values includes John");
assert(values.includes(31), "Object.values includes age");

// Object.entries
console.log("\n--- OBJECT.ENTRIES ---");
let entries = Object.entries(obj1);
assert(entries.length === 5, "Object.entries length");
assert(entries[0].length === 2, "Object.entries returns pairs");

// Object.assign
console.log("\n--- OBJECT.ASSIGN ---");
let obj2 = { x: 1, y: 2 };
let obj3 = { y: 3, z: 4 };
let merged = Object.assign(obj2, obj3);
assert(merged.x === 1, "Object.assign preserves first object props");
assert(merged.y === 3, "Object.assign overwrites duplicate props");
assert(merged.z === 4, "Object.assign adds new props");

// Nested Objects
console.log("\n--- NESTED OBJECTS ---");
let nested = {
    outer: {
        inner: {
            value: 42
        }
    }
};
assert(nested.outer.inner.value === 42, "Nested object access");

nested.outer.inner.value = 100;
assert(nested.outer.inner.value === 100, "Nested object modification");

// Arrays of Objects
console.log("\n--- ARRAYS OF OBJECTS ---");
let people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
    { name: "Charlie", age: 35 }
];
assert(people.length === 3, "Array of objects length");
assert(people[1].name === "Bob", "Access object in array");
assert(people[2].age === 35, "Access nested property");

// Object with Array Properties
console.log("\n--- OBJECT WITH ARRAY PROPERTIES ---");
let objWithArray = {
    name: "Team",
    members: ["Alice", "Bob", "Charlie"]
};
assert(objWithArray.members.length === 3, "Object array property length");
assert(objWithArray.members[0] === "Alice", "Access array in object");

// Empty Object
console.log("\n--- EMPTY OBJECT ---");
let emptyObj = {};
assert(Object.keys(emptyObj).length === 0, "Empty object has no keys");
emptyObj.prop = "value";
assert(emptyObj.prop === "value", "Add property to empty object");

// Dynamic Property Names
console.log("\n--- DYNAMIC PROPERTY NAMES ---");
let dynamicKey = "dynamicProp";
let dynObj = {};
dynObj[dynamicKey] = "dynamic value";
assert(dynObj.dynamicProp === "dynamic value", "Dynamic property name");

// Undefined Property Access
console.log("\n--- UNDEFINED PROPERTY ACCESS ---");
let obj4 = { a: 1 };
assert(obj4.nonexistent === undefined, "Access undefined property");

// Complex Object
console.log("\n--- COMPLEX OBJECT ---");
let complex = {
    id: 1,
    data: {
        users: [
            { name: "Alice", scores: [90, 85, 88] },
            { name: "Bob", scores: [75, 80, 82] }
        ]
    }
};
assert(complex.data.users[0].name === "Alice", "Complex nested access 1");
assert(complex.data.users[1].scores[2] === 82, "Complex nested access 2");

// Results
console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
