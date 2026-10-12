# JavaScript Cheat Sheet

A detailed, professional-grade reference for modern JavaScript (ES2015+), grouped by topic. Examples run in any current browser or Node.js unless noted otherwise.

---

## Variables & Types

### let, const, var

`let` and `const` are block-scoped (confined to the nearest `{ }`); `var` is function-scoped and hoisted in a way that causes subtle bugs, so modern code avoids it. Use `const` by default and `let` only for variables you'll reassign.

```javascript
const MAX_RETRIES = 3;        // cannot be reassigned
let attempts = 0;              // can be reassigned
attempts += 1;

{
  let scoped = 'inner';
  var leaky = 'outer';
}
// scoped is not accessible here; leaky is (var ignores the block)
```

**Note:** `const` prevents reassigning the variable itself, not mutating what it points to — `const arr = [1]; arr.push(2);` is legal.

### Primitive types and typeof

```javascript
typeof 42;          // "number"
typeof 'hi';         // "string"
typeof true;          // "boolean"
typeof undefined;      // "undefined"
typeof null;             // "object" (a long-standing JS quirk)
typeof Symbol();           // "symbol"
typeof 10n;                  // "bigint"
typeof {};                     // "object"
typeof [];                       // "object" (use Array.isArray() to detect arrays)
typeof function () {};             // "function"
```

---

## Operators

```javascript
5 + 2;      // 7
5 % 2;       // 1 (remainder)
2 ** 8;       // 256 (exponent)

5 === '5';     // false — strict equality, no type coercion (always prefer this)
5 == '5';       // true — loose equality, coerces types first (a common bug source)

true && false;    // false
true || false;     // true
!true;               // false

// Nullish coalescing: fallback only for null/undefined (unlike || which also
// treats 0, '', and false as "empty")
const port = config.port ?? 3000;

// Optional chaining: short-circuits to undefined instead of throwing
const city = user?.address?.city;
const result = someFunction?.();          // only calls if someFunction exists
const first = list?.[0];

// Logical assignment (ES2021)
config.timeout ??= 5000;      // assign only if timeout is null/undefined
user.name ||= 'Anonymous';      // assign only if name is falsy
```

---

## Control Flow

```javascript
if (score >= 90) {
  grade = 'A';
} else if (score >= 80) {
  grade = 'B';
} else {
  grade = 'F';
}

const label = isActive ? 'Active' : 'Inactive';   // ternary

switch (status) {
  case 'pending':
    handlePending();
    break;
  case 'shipped':
  case 'delivered':
    handleFulfilled();          // fall-through: same handling for both cases
    break;
  default:
    handleUnknown();
}
```

---

## Loops

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}

for (const item of ['a', 'b', 'c']) {    // values — arrays, strings, Maps, Sets
  console.log(item);
}

for (const key in { a: 1, b: 2 }) {        // enumerable keys — objects (avoid on arrays)
  console.log(key);
}

let n = 0;
while (n < 3) { n++; }

do {
  n--;
} while (n > 0);                              // body runs at least once

[1, 2, 3].forEach((value, index) => {
  console.log(index, value);
});
```

---

## Functions

```javascript
function add(a, b) {                 // function declaration — hoisted, has its own `this`
  return a + b;
}

const multiply = function (a, b) {     // function expression — not hoisted
  return a * b;
};

const square = (x) => x * x;             // arrow function — concise body, implicit return
const greet = (name) => {                  // block body needs an explicit `return`
  return `Hello, ${name}`;
};

function withDefault(a, b = 10) {            // default parameter
  return a + b;
}

function sum(...numbers) {                     // rest parameter — collects the rest into an array
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4);       // 10

const nums = [1, 2, 3];
Math.max(...nums);      // spread — expands an array into individual arguments
```

**Arrow functions don't have their own `this`** — they inherit it from the enclosing scope, which is exactly why they're preferred for callbacks inside methods (regular `function` expressions get their own `this`, which is a classic source of bugs in older code).

### Closures

A closure is a function that remembers the variables from the scope it was created in, even after that outer scope has finished running. This is the mechanism behind private state and factory functions.

```javascript
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter();     // 1
counter();      // 2 — count persisted between calls, and is inaccessible from outside
```

---

## Arrays

```javascript
const nums = [1, 2, 3, 4, 5];

nums.map((n) => n * 2);                  // [2, 4, 6, 8, 10] — new array, transformed
nums.filter((n) => n % 2 === 0);           // [2, 4] — new array, matching items only
nums.reduce((total, n) => total + n, 0);     // 15 — collapse to a single value
nums.find((n) => n > 3);                       // 4 — first matching element
nums.findIndex((n) => n > 3);                    // 3 — index of first match
nums.some((n) => n > 4);                           // true — at least one matches
nums.every((n) => n > 0);                            // true — all match
nums.includes(3);                                      // true

nums.slice(1, 3);                 // [2, 3] — non-mutating, returns a new sub-array
nums.splice(1, 2, 'a', 'b');        // mutates in place: removes 2 items at index 1, inserts 'a','b'

[...nums].sort((a, b) => a - b);      // ascending — sort() mutates, so copy first if needed
[...nums].reverse();

[1, [2, 3], [4, [5]]].flat();           // [1, 2, 3, 4, [5]] — flatten one level (Infinity for all levels)
nums.join(', ');                          // "1, 2, 3, 4, 5"

