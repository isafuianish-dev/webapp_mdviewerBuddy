# Python WebSocket Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> Examples use **`websockets` 12+** (asyncio-based) and **`fastapi` 0.100+** unless noted.
> Install: `pip install websockets fastapi uvicorn[standard] websocket-client`

---

## Table of Contents

1. [WebSocket Protocol Primer](#1-websocket-protocol-primer)
2. [websockets — Async Server](#2-websockets--async-server)
3. [websockets — Async Client](#3-websockets--async-client)
4. [websocket-client — Synchronous Client](#4-websocket-client--synchronous-client)
5. [FastAPI / Starlette WebSocket Server](#5-fastapi--starlette-websocket-server)
6. [aiohttp WebSocket Server & Client](#6-aiohttp-websocket-server--client)
7. [Broadcasting & Rooms](#7-broadcasting--rooms)
8. [Ping / Pong & Heartbeat](#8-ping--pong--heartbeat)
9. [Authentication & Headers](#9-authentication--headers)
10. [Binary & Structured Data](#10-binary--structured-data)
11. [Reconnection & Resilience](#11-reconnection--resilience)
12. [TLS / SSL (wss://)](#12-tls--ssl-wss)
13. [Compression](#13-compression)
14. [Error Handling](#14-error-handling)
15. [Testing WebSockets](#15-testing-websockets)
16. [Browser JavaScript Client](#16-browser-javascript-client)
17. [Production Patterns](#17-production-patterns)
18. [Q&A — Conceptual Questions](#18-qa--conceptual-questions)

---

## 1. WebSocket Protocol Primer

### How WebSockets work

```
Client                              Server
  |                                   |
  |--- HTTP GET /ws (Upgrade req) --->|
  |<-- 101 Switching Protocols -------|
  |                                   |
  |=== Full-duplex TCP frames ========|
  |--- text/binary frame ------------>|
  |<-- text/binary frame -------------|
  |--- close frame ------------------->|
  |<-- close frame -------------------|
  |                                   |
```

| Property | HTTP | WebSocket |
|----------|------|-----------|
| Direction | Request / Response | Full-duplex |
| Overhead per message | High (headers) | Low (2–10 byte frame header) |
| Connection | New per request | Persistent |
| Server push | SSE / polling | Native |
| Protocol | HTTP/1.1+ | ws:// or wss:// |

### URL schemes

```
ws://host:port/path    — unencrypted  (like http://)
wss://host:port/path   — TLS-encrypted (like https://)
```

### WebSocket frame types (opcodes)

| Opcode | Meaning |
|--------|---------|
| `0x1` | Text frame (UTF-8) |
| `0x2` | Binary frame |
| `0x8` | Connection close |
| `0x9` | Ping |
| `0xA` | Pong |

---

## 2. websockets — Async Server

### Minimal echo server

```python
# pip install websockets
import asyncio
import websockets

async def handler(websocket):
    # websocket is a WebSocketServerProtocol instance
    async for message in websocket:
        # Echo every message back to the sender
        await websocket.send(f"echo: {message}")

async def main():
    # serve() creates a TCP server on localhost:8765
    async with websockets.serve(handler, "localhost", 8765):
        # Block forever (until Ctrl-C)
        await asyncio.Future()

asyncio.run(main())
```

### Server with connection lifecycle

```python
import asyncio
import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

async def handler(websocket):
    remote = websocket.remote_address
    print(f"[+] connected  {remote}")
    try:
        async for message in websocket:
            print(f"[{remote}] received: {message!r}")
            await websocket.send(f"ack: {message}")
    except ConnectionClosedOK:
        # Client sent a proper close frame
        print(f"[-] closed normally  {remote}")
    except ConnectionClosedError as e:
        # Connection dropped without a close frame
        print(f"[!] connection error  {remote}: {e}")
    finally:
        print(f"[~] handler done  {remote}")

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()

asyncio.run(main())
```

### Server configuration options

```python
async with websockets.serve(
    handler,
    "0.0.0.0",
    8765,
    # Maximum incoming message size in bytes (default 1 MiB)
    max_size=10 * 1024 * 1024,
    # Number of queued connections before refusing new ones
    max_queue=32,
    # Seconds of inactivity before sending a keepalive ping
    ping_interval=20,
    # Seconds to wait for a pong before closing the connection
    ping_timeout=10,
    # Close the connection if the open handshake takes longer than this
    open_timeout=5,
):
    await asyncio.Future()
```

### Sending to the client from outside the handler

```python
import asyncio
import websockets

CONNECTIONS: set[websockets.WebSocketServerProtocol] = set()

async def handler(websocket):
    CONNECTIONS.add(websocket)
    try:
        async for _ in websocket:
            pass   # keep connection alive; messages ignored in this example
    finally:
        CONNECTIONS.discard(websocket)

async def broadcast_loop():
    # Send a timestamp to all connected clients every second
    import datetime
    while True:
        await asyncio.sleep(1)
        if CONNECTIONS:
            msg = datetime.datetime.now().isoformat()
            # gather ignores failed sends (closed connections)
            await asyncio.gather(
                *[ws.send(msg) for ws in CONNECTIONS],
                return_exceptions=True,
            )

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await broadcast_loop()

asyncio.run(main())
```

---

## 3. websockets — Async Client

### Minimal client

```python
import asyncio
import websockets

async def main():
    # connect() is an async context manager — closes on exit
    async with websockets.connect("ws://localhost:8765") as ws:
        await ws.send("hello")
        reply = await ws.recv()
        print(f"received: {reply}")

asyncio.run(main())
```

### Client that sends and receives concurrently

```python
import asyncio
import websockets

async def send_messages(ws):
    for i in range(5):
        await ws.send(f"message {i}")
        await asyncio.sleep(0.5)
    # Signal the server we are done
    await ws.close()

async def receive_messages(ws):
    try:
        async for message in ws:
            print(f"received: {message}")
    except websockets.exceptions.ConnectionClosedOK:
        pass

async def main():
    async with websockets.connect("ws://localhost:8765") as ws:
        # Run sender and receiver concurrently
        await asyncio.gather(
            send_messages(ws),
            receive_messages(ws),
        )

asyncio.run(main())
```

### Client with custom headers and subprotocol

```python
import asyncio
import websockets

async def main():
    # Pass Authorization header with the handshake request
    headers = {"Authorization": "Bearer eyJhbGciOi..."}

    # Request a specific subprotocol (server must also agree)
    async with websockets.connect(
        "wss://api.example.com/ws",
        additional_headers=headers,
        subprotocols=["chat.v1"],
    ) as ws:
        print(f"negotiated: {ws.subprotocol}")
        await ws.send("hello")
        print(await ws.recv())

asyncio.run(main())
```

### Client configuration options

```python
async with websockets.connect(
    "ws://localhost:8765",
    # Seconds for the opening handshake
    open_timeout=5,
    # Seconds to wait for close handshake
    close_timeout=5,
    # Maximum incoming message size
    max_size=10 * 1024 * 1024,
    # Keepalive ping
    ping_interval=20,
    ping_timeout=10,
    # Extra HTTP headers on the upgrade request
    additional_headers={"X-Client-ID": "abc123"},
) as ws:
    ...
```

---

## 4. websocket-client — Synchronous Client

`websocket-client` is a synchronous (blocking) WebSocket client. Useful in scripts, threads, or non-async code.

```bash
pip install websocket-client
```

### Basic synchronous usage

```python
import websocket

# Simple one-shot send/receive
ws = websocket.create_connection("ws://localhost:8765")
ws.send("hello")
result = ws.recv()
print(result)
ws.close()
```

### Event-driven (threaded) client

```python
import websocket
import threading

def on_message(ws, message):
    print(f"received: {message}")

def on_error(ws, error):
    print(f"error: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"closed: {close_status_code} {close_msg}")

def on_open(ws):
    print("connected")
    # Send from a separate thread to avoid blocking on_open
    def run():
        for i in range(3):
            ws.send(f"message {i}")
        ws.close()
    threading.Thread(target=run).start()

# WebSocketApp runs receive loop in the calling thread
app = websocket.WebSocketApp(
    "ws://localhost:8765",
    on_open=on_open,
    on_message=on_message,
    on_error=on_error,
    on_close=on_close,
)

# run_forever blocks; set dispatcher=rel for non-blocking
app.run_forever(
    ping_interval=30,
    ping_timeout=10,
    reconnect=5,          # automatically reconnect after 5 seconds on failure
)
```

### Synchronous client with headers

```python
import websocket

ws = websocket.create_connection(
    "wss://api.example.com/ws",
    header={"Authorization": "Bearer token123"},
    timeout=10,
)
ws.send("hello")
print(ws.recv())
ws.close()
```

---

## 5. FastAPI / Starlette WebSocket Server

FastAPI wraps Starlette's WebSocket support. Integrate WebSockets alongside regular HTTP endpoints.

### Minimal FastAPI WebSocket endpoint

```python
# pip install fastapi uvicorn[standard]
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Must accept() before send/recv
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"echo: {data}")
```

```bash
# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
# Connect to:  ws://localhost:8000/ws
```

### Receive and send different data types

```python
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # receive_text     — waits for a UTF-8 text frame
            # receive_bytes    — waits for a binary frame
            # receive_json     — waits for a text frame, parses as JSON
            # receive          — returns a dict with 'type' + 'text'/'bytes'
            msg = await websocket.receive()

            if msg["type"] == "websocket.disconnect":
                break

            if "text" in msg:
                await websocket.send_text(f"text: {msg['text']}")
            elif "bytes" in msg:
                await websocket.send_bytes(msg["bytes"])

    except WebSocketDisconnect as e:
        print(f"client disconnected: code={e.code}")
```

### Path and query parameters

```python
from fastapi import FastAPI, WebSocket, Query
from typing import Annotated

app = FastAPI()

@app.websocket("/ws/{room_id}")
async def chat(
    websocket: WebSocket,
    room_id: str,
    # Query parameter: ws://host/ws/lobby?token=abc
    token: Annotated[str | None, Query()] = None,
):
    await websocket.accept()
    print(f"room={room_id}  token={token}")
    await websocket.send_text(f"joined room {room_id}")
    async for message in websocket.iter_text():
        await websocket.send_text(f"[{room_id}] {message}")
```

### Dependency injection for authentication

```python
from fastapi import FastAPI, WebSocket, Depends, HTTPException, status

app = FastAPI()

async def get_token(websocket: WebSocket, token: str | None = None) -> str:
    if token is None or token != "secret":
        # Reject during handshake by closing with 1008 (policy violation)
        await websocket.close(code=1008)
        raise HTTPException(status_code=403, detail="forbidden")
    return token

@app.websocket("/ws")
async def protected(websocket: WebSocket, token: str = Depends(get_token)):
    await websocket.accept()
    await websocket.send_text(f"authenticated as {token}")
    async for msg in websocket.iter_text():
        await websocket.send_text(msg)
```

### Connection manager (broadcast to all)

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Any

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.active.remove(ws)

    async def send(self, message: str, ws: WebSocket) -> None:
        await ws.send_text(message)

    async def broadcast(self, message: str) -> None:
        for ws in list(self.active):
            try:
                await ws.send_text(message)
            except Exception:
                self.disconnect(ws)


manager = ConnectionManager()


@app.websocket("/ws/{client_id}")
async def chat(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    await manager.broadcast(f"{client_id} joined")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"{client_id} left")
```

---

## 6. aiohttp WebSocket Server & Client

`aiohttp` provides WebSocket support integrated with its HTTP server.

```bash
pip install aiohttp
```

### aiohttp WebSocket server

```python
from aiohttp import web

async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == web.WSMsgType.TEXT:
            if msg.data == "close":
                await ws.close()
            else:
                await ws.send_str(f"echo: {msg.data}")
        elif msg.type == web.WSMsgType.BINARY:
            await ws.send_bytes(msg.data)
        elif msg.type == web.WSMsgType.ERROR:
            print(f"error: {ws.exception()}")

    return ws

app = web.Application()
app.router.add_get("/ws", ws_handler)
web.run_app(app, port=8080)
```

### aiohttp WebSocket client

```python
import asyncio
import aiohttp

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect("ws://localhost:8080/ws") as ws:
            await ws.send_str("hello")

            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    print(f"received: {msg.data}")
                    break
                elif msg.type in (aiohttp.WSMsgType.ERROR, aiohttp.WSMsgType.CLOSED):
                    break

asyncio.run(main())
```

---

## 7. Broadcasting & Rooms

### Room-based broadcast with `websockets`

```python
import asyncio
import websockets
from collections import defaultdict

# rooms maps room_name → set of connected websockets
rooms: dict[str, set] = defaultdict(set)

async def handler(websocket, path):
    # Expect first message to be the room name
    room = await websocket.recv()
    rooms[room].add(websocket)
    print(f"[+] {websocket.remote_address} joined room '{room}'")

    try:
        async for message in websocket:
            # Broadcast to all OTHER members of the same room
            peers = rooms[room] - {websocket}
            if peers:
                await asyncio.gather(
                    *[peer.send(f"[{room}] {message}") for peer in peers],
                    return_exceptions=True,
                )
    finally:
        rooms[room].discard(websocket)
        if not rooms[room]:
            del rooms[room]

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
```

### Pub/sub with asyncio.Queue

```python
import asyncio
import websockets
from collections import defaultdict

# topic → list of subscriber queues
subscriptions: dict[str, list[asyncio.Queue]] = defaultdict(list)

async def handler(websocket):
    # Expect:  SUBSCRIBE <topic>  or  PUBLISH <topic> <message>
    async for raw in websocket:
        parts = raw.split(" ", 2)
        cmd = parts[0].upper()

        if cmd == "SUBSCRIBE" and len(parts) == 2:
            topic = parts[1]
            queue: asyncio.Queue = asyncio.Queue()
            subscriptions[topic].append(queue)
            try:
                # Forward every published message to this subscriber
                while True:
                    msg = await queue.get()
                    await websocket.send(msg)
            finally:
                subscriptions[topic].remove(queue)

        elif cmd == "PUBLISH" and len(parts) == 3:
            topic, message = parts[1], parts[2]
            for q in subscriptions[topic]:
                await q.put(message)
```

---

## 8. Ping / Pong & Heartbeat

### Built-in keepalive (websockets library)

```python
# websockets sends ping frames automatically and closes the connection
# if no pong is received within ping_timeout seconds.

async with websockets.serve(
    handler,
    "localhost", 8765,
    ping_interval=20,    # send ping every 20s
    ping_timeout=10,     # close if pong not received within 10s
):
    await asyncio.Future()
```

### Manual ping/pong

```python
import asyncio
import websockets

async def handler(websocket):
    async for message in websocket:
        await websocket.send(message)

async def keepalive(websocket):
    """Send a ping every 15 seconds; close if no pong within 5 seconds."""
    while True:
        await asyncio.sleep(15)
        try:
            pong_waiter = await websocket.ping()
            # wait_for raises TimeoutError if pong not received in time
            await asyncio.wait_for(pong_waiter, timeout=5)
        except (asyncio.TimeoutError, websockets.ConnectionClosed):
            await websocket.close()
            break

async def handler_with_keepalive(websocket):
    keepalive_task = asyncio.create_task(keepalive(websocket))
    try:
        await handler(websocket)
    finally:
        keepalive_task.cancel()
```

### Application-level heartbeat (JSON ping/pong)

```python
# Some clients/proxies strip WebSocket ping frames.
# An application-level heartbeat works at every layer.

import asyncio
import json
import websockets

async def handler(websocket):
    async for raw in websocket:
        msg = json.loads(raw)
        if msg.get("type") == "ping":
            # Reply immediately with a pong
            await websocket.send(json.dumps({"type": "pong"}))
        else:
            # Normal message handling
            await websocket.send(raw)
```

---

## 9. Authentication & Headers

### Token in query string (common for browser clients)

```python
import asyncio
import websockets
from urllib.parse import urlparse, parse_qs

VALID_TOKENS = {"secret-token-abc"}

async def handler(websocket):
    # websocket.path is the full path including query string
    parsed  = urlparse(websocket.path)
    params  = parse_qs(parsed.query)
    token   = params.get("token", [None])[0]

    if token not in VALID_TOKENS:
        # 1008 = Policy Violation — reject before accepting
        await websocket.close(1008, "invalid token")
        return

    await websocket.send("authenticated")
    async for msg in websocket:
        await websocket.send(msg)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
# Connect: ws://localhost:8765/?token=secret-token-abc
```

### JWT authentication (websockets library)

```python
import asyncio
import websockets
import jwt   # pip install PyJWT

SECRET = "super-secret"

async def handler(websocket):
    # Browser clients cannot set arbitrary headers on WebSocket connections,
    # so send the JWT as the very first message instead.
    raw_token = await websocket.recv()
    try:
        payload = jwt.decode(raw_token, SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError as e:
        await websocket.close(1008, str(e))
        return

    user_id = payload["sub"]
    await websocket.send(f"welcome {user_id}")

    async for msg in websocket:
        await websocket.send(f"[{user_id}] {msg}")
```

### HTTP header auth (server-to-server / native clients)

```python
import asyncio
import websockets

async def handler(websocket):
    # Access the upgrade request headers
    auth = websocket.request_headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        await websocket.close(1008, "missing token")
        return

    token = auth.removeprefix("Bearer ")
    # ... validate token ...
    await websocket.send("ok")
    async for msg in websocket:
        await websocket.send(msg)

# Client side
async def client():
    async with websockets.connect(
        "ws://localhost:8765",
        additional_headers={"Authorization": "Bearer mytoken"},
    ) as ws:
        print(await ws.recv())
```

---

## 10. Binary & Structured Data

### Sending raw bytes

```python
import asyncio
import websockets

async def handler(websocket):
    async for message in websocket:
        if isinstance(message, bytes):
            # Binary frame received
            print(f"binary: {len(message)} bytes")
            # Echo it back as binary
            await websocket.send(message)
        else:
            # Text frame
            await websocket.send(f"text: {message}")
```

### JSON messages

```python
import asyncio
import json
import websockets

async def handler(websocket):
    async for raw in websocket:
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError:
            await websocket.send(json.dumps({"error": "invalid JSON"}))
            continue

        if msg.get("action") == "echo":
            await websocket.send(json.dumps({"result": msg.get("data")}))
        elif msg.get("action") == "add":
            total = sum(msg.get("values", []))
            await websocket.send(json.dumps({"result": total}))
```

### MessagePack — compact binary serialisation

```python
# pip install msgpack
import asyncio
import msgpack
import websockets

async def handler(websocket):
    async for data in websocket:
        if isinstance(data, bytes):
            msg  = msgpack.unpackb(data, raw=False)
            reply = {"status": "ok", "echo": msg}
            await websocket.send(msgpack.packb(reply, use_bin_type=True))
```

### Protocol Buffers

```python
# pip install protobuf
# Assume you have generated message_pb2 from a .proto file

import asyncio
import websockets
import message_pb2

async def handler(websocket):
    async for data in websocket:
        if isinstance(data, bytes):
            req = message_pb2.Request()
            req.ParseFromString(data)
            print(f"received: {req.name}")

            resp = message_pb2.Response(status=200, message=f"hello {req.name}")
            await websocket.send(resp.SerializeToString())
```

### Sending a file over WebSocket

```python
import asyncio
import websockets

async def send_file(ws, path: str) -> None:
    # Read in chunks to avoid loading the whole file into memory
    chunk_size = 64 * 1024   # 64 KiB
    with open(path, "rb") as f:
        while chunk := f.read(chunk_size):
            await ws.send(chunk)
    # Signal end-of-file with an empty binary frame
    await ws.send(b"")
```

---

## 11. Reconnection & Resilience

### Exponential back-off reconnect (websockets)

```python
import asyncio
import websockets
import logging

log = logging.getLogger(__name__)

async def connect_with_retry(uri: str, handler, *, max_delay: float = 60.0):
    delay = 1.0
    while True:
        try:
            async with websockets.connect(uri) as ws:
                delay = 1.0   # reset delay on successful connection
                log.info("connected")
                await handler(ws)
        except (websockets.ConnectionClosed, OSError) as e:
            log.warning(f"disconnected: {e} — retrying in {delay:.1f}s")
            await asyncio.sleep(delay)
            delay = min(delay * 2, max_delay)

async def my_handler(ws):
    async for msg in ws:
        print(f"received: {msg}")

asyncio.run(connect_with_retry("ws://localhost:8765", my_handler))
```

### websockets built-in reconnect helper

```python
# websockets 10+ provides a reconnecting client
import asyncio
from websockets.legacy.client import connect

async def main():
    async for websocket in connect("ws://localhost:8765"):
        # This loop restarts automatically on disconnect
        try:
            async for message in websocket:
                print(message)
        except websockets.ConnectionClosedError:
            continue   # triggers reconnect

asyncio.run(main())
```

### Idempotent message handling (at-least-once delivery)

```python
import asyncio
import json
import websockets

seen_ids: set[str] = set()

async def handler(websocket):
    async for raw in websocket:
        msg = json.loads(raw)
        msg_id = msg.get("id")

        if msg_id and msg_id in seen_ids:
            # Duplicate — acknowledge but don't process again
            await websocket.send(json.dumps({"ack": msg_id, "duplicate": True}))
            continue

        if msg_id:
            seen_ids.add(msg_id)

        process(msg)
        await websocket.send(json.dumps({"ack": msg_id}))

def process(msg):
    print(f"processing: {msg}")
```

---

## 12. TLS / SSL (wss://)

### Self-signed certificate (dev / testing)

```bash
# Generate a self-signed certificate (valid 365 days)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \
    -days 365 -nodes -subj "/CN=localhost"
```

### wss:// server with websockets

```python
import asyncio
import ssl
import websockets

def make_ssl_context() -> ssl.SSLContext:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    # Load certificate chain and private key
    ctx.load_cert_chain("cert.pem", "key.pem")
    return ctx

async def handler(websocket):
    await websocket.send("secure hello")
    async for msg in websocket:
        await websocket.send(msg)

async def main():
    ssl_ctx = make_ssl_context()
    async with websockets.serve(handler, "localhost", 8765, ssl=ssl_ctx):
        await asyncio.Future()

asyncio.run(main())
```

### wss:// client

```python
import asyncio
import ssl
import websockets

async def main():
    # For a trusted CA-signed cert — default SSL context works
    async with websockets.connect("wss://example.com/ws") as ws:
        print(await ws.recv())

    # For a self-signed cert — load the CA cert manually
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.load_verify_locations("cert.pem")
    ctx.check_hostname = True

    async with websockets.connect("wss://localhost:8765", ssl=ctx) as ws:
        print(await ws.recv())

asyncio.run(main())
```

---

## 13. Compression

Per-message deflate (RFC 7692) compresses each WebSocket frame. Useful for text-heavy payloads.

### Enable compression on the server

```python
import asyncio
import websockets
from websockets.extensions import permessage_deflate

async def handler(websocket):
    async for msg in websocket:
        await websocket.send(msg)

async def main():
    async with websockets.serve(
        handler,
        "localhost", 8765,
        # Enable per-message deflate with default settings
        compression="deflate",
    ):
        await asyncio.Future()

asyncio.run(main())
```

### Fine-tune compression parameters

```python
from websockets.extensions.permessage_deflate import ServerPerMessageDeflateFactory

async with websockets.serve(
    handler,
    "localhost", 8765,
    extensions=[
        ServerPerMessageDeflateFactory(
            server_max_window_bits=12,   # smaller = less memory, less compression
            client_max_window_bits=12,
            compress_settings={"level": 6},  # zlib level 0–9
        )
    ],
):
    await asyncio.Future()
```

### Enable compression on the client

```python
async with websockets.connect(
    "ws://localhost:8765",
    compression="deflate",
) as ws:
    await ws.send("a" * 10_000)   # compresses well
    print(await ws.recv())
```

---

## 14. Error Handling

### Exception hierarchy (websockets)

```
Exception
└── websockets.WebSocketException
    ├── websockets.ConnectionClosed
    │   ├── websockets.ConnectionClosedOK    (code 1000 / 1001)
    │   └── websockets.ConnectionClosedError (all other close codes)
    └── websockets.InvalidHandshake
        ├── websockets.InvalidURI
        ├── websockets.InvalidStatus
        └── websockets.NegotiationError
```

### Comprehensive error handling pattern

```python
import asyncio
import websockets
from websockets.exceptions import (
    ConnectionClosedOK,
    ConnectionClosedError,
    InvalidStatus,
    InvalidURI,
)

async def safe_client(uri: str) -> None:
    try:
        async with websockets.connect(uri) as ws:
            async for message in ws:
                print(message)

    except InvalidURI as e:
        print(f"bad URI: {e}")
    except InvalidStatus as e:
        # Server rejected the WebSocket upgrade (e.g. 401, 404)
        print(f"server rejected handshake: {e.response.status_code}")
    except ConnectionClosedOK:
        print("server closed the connection cleanly")
    except ConnectionClosedError as e:
        print(f"connection dropped: code={e.code} reason={e.reason!r}")
    except OSError as e:
        # Network-level error (refused connection, DNS failure, etc.)
        print(f"network error: {e}")
    except asyncio.TimeoutError:
        print("timeout during handshake or operation")
```

### Close codes reference

| Code | Name | Meaning |
|------|------|---------|
| 1000 | Normal closure | Intended close |
| 1001 | Going away | Server shutting down / page navigated away |
| 1002 | Protocol error | WebSocket protocol violation |
| 1003 | Unsupported data | Received wrong data type |
| 1005 | No status | No close code was present (internal) |
| 1006 | Abnormal closure | Connection dropped (no close frame) |
| 1007 | Invalid frame | Payload data not consistent with type |
| 1008 | Policy violation | App-level rejection (e.g. bad auth) |
| 1009 | Message too big | Incoming message exceeds max size |
| 1011 | Internal error | Unexpected server-side error |
| 1012 | Service restart | Server is restarting |
| 4000–4999 | Application | Available for app-defined use |

### Sending a close frame with a code

```python
# Close with 1008 (Policy Violation) — reject misbehaving clients
await websocket.close(code=1008, reason="rate limit exceeded")

# Close normally
await websocket.close(code=1000, reason="session ended")
```

---

## 15. Testing WebSockets

### Testing with `websockets` in pytest

```python
# pip install pytest pytest-asyncio websockets
import pytest
import asyncio
import websockets

@pytest.fixture
def server():
    """Start a test server and yield its URI."""
    async def echo(ws):
        async for msg in ws:
            await ws.send(f"echo:{msg}")

    async def start():
        server = await websockets.serve(echo, "localhost", 0)  # port 0 = random free port
        host, port = server.sockets[0].getsockname()[:2]
        return server, f"ws://{host}:{port}"

    loop = asyncio.get_event_loop()
    srv, uri = loop.run_until_complete(start())
    yield uri
    srv.close()
    loop.run_until_complete(srv.wait_closed())


@pytest.mark.asyncio
async def test_echo(server):
    async with websockets.connect(server) as ws:
        await ws.send("hello")
        reply = await ws.recv()
        assert reply == "echo:hello"
```

### Testing FastAPI WebSockets with TestClient

```python
# pip install httpx
from fastapi import FastAPI, WebSocket
from fastapi.testclient import TestClient

app = FastAPI()

@app.websocket("/ws")
async def endpoint(ws: WebSocket):
    await ws.accept()
    data = await ws.receive_text()
    await ws.send_text(f"echo:{data}")
    await ws.close()


def test_websocket_echo():
    # TestClient supports WebSocket connections synchronously
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as ws:
            ws.send_text("hello")
            data = ws.receive_text()
            assert data == "echo:hello"


def test_websocket_json():
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as ws:
            ws.send_json({"msg": "hi"})
            data = ws.receive_json()
            assert data["msg"] == "hi"
```

### Mock WebSocket for unit tests

```python
from unittest.mock import AsyncMock, MagicMock

class MockWebSocket:
    """Minimal mock that satisfies async for / send / recv."""

    def __init__(self, messages: list[str]):
        self._messages = iter(messages)
        self.sent: list[str] = []
        self.closed = False
        self.remote_address = ("127.0.0.1", 9999)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._messages)
        except StopIteration:
            raise StopAsyncIteration

    async def send(self, data):
        self.sent.append(data)

    async def close(self, code=1000, reason=""):
        self.closed = True


# Usage in a unit test
import pytest

async def my_handler(ws):
    async for msg in ws:
        await ws.send(msg.upper())

@pytest.mark.asyncio
async def test_handler():
    ws = MockWebSocket(["hello", "world"])
    await my_handler(ws)
    assert ws.sent == ["HELLO", "WORLD"]
```

---

## 16. Browser JavaScript Client

These snippets show the browser (JavaScript) side of the connection.

### Basic browser client

```html
<!DOCTYPE html>
<html>
<body>
<script>
// Connect to the WebSocket server
const ws = new WebSocket("ws://localhost:8765");

ws.onopen = () => {
    console.log("connected");
    ws.send("hello from browser");
};

ws.onmessage = (event) => {
    console.log("received:", event.data);
};

ws.onerror = (error) => {
    console.error("error:", error);
};

ws.onclose = (event) => {
    console.log(`closed: code=${event.code} reason=${event.reason}`);
};

// Send a message
function sendMessage(text) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(text);
    }
}

// Close cleanly
function closeConnection() {
    ws.close(1000, "user closed");
}
</script>
</body>
</html>
```

### Reconnecting client (JavaScript)

```javascript
class ReconnectingWebSocket {
    constructor(url, options = {}) {
        this.url     = url;
        this.delay   = options.delay   ?? 1000;
        this.maxDelay = options.maxDelay ?? 30000;
        this.handlers = {};
        this._connect();
    }

    _connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen    = (e) => { this.delay = 1000; this._emit("open", e); };
        this.ws.onmessage = (e) => this._emit("message", e);
        this.ws.onerror   = (e) => this._emit("error", e);
        this.ws.onclose   = (e) => {
            this._emit("close", e);
            if (!this._closed) {
                // Exponential back-off reconnect
                console.log(`reconnecting in ${this.delay}ms`);
                setTimeout(() => this._connect(), this.delay);
                this.delay = Math.min(this.delay * 2, this.maxDelay);
            }
        };
    }

    on(event, fn) { this.handlers[event] = fn; return this; }
    _emit(event, e) { this.handlers[event]?.(e); }
    send(data)  { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(data); }
    close()     { this._closed = true; this.ws.close(); }
}

// Usage
const ws = new ReconnectingWebSocket("ws://localhost:8765");
ws.on("message", (e) => console.log(e.data));
ws.send("hello");
```

### Sending and receiving JSON (JavaScript)

```javascript
const ws = new WebSocket("ws://localhost:8765");

ws.onopen = () => {
    // Send a JSON object
    ws.send(JSON.stringify({ action: "subscribe", channel: "prices" }));
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg.channel, msg.price);
};
```

### Sending binary data (JavaScript)

```javascript
const ws = new WebSocket("ws://localhost:8765");
ws.binaryType = "arraybuffer";   // or "blob"

ws.onopen = () => {
    // Send a typed array
    const buffer = new Uint8Array([0x01, 0x02, 0x03]);
    ws.send(buffer.buffer);
};

ws.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
        const view = new Uint8Array(event.data);
        console.log("binary bytes:", view);
    }
};
```

---

## 17. Production Patterns

### Rate limiting per connection

```python
import asyncio
import time
import websockets

class RateLimiter:
    def __init__(self, rate: int, per: float):
        """Allow `rate` messages per `per` seconds."""
        self.rate      = rate
        self.per       = per
        self.allowance = float(rate)
        self.last_check = time.monotonic()

    def allowed(self) -> bool:
        now    = time.monotonic()
        elapsed = now - self.last_check
        self.last_check = now
        self.allowance += elapsed * (self.rate / self.per)
        if self.allowance > self.rate:
            self.allowance = float(self.rate)
        if self.allowance >= 1.0:
            self.allowance -= 1.0
            return True
        return False

async def handler(websocket):
    limiter = RateLimiter(rate=10, per=1.0)   # 10 messages/second
    async for message in websocket:
        if not limiter.allowed():
            await websocket.close(1008, "rate limit exceeded")
            return
        await websocket.send(f"ok: {message}")
```

### Graceful shutdown

```python
import asyncio
import signal
import websockets

connections: set[websockets.WebSocketServerProtocol] = set()

async def handler(websocket):
    connections.add(websocket)
    try:
        async for msg in websocket:
            await websocket.send(msg)
    finally:
        connections.discard(websocket)

async def shutdown(server):
    server.close()
    await server.wait_closed()
    if connections:
        # Give clients 3 seconds to disconnect cleanly
        await asyncio.wait(
            [ws.close(1001, "server shutting down") for ws in connections],
            timeout=3,
        )
    print("shutdown complete")

async def main():
    loop = asyncio.get_running_loop()
    server = await websockets.serve(handler, "localhost", 8765)

    # Register SIGTERM / SIGINT handlers
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown(server)))

    await asyncio.Future()

asyncio.run(main())
```

### Logging all frames (debug middleware)

```python
import asyncio
import logging
import websockets

log = logging.getLogger("ws")

async def logging_handler(websocket):
    remote = websocket.remote_address
    log.info(f"[+] {remote}  path={websocket.path}")
    try:
        async for message in websocket:
            size = len(message) if isinstance(message, (str, bytes)) else "?"
            kind = "text" if isinstance(message, str) else "binary"
            log.debug(f"[{remote}] recv {kind} {size}B: {message!r:.80}")
            reply = await process(message)
            log.debug(f"[{remote}] send {kind}: {reply!r:.80}")
            await websocket.send(reply)
    except websockets.ConnectionClosed as e:
        log.info(f"[-] {remote}  code={e.code}")

async def process(msg):
    return msg
```

### Behind a reverse proxy (nginx)

```nginx
# /etc/nginx/sites-available/myapp
upstream wsbackend {
    server 127.0.0.1:8765;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.crt;
    ssl_certificate_key /etc/ssl/private/example.key;

    location /ws {
        proxy_pass http://wsbackend;

        # Required headers to upgrade HTTP → WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Increase timeout for long-lived connections
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
```

### Metrics with Prometheus

```python
# pip install prometheus_client
from prometheus_client import Counter, Gauge, start_http_server
import asyncio
import websockets

CONNECTIONS = Gauge("ws_active_connections", "Active WebSocket connections")
MESSAGES_RX = Counter("ws_messages_received_total", "Messages received")
MESSAGES_TX = Counter("ws_messages_sent_total", "Messages sent")

async def handler(websocket):
    CONNECTIONS.inc()
    try:
        async for message in websocket:
            MESSAGES_RX.inc()
            await websocket.send(message)
            MESSAGES_TX.inc()
    finally:
        CONNECTIONS.dec()

async def main():
    # Expose metrics at http://localhost:9090/metrics
    start_http_server(9090)
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
```

---

## 18. Q&A — Conceptual Questions

**Q: What is the difference between WebSockets and HTTP Server-Sent Events (SSE)?**
Both allow the server to push data to clients. **SSE** is unidirectional (server → client only), uses plain HTTP, and browsers automatically reconnect. **WebSockets** are bidirectional, require a protocol upgrade, and suit interactive use cases (chat, gaming, live trading). Use SSE for read-only feeds (notifications, log streaming); use WebSockets when the client also needs to send data.

---

**Q: What is the difference between ws:// and wss://?**
`ws://` is unencrypted — data is transmitted in plaintext and can be intercepted or modified by intermediaries. `wss://` wraps the WebSocket connection in TLS (the same as HTTPS), providing encryption, authentication, and integrity. Always use `wss://` in production, especially for any data that could be sensitive or for connections over the public internet.

---

**Q: Why can't a browser WebSocket client set arbitrary HTTP headers?**
The browser's `WebSocket` API does not expose a way to set custom headers (other than cookies and `Sec-WebSocket-Protocol`). This is a security restriction of the browser sandbox. To authenticate a browser client, use one of: (1) a token in the URL query string, (2) a cookie set by a prior HTTP request, (3) a subprotocol negotiation token, or (4) send the credential as the first WebSocket message after the handshake.

---

**Q: What happens when a WebSocket connection is idle for a long time?**
Load balancers, NAT routers, and firewalls typically have idle connection timeouts (often 60–300 seconds). They will silently drop the TCP connection without sending a WebSocket close frame. To prevent this, configure the server to send WebSocket ping frames periodically (`ping_interval`). The client responds with a pong, which resets the idle timer at each network device. If no pong arrives within `ping_timeout`, the server closes the connection.

---

**Q: What is a WebSocket subprotocol?**
A subprotocol is an application-level protocol negotiated during the WebSocket handshake via the `Sec-WebSocket-Protocol` header. Both client and server list the subprotocols they support; the server picks one. It has no effect on the framing layer — it is simply a mechanism for both sides to agree on a message format (e.g., `"chat.v1"`, `"mqtt"`, `"graphql-ws"`). If the server does not support any of the client's proposed subprotocols, it may reject the connection.

---

**Q: How do WebSockets behave behind a load balancer?**
WebSocket connections are long-lived and stateful, which creates problems for standard HTTP round-robin load balancers. You need either: (1) **sticky sessions** (session affinity) — the load balancer always routes a client to the same backend server for the duration of its connection, or (2) a **shared state layer** (Redis pub/sub, message queue) so that any backend can receive and relay messages intended for a client connected to a different backend. Option 2 scales better for large deployments.

---

**Q: What is the difference between `send()` blocking and messages queuing?**
In `websockets`, `send()` writes the frame to an internal buffer and returns immediately. The actual TCP write happens in the event loop's I/O layer. If the client reads slowly or is behind a congested network, the buffer can grow unbounded. To apply back-pressure, use `websocket.wait_closed()` or monitor `websocket.transport.get_write_buffer_size()` and pause sending if it grows too large.

---

**Q: When should I use `asyncio.gather` vs `asyncio.create_task` for broadcast?**
Both run coroutines concurrently. `gather()` waits for all to complete and returns their results in a list. `create_task()` fires-and-forgets — the task runs in the background and you can await it later. For broadcasting, `gather(*[ws.send(msg) for ws in connections], return_exceptions=True)` is the cleaner pattern because it awaits all sends in one call and captures per-connection exceptions rather than letting one failure abort the whole broadcast.

---

**Q: How can I share WebSocket connections between processes (e.g., for horizontal scaling)?**
WebSocket connections are TCP sockets tied to a single process — they cannot be shared between OS processes. For horizontal scaling: each process maintains its own set of connections; a shared message broker (Redis pub/sub, RabbitMQ, Kafka) relays messages between processes. When a backend needs to push to a client connected to a different backend, it publishes to the broker; the correct backend receives it and forwards to the client.

---

**Q: What is the safe maximum message size to send over a WebSocket?**
The WebSocket protocol supports messages of any size, but practical limits apply: the `websockets` library defaults to 1 MiB (`max_size`). For large payloads (files, images), prefer chunking — send many smaller binary frames and reassemble on the receiver — or use a separate HTTP endpoint (pre-signed URL) for the transfer, using the WebSocket only for metadata and progress notifications.

---

**Q: Why does `async for message in websocket` end silently?**
The `async for` loop over a WebSocket ends when the connection is closed with a normal close code (1000/1001 — raises `ConnectionClosedOK` internally, which `async for` converts into `StopAsyncIteration`). For abnormal closes (dropped connection, protocol error), it raises `ConnectionClosedError` instead, which propagates out of the `async for` block. Wrap the loop in `try/except ConnectionClosedError` to distinguish the two cases.
