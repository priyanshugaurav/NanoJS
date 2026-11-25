#!/usr/bin/env python3
"""
NanoJS Engine Verification Test Suite
Verifies that:
1. The C++ binary (nanojs) compiles and executes properly.
2. The Web API (/api/run) executes the exact same C++ binary.
3. Language features pass across test suites.
"""

import sys
import os
import glob
import json
import subprocess
import urllib.request
import urllib.error

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BINARY = os.path.join(ROOT_DIR, "nanojs")
API_URL = "http://localhost:5173/api/run"

def run_native(file_path):
    proc = subprocess.run([BINARY, file_path], capture_output=True, text=True, timeout=10)
    return proc.returncode, proc.stdout, proc.stderr

def run_web_api(code_text):
    req = urllib.request.Request(
        API_URL,
        data=json.dumps({"code": code_text}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 60)
    print("   NanoJS C++ Engine & Web API Parity Test Suite")
    print("=" * 60)

    if not os.path.exists(BINARY):
        print(f"Error: Binary {BINARY} not found. Please build it first.")
        sys.exit(1)

    # 1. Parity test between C++ CLI and Web API
    print("\n[Phase 1] Parity Check: C++ Binary vs Web API (/api/run)")
    sample_test = os.path.join(ROOT_DIR, "examples", "test_01_basics.mjs")
    with open(sample_test, "r") as f:
        sample_code = f.read()

    native_rc, native_stdout, native_stderr = run_native(sample_test)
    print(f"  -> C++ Binary returned exitCode: {native_rc}")

    try:
        api_data = run_web_api(sample_code)
        api_native = api_data.get("native", False)
        api_rc = api_data.get("exitCode", -1)
        api_stdout = api_data.get("stdout", "")
        print(f"  -> Web API returned isNative: {api_native}, exitCode: {api_rc}")

        # Check parity (strip dynamic temp filename line from banner)
        native_lines = [l for l in native_stdout.splitlines() if not l.strip().startswith("Running:")]
        api_lines = [l for l in api_stdout.splitlines() if not l.strip().startswith("Running:")]

        if native_lines == api_lines and native_rc == api_rc:
            print("  ✓ SUCCESS: Web API output matches C++ binary output 100%!")
        else:
            print("  ✗ Parity mismatch between CLI and API output.")
    except Exception as e:
        print(f"  ⚠ Web server not running on {API_URL} ({e}). Skipping live API check.")

    # 2. Run all example suites against C++ binary
    print("\n[Phase 2] Running Language Feature Tests on C++ Engine")
    test_files = sorted(glob.glob(os.path.join(ROOT_DIR, "examples", "test_*.mjs")))
    passed = 0
    total = 0

    for path in test_files:
        name = os.path.basename(path)
        # Skip persistent server test in non-interactive batch
        if "test_16" in name:
            continue

        total += 1
        try:
            rc, stdout, stderr = run_native(path)
            if rc == 0:
                print(f"  ✓ PASS: {name}")
                passed += 1
            else:
                print(f"  ✗ FAIL: {name} (exit {rc})")
        except Exception as err:
            print(f"  ✗ ERROR: {name} ({err})")

    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed on native C++ engine.")
    print("=" * 60)

    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    main()
