# Node.js Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **Node.js 20 LTS** unless noted otherwise.
> New APIs introduced in Node 22+ are marked `[Node 22+]`.
> Comments appear **above** the line they describe.

---

## Table of Contents

1. [Installation & Version Management](#1-installation--version-management)
2. [Module Systems — CommonJS vs ESM](#2-module-systems--commonjs-vs-esm)
3. [Built-in Globals](#3-built-in-globals)
4. [File System — `fs`](#4-file-system--fs)
5. [Path Utilities — `path`](#5-path-utilities--path)
6. [Streams](#6-streams)
7. [HTTP Server — `http` / `https`](#7-http-server--http--https)
8. [HTTP Client — `fetch` / `http.request`](#8-http-client--fetch--httprequest)
9. [Events — `EventEmitter`](#9-events--eventemitter)
10. [Process & Environment](#10-process--environment)
11. [Child Processes — `child_process`](#11-child-processes--child_process)
12. [Worker Threads](#12-worker-threads)
13. [Cluster Module](#13-cluster-module)
14. [Timers & Scheduling](#14-timers--scheduling)
15. [Buffers & Binary Data](#15-buffers--binary-data)
16. [Crypto](#16-crypto)
17. [OS Module](#17-os-module)
18. [URL & Query String](#18-url--query-string)
19. [Readline & CLI Input](#19-readline--cli-input)
20. [Debugging & Profiling](#20-debugging--profiling)
21. [Error Handling Patterns](#21-error-handling-patterns)
22. [npm & Package Management](#22-npm--package-management)
23. [Environment Configuration](#23-environment-configuration)
24. [Testing — Node Test Runner](#24-testing--node-test-runner)
25. [Q&A — Conceptual Questions](#25-qa--conceptual-questions)

---

## 1. Installation & Version Management

### Install via nvm (recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install latest LTS
nvm install --lts

# Install specific version
nvm install 20.11.0

# Switch version
nvm use 20

# Set default
nvm alias default 20

# List installed versions
nvm ls

# Check active version
node --version
npm --version
```

### Key Node.js version milestones

| Version | LTS Status  | Notable Feature                                        |
|---------|-------------|--------------------------------------------------------|
| 18      | Maintenance | `fetch` built-in, Web Streams, `node:` prefix required |
| 20      | Active LTS  | Stable `Permission Model`, `--env-file`, test runner   |
| 22      | Current     | `require(esm)`, `URLPattern`, `node --run`             |

---

## 2. Module Systems — CommonJS vs ESM

### CommonJS (`.js` or `.cjs`, default when no `"type"` in package.json)

```js
// Importing
const fs = require('fs')
const { join, resolve } = require('path')
const myModule = require('./myModule')

// Exporting
module.exports = { foo, bar }
module.exports = MyClass

// Named exports shorthand
exports.foo = function() {}
exports.bar = 42

// CommonJS special variables
console.log(__filename)   // absolute path of this file
console.log(__dirname)    // directory of this file
console.log(require.main === module)  // true if run directly (not require'd)
```

### ESM (`.mjs` or `.js` with `"type": "module"` in package.json)

```js
// Static imports — hoisted, analysed at parse time
import fs from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import myDefault, { named1, named2 } from './myModule.js'

// Dynamic import — returns Promise, works anywhere including CommonJS
const { default: chalk } = await import('chalk')

// Exports
export const PI = 3.14159
export function greet(name) { return `Hello, ${name}` }
export default class App {}

// Re-exports
export { foo, bar } from './utils.js'
export * from './helpers.js'
export * as utils from './utils.js'

// ESM equivalents of __filename / __dirname
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

### Use `node:` prefix for built-ins (best practice, required in some contexts)

```js
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'node:http'
```

### package.json for pure ESM package

```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

---

## 3. Built-in Globals

```js
// Available without require/import in both CJS and ESM
console.log(globalThis)      // the global object (replaces `global`)
console.log(process)         // process info, env, exit, etc.
console.log(Buffer)          // binary data handling
console.log(queueMicrotask)  // schedule a microtask
console.log(setImmediate)    // schedule after I/O callbacks
console.log(clearImmediate)
console.log(setTimeout)
console.log(clearTimeout)
console.log(setInterval)
console.log(clearInterval)
console.log(structuredClone) // deep clone (Node 17+)
console.log(crypto)          // Web Crypto API (Node 19+, no import needed)
console.log(fetch)           // built-in fetch (Node 18+)
console.log(AbortController)
console.log(AbortSignal)
console.log(FormData)        // Node 18+
console.log(ReadableStream)  // Web Streams (Node 18+)
console.log(WritableStream)
console.log(TextEncoder)
console.log(TextDecoder)
console.log(URL)
console.log(URLSearchParams)
console.log(Event)
console.log(EventTarget)
console.log(MessageChannel)
console.log(performance)     // Web Performance API
```

---

## 4. File System — `fs`

### Async (Promise-based) — preferred

```js
import { readFile, writeFile, appendFile, unlink, rename,
         mkdir, rmdir, rm, readdir, stat, access,
         copyFile, watch } from 'node:fs/promises'
import { constants } from 'node:fs'

// Read file as string
const content = await readFile('file.txt', 'utf8')

// Read file as Buffer
const buf = await readFile('image.png')

// Write (overwrites if exists)
await writeFile('out.txt', 'hello\n', 'utf8')

// Append
await appendFile('log.txt', `${new Date().toISOString()} event\n`)

// Delete file
await unlink('tmp.txt')

// Rename / move
await rename('old.txt', 'new.txt')

// Create directory (recursive creates parents)
await mkdir('a/b/c', { recursive: true })

// Remove directory tree
await rm('dist', { recursive: true, force: true })

// List directory
const entries = await readdir('src', { withFileTypes: true })
for (const entry of entries) {
  console.log(entry.name, entry.isDirectory() ? 'DIR' : 'FILE')
}

// File stats
const stats = await stat('file.txt')
console.log(stats.size, stats.mtime, stats.isFile(), stats.isDirectory())

// Check existence / permissions (preferred over try/catch on stat)
try {
  await access('file.txt', constants.R_OK | constants.W_OK)
  console.log('readable and writable')
} catch {
  console.log('not accessible')
}

// Copy
await copyFile('src.txt', 'dest.txt')

// Watch for changes
const watcher = watch('src/', { recursive: true })
for await (const event of watcher) {
  // event: { eventType: 'rename'|'change', filename: string }
  console.log(event.eventType, event.filename)
}
```

### Sync versions (block the event loop — avoid in servers)

```js
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const data = readFileSync('config.json', 'utf8')
writeFileSync('out.txt', data)
const exists = existsSync('file.txt')
```

### Streams for large files

```js
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

// Compress a large file without loading it all into memory
await pipeline(
  createReadStream('bigfile.csv'),
  createGzip(),
  createWriteStream('bigfile.csv.gz')
)
```

---

## 5. Path Utilities — `path`

```js
import path from 'node:path'

// Join segments safely (handles separators)
path.join('src', 'utils', 'index.js')       // 'src/utils/index.js'

// Resolve to absolute path from cwd
path.resolve('src', 'index.js')             // '/project/src/index.js'

// Directory of a file
path.dirname('/home/user/file.txt')          // '/home/user'

// Filename with extension
path.basename('/home/user/file.txt')         // 'file.txt'

// Filename without extension
path.basename('/home/user/file.txt', '.txt') // 'file'

// Extension
path.extname('file.min.js')                  // '.js'

// Parse into object
path.parse('/home/user/file.txt')
// { root: '/', dir: '/home/user', base: 'file.txt', ext: '.txt', name: 'file' }

// Reassemble from parsed object
path.format({ dir: '/home/user', name: 'file', ext: '.txt' })

// Relative path between two absolute paths
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
// '../../impl/bbb'

// Check if absolute
path.isAbsolute('/home/user')  // true

// Platform separator
path.sep   // '/' on POSIX, '\\' on Windows
path.delimiter  // ':' on POSIX, ';' on Windows

// Normalize (resolve . and .. without checking filesystem)
path.normalize('/foo/bar/../baz')  // '/foo/baz'
```

---

## 6. Streams

### Readable stream — consuming data

```js
import { Readable } from 'node:stream'

// Consume via async iteration (preferred)
const readable = Readable.from(['line1\n', 'line2\n', 'line3\n'])
for await (const chunk of readable) {
  process.stdout.write(chunk)
}

// Create readable from async generator
async function* generateData() {
  for (let i = 0; i < 5; i++) {
    yield `item ${i}\n`
  }
}
const stream = Readable.from(generateData())
```

### Writable stream

```js
import { Writable } from 'node:stream'
import { createWriteStream } from 'node:fs'

const out = createWriteStream('out.txt')

// write() returns false when internal buffer is full (backpressure)
const canContinue = out.write('hello\n')
if (!canContinue) {
  // Wait for drain before writing more
  await new Promise(resolve => out.once('drain', resolve))
}

// Signal end of data
out.end()
await new Promise((resolve, reject) => {
  out.on('finish', resolve)
  out.on('error', reject)
})
```

### Transform stream

```js
import { Transform } from 'node:stream'

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase())
  }
})
```

### `pipeline` — pipe with error propagation (always use over `.pipe()`)

```js
import { pipeline } from 'node:stream/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip, createGunzip } from 'node:zlib'
import { Transform } from 'node:stream'

const addLineNumbers = new Transform({
  transform(chunk, _, cb) {
    let n = 0
    const lines = chunk.toString().split('\n').map(l => `${++n}: ${l}`)
    cb(null, lines.join('\n'))
  }
})

await pipeline(
  createReadStream('input.txt'),
  addLineNumbers,
  createGzip(),
  createWriteStream('output.txt.gz')
)
```

### Web Streams (Node 18+)

```js
// Convert Node stream to Web ReadableStream
import { Readable } from 'node:stream'
const webStream = Readable.toWeb(nodeReadable)

// Convert Web ReadableStream to Node Readable
const nodeStream = Readable.fromWeb(webReadableStream)
```

---

## 7. HTTP Server — `http` / `https`

### Basic HTTP server

```js
import { createServer } from 'node:http'

const server = createServer((req, res) => {
  // req: IncomingMessage — req.method, req.url, req.headers
  // res: ServerResponse

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello World\n')
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

server.listen(3000, '0.0.0.0', () => {
  console.log('Listening on http://0.0.0.0:3000')
})
```

### Parse request body

```js
import { createServer } from 'node:http'

async function parseBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString()
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    const body = await parseBody(req)
    const data = JSON.parse(body)
    res.writeHead(201, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ received: data }))
  }
})
```

### HTTPS server

```js
import { createServer } from 'node:https'
import { readFileSync } from 'node:fs'

const server = createServer(
  {
    key: readFileSync('server.key'),
    cert: readFileSync('server.crt'),
  },
  (req, res) => {
    res.writeHead(200)
    res.end('Secure!\n')
  }
)
server.listen(443)
```

### Graceful shutdown

```js
import { createServer } from 'node:http'

const server = createServer(handler)
server.listen(3000)

// Track open connections
const connections = new Set()
server.on('connection', socket => {
  connections.add(socket)
  socket.on('close', () => connections.delete(socket))
})

function shutdown() {
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
  // Force-close remaining keep-alive connections
  for (const socket of connections) socket.destroy()
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

---

## 8. HTTP Client — `fetch` / `http.request`

### Built-in `fetch` (Node 18+)

```js
// GET request
const res = await fetch('https://api.example.com/users')
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
const users = await res.json()

// POST with JSON body
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
})

// Timeout via AbortSignal
const res2 = await fetch('https://slow.api.com/data', {
  signal: AbortSignal.timeout(5000),
})

// Upload a file
const form = new FormData()
form.append('file', new Blob([fileBuffer]), 'upload.csv')
await fetch('https://api.example.com/upload', { method: 'POST', body: form })

// Stream response body
const res3 = await fetch('https://api.example.com/stream')
for await (const chunk of res3.body) {
  process.stdout.write(Buffer.from(chunk))
}
```

### Low-level `http.request` (for legacy or fine-grained control)

```js
import { request } from 'node:https'

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end()
  })
}
```

---

## 9. Events — `EventEmitter`

```js
import { EventEmitter } from 'node:events'

class Database extends EventEmitter {
  async connect(url) {
    // ... connection logic
    // Emit event when connected
    this.emit('connect', { url, time: Date.now() })
  }
  async query(sql) {
    this.emit('query', sql)
    // ...
  }
}

const db = new Database()

// Register listener
db.on('connect', ({ url }) => console.log(`Connected to ${url}`))

// One-time listener
db.once('connect', () => console.log('First connect only'))

// Remove specific listener
function onQuery(sql) { console.log('Query:', sql) }
db.on('query', onQuery)
db.off('query', onQuery)

// Remove all listeners for an event
db.removeAllListeners('query')

// Listen for any unhandled error (without this, errors throw)
db.on('error', err => console.error('DB error:', err))

// Get registered listeners
console.log(db.listenerNames())    // all event names with listeners
console.log(db.listenerCount('connect'))

// Default max listeners is 10 — increase to suppress warning
db.setMaxListeners(20)

// Promise-based once()
import { once } from 'node:events'
const [payload] = await once(db, 'connect')

// Async iteration over events
import { on } from 'node:events'
const ac = new AbortController()
for await (const [event] of on(db, 'query', { signal: ac.signal })) {
  console.log('query event:', event)
}
```

---

## 10. Process & Environment

```js
// Command-line arguments (index 0 = node, 1 = script, 2+ = user args)
const args = process.argv.slice(2)

// Environment variables
const port = process.env.PORT ?? '3000'
const nodeEnv = process.env.NODE_ENV ?? 'development'

// Current working directory
console.log(process.cwd())

// Change cwd
process.chdir('/tmp')

// Exit
process.exit(0)   // success
process.exit(1)   // failure

// Exit code (set before process exits naturally)
process.exitCode = 1

// Memory usage
const mem = process.memoryUsage()
console.log(mem.heapUsed, mem.heapTotal, mem.rss)

// CPU usage since process start or last call
const cpu = process.cpuUsage()
console.log(cpu.user, cpu.system)  // microseconds

// High-resolution timer (nanoseconds)
const start = process.hrtime.bigint()
// ... work ...
const elapsed = process.hrtime.bigint() - start
console.log(`${elapsed / 1_000_000n}ms`)

// Process info
console.log(process.pid)
console.log(process.ppid)
console.log(process.platform)   // 'linux', 'darwin', 'win32'
console.log(process.arch)       // 'x64', 'arm64'
console.log(process.version)    // 'v20.11.0'
console.log(process.versions)   // { node, v8, uv, zlib, ... }

// Standard I/O
process.stdin.resume()
process.stdout.write('output\n')
process.stderr.write('error\n')

// Lifecycle hooks
process.on('exit', code => { /* synchronous cleanup only */ })
process.on('beforeExit', async () => { /* can do async work */ })
process.on('uncaughtException', (err, origin) => { /* last resort */ })
process.on('unhandledRejection', (reason, promise) => { /* log it */ })
process.on('SIGTERM', () => { /* graceful shutdown */ })
process.on('SIGINT', () => { /* Ctrl-C */ })
```

### `--env-file` flag (Node 20.6+)

```bash
# Load .env file without dotenv package
node --env-file=.env server.js

# Multiple env files (later overrides earlier)
node --env-file=.env --env-file=.env.local server.js
```

---

## 11. Child Processes — `child_process`

```js
import { exec, execFile, spawn, fork } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

// exec — runs in shell, captures output, good for simple commands
const { stdout, stderr } = await execAsync('ls -la /tmp')
console.log(stdout)

// execFile — no shell, safer for user input
const { stdout: out } = await promisify(execFile)('git', ['log', '--oneline', '-5'])

// spawn — streaming I/O, no shell by default
const child = spawn('node', ['worker.js', '--verbose'])

child.stdout.on('data', chunk => process.stdout.write(chunk))
child.stderr.on('data', chunk => process.stderr.write(chunk))
child.on('close', code => console.log(`Exited with ${code}`))

// spawn with shell (allows pipes and redirects)
const sh = spawn('find . -name "*.js" | wc -l', { shell: true })

// Piped input to child
const grep = spawn('grep', ['error'])
grep.stdin.write('INFO: ok\nERROR: failed\n')
grep.stdin.end()

// fork — spawn a Node.js child with IPC channel
const worker = fork('./worker.js', [], { env: process.env })
worker.send({ type: 'START', payload: { id: 1 } })
worker.on('message', msg => console.log('Worker said:', msg))
worker.on('error', err => console.error('Fork error:', err))

// Timeout and kill
const proc = spawn('long-running-task')
setTimeout(() => proc.kill('SIGTERM'), 30_000)
```

---

## 12. Worker Threads

```js
// main.js
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { cpus } from 'node:os'

if (isMainThread) {
  const NUM_WORKERS = cpus().length

  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const w = new Worker(new URL(import.meta.url), { workerData: data })
      w.on('message', resolve)
      w.on('error', reject)
      w.on('exit', code => { if (code !== 0) reject(new Error(`Worker exited ${code}`)) })
    })
  }

  // Fan out work across all CPU cores
  const results = await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker({ chunk: i }))
  )
  console.log('All done:', results)

} else {
  // Worker code
  const { chunk } = workerData

  // CPU-intensive work
  let result = 0
  for (let i = 0; i < 1e8; i++) result += i

  parentPort.postMessage({ chunk, result })
}
```

### SharedArrayBuffer — zero-copy shared memory

```js
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

if (isMainThread) {
  // Allocate shared buffer
  const sharedBuffer = new SharedArrayBuffer(4)
  const counter = new Int32Array(sharedBuffer)

  const w = new Worker(new URL(import.meta.url), { workerData: { sharedBuffer } })
  w.on('exit', () => console.log('Counter:', counter[0]))

} else {
  const counter = new Int32Array(workerData.sharedBuffer)
  // Atomic increment — safe across threads
  Atomics.add(counter, 0, 1)
  parentPort.postMessage('done')
}
```

### MessageChannel — bidirectional communication

```js
import { Worker, MessageChannel } from 'node:worker_threads'

const { port1, port2 } = new MessageChannel()
const worker = new Worker('./worker.js', { workerData: { port: port2 }, transferList: [port2] })

port1.on('message', msg => console.log('From worker:', msg))
port1.postMessage({ cmd: 'ping' })
```

---

## 13. Cluster Module

```js
import cluster from 'node:cluster'
import { createServer } from 'node:http'
import { cpus } from 'node:os'

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running`)

  // Fork one worker per CPU core
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}) — respawning`)
    cluster.fork()
  })

} else {
  // Each worker runs this HTTP server — OS load-balances connections
  const server = createServer((req, res) => {
    res.writeHead(200)
    res.end(`Hello from worker ${process.pid}\n`)
  })
  server.listen(3000)
  console.log(`Worker ${process.pid} started`)
}
```

---

## 14. Timers & Scheduling

```js
// setTimeout — run once after delay (ms)
const tid = setTimeout(() => console.log('delayed'), 1000)
clearTimeout(tid)

// setInterval — run repeatedly every delay (ms)
const iid = setInterval(() => console.log('tick'), 500)
clearInterval(iid)

// setImmediate — run after current I/O callbacks, before timers
setImmediate(() => console.log('immediate'))

// process.nextTick — run before any I/O callbacks (microtask-like)
process.nextTick(() => console.log('next tick'))

// Execution order in one iteration:
// 1. process.nextTick callbacks
// 2. Promise microtasks (queueMicrotask)
// 3. setImmediate callbacks
// 4. setTimeout/setInterval callbacks

// Promise-based sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
await sleep(1000)

// Timers/promises — Promise versions of timers (Node 15+)
import { setTimeout as delay, setInterval as tick, setImmediate as immediate } from 'node:timers/promises'

await delay(1000, 'value')  // resolves with 'value' after 1s

// Async iterable interval
for await (const _ of tick(1000)) {
  console.log('tick')
  if (done) break
}

// Ref / unref — allow process to exit despite pending timer
const t = setTimeout(() => {}, 999_999)
t.unref()  // won't keep process alive
t.ref()    // will keep process alive again
```

---

## 15. Buffers & Binary Data

```js
// Create Buffer
const buf1 = Buffer.alloc(10)              // 10 zero bytes
const buf2 = Buffer.alloc(10, 0xff)        // 10 bytes of 0xff
const buf3 = Buffer.from('hello', 'utf8')  // from string
const buf4 = Buffer.from([0x48, 0x65])     // from array
const buf5 = Buffer.from(arrayBuffer)      // from ArrayBuffer

// Convert
buf3.toString('utf8')    // 'hello'
buf3.toString('hex')     // '68656c6c6f'
buf3.toString('base64')  // 'aGVsbG8='

// Inspect
console.log(buf3.length)       // 5
console.log(buf3[0])           // 72 (byte value)
console.log(buf3.readUInt8(0)) // 72

// Copy / slice (slice shares memory, subarray is same)
const copy = Buffer.from(buf3)
const slice = buf3.subarray(0, 3)  // 'hel'

// Concatenate
const combined = Buffer.concat([buf3, Buffer.from(' world')])

// Compare
buf3.equals(Buffer.from('hello'))   // true
buf3.compare(Buffer.from('hello'))  // 0

// Encoding conversions
Buffer.from('aGVsbG8=', 'base64').toString()  // 'hello'

// Safe integer reads from binary data
const data = Buffer.from([0x00, 0x00, 0x04, 0xd2])
data.readUInt32BE(0)  // 1234 (big-endian)
data.readUInt32LE(0)  // reads little-endian
```

---

## 16. Crypto

```js
import {
  createHash, createHmac, createCipheriv, createDecipheriv,
  randomBytes, randomUUID, scrypt, pbkdf2, timingSafeEqual,
  generateKeyPair, sign, verify, X509Certificate
} from 'node:crypto'
import { promisify } from 'node:util'

// Hash (SHA-256)
const hash = createHash('sha256').update('data').digest('hex')

// HMAC
const hmac = createHmac('sha256', 'secret').update('message').digest('base64')

// Random bytes (cryptographically secure)
const token = randomBytes(32).toString('hex')

// Random UUID v4
const id = randomUUID()

// Password hashing with scrypt
const scryptAsync = promisify(scrypt)
const salt = randomBytes(16)
const key = await scryptAsync('password', salt, 64)
const stored = `${salt.toString('hex')}:${key.toString('hex')}`

// Verify password
async function verifyPassword(password, stored) {
  const [saltHex, keyHex] = stored.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const key = Buffer.from(keyHex, 'hex')
  const derived = await scryptAsync(password, salt, 64)
  return timingSafeEqual(derived, key)
}

// AES-256-GCM encryption
function encrypt(plaintext, key) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return { iv: iv.toString('hex'), data: encrypted.toString('hex'), tag: authTag.toString('hex') }
}

function decrypt({ iv, data, tag }, key) {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(tag, 'hex'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]).toString()
}

// Generate RSA key pair
const { privateKey, publicKey } = await promisify(generateKeyPair)('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

// Sign and verify
const signature = sign('sha256', Buffer.from('message'), privateKey)
const valid = verify('sha256', Buffer.from('message'), publicKey, signature)
```

---

## 17. OS Module

```js
import os from 'node:os'

// Host information
os.hostname()       // 'my-server'
os.platform()       // 'linux' | 'darwin' | 'win32'
os.arch()           // 'x64' | 'arm64'
os.release()        // '5.15.0-76-generic'
os.type()           // 'Linux' | 'Darwin' | 'Windows_NT'
os.version()        // '#83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023'

// Resources
os.cpus()           // array of CPU info objects
os.cpus().length    // number of logical cores
os.totalmem()       // bytes
os.freemem()        // bytes
os.loadavg()        // [1m, 5m, 15m] — not meaningful on Windows

// Paths
os.homedir()        // '/home/alice'
os.tmpdir()         // '/tmp'
os.devNull          // '/dev/null' or '\\.\nul' on Windows

// Network interfaces
const nets = os.networkInterfaces()
const addresses = Object.values(nets).flat()
  .filter(n => n.family === 'IPv4' && !n.internal)
  .map(n => n.address)

// User info
os.userInfo()  // { username, uid, gid, shell, homedir }

// EOL — use when writing cross-platform text files
os.EOL  // '\n' on POSIX, '\r\n' on Windows

// Uptime in seconds
os.uptime()
```

---

## 18. URL & Query String

```js
import { URL, URLSearchParams } from 'node:url'

// Parse URL
const url = new URL('https://api.example.com:8080/v1/users?page=2&limit=10#results')
url.protocol   // 'https:'
url.hostname   // 'api.example.com'
url.port       // '8080'
url.host       // 'api.example.com:8080'
url.pathname   // '/v1/users'
url.search     // '?page=2&limit=10'
url.hash       // '#results'
url.origin     // 'https://api.example.com:8080'
url.href       // full URL string

// Modify URL properties
url.pathname = '/v2/users'
url.searchParams.set('page', '3')
console.log(url.href)

// URLSearchParams
const params = new URLSearchParams({ page: 2, sort: 'asc', tags: ['a', 'b'] })
params.get('page')       // '2'
params.getAll('tags')    // ['a', 'b']
params.has('sort')       // true
params.set('page', '3')
params.delete('sort')
params.append('filter', 'active')

// Iterate
for (const [key, value] of params) {
  console.log(key, value)
}

params.toString()  // 'page=3&tags=a&tags=b&filter=active'

// Resolve relative URL
new URL('/api/users', 'https://example.com').href
// 'https://example.com/api/users'

// fileURLToPath / pathToFileURL
import { fileURLToPath, pathToFileURL } from 'node:url'
fileURLToPath('file:///home/user/file.txt')   // '/home/user/file.txt'
pathToFileURL('/home/user/file.txt').href      // 'file:///home/user/file.txt'
```

---

## 19. Readline & CLI Input

```js
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const rl = readline.createInterface({ input, output })

// Prompt user
const name = await rl.question('What is your name? ')
console.log(`Hello, ${name}!`)

const confirm = await rl.question('Continue? (y/n) ')
if (confirm.toLowerCase() !== 'y') process.exit(0)

rl.close()

// Read lines from a file
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

const fileRL = createInterface({
  input: createReadStream('data.txt'),
  // Disable terminal mode for file input
  terminal: false,
})

for await (const line of fileRL) {
  console.log('Line:', line)
}
```

### Minimal argument parser (without libraries)

```js
const args = process.argv.slice(2)
const flags = {}
const positional = []

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2)
    // Handle --key=value and --key value forms
    if (args[i].includes('=')) {
      const [k, v] = args[i].slice(2).split('=')
      flags[k] = v
    } else if (args[i + 1] && !args[i + 1].startsWith('--')) {
      flags[key] = args[++i]
    } else {
      flags[key] = true
    }
  } else {
    positional.push(args[i])
  }
}

console.log(flags, positional)
```

### `parseArgs` (Node 18.3+, built-in)

```js
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    port:    { type: 'string',  short: 'p', default: '3000' },
    verbose: { type: 'boolean', short: 'v', default: false  },
    env:     { type: 'string',  short: 'e', default: 'dev'  },
  },
  allowPositionals: true,
})

console.log(values.port, values.verbose, positionals)
```

---

## 20. Debugging & Profiling

### Built-in inspector

```bash
# Start with inspector (open chrome://inspect in Chrome)
node --inspect server.js

# Break on first line
node --inspect-brk server.js

# Specify port
node --inspect=9229 server.js
```

### Console methods

```js
// Log with label and timing
console.time('db-query')
await db.query(sql)
console.timeEnd('db-query')

// Counts how many times called with this label
console.count('request')

// Tabular data
console.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }])

// Stack trace
console.trace('debug marker')

// Grouped output
console.group('Auth flow')
console.log('Step 1')
console.log('Step 2')
console.groupEnd()

// Conditional assert
console.assert(value > 0, 'value must be positive', { value })
```

### V8 profiler

```bash
# Produce V8 profiler output
node --prof server.js

# Process the isolate log file
node --prof-process isolate-*.log > profile.txt
```

### Heap snapshot

```js
import v8 from 'node:v8'
import { writeFileSync } from 'node:fs'

// Write heap snapshot to file (open in Chrome DevTools Memory tab)
const snapshot = v8.writeHeapSnapshot()
console.log('Heap snapshot written to', snapshot)
```

### `--watch` mode (Node 19+)

```bash
# Restart on file changes (no nodemon needed)
node --watch server.js

# Watch specific files
node --watch-path=src server.js
```

### Async stack traces — `--async-context`

```bash
# Better async stack traces (enabled by default in newer Node)
node --async-context-frame server.js
```

---

## 21. Error Handling Patterns

### Custom error classes

```js
class AppError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.code = options.code ?? 'APP_ERROR'
    this.statusCode = options.statusCode ?? 500
    Error.captureStackTrace(this, this.constructor)
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, { code: 'NOT_FOUND', statusCode: 404 })
    this.resource = resource
    this.id = id
  }
}

class ValidationError extends AppError {
  constructor(message, fields) {
    super(message, { code: 'VALIDATION_ERROR', statusCode: 422 })
    this.fields = fields
  }
}

// Usage
try {
  throw new NotFoundError('User', 42)
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.statusCode, err.resource, err.id)
  }
  // err.cause chains the original error
}
```

### Result pattern (avoid throwing for expected failures)

```js
function ok(value) { return { ok: true, value } }
function err(error) { return { ok: false, error } }

async function findUser(id) {
  try {
    const user = await db.users.findById(id)
    if (!user) return err(new NotFoundError('User', id))
    return ok(user)
  } catch (e) {
    return err(new AppError('Database error', { cause: e }))
  }
}

const result = await findUser(42)
if (!result.ok) {
  // Handle error without try/catch at the call site
  return res.status(result.error.statusCode).json({ error: result.error.message })
}
console.log(result.value)
```

### Global handlers (last resort — always log and exit)

```js
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught exception:', err, 'Origin:', origin)
  // Must exit — process state is indeterminate after uncaughtException
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
  // In production: exit; in development: log and continue
  process.exit(1)
})
```

### `AsyncLocalStorage` — request context propagation

```js
import { AsyncLocalStorage } from 'node:async_hooks'

const requestContext = new AsyncLocalStorage()

// Middleware — set context at request entry point
function contextMiddleware(req, res, next) {
  const store = { requestId: crypto.randomUUID(), userId: req.user?.id }
  requestContext.run(store, next)
}

// Deep in call stack — access request context without passing it
function logWithContext(message) {
  const ctx = requestContext.getStore()
  console.log(JSON.stringify({ ...ctx, message, ts: new Date().toISOString() }))
}
```

---

## 22. npm & Package Management

### Essential commands

```bash
# Initialise package.json
npm init -y

# Install and save to dependencies
npm install express

# Install and save to devDependencies
npm install --save-dev jest eslint typescript

# Install globally
npm install -g nodemon

# Install exact version
npm install lodash@4.17.21

# Install from specific tag
npm install react@next

# Remove package
npm uninstall express

# Update packages
npm update
npm update lodash

# Check outdated packages
npm outdated

# List installed packages
npm list --depth=0

# Audit for vulnerabilities
npm audit
npm audit fix
npm audit fix --force

# Clean install (respects package-lock.json exactly)
npm ci

# Run script defined in package.json
npm run build
npm run test
npm start
```

### package.json scripts

```json
{
  "scripts": {
    "start":       "node dist/server.js",
    "dev":         "node --watch --env-file=.env src/server.js",
    "build":       "tsc",
    "test":        "node --test",
    "test:watch":  "node --test --watch",
    "lint":        "eslint src/",
    "format":      "prettier --write src/",
    "prestart":    "npm run build",
    "postinstall": "node scripts/setup.js"
  }
}
```

### npm workspaces (monorepo)

```json
{
  "name": "my-monorepo",
  "workspaces": ["packages/*", "apps/*"]
}
```

```bash
# Run command in all workspaces
npm run build --workspaces

# Run in specific workspace
npm run test --workspace=packages/core

# Install dependency in a workspace
npm install express --workspace=apps/api
```

---

## 23. Environment Configuration

### `.env` file with `--env-file` (Node 20.6+)

```bash
# .env
DATABASE_URL=postgresql://localhost:5432/mydb
PORT=3000
JWT_SECRET=change-me-in-production
NODE_ENV=development
LOG_LEVEL=info
```

```bash
node --env-file=.env src/server.js
```

### Config module pattern

```js
// config.js — validate and parse env at startup
const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    url: required('DATABASE_URL'),
    poolSize: Number(process.env.DB_POOL_SIZE ?? 10),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
}

function required(key) {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export default config
```

---

## 24. Testing — Node Test Runner

Built-in test runner — no install needed (stable from Node 20).

```js
import { describe, it, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

// Basic test
it('adds two numbers', () => {
  assert.equal(1 + 2, 3)
})

// Describe block (suite)
describe('User service', () => {
  let db

  before(async () => {
    db = await createTestDb()
  })

  after(async () => {
    await db.close()
  })

  beforeEach(async () => {
    await db.seed()
  })

  afterEach(async () => {
    await db.clear()
  })

  it('creates a user', async () => {
    const user = await userService.create({ name: 'Alice', email: 'alice@example.com' })
    assert.equal(user.name, 'Alice')
    assert.match(user.id, /^[0-9a-f-]{36}$/)
  })

  it('throws on duplicate email', async () => {
    await userService.create({ name: 'Bob', email: 'bob@example.com' })
    await assert.rejects(
      () => userService.create({ name: 'Bob2', email: 'bob@example.com' }),
      { code: 'DUPLICATE_EMAIL' }
    )
  })
})

// Skipping and marking TODO
it.skip('not implemented yet', () => {})
it.todo('needs database mock')

// Mocking — built-in (Node 20.1+)
import { mock } from 'node:test'

it('calls sendEmail', async () => {
  const send = mock.fn(() => Promise.resolve({ messageId: '123' }))
  const svc = new NotificationService({ sendEmail: send })
  await svc.notifyUser(1, 'Welcome!')
  assert.equal(send.mock.calls.length, 1)
  assert.equal(send.mock.calls[0].arguments[0], 'user@example.com')
  mock.reset()
})

// Run subtests
it('user CRUD', async t => {
  await t.test('create', async () => { /* ... */ })
  await t.test('read',   async () => { /* ... */ })
  await t.test('delete', async () => { /* ... */ })
})
```

```bash
# Run all test files
node --test

# Run specific file
node --test src/**/*.test.js

# Watch mode (Node 22+)
node --test --watch

# Coverage (Node 22+)
node --test --experimental-test-coverage
```

---

## 25. Q&A — Conceptual Questions

**Q: What is the Node.js event loop and why does it matter?**
A: Node.js is single-threaded but handles concurrency via the event loop — a loop that pulls callbacks off a queue whenever the call stack is empty. I/O operations (disk, network) are offloaded to libuv's thread pool so the main thread is never blocked waiting. This means a single Node process can handle thousands of concurrent connections, but CPU-intensive work blocks all of them — use Worker Threads for CPU work.

**Q: What is the difference between `process.nextTick` and `setImmediate`?**
A: `process.nextTick` callbacks run before any I/O callbacks in the same iteration of the event loop — they drain their entire queue before moving on. `setImmediate` runs in the *check* phase of the next event loop iteration, after I/O callbacks. For most cases, prefer `setImmediate` or resolved Promises; excessive `nextTick` usage can starve I/O.

**Q: When should I use Worker Threads vs `cluster` vs `child_process`?**
A: **Worker Threads** share memory with the parent via `SharedArrayBuffer`, start fast, and are best for CPU-intensive work you want to keep in-process. **`cluster`** forks full Node.js processes that each bind to the same port — the OS load-balances incoming TCP connections, making it the standard way to scale an HTTP server across CPU cores. **`child_process`** spawns arbitrary processes (Node or otherwise) and is best for calling CLI tools, running isolated scripts, or communicating via stdin/stdout.

**Q: What is backpressure in streams and how do you handle it?**
A: When a writable stream's internal buffer is full, `stream.write()` returns `false`. Continuing to write anyway queues data in memory until the process runs out. Handle backpressure by waiting for the `drain` event before writing more, or use `pipeline()` which handles this automatically — it pauses the readable when the writable is full.

**Q: What is `AsyncLocalStorage` and when should you use it?**
A: It provides a context store that propagates automatically through async call chains (Promises, `await`, `setImmediate`, etc.) without passing it as a parameter. The canonical use case is request-scoped data in an HTTP server: set `{ requestId, userId, traceId }` at the start of a request handler, and any code called downstream can read it without threading it through every function signature.

**Q: CommonJS or ESM — which should I use for new projects?**
A: ESM is the modern standard and the direction Node.js is moving. Use it for new projects. Set `"type": "module"` in `package.json`, use `.js` extensions, and use `import`/`export`. Caveats: some older packages are CJS-only (use dynamic `import()` to call them from ESM); tooling like Jest had ESM issues historically (mostly resolved now). For libraries that must support both, publish dual CJS/ESM builds using `exports` map in `package.json`.

**Q: How do you prevent a Node.js process from exiting while background work is pending?**
A: The process exits when the event loop has nothing left to process. Keep it alive by holding an open handle: a `net.Server`, an `http.Server`, an uncancelled `setInterval`, or any stream in flowing mode. Use `.unref()` on timers/servers to mark them as non-blocking (process can exit even if they're pending). Use `.ref()` to reverse that.

**Q: What is `Error.cause` and when should you use it?**
A: Introduced in ES2022 / Node 16.9+, `new Error('message', { cause: originalError })` chains the root cause to the wrapper. Use it whenever you catch an error and re-throw a higher-level one — it preserves the full chain for debugging without losing the original stack trace. Inspect with `err.cause`.

**Q: How does `--env-file` compare to the `dotenv` package?**
A: `--env-file` (Node 20.6+) is built in, requires no install, and loads before your code runs. `dotenv` must be called in code (`dotenv.config()`), supports more features (multi-line values, variable expansion, `.env.local` override patterns), and works on older Node versions. For new projects targeting Node 20+, `--env-file` is sufficient; use `dotenv` when you need override chains, expansion, or compatibility.

**Q: What happens if you don't handle the `error` event on an EventEmitter?**
A: An unhandled `error` event throws — it is re-emitted as an uncaught exception, which by default crashes the process. Always add a `emitter.on('error', handler)` listener for any EventEmitter that could emit errors (streams, servers, database connections). Alternatively, attach a global `process.on('uncaughtException', ...)` handler, but that should be a last-resort log-and-exit, not a recovery mechanism.
