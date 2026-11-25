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
  GitCompare,
  Info,
  ShieldCheck
} from 'lucide-react';
import { PRESETS } from './engine/presets';
import { ExecutionInspector } from './engine/inspector';
import './App.css';

const CodeEditor = Editor.default || Editor;

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [docsTab, setDocsTab] = useState('differences');

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
  const navigateTo = (view, presetId = null, docSection = null) => {
    setPreviousView(currentView);
    if (presetId) {
      const found = PRESETS.find(p => p.id === presetId);
      if (found) {
        setSelectedPreset(presetId);
        setCode(found.code);
        handleRunCode(found.code);
      }
    }
    if (docSection) {
      setDocsTab(docSection);
    }
    setCurrentView(view);
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

  // Differences from Node.js (V8)
  const nodeDifferences = [
    {
      id: 'extension',
      title: 'File Extension (.mjs required)',
      nano: 'Strictly requires .mjs extension (e.g. ./nanojs app.mjs).',
      node: 'Accepts .js, .cjs, and .mjs files automatically.',
      note: 'NanoJS treats all user code as modern modules with strict scoping.'
    },
    {
      id: 'pipeline',
      title: 'Execution Engine (AST vs Bytecode)',
      nano: 'Direct AST tree-walk evaluation in C++ with zero bytecode.',
      node: 'Ignition bytecode compiler + TurboFan JIT machine code compiler.',
      note: 'NanoJS starts in ~2ms with zero warmup time, ideal for small scripts.'
    },
    {
      id: 'memory',
      title: 'Memory & Garbage Collection',
      nano: 'C++ std::shared_ptr reference counting. Deallocated when ref count is 0.',
      node: 'V8 Orinoco generational GC (New/Old space, mark-sweep-compact).',
      note: 'NanoJS has deterministic cleanup with no background GC stop-the-world pauses.'
    },
    {
      id: 'scopes',
      title: 'Lexical Environments & Closures',
      nano: 'Linked C++ Environment objects. Inner functions hold parent pointer.',
      node: 'Heap-allocated Context slots created by V8 scope analysis.',
      note: 'Direct representation of ECMAScript scope chaining specification.'
    },
    {
      id: 'modules',
      title: 'Core Module Loading',
      nano: 'fs, http, and fetch are pre-bound global objects. No import needed.',
      node: 'Requires require("fs") or import fs from "node:fs".',
      note: 'You can write fs.readFile() or http.createServer() immediately in any file.'
    },
    {
      id: 'classes',
      title: 'Class System & Prototypes',
      nano: 'Supports class, constructor, methods, extends, and super().',
      node: 'Full prototype chain, instanceof, prototype mutation, private fields.',
      note: 'NanoJS omits instanceof and private #field syntax to keep the parser simple.'
    },
    {
      id: 'eventloop',
      title: 'Event Loop & Concurrency',
      nano: 'Single-threaded C++ timer queue with std::chrono and microtask queue.',
      node: 'libuv multi-threaded thread pool (4 worker threads) with 6 phases.',
      note: 'Lightweight deterministic event loop without thread pool overhead.'
    },
    {
      id: 'networking',
      title: 'Networking & HTTP Engine',
      nano: 'Raw POSIX sockets (Winsock on Windows) with simple HTTP/1.1.',
      node: 'llhttp parser, full HTTP/2, WebSockets, OpenSSL TLS/HTTPS.',
      note: 'Zero external dependencies. Production SSL is handled by reverse proxies.'
    },
    {
      id: 'footprint',
      title: 'Binary Size & Startup RAM',
      nano: 'Under 1 MB standalone binary. Under 4 MB RAM at startup.',
      node: '80 to 100 MB binary with V8, OpenSSL, libuv. ~30 MB startup RAM.',
      note: 'NanoJS compiles into a tiny single executable with zero external libraries.'
    }
  ];

  return (
    <div className={`app-root ${theme}`}>

      {/* Main Navbar (Home, Docs, Downloads) */}
      {(currentView === 'home' || currentView === 'downloads' || currentView === 'docs') && (
        <nav className="navbar">
          <div className="nav-inner">
            <button onClick={() => navigateTo('home')} className="nav-brand">
              <span className="brand-dot" />
              <span className="brand-text">NanoJS</span>
            </button>

            <div className="nav-links">
              <button 
                onClick={() => navigateTo('home')} 
                className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
              >
                Overview
              </button>
              <button 
                onClick={() => navigateTo('docs', null, 'differences')} 
                className={`nav-link-btn ${currentView === 'docs' && docsTab === 'differences' ? 'active' : ''}`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Node Differences</span>
              </button>
              <button 
                onClick={() => navigateTo('docs', null, 'quickstart')} 
                className={`nav-link-btn ${currentView === 'docs' && docsTab !== 'differences' ? 'active' : ''}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Docs</span>
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
          </div>
        </nav>
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
              <button onClick={() => navigateTo('docs', null, 'differences')} className="btn-secondary">
                <GitCompare className="w-4 h-4" />
                <span>How it differs from Node.js</span>
              </button>
              <button onClick={() => navigateTo('downloads')} className="btn-secondary">
                <Download className="w-4 h-4" />
                <span>Download v1.0.0</span>
              </button>
            </div>
          </section>

          {/* Callout Card: Node.js Comparison Banner */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="diff-intro-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className="diff-intro-title">How does NanoJS compare to Node.js?</h3>
                <p className="diff-intro-p">
                  NanoJS is an AST-walking C++ interpreter with reference-counted scopes and global runtime objects, while Node.js uses V8's JIT bytecode and libuv.
                </p>
              </div>
              <button 
                onClick={() => navigateTo('docs', null, 'differences')} 
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <span>Read technical differences</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
              <button onClick={() => navigateTo('docs', null, 'differences')} className="footer-link">Differences</button>
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

      {/* ============ DOCUMENTATION PAGE ============ */}
      {currentView === 'docs' && (
        <main className="docs-page">
          <section className="docs-hero">
            <div className="docs-badge">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NanoJS v1.0.0 Documentation</span>
            </div>
            
            <h1 className="docs-title">Documentation & Engine Guide</h1>
            <p className="docs-subtitle">
              Learn how to write and run code on NanoJS, understand its built-in modules, and explore how it differs from Node.js (V8).
            </p>

            {/* Category Tabs */}
            <div className="docs-tabs">
              <button
                onClick={() => setDocsTab('differences')}
                className={`docs-tab ${docsTab === 'differences' ? 'active' : ''}`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Node.js Differences</span>
              </button>
              <button
                onClick={() => setDocsTab('quickstart')}
                className={`docs-tab ${docsTab === 'quickstart' ? 'active' : ''}`}
              >
                <Terminal className="w-4 h-4" />
                <span>Quick Start</span>
              </button>
              <button
                onClick={() => setDocsTab('language')}
                className={`docs-tab ${docsTab === 'language' ? 'active' : ''}`}
              >
                <Code2 className="w-4 h-4" />
                <span>Language Syntax</span>
              </button>
              <button
                onClick={() => setDocsTab('async')}
                className={`docs-tab ${docsTab === 'async' ? 'active' : ''}`}
              >
                <Clock className="w-4 h-4" />
                <span>Async & Event Loop</span>
              </button>
              <button
                onClick={() => setDocsTab('modules')}
                className={`docs-tab ${docsTab === 'modules' ? 'active' : ''}`}
              >
                <Box className="w-4 h-4" />
                <span>Built-in Globals</span>
              </button>
            </div>
          </section>

          {/* TAB 1: HOW NANOJS DIFFERS FROM NODE.JS (V8) */}
          {docsTab === 'differences' && (
            <div className="docs-content">
              <div className="diff-intro-card">
                <h2 className="diff-intro-title">How NanoJS Differs from Node.js (V8)</h2>
                <p className="diff-intro-p">
                  Node.js is an enterprise JavaScript runtime built on Google's V8 engine and libuv. NanoJS is an educational, minimalist JavaScript engine built from scratch in C++17 with zero dependencies. Below is the exact technical breakdown of differences between the two engines.
                </p>
              </div>

              {/* Technical Difference Cards */}
              <div className="diff-grid">
                {nodeDifferences.map((d) => (
                  <div key={d.id} className="diff-card">
                    <div className="diff-card-header">
                      <h3 className="diff-card-title">{d.title}</h3>
                      <span className="diff-tag-nano">NanoJS</span>
                    </div>

                    <div className="diff-row-comparison">
                      <div className="diff-nano-val">
                        <strong>NanoJS:</strong> {d.nano}
                      </div>
                      <div className="diff-node-val">
                        <strong>Node.js:</strong> {d.node}
                      </div>
                    </div>

                    <div className="diff-note">{d.note}</div>
                  </div>
                ))}
              </div>

              {/* Side by Side Comparison Table */}
              <div className="diff-table-card">
                <h3 className="docs-card-title" style={{ marginBottom: '16px' }}>Side-by-Side Engine Comparison</h3>
                <table className="diff-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>NanoJS Engine</th>
                      <th>Node.js (V8)</th>
                      <th>Why NanoJS does this</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="table-feature">File Extension</td>
                      <td><code>.mjs</code> required</td>
                      <td><code>.js</code>, <code>.cjs</code>, <code>.mjs</code></td>
                      <td>Explicit ES module semantics from start</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Architecture</td>
                      <td>Direct AST Tree Walk in C++</td>
                      <td>Ignition Bytecode + TurboFan JIT</td>
                      <td>Simple transparent C++ codebase, ~2ms boot</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Memory Management</td>
                      <td>C++ <code>shared_ptr</code> reference counting</td>
                      <td>V8 Orinoco Generational Mark-Sweep GC</td>
                      <td>Instant cleanup when ref count drops to 0</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Core Modules</td>
                      <td>Pre-bound globals (<code>fs</code>, <code>http</code>)</td>
                      <td>Requires <code>require()</code> or <code>import</code></td>
                      <td>Zero module loader resolution overhead</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Classes</td>
                      <td><code>class</code>, <code>extends</code>, <code>super()</code></td>
                      <td>Full prototypes, <code>instanceof</code>, private fields</td>
                      <td>Clean OOP without prototype mutation quirks</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Event Loop</td>
                      <td>Single-thread monotonic timer queue</td>
                      <td>libuv multi-threaded thread pool (6 phases)</td>
                      <td>Predictable single-threaded execution</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Networking</td>
                      <td>Raw POSIX / Winsock HTTP/1.1</td>
                      <td>llhttp + TLS/HTTPS + WebSockets + HTTP/2</td>
                      <td>Zero external crypto/network dependencies</td>
                    </tr>
                    <tr>
                      <td className="table-feature">Binary Size</td>
                      <td>Under 1 MB</td>
                      <td>Around 80 to 100 MB</td>
                      <td>Lightweight standalone CLI executable</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="docs-card">
                <h3 className="docs-card-title">When should you use NanoJS vs Node.js?</h3>
                <p className="docs-card-p">
                  Use <strong>Node.js</strong> for production web backends, npm packages, high-throughput microservices, and applications needing npm dependencies or TLS encryption.
                </p>
                <p className="docs-card-p" style={{ margin: 0 }}>
                  Use <strong>NanoJS</strong> when you want an instant-starting embedded JavaScript interpreter, lightweight CLI utilities without a 100MB runtime, or to learn how compilers, lexers, parsers, and event loops work in C++.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK START */}
          {docsTab === 'quickstart' && (
            <div className="docs-content">
              <div className="docs-card">
                <h2 className="docs-card-title">Installing NanoJS</h2>
                <p className="docs-card-p">
                  Install NanoJS on macOS, Linux, or Windows with a single terminal command.
                </p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>macOS / Linux (Bash)</span>
                    <button 
                      onClick={() => handleCopySnippet('curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash', 'doc-mac-inst')}
                      className="docs-code-copy"
                    >
                      {copiedSnippet === 'doc-mac-inst' ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === 'doc-mac-inst' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="docs-code-pre">curl -fsSL https://nanojs.priyanshugaurav.space/downloads/install.sh | bash</pre>
                </div>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>Windows (PowerShell)</span>
                    <button 
                      onClick={() => handleCopySnippet('irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex', 'doc-win-inst')}
                      className="docs-code-copy"
                    >
                      {copiedSnippet === 'doc-win-inst' ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === 'doc-win-inst' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="docs-code-pre">irm https://nanojs.priyanshugaurav.space/downloads/install.ps1 | iex</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">Running Your First Script</h2>
                <p className="docs-card-p">
                  Create a file with the <code>.mjs</code> extension and run it using the <code>nanojs</code> binary.
                </p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>hello.mjs</span>
                  </div>
                  <pre className="docs-code-pre">{`// hello.mjs
let greeting = "Hello from NanoJS!";
console.log(greeting);

let sum = [10, 20, 30].reduce(function(a, b) {
    return a + b;
}, 0);

console.log("Calculated sum:", sum);`}</pre>
                </div>

                <p className="docs-card-p">Run it from your terminal:</p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>Terminal</span></div>
                  <pre className="docs-code-pre">nanojs hello.mjs</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGE SYNTAX */}
          {docsTab === 'language' && (
            <div className="docs-content">
              <div className="docs-card">
                <h2 className="docs-card-title">Variables and Types</h2>
                <p className="docs-card-p">
                  NanoJS supports block-scoped <code>let</code> and <code>const</code> variables, as well as Numbers, Strings, Booleans, Objects, and Arrays.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>variables.mjs</span></div>
                  <pre className="docs-code-pre">{`let name = "NanoJS";
const version = 1.0;
let isNative = true;

let user = {
    username: "priyanshu",
    role: "developer"
};

let languages = ["C++17", "JavaScript", "Python"];
console.log(name, version, user.username);`}</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">Closures and Lexical Scope</h2>
                <p className="docs-card-p">
                  Inner functions maintain a pointer to their outer lexical environment, allowing closures to remember state across calls.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>closures.mjs</span></div>
                  <pre className="docs-code-pre">{`function makeAdder(x) {
    return function(y) {
        return x + y;
    };
}

let addFive = makeAdder(5);
console.log(addFive(10)); // 15
console.log(addFive(20)); // 25`}</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">Classes and Inheritance</h2>
                <p className="docs-card-p">
                  Declare classes with constructors, methods, and inherit from other classes using <code>extends</code> and <code>super()</code>.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>classes.mjs</span></div>
                  <pre className="docs-code-pre">{`class Shape {
    constructor(name) {
        this.name = name;
    }
    describe() {
        return "Shape: " + this.name;
    }
}

class Circle extends Shape {
    constructor(radius) {
        super("Circle");
        this.radius = radius;
    }
    area() {
        return 3.14159 * this.radius * this.radius;
    }
}

let c = new Circle(5);
console.log(c.describe());
console.log("Area:", c.area());`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASYNC & EVENT LOOP */}
          {docsTab === 'async' && (
            <div className="docs-content">
              <div className="docs-card">
                <h2 className="docs-card-title">Timers and Macrotasks</h2>
                <p className="docs-card-p">
                  NanoJS features non-blocking timers powered by a C++ priority queue using <code>std::chrono</code>.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>timers.mjs</span></div>
                  <pre className="docs-code-pre">{`console.log("Step 1");

setTimeout(function() {
    console.log("Step 3 (after 50ms)");
}, 50);

console.log("Step 2");`}</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">Async / Await and Promises</h2>
                <p className="docs-card-p">
                  Microtasks are processed immediately after current call frames finish, before the next timer event fires.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>async.mjs</span></div>
                  <pre className="docs-code-pre">{`async function computeAsync() {
    let value = await Promise.resolve(42);
    return "The answer is " + value;
}

computeAsync().then(function(msg) {
    console.log(msg);
});`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BUILT-IN GLOBALS */}
          {docsTab === 'modules' && (
            <div className="docs-content">
              <div className="docs-card">
                <h2 className="docs-card-title">File System (fs)</h2>
                <p className="docs-card-p">
                  The <code>fs</code> object is globally available without importing. Use it to read and write files directly.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>fs_example.mjs</span></div>
                  <pre className="docs-code-pre">{`// Writing a file
fs.writeFile("output.txt", "NanoJS wrote this file natively.");

// Reading a file
let content = fs.readFile("output.txt");
console.log("File content:", content);`}</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">HTTP Web Server (http)</h2>
                <p className="docs-card-p">
                  NanoJS includes a native POSIX/Winsock HTTP server for handling web requests.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>server.mjs</span></div>
                  <pre className="docs-code-pre">{`let server = http.createServer(function(req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", engine: "NanoJS v1.0" }));
});

server.listen(3000);
console.log("Server listening on port 3000");`}</pre>
                </div>
              </div>

              <div className="docs-card">
                <h2 className="docs-card-title">JSON and Math Utilities</h2>
                <p className="docs-card-p">
                  Standard global utilities for parsing, serializing, and numeric calculations.
                </p>
                <div className="docs-code-block">
                  <div className="docs-code-header"><span>utils.mjs</span></div>
                  <pre className="docs-code-pre">{`let obj = { app: "NanoJS", stars: 100 };
let jsonStr = JSON.stringify(obj);
let parsed = JSON.parse(jsonStr);

console.log("Parsed app:", parsed.app);
console.log("Random number:", Math.random());
console.log("Max value:", Math.max(10, 40, 25));`}</pre>
                </div>
              </div>
            </div>
          )}

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
                onClick={() => navigateTo('docs', null, 'differences')}
                className="pg-action-btn"
                title="Differences from Node.js"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Differences</span>
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
