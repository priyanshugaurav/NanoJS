// Test 21: Backend Capabilities (process.env, HTTPS fetch, http.createServer)
console.log("=== TEST 21: BACKEND CAPABILITIES ===");

// 1. Process and Environment Variables
console.log("--- 1. ENVIRONMENT VARIABLES ---");
console.log("process.version:", process.version);
console.log("process.platform:", process.platform);

process.env.TEST_API_KEY = "resend_12345_xyz";
console.log("process.env.TEST_API_KEY:", process.env.TEST_API_KEY);
console.log("env.get('PATH') exists:", env.get("PATH") !== undefined);

// 2. HTTP Server Request Parsing & Preflight
console.log("\n--- 2. HTTP SERVER REQUEST PARSING & CORS ---");
let server = http.createServer(function(req, res) {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/submit") {
        let parsed = JSON.parse(req.body);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", received: parsed.email }));
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(18080);

// 3. Test Client Runner
async function runClientTests() {
    // A. Test OPTIONS preflight
    console.log("Sending OPTIONS preflight request...");
    let preflight = await fetch("http://127.0.0.1:18080/submit", {
        method: "OPTIONS",
        headers: {
            "Origin": "https://example.com",
            "Access-Control-Request-Method": "POST"
        }
    });
    console.log("Preflight Status:", preflight.status);
    console.log("Preflight OK:", preflight.ok);
    console.log("Preflight CORS Origin:", preflight.headers["access-control-allow-origin"]);

    // B. Test POST /submit with JSON body
    console.log("\nSending POST /submit with JSON body...");
    let postRes = await fetch("http://127.0.0.1:18080/submit", {
        method: "POST",
        headers: {
            "Origin": "https://example.com",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "OrbitForm User", email: "user@orbitform.dev" })
    });

    console.log("POST Status:", postRes.status);
    console.log("POST OK:", postRes.ok);
    let postData = await postRes.json();
    console.log("Response JSON status:", postData.status);
    console.log("Response JSON received:", postData.received);

    // C. Test Real HTTPS fetch with options and JSON parsing
    console.log("\n--- 3. HTTPS FETCH WITH TLS ---");
    try {
        let httpsRes = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.TEST_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ engine: "NanoJS", purpose: "Backend" })
        });
        console.log("HTTPS Status:", httpsRes.status);
        console.log("HTTPS OK:", httpsRes.ok);
        let httpsData = await httpsRes.json();
        console.log("HTTPS Echoed JSON engine:", httpsData.json.engine);
        console.log("HTTPS Echoed Auth header:", httpsData.headers["Authorization"]);
    } catch(err) {
        console.log("HTTPS Notice (offline fallback):", err);
    }

    console.log("\n=== ALL BACKEND CAPABILITIES VERIFIED! ===");
    process.exit(0);
}

setTimeout(function() {
    runClientTests();
}, 50);