Array.from({ length: 5 }, (_, i) => i);     // [0, 1, 2, 3, 4] — build an array from scratch
Array.isArray(nums);                          // true
```

---

## Objects

```javascript
const user = { name: 'Ada', role: 'Engineer' };

const { name, role } = user;                     // destructuring
const { name: fullName } = user;                   // destructure with a rename
const { name: n2, ...rest } = user;                  // rest — everything else into `rest`

const merged = { ...user, active: true };              // spread — shallow copy plus overrides
const clone = { ...user };

Object.keys(user);       // ['name', 'role']
Object.values(user);       // ['Ada', 'Engineer']
Object.entries(user);        // [['name', 'Ada'], ['role', 'Engineer']]

Object.entries(user).forEach(([key, value]) => console.log(key, value));

Object.freeze(user);           // prevents further modification (shallow)
Object.assign({}, user, { active: true });   // pre-spread way to merge objects

// Computed and shorthand properties
const key = 'score';
const value = 95;
const result = { [key]: value, value };          // { score: 95, value: 95 }
```

---

## Strings

```javascript
const name = 'Ada';
const greeting = `Hello, ${name}! You have ${2 + 3} messages.`;   // template literal

const multiline = `line one
line two`;

'  padded  '.trim();          // "padded"
'Hello'.toUpperCase();          // "HELLO"
'Hello'.toLowerCase();            // "hello"
'Hello World'.split(' ');           // ['Hello', 'World']
'Hello'.includes('ell');              // true
'Hello'.startsWith('He');               // true
'Hello'.replace('l', 'L');                // "HeLlo" — first match only
'Hello'.replaceAll('l', 'L');               // "HeLLo" — all matches (ES2021)
'Hello'.slice(1, 3);                          // "el"
'5'.padStart(3, '0');                           // "005"
```

---

## Asynchronous JavaScript

### Promises

A `Promise` represents a value that will be available later — either resolved (success) or rejected (failure). It's the foundation `async`/`await` is built on top of.

```javascript
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

fetch('/api/users')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Request failed:', error))
  .finally(() => console.log('Done'));

Promise.all([fetchUsers(), fetchOrders()]);            // waits for all, rejects if any rejects
Promise.allSettled([fetchUsers(), fetchOrders()]);        // waits for all, never rejects — inspect each result's status
Promise.race([fetchFromPrimary(), fetchFromBackup()]);       // resolves/rejects as soon as the first one settles
```

### async/await

Syntax sugar over Promises that lets asynchronous code read like synchronous code. An `async` function always returns a Promise; `await` pauses execution until the awaited Promise settles.

```javascript
async function loadUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to load user:', error);
    throw error;
  }
}

// Run independent requests concurrently instead of one-by-one:
async function loadDashboard() {
  const [users, orders] = await Promise.all([loadUsers(), loadOrders()]);
  return { users, orders };
}
```

---

## Error Handling

```javascript
try {
  JSON.parse('{ invalid json');
} catch (error) {
  console.error('Parse failed:', error.message);
} finally {
  console.log('Always runs, error or not');
}

function withdraw(balance, amount) {
  if (amount > balance) {
    throw new Error('Insufficient funds');
  }
  return balance - amount;
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

try {
  throw new ValidationError('Email is required', 'email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`${error.field}: ${error.message}`);
  } else {
    throw error;          // re-throw anything we don't know how to handle
  }
}
```

---

## Classes & Modules

### Classes

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }

  static create(name) {           // called on the class itself: Animal.create('Rex')
    return new Animal(name);
  }
}

class Dog extends Animal {
  speak() {                            // override
    return `${this.name} barks.`;
  }

  speakAsAnimal() {
    return super.speak();               // call the parent's implementation
  }
}

const dog = new Dog('Rex');
dog.speak();          // "Rex barks."

class Counter {
  #count = 0;                 // private field (ES2022, only accessible inside the class)

  increment() {
    this.#count += 1;
    return this.#count;
  }
}
```

### Modules (ES modules)

```javascript
// math.js
export function add(a, b) { return a + b; }
export const PI = 3.14159;
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add, PI } from './math.js';
import * as math from './math.js';        // namespace import: math.add, math.PI
```

---

## The DOM (browser)

```javascript
const button = document.querySelector('#submit');          // first match
const items = document.querySelectorAll('.list-item');       // all matches (a NodeList)

button.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('Clicked!', event.target);
});

const el = document.createElement('div');
el.textContent = 'Hello';
el.classList.add('active');
el.classList.toggle('hidden');
el.classList.remove('loading');
el.setAttribute('data-id', '42');
document.body.appendChild(el);

el.style.color = 'red';
el.dataset.id;         // "42" — reads data-id via the dataset API
```

---

## Quick Task Reference

- **Declare a variable that won't be reassigned:** `const`
- **Loop over an array's values:** `for...of` or `.forEach()`
- **Transform every item in an array:** `.map()`
- **Keep only some items:** `.filter()`
- **Collapse an array to one value:** `.reduce()`
- **Copy an object/array without mutating the original:** spread (`{ ...obj }`, `[...arr]`)
- **Safely read a possibly-missing nested property:** optional chaining (`obj?.a?.b`)
- **Provide a fallback only for null/undefined:** nullish coalescing (`value ?? fallback`)
- **Run several async operations concurrently:** `Promise.all([...])`
- **Handle an async error:** `try { await ... } catch (e) { ... }`
- **Define a private class field:** `#fieldName`
