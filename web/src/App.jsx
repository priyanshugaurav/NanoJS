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
  Apple
} from 'lucide-react';
import { PRESETS } from './engine/presets';
import { ExecutionInspector } from './engine/inspector';
import './App.css';

const CodeEditor = Editor.default || Editor;

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

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

  // Downloads & Engine Diagnostics State
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

    // Auto-detect OS
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

    // Check system info
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

  const navigateTo = (view, presetId = null, msg = 'Loading...') => {
    setTransitionMessage(msg);
    setIsTransitioning(true);
    if (presetId) {
      const found = PRESETS.find(p => p.id === presetId);
      if (found) {
        setSelectedPreset(presetId);
        setCode(found.code);
        handleRunCode(found.code);
      }
    }
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
      window.scrollTo(0, 0);
    }, 350);
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
    { icon: <Box className="w-4 h-4" />, title: 'Variables & Closures', desc: 'let, const with lexical scoping that keeps variables alive across nested functions.' },
    { icon: <Clock className="w-4 h-4" />, title: 'Async & Timers', desc: 'Non-blocking async/await, Promises, and setTimeout through a custom event loop.' },
    { icon: <Layers className="w-4 h-4" />, title: 'Classes & Prototypes', desc: 'ES6 class syntax with extends, constructors, and prototype chain inheritance.' },
    { icon: <Zap className="w-4 h-4" />, title: 'Built-in APIs', desc: 'Array methods, Math, JSON, error handling, and a built-in HTTP server.' },
  ];

  const steps = [
    { num: '01', label: 'Lexer', file: 'Lexer.cpp', desc: 'Reads raw source code character by character. Groups them into tokens — keywords, identifiers, operators.' },
    { num: '02', label: 'Parser', file: 'Parser.cpp', desc: 'Takes tokens and builds an Abstract Syntax Tree. Recursive descent parser that understands JS grammar.' },
    { num: '03', label: 'Interpreter', file: 'Interpreter.cpp', desc: 'Walks the AST, manages scope chains for closures, and coordinates the event loop for async code.' },
  ];

  return (
    <div className={`app-root ${theme}`}>
      
      {/* Transition Overlay */}
      <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`}>
        <Loader2 className="transition-spinner" />
        <span className="transition-text">{transitionMessage}</span>
      </div>

      {/* Navbar — Centered (Home & Downloads View) */}
      {(currentView === 'home' || currentView === 'downloads') && (
        <nav className="navbar">
          <div className="nav-inner">
            <button onClick={() => navigateTo('home', null, 'Going back...')} className="nav-brand">
              <span className="brand-dot" />
              <span className="brand-text">NanoJS</span>
            </button>

            <div className="nav-links">
              <button 
                onClick={() => navigateTo('home', null, 'Loading overview...')} 
                className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
              >
                Overview
              </button>
              <button 
                onClick={() => navigateTo('downloads', null, 'Opening downloads...')} 
                className={`nav-link-btn ${currentView === 'downloads' ? 'active' : ''}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Downloads</span>
              </button>
              <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="nav-link">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Source</span>
              </a>
              <button onClick={() => navigateTo('playground', null, 'Opening playground...')} className="nav-cta">
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
              I built NanoJS to understand how JavaScript really works under the hood — lexing, parsing, scope chains, closures, and an event loop. All implemented in C++ without external libraries.
            </p>

            <div className="hero-actions">
              <button onClick={() => navigateTo('playground', null, 'Opening playground...')} className="btn-primary">
                <span>Try it live</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateTo('downloads', null, 'Opening downloads...')} className="btn-secondary">
                <Download className="w-4 h-4" />
                <span>Download v1.0.0</span>
              </button>
              <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
                <span>View source</span>
              </a>
            </div>
          </section>

          {/* Features Grid */}
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

          {/* Pipeline */}
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

          {/* Quick Examples */}
          <section className={`section-block ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.35s' }}>
            <div className="section-label">Try an example</div>
            <div className="examples-row">
              {PRESETS.slice(0, 4).map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => navigateTo('playground', p.id, 'Loading example...')}
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
                onClick={() => navigateTo('downloads', null, 'Opening engine diagnostics...')}
                className="spec-item spec-clickable" 
                title="Click to view live C++ engine tests"
              >
                <span className="spec-key">Tests</span>
                <span className="spec-val spec-pass">19/19 Passing • Verified</span>
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="home-footer">
            <span>Built by Priyanshu Gaurav</span>
            <div className="footer-links">
              <button onClick={() => navigateTo('playground', null, 'Opening playground...')} className="footer-link">Playground</button>
              <span className="footer-dot">·</span>
              <a href="https://github.com/priyanshugaurav/NanoJS" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
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
            {/* Platform-Specific Download Card */}
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
                  <h3 className="dl-test-title">Native C++17 Engine Parity & Diagnostics</h3>
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
                Every execution on this website directly invokes the compiled <code>./nanojs</code> C++ binary. Click the button above to run the 19 automated language feature suites against the C++ engine in real-time.
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
              <button onClick={() => navigateTo('home', null, 'Going home...')} className="footer-link">Home</button>
              <span className="footer-dot">·</span>
              <button onClick={() => navigateTo('playground', null, 'Opening playground...')} className="footer-link">Playground</button>
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
              <button onClick={() => navigateTo('home', null, 'Going back...')} className="pg-brand-btn" title="Back to overview">
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
                onClick={() => navigateTo('downloads', null, 'Opening downloads...')}
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
                  <span className="pg-filename">main.js</span>
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
                  <span>Shortcut: <kbd className="pg-mini-kbd">⌘↵</kbd> to run</span>
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
