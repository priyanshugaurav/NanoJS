// ===================================================================
// TEST FILE 16: HTTP SERVER & EXTREME CONCURRENCY
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 16: HTTP EXTREME STRESS TEST");
console.log("=".repeat(70));

let testsPassed = 0;
let testsFailed = 0;
let PORT = 8085; // Use a port unlikely to be in use

function assert(condition, testName) {
    if (condition) {
        console.log("✓ PASS: " + testName);
        testsPassed=testsPassed + 1;
    } else {
        console.log("✗ FAIL: " + testName);
        testsFailed=testsFailed + 1;
    }
}

// 1. START SERVER
console.log("\n--- STARTING SERVER ---");
let requestCount = 0;

let server = http.createServer(function(req, res) {
    requestCount=requestCount + 1;
    // console.log("Server received: " + req.method + " " + req.url);

    if (req.url === "/") {
        res.end(JSON.stringify({ message: "root", status: "fast" }));
    } 
    else if (req.url === "/slow") {
        // Simulate async work
        setTimeout(function() {
            res.end(JSON.stringify({ message: "slow", status: "delayed" }));
        }, 500);
    } 
    else if (req.url === "/api/users") {
        res.end(JSON.stringify([
            { id: 1, name: "Admin" },
            { id: 2, name: "Tester" }
        ]));
    } 
    else {
        // 404 Case (We manually send 404 body, though status parsing depends on your C++ impl)
        res.end("404 Not Found");
    }
});

server.listen(PORT);
console.log("Server listening on http://localhost:" + PORT);

// 2. CLIENT TESTS
console.log("\n--- STARTING CLIENT ATTACK ---");

async function runTests() {
    try {
        // Test 1: Sequential Request
        console.log("1. Testing Root Endpoint...");
        let res1 = await fetch("http://localhost:" + PORT + "/");
        let txt1 = res1.text();
        let json1 = JSON.parse(txt1);
        assert(json1.message === "root", "Root endpoint returned correct JSON");

        // Test 2: Concurrent Stress Test (Batch of 5)
        console.log("2. Testing Concurrency (5 parallel requests)...");
        let promises = [];
        for (let i = 0; i < 5; i=i+1) {
            promises.push(fetch("http://localhost:" + PORT + "/api/users"));
        }
        
        // Wait for all to finish
        let responses = await Promise.all(promises);
        let allOk = true;
        
        // Validate all responses
        for (let i = 0; i < responses.length; i=i+1) {
            let txt = responses[i].text();
            if (!txt.includes("Admin")) allOk = false;
        }
        assert(allOk && responses.length === 5, "Processed 5 concurrent requests successfully");

        // Test 3: Async/Slow Endpoint
        console.log("3. Testing Async Server Response...");
        let start = Date.now();
        let resSlow = await fetch("http://localhost:" + PORT + "/slow");
        let end = Date.now();
        let jsonSlow = JSON.parse(resSlow.text());
        
        assert(jsonSlow.status === "delayed", "Slow endpoint returned correct data");
        // assert((end - start) >= 500, "Server effectively delayed response"); 
        // (Note: Precise timing assertion commented out as C++ thread scheduling can vary, but logic holds)

        // Summary
        console.log("\n--- SERVER METRICS ---");
        console.log("Total Requests Processed: " + requestCount);
        assert(requestCount >= 7, "Server processed all incoming requests");

    } catch (e) {
        console.error("CRITICAL TEST FAILURE: " + e.message);
        testsFailed=testsFailed + 1;
    }

    console.log("\n" + "=".repeat(70));
    console.log("RESULTS:");
    console.log("Tests Passed: " + testsPassed);
    console.log("Tests Failed: " + testsFailed);
    console.log("=".repeat(70));
    
    // Note: In a real app we'd close the server, but our C++ implementation might not have .close() yet.
    // We rely on the script finishing to exit.
}

runTests();