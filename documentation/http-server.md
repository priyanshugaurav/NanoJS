# HTTP Server

Learn how to create web servers and handle HTTP requests.

## Table of Contents
- [Introduction](#introduction)
- [Creating a Server](#creating-a-server)
- [Handling Requests](#handling-requests)
- [Response Methods](#response-methods)
- [Routing](#routing)
- [Practical Examples](#practical-examples)

---

## Introduction

The `http` module lets you create web servers that can:
- Serve web pages
- Handle API requests
- Serve static files
- Process form data

### Basic Concepts

**Server**: Listens for incoming requests
**Request**: Information from the client (browser)
**Response**: Data sent back to the client

---

## Creating a Server

### http.createServer()

Create a basic server:

```javascript
const server = http.createServer((req, res) => {
  // Handle request here
  res.end('Hello, World!');
});

server.listen(8080);
console.log('Server running at http://localhost:8080/');
```

### Server Lifecycle

1. Create server with request handler
2. Start listening on a port
3. Handle incoming requests
4. Send responses

### Simple Example

```javascript
function handleRequest(req, res) {
  console.log('Request received!');
  res.end('Welcome to my server');
}

const server = http.createServer(handleRequest);
server.listen(3000);

console.log('Server started on port 3000');
```

---

## Handling Requests

### Request Object

The `req` object contains information about the request:

**req.method** - HTTP method (GET, POST, etc.)
```javascript
const server = http.createServer((req, res) => {
  console.log('Method:', req.method);
  res.end('OK');
});
```

**req.url** - Requested URL path
```javascript
const server = http.createServer((req, res) => {
  console.log('URL:', req.url);
  res.end('OK');
});
```

### Example: Log Requests

```javascript
const server = http.createServer((req, res) => {
  let timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  res.end('Request logged');
});

server.listen(8080);
```

---

## Response Methods

### res.end()

Send response and close connection:

```javascript
const server = http.createServer((req, res) => {
  res.end('This is the response body');
});
```

**With HTML:**
```javascript
const server = http.createServer((req, res) => {
  let html = `
    <html>
      <head><title>My Server</title></head>
      <body>
        <h1>Hello, World!</h1>
        <p>Welcome to my server</p>
      </body>
    </html>
  `;
  
  res.end(html);
});

server.listen(8080);
```

**With JSON:**
```javascript
const server = http.createServer((req, res) => {
  let data = {
    message: 'Success',
    timestamp: Date.now(),
    users: ['John', 'Jane', 'Bob']
  };
  
  res.end(JSON.stringify(data));
});

server.listen(8080);
```

---

## Routing

Handle different URLs:

### Basic Routing

```javascript
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end('Home Page');
  } else if (req.url === '/about') {
    res.end('About Page');
  } else if (req.url === '/contact') {
    res.end('Contact Page');
  } else {
    res.end('404 - Page Not Found');
  }
});

server.listen(8080);
console.log('Server running on http://localhost:8080/');
```

### HTML Pages

```javascript
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end(`
      <html>
        <head><title>Home</title></head>
        <body>
          <h1>Home Page</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </body>
      </html>
    `);
  } else if (req.url === '/about') {
    res.end(`
      <html>
        <head><title>About</title></head>
        <body>
          <h1>About Us</h1>
          <p>This is a simple web server</p>
          <a href="/">Back to Home</a>
        </body>
      </html>
    `);
  } else {
    res.end(`
      <html>
        <head><title>404</title></head>
        <body>
          <h1>Page Not Found</h1>
          <a href="/">Go Home</a>
        </body>
      </html>
    `);
  }
});

server.listen(8080);
```

### API Endpoints

```javascript
const server = http.createServer((req, res) => {
  // GET /api/users - Get all users
  if (req.method === 'GET' && req.url === '/api/users') {
    let users = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 }
    ];
    res.end(JSON.stringify(users));
  }
  
  // GET /api/status - Get server status
  else if (req.method === 'GET' && req.url === '/api/status') {
    let status = {
      status: 'online',
      uptime: Date.now(),
      version: '1.0.0'
    };
    res.end(JSON.stringify(status));
  }
  
  // 404 - Not Found
  else {
    res.end(JSON.stringify({
      error: 'Endpoint not found'
    }));
  }
});

server.listen(8080);
console.log('API server running on http://localhost:8080/');
```

---

## Practical Examples

### Example 1: Simple Website

```javascript
function serveWebsite(req, res) {
  if (req.url === '/') {
    // Home page
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Website</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: 50px auto; }
          nav { background: #333; padding: 10px; }
          nav a { color: white; margin: 0 10px; text-decoration: none; }
          nav a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/projects">Projects</a>
          <a href="/contact">Contact</a>
        </nav>
        <h1>Welcome to My Website</h1>
        <p>This is a simple website built with Mini-JS!</p>
      </body>
      </html>
    `);
  } else if (req.url === '/about') {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>About</title></head>
      <body>
        <h1>About Me</h1>
        <p>I'm learning to build web servers!</p>
        <a href="/">Back to Home</a>
      </body>
      </html>
    `);
  } else if (req.url === '/projects') {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Projects</title></head>
      <body>
        <h1>My Projects</h1>
        <ul>
          <li>JavaScript Interpreter</li>
          <li>Web Server</li>
          <li>Todo App</li>
        </ul>
        <a href="/">Back to Home</a>
      </body>
      </html>
    `);
  } else {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>404</title></head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go Home</a>
      </body>
      </html>
    `);
  }
}

const server = http.createServer(serveWebsite);
server.listen(8080);
console.log('Website running at http://localhost:8080/');
```

### Example 2: REST API

```javascript
// In-memory database
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

let nextId = 3;

const server = http.createServer((req, res) => {
  // GET /api/users - Get all users
  if (req.method === 'GET' && req.url === '/api/users') {
    res.end(JSON.stringify({
      success: true,
      data: users
    }));
  }
  
  // GET /api/users/:id - Get single user (simplified)
  else if (req.method === 'GET' && req.url.startsWith('/api/users/')) {
    let id = parseInt(req.url.split('/')[3]);
    let user = users.find(u => u.id === id);
    
    if (user) {
      res.end(JSON.stringify({
        success: true,
        data: user
      }));
    } else {
      res.end(JSON.stringify({
        success: false,
        error: 'User not found'
      }));
    }
  }
  
  // GET /api/stats - Get statistics
  else if (req.method === 'GET' && req.url === '/api/stats') {
    res.end(JSON.stringify({
      success: true,
      data: {
        totalUsers: users.length,
        serverTime: new Date().toISOString()
      }
    }));
  }
  
  // Default 404
  else {
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

### Example 3: File Server

```javascript
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Serve index page
    if (fs.exists('index.html')) {
      let content = fs.readFile('index.html');
      res.end(content);
    } else {
      res.end('<h1>No index.html found</h1>');
    }
  } else if (req.url === '/files') {
    // List all files
    let files = fs.readdir('.');
    
    let html = '<h1>Files</h1><ul>';
    for (let file of files) {
      html += `<li><a href="/file/${file}">${file}</a></li>`;
    }
    html += '</ul>';
    
    res.end(html);
  } else if (req.url.startsWith('/file/')) {
    // Serve specific file
    let filename = req.url.substring(6);
    
    if (fs.exists(filename)) {
      let content = fs.readFile(filename);
      res.end(`<pre>${content}</pre>`);
    } else {
      res.end('<h1>File not found</h1>');
    }
  } else {
    res.end('<h1>404 - Not Found</h1>');
  }
});

server.listen(8080);
console.log('File server running at http://localhost:8080/');
```

### Example 4: Todo API

```javascript
let todos = [];
let nextId = 1;

function handleTodoAPI(req, res) {
  // GET /todos - List all todos
  if (req.method === 'GET' && req.url === '/todos') {
    res.end(JSON.stringify(todos));
  }
  
  // GET /todos/active - List active todos
  else if (req.method === 'GET' && req.url === '/todos/active') {
    let active = todos.filter(t => !t.completed);
    res.end(JSON.stringify(active));
  }
  
  // GET /todos/completed - List completed todos
  else if (req.method === 'GET' && req.url === '/todos/completed') {
    let completed = todos.filter(t => t.completed);
    res.end(JSON.stringify(completed));
  }
  
  // HTML interface
  else if (req.method === 'GET' && req.url === '/') {
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Todo API</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 50px auto; }
          .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; }
          code { color: #c7254e; }
        </style>
      </head>
      <body>
        <h1>Todo API</h1>
        <h2>Endpoints:</h2>
        
        <div class="endpoint">
          <strong>GET /todos</strong><br>
          Get all todos
        </div>
        
        <div class="endpoint">
          <strong>GET /todos/active</strong><br>
          Get active todos
        </div>
        
        <div class="endpoint">
          <strong>GET /todos/completed</strong><br>
          Get completed todos
        </div>
      </body>
      </html>
    `);
  }
  
  else {
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}

// Add sample data
todos.push({ id: 1, text: 'Learn JavaScript', completed: false });
todos.push({ id: 2, text: 'Build a server', completed: true });

const server = http.createServer(handleTodoAPI);
server.listen(3000);
console.log('Todo API running at http://localhost:3000/');
```

### Example 5: Static Site with Navigation

```javascript
function servePage(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        header {
          background: #2c3e50;
          color: white;
          padding: 20px;
          margin: -20px -20px 20px -20px;
        }
        nav {
          background: #34495e;
          padding: 10px;
          margin: -20px -20px 20px -20px;
        }
        nav a {
          color: white;
          text-decoration: none;
          margin: 0 15px;
        }
        nav a:hover {
          text-decoration: underline;
        }
        main {
          background: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <header>
        <h1>My Awesome Website</h1>
      </header>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
      </nav>
      <main>
        ${content}
      </main>
    </body>
    </html>
  `;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end(servePage('Home', `
      <h2>Welcome!</h2>
      <p>This is a fully styled website served by Mini-JS.</p>
      <p>Navigate using the menu above to explore different pages.</p>
    `));
  } else if (req.url === '/about') {
    res.end(servePage('About', `
      <h2>About This Site</h2>
      <p>This website is powered by a custom JavaScript interpreter!</p>
      <ul>
        <li>Built from scratch in C++</li>
        <li>Supports modern JavaScript features</li>
        <li>Can run web servers</li>
      </ul>
    `));
  } else if (req.url === '/blog') {
    res.end(servePage('Blog', `
      <h2>Blog Posts</h2>
      <article>
        <h3>My First Post</h3>
        <p>Today I learned how to create web servers with JavaScript!</p>
      </article>
      <article>
        <h3>Building an Interpreter</h3>
        <p>Creating a programming language from scratch is challenging but rewarding.</p>
      </article>
    `));
  } else if (req.url === '/contact') {
    res.end(servePage('Contact', `
      <h2>Get In Touch</h2>
      <p>Feel free to reach out!</p>
      <p>Email: contact@example.com</p>
    `));
  } else {
    res.end(servePage('404', `
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go back home</a>
    `));
  }
});

