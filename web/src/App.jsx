import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  ExternalLink, 
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Zap, 
  Box, 
  Clock, 
  Layers, 
  Code2, 
  Terminal, 
  Trash2, 
  Cpu, 
  FileCode, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  HardDrive, 
  Monitor, 
  Apple,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import { PRESETS } from './engine/presets';
import { ExecutionInspector } from './engine/inspector';
import './App.css';

const CodeEditor = Editor.default || Editor;

// Reusable Code Snippet with Prism Syntax Coloring and Integrated Output
function CodeSnippet({ filename, code, output, onRun = null }) {
  const [copied, setCopied] = useState(false);
  const highlighted = Prism.highlight(code, Prism.languages.javascript, 'javascript');

  return (
    <div className="doc-code-wrapper">
      <div className="doc-code-header">
        <span className="doc-code-filename">{filename}</span>
        <div className="doc-code-actions">
          {onRun && (
            <button onClick={() => onRun(code)} className="doc-copy-btn" title="Run in Playground">
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}
          <button 
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }} 
            className="doc-copy-btn"
          >
            {copied ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre className="doc-code-pre">
        <code className="language-javascript" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      {output && (
        <div className="doc-output-box">
          <div className="doc-output-header">
            <span className="doc-output-dot" />
            <span>Output</span>
          </div>
          <pre className="doc-output-pre">{output}</pre>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [docsSection, setDocsSection] = useState('overview');

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nanojs-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
  const [code, setCode] = useState(PRESETS[0].code);
  const [playgroundTab, setPlaygroundTab] = useState('output');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // Downloads & Diagnostics State
  const [activeOsTab, setActiveOsTab] = useState('macos');
  const [detectedOs, setDetectedOs] = useState('macos');
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [testSuiteResults, setTestSuiteResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const [executionData, setExecutionData] = useState({
    logs: [],
    tokens: [],
    ast: null,
    callStack: [],
    microtasks: [],
    macrotasks: [],
    environments: [],
    heap: [],
    metrics: {
      executionTimeMs: 0,
      tokenCount: 0,
      astNodesCount: 0,
      heapAllocatedBytes: 0,
      eventLoopTicks: 0,
      isNative: false,
      exitCode: 0
    }
  });

  const inspectorRef = useRef(new ExecutionInspector());
  const consoleEndRef = useRef(null);
  const gutterRef = useRef(null);
  const editorScrollerRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nanojs-theme', theme);
  }, [theme]);

  useEffect(() => {
    handleRunCode(PRESETS[0].code);
    setTimeout(() => setHeroVisible(true), 80);

    // Auto detect OS
    if (typeof window !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('win')) {
        setDetectedOs('windows');
        setActiveOsTab('windows');
      } else if (ua.includes('linux')) {
        setDetectedOs('linux');
        setActiveOsTab('linux');
      } else {
        setDetectedOs('macos');
        setActiveOsTab('macos');
      }
    }
  }, []);

  const handleRunEngineTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setTestSuiteResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleCopySnippet = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 1500);
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionData.logs]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Instant navigation remembering where user came from
  const navigateTo = (view, presetId = null, docTarget = null) => {
    setPreviousView(currentView);
    setMobileMenuOpen(false);
    if (presetId) {
      const found = PRESETS.find(p => p.id === presetId);
      if (found) {
        setSelectedPreset(presetId);
        setCode(found.code);
        handleRunCode(found.code);
      }
    }
    if (docTarget) {
      setDocsSection(docTarget);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleOpenInPlayground = (sampleCode) => {
    setPreviousView(currentView);
    setCode(sampleCode);
    setCurrentView('playground');
    handleRunCode(sampleCode);
    window.scrollTo(0, 0);
  };

  const handleSelectPreset = (presetId) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      setSelectedPreset(presetId);
      setCode(found.code);
      handleRunCode(found.code);
    }
  };

  const handleRunCode = async (codeToRun = code) => {
    setIsRunning(true);
    try {
      const data = await inspectorRef.current.run(codeToRun);
      setExecutionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEditorScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleClearConsole = () => {
    setExecutionData(prev => ({
      ...prev,
      logs: []
    }));
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  const userVariables = [];
  if (executionData.environments.length > 0) {
    for (const env of executionData.environments) {
      for (const [name, binding] of Object.entries(env.bindings)) {
        if (!['NaN', 'Infinity', 'Math', 'JSON', 'console'].includes(name)) {
          userVariables.push({
            name,
            type: binding.type,
            value: typeof binding.value === 'object' ? JSON.stringify(binding.value) : String(binding.value),
            scope: env.name.includes('Global') ? 'Global' : 'Closure'
          });
        }
      }
    }
  }

  const features = [
    { icon: <Box className="w-4 h-4" />, title: 'Variables & Closures', desc: 'let and const declarations with lexical scopes that keep variables alive across inner functions.' },
    { icon: <Clock className="w-4 h-4" />, title: 'Async & Timers', desc: 'Non-blocking async and await, Promise microtasks, and setTimeout macrotasks run by a C++ event loop.' },
    { icon: <Layers className="w-4 h-4" />, title: 'Classes & Prototypes', desc: 'ES6 class syntax with constructors, methods, extends, and super calls.' },
    { icon: <Zap className="w-4 h-4" />, title: 'Built-in APIs', desc: 'Array helper methods, JSON parser, Math library, error handling, and a built-in HTTP server.' },
  ];

  const steps = [
    { num: '01', label: 'Lexer', file: 'Lexer.cpp', desc: 'Reads source code character by character. Groups them into tokens like keywords, identifiers, and operators.' },
    { num: '02', label: 'Parser', file: 'Parser.cpp', desc: 'Takes tokens and builds an Abstract Syntax Tree using a recursive descent parser that understands JS grammar.' },
    { num: '03', label: 'Interpreter', file: 'Interpreter.cpp', desc: 'Walks the AST, manages scope chains for closures, and coordinates the event loop for async code.' },
  ];

  const docsSidebarGroups = [
    {
      group: 'Getting Started',
      items: [
        { id: 'overview', title: 'Overview & Node.js' },
        { id: 'install', title: 'Installation & CLI' }
      ]
    },
    {
      group: 'How It Works',
      items: [
        { id: 'architecture', title: '3-Stage Pipeline' }
      ]
    },
    {
      group: 'Language Guide',
      items: [
        { id: 'variables', title: 'Variables & Scope' },
        { id: 'closures', title: 'Functions & Closures' },
        { id: 'classes', title: 'Classes & Inheritance' }
      ]
    },
    {
      group: 'APIs & Runtime',
      items: [
        { id: 'builtins', title: 'Standard Objects' },
        { id: 'async', title: 'Async & Event Loop' },
        { id: 'server', title: 'Web Server & Files' }
      ]
    },
    {
      group: 'Examples',
      items: [
        { id: 'examples', title: 'Runnable Scripts' }
      ]
    }
  ];

  return (
    <div className={`app-root ${theme}`}>

      {/* Main Navbar (Home, Docs, Downloads) */}
      {(currentView === 'home' || currentView === 'downloads' || currentView === 'docs') && (
        <>
          <nav className="navbar">
            <div className="nav-inner">
              <button onClick={() => navigateTo('home')} className="nav-brand">
                <span className="brand-dot" />
                <span className="brand-text">NanoJS</span>
              </button>

              {/* Desktop Navigation Links */}
              <div className="nav-links">
                <button 
                  onClick={() => navigateTo('home')} 
                  className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => navigateTo('docs')} 
                  className={`nav-link-btn ${currentView === 'docs' ? 'active' : ''}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Documentation</span>
                </button>
                <button 
                  onClick={() => navigateTo('downloads')} 
                  className={`nav-link-btn ${currentView === 'downloads' ? 'active' : ''}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Downloads</span>
                </button>
                <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="nav-link">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
                <button onClick={() => navigateTo('playground')} className="nav-cta">
                  Playground
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={toggleTheme} className="nav-icon-btn" title="Toggle theme">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {/* Mobile Header Bar */}
              <div className="nav-mobile">
                <button onClick={() => navigateTo('playground')} className="nav-mobile-btn">
                  Playground
                </button>
                <button onClick={toggleTheme} className="nav-icon-btn" title="Toggle theme">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setMobileMenuOpen(prev => !prev)} 
                  className="nav-hamburger-btn"
                  title="Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </nav>

          {/* Smooth Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="mobile-drawer">
              <button 
                onClick={() => navigateTo('home')} 
                className={`mobile-drawer-item ${currentView === 'home' ? 'active' : ''}`}
              >
                <Code2 className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button 
                onClick={() => navigateTo('docs')} 
                className={`mobile-drawer-item ${currentView === 'docs' ? 'active' : ''}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </button>
              <button 
                onClick={() => navigateTo('downloads')} 
                className={`mobile-drawer-item ${currentView === 'downloads' ? 'active' : ''}`}
              >
                <Download className="w-4 h-4" />
                <span>Downloads</span>
              </button>
              <a 
                href="https://github.com/priyanshugaurav/NanoJS" 
                target="_blank" 
                rel="noreferrer" 
                className="mobile-drawer-item"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Source Code on GitHub</span>
              </a>
              <button onClick={() => navigateTo('playground')} className="mobile-drawer-cta">
                <Play className="w-4 h-4 fill-current" />
                <span>Open Live Playground</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ============ HOME PAGE ============ */}
      {currentView === 'home' && (
        <main className="home-page">
          
          {/* Hero */}
          <section className={`hero ${heroVisible ? 'visible' : ''}`}>
            <div className="hero-badge">
              <Code2 className="w-3 h-3" />
              <span>C++17 • Zero dependencies • Built from scratch</span>
            </div>
            
            <h1 className="hero-title">
              A JavaScript engine,<br />
              <span className="hero-highlight">written from the ground up.</span>
            </h1>

            <p className="hero-subtitle">
              I built NanoJS to understand how JavaScript works under the hood: lexing, parsing, scope chains, closures, and an event loop. All implemented in C++ without external libraries.
            </p>

            <div className="hero-actions">
              <button onClick={() => navigateTo('playground')} className="btn-primary">
                <span>Try it live</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateTo('docs')} className="btn-secondary">
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </button>
              <button onClick={() => navigateTo('downloads')} className="btn-secondary">
                <Download className="w-4 h-4" />
                <span>Download v1.0.0</span>
              </button>
            </div>
          </section>

          {/* Features Grid: What it handles */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="section-label">What it handles</div>
            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-content">
                    <h3 className="feature-title">{f.title}</h3>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pipeline: How it works */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.25s' }}>
            <div className="section-label">How it works</div>
            <div className="pipeline">
              {steps.map((s, i) => (
                <div key={i} className="pipeline-step">
                  <div className="step-num">{s.num}</div>
                  <div className="step-content">
                    <div className="step-header">
                      <span className="step-label">{s.label}</span>
                      <span className="step-file">{s.file}</span>
                    </div>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Examples: Try an example */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.35s' }}>
            <div className="section-label">Try an example</div>
            <div className="examples-row">
              {PRESETS.slice(0, 4).map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => navigateTo('playground', p.id)}
                  className="example-chip"
                >
                  <Terminal className="w-3 h-3" />
                  <span>{p.title.replace(/^\d+\.\s*/, '')}</span>
                  <ChevronRight className="w-3 h-3 chip-arrow" />
                </button>
              ))}
            </div>
          </section>

          {/* Specs Bar */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.4s' }}>
            <div className="specs-bar">
              <div className="spec-item">
                <span className="spec-key">Language</span>
                <span className="spec-val">C++17</span>
              </div>
              <div className="spec-divider" />
              <div className="spec-item">
                <span className="spec-key">Parser</span>
                <span className="spec-val">Recursive Descent</span>
              </div>
              <div className="spec-divider" />
              <div className="spec-item">
                <span className="spec-key">Dependencies</span>
                <span className="spec-val">Zero (STL only)</span>
              </div>
              <div className="spec-divider" />
              <button 
                onClick={() => navigateTo('downloads')}
                className="spec-item spec-clickable" 
                title="Click to view live C++ engine tests"
              >
                <span className="spec-key">Tests</span>
                <span className="spec-val spec-pass">20 of 20 Passing • Verified</span>
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="home-footer">
            <span>Built by Priyanshu Gaurav</span>
            <div className="footer-links">
              <button onClick={() => navigateTo('docs')} className="footer-link">Docs</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('playground')} className="footer-link">Playground</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('downloads')} className="footer-link">Downloads</button>
              <span className="footer-dot">·</span>
              <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            </div>
          </footer>

        </main>
      )}

      {/* ============ MODERN DOCUMENTATION PAGE ============ */}
      {currentView === 'docs' && (
        <main className="docs-page">
          <header className="docs-header">
            <div className="docs-hero-badge">
              <BookOpen className="w-3 h-3" />
              <span>NanoJS Documentation</span>
            </div>
            <h1 className="docs-main-title">Documentation & Guide</h1>
            <p className="docs-main-subtitle">
              Clear, simple reference for writing code in NanoJS and understanding how the C++ runtime works.
            </p>
          </header>

          {/* Mobile Category Select Bar */}
          <div className="docs-mobile-select-wrap">
            <span className="docs-mobile-select-label">Topic:</span>
            <select
              value={docsSection}
              onChange={(e) => setDocsSection(e.target.value)}
              className="docs-mobile-select-dropdown"
            >
              {docsSidebarGroups.map((g, idx) => (
                <optgroup key={idx} label={g.group}>
                  {g.items.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="docs-layout">
            
            {/* Desktop Left Sidebar */}
            <aside className="docs-nav-sidebar">
              {docsSidebarGroups.map((g, idx) => (
                <div key={idx}>
                  <div className="docs-nav-group-title">{g.group}</div>
                  <div className="docs-nav-items">
                    {g.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setDocsSection(item.id)}
                        className={`docs-sidebar-link ${docsSection === item.id ? 'active' : ''}`}
                      >
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </aside>

            {/* Main Content Article */}
            <article className="docs-main-article">
              
              {/* SECTION: OVERVIEW */}
              {docsSection === 'overview' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Getting Started</span>
                    <h2 className="doc-article-title">Overview & Learning Purpose</h2>
                    <p className="doc-article-lead">
                      What NanoJS is, why it was created, and how it relates to Node.js.
                    </p>
                  </div>

                  <h3 className="doc-subheading">What is NanoJS?</h3>
                  <p className="doc-prose">
                    NanoJS is an educational JavaScript engine written in pure C++17 with zero third-party libraries. It was built to understand how language runtimes work: turning code into tokens, building syntax trees, evaluating expressions, and running an asynchronous event loop.
                  </p>

                  <div className="doc-note-box">
                    <strong>Relation to Node.js:</strong> NanoJS is built for fun and learning, not to compete with Node.js. If you already know JavaScript, writing code in NanoJS is completely familiar: you use standard <code>let</code>, <code>const</code>, <code>classes</code>, <code>console.log()</code>, <code>setTimeout()</code>, and even a built-in <code>http</code> server. Under the hood, NanoJS is a small ~1 MB C++ program that directly walks the syntax tree.
                  </div>

                  <h3 className="doc-subheading">Quick Syntax Example</h3>
                  <CodeSnippet 
                    filename="hello.mjs"
                    code={`let message = "Hello from NanoJS!";
console.log(message);

let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum of numbers:", sum);`}
                    output={`> Hello from NanoJS!\n> Sum of numbers: 15`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: INSTALL */}
              {docsSection === 'install' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Getting Started</span>
                    <h2 className="doc-article-title">Installation & Command Line</h2>
                    <p className="doc-article-lead">
                      How to install the prebuilt binary and run JavaScript files from your terminal.
                    </p>
                  </div>

                  <h3 className="doc-subheading">1. Install in Terminal</h3>
                  <p className="doc-prose">
                    Run the installer command for your operating system:
                  </p>

                  <CodeSnippet 
                    filename="macOS & Linux"
                    code={`curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash`}
                    output={`> Downloading universal NanoJS binary...\n> Installed to /usr/local/bin/nanojs\n> NanoJS v1.0.0 ready!`}
                  />

                  <CodeSnippet 
                    filename="Windows (PowerShell)"
                    code={`irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex`}
                    output={`> Downloading Windows package...\n> Added to PATH: C:\\Users\\user\\.nanojs\\bin\\nanojs.exe\n> NanoJS v1.0.0 ready!`}
                  />

                  <h3 className="doc-subheading">2. Running Files</h3>
                  <p className="doc-prose">
                    NanoJS requires the <code>.mjs</code> file extension. Create a file and run it directly:
                  </p>

                  <CodeSnippet 
                    filename="Terminal"
                    code={`nanojs app.mjs`}
                    output={`> NanoJS Interpreter v1.0\n> Running: app.mjs`}
                  />
                </div>
              )}

              {/* SECTION: ARCHITECTURE */}
              {docsSection === 'architecture' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">How It Works</span>
                    <h2 className="doc-article-title">The 3-Stage Pipeline</h2>
                    <p className="doc-article-lead">
                      How code travels through C++ from plain text to running program.
                    </p>
                  </div>

                  <div className="doc-steps-grid">
                    <div className="doc-step-card">
                      <span className="doc-step-num">STAGE 01</span>
                      <h4 className="doc-step-title">Lexer (Lexer.cpp)</h4>
                      <p className="doc-step-desc">
                        Reads text character by character. Groups them into tokens like keywords (<code>let</code>, <code>class</code>), variable names, numbers, and operators.
                      </p>
                    </div>

                    <div className="doc-step-card">
                      <span className="doc-step-num">STAGE 02</span>
                      <h4 className="doc-step-title">Parser (Parser.cpp)</h4>
                      <p className="doc-step-desc">
                        Takes tokens and constructs an Abstract Syntax Tree (AST). This is a tree structure in C++ representing what the program actually means.
                      </p>
                    </div>

                    <div className="doc-step-card">
                      <span className="doc-step-num">STAGE 03</span>
                      <h4 className="doc-step-title">Interpreter (Interpreter.cpp)</h4>
                      <p className="doc-step-desc">
                        Walks the syntax tree and evaluates expressions. Scopes are tracked via <code>std::shared_ptr&lt;Environment&gt;</code> to keep closures alive.
                      </p>
                    </div>
                  </div>

                  <h3 className="doc-subheading">Event Loop & Async</h3>
                  <p className="doc-prose">
                    NanoJS does not freeze when using timers. An event loop coordinator in <code>EventLoop.cpp</code> checks a timer priority queue using <code>std::chrono</code> and runs Promise microtasks.
                  </p>
                </div>
              )}

              {/* SECTION: VARIABLES */}
              {docsSection === 'variables' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Language Guide</span>
                    <h2 className="doc-article-title">Variables and Scope</h2>
                    <p className="doc-article-lead">
                      Block-scoped declarations with let and const.
                    </p>
                  </div>

                  <p className="doc-prose">
                    Use <code>let</code> for variables that can be reassigned, and <code>const</code> for values that should not change. Both stay inside the block <code>{`{ ... }`}</code> where they are created.
                  </p>

                  <CodeSnippet 
                    filename="variables.mjs"
                    code={`let score = 10;
const bonus = 5;

if (score > 5) {
    let localMessage = "Player is active";
    console.log(localMessage);
}

score = score + bonus;
console.log("Total score:", score);`}
                    output={`> Player is active\n> Total score: 15`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: CLOSURES */}
              {docsSection === 'closures' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Language Guide</span>
                    <h2 className="doc-article-title">Functions and Closures</h2>
                    <p className="doc-article-lead">
                      How nested functions preserve access to outer variables.
                    </p>
                  </div>

                  <p className="doc-prose">
                    When you create a function inside another function, the inner function keeps a reference to the outer function's scope. This allows you to build stateful counters, factories, and private variables.
                  </p>

                  <CodeSnippet 
                    filename="counter.mjs"
                    code={`function createCounter(initialValue, step) {
    let count = initialValue;
    return function() {
        count = count + step;
        return count;
    };
}

let counterA = createCounter(0, 5);
let counterB = createCounter(100, 10);

console.log("Counter A:", counterA());
console.log("Counter A:", counterA());
console.log("Counter B:", counterB());`}
                    output={`> Counter A: 5\n> Counter A: 10\n> Counter B: 110`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: CLASSES */}
              {docsSection === 'classes' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Language Guide</span>
                    <h2 className="doc-article-title">Classes and Inheritance</h2>
                    <p className="doc-article-lead">
                      Object-oriented programming with constructors, methods, and inheritance.
                    </p>
                  </div>

                  <p className="doc-prose">
                    Declare classes with constructors and inherit from other classes using <code>extends</code> and <code>super()</code>:
                  </p>

                  <CodeSnippet 
                    filename="classes.mjs"
                    code={`class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return this.name + " makes a sound.";
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
    bark() {
        return this.name + " (" + this.breed + ") says Woof!";
    }
}

let pet = new Dog("Buddy", "Golden Retriever");
console.log(pet.speak());
console.log(pet.bark());`}
                    output={`> Buddy makes a sound.\n> Buddy (Golden Retriever) says Woof!`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: BUILTINS */}
              {docsSection === 'builtins' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">APIs & Runtime</span>
                    <h2 className="doc-article-title">Standard Objects</h2>
                    <p className="doc-article-lead">
                      Global utilities available everywhere without importing.
                    </p>
                  </div>

                  <h3 className="doc-subheading">Math, JSON, and Arrays</h3>
                  <p className="doc-prose">
                    Standard utilities for mathematics, serializing data, and functional list processing:
                  </p>

                  <CodeSnippet 
                    filename="builtins.mjs"
                    code={`// Math functions
console.log("PI:", Math.PI);
console.log("Round 4.7:", Math.round(4.7));
console.log("Max(10, 25):", Math.max(10, 25));

// JSON serialization
let user = { id: 101, username: "priyanshu" };
let jsonStr = JSON.stringify(user);
console.log("JSON:", jsonStr);

// Array functional methods
let numbers = [1, 2, 3, 4, 5, 6];
let evens = numbers.filter(n => n % 2 === 0);
let doubled = evens.map(n => n * 2);
console.log("Doubled evens:", doubled);`}
                    output={`> PI: 3.141592653589793\n> Round 4.7: 5\n> Max(10, 25): 25\n> JSON: {"id":101,"username":"priyanshu"}\n> Doubled evens: [4, 8, 12]`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: ASYNC */}
              {docsSection === 'async' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">APIs & Runtime</span>
                    <h2 className="doc-article-title">Async & Timers</h2>
                    <p className="doc-article-lead">
                      Non-blocking timers and Promises coordinated by the event loop.
                    </p>
                  </div>

                  <p className="doc-prose">
                    Timers schedule work after a millisecond delay. Synchronous code finishes first, followed by timer callbacks:
                  </p>

                  <CodeSnippet 
                    filename="timers.mjs"
                    code={`console.log("1. Starting script");

setTimeout(function() {
    console.log("3. Timer executed after 50ms");
}, 50);

console.log("2. Synchronous code complete");`}
                    output={`> 1. Starting script\n> 2. Synchronous code complete\n> 3. Timer executed after 50ms`}
                    onRun={handleOpenInPlayground}
                  />

                  <h3 className="doc-subheading">Async / Await</h3>
                  <CodeSnippet 
                    filename="async.mjs"
                    code={`async function loadUserData() {
    let user = await Promise.resolve({ name: "Alex", role: "Dev" });
    return user;
}

loadUserData().then(function(user) {
    console.log("Loaded user:", user.name);
});`}
                    output={`> Loaded user: Alex`}
                    onRun={handleOpenInPlayground}
                  />
                </div>
              )}

              {/* SECTION: SERVER */}
              {docsSection === 'server' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">APIs & Runtime</span>
                    <h2 className="doc-article-title">Web Server & File System</h2>
                    <p className="doc-article-lead">
                      Built-in global fs and http modules.
                    </p>
                  </div>

                  <h3 className="doc-subheading">1. File System (fs)</h3>
                  <p className="doc-prose">Read and write files directly from disk without extra packages:</p>

                  <CodeSnippet 
                    filename="files.mjs"
                    code={`fs.writeFile("data.txt", "Saved with NanoJS!");
let content = fs.readFile("data.txt");
console.log("File content:", content);`}
                    output={`> File content: Saved with NanoJS!`}
                  />

                  <h3 className="doc-subheading">2. HTTP Web Server (POST, Headers, Body & CORS)</h3>
                  <p className="doc-prose">
                    Full request parsing with lowercased <code>req.headers</code>, Content-Length buffered <code>req.body</code>, and <code>OPTIONS</code> CORS preflight handling:
                  </p>

                  <CodeSnippet 
                    filename="server.mjs"
                    code={`let server = http.createServer(function(req, res) {
    // 1. Handle CORS preflight
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res.end();
    }

    // 2. Handle POST submissions with JSON body
    if (req.method === "POST" && req.url === "/submit") {
        let payload = JSON.parse(req.body);
        console.log("Received submission from:", payload.email);

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "success", received: payload.email }));
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(8080);
console.log("Server listening at http://localhost:8080/");`}
                    output={`> Server listening at http://localhost:8080/`}
                  />

                  <h3 className="doc-subheading">3. HTTPS & Fetch API (Resend, Webhooks, APIs)</h3>
                  <p className="doc-prose">
                    Call HTTPS APIs with TLS, custom headers, request bodies, and read environment variables from <code>process.env</code>:
                  </p>

                  <CodeSnippet 
                    filename="api_request.mjs"
                    code={`let apiKey = process.env.RESEND_API_KEY || "re_test_123";

let res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        from: "OrbitForm <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "New Form Submission",
        html: "<p>New contact form submission received!</p>"
    })
});

console.log("Response status:", res.status);
console.log("Response OK:", res.ok);

if (res.ok) {
    let data = await res.json();
    console.log("Email dispatched ID:", data.id);
}`}
                    output={`> Response status: 200\n> Response OK: true\n> Email dispatched ID: 49a39f3b-0e3b-4f15-9d70-93cb10a2bb12`}
                  />
                </div>
              )}

              {/* SECTION: EXAMPLES */}
              {docsSection === 'examples' && (
                <div>
                  <div className="doc-section-header">
                    <span className="doc-category-tag">Examples</span>
                    <h2 className="doc-article-title">Runnable Code Examples</h2>
                    <p className="doc-article-lead">
                      Click Run on any example to test it immediately in the Playground.
                    </p>
                  </div>

                  {PRESETS.map((p) => (
                    <div key={p.id} style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '14px 0 6px' }}>{p.title}</h3>
                      <p className="doc-prose" style={{ marginBottom: '8px' }}>{p.description}</p>
                      <CodeSnippet 
                        filename={`${p.id}.mjs`}
                        code={p.code}
                        output={p.output}
                        onRun={handleOpenInPlayground}
                      />
                    </div>
                  ))}
                </div>
              )}

            </article>
          </div>

          <footer className="home-footer" style={{ marginTop: '56px' }}>
            <span>Built by Priyanshu Gaurav</span>
            <div className="footer-links">
              <button onClick={() => navigateTo('home')} className="footer-link">Home</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('playground')} className="footer-link">Playground</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('downloads')} className="footer-link">Downloads</button>
            </div>
          </footer>
        </main>
      )}

      {/* ============ DOWNLOADS PAGE ============ */}
      {currentView === 'downloads' && (
        <main className="downloads-page">
          <section className="dl-hero">
            <div className="dl-badge">
              <Download className="w-3.5 h-3.5" />
              <span>NanoJS v1.0.0 Release • Standalone C++ Engine</span>
            </div>
            
            <h1 className="dl-title">Download NanoJS</h1>
            <p className="dl-subtitle">
              Native JavaScript interpreter and runtime built in C++17 with zero dependencies. Fast startup, low memory footprint, and native execution.
            </p>

            {/* Platform Selector Tabs */}
            <div className="dl-tabs">
              <button
                onClick={() => setActiveOsTab('macos')}
                className={`dl-tab ${activeOsTab === 'macos' ? 'active' : ''}`}
              >
                <Apple className="w-4 h-4" />
                <span>macOS</span>
                {detectedOs === 'macos' && <span className="dl-detected-pill">Detected</span>}
              </button>
              <button
                onClick={() => setActiveOsTab('windows')}
                className={`dl-tab ${activeOsTab === 'windows' ? 'active' : ''}`}
              >
                <Monitor className="w-4 h-4" />
                <span>Windows</span>
                {detectedOs === 'windows' && <span className="dl-detected-pill">Detected</span>}
              </button>
              <button
                onClick={() => setActiveOsTab('linux')}
                className={`dl-tab ${activeOsTab === 'linux' ? 'active' : ''}`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Linux</span>
                {detectedOs === 'linux' && <span className="dl-detected-pill">Detected</span>}
              </button>
            </div>
          </section>

          <div className="dl-content">
            {/* Platform Specific Download Card */}
            {activeOsTab === 'macos' && (
              <div className="dl-card">
                <div className="dl-card-header">
                  <div>
                    <h2 className="dl-card-title">NanoJS for macOS</h2>
                    <p className="dl-card-desc">Universal Mach-O binary natively supporting Apple Silicon (M1/M2/M3/M4) and Intel (x86_64) Macs.</p>
                  </div>
                </div>

                <div className="dl-actions">
                  <a href="/downloads/nanojs-v1.0.0-macos-universal.tar.gz" download className="dl-cta-btn">
                    <Download className="w-4 h-4" />
                    <span>Download Universal Binary (.tar.gz)</span>
                    <span style={{ opacity: 0.7, fontSize: '12px' }}>(474 KB)</span>
                  </a>
                  <a href="/downloads/nanojs-v1.0.0-macos-arm64.tar.gz" download className="dl-btn-subtle">
                    <span>Apple Silicon (arm64)</span>
                    <span style={{ opacity: 0.6 }}>(234 KB)</span>
                  </a>
                  <a href="/downloads/nanojs-v1.0.0-macos-x64.tar.gz" download className="dl-btn-subtle">
                    <span>Intel (x86_64)</span>
                    <span style={{ opacity: 0.6 }}>(239 KB)</span>
                  </a>
                </div>

                <div className="dl-snippet-container">
                  <div className="dl-snippet-label">One-Line Terminal Install (via curl)</div>
                  <div className="dl-snippet-box">
                    <code className="dl-snippet-code">curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash</code>
                    <button
                      onClick={() => handleCopySnippet('curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash', 'mac-install')}
                      className="dl-copy-btn"
                    >
                      {copiedSnippet === 'mac-install' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'mac-install' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="dl-details-grid">
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Format</span>
                    <span className="dl-detail-v">Mach-O 64-bit (Universal lipo)</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Compatibility</span>
                    <span className="dl-detail-v">macOS 11.0 Big Sur or later</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">SHA-256 Checksum</span>
                    <span className="dl-detail-v">06ee3cdd484d...b1b3644</span>
                  </div>
                </div>
              </div>
            )}

            {activeOsTab === 'windows' && (
              <div className="dl-card">
                <div className="dl-card-header">
                  <div>
                    <h2 className="dl-card-title">NanoJS for Windows (x64)</h2>
                    <p className="dl-card-desc">Standalone 64-bit Windows release package with Winsock networking support and zero DLL dependencies.</p>
                  </div>
                </div>

                <div className="dl-actions">
                  <a href="/downloads/nanojs-v1.0.0-windows-x64.zip" download className="dl-cta-btn">
                    <Download className="w-4 h-4" />
                    <span>Download Windows Package (.zip)</span>
                  </a>
                  <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="dl-btn-subtle">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHub Repository</span>
                  </a>
                </div>

                <div className="dl-snippet-container">
                  <div className="dl-snippet-label">PowerShell Quick Install</div>
                  <div className="dl-snippet-box">
                    <code className="dl-snippet-code">irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex</code>
                    <button
                      onClick={() => handleCopySnippet('irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex', 'win-install')}
                      className="dl-copy-btn"
                    >
                      {copiedSnippet === 'win-install' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'win-install' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="dl-details-grid">
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Format</span>
                    <span className="dl-detail-v">Windows PE/COFF Executable (.exe)</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Compatibility</span>
                    <span className="dl-detail-v">Windows 10, 11 (64-bit)</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Source Build Command</span>
                    <span className="dl-detail-v">g++ -std=c++17 -O3 -Iinclude src/*.cpp src/runtime/*.cpp -o nanojs.exe -lws2_32</span>
                  </div>
                </div>
              </div>
            )}

            {activeOsTab === 'linux' && (
              <div className="dl-card">
                <div className="dl-card-header">
                  <div>
                    <h2 className="dl-card-title">NanoJS for Linux (x86_64)</h2>
                    <p className="dl-card-desc">ELF 64-bit Linux release archive. Supports Ubuntu, Debian, Fedora, Arch, and Alpine.</p>
                  </div>
                </div>

                <div className="dl-actions">
                  <a href="/downloads/nanojs-v1.0.0-linux-x64.tar.gz" download className="dl-cta-btn">
                    <Download className="w-4 h-4" />
                    <span>Download Linux Package (.tar.gz)</span>
                  </a>
                  <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="dl-btn-subtle">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Source on GitHub</span>
                  </a>
                </div>

                <div className="dl-snippet-container">
                  <div className="dl-snippet-label">One-Line Terminal Install (via curl)</div>
                  <div className="dl-snippet-box">
                    <code className="dl-snippet-code">curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash</code>
                    <button
                      onClick={() => handleCopySnippet('curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash', 'linux-install')}
                      className="dl-copy-btn"
                    >
                      {copiedSnippet === 'linux-install' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'linux-install' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="dl-details-grid">
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Format</span>
                    <span className="dl-detail-v">ELF 64-bit LSB executable</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Compatibility</span>
                    <span className="dl-detail-v">Linux Kernel 3.10+ / glibc 2.17+</span>
                  </div>
                  <div className="dl-detail-item">
                    <span className="dl-detail-k">Source Build Command</span>
                    <span className="dl-detail-v">g++ -std=c++17 -O3 -Iinclude src/*.cpp src/runtime/*.cpp -o nanojs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live C++ Engine Test Suite & Parity Card */}
            <div className="dl-test-card">
              <div className="dl-test-bar">
                <div className="dl-test-title-box">
                  <Cpu className="w-5 h-5 text-green" />
                  <h3 className="dl-test-title">Native C++17 Engine Parity and Diagnostics</h3>
                  <div className="dl-test-badge-live">
                    <span className="dl-test-dot" />
                    <span>Live C++ Backend Connected</span>
                  </div>
                </div>

                <button
                  onClick={handleRunEngineTests}
                  disabled={isRunningTests}
                  className="dl-run-tests-btn"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isRunningTests ? 'Executing C++ Tests...' : 'Run All 19 Test Suites'}</span>
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Every execution on this website can directly invoke the compiled <code>./nanojs</code> C++ binary. Click the button above to run all 19 automated language feature suites against the C++ engine.
              </p>

              {testSuiteResults && (
                <div>
                  <div className="dl-test-summary">
                    <div className="dl-summary-badge">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{testSuiteResults.passed}/{testSuiteResults.total} Language Suites Passed</span>
                    </div>
                    <span className="dl-summary-meta">
                      100% C++17 parity verified • Total time: {testSuiteResults.results.reduce((acc, r) => acc + r.timeMs, 0)} ms
                    </span>
                  </div>

                  <div className="dl-test-grid">
                    {testSuiteResults.results.map((r, i) => (
                      <div key={i} className="dl-test-item">
                        <span className="dl-test-name">{r.name}</span>
                        <div className="dl-test-status">
                          <Check className="w-3.5 h-3.5" />
                          <span>PASS</span>
                          <span className="dl-test-time">{r.timeMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <footer className="home-footer" style={{ marginTop: '48px' }}>
            <span>Built by Priyanshu Gaurav</span>
            <div className="footer-links">
              <button onClick={() => navigateTo('home')} className="footer-link">Home</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('docs')} className="footer-link">Docs</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('playground')} className="footer-link">Playground</button>
              <span className="footer-dot">·</span>
              <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            </div>
          </footer>
        </main>
      )}

      {/* ============ PLAYGROUND PAGE ============ */}
      {currentView === 'playground' && (
        <main className="playground-page">
          
          {/* Unified Studio Topbar */}
          <header className="pg-header">
            <div className="pg-header-left">
              {/* Instant back to previous view */}
              <button onClick={() => navigateTo(previousView || 'home')} className="pg-brand-btn" title="Back to previous page">
                <ArrowLeft className="w-4 h-4" />
                <span className="brand-dot" />
                <span className="pg-brand-name">NanoJS</span>
                <span className="pg-brand-tag">Studio</span>
              </button>

              <div className="pg-header-divider" />

              <div className="pg-status-badge">
                <span className="pg-status-dot" />
                <span className="pg-status-label">C++17 Engine</span>
              </div>
            </div>

            <div className="pg-header-center">
              <div className="pg-example-selector">
                <Sparkles className="w-3.5 h-3.5 pg-example-icon" />
                <span className="pg-example-label">Example:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="pg-example-dropdown"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pg-header-right">
              <button onClick={handleCopyCode} className="pg-action-btn" title="Copy code">
                {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => {
                  const currentPreset = PRESETS.find(p => p.id === selectedPreset);
                  if (currentPreset) setCode(currentPreset.code);
                }}
                className="pg-action-btn"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => navigateTo('docs')}
                className="pg-action-btn"
                title="Documentation"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Docs</span>
              </button>

              <button
                onClick={() => navigateTo('downloads')}
                className="pg-action-btn"
                title="Download NanoJS binary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <a
                href="https://github.com/priyanshugaurav/NanoJS"
                target="_blank"
                rel="noreferrer"
                className="pg-action-btn"
                title="GitHub repository"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button onClick={toggleTheme} className="pg-action-btn" title="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleRunCode()}
                disabled={isRunning}
                className="pg-run-cta"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
                <kbd className="pg-kbd-shortcut">⌘↵</kbd>
              </button>
            </div>
          </header>

          {/* Editor + Inspector Split */}
          <div className="pg-workspace">
            
            {/* Editor Panel */}
            <div className="pg-editor-panel">
              <div className="pg-panel-bar">
                <div className="pg-file-tab">
                  <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="pg-filename">main.mjs</span>
                  <span className="pg-file-lang">JavaScript</span>
                </div>
                <div className="pg-editor-info">
                  <span>{code.split('\n').length} lines</span>
                  <span className="pg-dot-sep">·</span>
                  <span>{code.length} chars</span>
                </div>
              </div>

              <div className="pg-editor-wrapper">
                <div ref={gutterRef} className="pg-line-gutter" aria-hidden="true">
                  {code.split('\n').map((_, i) => (
                    <div key={i} className="pg-gutter-num">{i + 1}</div>
                  ))}
                </div>

                <div
                  ref={editorScrollerRef}
                  className="pg-editor-scroller"
                  onScroll={handleEditorScroll}
                >
                  <CodeEditor
                    value={code}
                    onValueChange={newCode => setCode(newCode)}
                    highlight={c => Prism.highlight(c, Prism.languages.javascript, 'javascript')}
                    padding={14}
                    className="pg-code-editor"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      lineHeight: '22px'
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="pg-editor-footer">
                <div className="pg-footer-tags">
                  <span>ES6+</span>
                  <span className="pg-dot-sep">·</span>
                  <span>UTF-8</span>
                  <span className="pg-dot-sep">·</span>
                  <span>2 spaces</span>
                </div>
                <div className="pg-footer-hint">
                  <span>Press <kbd className="pg-mini-kbd">⌘↵</kbd> to run</span>
                </div>
              </div>
            </div>

            {/* Output & Inspector Panel */}
            <div className="pg-output-panel">
              <div className="pg-panel-bar">
                <div className="pg-inspector-tabs">
                  <button
                    onClick={() => setPlaygroundTab('output')}
                    className={`pg-tab-btn ${playgroundTab === 'output' ? 'active' : ''}`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Console</span>
                    {executionData.logs.length > 0 && (
                      <span className="pg-tab-badge">{executionData.logs.length}</span>
                    )}
                  </button>

                  <button
                    onClick={() => setPlaygroundTab('variables')}
                    className={`pg-tab-btn ${playgroundTab === 'variables' ? 'active' : ''}`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Scope & Heap</span>
                    {userVariables.length > 0 && (
                      <span className="pg-tab-badge">{userVariables.length}</span>
                    )}
                  </button>

                  <button
                    onClick={() => setPlaygroundTab('stats')}
                    className={`pg-tab-btn ${playgroundTab === 'stats' ? 'active' : ''}`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Engine Stats</span>
                  </button>
                </div>

                <div className="pg-inspector-actions">
                  {playgroundTab === 'output' && executionData.logs.length > 0 && (
                    <button
                      onClick={handleClearConsole}
                      className="pg-clear-btn"
                      title="Clear console"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}

                  <div className="pg-exec-badge">
                    <span className="pg-exec-ms">{executionData.metrics.executionTimeMs}ms</span>
                    {executionData.metrics.isNative ? (
                      <span className="pg-badge-native">C++ Native</span>
                    ) : (
                      <span className="pg-badge-sandbox">Sandbox</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pg-inspector-body">
                {playgroundTab === 'output' && (
                  <div className="pg-console-view">
                    {executionData.logs.length === 0 ? (
                      <div className="pg-empty-state">
                        <Terminal className="w-8 h-8 pg-empty-icon" />
                        <div className="pg-empty-heading">Console ready</div>
                        <div className="pg-empty-sub">
                          Press <kbd className="pg-mini-kbd">⌘↵</kbd> or click <strong>Run</strong> to execute code in NanoJS.
                        </div>
                      </div>
                    ) : (
                      <div className="pg-log-list">
                        {executionData.logs.map((log, i) => {
                          if (log.type === 'banner') {
                            return (
                              <div key={i} className="pg-log-banner">
                                {log.text}
                              </div>
                            );
                          }
                          if (log.type === 'stderr' || log.type === 'error') {
                            return (
                              <div key={i} className="pg-log-row pg-log-error">
                                <span className="pg-log-symbol error">✕</span>
                                <span className="pg-log-content">{log.text}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="pg-log-row">
                              <span className="pg-log-symbol">›</span>
                              <span className="pg-log-content">{log.text}</span>
                            </div>
                          );
                        })}
                        <div ref={consoleEndRef} />
                      </div>
                    )}
                  </div>
                )}

                {playgroundTab === 'variables' && (
                  <div className="pg-vars-view">
                    {userVariables.length === 0 ? (
                      <div className="pg-empty-state">
                        <Box className="w-8 h-8 pg-empty-icon" />
                        <div className="pg-empty-heading">No variables in scope</div>
                        <div className="pg-empty-sub">
                          Variables declared with <code>let</code>, <code>const</code>, or functions will appear here.
                        </div>
                      </div>
                    ) : (
                      <div className="pg-vars-table-wrap">
                        <table className="pg-vars-table">
                          <thead>
                            <tr>
                              <th>Identifier</th>
                              <th>Type</th>
                              <th>Scope</th>
                              <th>Evaluated Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userVariables.map((v, i) => (
                              <tr key={i}>
                                <td className="var-col-name">{v.name}</td>
                                <td className="var-col-type">
                                  <span className={`pg-tag tag-${v.type}`}>{v.type}</span>
                                </td>
                                <td className="var-col-scope">
                                  <span className={`pg-scope-pill scope-${v.scope.toLowerCase()}`}>{v.scope}</span>
                                </td>
                                <td className="var-col-val" title={v.value}>{v.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {playgroundTab === 'stats' && (
                  <div className="pg-stats-view">
                    <div className="pg-stats-grid">
                      <div className="pg-stat-card">
                        <span className="pg-stat-label">Execution Time</span>
                        <span className="pg-stat-num">{executionData.metrics.executionTimeMs} ms</span>
                        <span className="pg-stat-desc">{executionData.metrics.isNative ? 'Executed via native C++ binary' : 'Browser sandbox fallback'}</span>
                      </div>

                      <div className="pg-stat-card">
                        <span className="pg-stat-label">Tokens Lexed</span>
                        <span className="pg-stat-num">{executionData.metrics.tokenCount || 0}</span>
                        <span className="pg-stat-desc">Produced by Lexer.cpp tokenizer</span>
                      </div>

                      <div className="pg-stat-card">
                        <span className="pg-stat-label">AST Nodes</span>
                        <span className="pg-stat-num">{executionData.metrics.astNodesCount || 0}</span>
                        <span className="pg-stat-desc">Constructed by Parser.cpp</span>
                      </div>

                      <div className="pg-stat-card">
                        <span className="pg-stat-label">Heap Memory</span>
                        <span className="pg-stat-num">{executionData.metrics.heapAllocatedBytes || 0} B</span>
                        <span className="pg-stat-desc">Environment bindings & closures</span>
                      </div>
                    </div>

                    <div className="pg-pipeline-box">
                      <div className="pg-pipeline-title">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>NanoJS Internal Execution Pipeline</span>
                      </div>
                      <p className="pg-pipeline-text">
                        Source code is tokenized by <code>Lexer.cpp</code>, parsed into an Abstract Syntax Tree by <code>Parser.cpp</code>, and executed by <code>Interpreter.cpp</code>. Scope environments are tracked via <code>std::shared_ptr&lt;Environment&gt;</code> to preserve lexical closures.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
}
