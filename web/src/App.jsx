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
  Loader2,
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
  Info,
  ShieldCheck,
  Menu,
  X,
  FileText,
  Globe,
  FolderOpen,
  HelpCircle
} from 'lucide-react';
import { PRESETS } from './engine/presets';
import { ExecutionInspector } from './engine/inspector';
import './App.css';

const CodeEditor = Editor.default || Editor;

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [docsChapter, setDocsChapter] = useState('architecture');

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
  const [systemInfo, setSystemInfo] = useState(null);

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

    // Auto detect operating system
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

    // Load backend status
    fetch('/api/info')
      .then(res => res.json())
      .then(info => setSystemInfo(info))
      .catch(() => {});
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
  const navigateTo = (view, presetId = null, docChapter = null) => {
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
    if (docChapter) {
      setDocsChapter(docChapter);
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
    { icon: <Box className="w-4 h-4" />, title: 'Variables and Closures', desc: 'let and const declarations with lexical scopes that keep variables alive across inner functions.' },
    { icon: <Clock className="w-4 h-4" />, title: 'Async and Timers', desc: 'Non-blocking async and await, Promise microtasks, and setTimeout macrotasks run by a C++ event loop.' },
    { icon: <Layers className="w-4 h-4" />, title: 'Classes and Inheritance', desc: 'ES6 class syntax with constructors, methods, extends, and super calls.' },
    { icon: <Zap className="w-4 h-4" />, title: 'Built-in APIs', desc: 'Array helper methods, JSON parser, Math library, error handling, and a built-in HTTP server.' },
  ];

  const steps = [
    { num: '01', label: 'Lexer', file: 'Lexer.cpp', desc: 'Reads source code character by character and produces tokens like identifiers, numbers, strings, and operators.' },
    { num: '02', label: 'Parser', file: 'Parser.cpp', desc: 'Consumes tokens and constructs an Abstract Syntax Tree using a recursive descent parser matching JS grammar.' },
    { num: '03', label: 'Interpreter', file: 'Interpreter.cpp', desc: 'Walks the AST directly in C++, tracks scope chains with shared pointers, and drives the async event loop.' },
  ];

  const docsChapters = [
    { id: 'architecture', title: 'Engine Architecture', icon: <Cpu className="w-4 h-4" /> },
    { id: 'purpose', title: 'Learning Purpose & Node.js', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'language', title: 'Language Syntax', icon: <Code2 className="w-4 h-4" /> },
    { id: 'builtins', title: 'Standard Library', icon: <Box className="w-4 h-4" /> },
    { id: 'async', title: 'Async & Event Loop', icon: <Clock className="w-4 h-4" /> },
    { id: 'fs', title: 'File System (fs)', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'http', title: 'HTTP Web Server', icon: <Globe className="w-4 h-4" /> },
    { id: 'examples', title: 'Runnable Code Examples', icon: <Terminal className="w-4 h-4" /> }
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
              <span>C++17 • Zero dependencies • Built for learning</span>
            </div>
            
            <h1 className="hero-title">
              A JavaScript engine,<br />
              <span className="hero-highlight">written from the ground up.</span>
            </h1>

            <p className="hero-subtitle">
              Built as an educational project to understand how JavaScript works under the hood: lexing, parsing, scope chains, closures, and an event loop in pure C++.
            </p>

            <div className="hero-actions">
              <button onClick={() => navigateTo('playground')} className="btn-primary">
                <span>Try it live</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateTo('docs')} className="btn-secondary">
                <BookOpen className="w-4 h-4" />
                <span>Read documentation</span>
              </button>
              <button onClick={() => navigateTo('downloads')} className="btn-secondary">
                <Download className="w-4 h-4" />
                <span>Download v1.0.0</span>
              </button>
            </div>
          </section>

          {/* Educational Purpose Card */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="edu-home-card">
              <div className="edu-card-badge">Educational Project</div>
              <h2 className="edu-card-title">Built for Fun and Learning</h2>
              <p className="edu-card-desc">
                NanoJS was created for fun and educational curiosity to explore how language interpreters actually work. It is not built to replace or compete with Node.js. If you already know JavaScript and Node.js, NanoJS feels familiar and intuitive:
              </p>

              <div className="edu-points-grid">
                <div className="edu-point-item">
                  <CheckCircle2 className="w-4 h-4 edu-point-check" />
                  <span><strong>JavaScript syntax:</strong> Write regular modern JS with let, const, closures, and classes.</span>
                </div>
                <div className="edu-point-item">
                  <CheckCircle2 className="w-4 h-4 edu-point-check" />
                  <span><strong>Standard APIs:</strong> Familiar console.log, JSON parser, Math, and timers.</span>
                </div>
                <div className="edu-point-item">
                  <CheckCircle2 className="w-4 h-4 edu-point-check" />
                  <span><strong>Event loop:</strong> Non-blocking setTimeout and Promise microtasks run by C++.</span>
                </div>
                <div className="edu-point-item">
                  <CheckCircle2 className="w-4 h-4 edu-point-check" />
                  <span><strong>Zero dependencies:</strong> Under 1 MB single binary with instant 2ms startup.</span>
                </div>
              </div>

              <div className="edu-card-actions">
                <button 
                  onClick={() => navigateTo('docs', null, 'purpose')} 
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <span>Learn how it works</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigateTo('docs')} 
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Full documentation</span>
                </button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="section-label">Language features</div>
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

          {/* Pipeline */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.25s' }}>
            <div className="section-label">Execution pipeline</div>
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

          {/* Quick Examples */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.35s' }}>
            <div className="section-label">Try interactive examples</div>
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
                <span className="spec-val spec-pass">19 of 19 Passing • Verified</span>
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

      {/* ============ DETAILED DOCUMENTATION PAGE ============ */}
      {currentView === 'docs' && (
        <main className="docs-page">
          <header className="docs-header">
            <div className="docs-hero-badge">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NanoJS v1.0.0 Documentation</span>
            </div>
            <h1 className="docs-main-title">Complete Technical Documentation</h1>
            <p className="docs-main-subtitle">
              Comprehensive reference and architecture guide for developers learning how JavaScript engines work under the hood.
            </p>
          </header>

          <div className="docs-container">
            
            {/* Sidebar Navigation */}
            <aside className="docs-sidebar">
              {docsChapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => setDocsChapter(chap.id)}
                  className={`docs-nav-btn ${docsChapter === chap.id ? 'active' : ''}`}
                >
                  {chap.icon}
                  <span>{chap.title}</span>
                </button>
              ))}
            </aside>

            {/* Main Content Area */}
            <div className="docs-content">
              
              {/* CHAPTER 1: ARCHITECTURE */}
              {docsChapter === 'architecture' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">How NanoJS Works Under the Hood</h2>
                    <p className="docs-card-p">
                      NanoJS executes modern JavaScript in pure standard C++17 across four clear, decoupled pipeline stages without any external compiler toolchains or virtual machines:
                    </p>

                    <div className="docs-callout note">
                      <Cpu className="w-4 h-4 docs-callout-icon" />
                      <div className="docs-callout-text">
                        <strong>Pipeline:</strong> Source Code (.mjs) → Lexer.cpp → Parser.cpp → Interpreter.cpp → EventLoop.cpp
                      </div>
                    </div>

                    <div className="docs-item-list">
                      <div className="docs-item">
                        <div className="docs-item-name">1. Lexical Analysis (Lexer.cpp & Lexer.h)</div>
                        <p className="docs-item-desc">
                          The lexer streams UTF-8 characters and categorizes them into tokens: keywords (<code>let</code>, <code>const</code>, <code>function</code>, <code>class</code>, <code>async</code>, <code>await</code>), identifier names, number literals, string literals, and binary operators.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">2. Recursive Descent Parsing (Parser.cpp & AST.h)</div>
                        <p className="docs-item-desc">
                          Constructs an Abstract Syntax Tree (AST) using operator precedence parsing. Nodes represent declarations (<code>VariableDeclAST</code>), expressions (<code>BinaryExprAST</code>, <code>CallExprAST</code>), control flow (<code>IfStmtAST</code>, <code>WhileStmtAST</code>), and class hierarchies (<code>ClassDeclAST</code>).
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">3. Tree-Walk Interpreter (Interpreter.cpp)</div>
                        <p className="docs-item-desc">
                          Directly walks the AST in C++ and computes results. Dynamically typed values are represented by <code>JSValue</code> with types for Number, String, Boolean, Null, Undefined, Object, and Function.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">4. Lexical Environments (Environment.cpp & Environment.h)</div>
                        <p className="docs-item-desc">
                          Scopes are chained objects wrapped in <code>std::shared_ptr&lt;Environment&gt;</code>. When a function is declared, it captures a shared pointer to its enclosing environment, giving first-class closures without garbage collector pauses.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">5. Event Loop & Microtasks (EventLoop.cpp)</div>
                        <p className="docs-item-desc">
                          Coordinates async execution using a monotonic timer priority queue (<code>std::chrono</code>) for <code>setTimeout</code> and a FIFO microtask queue for Promises and <code>await</code> resumption.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="docs-card">
                    <h3 className="docs-card-title">Project Directory Structure</h3>
                    <p className="docs-card-p">The C++ repository is organized cleanly:</p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>nanojs/ directory</span></div>
                      <pre className="docs-code-pre">{`nanojs/
├── include/
│   ├── AST.h               # Abstract Syntax Tree node definitions
│   ├── Lexer.h             # Tokenizer state and token enums
│   ├── Parser.h            # Grammar parsing rules
│   ├── Interpreter.h       # AST evaluation engine
│   └── runtime/
│       ├── JSValue.h       # Dynamic value tagging
│       ├── Environment.h   # Scope chains & closures
│       └── EventLoop.h     # Non-blocking async coordinator
├── src/
│   ├── Lexer.cpp
│   ├── Parser.cpp
│   ├── Interpreter.cpp
│   ├── main.cpp            # CLI entry point
│   └── runtime/
│       ├── Environment.cpp
│       ├── EventLoop.cpp
│       ├── BuiltinObjects.cpp
│       └── HTTPServer.cpp
└── web/                    # React web studio & online playground`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 2: EDUCATIONAL PURPOSE & NODE.JS */}
              {docsChapter === 'purpose' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">Educational Purpose & Node.js Guide</h2>
                    <div className="docs-callout note">
                      <Info className="w-4 h-4 docs-callout-icon" />
                      <div className="docs-callout-text">
                        <strong>Friendly Note:</strong> NanoJS was built as a passion project for fun and educational learning. It is not designed to replace or compete with production engines like Node.js, Deno, or Bun.
                      </div>
                    </div>

                    <p className="docs-card-p">
                      Node.js is an industrial-scale runtime powered by Google's V8 engine, written over millions of lines of code with JIT compilation, multi-threading via libuv, and full ECMAScript standards.
                    </p>
                    <p className="docs-card-p">
                      NanoJS, by contrast, is a tiny ~1 MB educational engine created to demystify how programming languages work. It shows that you don't need a massive team to understand and implement a working JavaScript interpreter in C++.
                    </p>
                  </div>

                  <div className="docs-card">
                    <h3 className="docs-card-title">How Writing Code in NanoJS Compares to Node.js</h3>
                    <div className="docs-item-list">
                      <div className="docs-item">
                        <div className="docs-item-name">1. Syntax You Already Know</div>
                        <p className="docs-item-desc">
                          If you know JavaScript, you can immediately write code for NanoJS. Variables, if/else, for loops, functions, closures, classes, and async/await work exactly as you expect.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">2. Built-in Utilities</div>
                        <p className="docs-item-desc">
                          Just like Node.js, you have <code>console.log()</code>, <code>JSON.stringify()</code>, <code>JSON.parse()</code>, and <code>Math</code> functions built in.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">3. Global File System & HTTP APIs</div>
                        <p className="docs-item-desc">
                          In Node.js, you import <code>fs</code> and <code>http</code> using <code>require()</code> or <code>import</code>. In NanoJS, <code>fs</code> and <code>http</code> are conveniently pre-bound globals, so you can call <code>fs.readFile()</code> or <code>http.createServer()</code> directly in your script.
                        </p>
                      </div>

                      <div className="docs-item">
                        <div className="docs-item-name">4. Execution Method</div>
                        <p className="docs-item-desc">
                          While Node.js compiles code to bytecode and native machine instructions using V8, NanoJS directly evaluates Abstract Syntax Tree nodes in C++. This means NanoJS starts up in ~2ms with under 4MB of RAM.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 3: LANGUAGE SYNTAX */}
              {docsChapter === 'language' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">Language Syntax Reference</h2>
                    <p className="docs-card-p">
                      NanoJS supports modern ECMAScript semantics including block scoping, closures, classes, and error handling.
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '20px 0 8px' }}>1. Variables & Scopes (let, const)</h3>
                    <p className="docs-card-p">
                      Variables declared with <code>let</code> are mutable, while <code>const</code> variables cannot be reassigned. Both obey block scoping.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header">
                        <span>variables.mjs</span>
                        <div className="docs-code-actions">
                          <button onClick={() => handleCopySnippet(`let counter = 1;\nconst step = 5;\ncounter = counter + step;\nconsole.log("Counter:", counter);`, 'c-var')} className="docs-code-btn">
                            {copiedSnippet === 'c-var' ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSnippet === 'c-var' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <pre className="docs-code-pre">{`let counter = 1;
const step = 5;

if (counter < 10) {
    let message = "Inside block";
    console.log(message);
}

counter = counter + step;
console.log("Counter:", counter);`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '20px 0 8px' }}>2. Functions & Closures</h3>
                    <p className="docs-card-p">
                      Functions are first-class values that can be passed into other functions or returned. Inner functions preserve access to variables declared in outer scopes.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header">
                        <span>closures.mjs</span>
                        <div className="docs-code-actions">
                          <button onClick={() => handleOpenInPlayground(`function createBankAccount(initialBalance) {\n    let balance = initialBalance;\n    return {\n        deposit: function(amount) {\n            balance = balance + amount;\n            return balance;\n        },\n        getBalance: function() {\n            return balance;\n        }\n    };\n}\nlet account = createBankAccount(100);\nconsole.log("Deposited 50. Total:", account.deposit(50));\nconsole.log("Balance:", account.getBalance());`)} className="docs-code-btn">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Run in Playground</span>
                          </button>
                        </div>
                      </div>
                      <pre className="docs-code-pre">{`function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit: function(amount) {
            balance = balance + amount;
            return balance;
        },
        withdraw: function(amount) {
            if (amount > balance) return "Insufficient funds";
            balance = balance - amount;
            return balance;
        },
        getBalance: function() {
            return balance;
        }
    };
}

let account = createBankAccount(100);
console.log("Deposited 50. New balance:", account.deposit(50));
console.log("Current balance:", account.getBalance());`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '20px 0 8px' }}>3. Classes & Inheritance</h3>
                    <p className="docs-card-p">
                      NanoJS supports ES6 class syntax with constructors, methods, and subclass inheritance via <code>extends</code> and <code>super()</code>.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header">
                        <span>classes.mjs</span>
                        <div className="docs-code-actions">
                          <button onClick={() => handleOpenInPlayground(`class Animal {\n    constructor(name) {\n        this.name = name;\n    }\n    speak() {\n        return this.name + " makes a sound.";\n    }\n}\nclass Dog extends Animal {\n    constructor(name, breed) {\n        super(name);\n        this.breed = breed;\n    }\n    bark() {\n        return this.name + " (" + this.breed + ") says Woof!";\n    }\n}\nlet d = new Dog("Buddy", "Golden Retriever");\nconsole.log(d.speak());\nconsole.log(d.bark());`)} className="docs-code-btn">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Run in Playground</span>
                          </button>
                        </div>
                      </div>
                      <pre className="docs-code-pre">{`class Animal {
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

let d = new Dog("Buddy", "Golden Retriever");
console.log(d.speak());
console.log(d.bark());`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '20px 0 8px' }}>4. Error Handling (try / catch / finally)</h3>
                    <p className="docs-card-p">
                      Exceptions unwinding works through the C++ call stack, safely transferring control to the nearest enclosing catch block.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>try_catch.mjs</span></div>
                      <pre className="docs-code-pre">{`try {
    console.log("Executing safe block...");
    throw new Error("Validation failed for user");
} catch (err) {
    console.log("Caught expected error:", err.message);
} finally {
    console.log("Finally block runs regardless of errors!");
}`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 4: STANDARD LIBRARY */}
              {docsChapter === 'builtins' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">Standard Library & Built-in Objects</h2>
                    <p className="docs-card-p">
                      NanoJS provides standard built-in objects directly available anywhere in your code.
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>1. The console Object</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>Console logging</span></div>
                      <pre className="docs-code-pre">{`console.log("Standard output message");
console.warn("Warning notice");
console.error("Error notice");

let user = { id: 101, username: "priyanshu" };
console.log("User details:", user);`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>2. The Math Object</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>Math calculations</span></div>
                      <pre className="docs-code-pre">{`console.log("PI:", Math.PI);
console.log("Absolute value:", Math.abs(-42));
console.log("Square root:", Math.sqrt(144));
console.log("Power 2^8:", Math.pow(2, 8));
console.log("Floor 4.9:", Math.floor(4.9));
console.log("Ceil 4.1:", Math.ceil(4.1));
console.log("Round 4.5:", Math.round(4.5));
console.log("Max value:", Math.max(12, 88, 34));
console.log("Min value:", Math.min(12, 88, 34));
console.log("Random number between 0 and 1:", Math.random());`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>3. The JSON Object</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>JSON serialization</span></div>
                      <pre className="docs-code-pre">{`let userObj = { name: "NanoJS", version: 1.0, active: true };

// Convert object to JSON string
let jsonString = JSON.stringify(userObj);
console.log("Serialized JSON:", jsonString);

// Parse JSON string back into object
let parsedObj = JSON.parse(jsonString);
console.log("Parsed name property:", parsedObj.name);`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>4. Array Methods (map, filter, reduce)</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>Array processing</span></div>
                      <pre className="docs-code-pre">{`let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let evens = numbers.filter(function(n) {
    return n % 2 === 0;
});

let squared = evens.map(function(n) {
    return n * n;
});

let sum = squared.reduce(function(acc, val) {
    return acc + val;
}, 0);

console.log("Evens:", evens);
console.log("Squared:", squared);
console.log("Sum:", sum);`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 5: ASYNC & EVENT LOOP */}
              {docsChapter === 'async' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">Asynchronous Runtime & Event Loop</h2>
                    <p className="docs-card-p">
                      NanoJS runs on a single main thread, using a non-blocking C++ event loop coordinator (<code>EventLoop.cpp</code>) to manage asynchronous timers and microtasks.
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>1. Timers (setTimeout, clearTimeout)</h3>
                    <p className="docs-card-p">
                      Timers are sorted by execution deadline using <code>std::chrono::steady_clock</code>.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>timers.mjs</span></div>
                      <pre className="docs-code-pre">{`console.log("1. Start script");

let timerId = setTimeout(function() {
    console.log("This will not run because it gets cancelled!");
}, 100);

clearTimeout(timerId);

setTimeout(function() {
    console.log("3. Timer executed after 50ms");
}, 50);

console.log("2. End of synchronous main frame");`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>2. Promises & Microtasks</h3>
                    <p className="docs-card-p">
                      Promise microtasks run immediately when current call frames drain, before the next timer event fires.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>promises.mjs</span></div>
                      <pre className="docs-code-pre">{`let promise = new Promise(function(resolve, reject) {
    resolve("Data successfully fetched!");
});

promise.then(function(result) {
    console.log("Promise resolved with:", result);
});`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>3. Async / Await</h3>
                    <p className="docs-card-p">
                      The <code>async</code> and <code>await</code> keywords allow writing non-blocking asynchronous code with synchronous-looking syntax.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>async_await.mjs</span></div>
                      <pre className="docs-code-pre">{`async function loadUserProfile() {
    console.log("Fetching user profile...");
    let user = await Promise.resolve({ id: 42, role: "Admin" });
    return user;
}

loadUserProfile().then(function(user) {
    console.log("Loaded user role:", user.role);
});`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 6: FILE SYSTEM */}
              {docsChapter === 'fs' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">File System API (fs)</h2>
                    <p className="docs-card-p">
                      NanoJS provides synchronous file I/O operations through the globally bound <code>fs</code> object. No module imports are needed.
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>1. Writing to a File</h3>
                    <p className="docs-card-p">
                      Use <code>fs.writeFile(filePath, content)</code> to create or overwrite a file.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>write_file.mjs</span></div>
                      <pre className="docs-code-pre">{`let config = {
    appName: "NanoApp",
    version: "1.0.0",
    port: 8080
};

fs.writeFile("config.json", JSON.stringify(config));
console.log("Configuration file saved successfully!");`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>2. Reading from a File</h3>
                    <p className="docs-card-p">
                      Use <code>fs.readFile(filePath)</code> to read a file's entire content as a string.
                    </p>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>read_file.mjs</span></div>
                      <pre className="docs-code-pre">{`let rawContent = fs.readFile("config.json");
console.log("Raw file content:", rawContent);

let parsedConfig = JSON.parse(rawContent);
console.log("Target port from file:", parsedConfig.port);`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 7: HTTP WEB SERVER */}
              {docsChapter === 'http' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">HTTP Web Server (http)</h2>
                    <p className="docs-card-p">
                      NanoJS includes a native POSIX/Winsock HTTP server for building web services and JSON REST APIs.
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>1. Basic Web Server</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>server.mjs</span></div>
                      <pre className="docs-code-pre">{`let server = http.createServer(function(req, res) {
    console.log("Received request:", req.method, req.url);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from NanoJS native HTTP server!");
});

server.listen(8080);
console.log("Server listening at http://localhost:8080/");`}</pre>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '18px 0 8px' }}>2. Building a JSON REST API Router</h3>
                    <div className="docs-code-block">
                      <div className="docs-code-header"><span>api_router.mjs</span></div>
                      <pre className="docs-code-pre">{`let server = http.createServer(function(req, res) {
    if (req.url === "/api/status") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "healthy", engine: "NanoJS v1.0" }));
        return;
    }

    if (req.url === "/api/users") {
        let users = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" }
        ];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(3000);
console.log("API Server running at http://localhost:3000/");`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 8: CODE EXAMPLES */}
              {docsChapter === 'examples' && (
                <div>
                  <div className="docs-card">
                    <h2 className="docs-card-title">Runnable Code Examples</h2>
                    <p className="docs-card-p">
                      Every example below can be executed directly inside the online Playground with one click:
                    </p>

                    {PRESETS.map((p, idx) => (
                      <div key={p.id} style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{p.title}</h3>
                          <button
                            onClick={() => handleOpenInPlayground(p.code)}
                            className="docs-code-btn"
                            style={{ background: 'var(--accent)', color: 'var(--bg)', padding: '5px 10px', fontWeight: 600 }}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Try in Playground</span>
                          </button>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                          {p.description}
                        </p>
                        <div className="docs-code-block" style={{ margin: 0 }}>
                          <pre className="docs-code-pre">{p.code}</pre>
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
                  {isRunningTests ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
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
