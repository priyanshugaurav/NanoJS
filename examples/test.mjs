// server.mjs
const PORT = 8080;

// Create the server
let server = http.createServer(function(req, res) {
    console.log("Request received: " + req.method + " " + req.url);

    // Write headers (optional, but good practice)
    res.setHeader("Content-Type", "text/plain");
    
    // Send data and end the response
    res.end("Hello from NanoJS Server!");
});

// Start listening
server.listen(PORT, function() {
    console.log("Server is running on http://localhost:" + PORT);
});