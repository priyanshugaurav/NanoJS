import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function nanoJsRunnerPlugin() {
  return {
    name: 'nanojs-runner',
    configureServer(server) {
      // 1. Run custom JS code via C++ binary
      server.middlewares.use('/api/run', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('Method Not Allowed')
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { code } = JSON.parse(body || '{}')
            const tempFile = path.join(os.tmpdir(), `nanojs_${Date.now()}_${Math.random().toString(36).slice(2)}.mjs`)
            fs.writeFileSync(tempFile, code || '')

            const binaryPath = path.resolve(__dirname, '../nanojs')
            const startTime = Date.now()

            execFile(binaryPath, [tempFile], { timeout: 8000 }, (err, stdout, stderr) => {
              const execTimeMs = Date.now() - startTime
              try { fs.unlinkSync(tempFile) } catch {}

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                native: true,
                stdout: stdout || '',
                stderr: stderr || (err && err.killed ? 'Execution timed out (8s limit)' : (err ? err.message : '')),
                exitCode: err ? (err.code || 1) : 0,
                executionTimeMs: execTimeMs
              }))
            })
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // 2. Run C++ test suite
      server.middlewares.use('/api/tests', async (req, res) => {
        const binaryPath = path.resolve(__dirname, '../nanojs')
        const examplesDir = path.resolve(__dirname, '../examples')

        try {
          const files = fs.readdirSync(examplesDir)
            .filter(f => f.startsWith('test_') && f.endsWith('.mjs') && !f.includes('test_16'))
            .sort()

          const results = []
          for (const file of files) {
            const filePath = path.join(examplesDir, file)
            const t0 = Date.now()
            const result = await new Promise((resolve) => {
              execFile(binaryPath, [filePath], { timeout: 4000 }, (err, stdout, stderr) => {
                const duration = Date.now() - t0
                resolve({
                  name: file,
                  passed: !err && (err?.code ?? 0) === 0,
                  timeMs: duration,
                  error: err ? (err.message || stderr) : null
                })
              })
            })
            results.push(result)
          }

          const passedCount = results.filter(r => r.passed).length
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            native: true,
            total: results.length,
            passed: passedCount,
            failed: results.length - passedCount,
            results
          }))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // 3. System info endpoint
      server.middlewares.use('/api/info', (req, res) => {
        const binaryPath = path.resolve(__dirname, '../nanojs')
        const exists = fs.existsSync(binaryPath)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          nativeBinaryExists: exists,
          platform: process.platform,
          arch: process.arch,
          version: '1.0.0',
          engine: 'NanoJS C++17'
        }))
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), nanoJsRunnerPlugin()],
})