server.listen(8080);
console.log('Website running at http://localhost:8080/');
```

---

## Common Patterns

### Pattern 1: Router Function

```javascript
function route(method, url, handler) {
  return { method, url, handler };
}

const routes = [
  route('GET', '/', (req, res) => {
    res.end('Home Page');
  }),
  route('GET', '/about', (req, res) => {
    res.end('About Page');
  }),
  route('GET', '/api/users', (req, res) => {
    res.end(JSON.stringify([{id: 1, name: 'John'}]));
  })
];

const server = http.createServer((req, res) => {
  for (let route of routes) {
    if (req.method === route.method && req.url === route.url) {
      route.handler(req, res);
      return;
    }
  }
  res.end('404 - Not Found');
});

server.listen(8080);
```

### Pattern 2: Middleware

```javascript
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

function auth(req, res, next) {
  // Simple auth check
  if (req.url.startsWith('/admin')) {
    res.end('Unauthorized');
  } else {
    next();
  }
}

function handleRequest(req, res) {
  logger(req, res, () => {
    auth(req, res, () => {
      res.end('Request handled');
    });
  });
}

const server = http.createServer(handleRequest);
server.listen(8080);
```

### Pattern 3: JSON Response Helper

```javascript
function jsonResponse(res, data) {
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/users') {
    jsonResponse(res, {
      success: true,
      data: [{id: 1, name: 'John'}]
    });
  } else if (req.url === '/api/status') {
    jsonResponse(res, {
      status: 'online',
      uptime: Date.now()
    });
  }
});

