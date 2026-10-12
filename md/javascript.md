# JavaScript Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **ES2022+** (modern browsers and Node 18+) unless noted.
> Notes for older environments are marked `[ES5]` / `[ES6]` etc.

---

## Table of Contents

1. [Variables & Scoping](#1-variables--scoping)
2. [Types & Type Coercion](#2-types--type-coercion)
3. [Strings & Template Literals](#3-strings--template-literals)
4. [Numbers & Math](#4-numbers--math)
5. [Arrays](#5-arrays)
6. [Objects](#6-objects)
7. [Destructuring](#7-destructuring)
8. [Spread & Rest](#8-spread--rest)
9. [Functions](#9-functions)
10. [Closures & Scope](#10-closures--scope)
11. [Classes & OOP](#11-classes--oop)
12. [Prototypes & Inheritance](#12-prototypes--inheritance)
13. [Iterators & Generators](#13-iterators--generators)
14. [Promises](#14-promises)
15. [async / await](#15-async--await)
16. [Modules — ES Modules & CommonJS](#16-modules--es-modules--commonjs)
17. [Error Handling](#17-error-handling)
18. [DOM Manipulation](#18-dom-manipulation)
19. [Events](#19-events)
20. [Fetch API & HTTP](#20-fetch-api--http)
21. [Storage — localStorage / sessionStorage / Cookies](#21-storage--localstorage--sessionstorage--cookies)
22. [Timers & Scheduling](#22-timers--scheduling)
23. [Regular Expressions](#23-regular-expressions)
24. [Symbols, Map, Set, WeakMap, WeakSet](#24-symbols-map-set-weakmap-weakset)
25. [Proxy & Reflect](#25-proxy--reflect)
26. [Useful Patterns & Idioms](#26-useful-patterns--idioms)
27. [Q&A — Conceptual Questions](#27-qa--conceptual-questions)

---

## 1. Variables & Scoping

### `var` vs `let` vs `const`

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Re-declare | Yes | No | No |
| Re-assign | Yes | Yes | No |
| Global property | Yes | No | No |

```javascript
// var — function-scoped, hoisted to undefined, leaks out of blocks
function example() {
    if (true) {
        var x = 1;   // visible outside the if block
    }
    console.log(x);  // 1  — not a ReferenceError
}

// let — block-scoped, temporal dead zone before declaration
{
    // console.log(y);   // ReferenceError: Cannot access 'y' before initialization
    let y = 2;
    console.log(y);      // 2
}
// console.log(y);       // ReferenceError: y is not defined

// const — block-scoped, must be initialised, binding cannot be reassigned
const PI = 3.14159;
// PI = 3;               // TypeError: Assignment to constant variable

// const does NOT make objects or arrays immutable
const obj = { a: 1 };
obj.a = 2;               // OK — mutating the object
obj.b = 3;               // OK — adding a property
// obj = {};             // TypeError — reassigning the binding
```

### Hoisting

```javascript
// Function DECLARATIONS are fully hoisted — callable before their line
greet();               // "hello"  — works

function greet() {
    console.log("hello");
}

// Function EXPRESSIONS and arrow functions are NOT hoisted
// sayHi();            // TypeError: sayHi is not a function
var sayHi = function() { console.log("hi"); };

// var declarations are hoisted as undefined
console.log(a);        // undefined  (not ReferenceError)
var a = 5;
```

### Temporal Dead Zone (TDZ)

```javascript
// let and const are hoisted but not initialised — accessing them before
// their declaration throws a ReferenceError (the TDZ)
{
    // TDZ for 'name' starts here
    // console.log(name);  // ReferenceError
    let name = "Alice";   // TDZ ends here
    console.log(name);    // "Alice"
}
```

### Scope chain

```javascript
// Each function creates a new scope; inner scopes can read outer variables
const outer = "outer";

function parent() {
    const parentVar = "parent";

    function child() {
        const childVar = "child";
        // Can access all outer scopes
        console.log(outer, parentVar, childVar);
    }
    child();
    // console.log(childVar);  // ReferenceError — child's scope is not accessible
}
```

---

## 2. Types & Type Coercion

### Primitive types

```javascript
// 7 primitive types in JavaScript
typeof undefined   // "undefined"
typeof null        // "object"  — historical bug, null IS its own type
typeof true        // "boolean"
typeof 42          // "number"
typeof 42n         // "bigint"
typeof "hello"     // "string"
typeof Symbol()    // "symbol"

// Everything else is an object
typeof {}          // "object"
typeof []          // "object"
typeof function(){} // "function"
```

### Equality — `==` vs `===`

```javascript
// == performs type coercion before comparison — avoid in most cases
0  == "0"         // true
0  == false       // true
"" == false       // true
null == undefined // true
null == 0         // false  — null only equals undefined with ==

// === strict equality — no coercion, checks type AND value
0   === "0"       // false
0   === false     // false
null === undefined // false

// NaN is not equal to itself
NaN === NaN       // false
Number.isNaN(NaN) // true  — use this to check for NaN
Object.is(NaN, NaN) // true — same-value equality
```

### Type coercion rules

```javascript
// Implicit coercion in arithmetic
"5" - 2     // 3    — string converted to number
"5" + 2     // "52" — number converted to string (+ prefers concatenation)
true + 1    // 2    — true → 1
false + 1   // 1    — false → 0
null + 1    // 1    — null → 0
undefined + 1 // NaN — undefined → NaN

// Explicit conversion
Number("42")      // 42
Number("")        // 0
Number(null)      // 0
Number(undefined) // NaN
Number(true)      // 1
parseInt("10px")  // 10  — stops at first non-numeric character
parseFloat("3.14abc") // 3.14
String(42)        // "42"
Boolean(0)        // false
Boolean("")       // false
Boolean(null)     // false
Boolean(undefined) // false
Boolean(NaN)      // false
Boolean(0n)       // false
// Everything else is truthy
```

### Checking types reliably

```javascript
// Array
Array.isArray([])          // true
Array.isArray({})          // false

// null
value === null

// undefined
value === undefined
typeof value === "undefined"  // safe even if value was never declared

// Plain object (not array, not null)
function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Integer
Number.isInteger(42)      // true
Number.isInteger(42.0)    // true
Number.isInteger(42.5)    // false

// Finite
Number.isFinite(Infinity) // false
Number.isFinite(42)       // true
```

---

## 3. Strings & Template Literals

### String literals

```javascript
// Single, double, and backtick quotes
const a = 'single';
const b = "double";
const c = `template literal`;

// Multi-line with template literals
const html = `
  <div>
    <p>Hello</p>
  </div>
`.trim();

// Escapes
"\n"   // newline
"\t"   // tab
"\\"   // backslash
"\'"   // single quote
"\""   // double quote
"A" // "A" — Unicode escape
"\u{1F600}" // 😀 — ES6 Unicode code point escape
```

### Template literals

```javascript
const name  = "Alice";
const score = 95;

// Interpolation
const msg = `Hello, ${name}! Score: ${score}`;

// Expression inside ${}
const result = `${score >= 60 ? "pass" : "fail"}`;

// Nested template literals
const list = items.map(i => `<li>${i}</li>`).join("\n");
const table = `<ul>\n${list}\n</ul>`;

// Tagged template — function called with the template parts
function highlight(strings, ...values) {
    return strings.reduce((acc, str, i) =>
        acc + str + (values[i] !== undefined ? `<b>${values[i]}</b>` : ""), "");
}
const html2 = highlight`Hello ${name}, your score is ${score}`;
// "Hello <b>Alice</b>, your score is <b>95</b>"
```

### Common string methods

```javascript
const s = "  Hello, World!  ";

// Case
s.toUpperCase()           // "  HELLO, WORLD!  "
s.toLowerCase()           // "  hello, world!  "

// Trim
s.trim()                  // "Hello, World!"
s.trimStart()             // "Hello, World!  "
s.trimEnd()               // "  Hello, World!"

// Search
s.includes("World")       // true
s.startsWith("  H")       // true
s.endsWith("!  ")         // true
s.indexOf("o")            // 4  — first occurrence, -1 if not found
s.lastIndexOf("o")        // 8
s.search(/\w+/)           // index of first regex match

// Extract
s.slice(2, 7)             // "Hello"
s.slice(-8, -2)           // "World!"  — negative = from end
s.substring(2, 7)         // "Hello"   — no negative indices

// Replace
s.replace("World", "JS")  // replaces first occurrence
s.replaceAll("l", "L")    // replaces all occurrences (ES2021)
s.replace(/World/gi, "JS") // regex replace with flags

// Split
"a,b,c".split(",")        // ["a", "b", "c"]
"hello".split("")         // ["h","e","l","l","o"]
"a,b,c".split(",", 2)     // ["a", "b"]  — limit

// Pad
"5".padStart(3, "0")      // "005"
"hi".padEnd(5, ".")       // "hi..."

// Repeat
"abc".repeat(3)           // "abcabcabc"

// At (supports negative index)
"hello".at(-1)            // "o"

// Match
"2024-06-15".match(/(\d{4})-(\d{2})-(\d{2})/)
// ["2024-06-15", "2024", "06", "15", index: 0, ...]

// matchAll — returns iterator of all matches
[..."abc123def456".matchAll(/\d+/g)].map(m => m[0])  // ["123", "456"]
```

---

## 4. Numbers & Math

### Number basics

```javascript
// Integer and float are the same type (IEEE 754 double)
42
3.14
1_000_000        // underscore separator (ES2021)
0xFF             // 255 — hex
0o17             // 15  — octal
0b1010           // 10  — binary

// Special values
Infinity
-Infinity
NaN              // Not a Number — result of invalid maths

Number.MAX_SAFE_INTEGER    // 2^53 - 1 = 9007199254740991
Number.MIN_SAFE_INTEGER    // -(2^53 - 1)
Number.MAX_VALUE           // largest representable float
Number.EPSILON             // 2.220446049250313e-16 (smallest meaningful difference)

// Floating-point pitfall
0.1 + 0.2 === 0.3  // false!  (0.30000000000000004)
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true  — correct comparison
```

### BigInt — arbitrary precision integers

```javascript
// Suffix n to create a BigInt
const big = 9007199254740991n + 1n;   // beyond MAX_SAFE_INTEGER safely
typeof big    // "bigint"

// Cannot mix BigInt and Number in arithmetic
42n + 1       // TypeError
42n + BigInt(1)  // 43n  — convert first
Number(42n)   // 42
```

### `Math` object

```javascript
Math.round(4.5)    // 5
Math.ceil(4.1)     // 5
Math.floor(4.9)    // 4
Math.trunc(4.9)    // 4   — toward zero
Math.abs(-5)       // 5
Math.sqrt(16)      // 4
Math.cbrt(27)      // 3   — cube root
Math.pow(2, 10)    // 1024
Math.log(Math.E)   // 1
Math.log2(8)       // 3
Math.log10(1000)   // 3
Math.min(1, 2, 3)  // 1
Math.max(1, 2, 3)  // 3
Math.hypot(3, 4)   // 5   — √(3²+4²)

// Random number in [0, 1)
Math.random()

// Random integer in [min, max] inclusive
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Math.PI          // 3.141592653589793
Math.E           // 2.718281828459045

// Clamp a value between min and max
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
```

### Number formatting

```javascript
const n = 1234567.89;

// toFixed — decimal places (returns string)
n.toFixed(2)           // "1234567.89"

// toPrecision — significant digits
n.toPrecision(4)       // "1.235e+6"

// Intl.NumberFormat — locale-aware
new Intl.NumberFormat("en-US").format(n)           // "1,234,567.89"
new Intl.NumberFormat("de-DE").format(n)           // "1.234.567,89"
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
// "$1,234,567.89"
```

---

## 5. Arrays

### Creating arrays

```javascript
const arr  = [1, 2, 3];
const from = Array.from("abc");          // ["a","b","c"]
const fill = Array.from({ length: 5 }, (_, i) => i * 2);  // [0,2,4,6,8]
const empty = new Array(3).fill(0);      // [0,0,0]

// Array.of — unlike new Array(), treats single number as an element
Array.of(3)    // [3]
new Array(3)   // [ , , ]  — 3 empty slots (sparse array)
```

### Accessing & slicing

```javascript
const a = [10, 20, 30, 40, 50];

a[0]           // 10
a.at(-1)       // 50  — last element  (ES2022)
a.at(-2)       // 40

// slice(start, end) — returns shallow copy, end is exclusive
a.slice(1, 3)  // [20, 30]
a.slice(-2)    // [40, 50]
a.slice()      // shallow copy of entire array
```

### Mutating methods

```javascript
const a = [1, 2, 3];

// Add / remove
a.push(4)           // add to end     → returns new length
a.pop()             // remove from end → returns removed item
a.unshift(0)        // add to start   → returns new length
a.shift()           // remove from start → returns removed item
a.splice(1, 2)      // remove 2 items at index 1, returns them
a.splice(1, 0, 99)  // insert 99 at index 1 (remove 0 items)

// Sort — mutates in place, default is lexicographic (string order)
a.sort()                         // lexicographic: [1,10,2] → [1,10,2]
a.sort((x, y) => x - y)         // numeric ascending
a.sort((x, y) => y - x)         // numeric descending
a.sort((x, y) => x.name.localeCompare(y.name))  // alphabetic by name

// Reverse — mutates in place
a.reverse()

// Fill
[1,2,3,4].fill(0, 1, 3)  // [1,0,0,4]
```

### Non-mutating methods

```javascript
const nums = [1, 2, 3, 4, 5];

// Transform
nums.map(x => x * 2)                  // [2,4,6,8,10]
nums.filter(x => x % 2 === 0)         // [2,4]
nums.reduce((acc, x) => acc + x, 0)   // 15  (sum)
nums.reduceRight((acc, x) => acc + x, 0)  // 15  (right to left)
nums.flatMap(x => [x, x * 2])         // [1,2,2,4,3,6,4,8,5,10]

// Search
nums.find(x => x > 3)                 // 4  — first match
nums.findIndex(x => x > 3)            // 3  — index of first match
nums.findLast(x => x < 4)             // 3  — last match (ES2023)
nums.findLastIndex(x => x < 4)        // 2
nums.indexOf(3)                       // 2  — strict equality
nums.lastIndexOf(3)                   // 2
nums.includes(3)                      // true

// Test
nums.every(x => x > 0)               // true  — all pass
nums.some(x => x > 4)                // true  — at least one passes

// Combine
nums.concat([6, 7])                   // [1,2,3,4,5,6,7]
[1,[2,[3]]].flat()                    // [1,2,[3]]  — one level
[1,[2,[3]]].flat(Infinity)            // [1,2,3]    — fully flatten

// Join
nums.join(" - ")                      // "1 - 2 - 3 - 4 - 5"

// Copy with modification (non-mutating, ES2023)
nums.toSorted((a, b) => b - a)        // [5,4,3,2,1]  — nums unchanged
nums.toReversed()                     // [5,4,3,2,1]  — nums unchanged
nums.with(2, 99)                      // [1,2,99,4,5] — replace at index
```

### Iteration

```javascript
const arr = ["a", "b", "c"];

// forEach — no return value
arr.forEach((item, index) => console.log(index, item));

// for...of — value only
for (const item of arr) console.log(item);

// for...of with index using entries()
for (const [i, item] of arr.entries()) console.log(i, item);

// keys() and values()
[...arr.keys()]    // [0, 1, 2]
[...arr.values()]  // ["a", "b", "c"]
```

---

## 6. Objects

### Creating objects

```javascript
// Object literal
const person = { name: "Alice", age: 30 };

// Computed property names
const key = "score";
const obj = { [key]: 100, [`${key}_max`]: 200 };   // {score:100, score_max:200}

// Shorthand property names
const x = 1, y = 2;
const point = { x, y };    // same as { x: x, y: y }

// Shorthand methods
const calc = {
    add(a, b) { return a + b; },       // shorthand
    sub: function(a, b) { return a - b; },
};
```

### Reading & writing

```javascript
const obj = { name: "Alice", address: { city: "NYC" } };

// Dot notation
obj.name           // "Alice"
obj.address.city   // "NYC"

// Bracket notation — required for dynamic keys or keys with special chars
obj["name"]
const key = "name";
obj[key]

// Optional chaining — returns undefined instead of throwing
obj?.address?.city        // "NYC"
obj?.phone?.number        // undefined  (no error)
obj?.greet?.()            // undefined  (no error if method missing)
obj?.items?.[0]           // undefined  (no error if array missing)

// Nullish coalescing — fallback only on null/undefined (not 0 or "")
obj.age ?? 0              // 0 when age is null/undefined
obj.name ?? "unknown"     // "Alice"

// Add / update
obj.email = "alice@example.com";
obj["score"] = 95;

// Delete
delete obj.age;
```

### Object methods

```javascript
const obj = { a: 1, b: 2, c: 3 };

Object.keys(obj)         // ["a", "b", "c"]
Object.values(obj)       // [1, 2, 3]
Object.entries(obj)      // [["a",1], ["b",2], ["c",3]]

// Construct from entries
Object.fromEntries([["a",1], ["b",2]])   // {a:1, b:2}
Object.fromEntries(map)                   // convert Map to plain object

// Merge (shallow) — later properties win
Object.assign({}, defaults, overrides)
const merged = { ...defaults, ...overrides }  // spread syntax (preferred)

// Freeze — prevents any changes to properties
const frozen = Object.freeze({ x: 1, y: 2 });
frozen.x = 99;     // silently ignored (or TypeError in strict mode)

// Property descriptors
Object.defineProperty(obj, "id", {
    value: 42,
    writable:     false,   // cannot be reassigned
    enumerable:   false,   // won't appear in for...in or Object.keys()
    configurable: false,   // cannot be deleted or reconfigured
});

// Check ownership
Object.hasOwn(obj, "a")     // true  — ES2022 (prefer over hasOwnProperty)
"a" in obj                  // true  — also checks prototype chain
```

### Property access patterns

```javascript
// Chained access with fallback
const city = user?.address?.city ?? "unknown";

// Dynamic key lookup
function get(obj, path) {
    return path.split(".").reduce((o, k) => o?.[k], obj);
}
get({ a: { b: { c: 42 } } }, "a.b.c")   // 42

// Object.entries for transformation
const doubled = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v * 2])
);
```

---

## 7. Destructuring

### Array destructuring

```javascript
const [a, b, c] = [1, 2, 3];

// Skip elements with commas
const [first, , third] = [1, 2, 3];   // first=1, third=3

// Rest element
const [head, ...tail] = [1, 2, 3, 4]; // head=1, tail=[2,3,4]

// Default values
const [x = 10, y = 20] = [5];         // x=5, y=20

// Swap without a temp variable
let p = 1, q = 2;
[p, q] = [q, p];                      // p=2, q=1

// From function return
function minMax(arr) {
    return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = minMax([3, 1, 4, 1, 5]);
```

### Object destructuring

```javascript
const user = { name: "Alice", age: 30, city: "NYC" };

// Basic
const { name, age } = user;

// Rename
const { name: username, age: years } = user;

// Default values
const { name: n, role = "user" } = user;   // role="user" (not in object)

// Nested destructuring
const { address: { city, zip = "00000" } } = { address: { city: "NYC" } };

// Rest properties
const { name: nm, ...rest } = user;   // rest = {age:30, city:"NYC"}

// In function parameters
function greet({ name, greeting = "Hello" }) {
    return `${greeting}, ${name}!`;
}
greet({ name: "Alice" });   // "Hello, Alice!"
```

### Mixed / nested destructuring

```javascript
const data = {
    users: [
        { id: 1, name: "Alice", scores: [95, 87, 92] },
        { id: 2, name: "Bob",   scores: [78, 84, 90] },
    ]
};

const { users: [{ name: first, scores: [top] }] } = data;
// first = "Alice", top = 95

// Destructuring in for...of
for (const { id, name } of data.users) {
    console.log(id, name);
}
```

---

## 8. Spread & Rest

### Spread operator `...`

```javascript
// Spread array into function arguments
Math.max(...[1, 2, 3])        // 3
console.log(...["a","b","c"]) // a b c

// Combine / clone arrays (shallow)
const combined = [...arr1, ...arr2, 99];
const clone    = [...original];

// Spread into object (shallow merge — right side wins)
const merged = { ...defaults, ...overrides, extra: true };

// Spread string into array of characters
[..."hello"]   // ["h","e","l","l","o"]

// Spread Set to remove duplicates
[...new Set([1, 2, 2, 3, 3])]   // [1, 2, 3]
```

### Rest parameters `...`

```javascript
// Rest collects remaining function arguments into an array
function log(level, ...messages) {
    messages.forEach(m => console.log(`[${level}] ${m}`));
}
log("INFO", "started", "connected", "ready");

// Rest in destructuring (must be last)
const [first2, second, ...remaining] = [1, 2, 3, 4, 5];
const { a: a2, ...others } = { a: 1, b: 2, c: 3 };
// others = {b:2, c:3}
```

---

## 9. Functions

### Function types

```javascript
// Function declaration — hoisted
function add(a, b) {
    return a + b;
}

// Function expression — not hoisted
const multiply = function(a, b) {
    return a * b;
};

// Named function expression — name is local to the function body (useful for recursion)
const fib = function fibonacci(n) {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

// Arrow function — concise; no own this, arguments, super, new.target
const square = x => x * x;
const greet  = (name, greeting = "Hello") => `${greeting}, ${name}!`;
const noop   = () => {};

// Multiline arrow function — needs curly braces and explicit return
const process = (items) => {
    const filtered = items.filter(x => x > 0);
    return filtered.map(x => x * 2);
};
```

### Parameters

```javascript
// Default parameter values
function createUser(name, role = "user", active = true) {
    return { name, role, active };
}

// Destructured parameter with defaults
function connect({ host = "localhost", port = 5432, ssl = false } = {}) {
    return `${ssl ? "sslmode=require" : ""} ${host}:${port}`;
}
connect({ port: 3306 });
connect();   // uses all defaults because of = {} fallback

// Rest parameters
function sum(...numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4)   // 10
```

### `this` binding

```javascript
// Arrow functions inherit 'this' from their enclosing lexical scope
class Timer {
    constructor() {
        this.count = 0;
    }
    start() {
        // Arrow function: 'this' refers to the Timer instance
        setInterval(() => {
            this.count++;           // 'this' is the Timer instance
        }, 1000);

        // Regular function: 'this' would be undefined (strict) or global
        // setInterval(function() { this.count++; }, 1000); // WRONG
    }
}

// Explicit binding
function greet(greeting) {
    return `${greeting}, ${this.name}!`;
}
const alice = { name: "Alice" };
greet.call(alice, "Hello")           // "Hello, Alice!"  — call with args
greet.apply(alice, ["Hello"])        // "Hello, Alice!"  — apply with array
const greetAlice = greet.bind(alice) // returns new function with 'this' bound
greetAlice("Hi")                     // "Hi, Alice!"
```

### IIFE — Immediately Invoked Function Expression

```javascript
// Creates a private scope — useful to avoid polluting global scope
(function() {
    const private = "not global";
    console.log(private);
})();

// Arrow IIFE
(() => {
    console.log("runs immediately");
})();

// IIFE with return value
const result = (() => {
    const x = 2, y = 3;
    return x + y;
})();
```

### Pure functions & side effects

```javascript
// Pure function — same input always returns same output; no side effects
const add2 = (a, b) => a + b;

// Impure — reads external state
let base = 10;
const addBase = (n) => n + base;   // result changes if base changes

// Impure — mutates argument
function pushItem(arr, item) {
    arr.push(item);   // mutates the original array
    return arr;
}
// Pure version
const pushItemPure = (arr, item) => [...arr, item];
```

---

## 10. Closures & Scope

### What is a closure

```javascript
// A closure is a function that retains access to its outer scope
// even after the outer function has returned.

function makeCounter(start = 0) {
    let count = start;   // 'count' is captured by the inner functions

    return {
        increment: () => ++count,
        decrement: () => --count,
        value:     () => count,
    };
}

const counter = makeCounter(10);
counter.increment();  // 11
counter.increment();  // 12
counter.value();      // 12
// 'count' is NOT accessible from outside — closure provides controlled access
```

### Practical closure uses

```javascript
// 1. Memoization
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const expensiveCalc = memoize((n) => {
    // Simulate expensive computation
    return n * n;
});

// 2. Partial application
function partial(fn, ...presetArgs) {
    return function(...laterArgs) {
        return fn(...presetArgs, ...laterArgs);
    };
}
const double = partial((x, factor) => x * factor, 2);  // wait — partial(fn, factor=2)
// actually:
const multiplyBy = (factor) => (x) => x * factor;
const double2 = multiplyBy(2);
double2(5);   // 10

// 3. Module pattern (encapsulation before ES6 classes)
const bankAccount = (() => {
    let balance = 0;

    return {
        deposit(amount)  { balance += amount; },
        withdraw(amount) { balance = Math.max(0, balance - amount); },
        getBalance()     { return balance; },
    };
})();
```

### Common closure pitfall with loops

```javascript
// WRONG — var is function-scoped; all callbacks share the same 'i'
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);  // prints 3, 3, 3
}

// CORRECT — let is block-scoped; each iteration has its own 'i'
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);  // prints 0, 1, 2
}

// CORRECT (older code) — IIFE to capture 'i' by value
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(() => console.log(j), 0);
    })(i);
}
```

---

## 11. Classes & OOP

### Class definition

```javascript
class Animal {
    // Class field — instance property defined without constructor
    kingdom = "Animalia";

    // Private field — accessible only inside the class (ES2022)
    #sound;

    constructor(name, sound) {
        this.name = name;
        this.#sound = sound;
    }

    // Instance method
    speak() {
        return `${this.name} says ${this.#sound}`;
    }

    // Getter / setter
    get label() {
        return `${this.name} (${this.kingdom})`;
    }
    set label(value) {
        [this.name] = value.split(" ");
    }

    // Static method — called on the class, not an instance
    static create(name, sound) {
        return new Animal(name, sound);
    }

    // Static field
    static count = 0;

    toString() {
        return `Animal(${this.name})`;
    }
}

const cat = Animal.create("Cat", "Meow");
cat.speak()   // "Cat says Meow"
cat.label     // "Cat (Animalia)"
```

### Private fields & methods

```javascript
class BankAccount {
    #balance;
    #transactions = [];

    constructor(initialBalance) {
        this.#balance = initialBalance;
    }

    // Private method
    #log(type, amount) {
        this.#transactions.push({ type, amount, balance: this.#balance });
    }

    deposit(amount) {
        if (amount <= 0) throw new RangeError("amount must be positive");
        this.#balance += amount;
        this.#log("deposit", amount);
    }

    get balance() { return this.#balance; }

    // Check if a value is an instance with a private field (duck-typing)
    static isAccount(obj) {
        return #balance in obj;   // 'in' operator with private field
    }
}

const acc = new BankAccount(100);
acc.deposit(50);
acc.balance          // 150
acc.#balance         // SyntaxError — not accessible outside
BankAccount.isAccount(acc)   // true
```

### Inheritance

```javascript
class Dog extends Animal {
    #breed;

    constructor(name, breed) {
        // Must call super() before using 'this'
        super(name, "Woof");
        this.#breed = breed;
    }

    // Override parent method
    speak() {
        return `${super.speak()}! (${this.#breed})`;
    }

    get info() {
        return `${this.name} — ${this.#breed}`;
    }
}

const dog = new Dog("Rex", "Labrador");
dog.speak()               // "Rex says Woof! (Labrador)"
dog instanceof Dog        // true
dog instanceof Animal     // true
```

### Mixins

```javascript
// JavaScript has no multiple inheritance — use mixins instead
const Serializable = (Base) => class extends Base {
    toJSON() {
        return JSON.stringify(this);
    }
    static fromJSON(json) {
        return Object.assign(new this(), JSON.parse(json));
    }
};

const Timestamped = (Base) => class extends Base {
    constructor(...args) {
        super(...args);
        this.createdAt = new Date().toISOString();
    }
};

class User extends Serializable(Timestamped(Animal)) {
    constructor(name) {
        super(name, "...");
    }
}

const u = new User("Alice");
u.createdAt    // ISO timestamp
u.toJSON()     // JSON string
```

---

## 12. Prototypes & Inheritance

### Prototype chain

```javascript
// Every object has an internal [[Prototype]] link (__proto__)
// Property lookup walks up the chain until null

const obj = { a: 1 };
// obj  →  Object.prototype  →  null

Object.getPrototypeOf(obj) === Object.prototype   // true

// All array instances share Array.prototype
const arr = [];
Object.getPrototypeOf(arr) === Array.prototype    // true

// Prototype chain for a class
class Foo {}
class Bar extends Foo {}
const b = new Bar();
// b → Bar.prototype → Foo.prototype → Object.prototype → null
```

### Creating objects with explicit prototypes

```javascript
// Object.create(proto) — create object with given prototype
const animal = {
    speak() { return `${this.name} speaks`; }
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.speak()   // "Rex speaks"  — inherited from animal

// Create with no prototype (pure dictionary)
const dict = Object.create(null);
dict.key = "value";
// dict has no toString, hasOwnProperty, etc.
```

### Checking the chain

```javascript
dog instanceof Animal    // true  — Animal.prototype is in dog's chain
Animal.prototype.isPrototypeOf(dog)   // true

// Own vs inherited property
Object.hasOwn(dog, "name")   // true  — own property
Object.hasOwn(dog, "speak")  // false — inherited

// for...in walks prototype chain
for (const key in dog) {
    if (Object.hasOwn(dog, key)) {
        console.log(key);  // only own enumerable properties
    }
}
```

---

## 13. Iterators & Generators

### Iterator protocol

```javascript
// An iterator is an object with a next() method returning { value, done }

function makeRange(start, end) {
    let current = start;
    return {
        next() {
            return current <= end
                ? { value: current++, done: false }
                : { value: undefined, done: true };
        },
        [Symbol.iterator]() { return this; }   // makes it iterable too
    };
}

const range = makeRange(1, 3);
range.next()   // { value: 1, done: false }
range.next()   // { value: 2, done: false }
range.next()   // { value: 3, done: false }
range.next()   // { value: undefined, done: true }

// Because it implements Symbol.iterator, we can use for...of
for (const n of makeRange(1, 5)) console.log(n);
[...makeRange(1, 5)]   // [1, 2, 3, 4, 5]
```

### Generator functions

```javascript
// function* creates a generator; yield pauses execution

function* count(start = 0, step = 1) {
    while (true) {
        yield start;
        start += step;
    }
}

const evens = count(0, 2);
evens.next().value   // 0
evens.next().value   // 2
evens.next().value   // 4

// Finite generator
function* range(start, end, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}
[...range(0, 10, 2)]   // [0, 2, 4, 6, 8]

// yield* delegates to another iterable
function* concat(...iterables) {
    for (const it of iterables) {
        yield* it;
    }
}
[...concat([1,2], [3,4], [5])]   // [1,2,3,4,5]
```

### Async generators

```javascript
// async function* produces async iterables — consume with for await...of

async function* fetchPages(baseUrl, pages) {
    for (let page = 1; page <= pages; page++) {
        const response = await fetch(`${baseUrl}?page=${page}`);
        const data     = await response.json();
        yield data.items;
    }
}

async function main() {
    for await (const items of fetchPages("/api/users", 3)) {
        console.log(items);
    }
}
```

---

## 14. Promises

### Creating promises

```javascript
// Promise wraps an asynchronous operation
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = Math.random() > 0.5;
        if (success) {
            resolve("data");    // fulfilled
        } else {
            reject(new Error("failed"));  // rejected
        }
    }, 1000);
});
```

### Chaining

```javascript
fetch("/api/user")
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();          // return a new promise
    })
    .then(user => {
        console.log(user.name);
        return fetch(`/api/posts?userId=${user.id}`);
    })
    .then(r => r.json())
    .then(posts => console.log(posts))
    .catch(err => console.error("failed:", err))   // catches ANY earlier rejection
    .finally(() => console.log("done"));           // always runs
```

### Promise combinators

```javascript
const p1 = fetch("/api/users");
const p2 = fetch("/api/posts");
const p3 = fetch("/api/tags");

// Waits for ALL to settle; rejects if ANY rejects
const [users, posts, tags] = await Promise.all([p1, p2, p3]);

// Resolves as soon as the FIRST one resolves; ignores remaining
const fastest = await Promise.race([p1, p2, p3]);

// Waits for ALL to settle; never rejects — returns array of result objects
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
    if (r.status === "fulfilled") console.log(r.value);
    else console.error(r.reason);
});

// Resolves with first FULFILLED promise; rejects if ALL reject
const first = await Promise.any([p1, p2, p3]);
```

### Promise utilities

```javascript
// Already-resolved promise
const resolved = Promise.resolve(42);

// Already-rejected promise
const rejected = Promise.reject(new Error("oops"));

// Convert callback-based API to promise
function readFilePromise(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

// Promisify utility (Node.js built-in)
const { promisify } = require("util");
const readFile = promisify(require("fs").readFile);
```

---

## 15. async / await

### Basics

```javascript
// async functions always return a Promise
async function fetchUser(id) {
    // await suspends the function until the promise settles
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const user = await response.json();
    return user;
}

// Call an async function
fetchUser(1).then(user => console.log(user));

// Top-level await (ES2022, in modules or Node 14+)
const user = await fetchUser(1);
```

### Error handling

```javascript
async function loadData() {
    try {
        const resp = await fetch("/api/data");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    } catch (err) {
        if (err instanceof TypeError) {
            console.error("network failure:", err);
        } else {
            console.error("API error:", err.message);
        }
        return null;
    } finally {
        console.log("request finished");
    }
}
```

### Sequential vs parallel

```javascript
// Sequential — waits for each before starting the next (slow: 3s total if each takes 1s)
async function sequential() {
    const a = await fetchA();   // 1s
    const b = await fetchB();   // 1s after A
    const c = await fetchC();   // 1s after B
    return [a, b, c];
}

// Parallel — all start at once (fast: 1s total)
async function parallel() {
    const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
    return [a, b, c];
}

// Start all at once, then await individually
async function parallelIndividual() {
    const pA = fetchA();   // starts immediately
    const pB = fetchB();   // starts immediately
    const a  = await pA;
    const b  = await pB;
    return [a, b];
}
```

### Async iteration

```javascript
// for await...of — iterate async iterables
async function processStream(stream) {
    for await (const chunk of stream) {
        process(chunk);
    }
}

// Async queue pattern
async function processQueue(items, worker, concurrency = 4) {
    const queue = [...items];
    const running = [];
    while (queue.length || running.length) {
        while (running.length < concurrency && queue.length) {
            const item = queue.shift();
            const p = worker(item).then(() => running.splice(running.indexOf(p), 1));
            running.push(p);
        }
        await Promise.race(running);
    }
}
```

---

## 16. Modules — ES Modules & CommonJS

### ES Modules (browser + Node 12+)

```javascript
// ---- math.js ----
// Named export
export const PI = 3.14159;
export function add(a, b) { return a + b; }

// Default export — one per file
export default class Calculator {
    add(a, b) { return a + b; }
}

// Re-export
export { add as sum } from "./utils.js";
export * from "./helpers.js";
```

```javascript
// ---- main.js ----
// Named imports
import { PI, add } from "./math.js";

// Rename on import
import { add as plus } from "./math.js";

// Default import
import Calculator from "./math.js";

// Both default and named
import Calc, { PI as pi } from "./math.js";

// Import everything as a namespace object
import * as Math2 from "./math.js";
Math2.add(1, 2);

// Dynamic import — returns a promise; load on demand
const { add: addFn } = await import("./math.js");

// Side-effect only import
import "./polyfills.js";
```

### CommonJS (Node.js)

```javascript
// ---- utils.js ----
const PI = 3.14159;

function add(a, b) { return a + b; }

// Export as properties
module.exports = { PI, add };
// or
module.exports.multiply = (a, b) => a * b;
```

```javascript
// ---- main.js ----
const { PI, add } = require("./utils");
const utils        = require("./utils");

// Destructure immediately
const { readFile, writeFile } = require("fs");
```

### Differences — ES Modules vs CommonJS

| | ES Modules | CommonJS |
|---|---|---|
| Syntax | `import` / `export` | `require` / `module.exports` |
| Loading | Static (compile-time) | Dynamic (runtime) |
| Tree-shaking | Yes | No |
| `this` at top level | `undefined` | `module.exports` |
| File extension | `.mjs` or `.js` (with `"type":"module"`) | `.cjs` or `.js` |
| Circular deps | Handled (live bindings) | Handled (partial object) |

---

## 17. Error Handling

### try / catch / finally

```javascript
try {
    const data = JSON.parse(badJson);
} catch (err) {
    if (err instanceof SyntaxError) {
        console.error("invalid JSON:", err.message);
    } else {
        throw err;   // re-throw unexpected errors
    }
} finally {
    // Runs regardless — good for cleanup
    cleanup();
}
```

### Custom error classes

```javascript
class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "AppError";
        this.code = code;
        // Restore prototype chain (needed when extending built-ins in ES5-transpiled code)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class ValidationError extends AppError {
    constructor(field, message) {
        super(`${field}: ${message}`, "VALIDATION_ERROR");
        this.name = "ValidationError";
        this.field = field;
    }
}

class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}

// Usage
try {
    throw new ValidationError("email", "invalid format");
} catch (err) {
    if (err instanceof ValidationError) {
        console.log(err.field, err.code);
    }
}
```

### Error boundary for promises

```javascript
// Unhandled promise rejections crash Node.js (since v15)
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
});

// Global error handler in browser
window.addEventListener("unhandledrejection", (event) => {
    console.error("unhandled promise rejection:", event.reason);
    event.preventDefault();   // suppress browser console error
});

// Wrapper to convert any async function's rejection into a [error, result] tuple
async function to(promise) {
    try {
        return [null, await promise];
    } catch (err) {
        return [err, null];
    }
}

const [err, user] = await to(fetchUser(1));
if (err) return handleError(err);
```

---

## 18. DOM Manipulation

### Selecting elements

```javascript
// Single element
document.getElementById("app")
document.querySelector("#app")            // CSS selector — first match
document.querySelector(".card.active")    // compound selector

// Multiple elements (static NodeList / HTMLCollection)
document.querySelectorAll(".card")        // NodeList — supports forEach
document.getElementsByClassName("card")  // live HTMLCollection
document.getElementsByTagName("div")     // live HTMLCollection

// Relative to an element
const nav = document.querySelector("nav");
nav.querySelector("a.active")
nav.querySelectorAll("li")
nav.closest(".container")   // nearest ancestor matching selector
nav.matches(".primary-nav") // true/false — does this element match?
```

### Creating & inserting elements

```javascript
// Create
const div = document.createElement("div");
div.className   = "card";
div.textContent = "Hello";               // safe — does NOT parse HTML
div.innerHTML   = "<strong>Bold</strong>"; // parsed — ONLY use with trusted content

// Set attributes
div.setAttribute("data-id", "123");
div.getAttribute("data-id")   // "123"
div.removeAttribute("data-id")
div.dataset.id    // access data-* attributes
div.dataset.userId = "42";   // sets data-user-id

// Insert
parent.appendChild(div)                    // add as last child
parent.prepend(div)                        // add as first child
sibling.before(div)                        // insert before sibling
sibling.after(div)                         // insert after sibling
parent.insertBefore(div, referenceNode)    // classic API
parent.replaceChild(newNode, oldNode)

// insertAdjacentHTML — faster than innerHTML for partial updates
element.insertAdjacentHTML("beforeend", "<li>item</li>");
// positions: "beforebegin" | "afterbegin" | "beforeend" | "afterend"

// Remove
element.remove()
parent.removeChild(element)
```

### Modifying elements

```javascript
const el = document.querySelector(".card");

// Classes
el.classList.add("active", "highlighted")
el.classList.remove("hidden")
el.classList.toggle("open")
el.classList.replace("old", "new")
el.classList.contains("active")   // true/false

// Styles
el.style.backgroundColor = "red"     // camelCase
el.style.setProperty("--my-var", "10px")   // CSS custom property
getComputedStyle(el).backgroundColor   // computed (actual) style

// Content
el.textContent = "safe text"   // no XSS risk
el.innerHTML   = "<b>bold</b>" // parsed HTML — risky with user input

// Scroll / dimensions
el.scrollIntoView({ behavior: "smooth" })
el.getBoundingClientRect()    // { top, left, bottom, right, width, height }
el.offsetWidth / el.offsetHeight    // layout dimensions
el.clientWidth / el.clientHeight    // content dimensions
```

### Traversal

```javascript
el.parentElement
el.children                    // HTMLCollection of element children
el.firstElementChild
el.lastElementChild
el.previousElementSibling
el.nextElementSibling
el.childElementCount
[...el.children]               // spread to real array for map/filter
```

---

## 19. Events

### Adding & removing listeners

```javascript
const btn = document.querySelector("button");

// addEventListener(type, handler, options)
function onClick(event) {
    console.log("clicked", event.target);
}

btn.addEventListener("click", onClick);
btn.removeEventListener("click", onClick);   // must be same reference

// Options
btn.addEventListener("click", onClick, {
    once:    true,    // auto-remove after first call
    capture: false,   // bubble phase (default); true = capture phase
    passive: true,    // hint: handler won't call preventDefault() (improves scroll perf)
});
```

### Event object

```javascript
document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault()          // prevent default browser action
    event.stopPropagation()         // stop bubbling to parent elements
    event.stopImmediatePropagation() // stop other handlers on same element too

    event.target        // element that triggered the event
    event.currentTarget // element the handler is attached to
    event.type          // "submit"
    event.timeStamp     // milliseconds since page load
});

// Mouse events
document.addEventListener("mousemove", (e) => {
    e.clientX / e.clientY    // position relative to viewport
    e.pageX   / e.pageY      // position relative to document
    e.buttons                // bitmask of pressed mouse buttons
});

// Keyboard events
document.addEventListener("keydown", (e) => {
    e.key        // "Enter", "ArrowUp", "a", etc.
    e.code       // "KeyA", "ArrowUp"  — physical key
    e.ctrlKey / e.shiftKey / e.altKey / e.metaKey  // modifier keys
    e.repeat     // true if key is held down
});
```

### Event delegation

```javascript
// Attach one listener on a parent instead of many on each child
// Works for dynamically added elements too

document.querySelector("ul").addEventListener("click", (event) => {
    // event.target is the actual clicked element
    const li = event.target.closest("li");
    if (!li) return;                        // click wasn't on an <li>
    const id = li.dataset.id;
    console.log("clicked item", id);
});
```

### Custom events

```javascript
// Create and dispatch
const event = new CustomEvent("user-logged-in", {
    detail: { userId: 42, name: "Alice" },
    bubbles: true,
    cancelable: true,
});
document.dispatchEvent(event);

// Listen
document.addEventListener("user-logged-in", (e) => {
    console.log(e.detail.name);   // "Alice"
});
```

### Common events reference

| Category | Events |
|----------|--------|
| Mouse | `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseenter`, `mouseleave`, `contextmenu` |
| Keyboard | `keydown`, `keyup`, `keypress` (deprecated) |
| Form | `submit`, `change`, `input`, `focus`, `blur`, `reset` |
| Window | `load`, `DOMContentLoaded`, `resize`, `scroll`, `beforeunload` |
| Pointer | `pointerdown`, `pointermove`, `pointerup`, `pointercancel` |
| Touch | `touchstart`, `touchmove`, `touchend` |
| Clipboard | `copy`, `cut`, `paste` |
| Drag | `dragstart`, `dragover`, `drop`, `dragend` |
| Media | `play`, `pause`, `ended`, `timeupdate` |

---

## 20. Fetch API & HTTP

### Basic GET

```javascript
// fetch() returns a Promise<Response>
const response = await fetch("/api/users");

// Always check response.ok (status 200–299)
if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
}

// Parse body
const json    = await response.json();       // parse JSON
const text    = await response.text();       // raw string
const blob    = await response.blob();       // binary blob
const buffer  = await response.arrayBuffer(); // ArrayBuffer
const form    = await response.formData();   // FormData

// Response metadata
response.status      // 200
response.statusText  // "OK"
response.headers.get("Content-Type")
response.headers.forEach((value, key) => console.log(key, value));
response.url
response.redirected
```

### POST / PUT / PATCH / DELETE

```javascript
// POST JSON
const res = await fetch("/api/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer token123",
    },
    body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
});
const created = await res.json();

// POST form data
const form = new FormData();
form.append("name", "Alice");
form.append("avatar", fileInput.files[0]);
await fetch("/api/profile", { method: "POST", body: form });
// Do NOT set Content-Type manually — browser sets it with the boundary

// DELETE
await fetch(`/api/users/${id}`, { method: "DELETE" });
```

### Request options

```javascript
const response = await fetch("/api/data", {
    method:   "GET",
    headers:  { "Accept": "application/json" },
    // Credentials — controls whether cookies are sent
    credentials: "include",    // always send cookies
    // credentials: "same-origin" (default) / "omit"
    // Cache control
    cache: "no-cache",         // "default"|"no-store"|"reload"|"force-cache"
    // Redirect behaviour
    redirect: "follow",        // "follow"|"error"|"manual"
    // Abort signal
    signal: AbortSignal.timeout(5000),   // auto-abort after 5s  (ES2022)
});
```

### AbortController — cancel a request

```javascript
const controller = new AbortController();

// Abort after 5 seconds
const timer = setTimeout(() => controller.abort(), 5000);

try {
    const res = await fetch("/api/slow", { signal: controller.signal });
    clearTimeout(timer);
    return await res.json();
} catch (err) {
    if (err.name === "AbortError") {
        console.log("request aborted");
    } else {
        throw err;
    }
}
```

### Reusable fetch wrapper

```javascript
async function api(path, options = {}) {
    const BASE = "https://api.example.com";

    const res = await fetch(`${BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw Object.assign(new Error(error.message), { status: res.status });
    }

    return res.status === 204 ? null : res.json();
}

// Usage
const user  = await api("/users/1");
const newUser = await api("/users", {
    method: "POST",
    body: JSON.stringify({ name: "Alice" }),
});
```

---

## 21. Storage — localStorage / sessionStorage / Cookies

### localStorage & sessionStorage

```javascript
// localStorage — persists across sessions until explicitly cleared
// sessionStorage — cleared when the tab is closed

// Write
localStorage.setItem("theme", "dark");
sessionStorage.setItem("token", "abc123");

// Read
const theme  = localStorage.getItem("theme");   // "dark"  or  null if absent
const token  = sessionStorage.getItem("token");

// Remove
localStorage.removeItem("theme");

// Clear everything
localStorage.clear();

// List all keys
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key, localStorage.getItem(key));
}

// Store objects — must serialise/deserialise manually
localStorage.setItem("user", JSON.stringify({ name: "Alice", age: 30 }));
const user = JSON.parse(localStorage.getItem("user"));

// Storage wrapper with type safety
const store = {
    get(key, fallback = null) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    del(key)        { localStorage.removeItem(key); },
};
```

### Cookies

```javascript
// Read cookies
document.cookie    // "name=Alice; theme=dark; ..."  (all cookies as one string)

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")?.[1];
}

// Set a cookie
function setCookie(name, value, options = {}) {
    const {
        days    = 7,
        path    = "/",
        secure  = location.protocol === "https:",
        sameSite = "Strict",
    } = options;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
        `${name}=${encodeURIComponent(value)}; expires=${expires}; ` +
        `path=${path}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

// Delete a cookie — set expiry to the past
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

setCookie("session", "abc123", { days: 1, secure: true });
getCookie("session")   // "abc123"
```

---

## 22. Timers & Scheduling

### `setTimeout` and `setInterval`

```javascript
// One-shot delay
const timerId = setTimeout(() => console.log("later"), 1000);

// Cancel before it fires
clearTimeout(timerId);

// Repeat every N ms
const intervalId = setInterval(() => console.log("tick"), 500);

// Stop repeating
clearInterval(intervalId);

// Self-cancelling interval
let count = 0;
const id = setInterval(() => {
    count++;
    if (count >= 5) clearInterval(id);
}, 200);
```

### `requestAnimationFrame`

```javascript
// Best for animations — syncs with the browser's paint cycle (~60fps)
function animate(timestamp) {
    // timestamp is the DOMHighResTimeStamp provided by the browser
    element.style.transform = `translateX(${timestamp * 0.05 % 300}px)`;
    requestAnimationFrame(animate);
}

const rafId = requestAnimationFrame(animate);

// Cancel
cancelAnimationFrame(rafId);
```

### `queueMicrotask` and `scheduler`

```javascript
// Microtask — runs before the next macrotask but after the current synchronous code
queueMicrotask(() => console.log("microtask"));

// Equivalent priority order:
// 1. Synchronous code
// 2. Microtasks (Promise callbacks, queueMicrotask)
// 3. Macrotasks (setTimeout, setInterval, I/O)
// 4. requestAnimationFrame (before paint)

console.log("1");
setTimeout(() => console.log("3"), 0);
queueMicrotask(() => console.log("2"));
// prints: 1, 2, 3
```

### Debounce and throttle

```javascript
// Debounce — wait until calls stop for `delay` ms, then fire once
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Throttle — fire at most once per `limit` ms
function throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

// Use debounce for search input — only query after user stops typing
searchInput.addEventListener("input", debounce(search, 300));

// Use throttle for scroll/resize — limit handler frequency
window.addEventListener("scroll", throttle(handleScroll, 100));
```

---

## 23. Regular Expressions

### Creating regex

```javascript
// Literal — preferred when pattern is static
const re1 = /\d{4}-\d{2}-\d{2}/;

// Constructor — needed when pattern is dynamic
const field = "date";
const re2   = new RegExp(`${field}:\\s*(\\S+)`, "i");
```

### Flags

| Flag | Meaning |
|------|---------|
| `g` | Global — find all matches (not just first) |
| `i` | Case-insensitive |
| `m` | Multiline — `^`/`$` match line boundaries |
| `s` | Dotall — `.` matches newlines |
| `u` | Unicode — enables full Unicode mode |
| `d` | Indices — captures include start/end indices |

### Methods

```javascript
const re = /(\d{4})-(\d{2})-(\d{2})/;
const s  = "Today is 2024-06-15 and tomorrow 2024-06-16";

// test — returns boolean
re.test(s)                 // true

// exec — returns match array or null (stateful with /g)
re.exec(s)
// ["2024-06-15", "2024", "06", "15", index: 9, ...]

// String.match — first match (no /g) or all matches (/g, no groups)
s.match(re)                // ["2024-06-15", "2024", "06", "15", ...]
s.match(/\d{4}-\d{2}-\d{2}/g)  // ["2024-06-15", "2024-06-16"]

// String.matchAll — all matches with groups (requires /g)
[...s.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)]
    .map(m => ({ year: m[1], month: m[2], day: m[3] }))

// String.replace / replaceAll
s.replace(re, "DATE")                  // replace first
s.replace(/\d{4}/g, "YYYY")           // replace all
s.replace(re, "$3/$2/$1")             // back-references: DD/MM/YYYY
s.replace(re, (_, y, m, d) => `${d}/${m}/${y}`)  // function replacer

// String.split
"a1b2c3".split(/\d/)   // ["a", "b", "c", ""]
```

### Patterns reference

```javascript
// Anchors
/^start/     // matches at start of string (or line with /m)
/end$/       // matches at end of string (or line with /m)
/\bword\b/   // word boundary

// Quantifiers
/a?/         // 0 or 1
/a*/         // 0 or more
/a+/         // 1 or more
/a{3}/       // exactly 3
/a{2,4}/     // 2 to 4
/a{2,}/      // 2 or more
/a+?/        // lazy (non-greedy) — match as few as possible

// Character classes
/[abc]/      // a, b, or c
/[^abc]/     // NOT a, b, or c
/[a-z]/      // a through z
/./          // any character except newline
/\d/         // digit [0-9]
/\D/         // non-digit
/\w/         // word char [a-zA-Z0-9_]
/\W/         // non-word char
/\s/         // whitespace
/\S/         // non-whitespace

// Groups
/(abc)/      // capturing group — back-ref as $1 or \1
/(?:abc)/    // non-capturing group
/(?<name>abc)/ // named capturing group — back-ref as $<name>

// Lookahead / lookbehind
/foo(?=bar)/ // positive lookahead — "foo" only if followed by "bar"
/foo(?!bar)/ // negative lookahead
/(?<=@)\w+/  // positive lookbehind — word after "@"
/(?<!@)\w+/  // negative lookbehind
```

---

## 24. Symbols, Map, Set, WeakMap, WeakSet

### Symbol

```javascript
// Symbol — unique, immutable primitive; never equal to any other value
const id1 = Symbol("id");
const id2 = Symbol("id");
id1 === id2   // false — always unique

// Use as unique object keys (not enumerable in for...in)
const sym = Symbol("private");
const obj = { [sym]: "secret", name: "Alice" };
obj[sym]          // "secret"
Object.keys(obj)  // ["name"]  — Symbol keys not included

// Well-known Symbols — override built-in behaviours
class Range {
    constructor(start, end) { this.start = start; this.end = end; }
    [Symbol.iterator]() {
        let current = this.start;
        const end   = this.end;
        return { next: () => current <= end
            ? { value: current++, done: false }
            : { value: undefined, done: true }
        };
    }
}
[...new Range(1, 5)]   // [1,2,3,4,5]

// Global symbol registry
const s = Symbol.for("shared");   // create or retrieve
Symbol.for("shared") === s        // true
Symbol.keyFor(s)                  // "shared"
```

### Map — key/value store with any key type

```javascript
const map = new Map();

// Set / get / has / delete
map.set("name", "Alice");
map.set({ id: 1 }, "object key");
map.set(42, "number key");

map.get("name")    // "Alice"
map.has("name")    // true
map.delete("name")
map.size           // number of entries
map.clear()

// Initialise from entries
const m = new Map([["a", 1], ["b", 2], ["c", 3]]);

// Iteration — insertion order is preserved
for (const [key, value] of m) console.log(key, value);
[...m.keys()]     // ["a", "b", "c"]
[...m.values()]   // [1, 2, 3]
[...m.entries()]  // [["a",1], ["b",2], ["c",3]]

// Convert to/from plain object
const obj = Object.fromEntries(m);
const m2  = new Map(Object.entries(obj));
```

### Set — unique value collection

```javascript
const set = new Set([1, 2, 2, 3, 3]);
// {1, 2, 3}  — duplicates removed

set.add(4)
set.has(2)    // true
set.delete(2)
set.size      // 3
set.clear()

// Iteration
for (const v of set) console.log(v);
[...set]      // array conversion

// Set operations
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

const union        = new Set([...a, ...b]);           // {1,2,3,4,5,6}
const intersection = new Set([...a].filter(x => b.has(x)));  // {3,4}
const difference   = new Set([...a].filter(x => !b.has(x))); // {1,2}

// Deduplicate an array
const unique = [...new Set([1, 2, 2, 3, 3])];   // [1,2,3]
```

### WeakMap & WeakSet

```javascript
// WeakMap — keys must be objects; does not prevent garbage collection
const cache = new WeakMap();

function process(obj) {
    if (cache.has(obj)) return cache.get(obj);
    const result = expensiveCalc(obj);
    cache.set(obj, result);    // when obj is garbage collected, entry is removed
    return result;
}

// WeakSet — stores objects weakly; useful for tagging
const processed = new WeakSet();

function handle(item) {
    if (processed.has(item)) return;
    doWork(item);
    processed.add(item);   // entry removed when item is GC'd
}

// Note: WeakMap and WeakSet are not iterable and have no .size
```

---

## 25. Proxy & Reflect

### Proxy — intercept object operations

```javascript
// new Proxy(target, handler)
// handler defines traps for operations like get, set, delete, has...

const handler = {
    // Intercept property reads
    get(target, prop, receiver) {
        console.log(`getting ${prop}`);
        return Reflect.get(target, prop, receiver);  // default behaviour
    },

    // Intercept property writes
    set(target, prop, value, receiver) {
        if (typeof value !== "number") {
            throw new TypeError(`${prop} must be a number`);
        }
        return Reflect.set(target, prop, value, receiver);
    },

    // Intercept 'in' operator
    has(target, prop) {
        return prop in target;
    },

    // Intercept delete
    deleteProperty(target, prop) {
        if (prop.startsWith("_")) throw new Error("cannot delete private props");
        return Reflect.deleteProperty(target, prop);
    },
};

const obj = new Proxy({ x: 1, y: 2 }, handler);
obj.x         // logs "getting x" → 1
obj.z = "hi"  // TypeError: z must be a number
obj.z = 3     // OK
```

### Practical Proxy patterns

```javascript
// 1. Validation proxy
function createValidator(target, rules) {
    return new Proxy(target, {
        set(obj, prop, value) {
            if (rules[prop] && !rules[prop](value)) {
                throw new RangeError(`invalid value for ${prop}: ${value}`);
            }
            return Reflect.set(obj, prop, value);
        },
    });
}

const person = createValidator({}, {
    age:  v => Number.isInteger(v) && v >= 0 && v <= 150,
    name: v => typeof v === "string" && v.trim().length > 0,
});

// 2. Observable / reactive proxy
function reactive(obj, onChange) {
    return new Proxy(obj, {
        set(target, prop, value) {
            const old = target[prop];
            const result = Reflect.set(target, prop, value);
            if (old !== value) onChange(prop, value, old);
            return result;
        },
    });
}

const state = reactive({ count: 0 }, (prop, val, old) =>
    console.log(`${prop}: ${old} → ${val}`)
);
state.count++;   // logs: "count: 0 → 1"

// 3. Default values proxy
const withDefaults = new Proxy({}, {
    get: (target, key) => key in target ? target[key] : `default:${key}`,
});
withDefaults.foo   // "default:foo"
```

### `Reflect`

```javascript
// Reflect provides static methods matching every Proxy trap.
// Always use Reflect inside traps to preserve correct semantics.

Reflect.get(target, prop)             // target[prop]
Reflect.set(target, prop, value)      // target[prop] = value; returns boolean
Reflect.has(target, prop)             // prop in target
Reflect.deleteProperty(target, prop)  // delete target[prop]
Reflect.ownKeys(target)               // all own keys (string + Symbol)
Reflect.apply(fn, thisArg, args)      // fn.apply(thisArg, args)
Reflect.construct(Cls, args)          // new Cls(...args)
Reflect.defineProperty(target, prop, descriptor)
Reflect.getPrototypeOf(target)
Reflect.setPrototypeOf(target, proto)
```

---

## 26. Useful Patterns & Idioms

### Short-circuit defaults

```javascript
// Nullish coalescing (??) — only falls back on null/undefined
const port    = config.port    ?? 3000;      // 0 is kept, not replaced
const timeout = config.timeout ?? 5000;

// Logical OR (||) — falls back on ANY falsy value (0, "", false, NaN)
const name    = inputName || "anonymous";    // 0 and "" are replaced

// Optional chaining with nullish coalescing
const city = user?.address?.city ?? "unknown";
```

### Array and object tricks

```javascript
// Remove falsy values
[0, 1, "", "a", null, undefined, false, true].filter(Boolean)  // [1,"a",true]

// Unique values
[...new Set([1, 2, 2, 3])]   // [1,2,3]

// Group by (ES2024)
Object.groupBy(users, u => u.role)
// { admin: [...], user: [...] }

// Flat array of nested arrays
[[1,2],[3,4],[5]].flat()      // [1,2,3,4,5]

// Object from two arrays
const keys   = ["a","b","c"];
const values = [1, 2, 3];
Object.fromEntries(keys.map((k, i) => [k, values[i]]))  // {a:1,b:2,c:3}

// Pick properties from object
const pick = (obj, keys) =>
    Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]));

// Omit properties from object
const omit = (obj, keys) =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
```

### Deep clone

```javascript
// structuredClone — native deep clone (Node 17+, modern browsers)
const copy = structuredClone(original);

// Handles: objects, arrays, Date, RegExp, Map, Set, TypedArray, Blob
// Does NOT handle: functions, DOM nodes, class instances (loses methods)
```

### Pipe / compose

```javascript
// Pipe — left-to-right function composition
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(
    x => x.trim(),
    x => x.toLowerCase(),
    x => x.replace(/\s+/g, "-"),
);
transform("  Hello World  ")   // "hello-world"

// Compose — right-to-left
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
```

### Curry

```javascript
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3)    // 6
add3(1, 2)(3)    // 6
add3(1)(2, 3)    // 6
```

### Event emitter (Node.js pattern)

```javascript
class EventEmitter {
    #listeners = new Map();

    on(event, fn) {
        if (!this.#listeners.has(event)) this.#listeners.set(event, []);
        this.#listeners.get(event).push(fn);
        return this;
    }

    off(event, fn) {
        const fns = this.#listeners.get(event);
        if (fns) this.#listeners.set(event, fns.filter(f => f !== fn));
        return this;
    }

    once(event, fn) {
        const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
        return this.on(event, wrapper);
    }

    emit(event, ...args) {
        this.#listeners.get(event)?.forEach(fn => fn(...args));
        return this;
    }
}
```

### Singleton pattern

```javascript
class Config {
    static #instance = null;
    #settings = {};

    static getInstance() {
        if (!Config.#instance) Config.#instance = new Config();
        return Config.#instance;
    }

    set(key, val) { this.#settings[key] = val; return this; }
    get(key)      { return this.#settings[key]; }
}

const cfg = Config.getInstance();
cfg.set("debug", true);
Config.getInstance() === cfg   // true — same object
```

---

## 27. Q&A — Conceptual Questions

**Q: What is the difference between `null` and `undefined`?**
`undefined` means a variable has been declared but not assigned a value, or a function parameter was not passed, or an object property does not exist. `null` is an intentional absence of value — it must be explicitly assigned. `typeof null` returns `"object"` (a historical bug in JavaScript). Always use `=== null` or `=== undefined` for checks; use `?? fallback` when you want to handle both.

---

**Q: What is event bubbling and capturing?**
When an event fires on an element, it first travels down from the document root to the target element (capture phase) and then bubbles back up (bubble phase). Most event listeners are attached to the bubble phase (default). You can intercept events during the capture phase with `addEventListener(type, fn, { capture: true })`. `event.stopPropagation()` stops the event from continuing up or down the chain. Event delegation relies on bubbling — a parent catches events from its children.

---

**Q: What is the difference between `==` and `===`?**
`==` (loose equality) performs type coercion before comparing — it converts operands to the same type. `===` (strict equality) requires both type and value to be identical. Use `===` by default; it is predictable and avoids confusing coercions like `0 == ""` being `true`. The only common exception is `value == null`, which concisely checks for both `null` and `undefined`.

---

**Q: How does the JavaScript event loop work?**
JavaScript is single-threaded. The event loop continuously checks the call stack and the task queue. When the call stack is empty, it takes the next task from the macrotask queue (setTimeout, I/O, setInterval) and pushes it onto the stack. Before taking the next macrotask, it drains the entire microtask queue (Promise callbacks, `queueMicrotask`, MutationObserver). This is why Promise `.then()` handlers run before a `setTimeout(..., 0)` callback.

---

**Q: What is a closure and what is it useful for?**
A closure is a function that retains access to its surrounding lexical scope even after the outer function has finished. This lets inner functions "remember" variables from their creation context. Practical uses: data privacy (variables inaccessible from outside), factory functions, memoization, partial application, and the module pattern. Every function in JavaScript is a closure.

---

**Q: What is the difference between `let`, `const`, and `var`?**
`var` is function-scoped, hoisted (initialised to `undefined`), and redeclarable. `let` and `const` are block-scoped, hoisted but in a Temporal Dead Zone (accessing before declaration throws a ReferenceError), and cannot be redeclared. `const` additionally prevents reassignment of the binding — but does not make the value immutable (objects and arrays can still be mutated). Prefer `const` by default; use `let` when reassignment is needed; avoid `var`.

---

**Q: What is `this` and when does it change?**
`this` refers to the execution context. In a regular function called as `obj.method()`, `this` is `obj`. Called as a plain function `fn()`, `this` is `undefined` (strict mode) or the global object. Arrow functions have no own `this` — they inherit it from the surrounding lexical scope at definition time. `call`, `apply`, and `bind` explicitly set `this`. Common trap: passing an object method as a callback loses its `this` binding — wrap it in an arrow function or use `.bind()`.

---

**Q: What is the prototype chain?**
Every JavaScript object has an internal `[[Prototype]]` link to another object. When you access a property that doesn't exist on an object, the engine walks up the chain looking for it. The chain ends at `Object.prototype` (whose prototype is `null`). Classes are syntactic sugar over this system — `extends` sets up the prototype chain, and `super` calls a method one step up the chain.

---

**Q: What is the difference between a Promise and async/await?**
They are the same underlying mechanism — `async`/`await` is syntactic sugar over Promises. An `async` function always returns a Promise; `await` unwraps a Promise and pauses execution of the `async` function until the Promise settles. `async`/`await` is easier to read for sequential async logic. Promises (`.then()`, `Promise.all()`) are still needed for parallel execution, combinators, and lower-level control.

---

**Q: What is a memory leak in JavaScript and how do you prevent one?**
A memory leak occurs when objects are unintentionally kept alive by references, preventing the garbage collector from freeing them. Common causes: forgotten event listeners (`addEventListener` without a corresponding `removeEventListener`), closures that capture large objects unexpectedly, global variables, detached DOM nodes still referenced in JS, and timers/intervals never cleared. Prevention: use `removeEventListener`, clear timers with `clearTimeout`/`clearInterval`, use `WeakMap`/`WeakSet` for caches keyed by objects, and avoid unnecessary global state.

---

**Q: What is the difference between `Map` and a plain object `{}`?**
A plain object only allows string and Symbol keys; a `Map` allows any value as a key. Maps preserve insertion order reliably. Maps have a `.size` property; objects require `Object.keys(obj).length`. Maps have no prototype properties cluttering the key space (e.g., `"constructor"` is always a valid `Map` key). Maps perform better for frequent additions and deletions. Use plain objects for static configuration and JSON data; use `Map` when keys are non-strings, the size matters, or the map is frequently mutated.

---

**Q: What are WeakMap and WeakSet and why are they useful?**
Both hold **weak references** — they do not prevent their keys (WeakMap) or values (WeakSet) from being garbage collected when no other references exist. They are not iterable and have no `.size`. This makes them ideal for: private metadata storage (associate data with an object without preventing its GC), caches where entries should disappear when the key object is no longer in use, and tracking which objects have been processed without memory buildup.

---

**Q: What is the difference between `deep clone` and `shallow clone`?**
A shallow clone copies the top-level structure but nested objects are still shared references — mutating a nested object in the clone affects the original. A deep clone recursively copies all nested objects, giving full independence. Use `structuredClone()` for deep cloning built-in data structures. `{...obj}` and `Object.assign({}, obj)` are shallow. `JSON.parse(JSON.stringify(obj))` is a deep clone hack — it loses functions, `undefined`, Dates (converted to strings), and circular references cause errors.
