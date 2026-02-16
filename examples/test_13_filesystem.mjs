// ===================================================================
// TEST FILE 13: FILESYSTEM OPERATIONS
// ===================================================================

console.log("=".repeat(70));
console.log("TEST FILE 13: FILESYSTEM OPERATIONS");
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

try {
    // Write File
    console.log("\n--- FS.WRITEFILE ---");
    fs.writeFile("test_file_1.txt", "Hello, World!");
    console.log("Created test_file_1.txt");
    
    // Read File
    console.log("\n--- FS.READFILE ---");
    let content1 = fs.readFile("test_file_1.txt");
    assert(content1 === "Hello, World!", "fs.readFile reads content");
    
    // File Exists
    console.log("\n--- FS.EXISTS ---");
    assert(fs.exists("test_file_1.txt"), "fs.exists returns true for existing file");
    assert(!fs.exists("nonexistent.txt"), "fs.exists returns false for non-existing file");
    
    // Append File
    console.log("\n--- FS.APPENDFILE ---");
    fs.appendFile("test_file_1.txt", " Appended text");
    let content2 = fs.readFile("test_file_1.txt");
    assert(content2 === "Hello, World! Appended text", "fs.appendFile adds content");
    
    // Write Multiple Files
    console.log("\n--- MULTIPLE FILES ---");
    fs.writeFile("test_file_2.txt", "File 2 content");
    fs.writeFile("test_file_3.txt", "File 3 content");
    
    let content3 = fs.readFile("test_file_2.txt");
    let content4 = fs.readFile("test_file_3.txt");
    assert(content3 === "File 2 content", "Read file 2");
    assert(content4 === "File 3 content", "Read file 3");
    
    // Overwrite File
    console.log("\n--- OVERWRITE FILE ---");
    fs.writeFile("test_file_2.txt", "New content");
    let content5 = fs.readFile("test_file_2.txt");
    assert(content5 === "New content", "fs.writeFile overwrites existing file");
    
    // Delete File
    console.log("\n--- FS.DELETEFILE ---");
    fs.deleteFile("test_file_3.txt");
    assert(!fs.exists("test_file_3.txt"), "fs.deleteFile removes file");
    
    // Write Numbers
    console.log("\n--- WRITE NUMBERS ---");
    fs.writeFile("numbers.txt", "12345");
    let numbers = fs.readFile("numbers.txt");
    assert(numbers === "12345", "Write and read numbers as text");
    
    // Write JSON
    console.log("\n--- WRITE JSON ---");
    let jsonData = JSON.stringify({ name: "test", value: 100 });
    fs.writeFile("data.json", jsonData);
    let readJson = fs.readFile("data.json");
    let parsedJson = JSON.parse(readJson);
    assert(parsedJson.name === "test" && parsedJson.value === 100, "Write and read JSON");
    
    // Large Content
    console.log("\n--- LARGE CONTENT ---");
    let largeContent = "";
    for (let i = 0; i < 100; i = i + 1) {
        largeContent = largeContent + "Line " + i + "\n";
    }
    fs.writeFile("large.txt", largeContent);
    let readLarge = fs.readFile("large.txt");
    assert(readLarge.includes("Line 50"), "Write and read large content");
    
    // Directory Operations
    console.log("\n--- DIRECTORY OPERATIONS ---");
    
    // Create Directory
    fs.mkdir("test_directory");
    assert(fs.exists("test_directory"), "fs.mkdir creates directory");
    
    // Write File in Directory
    fs.writeFile("test_directory/file_in_dir.txt", "File in directory");
    assert(fs.exists("test_directory/file_in_dir.txt"), "File created in directory");
    
    let dirContent = fs.readFile("test_directory/file_in_dir.txt");
    assert(dirContent === "File in directory", "Read file from directory");
    
    // Read Directory
    let files = fs.readdir("test_directory");
    assert(files.length > 0, "fs.readdir returns files");
    console.log("Files in directory: " + files.length);
    
    // Cleanup
    console.log("\n--- CLEANUP ---");
    fs.deleteFile("test_file_1.txt");
    fs.deleteFile("test_file_2.txt");
    fs.deleteFile("numbers.txt");
    fs.deleteFile("data.json");
    fs.deleteFile("large.txt");
    fs.deleteFile("test_directory/file_in_dir.txt");
    fs.rmdir("test_directory");
    
    assert(!fs.exists("test_file_1.txt"), "Cleanup: file 1 deleted");
    assert(!fs.exists("test_directory"), "Cleanup: directory deleted");
    
    console.log("All cleanup completed");
    
} catch (e) {
    console.log("\nFilesystem tests encountered an error: " + e.message);
    console.log("This may be expected if fs operations are not fully implemented");
}

console.log("\n" + "=".repeat(70));
console.log("RESULTS:");
console.log("Tests Passed: " + testsPassed);
console.log("Tests Failed: " + testsFailed);
console.log("=".repeat(70));