server.listen(8080);
```

---

## Best Practices

### 1. Log Requests
```javascript
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Handle request...
});
```

### 2. Handle 404s
```javascript
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end('Home');
  } else {
    res.end('404 - Not Found');
  }
});
```

### 3. Organize Routes
```javascript
function handleAPI(req, res) {
  if (req.url === '/api/users') {
    // Handle users
  } else if (req.url === '/api/posts') {
    // Handle posts
  }
}

function handleWebsite(req, res) {
  if (req.url === '/') {
    // Home page
  } else if (req.url === '/about') {
    // About page
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    handleAPI(req, res);
  } else {
    handleWebsite(req, res);
  }
});
```

### 4. Use Constants
```javascript
const PORT = 8080;
const HOST = 'localhost';

const server = http.createServer(handler);
server.listen(PORT);
console.log(`Server running at http://${HOST}:${PORT}/`);
```

---

## Troubleshooting

### Port Already in Use
```
Error: Port 8080 is already in use
Solution: Use a different port or close the other server
```

### Cannot Access from Browser
```
Check:
1. Server is running
2. Port number is correct
3. URL is correct (http://localhost:8080/)
```

### Response Not Showing
```javascript
// Make sure you call res.end()!
const server = http.createServer((req, res) => {
  res.end('Response');  // Don't forget this!
});
```

---

## Summary

- `http.createServer(handler)` - Create server
- `server.listen(port)` - Start listening
- `req.method` - HTTP method (GET, POST, etc.)
- `req.url` - Requested URL path
- `res.end(content)` - Send response

**Basic server template:**
```javascript
const server = http.createServer((req, res) => {
  // Handle request
  res.end('Response');
});

server.listen(8080);
console.log('Server running at http://localhost:8080/');
```

---

Next: [Examples →](examples.md)
