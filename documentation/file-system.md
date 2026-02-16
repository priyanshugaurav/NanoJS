# File System API

Learn how to read, write, and manage files and directories.

## Table of Contents
- [Introduction](#introduction)
- [Reading Files](#reading-files)
- [Writing Files](#writing-files)
- [File Operations](#file-operations)
- [Directory Operations](#directory-operations)
- [Practical Examples](#practical-examples)

---

## Introduction

The `fs` module provides functions for working with the file system.

### Importing

The `fs` object is available globally - no import needed!

```javascript
// fs is already available
console.log(fs);  // [Object]
```

### Supported Operations

- **Read** files
- **Write** files
- **Append** to files
- **Delete** files
- **Check** if files exist
- **Create** directories
- **Remove** directories
- **List** directory contents

---

## Reading Files

### fs.readFile()

Read the entire contents of a file:

```javascript
let content = fs.readFile('data.txt');

if (content !== null) {
  console.log('File contents:');
  console.log(content);
} else {
  console.log('File not found!');
}
```

**Returns:**
- `string` - File contents if successful
- `null` - If file doesn't exist or can't be read

### Reading Different File Types

**Text file:**
```javascript
let text = fs.readFile('document.txt');
console.log(text);
```

**JSON file:**
```javascript
let jsonText = fs.readFile('data.json');
let data = JSON.parse(jsonText);

console.log(data.name);
console.log(data.age);
```

**CSV file:**
```javascript
let csv = fs.readFile('data.csv');
let lines = csv.split('\n');

for (let line of lines) {
  let values = line.split(',');
  console.log(values);
}
```

### Error Handling

```javascript
let content = fs.readFile('missing.txt');

if (content === null) {
  console.error('Could not read file!');
} else {
  console.log('Success!');
  console.log(content);
}
```

---

## Writing Files

### fs.writeFile()

Create a new file or overwrite existing one:

```javascript
fs.writeFile('output.txt', 'Hello, World!');
console.log('File written successfully!');
```

**Parameters:**
- `path` (string) - File path
- `content` (string) - Content to write

### Writing Examples

**Simple text:**
```javascript
fs.writeFile('message.txt', 'This is a test message.');
```

**Multiple lines:**
```javascript
let content = `Line 1
Line 2
Line 3`;

fs.writeFile('multiline.txt', content);
```

**JSON data:**
```javascript
let data = {
  name: 'John',
  age: 30,
  city: 'New York'
};

let jsonText = JSON.stringify(data);
fs.writeFile('user.json', jsonText);
```

**Array data:**
```javascript
let users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
];

fs.writeFile('users.json', JSON.stringify(users));
```

### Generating Reports

```javascript
function generateReport(data) {
  let report = `Sales Report
===============
Date: ${new Date().toISOString()}

Total Sales: $${data.total}
Items Sold: ${data.count}
Average: $${data.average}
`;

  fs.writeFile('report.txt', report);
  console.log('Report generated!');
}

generateReport({
  total: 1250.50,
  count: 47,
  average: 26.61
});
```

---

## File Operations

### fs.appendFile()

Add content to the end of a file:

```javascript
// Create or append to log file
fs.appendFile('app.log', 'User logged in\n');
fs.appendFile('app.log', 'Action performed\n');
fs.appendFile('app.log', 'User logged out\n');
```

**Use cases:**
- Logging
- Accumulating data
- Adding entries without overwriting

### Logger Example

```javascript
function log(message) {
  let timestamp = new Date().toISOString();
  let entry = `[${timestamp}] ${message}\n`;
  fs.appendFile('app.log', entry);
}

log('Application started');
log('Connected to database');
log('Server listening on port 8080');
```

### fs.exists()

Check if a file or directory exists:

```javascript
if (fs.exists('config.json')) {
  console.log('Config file found!');
  let config = fs.readFile('config.json');
  // Use config...
} else {
  console.log('Config file missing!');
  // Create default config...
}
```

**Returns:**
- `true` - File/directory exists
- `false` - Doesn't exist

### Safe Read Example

```javascript
function safeReadFile(path) {
  if (fs.exists(path)) {
    return fs.readFile(path);
  } else {
    console.error(`File not found: ${path}`);
    return null;
  }
}

let data = safeReadFile('data.txt');
if (data !== null) {
  console.log(data);
}
```

### fs.deleteFile()

Delete a file:

```javascript
if (fs.exists('temp.txt')) {
  fs.deleteFile('temp.txt');
  console.log('File deleted');
} else {
  console.log('File does not exist');
}
```

**Cleanup Example:**
```javascript
// Delete old log files
let oldLogs = ['log1.txt', 'log2.txt', 'log3.txt'];

for (let log of oldLogs) {
  if (fs.exists(log)) {
    fs.deleteFile(log);
    console.log(`Deleted: ${log}`);
  }
}
```

---

## Directory Operations

### fs.mkdir()

Create a new directory:

```javascript
fs.mkdir('data');
console.log('Directory created');

// Create nested directories
fs.mkdir('logs');
fs.mkdir('reports');
fs.mkdir('backups');
```

**Note:** Directory must not already exist!

### fs.rmdir()

Remove an empty directory:

```javascript
if (fs.exists('temp')) {
  fs.rmdir('temp');
  console.log('Directory removed');
}
```

**Important:** Directory must be empty!

### fs.readdir()

List all files and directories:

```javascript
let items = fs.readdir('.');

console.log('Current directory contents:');
for (let item of items) {
  console.log(item);
}
```

**Returns:** Array of file/directory names

### Directory Listing Example

```javascript
function listDirectory(path) {
  if (!fs.exists(path)) {
    console.log('Directory not found!');
    return;
  }
  
  let items = fs.readdir(path);
  
  console.log(`Contents of ${path}:`);
  console.log('-------------------');
  
  if (items.length === 0) {
    console.log('(empty)');
  } else {
    for (let item of items) {
      console.log(`  ${item}`);
    }
  }
}

listDirectory('.');
```

### Project Setup Example

```javascript
function setupProject() {
  console.log('Setting up project structure...');
  
  // Create directories
  let dirs = ['src', 'lib', 'data', 'logs'];
  
  for (let dir of dirs) {
    if (!fs.exists(dir)) {
      fs.mkdir(dir);
      console.log(`Created: ${dir}/`);
    }
  }
  
  // Create initial files
  fs.writeFile('src/main.mjs', '// Main application\n');
  fs.writeFile('README.md', '# My Project\n');
  
  console.log('Project setup complete!');
}

setupProject();
```

---

## Practical Examples

### Example 1: Configuration Manager

```javascript
const CONFIG_FILE = 'config.json';

function loadConfig() {
  if (fs.exists(CONFIG_FILE)) {
    let data = fs.readFile(CONFIG_FILE);
    return JSON.parse(data);
  } else {
    return getDefaultConfig();
  }
}

function saveConfig(config) {
  let data = JSON.stringify(config);
  fs.writeFile(CONFIG_FILE, data);
  console.log('Configuration saved');
}

function getDefaultConfig() {
  return {
    theme: 'light',
    language: 'en',
    notifications: true
  };
}

// Usage
let config = loadConfig();
console.log('Theme:', config.theme);

config.theme = 'dark';
saveConfig(config);
```

### Example 2: Simple Database

```javascript
class SimpleDB {
  constructor(filename) {
    this.filename = filename;
    this.data = this.load();
  }
  
  load() {
    if (fs.exists(this.filename)) {
      let content = fs.readFile(this.filename);
      return JSON.parse(content);
    }
    return [];
  }
  
  save() {
    let content = JSON.stringify(this.data);
    fs.writeFile(this.filename, content);
  }
  
  add(item) {
    this.data.push(item);
    this.save();
  }
  
  find(predicate) {
    return this.data.filter(predicate);
  }
  
  getAll() {
    return this.data;
  }
  
  delete(predicate) {
    this.data = this.data.filter(item => !predicate(item));
    this.save();
  }
}

// Usage
let db = new SimpleDB('users.json');

// Add users
db.add({ id: 1, name: 'John', age: 30 });
db.add({ id: 2, name: 'Jane', age: 25 });

// Find users
let adults = db.find(user => user.age >= 25);
console.log('Adults:', adults);

// Get all
let all = db.getAll();
console.log('All users:', all);

// Delete
db.delete(user => user.id === 1);
```

### Example 3: Log Manager

```javascript
class Logger {
  constructor(filename) {
    this.filename = filename;
    
    // Create file if doesn't exist
    if (!fs.exists(filename)) {
      fs.writeFile(filename, '');
    }
  }
  
  log(level, message) {
    let timestamp = new Date().toISOString();
    let entry = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFile(this.filename, entry);
  }
  
  info(message) {
    this.log('INFO', message);
  }
  
  warn(message) {
    this.log('WARN', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
  
  read() {
    return fs.readFile(this.filename);
  }
  
  clear() {
    fs.writeFile(this.filename, '');
    this.log('INFO', 'Log cleared');
  }
}

// Usage
let logger = new Logger('app.log');

logger.info('Application started');
logger.warn('Low memory warning');
logger.error('Failed to connect to database');

// Read logs
let logs = logger.read();
console.log(logs);
```

### Example 4: CSV Handler

```javascript
class CSVHandler {
  constructor(filename) {
    this.filename = filename;
  }
  
  write(headers, rows) {
    let csv = headers.join(',') + '\n';
    
    for (let row of rows) {
      csv += row.join(',') + '\n';
    }
    
    fs.writeFile(this.filename, csv);
  }
  
  read() {
    if (!fs.exists(this.filename)) {
      return { headers: [], rows: [] };
    }
    
    let content = fs.readFile(this.filename);
    let lines = content.split('\n').filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }
    
    let headers = lines[0].split(',');
    let rows = lines.slice(1).map(line => line.split(','));
    
    return { headers, rows };
  }
  
  append(row) {
    let content = row.join(',') + '\n';
    fs.appendFile(this.filename, content);
  }
}

// Usage
let csv = new CSVHandler('users.csv');

// Write
csv.write(
  ['Name', 'Age', 'City'],
  [
    ['John', '30', 'NYC'],
    ['Jane', '25', 'LA'],
    ['Bob', '35', 'Chicago']
  ]
);

// Read
let data = csv.read();
console.log('Headers:', data.headers);
console.log('Rows:', data.rows);

// Append
csv.append(['Alice', '28', 'Boston']);
```

### Example 5: Backup System

```javascript
function createBackup(sourceFile) {
  if (!fs.exists(sourceFile)) {
    console.error('Source file not found!');
    return false;
  }
  
  // Create backups directory
  if (!fs.exists('backups')) {
    fs.mkdir('backups');
  }
  
  // Generate backup filename
  let timestamp = new Date().getTime();
  let backupName = `backups/${sourceFile}.${timestamp}.bak`;
  
  // Copy file
  let content = fs.readFile(sourceFile);
  fs.writeFile(backupName, content);
  
  console.log(`Backup created: ${backupName}`);
  return true;
}

function restoreBackup(backupFile, targetFile) {
  if (!fs.exists(backupFile)) {
    console.error('Backup file not found!');
    return false;
  }
  
  let content = fs.readFile(backupFile);
  fs.writeFile(targetFile, content);
  
  console.log(`Restored ${targetFile} from ${backupFile}`);
  return true;
}

// Usage
createBackup('important.txt');
// Later...
restoreBackup('backups/important.txt.1234567890.bak', 'important.txt');
```

### Example 6: File Statistics

```javascript
function getFileStats(filename) {
  if (!fs.exists(filename)) {
    return null;
  }
  
  let content = fs.readFile(filename);
  
  return {
    size: content.length,
    lines: content.split('\n').length,
    words: content.split(/\s+/).length,
    chars: content.length
  };
}

function displayStats(filename) {
  let stats = getFileStats(filename);
  
  if (stats === null) {
    console.log('File not found!');
    return;
  }
  
  console.log(`Statistics for ${filename}:`);
  console.log(`  Size: ${stats.size} bytes`);
  console.log(`  Lines: ${stats.lines}`);
  console.log(`  Words: ${stats.words}`);
  console.log(`  Characters: ${stats.chars}`);
}

// Usage
displayStats('document.txt');
```

---

## Best Practices

### 1. Always Check Existence

```javascript
// Good
if (fs.exists('data.txt')) {
  let data = fs.readFile('data.txt');
  // Process data...
}

// Bad
let data = fs.readFile('data.txt');  // Might be null!
```

### 2. Handle Errors Gracefully

```javascript
function safeRead(filename, defaultValue) {
  if (fs.exists(filename)) {
    return fs.readFile(filename);
  }
  return defaultValue;
}

let config = safeRead('config.json', '{}');
```

### 3. Use Constants for Paths

```javascript
const DATA_DIR = 'data';
const LOG_FILE = 'app.log';
const CONFIG_FILE = 'config.json';

fs.writeFile(LOG_FILE, 'Starting...');
```

### 4. Clean Up Temporary Files

```javascript
function withTempFile(callback) {
  let tempFile = 'temp.txt';
  
  try {
    // Use temp file
    callback(tempFile);
  } finally {
    // Always clean up
    if (fs.exists(tempFile)) {
      fs.deleteFile(tempFile);
    }
  }
}
```

### 5. Organize Project Files

```
project/
├── data/           # Data files
├── logs/           # Log files
├── backups/        # Backup files
├── config/         # Configuration
└── src/            # Source code
```

---

## Common Patterns

### Read-Process-Write

```javascript
// Read
let data = fs.readFile('input.txt');

// Process
let processed = data.toUpperCase();

// Write
fs.writeFile('output.txt', processed);
```

### Atomic Write (Safe Update)

```javascript
function atomicWrite(filename, content) {
  let tempFile = filename + '.tmp';
  
  // Write to temp file
  fs.writeFile(tempFile, content);
  
  // Delete old file if exists
  if (fs.exists(filename)) {
    fs.deleteFile(filename);
  }
  
  // Rename temp to actual
  // (In real systems, use rename. Here we copy)
  fs.writeFile(filename, content);
  fs.deleteFile(tempFile);
}
```

### Batch Processing

```javascript
function processAllFiles(directory) {
  let files = fs.readdir(directory);
  
  for (let file of files) {
    let path = `${directory}/${file}`;
    
    if (file.endsWith('.txt')) {
      let content = fs.readFile(path);
      // Process content...
      console.log(`Processed: ${file}`);
    }
  }
}
```

---

## Troubleshooting

### File Not Found
```javascript
// Always check before reading
if (!fs.exists('file.txt')) {
  console.error('File not found!');
  return;
}
```

### Permission Errors
```javascript
// Try-catch won't help here
// Make sure file has read/write permissions
```

### Empty Files
```javascript
let content = fs.readFile('file.txt');
if (content === null || content.length === 0) {
  console.log('File is empty or missing');
}
```

---

## Summary

- `fs.readFile(path)` - Read file contents
- `fs.writeFile(path, content)` - Write/overwrite file
- `fs.appendFile(path, content)` - Append to file
- `fs.exists(path)` - Check if file/directory exists
- `fs.deleteFile(path)` - Delete file
- `fs.mkdir(path)` - Create directory
- `fs.rmdir(path)` - Remove empty directory
- `fs.readdir(path)` - List directory contents

---

Next: [HTTP Server →](http-server.md)
