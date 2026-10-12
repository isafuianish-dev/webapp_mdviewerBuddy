# Python Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **Python 3.10+** unless noted otherwise.
> Notes for older versions are marked `[3.8+]` / `[3.9+]` etc.

---

## Table of Contents

1. [Script Basics & Entry Point](#1-script-basics--entry-point)
2. [Variables & Types](#2-variables--types)
3. [Strings](#3-strings)
4. [Numbers & Math](#4-numbers--math)
5. [Booleans & None](#5-booleans--none)
6. [Lists](#6-lists)
7. [Tuples](#7-tuples)
8. [Dictionaries](#8-dictionaries)
9. [Sets](#9-sets)
10. [Control Flow — `if` / `elif` / `else`](#10-control-flow--if--elif--else)
11. [Loops — `for` / `while`](#11-loops--for--while)
12. [Comprehensions](#12-comprehensions)
13. [Functions](#13-functions)
14. [Lambda & Higher-Order Functions](#14-lambda--higher-order-functions)
15. [Decorators](#15-decorators)
16. [Classes & OOP](#16-classes--oop)
17. [Inheritance & Mixins](#17-inheritance--mixins)
18. [Exceptions & Error Handling](#18-exceptions--error-handling)
19. [Context Managers — `with`](#19-context-managers--with)
20. [Modules & Packages](#20-modules--packages)
21. [File I/O](#21-file-io)
22. [Iterators & Generators](#22-iterators--generators)
23. [Type Hints & Annotations](#23-type-hints--annotations)
24. [Dataclasses](#24-dataclasses)
25. [Standard Library Highlights](#25-standard-library-highlights)
26. [Virtual Environments & pip](#26-virtual-environments--pip)
27. [Testing — `unittest` / `pytest`](#27-testing--unittest--pytest)
28. [Concurrency — `threading` / `multiprocessing` / `asyncio`](#28-concurrency--threading--multiprocessing--asyncio)
29. [Useful Patterns & Idioms](#29-useful-patterns--idioms)
31. [`argparse` — Full CLI Reference](#31-argparse--full-cli-reference)
32. [`subprocess` — Running External Processes](#32-subprocess--running-external-processes)
33. [`threading` — Concurrent Threads](#33-threading--concurrent-threads)
34. [`asyncio` & `async`/`await` — Asynchronous I/O](#34-asyncio--asyncawait--asynchronous-io)
35. [Q&A — Conceptual Questions](#35-qa--conceptual-questions)

---

## 1. Script Basics & Entry Point

### Shebang & encoding

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
```

### Standard script template

```python
#!/usr/bin/env python3
"""
Script : deploy.py
Purpose: Deploy application to a target environment
Usage  : python deploy.py [-e <env>] [-v] <app_name>
"""

import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("app_name")
    parser.add_argument("-e", "--env", default="staging")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    # Your logic here
    return 0


# Guard — prevents execution when the file is imported as a module
if __name__ == "__main__":
    sys.exit(main())
```

### `__name__` guard explained

```python
# __name__ == "__main__"  when run directly:  python script.py
# __name__ == "script"    when imported:       import script
```

---

## 2. Variables & Types

### Assignment

```python
# Basic assignment
x = 10
name = "Alice"

# Multiple assignment
a, b, c = 1, 2, 3

# Swap without a temporary variable
a, b = b, a

# Augmented assignment
count = 0
count += 1
count -= 1
count *= 2
count //= 3   # floor division in-place
count **= 2   # exponentiation in-place
```

### Built-in types at a glance

| Category   | Types                              |
|------------|------------------------------------|
| Numeric    | `int`, `float`, `complex`          |
| Sequence   | `str`, `list`, `tuple`, `range`    |
| Mapping    | `dict`                             |
| Set        | `set`, `frozenset`                 |
| Boolean    | `bool`                             |
| Binary     | `bytes`, `bytearray`, `memoryview` |
| None       | `NoneType`                         |

### Type introspection

```python
# Check the type of a value
type(42)           # <class 'int'>
type("hello")      # <class 'str'>

# isinstance is preferred in production code (handles subclasses)
isinstance(42, int)         # True
isinstance(42, (int, float)) # True — matches either

# Check if attribute exists before accessing it
hasattr(obj, "method_name")
```

### Constants convention

```python
# Python has no true constants — use ALL_CAPS as a signal not to mutate
MAX_RETRIES = 3
BASE_URL = "https://api.example.com"
```

---

## 3. Strings

### Literals

```python
# Single or double quotes — no difference
greeting = 'Hello'
greeting = "Hello"

# Multi-line string
sql = """
    SELECT *
    FROM users
    WHERE active = 1
"""

# Raw string — backslashes are not escape sequences (useful for regex/paths)
pattern = r"\d{4}-\d{2}-\d{2}"
path = r"C:\Users\alice\documents"
```

### f-strings (preferred for formatting)

```python
name = "Alice"
age = 30

# Basic interpolation
msg = f"Hello, {name}! You are {age} years old."

# Expressions inside braces
msg = f"Next year: {age + 1}"

# Format specifiers
pi = 3.14159
msg = f"Pi ≈ {pi:.2f}"          # Pi ≈ 3.14
msg = f"{1_000_000:,}"           # 1,000,000
msg = f"{0.005:.2%}"             # 0.50%
msg = f"{255:#010b}"             # 0b11111111 with prefix and zero-pad

# Self-documenting expressions (3.8+)
x = 42
print(f"{x=}")                   # x=42
```

### Common string methods

```python
s = "  Hello, World!  "

# Case
s.upper()           # "  HELLO, WORLD!  "
s.lower()           # "  hello, world!  "
s.title()           # "  Hello, World!  "
s.capitalize()      # "  hello, world!  "
s.swapcase()        # "  hELLO, wORLD!  "

# Strip whitespace
s.strip()           # "Hello, World!"
s.lstrip()          # "Hello, World!  "
s.rstrip()          # "  Hello, World!"

# Search
s.find("World")     # index of first match, -1 if not found
s.index("World")    # same but raises ValueError if not found
s.count("l")        # number of occurrences
s.startswith("  H") # True
s.endswith("!  ")   # True

# Replace
s.replace("World", "Python")

# Split / join
"a,b,c".split(",")       # ['a', 'b', 'c']
"line1\nline2".splitlines() # ['line1', 'line2']
",".join(["a", "b", "c"]) # "a,b,c"

# Check content
"abc123".isdigit()   # False
"123".isdigit()      # True
"abc".isalpha()      # True
"abc123".isalnum()   # True

# Padding
"42".zfill(5)        # "00042"
"left".ljust(10)     # "left      "
"right".rjust(10)    # "      right"
"center".center(10)  # "  center  "
```

### String slicing

```python
s = "Hello, World!"

# s[start:stop:step]  — stop is exclusive
s[0:5]      # "Hello"
s[7:]       # "World!"
s[:5]       # "Hello"
s[-6:]      # "orld!"  — negative index counts from end
s[::2]      # every other character
s[::-1]     # reverse the string
```

---

## 4. Numbers & Math

### Integer operations

```python
# Standard arithmetic
10 + 3    # 13
10 - 3    # 7
10 * 3    # 30
10 / 3    # 3.3333…  (always returns float)
10 // 3   # 3        (floor division, returns int)
10 % 3    # 1        (modulo)
10 ** 3   # 1000     (exponentiation)

# Bitwise
0b1010 & 0b1100   # 8  (AND)
0b1010 | 0b1100   # 14 (OR)
0b1010 ^ 0b1100   # 6  (XOR)
~0b1010           # -11 (NOT)
1 << 3            # 8   (left shift)
16 >> 2           # 4   (right shift)

# Integer literals in different bases
0b1010    # binary  10
0o17      # octal   15
0xFF      # hex     255
1_000_000 # underscore separator (readability)
```

### `math` module

```python
import math

math.sqrt(16)       # 4.0
math.ceil(4.1)      # 5
math.floor(4.9)     # 4
math.trunc(4.9)     # 4  (toward zero)
math.fabs(-5)       # 5.0
math.log(100, 10)   # 2.0
math.log2(8)        # 3.0
math.log10(1000)    # 3.0
math.pi             # 3.141592653589793
math.e              # 2.718281828459045
math.inf            # infinity
math.isnan(x)       # True if x is NaN
math.isinf(x)       # True if x is ±inf
math.gcd(12, 8)     # 4
math.factorial(5)   # 120
```

### `decimal` — exact decimal arithmetic

```python
from decimal import Decimal, getcontext

# Set global precision
getcontext().prec = 28

# Avoid floating-point rounding errors in financial code
Decimal("0.1") + Decimal("0.2")  # Decimal('0.3')  not 0.30000000000000004
```

---

## 5. Booleans & None

### Truthiness

```python
# Falsy values — everything else is truthy
bool(False)    # False
bool(None)     # False
bool(0)        # False
bool(0.0)      # False
bool("")       # False
bool([])       # False
bool({})       # False
bool(set())    # False

# Short-circuit evaluation
x = a or default_value    # x = a if a is truthy, else default_value
y = a and process(a)      # process(a) only called if a is truthy
```

### None checks

```python
# Always use 'is' / 'is not' for None — never ==
if value is None:
    ...

if value is not None:
    ...
```

---

## 6. Lists

### Creating lists

```python
# Literal
items = [1, 2, 3]
mixed = [1, "two", 3.0, True, None]

# From iterable
nums = list(range(1, 6))    # [1, 2, 3, 4, 5]
chars = list("abc")         # ['a', 'b', 'c']

# Pre-filled
zeros = [0] * 5             # [0, 0, 0, 0, 0]
```

### Accessing & slicing

```python
lst = [10, 20, 30, 40, 50]

# Index access
lst[0]     # 10
lst[-1]    # 50  — last element

# Slicing  [start:stop:step]
lst[1:3]   # [20, 30]
lst[::-1]  # [50, 40, 30, 20, 10]  — reversed copy
```

### Mutating lists

```python
lst = [1, 2, 3]

# Add
lst.append(4)           # [1, 2, 3, 4]
lst.insert(1, 99)       # [1, 99, 2, 3, 4]
lst.extend([5, 6])      # append multiple items

# Remove
lst.remove(99)          # removes first occurrence by value
popped = lst.pop()      # removes & returns last element
popped = lst.pop(0)     # removes & returns element at index 0
del lst[1]              # remove by index
lst.clear()             # remove all items

# Sort & reverse
lst.sort()                          # in-place ascending
lst.sort(reverse=True)              # in-place descending
lst.sort(key=lambda x: x.lower())   # sort by custom key
lst.reverse()                       # in-place reverse
```

### Non-mutating operations

```python
lst = [3, 1, 2]

# Return a new sorted list
sorted(lst)                  # [1, 2, 3]
sorted(lst, reverse=True)    # [3, 2, 1]

# Membership
2 in lst     # True
9 not in lst # True

# Aggregate
len(lst)      # 3
min(lst)      # 1
max(lst)      # 3
sum(lst)      # 6

# Search
lst.index(2)  # index of first occurrence (raises ValueError if absent)
lst.count(1)  # count occurrences

# Copy (shallow)
copy1 = lst.copy()
copy2 = lst[:]
copy3 = list(lst)
```

### Unpacking

```python
first, *rest = [1, 2, 3, 4]   # first=1  rest=[2,3,4]
*head, last  = [1, 2, 3, 4]   # head=[1,2,3]  last=4
a, _, c      = [1, 2, 3]      # discard middle value
```

---

## 7. Tuples

Tuples are **immutable** sequences. Use them for fixed collections or as dictionary keys.

```python
# Create
point = (3, 4)
single = (42,)     # trailing comma required for single-element tuple
coords = 1, 2, 3   # parentheses optional

# Unpack
x, y = point
lat, lon, alt = coords

# Named tuple — gives field names without a full class
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x   # 3
p.y   # 4

# typing.NamedTuple — class syntax with type hints
from typing import NamedTuple

class Vector(NamedTuple):
    x: float
    y: float
    label: str = ""
```

---

## 8. Dictionaries

### Creating dicts

```python
# Literal
person = {"name": "Alice", "age": 30}

# From keys
empty = {}
from_keys = dict.fromkeys(["a", "b", "c"], 0)  # {'a':0,'b':0,'c':0}

# dict() constructor
person = dict(name="Alice", age=30)
```

### Reading & writing

```python
d = {"name": "Alice", "age": 30}

# Access
d["name"]             # "Alice"  — KeyError if missing
d.get("name")         # "Alice"
d.get("email", "N/A") # "N/A"  — safe with default

# Write
d["email"] = "alice@example.com"
d.setdefault("score", 0)   # set only if key absent, return the value

# Delete
del d["age"]
value = d.pop("email")          # remove & return
value = d.pop("missing", None)  # safe pop with default

# Merge (3.9+)
merged = d1 | d2          # new dict
d1 |= d2                  # in-place update
```

### Iterating

```python
d = {"a": 1, "b": 2, "c": 3}

# Keys (default iteration)
for key in d:
    ...

# Values
for val in d.values():
    ...

# Key-value pairs
for key, val in d.items():
    ...

# Sorted by key
for key in sorted(d):
    ...
```

### dict operations

```python
d = {"a": 1, "b": 2}

len(d)          # 2
"a" in d        # True — key membership
d.keys()        # dict_keys view
d.values()      # dict_values view
d.items()       # dict_items view
d.copy()        # shallow copy
d.update({"c": 3})  # merge another dict in-place
d.clear()       # remove all keys
```

---

## 9. Sets

Sets hold **unordered unique** elements. Useful for deduplication and membership tests.

```python
# Create
s = {1, 2, 3}
s = set([1, 2, 2, 3])   # {1, 2, 3}  — duplicates removed
empty = set()            # NOT {}  — that's an empty dict

# Mutate
s.add(4)
s.discard(10)   # remove if present — no error if absent
s.remove(2)     # remove — raises KeyError if absent
s.pop()         # remove & return an arbitrary element

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b           # union         {1,2,3,4,5,6}
a & b           # intersection  {3,4}
a - b           # difference    {1,2}
a ^ b           # symmetric diff {1,2,5,6}

# Membership
3 in s          # True  — O(1) average

# Frozenset — immutable, can be used as dict key
fs = frozenset([1, 2, 3])
```

---

## 10. Control Flow — `if` / `elif` / `else`

```python
score = 85

# Basic if/elif/else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

# Ternary (conditional expression)
label = "pass" if score >= 60 else "fail"

# Structural pattern matching — match/case (3.10+)
command = "quit"

match command:
    case "quit" | "exit":
        print("Goodbye")
    case "help":
        print("Available commands: ...")
    case _:
        print(f"Unknown: {command}")

# Pattern matching with capture
match point:
    case (0, 0):
        print("Origin")
    case (x, 0):
        print(f"On x-axis at {x}")
    case (x, y):
        print(f"At ({x}, {y})")
```

---

## 11. Loops — `for` / `while`

### `for` loop

```python
# Iterate a list
for item in [10, 20, 30]:
    print(item)

# Iterate with index
for i, item in enumerate(["a", "b", "c"]):
    print(i, item)   # 0 a / 1 b / 2 c

# Iterate with custom start index
for i, item in enumerate(["a", "b"], start=1):
    print(i, item)   # 1 a / 2 b

# Iterate two sequences in parallel
for name, score in zip(names, scores):
    print(name, score)

# Iterate a range
for i in range(5):         # 0 1 2 3 4
    ...
for i in range(1, 10, 2):  # 1 3 5 7 9
    ...

# Iterate a dict
for key, value in d.items():
    ...

# Iterate in reverse
for item in reversed(lst):
    ...
```

### `while` loop

```python
count = 0
while count < 5:
    print(count)
    count += 1

# Infinite loop with break condition
while True:
    data = read_input()
    if data is None:
        break
    process(data)
```

### Loop control

```python
# break   — exit the loop immediately
# continue — skip to the next iteration
# else    — runs only if the loop completed without a break

for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            break
    else:
        # Only reached if inner loop never broke
        print(f"{n} is prime")
```

---

## 12. Comprehensions

### List comprehension

```python
# [expression  for item in iterable  if condition]
squares = [x**2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]

# Nested comprehension
matrix = [[1, 2, 3], [4, 5, 6]]
flat   = [cell for row in matrix for cell in row]
```

### Dict comprehension

```python
# {key_expr: val_expr  for item in iterable  if condition}
word_len  = {word: len(word) for word in ["apple", "kiwi", "banana"]}
inverted  = {v: k for k, v in original.items()}
```

### Set comprehension

```python
# {expression  for item in iterable}
unique_lens = {len(word) for word in words}
```

### Generator expression

```python
# (expression  for item in iterable) — lazy, memory-efficient
total = sum(x**2 for x in range(1_000_000))
first = next(x for x in data if x > 100)
```

---

## 13. Functions

### Defining functions

```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

# Default argument values — mutable defaults are a trap (see tip below)
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Mutable default trap — don't do this
def bad(items=[]):
    items.append(1)    # same list shared across all calls!
    return items

# Correct pattern — use None and create inside
def good(items=None):
    if items is None:
        items = []
    items.append(1)
    return items
```

### Positional, keyword, and variadic arguments

```python
# *args collects extra positional arguments as a tuple
def log(level, *messages):
    for msg in messages:
        print(f"[{level}] {msg}")

log("INFO", "started", "connected")

# **kwargs collects extra keyword arguments as a dict
def configure(**settings):
    for key, val in settings.items():
        print(f"{key} = {val}")

configure(debug=True, timeout=30)

# Keyword-only arguments — must be passed by name
def query(table, *, limit=100, offset=0):
    ...

query("users", limit=50)       # OK
query("users", 50)             # TypeError

# Positional-only arguments (3.8+) — before the /
def add(x, y, /):
    return x + y

add(1, 2)           # OK
add(x=1, y=2)       # TypeError
```

### Argument unpacking

```python
def add(a, b, c):
    return a + b + c

args   = [1, 2, 3]
kwargs = {"a": 1, "b": 2, "c": 3}

# Unpack list/tuple into positional args
add(*args)

# Unpack dict into keyword args
add(**kwargs)
```

### Docstrings

```python
def divide(a: float, b: float) -> float:
    """Divide a by b.

    Args:
        a: The numerator.
        b: The denominator.

    Returns:
        The result of a / b.

    Raises:
        ZeroDivisionError: If b is zero.
    """
    if b == 0:
        raise ZeroDivisionError("b must not be zero")
    return a / b
```

---

## 14. Lambda & Higher-Order Functions

### Lambda — anonymous one-expression function

```python
# lambda <params>: <expression>
square = lambda x: x ** 2
add    = lambda x, y: x + y

# Most useful as a sort key or callback
names.sort(key=lambda s: s.lower())
```

### `map`, `filter`, `reduce`

```python
from functools import reduce

nums = [1, 2, 3, 4, 5]

# Apply function to every item — returns an iterator
doubled  = list(map(lambda x: x * 2, nums))

# Keep items where function returns True — returns an iterator
odds     = list(filter(lambda x: x % 2, nums))

# Accumulate to a single value
product  = reduce(lambda acc, x: acc * x, nums)  # 120
```

### `functools` utilities

```python
from functools import partial, lru_cache, cache

# Partial application — fix some arguments
def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube   = partial(power, exp=3)
square(5)   # 25

# Memoize with LRU cache
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

# cache is lru_cache with unlimited size (3.9+)
@cache
def expensive(n):
    ...
```

---

## 15. Decorators

### What a decorator does

```python
# A decorator wraps a function to add behaviour before/after it runs

import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)

# Equivalent to:  slow_function = timer(slow_function)
```

### Preserving metadata with `functools.wraps`

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)   # copies __name__, __doc__, etc. from func to wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### Decorator with arguments

```python
def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def hello():
    print("Hello!")
```

### Class-based decorator

```python
class memoize:
    def __init__(self, func):
        self.func  = func
        self.cache = {}

    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]
```

---

## 16. Classes & OOP

### Class definition

```python
class Animal:
    # Class attribute — shared by all instances
    kingdom = "Animalia"

    def __init__(self, name: str, sound: str):
        # Instance attributes — unique per object
        self.name  = name
        self.sound = sound

    def speak(self) -> str:
        return f"{self.name} says {self.sound}"

    def __repr__(self) -> str:
        return f"Animal(name={self.name!r}, sound={self.sound!r})"

    def __str__(self) -> str:
        return self.name
```

### Class methods & static methods

```python
class Temperature:
    def __init__(self, celsius: float):
        self.celsius = celsius

    # classmethod — receives the class (cls), not an instance
    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        return cls((f - 32) * 5 / 9)

    # staticmethod — no implicit first argument
    @staticmethod
    def is_valid(celsius: float) -> bool:
        return celsius >= -273.15

    @property
    def fahrenheit(self) -> float:
        return self.celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, f: float):
        self.celsius = (f - 32) * 5 / 9
```

### Dunder (magic) methods

| Method | Purpose |
|--------|---------|
| `__init__` | Constructor |
| `__repr__` | Unambiguous string (for debugging) |
| `__str__` | Human-readable string |
| `__len__` | `len(obj)` |
| `__getitem__` | `obj[key]` |
| `__setitem__` | `obj[key] = val` |
| `__contains__` | `item in obj` |
| `__iter__` | `for x in obj` |
| `__next__` | Advance iterator |
| `__eq__` | `==` comparison |
| `__lt__` / `__gt__` | `<` / `>` comparison |
| `__add__` | `+` operator |
| `__enter__` / `__exit__` | `with` statement |
| `__call__` | `obj()` |

### Encapsulation conventions

| Convention | Meaning |
|------------|---------|
| `name` | Public — part of the API |
| `_name` | Internal — by convention, don't use outside the class/module |
| `__name` | Name-mangled to `_ClassName__name` — prevents accidental subclass collision |
| `__name__` | Dunder — reserved for Python's own protocols |

```python
class BankAccount:
    def __init__(self, balance: float):
        self.owner   = "Alice"        # public
        self._ledger = []             # internal (convention, not enforced)
        self.__balance = balance      # mangled to _BankAccount__balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.__balance += amount
        self._ledger.append(("deposit", amount))

    @property
    def balance(self) -> float:
        return self.__balance

    @balance.setter
    def balance(self, value: float) -> None:
        if value < 0:
            raise ValueError("balance cannot be negative")
        self.__balance = value

acc = BankAccount(100)
acc.balance                    # 100  — via @property getter
acc.balance = 200              # via @balance.setter
# acc.__balance                # AttributeError — mangled name hidden
acc._BankAccount__balance      # 200  — reachable, but don't rely on it
```

### Operator overloading

```python
class Vector:
    def __init__(self, x: float, y: float):
        self.x, self.y = x, y

    # + operator
    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    # - operator
    def __sub__(self, other: "Vector") -> "Vector":
        return Vector(self.x - other.x, self.y - other.y)

    # * scalar:  v * 3
    def __mul__(self, scalar: float) -> "Vector":
        return Vector(self.x * scalar, self.y * scalar)

    # Reflected operand so  3 * v  also works
    __rmul__ = __mul__

    # Unary negation
    def __neg__(self) -> "Vector":
        return Vector(-self.x, -self.y)

    # abs() — Euclidean magnitude
    def __abs__(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

    # bool() — False for zero vector
    def __bool__(self) -> bool:
        return self.x != 0 or self.y != 0

    # == comparison
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    # Required if you define __eq__ and want the object to be hashable
    def __hash__(self) -> int:
        return hash((self.x, self.y))

    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v1 + v2              # Vector(4, 6)
3 * v1               # Vector(3, 6)
abs(v2)              # 5.0
bool(Vector(0, 0))   # False
```

### Dynamic attribute access

```python
# __getattr__       called only when normal attribute lookup FAILS
# __setattr__       called on every  obj.attr = value
# __delattr__       called on every  del obj.attr
# __getattribute__  called on EVERY attribute read — override with extreme care

class DotDict:
    """Access dict keys via dot-attribute syntax."""

    def __init__(self, data: dict):
        # Must bypass our own __setattr__ to avoid infinite recursion
        object.__setattr__(self, "_data", data)

    def __getattr__(self, name: str):
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(name)

    def __setattr__(self, name: str, value):
        self._data[name] = value

    def __delattr__(self, name: str):
        try:
            del self._data[name]
        except KeyError:
            raise AttributeError(name)

cfg = DotDict({"host": "localhost", "port": 5432})
cfg.host          # "localhost"
cfg.timeout = 30  # added to _data
del cfg.port
```

### Descriptors — reusable attribute validation

```python
# A descriptor is a class that defines __get__, __set__, or __delete__
# and is assigned as a class-level attribute.
# Python calls these hooks automatically on attribute access.

class TypedAttr:
    """Enforce a type on any class attribute."""

    def __set_name__(self, owner, name):
        # Automatically called when the owning class body is executed
        self.name    = name
        self.private = f"_{name}"

    def __init__(self, expected_type: type):
        self.expected_type = expected_type

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self          # return descriptor itself when accessed on the class
        return getattr(obj, self.private, None)

    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} must be {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        setattr(obj, self.private, value)

class Config:
    host    = TypedAttr(str)
    port    = TypedAttr(int)
    retries = TypedAttr(int)

    def __init__(self, host: str, port: int, retries: int = 3):
        self.host    = host
        self.port    = port
        self.retries = retries

cfg = Config("localhost", 5432)
cfg.port = "oops"   # TypeError: port must be int, got str
```

---

## 17. Inheritance & Mixins

### Single inheritance

```python
class Dog(Animal):
    def __init__(self, name: str, breed: str):
        # Call parent __init__
        super().__init__(name, "Woof")
        self.breed = breed

    # Override parent method
    def speak(self) -> str:
        return f"{super().speak()}! (tail wagging)"
```

### Multiple inheritance & MRO

```python
# Python resolves method lookup with C3 linearization (MRO)
class Flyable:
    def move(self):
        return "flying"

class Swimmable:
    def move(self):
        return "swimming"

class Duck(Flyable, Swimmable):
    ...

Duck().move()         # "flying" — Flyable comes first in MRO
Duck.__mro__          # (Duck, Flyable, Swimmable, object)
```

### Abstract base classes

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        ...

    @abstractmethod
    def perimeter(self) -> float:
        ...

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        import math
        return 2 * math.pi * self.radius
```

### Mixin pattern

```python
# A mixin provides reusable behaviour through multiple inheritance
# without being a standalone class. Convention: suffix with "Mixin".

class JsonMixin:
    """Add JSON serialisation/deserialisation to any class with __dict__."""

    def to_json(self) -> str:
        import json
        return json.dumps(self.__dict__, default=str, indent=2)

    @classmethod
    def from_json(cls, json_str: str):
        import json
        return cls(**json.loads(json_str))

class LogMixin:
    """Give each class its own named logger."""

    @property
    def log(self):
        import logging
        return logging.getLogger(type(self).__name__)

class TimestampMixin:
    """Record creation time automatically."""

    def __init__(self, *args, **kwargs):
        from datetime import datetime
        super().__init__(*args, **kwargs)
        self.created_at = datetime.now().isoformat()

class User(JsonMixin, LogMixin, TimestampMixin):
    def __init__(self, name: str, email: str):
        super().__init__()
        self.name  = name
        self.email = email

u = User("Alice", "alice@example.com")
u.to_json()            # '{"name": "Alice", "email": "...", "created_at": "..."}'
u.log.info("created")  # logger named "User"
```

### `super()` in depth

```python
# super() returns a proxy that delegates to the NEXT class in the MRO.
# Always call super().__init__() so the full chain runs.

class A:
    def greet(self):
        print("A")
        super().greet()

class B:
    def greet(self):
        print("B")

class C(A, B):
    def greet(self):
        print("C")
        super().greet()   # delegates to A per MRO: C → A → B → object

C().greet()       # prints: C  A  B
C.__mro__         # (C, A, B, object)
```

### Protocol — structural subtyping

```python
from typing import Protocol, runtime_checkable

# Any class that has the required methods satisfies the Protocol
# without needing to inherit from it.

@runtime_checkable
class Serializable(Protocol):
    def to_bytes(self) -> bytes: ...
    def from_bytes(self, data: bytes) -> None: ...

class Message:
    def to_bytes(self) -> bytes:
        return b"hello"
    def from_bytes(self, data: bytes) -> None:
        pass

isinstance(Message(), Serializable)   # True  (requires @runtime_checkable)

def send(obj: Serializable) -> None:
    ...

send(Message())   # type-checker accepts this
```

### Composition vs inheritance

```python
# Use inheritance for "is-a"; use composition for "has-a".
# Composition keeps classes smaller and behaviour easier to swap.

class Engine:
    def start(self) -> None: ...

class Car:
    def __init__(self, engine: Engine | None = None):
        self.engine = engine or Engine()   # HAS-A Engine

    def start(self) -> None:
        self.engine.start()

# Swap engine at runtime without touching Car
class ElectricEngine(Engine):
    def start(self) -> None:
        print("silent start")

car = Car(engine=ElectricEngine())
```

---

## 18. Exceptions & Error Handling

### try / except / else / finally

```python
# Basic exception handling
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")

# Catch multiple exception types
try:
    value = int(input("Enter number: "))
except (ValueError, TypeError) as e:
    print(f"Invalid input: {e}")

# else — runs only if no exception was raised
# finally — always runs (cleanup)
try:
    f = open("data.txt")
    data = f.read()
except FileNotFoundError:
    data = ""
else:
    print(f"Read {len(data)} bytes")
finally:
    f.close()  # prefer 'with' instead (see section 19)

# Re-raise the current exception
try:
    risky()
except Exception:
    log_error()
    raise   # re-raises the original exception

# Chain exceptions
try:
    connect()
except ConnectionError as e:
    raise RuntimeError("Service unavailable") from e
```

### Custom exceptions

```python
class AppError(Exception):
    """Base class for application exceptions."""

class ValidationError(AppError):
    def __init__(self, field: str, message: str):
        self.field = field
        super().__init__(f"{field}: {message}")

class NotFoundError(AppError):
    pass

# Raise
raise ValidationError("email", "invalid format")
```

### Common built-in exceptions

| Exception | When raised |
|-----------|-------------|
| `ValueError` | Right type, wrong value |
| `TypeError` | Wrong type |
| `KeyError` | Dict key missing |
| `IndexError` | List index out of range |
| `AttributeError` | Attribute doesn't exist |
| `FileNotFoundError` | File/dir missing |
| `PermissionError` | No OS permission |
| `OSError` | General OS error |
| `ZeroDivisionError` | Divide by zero |
| `OverflowError` | Number too large |
| `RecursionError` | Max recursion depth |
| `StopIteration` | Iterator exhausted |
| `NotImplementedError` | Abstract method called |
| `RuntimeError` | Generic runtime problem |

---

## 19. Context Managers — `with`

### Using built-in context managers

```python
# File automatically closed even if an exception is raised
with open("data.txt", "r") as f:
    content = f.read()

# Open multiple resources in one with statement
with open("src.txt") as src, open("dst.txt", "w") as dst:
    dst.write(src.read())
```

### Writing a context manager with `contextlib`

```python
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    import time
    start = time.perf_counter()
    try:
        yield              # code inside 'with' runs here
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("database query"):
    run_query()
```

### Class-based context manager

```python
class ManagedFile:
    def __init__(self, path, mode="r"):
        self.path = path
        self.mode = mode

    def __enter__(self):
        self.handle = open(self.path, self.mode)
        return self.handle

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.handle.close()
        # return True to suppress the exception, False to propagate it
        return False
```

---

## 20. Modules & Packages

### Importing

```python
# Import the module — access via module.name
import os
import os.path

os.getcwd()
os.path.join("a", "b")

# Import specific names
from os.path import join, exists

join("a", "b")
exists("/etc")

# Import with alias
import numpy as np
from datetime import datetime as dt

# Import all public names (avoid in production — pollutes namespace)
from math import *
```

### Package structure

```
mypackage/
├── __init__.py        # marks the directory as a package; can be empty
├── core.py
├── utils.py
└── subpackage/
    ├── __init__.py
    └── helpers.py
```

```python
# Absolute import (always preferred)
from mypackage.utils import helper_func
from mypackage.subpackage.helpers import do_thing

# Relative import — only inside a package
from . import utils          # sibling module
from .utils import helper    # name from sibling
from ..core import base      # parent package
```

### `__init__.py` — control public API

```python
# mypackage/__init__.py
from .core import MainClass
from .utils import helper_func

# Callers can now do:  from mypackage import MainClass
__all__ = ["MainClass", "helper_func"]
```

---

## 21. File I/O

### Reading files

```python
# Read entire file as string
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Read line by line — memory-efficient for large files
with open("data.txt") as f:
    for line in f:
        print(line.rstrip())

# Read all lines into a list
with open("data.txt") as f:
    lines = f.readlines()    # includes newlines
    lines = f.read().splitlines()  # no newlines, preferred
```

### Writing files

```python
# Write (overwrites if file exists)
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")
    f.writelines(["line1\n", "line2\n"])

# Append
with open("log.txt", "a") as f:
    f.write("new entry\n")
```

### `pathlib` — modern path handling (3.4+)

```python
from pathlib import Path

# Build paths
p = Path("/home/alice/docs")
p = Path.home() / "docs" / "report.txt"   # / operator joins paths

# Inspect
p.name          # "report.txt"
p.stem          # "report"
p.suffix        # ".txt"
p.parent        # Path("/home/alice/docs")
p.exists()      # True/False
p.is_file()     # True/False
p.is_dir()      # True/False
p.stat().st_size  # file size in bytes

# Create / delete
p.mkdir(parents=True, exist_ok=True)
p.touch()                   # create empty file
p.unlink(missing_ok=True)   # delete file  (3.8+)
p.rmdir()                   # delete empty dir

# Read / write
text = p.read_text(encoding="utf-8")
p.write_text("content", encoding="utf-8")
data = p.read_bytes()
p.write_bytes(b"\x00\x01")

# Glob
list(p.glob("*.py"))         # files matching pattern in dir
list(p.rglob("*.py"))        # recursive

# Iterate directory
for child in p.iterdir():
    print(child)
```

### JSON

```python
import json

# Serialize to string / file
json_str  = json.dumps(data, indent=2)
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Deserialize from string / file
data = json.loads(json_str)
with open("data.json") as f:
    data = json.load(f)
```

### CSV

```python
import csv

# Write CSV
with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age"])
    writer.writeheader()
    writer.writerows([{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}])

# Read CSV
with open("data.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], row["age"])
```

---

## 22. Iterators & Generators

### Custom iterator

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

list(Countdown(3))   # [3, 2, 1]
```

### Generator function

```python
# yield pauses the function and returns a value; resumes on next()
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)   # 3 2 1

# Generator with send() — coroutine-style
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

gen = accumulator()
next(gen)        # prime the generator
gen.send(10)     # 10
gen.send(20)     # 30
```

### `yield from` — delegate to sub-generator

```python
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4], [5]))   # [1, 2, 3, 4, 5]
```

### `itertools` — essential tools

```python
import itertools as it

it.count(10)                    # 10 11 12 …  (infinite)
it.cycle([1, 2, 3])             # 1 2 3 1 2 3 …  (infinite)
it.repeat(0, 5)                 # 0 0 0 0 0
it.chain([1, 2], [3, 4])        # 1 2 3 4
it.islice(range(100), 5)        # 0 1 2 3 4  — take first N
it.takewhile(lambda x: x<5, range(10))   # 0 1 2 3 4
it.dropwhile(lambda x: x<5, range(10))   # 5 6 7 8 9
it.compress([1,2,3,4], [1,0,1,0])        # 1 3
it.groupby(sorted_data, key=lambda x: x["dept"])  # group by key
it.combinations([1,2,3], 2)              # (1,2) (1,3) (2,3)
it.permutations([1,2,3], 2)              # (1,2) (1,3) (2,1) …
it.product([1,2], [3,4])                 # (1,3) (1,4) (2,3) (2,4)
list(it.batched([1,2,3,4,5], 2))         # [(1,2),(3,4),(5,)]  (3.12+)
```

---

## 23. Type Hints & Annotations

### Basic annotations

```python
# Variables (PEP 526)
name: str = "Alice"
count: int = 0
mapping: dict[str, int] = {}   # 3.9+ — built-in generics
items: list[str] = []

# Function signatures
def greet(name: str, times: int = 1) -> str:
    return (name + "\n") * times

# None return type
def log(msg: str) -> None:
    print(msg)
```

### `typing` module (pre-3.9 generics; still useful for complex types)

```python
from typing import (
    Any, Union, Optional, Callable,
    Tuple, Dict, List, Set,
    TypeVar, Generic, Literal, Final,
    ClassVar, Protocol,
)

# Optional[X] is shorthand for Union[X, None]
def find(key: str) -> Optional[str]:
    ...

# Union — 3.10+ supports X | Y syntax
def process(data: int | str) -> None:
    ...

# Callable[[arg_types], return_type]
handler: Callable[[str, int], bool]

# TypeVar — generic functions
T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

# Protocol — structural subtyping (duck typing)
from typing import Protocol

class Closeable(Protocol):
    def close(self) -> None: ...
```

### Literal & Final

```python
from typing import Literal, Final

# Literal — restrict to specific values
def set_direction(d: Literal["north", "south", "east", "west"]) -> None:
    ...

# Final — signal that a variable must not be reassigned
MAX: Final = 100
```

### Running type checks

```bash
# Install mypy
pip install mypy

# Check a file or package
mypy script.py
mypy src/
mypy --strict src/   # strictest mode
```

---

## 24. Dataclasses

Dataclasses auto-generate `__init__`, `__repr__`, `__eq__` and more.

```python
from dataclasses import dataclass, field, asdict, astuple, replace

@dataclass
class Point:
    x: float
    y: float
    label: str = ""             # field with default

@dataclass
class Config:
    host: str = "localhost"
    port: int = 5432
    # Mutable default must use field(default_factory=...)
    tags: list[str] = field(default_factory=list)

# Frozen — immutable (generates __hash__)
@dataclass(frozen=True)
class Vector:
    x: float
    y: float

# Order — generates __lt__, __le__, __gt__, __ge__
@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

# Utilities
p = Point(1, 2, "origin")
asdict(p)          # {'x': 1, 'y': 2, 'label': 'origin'}
astuple(p)         # (1, 2, 'origin')
replace(p, label="moved")   # creates a modified copy
```

---

## 25. Standard Library Highlights

### `collections`

```python
from collections import (
    Counter, defaultdict, deque, OrderedDict, ChainMap
)

# Counter — count hashable items
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
c = Counter(words)
c.most_common(2)     # [('apple', 3), ('banana', 2)]
c["apple"]           # 3

# defaultdict — auto-creates missing keys
groups = defaultdict(list)
for item in data:
    groups[item.category].append(item)

# deque — O(1) appends and pops from both ends
dq = deque([1, 2, 3], maxlen=5)
dq.appendleft(0)
dq.popleft()
dq.rotate(1)         # rotate right

# ChainMap — layered dict lookup
defaults = {"color": "red", "size": "medium"}
user_prefs = {"color": "blue"}
merged = ChainMap(user_prefs, defaults)
merged["color"]   # "blue" — user_prefs wins
merged["size"]    # "medium" — fallback to defaults
```

### `datetime`

```python
from datetime import date, time, datetime, timedelta, timezone

# Create
today = date.today()
now   = datetime.now()
utcnow = datetime.now(timezone.utc)

d = date(2024, 6, 15)
dt = datetime(2024, 6, 15, 12, 30, 0)

# Arithmetic
dt + timedelta(days=7, hours=3)
dt - timedelta(weeks=2)
delta = dt2 - dt1   # timedelta
delta.days
delta.total_seconds()

# Formatting / parsing
dt.strftime("%Y-%m-%d %H:%M:%S")    # "2024-06-15 12:30:00"
datetime.strptime("2024-06-15", "%Y-%m-%d")
dt.isoformat()                       # "2024-06-15T12:30:00"
datetime.fromisoformat("2024-06-15T12:30:00")
```

### `re` — regular expressions

```python
import re

# Compile once, use many times
pattern = re.compile(r"\d{4}-\d{2}-\d{2}")

# Search — find first match anywhere
m = pattern.search("Today is 2024-06-15 and tomorrow 2024-06-16")
m.group()    # "2024-06-15"
m.start()    # index of match start
m.end()      # index of match end

# Match — anchored to start of string
m = re.match(r"\d+", "42abc")
m.group()    # "42"

# Find all matches
pattern.findall("2024-01-01 and 2024-12-31")   # ['2024-01-01', '2024-12-31']

# Find all as match objects
for m in pattern.finditer("2024-01-01 and 2024-12-31"):
    print(m.group(), m.start())

# Substitute
re.sub(r"\d+", "N", "abc123def456")   # "abcNdefN"

# Groups
m = re.match(r"(\w+)\s(\w+)", "Hello World")
m.group(0)    # "Hello World" — full match
m.group(1)    # "Hello"
m.group(2)    # "World"
m.groups()    # ("Hello", "World")

# Named groups
m = re.match(r"(?P<year>\d{4})-(?P<month>\d{2})", "2024-06")
m.group("year")   # "2024"

# Flags
re.search(r"hello", "HELLO", re.IGNORECASE)
re.MULTILINE   # ^ and $ match line boundaries
re.DOTALL      # . matches newlines too
re.VERBOSE     # allow whitespace and comments in pattern
```

### `subprocess`

```python
import subprocess

# Run and capture output (3.7+)
result = subprocess.run(
    ["ls", "-la"],
    capture_output=True,
    text=True,           # decode bytes to str
    check=True,          # raise CalledProcessError on non-zero exit
)
print(result.stdout)
print(result.returncode)

# Shell command as string (use only with trusted input — shell injection risk)
subprocess.run("echo hello", shell=True)

# Pipe input to stdin
result = subprocess.run(["sort"], input="banana\napple\ncherry\n", text=True, capture_output=True)
print(result.stdout)
```

### `logging`

```python
import logging

# Basic setup
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(name)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.exception("Error with traceback", exc_info=True)

# Structured handler setup
handler = logging.FileHandler("app.log")
handler.setLevel(logging.WARNING)
logger.addHandler(handler)
```

### `os` & `sys`

```python
import os, sys

# Environment variables
os.environ.get("HOME", "/tmp")
os.getenv("PATH")

# Process
os.getpid()
os.getppid()
sys.argv            # command-line arguments as list; argv[0] is the script name
sys.exit(0)         # exit with code

# Working directory
os.getcwd()
os.chdir("/tmp")

# Directory listing
os.listdir(".")

# Path joining (prefer pathlib)
os.path.join("a", "b", "c.txt")
os.path.exists("/etc/hosts")
os.path.abspath("relative/path")
os.path.dirname("/a/b/c.txt")   # "/a/b"
os.path.basename("/a/b/c.txt")  # "c.txt"
os.path.splitext("file.tar.gz") # ('file.tar', '.gz')
```

---

## 26. Virtual Environments & pip

### Create and activate

```bash
# Create virtual environment
python -m venv .venv

# Activate
# Linux / macOS
source .venv/bin/activate

# Windows (cmd)
.venv\Scripts\activate.bat

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Deactivate
deactivate
```

### pip — package management

```bash
# Install
pip install requests
pip install "requests>=2.28,<3"
pip install -r requirements.txt
pip install -e .              # install in editable mode (for local packages)

# Upgrade
pip install --upgrade requests
pip install --upgrade pip

# Uninstall
pip uninstall requests

# List / inspect
pip list
pip show requests
pip list --outdated

# Freeze installed packages to a file
pip freeze > requirements.txt
```

### `pyproject.toml` — modern project metadata

```toml
[project]
name = "myapp"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.backends.legacy:build"
```

---

## 27. Testing — `unittest` / `pytest`

### `unittest` — built-in framework

```python
import unittest

class TestMath(unittest.TestCase):

    def setUp(self):
        """Runs before each test method."""
        self.data = [1, 2, 3]

    def tearDown(self):
        """Runs after each test method."""
        pass

    def test_sum(self):
        self.assertEqual(sum(self.data), 6)

    def test_max(self):
        self.assertGreater(max(self.data), 2)

    def test_raises(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0

    @unittest.skip("Not implemented yet")
    def test_future(self):
        ...

if __name__ == "__main__":
    unittest.main()
```

### `pytest` — preferred in practice

```bash
# Install
pip install pytest pytest-cov

# Run tests
pytest                     # discover and run all tests
pytest test_math.py        # specific file
pytest test_math.py::test_sum   # specific test
pytest -v                  # verbose output
pytest -x                  # stop after first failure
pytest -k "sum or max"     # run tests matching keyword expression
pytest --tb=short          # shorter tracebacks
pytest --cov=src --cov-report=term-missing   # coverage report
```

```python
# pytest-style test — no class required
import pytest

def add(a, b):
    return a + b

def test_add_integers():
    assert add(1, 2) == 3

def test_add_strings():
    assert add("a", "b") == "ab"

def test_raises():
    with pytest.raises(TypeError):
        add(1, "x")

# Parametrize — run one test with many inputs
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# Fixtures — reusable setup
@pytest.fixture
def sample_data():
    return {"name": "Alice", "score": 95}

def test_score(sample_data):
    assert sample_data["score"] > 90

# Fixture with teardown
@pytest.fixture
def db_connection():
    conn = create_connection()
    yield conn        # test runs here
    conn.close()      # teardown
```

---

## 28. Concurrency — `threading` / `multiprocessing` / `asyncio`

### `threading` — I/O-bound tasks

```python
import threading

def worker(n):
    print(f"Thread {n} starting")

# Create and start threads
threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()   # wait for all to finish

# Thread with shared state — protect with a Lock
counter = 0
lock = threading.Lock()

def increment():
    global counter
    with lock:
        counter += 1

# Thread pool — simpler than managing threads manually
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(worker, i) for i in range(10)]
    results = [f.result() for f in futures]
```

### `multiprocessing` — CPU-bound tasks (bypasses the GIL)

```python
from multiprocessing import Process, Pool, Queue
from concurrent.futures import ProcessPoolExecutor

# ProcessPoolExecutor — simplest API
def cpu_task(n):
    return n ** 2

with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_task, range(10)))
```

### `asyncio` — concurrent I/O without threads

```python
import asyncio
import aiohttp   # async HTTP client

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = ["https://httpbin.org/get"] * 5

    async with aiohttp.ClientSession() as session:
        # Run coroutines concurrently
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

    return results

# Run the event loop
asyncio.run(main())

# async for / async with
async def read_lines(path):
    async with aiofiles.open(path) as f:
        async for line in f:
            yield line.strip()

# asyncio.Queue — async producer/consumer
async def producer(queue):
    for i in range(10):
        await queue.put(i)
    await queue.put(None)   # sentinel

async def consumer(queue):
    while (item := await queue.get()) is not None:
        print(item)
        queue.task_done()
```

---

## 29. Useful Patterns & Idioms

### Walrus operator `:=` (assignment expression, 3.8+)

```python
# Avoid calling a function twice
if m := re.search(r"\d+", text):
    print(m.group())

# Consume in a while loop without repetition
while chunk := f.read(8192):
    process(chunk)

# Filter and transform in one pass
results = [cleaned for line in lines if (cleaned := line.strip())]
```

### Merging dicts / lists

```python
# Merge dicts — later keys win
merged = {**defaults, **overrides}          # 3.5+
merged = defaults | overrides               # 3.9+

# Flatten a list of lists
flat = [item for sublist in nested for item in sublist]
flat = list(itertools.chain.from_iterable(nested))
```

### Enum

```python
from enum import Enum, auto, Flag

class Direction(Enum):
    NORTH = "N"
    SOUTH = "S"
    EAST  = "E"
    WEST  = "W"

Direction.NORTH.value    # "N"
Direction.NORTH.name     # "NORTH"
Direction("N")           # Direction.NORTH  — lookup by value

# auto() — assign values automatically
class Status(Enum):
    PENDING  = auto()   # 1
    RUNNING  = auto()   # 2
    DONE     = auto()   # 3

# Flag — supports bitwise combination
class Permission(Flag):
    READ    = auto()
    WRITE   = auto()
    EXECUTE = auto()
    ALL = READ | WRITE | EXECUTE

perm = Permission.READ | Permission.WRITE
Permission.READ in perm   # True
```

### `slots` for memory-efficient classes

```python
class Point:
    __slots__ = ("x", "y")   # blocks __dict__, saves per-instance memory

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

### Safe dict / attribute access patterns

```python
# getattr with default — never raises AttributeError
value = getattr(obj, "attribute", default_value)

# dict .get with default
value = d.get("missing_key", "default")

# Null-coalescing idiom
result = maybe_none or fallback

# Conditional expression on None
result = value if value is not None else fallback
```

### Context-sensitive resource cleanup

```python
from contextlib import suppress, ExitStack

# Suppress specific exceptions cleanly
with suppress(FileNotFoundError):
    os.unlink("temp_file.txt")

# Open a variable number of files
with ExitStack() as stack:
    files = [stack.enter_context(open(p)) for p in paths]
    data = [f.read() for f in files]
```

### Retry with exponential back-off

```python
import time

def retry(func, *, attempts=3, delay=1.0, backoff=2.0, exceptions=(Exception,)):
    last_exc = None
    for attempt in range(1, attempts + 1):
        try:
            return func()
        except exceptions as e:
            last_exc = e
            if attempt < attempts:
                time.sleep(delay)
                delay *= backoff
    raise last_exc
```

### Singleton pattern

```python
class Singleton:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

---

## 31. `argparse` — Full CLI Reference

`argparse` is the standard library module for building command-line interfaces. It generates `--help` automatically and handles type conversion, defaults, and error messages.

### Basic parser

```python
import argparse

parser = argparse.ArgumentParser(
    prog="deploy",
    description="Deploy an app to an environment",
    epilog="Example: deploy --env prod myapp",
    # formatter_class=argparse.RawDescriptionHelpFormatter  # keep epilog formatting
)
args = parser.parse_args()
```

### Positional arguments

```python
# Positional — required, consumed in order
parser.add_argument("source", help="source directory")
parser.add_argument("dest",   help="destination directory")

# python script.py /src /dst  →  args.source='/src'  args.dest='/dst'
```

### Optional arguments (flags)

```python
# Boolean flag — True when present
parser.add_argument("-v", "--verbose", action="store_true", help="verbose output")

# Store a value
parser.add_argument("-o", "--output", default="out.txt", help="output file")

# Required option
parser.add_argument("-e", "--env", required=True, choices=["dev", "staging", "prod"])

# Type conversion
parser.add_argument("-p", "--port", type=int, default=8080)
parser.add_argument("-t", "--timeout", type=float, default=30.0)

# Custom metavar — controls the placeholder shown in --help
parser.add_argument("-f", "--file", metavar="PATH", help="input file")

# Store to a different dest name
parser.add_argument("--log-level", dest="log_level", default="INFO")

# Count occurrences:  -v -v -v  → args.verbosity == 3
parser.add_argument("-v", dest="verbosity", action="count", default=0)

# Append — can be repeated:  -x 1 -x 2  → args.x == ['1', '2']
parser.add_argument("-x", action="append")
```

### nargs — multiple values

```python
# nargs=N        exactly N values
# nargs='?'      0 or 1 value (use const= for the 0-value case)
# nargs='*'      0 or more
# nargs='+'      1 or more
# nargs=argparse.REMAINDER  all remaining args

parser.add_argument("files", nargs="+", help="input files")
parser.add_argument("--point", nargs=2, type=float, metavar=("X", "Y"))

# --output with optional value:  --output  →  const;  --output FILE  →  FILE
parser.add_argument("--output", nargs="?", const="-", default="out.txt")
```

### Argument groups

```python
# Group related options in --help output
conn = parser.add_argument_group("connection options")
conn.add_argument("--host", default="localhost")
conn.add_argument("--port", type=int, default=5432)
conn.add_argument("--user", default="admin")

# Mutually exclusive group — at most one may be given
group = parser.add_mutually_exclusive_group(required=True)
group.add_argument("--start", action="store_true")
group.add_argument("--stop",  action="store_true")
group.add_argument("--restart", action="store_true")
```

### Subparsers (subcommands like `git commit`, `git push`)

```python
subparsers = parser.add_subparsers(dest="command", metavar="COMMAND", required=True)

# 'deploy' subcommand
deploy_p = subparsers.add_parser("deploy", help="deploy the app")
deploy_p.add_argument("app")
deploy_p.add_argument("--env", default="staging")

# 'rollback' subcommand
rollback_p = subparsers.add_parser("rollback", help="roll back the last deploy")
rollback_p.add_argument("--steps", type=int, default=1)

args = parser.parse_args()

if args.command == "deploy":
    print(f"deploying {args.app} to {args.env}")
elif args.command == "rollback":
    print(f"rolling back {args.steps} step(s)")
```

### Reading from a file argument

```python
# argparse.FileType opens the file automatically
parser.add_argument("infile",  type=argparse.FileType("r"), default="-")   # - = stdin
parser.add_argument("outfile", type=argparse.FileType("w"), default="-")   # - = stdout

args = parser.parse_args()
with args.infile:
    data = args.infile.read()
```

### Custom action

```python
import argparse

class SplitAction(argparse.Action):
    """Split a comma-separated string into a list."""

    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, values.split(","))

parser.add_argument("--tags", action=SplitAction, default=[])
# --tags a,b,c  →  args.tags == ['a', 'b', 'c']
```

### Complete script template

```python
#!/usr/bin/env python3
"""Deploy an application to a target environment."""

import argparse
import sys


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("app", help="application name")
    p.add_argument("-e", "--env", default="staging",
                   choices=["dev", "staging", "prod"])
    p.add_argument("-n", "--dry-run", action="store_true",
                   help="print actions without executing them")
    p.add_argument("-v", "--verbose", action="count", default=0)
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    if args.verbose:
        print(f"deploying {args.app!r} → {args.env}")
    if not args.dry_run:
        pass  # actual deploy logic
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

---

## 32. `subprocess` — Running External Processes

### `subprocess.run()` — the standard API

```python
import subprocess

# Run a command and wait for it to finish
result = subprocess.run(["ls", "-la"])

# Capture stdout and stderr as strings
result = subprocess.run(
    ["git", "log", "--oneline", "-5"],
    capture_output=True,   # shorthand for stdout=PIPE, stderr=PIPE
    text=True,             # decode bytes → str using locale encoding
    encoding="utf-8",      # or specify encoding explicitly
    check=True,            # raise CalledProcessError on non-zero exit code
)
print(result.stdout)
print(result.returncode)  # 0 on success

# Pass input to stdin
result = subprocess.run(
    ["sort"],
    input="banana\napple\ncherry\n",
    text=True,
    capture_output=True,
)
print(result.stdout)   # apple\nbanana\ncherry\n

# Set a timeout (seconds) — raises TimeoutExpired if exceeded
result = subprocess.run(["sleep", "5"], timeout=2)
```

### Error handling

```python
from subprocess import CalledProcessError, TimeoutExpired

try:
    result = subprocess.run(
        ["false"],    # exits with code 1
        check=True,
        capture_output=True,
        text=True,
    )
except CalledProcessError as e:
    print(f"command failed: exit {e.returncode}")
    print(f"stderr: {e.stderr}")
except TimeoutExpired as e:
    print(f"timed out after {e.timeout}s")
except FileNotFoundError:
    print("executable not found")
```

### Environment variables and working directory

```python
import os

# Run in a specific directory
subprocess.run(["make", "test"], cwd="/path/to/project", check=True)

# Pass a custom environment
env = os.environ.copy()
env["DEBUG"] = "1"
subprocess.run(["./run.sh"], env=env)

# Completely isolated environment
subprocess.run(["env"], env={"PATH": "/usr/bin"})
```

### Shell commands

```python
# shell=True passes the command to the shell (/bin/sh or cmd.exe)
# ONLY use with fully trusted, non-user-supplied input (shell injection risk)
subprocess.run("echo hello | tr a-z A-Z", shell=True)

# Safer: avoid shell=True, build the pipeline with Popen
```

### `Popen` — full process control

```python
from subprocess import Popen, PIPE

# Long-running process with streaming output
with Popen(["tail", "-f", "/var/log/app.log"], stdout=PIPE, text=True) as proc:
    for line in proc.stdout:
        print(line, end="")
        if "ERROR" in line:
            proc.terminate()
            break

# Two-way communication (send input, read output)
with Popen(["python3", "-c", "import sys; print(sys.stdin.read().upper())"],
           stdin=PIPE, stdout=PIPE, text=True) as proc:
    out, err = proc.communicate(input="hello\n", timeout=5)
    print(out)   # "HELLO\n"

# Pipeline:  ls | grep .py
p1 = Popen(["ls"], stdout=PIPE)
p2 = Popen(["grep", ".py"], stdin=p1.stdout, stdout=PIPE, text=True)
p1.stdout.close()   # allow p1 to receive SIGPIPE if p2 exits
output, _ = p2.communicate()
```

### Reading output line by line (streaming)

```python
# Good for long-running commands where you need output as it arrives
with Popen(
    ["./long_job.sh"],
    stdout=PIPE,
    stderr=PIPE,
    text=True,
    bufsize=1,           # line-buffered
) as proc:
    for line in proc.stdout:
        print(f"[stdout] {line}", end="")
    proc.wait()
    if proc.returncode != 0:
        print(proc.stderr.read())
```

### Common patterns

```python
# Check if a command exists
def command_exists(name: str) -> bool:
    import shutil
    return shutil.which(name) is not None

# Capture a single line of output
def git_branch() -> str:
    return subprocess.check_output(
        ["git", "branch", "--show-current"],
        text=True,
    ).strip()

# Run and discard all output
subprocess.run(["make", "clean"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
```

---

## 33. `threading` — Concurrent Threads

Threads share the same process memory. Best suited for **I/O-bound** tasks. The GIL prevents true CPU parallelism in CPython.

### Creating threads

```python
import threading

def worker(name: str, n: int) -> None:
    print(f"[{name}] working {n}")

# Create and start
t = threading.Thread(target=worker, args=("T1",), kwargs={"n": 5})
t.start()
t.join()   # wait for thread to finish

# Daemon threads — automatically killed when main thread exits
t = threading.Thread(target=worker, args=("bg",), kwargs={"n": 1}, daemon=True)
t.start()

# Subclassing Thread
class MyThread(threading.Thread):
    def run(self):
        print(f"running {self.name}")

# Thread-local storage — each thread sees its own copy
local = threading.local()

def init_connection():
    local.conn = create_db_connection()
```

### Synchronisation primitives

```python
import threading

# Lock — mutual exclusion (only one thread at a time)
lock = threading.Lock()
counter = 0

def increment():
    global counter
    with lock:          # acquire on enter, release on exit
        counter += 1

# RLock — re-entrant lock (same thread can acquire multiple times)
rlock = threading.RLock()

# Event — signal between threads
ready = threading.Event()

def producer():
    prepare_data()
    ready.set()         # signal consumers

def consumer():
    ready.wait()        # block until set()
    use_data()

# Condition — wait for a state change
cond  = threading.Condition()
items = []

def producer():
    with cond:
        items.append("item")
        cond.notify_all()   # wake all waiting consumers

def consumer():
    with cond:
        cond.wait_for(lambda: len(items) > 0)
        print(items.pop())

# Semaphore — limit concurrent access to N
sem = threading.Semaphore(3)   # at most 3 threads at once

with sem:
    use_limited_resource()

# Barrier — all N threads wait until they all arrive
barrier = threading.Barrier(4)

def worker():
    do_phase_one()
    barrier.wait()     # all 4 must reach here before any proceeds
    do_phase_two()
```

### `ThreadPoolExecutor` — managed thread pool

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests   # example I/O-bound work

URLS = ["https://httpbin.org/get?n=1", "https://httpbin.org/get?n=2"]

def fetch(url: str) -> str:
    return requests.get(url, timeout=5).text

# map — maintains input order, raises on first exception
with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, URLS))

# submit — individual futures, handle exceptions per-task
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = {pool.submit(fetch, url): url for url in URLS}

    # as_completed yields each future as soon as it finishes
    for future in as_completed(futures):
        url = futures[future]
        try:
            data = future.result(timeout=10)
            print(f"{url}: {len(data)} bytes")
        except Exception as e:
            print(f"{url} failed: {e}")
```

### Thread-safe queue (producer / consumer)

```python
import queue
import threading

q = queue.Queue(maxsize=10)   # bounded; put() blocks when full

def producer():
    for i in range(20):
        q.put(i)           # blocks if queue is full
    q.put(None)            # sentinel to signal done

def consumer():
    while (item := q.get()) is not None:
        print(f"processing {item}")
        q.task_done()      # signal that item processing is complete

t_prod = threading.Thread(target=producer)
t_cons = threading.Thread(target=consumer)
t_prod.start()
t_cons.start()
t_prod.join()
t_cons.join()

# Wait until all items are processed
q.join()    # blocks until task_done() called for every item
```

### Common pitfalls

```python
# Race condition — missing lock around shared state
# Data race — two threads writing to the same variable simultaneously
# Deadlock  — two threads each holding a lock the other needs
# Starvation — a thread never gets the lock because others always win

# Avoid mutable shared state; prefer immutable data + queues.
# If you need shared state, always protect it with a Lock.
```

---

## 34. `asyncio` & `async`/`await` — Asynchronous I/O

`asyncio` is a **single-threaded, cooperative concurrency** model. Coroutines yield control at `await` points; the event loop runs the next ready coroutine. Best for high-concurrency I/O (thousands of connections).

### Core syntax

```python
import asyncio

# async def creates a coroutine function
async def greet(name: str) -> str:
    await asyncio.sleep(1)    # yields control to event loop
    return f"Hello, {name}!"

# Run the top-level coroutine
result = asyncio.run(greet("Alice"))
print(result)   # "Hello, Alice!"
```

### Tasks — run coroutines concurrently

```python
async def main():
    # create_task schedules a coroutine to run concurrently
    task1 = asyncio.create_task(greet("Alice"), name="task-alice")
    task2 = asyncio.create_task(greet("Bob"),   name="task-bob")

    # await each task to get its result
    r1 = await task1
    r2 = await task2
    print(r1, r2)

asyncio.run(main())
```

### `asyncio.gather` — run many coroutines concurrently

```python
async def fetch(n: int) -> int:
    await asyncio.sleep(n)
    return n * 2

async def main():
    # All three run concurrently; total time ≈ max(1, 2, 3) = 3s not 6s
    results = await asyncio.gather(
        fetch(1),
        fetch(2),
        fetch(3),
        return_exceptions=True,   # exceptions returned as values, not raised
    )
    print(results)   # [2, 4, 6]

asyncio.run(main())
```

### `asyncio.wait` — fine-grained task control

```python
async def main():
    tasks = {asyncio.create_task(fetch(i)) for i in range(5)}

    # Process tasks as they complete
    while tasks:
        done, tasks = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            print(task.result())

    # Other return_when options:
    # asyncio.ALL_COMPLETED    — wait for all (default)
    # asyncio.FIRST_EXCEPTION  — stop at first exception
```

### Timeouts

```python
# asyncio.timeout (3.11+) — preferred
async def with_timeout():
    async with asyncio.timeout(5.0):      # raises TimeoutError after 5s
        await slow_operation()

# asyncio.wait_for — older API, all versions
async def with_wait_for():
    try:
        result = await asyncio.wait_for(slow_operation(), timeout=5.0)
    except asyncio.TimeoutError:
        print("timed out")
```

### `asyncio.Queue` — async producer/consumer

```python
async def producer(queue: asyncio.Queue) -> None:
    for i in range(10):
        await queue.put(i)
        await asyncio.sleep(0.1)
    await queue.put(None)   # sentinel

async def consumer(queue: asyncio.Queue) -> None:
    while (item := await queue.get()) is not None:
        print(f"got {item}")
        queue.task_done()

async def main():
    q = asyncio.Queue(maxsize=5)
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main())
```

### Async synchronisation

```python
lock  = asyncio.Lock()
event = asyncio.Event()
sem   = asyncio.Semaphore(3)   # at most 3 concurrent

async def limited():
    async with sem:
        await do_work()

async def waiter():
    await event.wait()        # suspends until event.set()
    print("event fired")

async def setter():
    await asyncio.sleep(1)
    event.set()
```

### `asyncio.to_thread` — run blocking code without blocking the loop

```python
import asyncio, time

def slow_sync(n: int) -> int:
    time.sleep(n)          # blocks — would freeze the event loop if called directly
    return n * 2

async def main():
    # Runs slow_sync in a thread pool, returns its result as a coroutine
    result = await asyncio.to_thread(slow_sync, 3)
    print(result)   # 6

asyncio.run(main())
```

### Async generators and `async for`

```python
async def ticker(n: int):
    for i in range(n):
        await asyncio.sleep(0.5)
        yield i

async def main():
    async for value in ticker(5):
        print(value)

# Async comprehension
squares = [v**2 async for v in ticker(5)]
```

### `TaskGroup` — structured concurrency (3.11+)

```python
async def main():
    # All tasks are cancelled automatically if any one raises
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch(1))
        task2 = tg.create_task(fetch(2))
        task3 = tg.create_task(fetch(3))

    # Results available after the block exits
    print(task1.result(), task2.result(), task3.result())
```

### Shielding from cancellation

```python
async def cleanup():
    await asyncio.sleep(1)
    print("cleaned up")

async def main():
    # asyncio.shield prevents cleanup() from being cancelled
    # even if main() is cancelled
    try:
        await asyncio.shield(cleanup())
    except asyncio.CancelledError:
        print("main was cancelled, but cleanup continues")
```

### When to use what

| Scenario | Best tool |
|----------|-----------|
| High-concurrency I/O (HTTP, DB, sockets) | `asyncio` |
| I/O-bound, existing blocking libraries | `threading` + `ThreadPoolExecutor` |
| CPU-bound work | `multiprocessing` + `ProcessPoolExecutor` |
| Simple script with a few external commands | `subprocess.run()` |
| Mix of sync and async | `asyncio.to_thread()` for blocking calls |

---

## 35. Q&A — Conceptual Questions

**Q: What is the difference between `==` and `is`?**
`==` compares values (calls `__eq__`). `is` compares identity — whether both names point to the exact same object in memory. Use `is` only for `None`, `True`, and `False`; use `==` for everything else. Small integers (typically -5 to 256) are cached by CPython, which makes `is` appear to work for them — but this is an implementation detail, not guaranteed.

---

**Q: What is the GIL and why does it matter?**
The Global Interpreter Lock (GIL) is a mutex in CPython that allows only one thread to execute Python bytecode at a time. This means CPU-bound multithreaded programs do not run in true parallel. Solutions: use `multiprocessing` (separate processes, no GIL), use native extension modules that release the GIL (NumPy, I/O), or switch to PyPy/Jython. I/O-bound code is largely unaffected because threads release the GIL while waiting on I/O.

---

**Q: What is the difference between a list and a generator?**
A list holds all elements in memory at once. A generator produces elements lazily — one at a time — using `yield`. Generators are memory-efficient for large datasets, but can only be iterated once. Use a generator when you only need to process items sequentially; use a list when you need random access, len(), or multiple passes.

---

**Q: What is a decorator and when should you use one?**
A decorator is a callable that takes a function and returns a replacement function, adding behaviour before/after the original call without modifying its source. Use decorators for cross-cutting concerns: logging, timing, caching (`@lru_cache`), access control, retry logic, and validation.

---

**Q: What is the difference between `deepcopy` and `copy`?**
`copy.copy()` creates a shallow copy — a new container object but the nested objects are still shared references. `copy.deepcopy()` recursively copies all nested objects. Use `deepcopy` when you need full independence from the original; use `copy` when nested mutability is not a concern (it is faster).

---

**Q: What are `*args` and `**kwargs`?**
`*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict. They allow functions to accept any number of arguments. Conventionally named `args` and `kwargs`, but the `*` and `**` are what matter. Common use: forwarding arguments to another function (`super().__init__(*args, **kwargs)`).

---

**Q: What is the difference between `staticmethod`, `classmethod`, and an instance method?**
An **instance method** receives `self` (the instance) as the first argument — it can access and mutate instance state.
A **classmethod** receives `cls` (the class itself) — it is typically used as an alternative constructor (e.g., `from_json()`).
A **staticmethod** receives no implicit first argument — it is a plain function that lives in the class namespace for organisational reasons but has no access to class or instance state.

---

**Q: What is `__slots__` and when should you use it?**
`__slots__` replaces each instance's `__dict__` with a fixed set of named attributes stored in a compact C array. This reduces per-instance memory by ~40–60% and slightly speeds up attribute access. Use it for classes that create many small instances (e.g., a `Point` in a geometry library). Drawback: you can no longer add arbitrary attributes to instances.

---

**Q: What is the difference between `raise` and `raise e`?**
Bare `raise` re-raises the current exception while preserving the original traceback. `raise e` (where `e` is an exception you caught) re-raises it but replaces the traceback with the current frame, obscuring the original location. Prefer bare `raise` to re-raise and `raise NewException(...) from e` to chain.

---

**Q: What is duck typing and how does Python support it?**
Duck typing is the practice of checking an object's behaviour (methods and attributes) rather than its type. If it walks like a duck and quacks like a duck, treat it as one. Python supports this with `hasattr()`, `getattr()`, `isinstance()` with `Protocol`, and ABC virtual subclasses. `typing.Protocol` formalises duck typing for static type checkers without requiring inheritance.

---

**Q: What is `asyncio` and when should you choose it over threads?**
`asyncio` is a single-threaded cooperative concurrency model. Coroutines voluntarily `await` at I/O points, letting the event loop switch to another ready coroutine. Choose `asyncio` for high-concurrency I/O-bound work (thousands of connections) where thread-per-connection overhead matters. Choose `threading` for simpler I/O-bound tasks or when integrating with blocking libraries. Use `multiprocessing` for CPU-bound work.

---

**Q: What is a `dataclass` and how does it differ from a `namedtuple`?**
A `dataclass` is a mutable class with auto-generated `__init__`, `__repr__`, and `__eq__` based on annotated fields; you can add methods, inheritance, and `__post_init__`. A `namedtuple` is an immutable, memory-efficient tuple subclass with named fields; it is hashable by default and has a smaller footprint. Use `dataclass(frozen=True)` as an immutable dataclass — it is more ergonomic than `namedtuple` and integrates better with type checkers.

---

**Q: What is the difference between `__repr__` and `__str__`?**
`__repr__` should return an unambiguous, ideally eval-able representation aimed at developers (`repr(obj)`). `__str__` should return a human-readable string for display (`str(obj)`, `print(obj)`). When `__str__` is absent, Python falls back to `__repr__`. Always implement `__repr__`; implement `__str__` only when a distinct user-facing format is needed.

---

**Q: What are `@property`, `@setter`, and `@deleter`?**
`@property` turns a method into a read-only attribute accessor. `@<name>.setter` adds a write accessor. `@<name>.deleter` adds a delete accessor. Together they let you expose a clean attribute interface while running validation or computation behind the scenes — without changing the calling code from `obj.attr` to `obj.get_attr()`.

---

**Q: How does Python's import system work at a high level?**
When you `import foo`, Python searches `sys.modules` first (already imported → reuse). If absent, it searches `sys.path` (list of directories and zip files) for a module named `foo`. When found, the module file is compiled to bytecode (cached in `__pycache__`), executed in a fresh module namespace, and stored in `sys.modules`. Subsequent imports of the same module just return the cached entry — module code only runs once.
