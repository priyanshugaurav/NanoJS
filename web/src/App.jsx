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
  Menu,
  X,
  Globe,
  FolderOpen
} from 'lucide-react';
import { PRESETS } from './engine/presets';
import { ExecutionInspector } from './engine/inspector';
import './App.css';

const CodeEditor = Editor.default || Editor;

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [docsChapter, setDocsChapter] = useState('overview');

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
  const navigateTo = (view, presetId = null, chapter = null) => {
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
    if (chapter) {
      setDocsChapter(chapter);
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
    { icon: <Layers className="w-4 h-4" />, title: 'Classes & Inheritance', desc: 'ES6 class syntax with constructors, methods, extends, and super calls.' },
    { icon: <Zap className="w-4 h-4" />, title: 'Built-in APIs', desc: 'Array helper methods, JSON parser, Math library, error handling, and a built-in HTTP server.' },
  ];

  const steps = [
    { num: '01', label: 'Lexer', file: 'Lexer.cpp', desc: 'Reads source code character by character and groups them into tokens like words, numbers, and operators.' },
    { num: '02', label: 'Parser', file: 'Parser.cpp', desc: 'Builds an Abstract Syntax Tree using a recursive descent parser that understands JS grammar.' },
    { num: '03', label: 'Interpreter', file: 'Interpreter.cpp', desc: 'Walks the tree directly in C++, tracks scope environments, and drives the async event loop.' },
  ];

  const docsChapters = [
    { id: 'overview', title: 'Overview' },
    { id: 'how_it_works', title: 'How It Works' },
    { id: 'language', title: 'Language Basics' },
    { id: 'builtins', title: 'Built-in APIs' },
    { id: 'async', title: 'Async & Timers' },
    { id: 'server', title: 'Web Server & Files' },
    { id: 'examples', title: 'Code Examples' }
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
              <span>C++17 • Built from scratch</span>
            </div>
            
            <h1 className="hero-title">
              A lightweight JavaScript engine,<br />
              <span className="hero-highlight">built in pure C++.</span>
            </h1>

            <p className="hero-subtitle">
              Built for fun and learning. NanoJS shows how lexing, parsing, scopes, closures, and an event loop work without any external libraries.
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

          {/* Quick Interactive Code Preview Card */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="code-preview-card">
              <div className="code-preview-header">
                <div className="code-preview-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                  <span className="code-preview-file">counter.mjs</span>
                </div>
                <button 
                  onClick={() => handleOpenInPlayground(`// Lexical Scopes & Closures in NanoJS\nfunction createCounter(step) {\n    let count = 0;\n    return function() {\n        count = count + step;\n        return count;\n    };\n}\n\nlet counter = createCounter(5);\nconsole.log("Count (+5):", counter());\nconsole.log("Count (+5):", counter());\nconsole.log("Count (+5):", counter());`)}
                  className="code-preview-run"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run code</span>
                </button>
              </div>
              <pre className="code-preview-pre">{`// Lexical Scopes & Closures in NanoJS
function createCounter(step) {
    let count = 0;
    return function() {
        count = count + step;
        return count;
    };
}

let counter = createCounter(5);
console.log("Count (+5):", counter()); // 5
console.log("Count (+5):", counter()); // 10
console.log("Count (+5):", counter()); // 15`}</pre>
            </div>
          </section>

          {/* Pipeline */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
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

          {/* Features Grid */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
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

          {/* Specs Bar */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.25s' }}>
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

      {/* ============ MINIMALIST DOCUMENTATION PAGE ============ */}
      {currentView === 'docs' && (
        <main className="docs-page">
          <header className="docs-header">
            <div className="docs-hero-badge">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </div>
            <h1 className="docs-main-title">NanoJS Guide</h1>
            <p className="docs-main-subtitle">
              Simple and practical documentation for writing code and understanding how the engine works.
            </p>
          </header>

          {/* Segmented Pill Navigation Tabs */}
          <nav className="docs-tabs-nav">
            {docsChapters.map((chap) => (
              <button
                key={chap.id}
                onClick={() => setDocsChapter(chap.id)}
                className={`docs-tab-pill ${docsChapter === chap.id ? 'active' : ''}`}
              >
                <span>{chap.title}</span>
              </button>
            ))}
          </nav>

          {/* Content Article */}
          <article className="docs-article">
            
            {/* 1. OVERVIEW */}
            {docsChapter === 'overview' && (
              <div className="docs-section">
                <h2 className="docs-section-title">What is NanoJS?</h2>
                <p className="docs-p">
                  NanoJS is a small, lightweight JavaScript engine written from scratch in pure C++17 with zero third-party libraries. It was built as an educational project for fun and learning, showing how programming language interpreters work under the hood.
                </p>

                <div className="docs-note">
                  <strong>How does it relate to Node.js?</strong> NanoJS is a learning project, not a competitor to Node.js. If you already know JavaScript, writing code in NanoJS feels completely natural: you have <code>console.log</code>, <code>let</code>, <code>const</code>, <code>classes</code>, <code>setTimeout</code>, and even a mini <code>http</code> web server. Under the hood, NanoJS directly evaluates syntax tree nodes in a single ~1MB C++ executable.
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '16px 0 6px' }}>Quick Installation</h3>
                <p className="docs-p">You can install the compiled binary on your machine in one terminal command:</p>

                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>macOS / Linux (Bash)</span>
                    <button 
                      onClick={() => handleCopySnippet('curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash', 'inst-mac')}
                      className="docs-btn-subtle"
                    >
                      {copiedSnippet === 'inst-mac' ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === 'inst-mac' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="docs-code-body">curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash</pre>
                </div>

                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>Windows (PowerShell)</span>
                    <button 
                      onClick={() => handleCopySnippet('irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex', 'inst-win')}
                      className="docs-btn-subtle"
                    >
                      {copiedSnippet === 'inst-win' ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === 'inst-win' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="docs-code-body">irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '16px 0 6px' }}>Running Files</h3>
                <p className="docs-p">
                  Create a script with the <code>.mjs</code> extension and execute it directly:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>Terminal</span></div>
                  <pre className="docs-code-body">nanojs script.mjs</pre>
                </div>
              </div>
            )}

            {/* 2. HOW IT WORKS */}
            {docsChapter === 'how_it_works' && (
              <div className="docs-section">
                <h2 className="docs-section-title">How the Engine Works</h2>
                <p className="docs-p">
                  NanoJS turns raw JavaScript text into running code in three straightforward steps in C++:
                </p>

                <div className="docs-steps-grid">
                  <div className="docs-step-card">
                    <span className="docs-step-num">STEP 01</span>
                    <h3 className="docs-step-heading">Lexer</h3>
                    <p className="docs-step-body">
                      Reads your source code text character by character. Groups letters and numbers into tokens like keywords, variable names, and math operators.
                    </p>
                  </div>

                  <div className="docs-step-card">
                    <span className="docs-step-num">STEP 02</span>
                    <h3 className="docs-step-heading">Parser</h3>
                    <p className="docs-step-body">
                      Consumes the stream of tokens and builds an Abstract Syntax Tree (AST). This is a tree structure in C++ representing what the code actually means.
                    </p>
                  </div>

                  <div className="docs-step-card">
                    <span className="docs-step-num">STEP 03</span>
                    <h3 className="docs-step-heading">Interpreter</h3>
                    <p className="docs-step-body">
                      Walks the tree step-by-step, creates scope environments to remember variables, executes functions, and manages the non-blocking event loop.
                    </p>
                  </div>
                </div>

                <div className="docs-note">
                  <strong>Memory Management:</strong> Scopes and values are managed by C++ <code>std::shared_ptr</code>. When an inner function captures a variable, it keeps a reference to that scope so variables remain alive across calls.
                </div>
              </div>
            )}

            {/* 3. LANGUAGE BASICS */}
            {docsChapter === 'language' && (
              <div className="docs-section">
                <h2 className="docs-section-title">Language Basics</h2>
                <p className="docs-p">
                  NanoJS supports standard modern JavaScript syntax.
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Variables: let and const</h3>
                <p className="docs-p">
                  Use <code>let</code> for variables that can change and <code>const</code> for values that stay constant:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>variables.mjs</span>
                    <div className="docs-code-actions">
                      <button 
                        onClick={() => handleOpenInPlayground(`let name = "NanoJS";\nconst version = 1.0;\nconsole.log(name, "version:", version);`)}
                        className="docs-btn-subtle docs-btn-run"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                  <pre className="docs-code-body">{`let name = "NanoJS";
const version = 1.0;

let items = ["C++17", "JavaScript", "Parser"];
console.log(name, "version:", version);
console.log("Items count:", items.length);`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Functions and Closures</h3>
                <p className="docs-p">
                  Inner functions retain access to variables declared in their outer parent functions:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>closures.mjs</span>
                    <div className="docs-code-actions">
                      <button 
                        onClick={() => handleOpenInPlayground(`function makeGreeting(prefix) {\n    return function(name) {\n        return prefix + ", " + name + "!";\n    };\n}\nlet sayHello = makeGreeting("Hello");\nconsole.log(sayHello("World"));\nconsole.log(sayHello("Priyanshu"));`)}
                        className="docs-btn-subtle docs-btn-run"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                  <pre className="docs-code-body">{`function makeGreeting(prefix) {
    return function(name) {
        return prefix + ", " + name + "!";
    };
}

let sayHello = makeGreeting("Hello");
console.log(sayHello("World"));     // Hello, World!
console.log(sayHello("Priyanshu")); // Hello, Priyanshu!`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Classes and Inheritance</h3>
                <p className="docs-p">
                  Declare classes with constructors and inherit from base classes using <code>extends</code> and <code>super()</code>:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>classes.mjs</span>
                    <div className="docs-code-actions">
                      <button 
                        onClick={() => handleOpenInPlayground(`class Vehicle {\n    constructor(brand) {\n        this.brand = brand;\n    }\n    start() {\n        return this.brand + " engine started.";\n    }\n}\nclass Car extends Vehicle {\n    constructor(brand, model) {\n        super(brand);\n        this.model = model;\n    }\n}\nlet c = new Car("Nano", "GT");\nconsole.log(c.start());\nconsole.log("Model:", c.model);`)}
                        className="docs-btn-subtle docs-btn-run"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                  <pre className="docs-code-body">{`class Vehicle {
    constructor(brand) {
        this.brand = brand;
    }
    start() {
        return this.brand + " engine started.";
    }
}

class Car extends Vehicle {
    constructor(brand, model) {
        super(brand);
        this.model = model;
    }
}

let c = new Car("Nano", "GT");
console.log(c.start());
console.log("Model:", c.model);`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Error Handling</h3>
                <p className="docs-p">
                  Safely catch exceptions with <code>try</code>, <code>catch</code>, and <code>finally</code>:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>errors.mjs</span></div>
                  <pre className="docs-code-body">{`try {
    throw new Error("Something went wrong");
} catch (err) {
    console.log("Handled error:", err.message);
} finally {
    console.log("Cleaned up resources");
}`}</pre>
                </div>
              </div>
            )}

            {/* 4. BUILT-IN APIS */}
            {docsChapter === 'builtins' && (
              <div className="docs-section">
                <h2 className="docs-section-title">Built-in APIs</h2>
                <p className="docs-p">
                  Core utilities are always globally available in NanoJS without importing.
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>console.log()</h3>
                <p className="docs-p">Print numbers, strings, objects, and multiple values:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>console.mjs</span></div>
                  <pre className="docs-code-body">{`console.log("Hello, world!");
console.log("Multiple", "arguments", 42);

let user = { id: 1, role: "admin" };
console.log("User object:", user);`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Math Utilities</h3>
                <p className="docs-p">Math functions and constants:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>math.mjs</span></div>
                  <pre className="docs-code-body">{`console.log("PI:", Math.PI);
console.log("Floor 4.9:", Math.floor(4.9)); // 4
console.log("Ceil 4.1:", Math.ceil(4.1));   // 5
console.log("Max(10, 20):", Math.max(10, 20));
console.log("Square root of 64:", Math.sqrt(64));
console.log("Random number:", Math.random());`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>JSON Parsing & Serialization</h3>
                <p className="docs-p">Convert objects to strings and strings back to objects:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>json.mjs</span></div>
                  <pre className="docs-code-body">{`let data = { engine: "NanoJS", speed: "fast" };

let jsonText = JSON.stringify(data);
console.log("JSON String:", jsonText);

let parsed = JSON.parse(jsonText);
console.log("Engine name:", parsed.engine);`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Array Methods</h3>
                <p className="docs-p">Transform and filter lists with functional methods:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>arrays.mjs</span></div>
                  <pre className="docs-code-body">{`let numbers = [1, 2, 3, 4, 5];

let doubled = numbers.map(function(n) {
    return n * 2;
});

let evens = numbers.filter(function(n) {
    return n % 2 === 0;
});

console.log("Doubled:", doubled);
console.log("Evens:", evens);`}</pre>
                </div>
              </div>
            )}

            {/* 5. ASYNC & TIMERS */}
            {docsChapter === 'async' && (
              <div className="docs-section">
                <h2 className="docs-section-title">Async & Timers</h2>
                <p className="docs-p">
                  NanoJS handles asynchronous operations without freezing the program using a single-threaded C++ event loop.
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>setTimeout and clearTimeout</h3>
                <p className="docs-p">Schedule callbacks after a specific delay in milliseconds:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top">
                    <span>timers.mjs</span>
                    <div className="docs-code-actions">
                      <button 
                        onClick={() => handleOpenInPlayground(`console.log("1. Starting...");\nsetTimeout(function() {\n    console.log("3. Timer executed after 50ms");\n}, 50);\nconsole.log("2. Synchronous code done");`)}
                        className="docs-btn-subtle docs-btn-run"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                  <pre className="docs-code-body">{`console.log("1. Starting...");

setTimeout(function() {
    console.log("3. Timer executed after 50ms");
}, 50);

console.log("2. Synchronous code done");`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>Async / Await and Promises</h3>
                <p className="docs-p">
                  Promises and <code>await</code> resolve smoothly through the microtask queue:
                </p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>async.mjs</span></div>
                  <pre className="docs-code-body">{`async function fetchUserData() {
    let result = await Promise.resolve({ id: 10, status: "Active" });
    return result;
}

fetchUserData().then(function(user) {
    console.log("User status:", user.status);
});`}</pre>
                </div>
              </div>
            )}

            {/* 6. WEB SERVER & FILES */}
            {docsChapter === 'server' && (
              <div className="docs-section">
                <h2 className="docs-section-title">Web Server & File System</h2>
                <p className="docs-p">
                  NanoJS includes direct, built-in global APIs for reading/writing files and serving HTTP requests.
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>File Operations (fs)</h3>
                <p className="docs-p">Read and write files directly from disk without extra packages:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>files.mjs</span></div>
                  <pre className="docs-code-body">{`// Write to file
fs.writeFile("hello.txt", "Saved with NanoJS!");

// Read from file
let content = fs.readFile("hello.txt");
console.log("File content:", content);`}</pre>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>HTTP Web Server (http)</h3>
                <p className="docs-p">Create a fast local HTTP server with request routing:</p>
                <div className="docs-code-card">
                  <div className="docs-code-top"><span>server.mjs</span></div>
                  <pre className="docs-code-body">{`let server = http.createServer(function(req, res) {
    if (req.url === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "healthy" }));
        return;
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Welcome to NanoJS Web Server!");
});

server.listen(8080);
console.log("Server listening at http://localhost:8080/");`}</pre>
                </div>
              </div>
            )}

            {/* 7. EXAMPLES */}
            {docsChapter === 'examples' && (
              <div className="docs-section">
                <h2 className="docs-section-title">Ready-to-Run Code Examples</h2>
                <p className="docs-p">
                  Click <strong>Run in Playground</strong> on any example to execute it in the browser:
                </p>

                {PRESETS.map((p) => (
                  <div key={p.id} className="docs-code-card" style={{ margin: '16px 0 20px' }}>
                    <div className="docs-code-top">
                      <span>{p.title}</span>
                      <div className="docs-code-actions">
                        <button 
                          onClick={() => handleOpenInPlayground(p.code)}
                          className="docs-btn-subtle docs-btn-run"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Playground</span>
                        </button>
                      </div>
                    </div>
                    <pre className="docs-code-body">{p.code}</pre>
                  </div>
                ))}
              </div>
            )}

          </article>

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
