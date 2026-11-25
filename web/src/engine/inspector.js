// NanoJS Execution Sandbox, Memory Profiler, and Event Loop Inspector
import { parseSource } from "./parser";

export class ExecutionInspector {
  constructor() {
    this.logs = [];
    this.callStack = [];
    this.microtasks = [];
    this.macrotasks = [];
    this.environments = [];
    this.heap = [];
    this.metrics = {
      executionTimeMs: 0,
      tokenCount: 0,
      astNodesCount: 0,
      heapAllocatedBytes: 0,
      eventLoopTicks: 0,
      isNative: false,
      exitCode: 0
    };
  }

  // Count nodes recursively in AST
  countAstNodes(node) {
    if (!node || typeof node !== "object") return 0;
    let count = 1;
    for (const key of Object.keys(node)) {
      if (Array.isArray(node[key])) {
        for (const child of node[key]) count += this.countAstNodes(child);
      } else if (typeof node[key] === "object" && node[key] !== null) {
        count += this.countAstNodes(node[key]);
      }
    }
    return count;
  }

  async run(sourceCode, onUpdate) {
    this.logs = [];
    this.callStack = [{ name: "<global_frame>", line: 1, type: "ScriptExecution" }];
    this.microtasks = [];
    this.macrotasks = [];
    this.environments = [
      {
        id: "env_global_0",
        name: "Global Scope (std::shared_ptr<Environment> globals)",
        parent: null,
        bindings: {
          "NaN": { type: "number", value: "NaN" },
          "Infinity": { type: "number", value: "Infinity" },
          "Math": { type: "object", address: "0x7ffee4b10", isNative: true },
          "JSON": { type: "object", address: "0x7ffee4b28", isNative: true },
          "console": { type: "object", address: "0x7ffee4b40", isNative: true },
          "process": { type: "object", address: "0x7ffee4b58", isNative: true },
          "env": { type: "object", address: "0x7ffee4b70", isNative: true },
        }
      }
    ];
    this.heap = [
      { address: "0x7ffee4b10", type: "JSObject (Native)", size: 128, refCount: 1, properties: ["PI", "abs", "floor", "min", "max", "random"] },
      { address: "0x7ffee4b28", type: "JSObject (Native)", size: 96, refCount: 1, properties: ["parse", "stringify"] },
      { address: "0x7ffee4b40", type: "JSObject (Native)", size: 112, refCount: 1, properties: ["log", "warn", "error", "dir"] },
    ];

    const startTime = performance.now();

    // 1. Lexing & Parsing through NanoJS Pipeline
    const { tokens, ast } = parseSource(sourceCode);
    this.metrics.tokenCount = tokens.length;
    this.metrics.astNodesCount = this.countAstNodes(ast);
    this.metrics.heapAllocatedBytes = 336;

    // Track simulated heap allocations
    let addressCounter = 0x7ffee5000;
    const allocateHeap = (type, size, props) => {
      const address = "0x" + (addressCounter += 0x18).toString(16);
      const entry = { address, type, size, refCount: 1, properties: props };
      this.heap.push(entry);
      this.metrics.heapAllocatedBytes += size;
      return address;
    };

    // Extract declared functions and variables to populate Scope & Heap
    if (ast && ast.body) {
      for (const stmt of ast.body) {
        if (stmt.type === "FunStmt") {
          const addr = allocateHeap("JSFunction (Closure)", 144, {
            params: stmt.params,
            closureEnv: "env_global_0",
            isAsync: !!stmt.isAsync
          });
          this.environments[0].bindings[stmt.name] = {
            type: "function",
            value: `[Function: ${stmt.name}]`,
            address: addr,
            isAsync: !!stmt.isAsync
          };
        } else if (stmt.type === "VarStmt") {
          this.environments[0].bindings[stmt.name] = {
            type: stmt.kind,
            value: stmt.init ? "[Initialized]" : "undefined"
          };
        } else if (stmt.type === "ClassStmt") {
          const addr = allocateHeap("JSClass (Constructor)", 216, {
            name: stmt.name,
            super: stmt.superclass,
            methods: stmt.methods ? stmt.methods.map(m => m.name) : []
          });
          this.environments[0].bindings[stmt.name] = {
            type: "class",
            value: `[Class: ${stmt.name}]`,
            address: addr
          };
        }
      }
    }

    // Attempt Native Execution via Vite Backend if available
    let nativeRan = false;
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sourceCode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.native) {
          nativeRan = true;
          this.metrics.isNative = true;
          this.metrics.exitCode = data.exitCode;
          this.metrics.executionTimeMs = data.executionTimeMs;

          if (data.stdout) {
            const lines = data.stdout.split("\n");
            for (const line of lines) {
              if (line.trim().length > 0) {
                this.logs.push({ type: "stdout", text: line, timestamp: Date.now() });
              }
            }
          }
          if (data.stderr) {
            const lines = data.stderr.split("\n");
            for (const line of lines) {
              if (line.trim().length > 0) {
                this.logs.push({ type: "stderr", text: line, timestamp: Date.now() });
              }
            }
          }
        }
      }
    } catch {
      // Backend not running (e.g. static hosting like Vercel or GitHub Pages)
      nativeRan = false;
    }

    // If native runner did not execute, run via client sandbox
    if (!nativeRan) {
      this.metrics.isNative = false;
      
      // Standard NanoJS Output Header
      this.logs.push({
        type: "banner",
        text: "==================================================\n   NanoJS Interpreter v1.0                        \n   Running: playground.mjs\n==================================================",
        timestamp: Date.now()
      });

      const formatArg = (arg) => {
        if (arg === undefined) return "undefined";
        if (arg === null) return "null";
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      };

      const sandboxConsole = {
        log: (...args) => {
          const text = args.map(formatArg).join(" ");
          this.logs.push({ type: "stdout", text, timestamp: Date.now() });
          if (onUpdate) onUpdate(this.getState(tokens, ast));
        },
        warn: (...args) => {
          const text = "Warning: " + args.map(formatArg).join(" ");
          this.logs.push({ type: "warn", text, timestamp: Date.now() });
          if (onUpdate) onUpdate(this.getState(tokens, ast));
        },
        error: (...args) => {
          const text = "Error: " + args.map(formatArg).join(" ");
          this.logs.push({ type: "stderr", text, timestamp: Date.now() });
          if (onUpdate) onUpdate(this.getState(tokens, ast));
        },
        dir: (arg) => {
          this.logs.push({ type: "dir", text: formatArg(arg), timestamp: Date.now() });
          if (onUpdate) onUpdate(this.getState(tokens, ast));
        }
      };

      let nextTimerId = 1;
      const pendingTimerPromises = [];

      const sandboxSetTimeout = (callback, delay = 0) => {
        const id = nextTimerId++;
        const timerInfo = { id, delay, type: "setTimeout", state: "Pending" };
        this.macrotasks.push(timerInfo);
        this.metrics.eventLoopTicks++;
        if (onUpdate) onUpdate(this.getState(tokens, ast));

        const timerPromise = new Promise((resolve) => {
          setTimeout(async () => {
            timerInfo.state = "Executing";
            this.callStack.push({ name: `setTimeout_callback_#${id}`, line: 0, type: "MacrotaskCallback" });
            if (onUpdate) onUpdate(this.getState(tokens, ast));

            try {
              if (typeof callback === "function") {
                await callback();
              }
            } catch (e) {
              sandboxConsole.error(e.message || String(e));
            } finally {
              timerInfo.state = "Completed";
              this.callStack.pop();
              if (onUpdate) onUpdate(this.getState(tokens, ast));
              resolve();
            }
          }, Math.min(delay, 2000));
        });

        pendingTimerPromises.push(timerPromise);
        return id;
      };

      const sandboxSetInterval = (callback, interval = 100) => {
        return sandboxSetTimeout(callback, interval);
      };

      try {
        const sandboxGlobals = {
          console: sandboxConsole,
          setTimeout: sandboxSetTimeout,
          setInterval: sandboxSetInterval,
          clearTimeout: () => {},
          clearInterval: () => {},
          Promise: Promise,
          Date: Date,
          Math: Math,
          JSON: JSON,
          Array: Array,
          Object: Object,
          String: String,
          Number: Number,
          Boolean: Boolean,
          Error: Error
        };

        const paramNames = Object.keys(sandboxGlobals);
        const paramValues = Object.values(sandboxGlobals);

        const runner = new Function(...paramNames, `"use strict";\nreturn (async () => {\n${sourceCode}\n})();`);
        await runner(...paramValues);

        if (pendingTimerPromises.length > 0) {
          await Promise.all(pendingTimerPromises);
        }
      } catch (err) {
        this.logs.push({
          type: "stderr",
          text: `\n[Runtime Error] line 0: ${err.message}`,
          timestamp: Date.now()
        });
      } finally {
        const endTime = performance.now();
        this.metrics.executionTimeMs = Math.round((endTime - startTime) * 100) / 100;
      }
    }

    this.callStack = [];
    return this.getState(tokens, ast);
  }

  getState(tokens = [], ast = null) {
    return {
      tokens,
      ast,
      logs: [...this.logs],
      callStack: [...this.callStack],
      microtasks: [...this.microtasks],
      macrotasks: [...this.macrotasks],
      environments: [...this.environments],
      heap: [...this.heap],
      metrics: { ...this.metrics }
    };
  }
}
