# TypeScript Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **TypeScript 5.x** unless noted.
> TypeScript is a superset of JavaScript — all JS is valid TS.
> Install: `npm install -D typescript` · Run: `npx tsc` · REPL: `npx ts-node`

---

## Table of Contents

1. [Setup & `tsconfig.json`](#1-setup--tsconfigjson)
2. [Basic Types](#2-basic-types)
3. [Type Inference](#3-type-inference)
4. [Interfaces](#4-interfaces)
5. [Type Aliases](#5-type-aliases)
6. [Literal & Template Literal Types](#6-literal--template-literal-types)
7. [Union & Intersection Types](#7-union--intersection-types)
8. [Narrowing & Type Guards](#8-narrowing--type-guards)
9. [Functions](#9-functions)
10. [Classes](#10-classes)
11. [Generics](#11-generics)
12. [Utility Types](#12-utility-types)
13. [Mapped Types](#13-mapped-types)
14. [Conditional Types](#14-conditional-types)
15. [Enums](#15-enums)
16. [Modules & Declaration Files](#16-modules--declaration-files)
17. [Decorators](#17-decorators)
18. [Advanced Patterns](#18-advanced-patterns)
19. [Common Compiler Errors & Fixes](#19-common-compiler-errors--fixes)
20. [Q&A — Conceptual Questions](#20-qa--conceptual-questions)

---

## 1. Setup & `tsconfig.json`

### Install and initialise

```bash
# Install TypeScript as a dev dependency
npm install -D typescript

# Generate a tsconfig.json
npx tsc --init

# Compile all files in the project
npx tsc

# Compile in watch mode (re-compile on save)
npx tsc --watch

# Type-check without emitting output
npx tsc --noEmit

# Run TS directly without compiling (dev only)
npm install -D ts-node
npx ts-node src/index.ts
```

### `tsconfig.json` — key options

```jsonc
{
  "compilerOptions": {
    // --- Output ---
    "target":      "ES2022",   // compiled JS version
    "module":      "NodeNext", // module system  (CommonJS | ESNext | NodeNext)
    "moduleResolution": "NodeNext",
    "outDir":      "./dist",   // compiled output directory
    "rootDir":     "./src",    // root of source files
    "sourceMap":   true,       // generate .map files for debugging

    // --- Strictness (enable all in new projects) ---
    "strict":            true,  // umbrella flag for all strict checks below
    "noImplicitAny":     true,  // error on implicit 'any' type
    "strictNullChecks":  true,  // null/undefined not assignable to other types
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true, // arr[i] has type T | undefined

    // --- Code quality ---
    "noUnusedLocals":      true,   // error on unused local variables
    "noUnusedParameters":  true,   // error on unused function parameters
    "noImplicitReturns":   true,   // all code paths must return
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true, // opt?: T means T, not T | undefined

    // --- Interop ---
    "esModuleInterop":  true,   // allows  import React from 'react'
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,  // allows  import data from './data.json'
    "declaration":     true,    // generate .d.ts files
    "lib":  ["ES2022", "DOM"]   // built-in type libraries to include
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 2. Basic Types

### Primitive types

```typescript
// Type annotations use a colon after the variable name
let name:    string  = "Alice";
let age:     number  = 30;
let active:  boolean = true;
let nothing: null    = null;
let missing: undefined = undefined;

// BigInt
let big: bigint = 9007199254740991n;

// Symbol
let sym: symbol = Symbol("id");

// any — disables type checking (avoid unless absolutely necessary)
let anything: any = 42;
anything = "now a string";  // no error

// unknown — like any but type-safe (must narrow before use)
let value: unknown = fetchSomething();
if (typeof value === "string") {
    console.log(value.toUpperCase());  // OK — narrowed to string
}

// never — a value that never exists (unreachable code, throwing functions)
function fail(msg: string): never {
    throw new Error(msg);
}

// void — function that returns no meaningful value
function log(msg: string): void {
    console.log(msg);
}
```

### Object types

```typescript
// Object type inline
let user: { name: string; age: number } = { name: "Alice", age: 30 };

// Optional property
let config: { host: string; port?: number } = { host: "localhost" };

// Readonly property
let point: { readonly x: number; readonly y: number } = { x: 1, y: 2 };
// point.x = 5;  // Error: Cannot assign to 'x' because it is read-only

// Index signature — object with arbitrary string keys
let scores: { [key: string]: number } = {};
scores["alice"] = 95;
scores["bob"]   = 87;

// Record<K, V> — cleaner equivalent of index signature
let lookup: Record<string, number> = {};
```

### Array & Tuple types

```typescript
// Array — two equivalent syntaxes
let nums:   number[] = [1, 2, 3];
let strs:   Array<string> = ["a", "b"];
let matrix: number[][] = [[1,2],[3,4]];

// Readonly array
const frozen: readonly number[] = [1, 2, 3];
const frozen2: ReadonlyArray<number> = [1, 2, 3];
// frozen.push(4);  // Error

// Tuple — fixed-length array with per-position types
let pair:  [string, number] = ["Alice", 30];
let coord: [number, number, number] = [1, 2, 3];

// Named tuple elements (improves readability)
let entry: [name: string, age: number] = ["Alice", 30];

// Optional tuple element
let opt: [string, number?] = ["Alice"];

// Rest in tuple
type StringsThenNumber = [string, ...string[], number];

// Destructuring a tuple
const [firstName, userAge] = pair;
```

---

## 3. Type Inference

TypeScript infers types automatically — you do not always need explicit annotations.

```typescript
// Inferred from initialiser
let count = 0;         // inferred: number
let label = "hello";   // inferred: string
let flags = [true];    // inferred: boolean[]

// Inferred return type
function double(n: number) {
    return n * 2;   // return type inferred as number
}

// Contextual typing — TypeScript uses the context to infer a type
const nums2 = [1, 2, 3];
nums2.forEach(n => {
    // n is inferred as number from the array element type
    console.log(n.toFixed(2));
});

// const assertion — infers the most specific type (literal type)
const direction = "north" as const;   // type: "north"  not  string
const config2 = { host: "localhost", port: 5432 } as const;
// type: { readonly host: "localhost"; readonly port: 5432 }

// Satisfies operator (TS 4.9) — validate against type without widening
const palette = {
    red:   [255, 0, 0],
    green: "#00ff00",
} satisfies Record<string, string | number[]>;
// palette.red is number[] (not string | number[]) — specific type preserved
```

---

## 4. Interfaces

Interfaces describe the shape of an object. They are open and can be merged (declaration merging).

### Defining interfaces

```typescript
interface User {
    readonly id:   number;
    name:          string;
    email:         string;
    age?:          number;          // optional
    greet():       string;          // method signature
    toString():    string;
}

// Implement an interface with a class
class AdminUser implements User {
    readonly id: number;
    name:   string;
    email:  string;

    constructor(id: number, name: string, email: string) {
        this.id    = id;
        this.name  = name;
        this.email = email;
    }

    greet()    { return `Hi, I'm ${this.name}`; }
    toString() { return `User(${this.id})`; }
}
```

### Extending interfaces

```typescript
interface Shape {
    color: string;
}

interface Dimensions {
    width:  number;
    height: number;
}

// Extend multiple interfaces
interface Rectangle extends Shape, Dimensions {
    area(): number;
}

const rect: Rectangle = {
    color: "red",
    width: 10,
    height: 5,
    area() { return this.width * this.height; },
};
```

### Declaration merging

```typescript
// Interfaces with the same name are automatically merged
interface Window {
    myPlugin: { version: string };
}

// Now TypeScript knows about window.myPlugin
window.myPlugin.version;   // no error
```

### Interface vs Type Alias

| Feature | `interface` | `type` |
|---------|-------------|--------|
| Declaration merging | Yes | No |
| Extends | `extends` | `&` intersection |
| Primitive aliases | No | Yes |
| Union types | No | Yes |
| Computed properties | Limited | Yes |
| Best for | Object shapes, class contracts | Complex types, unions, aliases |

---

## 5. Type Aliases

`type` creates a new name for any type — not just object shapes.

```typescript
// Primitive alias
type ID        = string | number;
type Timestamp = number;

// Object shape (same as interface but not mergeable)
type Point = {
    x: number;
    y: number;
};

// Function type
type Predicate<T>  = (value: T) => boolean;
type Transformer<T, U> = (input: T) => U;

// Tuple alias
type Pair<T>   = [T, T];
type Triple<T> = [T, T, T];

// Recursive type
type TreeNode<T> = {
    value: T;
    left?:  TreeNode<T>;
    right?: TreeNode<T>;
};

// Extending via intersection
type NamedPoint = Point & { label: string };

const np: NamedPoint = { x: 1, y: 2, label: "origin" };
```

---

## 6. Literal & Template Literal Types

### Literal types

```typescript
// String literal
type Direction = "north" | "south" | "east" | "west";

// Numeric literal
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// Boolean literal
type AlwaysTrue = true;

// Literal in object
type Config = {
    env:    "development" | "staging" | "production";
    level:  1 | 2 | 3;
};

function move(direction: Direction, steps: number) {
    console.log(`moving ${direction} for ${steps} steps`);
}
move("north", 3);
// move("up", 3);   // Error: Argument of type '"up"' is not assignable
```

### Template literal types

```typescript
// Build string types from other string types
type EventName = "click" | "focus" | "blur";
type Handler   = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

type CSSProperty  = "margin" | "padding" | "border";
type CSSDirection = "Top" | "Right" | "Bottom" | "Left";
type LonghandCSS  = `${CSSProperty}-${Lowercase<CSSDirection>}`;
// "margin-top" | "margin-right" | ... | "border-left"

// Generate getter/setter type pairs
type Accessor<T extends string> = {
    [K in `get${Capitalize<T>}` | `set${Capitalize<T>}`]:
        K extends `get${string}` ? () => string : (v: string) => void;
};

// Extract parts with infer
type ExtractRouteParams<T extends string> =
    T extends `${string}:${infer Param}/${infer Rest}`
        ? Param | ExtractRouteParams<`/${Rest}`>
        : T extends `${string}:${infer Param}`
        ? Param
        : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
```

---

## 7. Union & Intersection Types

### Union types `A | B`

```typescript
// A value that is one of several types
type StringOrNumber = string | number;

function format(value: string | number): string {
    // Must narrow before using type-specific methods
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}

// Discriminated union — a common tag field narrows the type
type Shape =
    | { kind: "circle";    radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle";  base: number; height: number };

function area(shape: Shape): number {
    switch (shape.kind) {
        case "circle":    return Math.PI * shape.radius ** 2;
        case "rectangle": return shape.width * shape.height;
        case "triangle":  return 0.5 * shape.base * shape.height;
    }
}
```

### Intersection types `A & B`

```typescript
// A value that satisfies ALL combined types
type Timestamped = { createdAt: Date; updatedAt: Date };
type WithID      = { id: number };

type Record2<T> = T & WithID & Timestamped;

type UserRecord = Record2<{ name: string; email: string }>;
// { name: string; email: string; id: number; createdAt: Date; updatedAt: Date }

// Intersection for mixins
type Serializable = { serialize(): string };
type Loggable     = { log(): void };
type Service      = Serializable & Loggable & { name: string };
```

---

## 8. Narrowing & Type Guards

TypeScript narrows the type of a variable inside conditional branches.

### Built-in narrowing

```typescript
function process(value: string | number | null | undefined) {
    // typeof narrows primitives
    if (typeof value === "string") {
        console.log(value.toUpperCase());  // string here
    }

    // Truthiness narrows out null/undefined
    if (value) {
        console.log(value);   // string | number here
    }

    // Equality narrows
    if (value === null) {
        return;
    }
    // value: string | number here
}

// instanceof narrows class instances
function formatDate(d: Date | string): string {
    if (d instanceof Date) {
        return d.toISOString();   // Date here
    }
    return d;                     // string here
}

// 'in' operator narrows by property presence
type Cat = { meow(): void };
type Dog = { bark(): void };

function makeSound(animal: Cat | Dog) {
    if ("meow" in animal) {
        animal.meow();   // Cat here
    } else {
        animal.bark();   // Dog here
    }
}
```

### User-defined type guards

```typescript
// A type predicate — return type  param is Type
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isUser(obj: unknown): obj is User {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "name" in obj &&
        typeof (obj as any).name === "string"
    );
}

// Usage
const data: unknown = fetchData();
if (isUser(data)) {
    console.log(data.name);   // data: User here
}
```

### Assertion functions

```typescript
// Throws if condition is false — TypeScript narrows after the call
function assert(condition: boolean, msg: string): asserts condition {
    if (!condition) throw new Error(msg);
}

function assertIsString(val: unknown): asserts val is string {
    if (typeof val !== "string") throw new TypeError("expected string");
}

let x: unknown = getValue();
assertIsString(x);
console.log(x.toUpperCase());   // x: string here
```

### Exhaustiveness checking

```typescript
// Use 'never' to ensure all union members are handled
function assertNever(x: never): never {
    throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function describeShape(s: Shape): string {
    switch (s.kind) {
        case "circle":    return `circle r=${s.radius}`;
        case "rectangle": return `rect ${s.width}x${s.height}`;
        case "triangle":  return `triangle`;
        default:
            // If a new kind is added to Shape, TypeScript errors here
            return assertNever(s);
    }
}
```

---

## 9. Functions

### Typed function signatures

```typescript
// Parameter and return type annotations
function add(a: number, b: number): number {
    return a + b;
}

// Optional and default parameters
function greet(name: string, greeting: string = "Hello", title?: string): string {
    return `${greeting}, ${title ? title + " " : ""}${name}!`;
}

// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}

// Destructured parameters with types
function createUser({ name, role = "user" }: { name: string; role?: string }) {
    return { name, role };
}
```

### Function type expressions

```typescript
// Function type as a type alias
type Comparator<T> = (a: T, b: T) => number;
type EventHandler  = (event: MouseEvent) => void;

// Call signature in an interface/type
interface Formatter {
    (value: number, decimals: number): string;
    locale: string;   // property on the function object
}

// Using function types
const sortByAge: Comparator<{ age: number }> = (a, b) => a.age - b.age;
```

### Overloads

```typescript
// Define multiple call signatures; last is the implementation
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
    if (typeof input === "string") return parseInt(input, 10);
    return input.toString();
}

parse("42")   // number
parse(42)     // string

// Method overloads in a class
class DateFormatter {
    format(date: Date): string;
    format(timestamp: number): string;
    format(input: Date | number): string {
        const d = typeof input === "number" ? new Date(input) : input;
        return d.toISOString();
    }
}
```

### Generic functions

```typescript
// Type parameter makes the function work with any type while preserving it
function identity<T>(value: T): T {
    return value;
}

function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

// Multiple type parameters
function zip<A, B>(as: A[], bs: B[]): [A, B][] {
    return as.map((a, i) => [a, bs[i]]);
}

// Constrained type parameter
function getLength<T extends { length: number }>(value: T): number {
    return value.length;
}
getLength("hello")    // 5
getLength([1, 2, 3])  // 3

// keyof constraint — restrict to keys of another type
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
getProperty({ name: "Alice", age: 30 }, "name")  // string
```

---

## 10. Classes

### Class syntax with TypeScript

```typescript
class Animal {
    // Class field with access modifier
    readonly id: number;
    protected name: string;
    private  #sound: string;   // private field (runtime private, JS spec)
    species: string = "Unknown";

    // Constructor shorthand — declares AND initialises fields
    constructor(
        readonly kingdom: string,   // shorthand: readonly public field
        private genus:    string,   // shorthand: private field
        name:             string,   // not a field shorthand — just a param
        sound:            string,
    ) {
        this.id    = Math.random();
        this.name  = name;
        this.#sound = sound;
    }

    speak(): string {
        return `${this.name} says ${this.#sound}`;
    }

    get label(): string {
        return `${this.name} (${this.kingdom})`;
    }

    set label(value: string) {
        this.name = value.split(" ")[0];
    }

    static create(name: string): Animal {
        return new Animal("Animalia", "Unknown", name, "...");
    }
}
```

### Access modifiers

| Modifier | Class | Subclass | Outside |
|----------|-------|----------|---------|
| `public` (default) | ✓ | ✓ | ✓ |
| `protected` | ✓ | ✓ | ✗ |
| `private` | ✓ | ✗ | ✗ |
| `#privateField` | ✓ | ✗ | ✗ (runtime) |
| `readonly` | ✓ (read) | ✓ (read) | ✓ (read) |

```typescript
// TypeScript 'private' is erased at runtime — accessible via  (obj as any).field
// '#' private fields are truly inaccessible at runtime (JS class fields spec)

class Safe {
    private tsPrivate = "TS only";
    #jsPrivate        = "runtime safe";
}
const s = new Safe();
// (s as any).tsPrivate   // "TS only" at runtime (type error, but works)
// s.#jsPrivate           // SyntaxError at runtime — truly private
```

### Inheritance

```typescript
class Dog extends Animal {
    #breed: string;

    constructor(name: string, breed: string) {
        super("Animalia", "Canis", name, "Woof");
        this.#breed = breed;
    }

    // Override — must be compatible with parent signature
    override speak(): string {
        return `${super.speak()} (${this.#breed})`;
    }
}

// Abstract class — cannot be instantiated directly
abstract class Vehicle {
    abstract drive(): void;     // subclasses must implement

    refuel(): void {
        console.log("refuelling");
    }
}

class Car extends Vehicle {
    drive(): void {
        console.log("vroom");
    }
}
```

### Implementing interfaces

```typescript
interface Printable {
    print(): void;
}

interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

// A class can implement multiple interfaces
class Document implements Printable, Serializable {
    constructor(private content: string) {}

    print(): void { console.log(this.content); }
    serialize():    string { return JSON.stringify({ content: this.content }); }
    deserialize(d:  string): void { this.content = JSON.parse(d).content; }
}
```

---

## 11. Generics

### Generic interfaces and types

```typescript
// Generic interface
interface Repository<T, ID = number> {
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<T>;
    delete(id: ID): Promise<void>;
}

// Generic class
class Stack<T> {
    #items: T[] = [];

    push(item: T): void   { this.#items.push(item); }
    pop():  T | undefined { return this.#items.pop(); }
    peek(): T | undefined { return this.#items.at(-1); }
    get size(): number    { return this.#items.length; }
    isEmpty(): boolean    { return this.#items.length === 0; }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.pop();   // number
```

### Constraints and defaults

```typescript
// Constrain T to have a specific property
function sortBy<T extends object, K extends keyof T>(arr: T[], key: K): T[] {
    return [...arr].sort((a, b) => {
        const va = a[key], vb = b[key];
        return va < vb ? -1 : va > vb ? 1 : 0;
    });
}

sortBy([{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }], "age");

// Default type parameter
interface Paginated<T, Meta = Record<string, unknown>> {
    data:  T[];
    total: number;
    meta:  Meta;
}

// Conditional default
type MaybeArray<T> = T extends unknown[] ? T : T[];
```

### Generic utility patterns

```typescript
// Generic result type (like Rust's Result)
type Result<T, E = Error> =
    | { ok: true;  value: T }
    | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return { ok: false, error: "division by zero" };
    return { ok: true, value: a / b };
}

const result = divide(10, 2);
if (result.ok) {
    console.log(result.value);   // number here
} else {
    console.error(result.error); // string here
}

// Generic async wrapper
async function tryCatch<T>(
    promise: Promise<T>
): Promise<[null, T] | [Error, null]> {
    try {
        return [null, await promise];
    } catch (e) {
        return [e instanceof Error ? e : new Error(String(e)), null];
    }
}

const [err, user] = await tryCatch(fetchUser(1));
if (err) return handleError(err);
```

---

## 12. Utility Types

TypeScript ships built-in generic types for common type transformations.

### Object utilities

```typescript
interface User {
    id:       number;
    name:     string;
    email:    string;
    password: string;
    role:     "admin" | "user";
}

// Partial<T> — all properties become optional
type UpdateUser = Partial<User>;
// { id?: number; name?: string; ... }

// Required<T> — all properties become required (removes ?)
type RequiredUser = Required<Partial<User>>;

// Readonly<T> — all properties become readonly
type ImmutableUser = Readonly<User>;

// Pick<T, K> — keep only specified keys
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, K> — remove specified keys
type PublicUser = Omit<User, "password">;
// { id: number; name: string; email: string; role: ... }

// Record<K, V> — object with keys K and values V
type RoleMap = Record<"admin" | "user", User[]>;
// { admin: User[]; user: User[] }
```

### Union utilities

```typescript
type Status = "pending" | "active" | "inactive" | "deleted";

// Exclude<T, U> — remove members of U from T
type ActiveStatus = Exclude<Status, "deleted" | "inactive">;
// "pending" | "active"

// Extract<T, U> — keep only members assignable to U
type StringOrNumber = Extract<string | number | boolean, string | number>;
// string | number

// NonNullable<T> — remove null and undefined
type DefinedString = NonNullable<string | null | undefined>;
// string
```

### Function utilities

```typescript
function fetchUser(id: number): Promise<User> { /* ... */ }
function onClick(event: MouseEvent, id: number): void { /* ... */ }

// ReturnType<T> — extract return type
type FetchResult    = ReturnType<typeof fetchUser>;   // Promise<User>
type ClickResult    = ReturnType<typeof onClick>;      // void

// Parameters<T> — extract parameter types as a tuple
type FetchParams    = Parameters<typeof fetchUser>;    // [id: number]
type ClickParams    = Parameters<typeof onClick>;      // [event: MouseEvent, id: number]

// Awaited<T> — unwrap Promise type (TS 4.5)
type UserData       = Awaited<ReturnType<typeof fetchUser>>;   // User

// ConstructorParameters<T> — constructor parameter types
class Connection { constructor(host: string, port: number) {} }
type ConnParams = ConstructorParameters<typeof Connection>;  // [string, number]

// InstanceType<T> — instance type of a constructor
type ConnInstance = InstanceType<typeof Connection>;  // Connection
```

### String utilities

```typescript
// All operate on string literal types
type Upper  = Uppercase<"hello">;         // "HELLO"
type Lower  = Lowercase<"HELLO">;         // "hello"
type Cap    = Capitalize<"hello">;        // "Hello"
type Uncap  = Uncapitalize<"Hello">;      // "hello"
```

---

## 13. Mapped Types

Mapped types transform each property in a type using `in keyof`.

### Basic mapped type

```typescript
// Make every property optional — same as Partial<T> but written explicitly
type Optional<T> = {
    [K in keyof T]?: T[K];
};

// Make every property nullable
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

// Make every property readonly — same as Readonly<T>
type Immutable<T> = {
    readonly [K in keyof T]: T[K];
};

// Remove readonly from every property
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

// Remove optional from every property — same as Required<T>
type Concrete<T> = {
    [K in keyof T]-?: T[K];
};
```

### Remapping keys with `as`

```typescript
// Rename each key by wrapping it in a template literal
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Filter keys by type
type PickByValue<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type StringProps = PickByValue<{ a: string; b: number; c: string }, string>;
// { a: string; c: string }
```

### Mapped type with `in` over a union

```typescript
// Build an object type from a union of string literals
type Flags<T extends string> = {
    [K in T]: boolean;
};

type FeatureFlags = Flags<"darkMode" | "betaFeatures" | "analytics">;
// { darkMode: boolean; betaFeatures: boolean; analytics: boolean }

// Combine remapping with conditional types
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

---

## 14. Conditional Types

Conditional types choose a type based on a condition: `T extends U ? X : Y`.

### Basic conditional types

```typescript
// IsString<T> — true if T is a string, false otherwise
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<number>;   // false

// Flatten arrays one level
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type C = Flatten<number[]>;  // number
type D = Flatten<string>;    // string  (not an array, returns as-is)

// Unwrap Promise
type Awaited2<T> = T extends Promise<infer R> ? Awaited2<R> : T;
```

### `infer` keyword

```typescript
// infer captures a type within a conditional check

// Extract function return type
type ReturnType2<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract the first parameter type
type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;

// Extract element type from array or Promise
type UnwrapArray<T>   = T extends (infer E)[] ? E : T;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;

// Get the value type of an object
type ValueOf<T> = T extends Record<string, infer V> ? V : never;
type Vals = ValueOf<{ a: number; b: string }>;   // number | string
```

### Distributive conditional types

```typescript
// When T is a naked type parameter, the conditional distributes over unions
type ToArray<T> = T extends unknown ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// string[] | number[]   (NOT (string | number)[])

// To prevent distribution, wrap in brackets
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type StrOrNumArr2 = ToArrayNonDist<string | number>;
// (string | number)[]

// Practical: filter a union
type NonNullable2<T> = T extends null | undefined ? never : T;
type Clean = NonNullable2<string | null | undefined | number>;
// string | number
```

---

## 15. Enums

### Numeric enums

```typescript
enum Direction {
    North,        // 0
    South,        // 1
    East,         // 2
    West,         // 3
}

enum StatusCode {
    OK          = 200,
    NotFound    = 404,
    ServerError = 500,
}

// Reverse mapping — numeric enums support it
Direction[0]          // "North"
Direction["North"]    // 0
Direction.North       // 0
```

### String enums

```typescript
enum LogLevel {
    DEBUG = "DEBUG",
    INFO  = "INFO",
    WARN  = "WARN",
    ERROR = "ERROR",
}

// No reverse mapping for string enums
LogLevel.INFO    // "INFO"
// LogLevel["INFO"] // "INFO"  — still works

function log(level: LogLevel, msg: string) {
    console.log(`[${level}] ${msg}`);
}
log(LogLevel.INFO, "server started");
```

### Const enums (inlined at compile time)

```typescript
// const enum — values are inlined; no enum object in output
const enum Color {
    Red   = "RED",
    Green = "GREEN",
    Blue  = "BLUE",
}

const c: Color = Color.Red;
// Compiled to:  const c = "RED";  — no enum object generated
```

### When to use enums vs union types

```typescript
// Prefer union of string literals for simpler, tree-shakeable code
type Direction2 = "north" | "south" | "east" | "west";

// Use enum when: you need reverse mapping, the values are numeric,
// or you want a named runtime object accessible by value
```

---

## 16. Modules & Declaration Files

### Importing types

```typescript
// Import type — erased at runtime (no JS output)
import type { User } from "./types";
import type { FC, ReactNode } from "react";

// Inline type import (TS 4.5)
import { type User as UserType, createUser } from "./user";
```

### Exporting types

```typescript
// Named type exports
export type { User, UserRole };
export interface Config { host: string; }
export type ID = string | number;

// Re-export types
export type { User } from "./types";
export type * from "./models";   // TS 5.0
```

### Declaration files (`.d.ts`)

```typescript
// Describe the shape of a JS module or global — no implementation

// global.d.ts — augment global scope
declare global {
    interface Window {
        analytics: { track(event: string): void };
    }
    const __DEV__: boolean;
}

// module.d.ts — declare an untyped npm package
declare module "some-legacy-lib" {
    export function doStuff(input: string): number;
    export const VERSION: string;
}

// Ambient module for non-JS assets (used with webpack/vite)
declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "*.css" {
    const classes: Record<string, string>;
    export default classes;
}
```

### Module augmentation

```typescript
// Extend types from an existing module without forking it
import "express";

declare module "express" {
    interface Request {
        user?: { id: number; role: string };
    }
}
```

---

## 17. Decorators

Decorators require `"experimentalDecorators": true` in tsconfig (legacy) or use the standard TC39 decorators (TS 5.0+).

### Class decorator

```typescript
// A class decorator receives the constructor and can return a modified class
function Singleton<T extends { new(...args: any[]): {} }>(Base: T) {
    let instance: T;
    return class extends Base {
        constructor(...args: any[]) {
            if (instance) return instance;
            super(...args);
            instance = this as any;
        }
    };
}

@Singleton
class DatabasePool {
    connections: number = 0;
}

const a = new DatabasePool();
const b = new DatabasePool();
a === b   // true
```

### Method decorator

```typescript
// Method decorators receive the class prototype, method name, and descriptor
function log(target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: unknown[]) {
        console.log(`calling ${key}(${args.join(", ")})`);
        const result = original.apply(this, args);
        console.log(`${key} returned ${result}`);
        return result;
    };
    return descriptor;
}

class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }
}
```

### Property & parameter decorators

```typescript
// Property decorator
function required(target: any, key: string) {
    let value = target[key];
    Object.defineProperty(target, key, {
        get: () => value,
        set: (v) => {
            if (v === null || v === undefined) throw new Error(`${key} is required`);
            value = v;
        },
    });
}

// Parameter decorator
function validate(target: any, key: string, index: number) {
    const existing = Reflect.getMetadata("params", target, key) || [];
    existing.push(index);
    Reflect.defineMetadata("params", existing, target, key);
}
```

### Standard decorators (TS 5.0 / TC39 Stage 3)

```typescript
// No experimentalDecorators needed — new standard syntax
function memoize<T, Args extends unknown[], R>(
    target: (this: T, ...args: Args) => R,
    context: ClassMethodDecoratorContext
): (this: T, ...args: Args) => R {
    const cache = new Map<string, R>();
    return function(this: T, ...args: Args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key)!;
        const result = target.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

class MathService {
    @memoize
    fibonacci(n: number): number {
        return n <= 1 ? n : this.fibonacci(n-1) + this.fibonacci(n-2);
    }
}
```

---

## 18. Advanced Patterns

### Branded / nominal types

```typescript
// TypeScript uses structural typing — two types with the same shape are equal.
// Branding creates a unique type even if the underlying structure is the same.

declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

type UserID    = Brand<number, "UserID">;
type ProductID = Brand<number, "ProductID">;

function createUserID(id: number): UserID {
    return id as UserID;
}

function getUser(id: UserID): User { /* ... */ }

const uid = createUserID(1);
const pid = 2 as ProductID;

getUser(uid);   // OK
// getUser(pid);   // Error: Argument of type 'ProductID' is not assignable to 'UserID'
// getUser(3);     // Error: Argument of type 'number' is not assignable to 'UserID'
```

### Builder pattern with method chaining

```typescript
class QueryBuilder<T extends object> {
    #table: string;
    #conditions: string[] = [];
    #limit?: number;
    #offset?: number;

    constructor(table: string) { this.#table = table; }

    where(condition: string): this {
        this.#conditions.push(condition);
        return this;
    }

    take(n: number): this {
        this.#limit = n;
        return this;
    }

    skip(n: number): this {
        this.#offset = n;
        return this;
    }

    build(): string {
        let sql = `SELECT * FROM ${this.#table}`;
        if (this.#conditions.length) sql += ` WHERE ${this.#conditions.join(" AND ")}`;
        if (this.#limit)  sql += ` LIMIT ${this.#limit}`;
        if (this.#offset) sql += ` OFFSET ${this.#offset}`;
        return sql;
    }
}

const query = new QueryBuilder("users")
    .where("active = true")
    .where("age > 18")
    .take(10)
    .skip(20)
    .build();
// "SELECT * FROM users WHERE active = true AND age > 18 LIMIT 10 OFFSET 20"
```

### Discriminated union with exhaustive handler

```typescript
type Action =
    | { type: "increment"; by: number }
    | { type: "decrement"; by: number }
    | { type: "reset" }
    | { type: "set"; value: number };

type State = { count: number };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "increment": return { count: state.count + action.by };
        case "decrement": return { count: state.count - action.by };
        case "reset":     return { count: 0 };
        case "set":       return { count: action.value };
        default:
            // TypeScript errors here if a new action type is added but not handled
            const _: never = action;
            return state;
    }
}
```

### Fluent / type-safe event emitter

```typescript
type EventMap = {
    "user:created":  { id: number; name: string };
    "user:deleted":  { id: number };
    "order:placed":  { orderId: string; total: number };
};

class TypedEmitter<Events extends Record<string, unknown>> {
    #listeners = new Map<keyof Events, Set<(data: any) => void>>();

    on<K extends keyof Events>(event: K, fn: (data: Events[K]) => void): this {
        if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
        this.#listeners.get(event)!.add(fn);
        return this;
    }

    off<K extends keyof Events>(event: K, fn: (data: Events[K]) => void): this {
        this.#listeners.get(event)?.delete(fn);
        return this;
    }

    emit<K extends keyof Events>(event: K, data: Events[K]): this {
        this.#listeners.get(event)?.forEach(fn => fn(data));
        return this;
    }
}

const emitter = new TypedEmitter<EventMap>();

// Fully type-safe — `data` is inferred correctly
emitter.on("user:created", (data) => {
    console.log(data.name);   // data: { id: number; name: string }
});

emitter.emit("user:created", { id: 1, name: "Alice" });
// emitter.emit("user:created", { id: 1 });  // Error: missing 'name'
```

### Deep partial

```typescript
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

type Config = {
    server: { host: string; port: number; ssl: boolean };
    db:     { host: string; port: number; name: string };
};

type PartialConfig = DeepPartial<Config>;
// { server?: { host?: string; port?: number; ssl?: boolean }; db?: { ... } }

function mergeConfig(base: Config, overrides: DeepPartial<Config>): Config {
    return {
        server: { ...base.server, ...overrides.server },
        db:     { ...base.db,     ...overrides.db     },
    };
}
```

### Variadic tuple types

```typescript
// Prepend / append to a tuple
type Prepend<T extends unknown[], Item> = [Item, ...T];
type Append<T extends unknown[], Item>  = [...T, Item];

type A = Prepend<[number, string], boolean>;  // [boolean, number, string]
type B = Append<[number, string], boolean>;   // [number, string, boolean]

// Concat two tuples
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];

// Typed curry with variadic tuples
type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer T] ? T : never;
```

---

## 19. Common Compiler Errors & Fixes

### TS2345 — Argument not assignable

```typescript
// Error: Argument of type 'string' is not assignable to parameter of type 'number'
function double(n: number) { return n * 2; }
double("5");   // Error

// Fix: convert the type
double(Number("5"));
double(parseInt("5", 10));
```

### TS2531 — Object is possibly null

```typescript
// Error: Object is possibly 'null'
const el = document.getElementById("app");
el.textContent = "hello";   // el could be null

// Fix 1: non-null assertion (use only when you're certain)
el!.textContent = "hello";

// Fix 2: optional chaining
el?.setAttribute("class", "active");

// Fix 3: explicit null check
if (el !== null) {
    el.textContent = "hello";
}

// Fix 4: assertion with throw
function assertDefined<T>(val: T | null | undefined, msg: string): asserts val is T {
    if (val == null) throw new Error(msg);
}
assertDefined(el, "#app not found");
el.textContent = "hello";   // narrowed to HTMLElement
```

### TS2339 — Property does not exist

```typescript
// Error: Property 'foo' does not exist on type '{}'
const obj = {};
obj.foo = 1;   // Error

// Fix: type the object properly
const obj2: Record<string, number> = {};
obj2.foo = 1;   // OK

// Or use an interface
interface Config2 { foo: number }
const obj3: Config2 = { foo: 1 };
```

### TS7006 — Parameter implicitly has an 'any' type

```typescript
// Error: Parameter 'x' implicitly has an 'any' type
function process(x) { return x; }   // Error with noImplicitAny

// Fix: add type annotation
function process2(x: unknown): unknown { return x; }
```

### TS2304 — Cannot find name

```typescript
// Error: Cannot find name 'Promise'  (targeting old JS)
// Fix: add "lib": ["ES2015"] or "lib": ["ES2022"] to tsconfig

// Error: Cannot find name 'fetch'
// Fix: add "lib": ["DOM"] to tsconfig  or  install @types/node
```

### TS2532 — Object is possibly 'undefined'

```typescript
// With noUncheckedIndexedAccess enabled:
const arr = [1, 2, 3];
const x = arr[0];       // x: number | undefined

// Fix: null check before use
if (x !== undefined) {
    console.log(x * 2);   // x: number
}

// Fix: use at() with fallback
const first = arr.at(0) ?? 0;   // number
```

---

## 20. Q&A — Conceptual Questions

**Q: What is the difference between `interface` and `type`?**
Both describe object shapes. Key differences: `interface` supports **declaration merging** (two interfaces with the same name are automatically combined, useful for extending third-party types). `interface` uses `extends` for extension; `type` uses `&` intersection. `type` can describe anything: primitives, unions, tuples, mapped types — `interface` is limited to object shapes. In practice: prefer `interface` for public APIs and class contracts; use `type` for unions, complex generic types, and anything not an object shape.

---

**Q: What is structural typing?**
TypeScript uses **structural typing** (also called duck typing) — two types are compatible if they have the same structure (same properties and methods), regardless of their names. A `Point { x: number; y: number }` is assignable to `Coordinate { x: number; y: number }` even though they are declared separately. This differs from nominal typing (Java/C#) where names matter. Brands/nominal types can simulate nominal typing when you need the distinction.

---

**Q: What is `unknown` and when should I use it instead of `any`?**
Both `any` and `unknown` accept any value, but they differ in how you can use them. `any` completely opts out of type checking — you can do anything with an `any` value. `unknown` is type-safe — you must narrow the type before performing operations. Use `unknown` for values from external sources (API responses, user input, JSON parsing) where you intend to validate the type before using it. Use `any` only as a last resort when migrating JS to TS or interfacing with truly untyped code.

---

**Q: What is the difference between `type assertion` (`as T`) and a `type guard`?**
A **type assertion** (`value as SomeType`) tells the compiler "trust me, this is that type" — it is a compile-time instruction that produces no runtime code and no runtime check. If you assert wrongly, you get a runtime error. A **type guard** (a function returning a type predicate `value is T`, or a `typeof`/`instanceof` check) actually narrows the type at runtime based on real conditional logic. Always prefer type guards; use assertions only when you have information the compiler cannot infer.

---

**Q: What is `never` and when does it appear?**
`never` represents a value that never exists. It appears in: (1) a function that always throws or has an infinite loop (return type `never`); (2) exhaustive switch checks — after all union members are handled, the remaining type is `never`; (3) the result of intersecting incompatible types (`string & number` → `never`). It is the bottom type — `never` is assignable to every type, but no type is assignable to `never`. This makes it perfect for exhaustiveness checks.

---

**Q: What is declaration merging?**
When TypeScript finds multiple declarations with the same name in the same scope, it merges them into one. Works for: `interface` + `interface`, `namespace` + `class`/`function`/`enum`. The most common use case is augmenting third-party types — e.g., adding `user` to Express's `Request` interface, or adding custom properties to the global `Window`. `type` aliases, `class`, and `enum` do NOT support merging.

---

**Q: What are mapped types and when should I use them?**
Mapped types transform every property in a type programmatically using `[K in keyof T]`. They are the building blocks for the built-in utility types (`Partial`, `Required`, `Readonly`, `Record`, `Pick`, `Omit`). Use them when you need to derive a new type from an existing one by applying a consistent transformation to all properties — making them optional, adding a prefix to keys, filtering by value type, or making them nullable.

---

**Q: What is `infer` and how does it work?**
`infer` is used inside conditional types to capture and name a type variable that is inferred from a match. It can only appear in the `extends` clause. Example: `T extends Promise<infer R>` — if `T` is a `Promise<something>`, `R` is bound to that `something`. It is how `ReturnType<T>`, `Parameters<T>`, `Awaited<T>`, and similar utility types are implemented. Think of it as a pattern-match variable for types.

---

**Q: What is the difference between `Readonly<T>` and `const`?**
`const` is a JavaScript runtime concept — it prevents reassignment of a variable binding but does not prevent mutation of the object the variable points to. `Readonly<T>` is a TypeScript compile-time concept — it marks all properties as `readonly`, preventing property reassignment within TypeScript's type system. Neither provides deep immutability. For deep immutability use `DeepReadonly<T>` (custom mapped type) or `as const` assertions.

---

**Q: What is `satisfies` and how is it different from a type annotation?**
A type annotation (`const x: Type = value`) widens the inferred type to `Type`, losing specificity. The `satisfies` operator (`const x = value satisfies Type`) validates that `value` matches `Type` at compile time, but the inferred type remains the specific literal type of `value`. This gives you both validation AND the most precise type. Example: a color palette typed as `Record<string, string | number[]>` — with `satisfies`, each value retains its specific type (`string` or `number[]`), so `.toUpperCase()` works without needing a type assertion.

---

**Q: When should I use enums vs union types?**
Prefer **union types** (`type Status = "active" | "inactive"`) for most cases — they are simpler, tree-shakeable, produce less compiled output, and work well with discriminated unions. Use **enums** when: you need a reverse mapping (number → name), you want a grouped namespace of related constants accessible as a runtime object, or you are working in a codebase that already uses enums extensively. Avoid `const enum` across module boundaries and `ambient const enum` in `.d.ts` files — they can cause surprising behavior.
