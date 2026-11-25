# Code Examples

Complete examples to help you learn and build with NanoJS.

## Table of Contents
- [Hello World](#hello-world)
- [Variables and Types](#variables-and-types)
- [Functions](#functions)
- [Arrays and Objects](#arrays-and-objects)
- [Async Programming](#async-programming)
- [File Operations](#file-operations)
- [Web Server](#web-server)
- [Complete Projects](#complete-projects)

---

## Hello World

### Basic Output

**hello.mjs:**
```javascript
console.log("Hello, World!");
```

Run it:
```bash
./nanojs hello.mjs
```

Output:
```
Hello, World!
```

### Variables and String Interpolation

**greet.mjs:**
```javascript
let name = "John";
let age = 30;

console.log(`Hello, ${name}!`);
console.log(`You are ${age} years old.`);
console.log(`Next year you'll be ${age + 1}.`);
```

Output:
```
Hello, John!
You are 30 years old.
Next year you'll be 31.
```

---

## Variables and Types

### Working with Different Types

**types.mjs:**
```javascript
// Numbers
let integer = 42;
let decimal = 3.14;
let negative = -10;

console.log("Numbers:", integer, decimal, negative);

// Strings
let greeting = "Hello";
let name = 'World';
let template = `${greeting}, ${name}!`;

console.log("Strings:", template);

// Booleans
let isTrue = true;
let isFalse = false;

console.log("Booleans:", isTrue, isFalse);

// Arrays
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", true, null];

console.log("Arrays:", numbers, mixed);

// Objects
let person = {
  name: "John",
  age: 30,
  city: "New York"
};

console.log("Object:", person);
```

---

## Functions

### Function Examples

**functions.mjs:**
```javascript
// Regular function
function greet(name) {
  return `Hello, ${name}!`;
}

// Arrow function
const add = (a, b) => a + b;

// Function with multiple parameters
function calculate(a, b, operation) {
  if (operation === 'add') return a + b;
  if (operation === 'subtract') return a - b;
  if (operation === 'multiply') return a * b;
  if (operation === 'divide') return a / b;
  return 0;
}

// Test functions
console.log(greet("World"));
console.log("5 + 3 =", add(5, 3));
console.log("10 * 4 =", calculate(10, 4, 'multiply'));

// Higher-order function
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(5, (i) => console.log(`Count: ${i}`));
```

---

## Arrays and Objects

### Array Operations

**arrays.mjs:**
```javascript
let numbers = [1, 2, 3, 4, 5];

// Map - transform each element
let doubled = numbers.map(x => x * 2);
console.log("Doubled:", doubled);

// Filter - keep only matching elements
let evens = numbers.filter(x => x % 2 === 0);
console.log("Evens:", evens);

// Reduce - combine into single value
let sum = numbers.reduce((total, x) => total + x, 0);
console.log("Sum:", sum);

// Find - get first match
let found = numbers.find(x => x > 3);
console.log("First > 3:", found);

// Some - check if any match
let hasEven = numbers.some(x => x % 2 === 0);
console.log("Has even:", hasEven);

// Every - check if all match
let allPositive = numbers.every(x => x > 0);
console.log("All positive:", allPositive);
```

### Object Operations

**objects.mjs:**
```javascript
let person = {
  name: "John",
  age: 30,
  city: "New York",
  email: "john@example.com"
};

// Get object keys
let keys = Object.keys(person);
console.log("Keys:", keys);

// Get object values
let values = Object.values(person);
console.log("Values:", values);

// Get entries (key-value pairs)
let entries = Object.entries(person);
console.log("Entries:", entries);

// Loop through object
for (let [key, value] of entries) {
  console.log(`${key}: ${value}`);
}

// Object.assign - merge objects
let contact = { phone: "555-1234" };
let merged = Object.assign({}, person, contact);
console.log("Merged:", merged);
```

---

## Async Programming

### Promises

**promises.mjs:**
```javascript
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Waited ${ms}ms`);
    }, ms);
  });
}

console.log("Starting...");

wait(1000).then((result) => {
  console.log(result);
  return wait(1000);
}).then((result) => {
  console.log(result);
  console.log("Done!");
});
```

### Async/Await

**async-await.mjs:**
```javascript
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

async function countdown(n) {
  for (let i = n; i >= 0; i--) {
    console.log(i);
    await delay(1000);
  }
  console.log("Blast off! 🚀");
}

countdown(5);
```

### Sequential Tasks

**sequential.mjs:**
```javascript
function task(name, duration) {
  return new Promise((resolve) => {
    console.log(`Starting ${name}...`);
    setTimeout(() => {
      console.log(`Finished ${name}`);
      resolve(name);
    }, duration);
  });
}

async function runTasks() {
  await task("Task 1", 1000);
  await task("Task 2", 1000);
  await task("Task 3", 1000);
  console.log("All tasks complete!");
}

runTasks();
```

---

## File Operations

### Reading and Writing Files

**file-demo.mjs:**
```javascript
// Write data to file
let data = {
  name: "John Doe",
  age: 30,
  hobbies: ["reading", "coding", "gaming"]
};

let jsonData = JSON.stringify(data);
fs.writeFile('user.json', jsonData);
console.log("File written!");

// Read file
let content = fs.readFile('user.json');
let parsed = JSON.parse(content);

console.log("Name:", parsed.name);
console.log("Age:", parsed.age);
console.log("Hobbies:", parsed.hobbies);
```

### Log File Manager

**logger.mjs:**
```javascript
function log(level, message) {
  let timestamp = new Date().toISOString();
  let entry = `[${timestamp}] [${level}] ${message}\n`;
  fs.appendFile('app.log', entry);
}

// Create some log entries
log('INFO', 'Application started');
log('WARN', 'Low memory warning');
log('ERROR', 'Failed to connect to database');
log('INFO', 'Application stopped');

// Read and display log
console.log("=== Log File ===");
let logs = fs.readFile('app.log');
console.log(logs);
```

### Simple Database

**database.mjs:**
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
    item.id = Date.now();
    this.data.push(item);
    this.save();
    return item;
  }
  
  getAll() {
    return this.data;
  }
  
  findById(id) {
    return this.data.find(item => item.id === id);
  }
  
  delete(id) {
    this.data = this.data.filter(item => item.id !== id);
    this.save();
  }
}

// Use the database
let db = new SimpleDB('users.json');

// Add users
db.add({ name: 'John', age: 30 });
db.add({ name: 'Jane', age: 25 });
db.add({ name: 'Bob', age: 35 });

// Get all users
let users = db.getAll();
console.log('All users:', users);

// Find user
let john = db.findById(users[0].id);
console.log('Found:', john);
```

---

## Web Server

### Basic Server

**server.mjs:**
```javascript
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  if (req.url === '/') {
    res.end('Welcome to my server!');
  } else if (req.url === '/time') {
    res.end(`Current time: ${new Date().toISOString()}`);
  } else {
    res.end('404 - Page not found');
  }
});

server.listen(8080);
console.log('Server running at http://localhost:8080/');
```

### HTML Website

**website.mjs:**
```javascript
function page(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 50px auto; }
        nav { background: #333; padding: 10px; }
        nav a { color: white; margin: 0 10px; text-decoration: none; }
      </style>
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <h1>${title}</h1>
      ${content}
    </body>
    </html>
  `;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end(page('Home', '<p>Welcome to my website!</p>'));
  } else if (req.url === '/about') {
    res.end(page('About', '<p>This is my about page.</p>'));
  } else if (req.url === '/contact') {
    res.end(page('Contact', '<p>Email: contact@example.com</p>'));
  } else {
    res.end(page('404', '<p>Page not found</p>'));
  }
});

server.listen(8080);
console.log('Website at http://localhost:8080/');
```

### JSON API

**api.mjs:**
```javascript
let users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
];

const server = http.createServer((req, res) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    res.end(JSON.stringify({
      success: true,
      data: users
    }));
  } else if (req.url === '/api/stats' && req.method === 'GET') {
    res.end(JSON.stringify({
      success: true,
      data: {
        totalUsers: users.length,
        timestamp: Date.now()
      }
    }));
  } else {
    res.end(JSON.stringify({
      success: false,
      error: 'Endpoint not found'
    }));
  }
});

server.listen(3000);
console.log('API running at http://localhost:3000/');
console.log('Try: http://localhost:3000/api/users');
```

---

## Complete Projects

### Project 1: Todo List Manager

**todo.mjs:**
```javascript
class TodoList {
  constructor() {
    this.todos = this.load();
  }
  
  load() {
    if (fs.exists('todos.json')) {
      let data = fs.readFile('todos.json');
      return JSON.parse(data);
    }
    return [];
  }
  
  save() {
    fs.writeFile('todos.json', JSON.stringify(this.todos));
  }
  
  add(text) {
    let todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.todos.push(todo);
    this.save();
    console.log(`Added: ${text}`);
  }
  
  list() {
    if (this.todos.length === 0) {
      console.log('No todos yet!');
      return;
    }
    
    console.log('\nTodo List:');
    console.log('----------');
    for (let todo of this.todos) {
      let status = todo.completed ? '✓' : ' ';
      console.log(`[${status}] ${todo.text}`);
    }
  }
  
  complete(id) {
    let todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = true;
      this.save();
      console.log(`Completed: ${todo.text}`);
    }
  }
  
  delete(id) {
    let todo = this.todos.find(t => t.id === id);
    if (todo) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.save();
      console.log(`Deleted: ${todo.text}`);
    }
  }
}

// Usage
let todos = new TodoList();

todos.add('Learn JavaScript');
todos.add('Build a project');
todos.add('Practice coding');

todos.list();

// Complete first todo
if (todos.todos.length > 0) {
  todos.complete(todos.todos[0].id);
}

todos.list();
```

### Project 2: Note Taking App

**notes.mjs:**
```javascript
class NoteApp {
  constructor() {
    this.ensureDirectory();
  }
  
  ensureDirectory() {
    if (!fs.exists('notes')) {
      fs.mkdir('notes');
    }
  }
  
  create(title, content) {
    let filename = this.titleToFilename(title);
    let note = {
      title: title,
      content: content,
      created: new Date().toISOString()
    };
    
    fs.writeFile(`notes/${filename}`, JSON.stringify(note));
    console.log(`Created note: ${title}`);
  }
  
  read(title) {
    let filename = this.titleToFilename(title);
    
    if (!fs.exists(`notes/${filename}`)) {
      console.log('Note not found!');
      return;
    }
    
    let data = fs.readFile(`notes/${filename}`);
    let note = JSON.parse(data);
    
    console.log('\n' + '='.repeat(40));
    console.log(note.title);
    console.log('='.repeat(40));
    console.log(note.content);
    console.log('\n' + 'Created: ' + note.created);
  }
  
  list() {
    let files = fs.readdir('notes');
    
    if (files.length === 0) {
      console.log('No notes yet!');
      return;
    }
    
    console.log('\nYour Notes:');
    console.log('-----------');
    
    for (let file of files) {
      if (file.endsWith('.json')) {
        let data = fs.readFile(`notes/${file}`);
        let note = JSON.parse(data);
        console.log(`• ${note.title}`);
      }
    }
  }
  
  delete(title) {
    let filename = this.titleToFilename(title);
    
    if (fs.exists(`notes/${filename}`)) {
      fs.deleteFile(`notes/${filename}`);
      console.log(`Deleted note: ${title}`);
    } else {
      console.log('Note not found!');
    }
  }
  
  titleToFilename(title) {
    return title.toLowerCase().replace(/\s+/g, '-') + '.json';
  }
}

// Usage
let app = new NoteApp();

app.create('My First Note', 'This is the content of my first note!');
app.create('Shopping List', 'Milk\nBread\nEggs\nButter');
app.create('Ideas', 'Build a game\nLearn new language\nWrite a blog');

app.list();
app.read('Shopping List');
```

### Project 3: Weather Dashboard (Mock API)

**weather-dashboard.mjs:**
```javascript
// Mock weather data
const weatherData = {
  'new-york': { temp: 72, condition: 'Sunny', humidity: 65 },
  'london': { temp: 58, condition: 'Cloudy', humidity: 80 },
  'tokyo': { temp: 68, condition: 'Rainy', humidity: 75 },
  'sydney': { temp: 78, condition: 'Sunny', humidity: 60 }
};

function getWeather(city) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = weatherData[city.toLowerCase()];
      if (data) {
        resolve(data);
      } else {
        resolve({ error: 'City not found' });
      }
    }, 500);
  });
}

async function displayWeather(city) {
  console.log(`Fetching weather for ${city}...`);
  
  let data = await getWeather(city);
  
  if (data.error) {
    console.log(`Error: ${data.error}`);
    return;
  }
  
  console.log(`\nWeather in ${city}:`);
  console.log(`Temperature: ${data.temp}°F`);
  console.log(`Condition: ${data.condition}`);
  console.log(`Humidity: ${data.humidity}%`);
}

async function checkMultipleCities() {
  let cities = ['New York', 'London', 'Tokyo'];
  
  for (let city of cities) {
    await displayWeather(city);
    console.log('---');
  }
}

checkMultipleCities();
```

### Project 4: Simple Blog Server

**blog-server.mjs:**
```javascript
// Blog posts storage
let posts = [
  {
    id: 1,
    title: 'My First Post',
    content: 'This is my first blog post!',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Learning JavaScript',
    content: 'Today I learned about async/await.',
    date: '2024-01-16'
  }
];

function renderPost(post) {
  return `
    <article style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h2>${post.title}</h2>
      <p style="color: #666;">${post.date}</p>
      <p>${post.content}</p>
    </article>
  `;
}

function renderBlog() {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Blog</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
        header { background: #333; color: white; padding: 20px; margin: -20px -20px 20px; }
      </style>
    </head>
    <body>
      <header>
        <h1>My Awesome Blog</h1>
      </header>
      <main>
        ${posts.map(renderPost).join('')}
      </main>
    </body>
    </html>
  `;
  return html;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end(renderBlog());
  } else if (req.url === '/api/posts') {
    res.end(JSON.stringify(posts));
  } else {
    res.end('<h1>404 - Not Found</h1>');
  }
});

server.listen(8080);
console.log('Blog running at http://localhost:8080/');
```

---

## Learning Path

### Beginner
1. Start with `hello.mjs`
2. Try `types.mjs` and `functions.mjs`
3. Practice with `arrays.mjs` and `objects.mjs`

### Intermediate
1. Learn async with `promises.mjs` and `async-await.mjs`
2. Work with files using `file-demo.mjs` and `logger.mjs`
3. Build simple servers with `server.mjs` and `website.mjs`

### Advanced
1. Build the Todo List project
2. Create the Note Taking App
3. Build your own custom project!

---

## Tips for Success

1. **Start small** - Begin with simple examples
2. **Experiment** - Modify the code and see what happens
3. **Break things** - Don't be afraid of errors
4. **Build projects** - Apply what you learn
5. **Read code** - Study the examples carefully
6. **Practice daily** - Consistency is key

---

## Next Steps

Now that you've seen the examples, try:
- Modifying existing examples
- Combining multiple concepts
- Building your own projects
- Reading the [Language Features](language-features.md) guide
- Exploring the [Built-in Objects](builtin-objects.md) documentation

Happy coding! 🚀
