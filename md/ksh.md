# KSH Scripting Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **ksh93** (AT&T Korn Shell 93) unless noted otherwise.
> Compatible notes for **mksh** (MirBSD Korn Shell) are marked `[mksh]`.

---

## Table of Contents

1. [Shebang & Script Basics](#1-shebang--script-basics)
2. [Variables](#2-variables)
3. [Special Variables](#3-special-variables)
4. [String Operations](#4-string-operations)
5. [Arrays](#5-arrays)
6. [Arithmetic](#6-arithmetic)
7. [Conditional Statements — `if` / `elif` / `else`](#7-conditional-statements--if--elif--else)
8. [Test Operators — `[[ ]]` / `[ ]`](#8-test-operators------)
9. [Case Statement](#9-case-statement)
10. [Loops — `for` / `while` / `until` / `select`](#10-loops--for--while--until--select)
11. [Functions](#11-functions)
12. [Input & Output — `read` / `print` / `echo`](#12-input--output--read--print--echo)
13. [Redirection & Pipelines](#13-redirection--pipelines)
14. [Here Documents & Here Strings](#14-here-documents--here-strings)
15. [Command Substitution & Process Substitution](#15-command-substitution--process-substitution)
16. [File Tests & File Operations](#16-file-tests--file-operations)
17. [Pattern Matching & Globbing](#17-pattern-matching--globbing)
18. [Regular Expressions](#18-regular-expressions)
19. [Signal Handling — `trap`](#19-signal-handling--trap)
20. [Script Arguments & Option Parsing — `getopts`](#20-script-arguments--option-parsing--getopts)
21. [Process Management & Job Control](#21-process-management--job-control)
22. [Coprocesses](#22-coprocesses)
23. [Error Handling & Defensive Scripting](#23-error-handling--defensive-scripting)
24. [Debugging](#24-debugging)
25. [Aliases & Shell Options](#25-aliases--shell-options)
26. [Useful Patterns & Idioms](#26-useful-patterns--idioms)
27. [Q&A — Conceptual Questions](#qa--conceptual-questions)

---

## 1. Shebang & Script Basics

### Shebang line

The first line tells the OS which interpreter to use. Always include it.

```ksh
#!/usr/bin/ksh
#!/usr/bin/ksh93
#!/bin/ksh

# Use env to find ksh in PATH (more portable across systems)
#!/usr/bin/env ksh
```

### Script template — recommended starting point

```ksh
#!/usr/bin/ksh
# ------------------------------------------------------------
# Script : deploy.sh
# Purpose: Deploy application to target environment
# Usage  : deploy.sh [-e <env>] [-v] <app_name>
# Author : Jane Smith
# ------------------------------------------------------------

# Exit immediately on error, treat unset variables as errors
set -o errexit
set -o nounset

# Resolve the directory this script lives in
SCRIPT_DIR=$(dirname "$(whence -p "$0")")
readonly SCRIPT_DIR

# Constants
readonly PROGNAME="${0##*/}"
readonly VERSION="1.0.0"
```

### Running & permissions

```bash
# Make a script executable
chmod +x deploy.sh

# Run it
./deploy.sh

# Run with explicit interpreter (no need for execute permission)
ksh deploy.sh

# Run in a subshell with debugging enabled
ksh -x deploy.sh

# Syntax-check without executing
ksh -n deploy.sh
```

---

## 2. Variables

### Declaring and assigning

```ksh
# Simple string assignment — no spaces around =
name="Alice"
count=42
path=/usr/local/bin

# Declare with attributes (ksh93)
# -r = readonly, -i = integer, -l = lowercase, -u = uppercase, -x = export
typeset -r MAX_RETRIES=3
typeset -i counter=0
typeset -l username="ALICE"    # stored as "alice"
typeset -u status="active"     # stored as "ACTIVE"
typeset -x PATH                # export to child processes (same as export)

# Export a variable to child processes
export DATABASE_URL="postgres://localhost/mydb"

# Declare integer (arithmetic is faster than string math)
integer total=0
integer page_size=100

# Readonly — cannot be changed after this point
readonly CONFIG_FILE="/etc/app/config.ini"
```

### Referencing variables

```ksh
# Basic reference
echo "$name"

# Curly braces — required when followed by alphanumeric or _
echo "${name}_backup"

# Always quote variables to prevent word splitting and glob expansion
echo "Hello, ${name}!"
cp "$source_file" "$dest_file"
```

### Variable scope

```ksh
# Variables are global by default inside a script
global_var="I am global"

function demo {
    # typeset makes a variable local to the function
    typeset local_var="I am local"
    echo "$global_var"   # accessible
    echo "$local_var"    # accessible
}

demo
echo "$global_var"   # accessible
echo "$local_var"    # empty — out of scope
```

### Unsetting variables

```ksh
# Remove a variable from the environment
unset name

# Remove a function
unset -f my_function
```

---

## 3. Special Variables

Variables are grouped by availability — not all of them work in non-interactive scripts.

### Always available (scripts + interactive)

| Variable | Meaning |
|----------|---------|
| `$0` | Name of the script or shell |
| `$1` … `$9` | Positional parameters (script arguments) |
| `${10}` … | Parameters 10 and above — braces required |
| `$#` | Number of positional parameters |
| `$@` | All parameters as separate quoted words |
| `$*` | All parameters joined as one word by `$IFS` |
| `$?` | Exit status of the last command (0 = success) |
| `$$` | PID of the current shell process |
| `$!` | PID of the most recently backgrounded process |
| `$-` | Current active shell option flags (e.g. `eixu`) |
| `$LINENO` | Current line number in the script |
| `$PPID` | PID of the parent process |
| `$PWD` | Current working directory (updated by `cd`) |
| `$OLDPWD` | Previous working directory (the one before last `cd`) |
| `$HOME` | Home directory of the current user |
| `$USER` | Current username |
| `$IFS` | Internal Field Separator — controls word splitting |
| `$PATH` | Colon-separated command search directories |
| `$SECONDS` | Integer seconds elapsed since the shell started |

### ksh93 only (not in ksh88 or mksh)

| Variable | Meaning | Notes |
|----------|---------|-------|
| `$RANDOM` | Pseudo-random integer 0–32767 | Re-evaluated on every read; seed with `RANDOM=<n>` |
| `${.sh.match[N]}` | Regex capture group N from last `=~` match | Only inside `[[ =~ ]]` context |
| `${.sh.version}` | ksh version string | Read-only |

```ksh
# $RANDOM works in ksh93 scripts
echo "$RANDOM"          # e.g. 17423
echo "$RANDOM"          # different number each time

# Seed for reproducible sequences
RANDOM=42
echo "$RANDOM"          # same sequence every run when seeded

# Random number in a range (0–99)
echo $(( RANDOM % 100 ))
```

### Interactive-shell-only — empty or unreliable in scripts

These variables are set by the **terminal driver or readline** when ksh runs interactively. In a non-interactive script they are typically empty or unset.

| Variable | Interactive meaning | Script workaround |
|----------|--------------------|--------------------|
| `$COLUMNS` | Terminal width in columns | `tput cols` |
| `$LINES` | Terminal height in rows | `tput lines` |
| `$HISTFILE` | Path to the history file | Not applicable in scripts |
| `$HISTSIZE` | Number of history entries kept | Not applicable in scripts |
| `$TMOUT` | Idle timeout in seconds | Set manually in scripts if needed |
| `$REPLY` | Default variable for bare `read` / `select` | Explicitly name a variable in scripts |
| `$_` | Last argument of the previous command | Unreliable — save the value yourself |
| `$PS1` / `$PS2` | Primary / secondary prompts | Not used in scripts |
| `$ENV` | Script sourced on interactive startup | Not relevant inside scripts |

```ksh
# WRONG — $COLUMNS is empty in a script
echo "$COLUMNS"    # (empty)

# CORRECT — query the terminal directly
cols=$(tput cols 2>/dev/null)
lines=$(tput lines 2>/dev/null)
echo "Terminal: ${cols:-80}x${lines:-24}"

# Safe fallback pattern — use default if variable is unset or empty
typeset -i term_width=${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}

# REPLY — only set by a bare read (no variable name)
read -r           # input stored in $REPLY
echo "$REPLY"

# Better practice in scripts — always name the variable explicitly
read -r -p "Enter value: " user_input
echo "$user_input"
```

### Usage examples

```ksh
#!/usr/bin/ksh

# Print how the script was called and all its arguments
echo "Script name : $0"
echo "Argument 1  : $1"
echo "Argument 2  : $2"
echo "All args    : $@"
echo "Arg count   : $#"
echo "Shell PID   : $$"
echo "Parent PID  : $PPID"
echo "Line number : $LINENO"
echo "Uptime secs : $SECONDS"

# $@ vs $* — the critical difference
# Always use "$@" to preserve individual argument boundaries
for arg in "$@"; do
    echo "  arg: [$arg]"
done

# $* joins everything into one word when quoted
for arg in "$*"; do
    echo "  joined: [$arg]"
done

# Capture $? before anything else can overwrite it
some_command
rc=$?
do_something_else
if (( rc != 0 )); then
    echo "some_command failed with exit code $rc"
fi
```

---

## 4. String Operations

### Parameter expansion — the core toolkit

```ksh
str="Hello, World!"

# Length of a string
echo "${#str}"            # 13

# Substring: ${var:offset:length}
echo "${str:7:5}"         # World
echo "${str:7}"           # World!   (to end of string)
echo "${str: -6}"         # orld!    (negative offset — from end; note the space)

# Default values
unset name
echo "${name:-Guest}"     # Guest       (use default if unset or empty)
echo "${name:=Guest}"     # Guest       (assign default if unset or empty, then use it)
echo "${name:+Logged in}" # (empty)     (use alternate if SET; empty if unset)
echo "${name:?'name is required'}"   # print error and exit if unset or empty

# After := the variable is now set:
echo "$name"              # Guest
```

### Pattern removal (very fast — no subshell)

```ksh
filepath="/home/alice/projects/app/main.ksh"

# Remove shortest match from the LEFT (# = one #, from left)
echo "${filepath#*/}"     # home/alice/projects/app/main.ksh

# Remove longest match from the LEFT (## = greedy)
echo "${filepath##*/}"    # main.ksh   ← basename equivalent

# Remove shortest match from the RIGHT (% = one %, from right)
echo "${filepath%/*}"     # /home/alice/projects/app  ← dirname equivalent

# Remove longest match from the RIGHT (%% = greedy)
echo "${filepath%%/*}"    # (empty — greedy match removes everything)

# Practical: extract extension
filename="archive.tar.gz"
echo "${filename##*.}"    # gz
echo "${filename%.*}"     # archive.tar
echo "${filename%%.*}"    # archive
```

### Search and replace (ksh93)

```ksh
sentence="the cat sat on the mat"

# Replace first occurrence
echo "${sentence/cat/dog}"          # the dog sat on the mat

# Replace ALL occurrences
echo "${sentence//at/AT}"           # the cAT sAT on the mAT

# Replace only if at the beginning of the string
echo "${sentence/#the/a}"           # a cat sat on the mat

# Replace only if at the end of the string
echo "${sentence/%mat/rug}"         # the cat sat on the rug
```

### Case conversion (ksh93)

```ksh
word="Hello World"

# Uppercase
typeset -u upper
upper="$word"
echo "$upper"     # HELLO WORLD

# Lowercase
typeset -l lower
lower="$word"
echo "$lower"     # hello world

# Capitalize first letter only (manual — ksh has no built-in title case)
echo "${word^}"   # Hello World   (ksh93 supports ^ and ,)
echo "${word^^}"  # HELLO WORLD
echo "${word,,}"  # hello world
```

### String testing

```ksh
str="hello"

# Check if a string is empty
if [[ -z "$str" ]]; then
    echo "empty"
fi

# Check if a string is non-empty
if [[ -n "$str" ]]; then
    echo "not empty"
fi

# Check if a string contains a substring (pattern match)
if [[ "$str" == *"ell"* ]]; then
    echo "contains 'ell'"
fi

# Check if a string starts with a prefix
if [[ "$str" == hello* ]]; then
    echo "starts with hello"
fi

# Check if a string ends with a suffix
if [[ "$str" == *lo ]]; then
    echo "ends with lo"
fi
```

---

## 5. Arrays

KSH supports both **indexed arrays** (integer keys, ksh88+) and **associative arrays** (string keys, ksh93 only).

### Indexed arrays

```ksh
# Declare and assign
typeset -a fruits
fruits=("apple" "banana" "cherry")

# Assign individual elements (zero-based)
fruits[0]="apple"
fruits[1]="banana"
fruits[2]="cherry"

# Append an element
fruits+=("date")

# Access an element
echo "${fruits[0]}"       # apple
echo "${fruits[2]}"       # cherry

# Access all elements
echo "${fruits[@]}"       # apple banana cherry date

# Number of elements
echo "${#fruits[@]}"      # 4

# All indices
echo "${!fruits[@]}"      # 0 1 2 3

# Slice: elements 1 through 2
echo "${fruits[@]:1:2}"   # banana cherry

# Delete an element (creates a gap)
unset fruits[1]
echo "${fruits[@]}"       # apple cherry date

# Delete the entire array
unset fruits

# Iterate over all elements
for fruit in "${fruits[@]}"; do
    echo "  - $fruit"
done

# Iterate with index
for i in "${!fruits[@]}"; do
    echo "  [$i] = ${fruits[$i]}"
done
```

### Associative arrays (ksh93 only)

```ksh
# Declare associative array
typeset -A config

# Assign key-value pairs
config[host]="db.example.com"
config[port]="5432"
config[user]="admin"
config[pass]="s3cr3t"

# Access a value by key
echo "${config[host]}"       # db.example.com

# All keys
echo "${!config[@]}"         # host port user pass

# All values
echo "${config[@]}"          # db.example.com 5432 admin s3cr3t

# Number of keys
echo "${#config[@]}"         # 4

# Check if a key exists
if [[ -v config[host] ]]; then
    echo "host is set"
fi

# Delete a key
unset config[pass]

# Iterate key-value pairs
for key in "${!config[@]}"; do
    echo "  $key = ${config[$key]}"
done
```

### Array tricks

```ksh
# Build an array from command output (one element per line)
typeset -a files
while IFS= read -r line; do
    files+=("$line")
done < <(find /tmp -name "*.log")

# Join array elements with a separator
function join_array {
    typeset sep="$1"; shift
    typeset -a arr=("$@")
    typeset result="${arr[0]}"
    typeset i
    for (( i=1; i<${#arr[@]}; i++ )); do
        result+="${sep}${arr[$i]}"
    done
    echo "$result"
}

join_array ", " "alpha" "beta" "gamma"   # alpha, beta, gamma

# Sort an array (using a subshell + sort)
typeset -a sorted
while IFS= read -r item; do
    sorted+=("$item")
done < <(printf '%s\n' "${fruits[@]}" | sort)
```

---

## 6. Arithmetic

### Integer arithmetic with `(( ))`

```ksh
# (( )) evaluates arithmetic — no $ needed inside
a=10
b=3

(( sum  = a + b ))
(( diff = a - b ))
(( prod = a * b ))
(( quot = a / b ))    # integer division — truncates
(( rem  = a % b ))    # modulo
(( pow  = a ** b ))   # exponentiation (ksh93)

echo "$sum $diff $prod $quot $rem $pow"   # 13 7 30 3 1 1000

# Increment / decrement
(( a++ ))
(( a-- ))
(( a += 5 ))
(( a -= 2 ))
(( a *= 3 ))
(( a /= 4 ))

# Use as a condition — non-zero result = true
if (( a > 10 )); then
    echo "a is greater than 10"
fi

# Ternary operator inside arithmetic
(( result = a > 10 ? 1 : 0 ))

# Bitwise operations
(( flags = 0x0F & 0xFF ))    # AND
(( flags = 0x0F | 0xF0 ))    # OR
(( flags = 0x0F ^ 0xFF ))    # XOR
(( flags = ~0x0F ))           # NOT
(( flags = 1 << 4 ))          # left shift
(( flags = 256 >> 4 ))        # right shift
```

### Floating point with `typeset -E` / `typeset -F` (ksh93)

```ksh
# ksh93 supports floating-point arithmetic natively
typeset -F 2 price=19.99
typeset -F 2 tax=0.08

typeset -F 2 total
(( total = price + price * tax ))
echo "Total: $total"    # Total: 21.59

# Use printf for formatted output
printf "Price: %.2f\n" "$price"
printf "Tax  : %.2f%%\n" "$(( tax * 100 ))"
```

### `let` command (older syntax — prefer `(( ))`)

```ksh
let "x = 5 + 3"
let x++
let "result = x * 2"
echo "$x $result"
```

### `bc` for arbitrary precision

```ksh
# Use bc for math beyond ksh's built-in capabilities
result=$(echo "scale=4; 22 / 7" | bc)
echo "$result"    # 3.1428

# Square root
sqrt=$(echo "scale=6; sqrt(2)" | bc -l)
echo "$sqrt"      # 1.414213
```

---

## 7. Conditional Statements — `if` / `elif` / `else`

```ksh
# Basic if
if [[ "$status" == "active" ]]; then
    echo "Service is running"
fi

# if-else
if [[ -f "/etc/config.ini" ]]; then
    echo "Config found"
else
    echo "Config missing"
fi

# if-elif-else chain
typeset -i score=75

if (( score >= 90 )); then
    echo "Grade: A"
elif (( score >= 80 )); then
    echo "Grade: B"
elif (( score >= 70 )); then
    echo "Grade: C"
elif (( score >= 60 )); then
    echo "Grade: D"
else
    echo "Grade: F"
fi

# One-liner using && and || (use sparingly — less readable)
[[ -d "/tmp/work" ]] && echo "exists" || echo "missing"

# Null command : as a no-op placeholder
if [[ "$DEBUG" == "true" ]]; then
    :    # TODO: add debug logging
fi
```

---

## 8. Test Operators — `[[ ]]` / `[ ]`

Prefer `[[ ]]` (ksh built-in, no word splitting, supports patterns) over `[ ]` (POSIX, external command).

### String tests

| Expression | True when |
|------------|-----------|
| `[[ -z "$s" ]]` | String is empty |
| `[[ -n "$s" ]]` | String is non-empty |
| `[[ "$a" == "$b" ]]` | Strings are equal |
| `[[ "$a" != "$b" ]]` | Strings are not equal |
| `[[ "$a" < "$b" ]]` | `a` sorts before `b` lexicographically |
| `[[ "$a" > "$b" ]]` | `a` sorts after `b` lexicographically |
| `[[ "$s" == pattern ]]` | String matches glob pattern (right side unquoted) |
| `[[ "$s" =~ regex ]]` | String matches extended regex (ksh93) |

### Integer tests (inside `[[ ]]` or `(( ))`)

| Operator | Meaning |
|----------|---------|
| `-eq` | Equal |
| `-ne` | Not equal |
| `-lt` | Less than |
| `-le` | Less than or equal |
| `-gt` | Greater than |
| `-ge` | Greater than or equal |

```ksh
# Prefer (( )) for integer comparisons — cleaner syntax
if (( count > 0 && count <= 100 )); then
    echo "count is between 1 and 100"
fi

# [[ ]] also works with -eq etc.
if [[ "$count" -gt 0 ]]; then
    echo "positive"
fi
```

### File tests

| Expression | True when |
|------------|-----------|
| `[[ -e "$f" ]]` | File or directory exists |
| `[[ -f "$f" ]]` | Regular file exists |
| `[[ -d "$f" ]]` | Directory exists |
| `[[ -L "$f" ]]` | Symbolic link exists |
| `[[ -r "$f" ]]` | File is readable |
| `[[ -w "$f" ]]` | File is writable |
| `[[ -x "$f" ]]` | File is executable |
| `[[ -s "$f" ]]` | File exists and has size > 0 |
| `[[ -p "$f" ]]` | Named pipe (FIFO) |
| `[[ -S "$f" ]]` | Socket |
| `[[ -b "$f" ]]` | Block special file |
| `[[ -c "$f" ]]` | Character special file |
| `[[ -O "$f" ]]` | File owned by the current user |
| `[[ -G "$f" ]]` | File owned by the current group |
| `[[ -N "$f" ]]` | File modified since last read |
| `[[ "$f1" -nt "$f2" ]]` | `f1` is newer than `f2` |
| `[[ "$f1" -ot "$f2" ]]` | `f1` is older than `f2` |
| `[[ "$f1" -ef "$f2" ]]` | `f1` and `f2` are the same file (hard links) |

### Combining tests

```ksh
# AND — both conditions must be true
if [[ -f "$file" && -r "$file" ]]; then
    echo "file exists and is readable"
fi

# OR — at least one condition must be true
if [[ -z "$host" || -z "$port" ]]; then
    echo "host and port are required"
    exit 1
fi

# NOT
if [[ ! -d "$output_dir" ]]; then
    mkdir -p "$output_dir"
fi
```

---

## 9. Case Statement

`case` matches a value against patterns. More readable than a long `if-elif` chain for discrete values.

```ksh
# Basic case
typeset day="Monday"

case "$day" in
    Monday|Tuesday|Wednesday|Thursday|Friday)
        echo "Weekday"
        ;;
    Saturday|Sunday)
        echo "Weekend"
        ;;
    *)
        echo "Unknown day: $day"
        ;;
esac

# Case with glob patterns
typeset filename="report_2024.csv"

case "$filename" in
    *.csv)
        echo "CSV file — importing..."
        ;;
    *.json)
        echo "JSON file — parsing..."
        ;;
    *.xml)
        echo "XML file — transforming..."
        ;;
    *.log|*.txt)
        echo "Text file — reading..."
        ;;
    *)
        echo "Unknown format: $filename"
        exit 1
        ;;
esac

# Case fall-through with ;& (ksh93 — continues to next pattern)
typeset -i level=2

case "$level" in
    3)
        echo "Level 3 initializing"
        ;&
    2)
        echo "Level 2 initializing"
        ;&
    1)
        echo "Level 1 initializing"
        ;;
esac
# Output: Level 2 initializing
#         Level 1 initializing

# Case with ;; vs ;& vs ;;& (ksh93)
# ;;  — stop after this block (default)
# ;&  — fall through to the NEXT block (no pattern test)
# ;;& — continue testing subsequent patterns
```

---

## 10. Loops — `for` / `while` / `until` / `select`

### `for` loop — list iteration

```ksh
# Iterate a literal list
for color in red green blue; do
    echo "Color: $color"
done

# Iterate over an array
typeset -a servers=("web01" "web02" "db01")
for server in "${servers[@]}"; do
    echo "Pinging $server..."
    ping -c 1 "$server" > /dev/null && echo "  UP" || echo "  DOWN"
done

# Iterate over files matching a glob
for logfile in /var/log/*.log; do
    echo "Processing $logfile"
done

# Iterate over command output
for user in $(awk -F: '$3 >= 1000 {print $1}' /etc/passwd); do
    echo "Regular user: $user"
done

# Safer: read into array first (handles filenames with spaces)
typeset -a users
while IFS= read -r user; do
    users+=("$user")
done < <(awk -F: '$3 >= 1000 {print $1}' /etc/passwd)
```

### C-style `for` loop (ksh93)

```ksh
# Standard numeric loop
for (( i=0; i<10; i++ )); do
    echo "i = $i"
done

# Countdown
for (( i=10; i>0; i-- )); do
    printf "\r%d..." "$i"
    sleep 1
done
echo " Go!"

# Step by 5
for (( i=0; i<=100; i+=5 )); do
    echo "$i"
done

# Nested loops with break target
for (( row=1; row<=3; row++ )); do
    for (( col=1; col<=3; col++ )); do
        printf "%d*%d=%d\t" "$row" "$col" "$(( row * col ))"
    done
    echo
done
```

### `while` loop

```ksh
# Loop while condition is true
typeset -i attempt=1
typeset -i max=5

while (( attempt <= max )); do
    echo "Attempt $attempt of $max"
    deploy_app && break
    (( attempt++ ))
    sleep 5
done

if (( attempt > max )); then
    echo "Deployment failed after $max attempts" >&2
    exit 1
fi

# Read a file line by line (correct way — handles spaces, special chars)
while IFS= read -r line; do
    echo "Line: $line"
done < /etc/hosts

# Read with a custom delimiter
while IFS=: read -r user pass uid gid info home shell; do
    echo "User: $user, Shell: $shell"
done < /etc/passwd

# Infinite loop
while true; do
    process_queue
    sleep 10
done

# Read from a command
while IFS= read -r json_line; do
    process "$json_line"
done < <(curl -s https://api.example.com/events)
```

### `until` loop

Runs until the condition becomes **true** (opposite of `while`).

```ksh
# Wait until a service is ready
until nc -z localhost 5432 2>/dev/null; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "PostgreSQL is ready"

# Retry with timeout
typeset -i elapsed=0
typeset -i timeout=60

until [[ -f /tmp/ready.lock ]] || (( elapsed >= timeout )); do
    sleep 1
    (( elapsed++ ))
done

(( elapsed >= timeout )) && { echo "Timed out" >&2; exit 1; }
```

### `select` loop — interactive menus

```ksh
# select generates a numbered menu and waits for user input
PS3="Choose an environment: "

select env in development staging production quit; do
    case "$env" in
        development|staging|production)
            echo "Deploying to $env..."
            break
            ;;
        quit)
            echo "Cancelled"
            exit 0
            ;;
        *)
            echo "Invalid choice. Enter a number."
            ;;
    esac
done
```

### Loop control

```ksh
# break — exit the innermost loop
for item in "${items[@]}"; do
    [[ "$item" == "STOP" ]] && break
    process "$item"
done

# break N — exit N levels of nesting
for i in 1 2 3; do
    for j in a b c; do
        [[ "$i" == 2 && "$j" == "b" ]] && break 2
        echo "$i $j"
    done
done

# continue — skip to the next iteration
for file in /data/*.csv; do
    [[ ! -s "$file" ]] && continue    # skip empty files
    process_csv "$file"
done

# continue N — continue in an outer loop
for host in "${hosts[@]}"; do
    for port in 22 80 443; do
        check_port "$host" "$port" || continue 2   # skip this host entirely
        echo "$host:$port open"
    done
done
```

---

## 11. Functions

### Defining functions

```ksh
# Syntax 1 — ksh style (preferred)
function greet {
    echo "Hello, $1!"
}

# Syntax 2 — POSIX style (also works in ksh)
greet() {
    echo "Hello, $1!"
}

# Call a function
greet "Alice"     # Hello, Alice!
```

### Local variables

```ksh
function calculate_area {
    # typeset makes variables local to the function
    typeset width="$1"
    typeset height="$2"
    typeset area

    (( area = width * height ))
    echo "$area"
}

result=$(calculate_area 10 5)
echo "Area: $result"    # Area: 50
```

### Return values

```ksh
# Functions return an exit code (0-255), not a value
# To return a value: echo it and capture with $()

function to_uppercase {
    typeset input="$1"
    typeset -u result="$input"
    echo "$result"
}

upper=$(to_uppercase "hello world")
echo "$upper"    # HELLO WORLD

# Return exit status
function is_even {
    typeset -i n="$1"
    (( n % 2 == 0 ))    # (( )) sets exit status: 0 if true, 1 if false
}

if is_even 4; then
    echo "4 is even"
fi

# Explicit return codes
function validate_port {
    typeset -i port="$1"
    if (( port < 1 || port > 65535 )); then
        return 1    # failure
    fi
    return 0        # success
}
```

### Passing arrays to functions

```ksh
# Arrays cannot be passed directly — use nameref (ksh93)
function print_array {
    typeset -n arr_ref="$1"    # nameref — arr_ref aliases the named variable
    for item in "${arr_ref[@]}"; do
        echo "  - $item"
    done
}

typeset -a colors=("red" "green" "blue")
print_array colors

# Modify an array inside a function via nameref
function append_item {
    typeset -n list_ref="$1"
    typeset item="$2"
    list_ref+=("$item")
}

append_item colors "yellow"
echo "${colors[@]}"    # red green blue yellow
```

### Recursive functions

```ksh
function factorial {
    typeset -i n="$1"
    if (( n <= 1 )); then
        echo 1
        return
    fi
    typeset -i sub
    sub=$(factorial $(( n - 1 )))
    echo $(( n * sub ))
}

echo "5! = $(factorial 5)"    # 5! = 120
```

### Function libraries

```ksh
# lib/logging.ksh
function log_info  { print "[INFO ] $(date '+%Y-%m-%d %H:%M:%S') $*"; }
function log_warn  { print "[WARN ] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2; }
function log_error { print "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2; }
function log_debug {
    [[ "${DEBUG:-0}" == "1" ]] && print "[DEBUG] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

# main.ksh
# Source the library
. lib/logging.ksh
# or
source lib/logging.ksh

log_info  "Starting deployment"
log_warn  "Retrying connection"
log_error "Fatal: config file not found"
```

---

## 12. Input & Output — `read` / `print` / `echo`

### `read`

```ksh
# Read a single line from stdin into a variable
read -r name
echo "Hello, $name"

# Read with a prompt (no newline)
read -r -p "Enter your name: " name

# Read with a timeout (5 seconds)
if read -r -t 5 -p "Continue? [y/n]: " answer; then
    echo "You answered: $answer"
else
    echo "Timed out — defaulting to no"
fi

# Read into multiple variables (splits on IFS)
read -r first last <<< "Alice Smith"
echo "$first"   # Alice
echo "$last"    # Smith

# Read a password silently (no echo)
read -r -s -p "Password: " password
echo

# Read exactly N characters (no newline required)
read -r -n 1 -p "Press any key to continue..."

# Read into an array (each word becomes an element)
read -r -a words <<< "one two three four"
echo "${words[1]}"    # two

# Read a file into a variable
read -r first_line < /etc/hostname
echo "Hostname: $first_line"
```

### `print` (ksh preferred over `echo`)

```ksh
# print is ksh's built-in output command — safer than echo
print "Hello, World!"

# Print without trailing newline
print -n "Loading..."

# Print to stderr
print -u2 "Error: something went wrong"

# Print with escape sequences
print "Line 1\nLine 2\nLine 3"

# Print raw (no escape processing)
print -r "Literal backslash: \n"

# Redirect print to a file descriptor
exec 3>/tmp/debug.log
print -u3 "Debug message"
exec 3>&-
```

### `echo` vs `print` vs `printf`

```ksh
# echo — portable but inconsistent escape handling across implementations
echo "Hello"
echo -n "no newline"
echo -e "with\ttab"      # -e not always available

# print — ksh built-in, more predictable
print "Hello"
print -n "no newline"
print "with\ttab"        # processes escapes by default

# printf — most control, closest to C printf, preferred for formatted output
printf "%-15s %5d\n" "Alice"  42
printf "%-15s %5d\n" "Bob"    7
printf "Hex: %x  Oct: %o\n" 255 255
printf "Float: %.4f\n" 3.14159
printf "%s\n" "${array[@]}"   # safe way to print array elements one per line
```

---

## 13. Redirection & Pipelines

### Standard file descriptors

| FD | Name | Default |
|----|------|---------|
| `0` | stdin | keyboard |
| `1` | stdout | terminal |
| `2` | stderr | terminal |

### Output redirection

```ksh
# Redirect stdout to a file (overwrite)
echo "output" > /tmp/out.txt

# Redirect stdout to a file (append)
echo "more" >> /tmp/out.txt

# Redirect stderr to a file
ls /nonexistent 2> /tmp/err.txt

# Redirect both stdout and stderr to a file (ksh syntax)
command > /tmp/all.txt 2>&1

# Shorter combined redirect (ksh93)
command &> /tmp/all.txt

# Redirect stderr to stdout (merge errors into normal output)
command 2>&1

# Discard stdout
command > /dev/null

# Discard both stdout and stderr
command > /dev/null 2>&1
```

### Input redirection

```ksh
# Read stdin from a file
sort < /tmp/names.txt

# Redirect a specific file descriptor as input
exec 0< /tmp/input.txt    # make stdin read from a file for the rest of the script
```

### Custom file descriptors

```ksh
# Open fd 3 for writing
exec 3> /tmp/custom.log

# Write to fd 3
echo "log entry" >&3
print -u3 "another log entry"

# Open fd 4 for reading
exec 4< /tmp/input.txt

# Read from fd 4
read -r -u4 line

# Close file descriptors
exec 3>&-    # close fd 3
exec 4<&-    # close fd 4

# Open fd for both reading and writing
exec 5<>/tmp/rw.txt
```

### Pipelines

```ksh
# Pipe stdout of one command to stdin of the next
cat /var/log/syslog | grep "ERROR" | tail -20

# Capture exit status of each command in a pipeline
set -o pipefail    # pipeline fails if ANY stage fails
result=$(generate_data | transform | upload)
echo "Exit status: $?"

# Process substitution — treat command output as a file
diff <(sort file1.txt) <(sort file2.txt)

# Tee — send output to both a file and stdout
make build 2>&1 | tee build.log

# Pipeline with error checking
if ! cat "$input" | process | save "$output"; then
    echo "Pipeline failed" >&2
    exit 1
fi
```

---

## 14. Here Documents & Here Strings

### Here document (`<<`)

```ksh
# Basic here doc — variable expansion happens
cat << EOF
Server  : $HOSTNAME
Date    : $(date)
User    : $USER
EOF

# Quoted delimiter — NO variable expansion (literal content)
cat << 'EOF'
This is a literal $variable and $(command)
EOF

# Indented here doc with <<- (strips leading TABS only, not spaces)
if true; then
    cat <<- EOF
        Indented content
        More indented content
    EOF
fi

# Here doc to a file
cat > /etc/app.conf << EOF
[database]
host = ${DB_HOST}
port = ${DB_PORT}
name = ${DB_NAME}
EOF

# Here doc as function input
send_email << EOF
To: ops@example.com
Subject: Deploy complete
Deploy of version $VERSION succeeded at $(date).
EOF

# Here doc with multiple commands
ssh user@host << 'REMOTE'
    cd /opt/app
    git pull
    ./restart.sh
REMOTE
```

### Here string (`<<<`)

```ksh
# Feed a single string as stdin — no subshell (unlike echo ... | command)
grep "error" <<< "$log_output"

# Read a string into variables
read -r year month day <<< "2024-07-15"

# Pass a variable to a command expecting stdin
bc -l <<< "scale=4; sqrt(2)"

# Multi-word here string
wc -w <<< "count these words please"
```

---

## 15. Command Substitution & Process Substitution

### Command substitution

```ksh
# $() — preferred (nestable, readable)
today=$(date '+%Y-%m-%d')
hostname=$(hostname -f)
files=$(find /tmp -name "*.tmp" -mtime +7)

# Backticks `` — legacy syntax (avoid — cannot be nested cleanly)
today=`date '+%Y-%m-%d'`

# Nested substitution — $() handles this cleanly
newest=$(ls -t "$(find /var/log -name '*.log' -maxdepth 1)" | head -1)

# Capture multi-line output
typeset -a active_users
while IFS= read -r user; do
    active_users+=("$user")
done < <(who | awk '{print $1}' | sort -u)

# Capture both stdout and exit status
output=$(run_command 2>&1)
status=$?
if (( status != 0 )); then
    print -u2 "Command failed: $output"
fi
```

### Process substitution `<()` and `>()`

Process substitution creates a temporary named pipe (or `/dev/fd/N`) so a command's output can be used **as a file argument**, without a subshell for the reading side.

```ksh
# <(cmd) — treat cmd output as a readable file
# Compare two sorted files without creating temp files
diff <(sort /etc/group) <(sort /etc/passwd)

# Read from two commands simultaneously
while IFS= read -r -u3 line1 && IFS= read -r -u4 line2; do
    echo "A: $line1"
    echo "B: $line2"
done 3< <(generate_list_a) 4< <(generate_list_b)

# >(cmd) — treat cmd as a writable file (data flows INTO cmd)
# Tee to multiple processes simultaneously
tee >(gzip > /tmp/out.gz) >(wc -l > /tmp/linecount.txt) > /dev/null

# Log to multiple destinations at once
exec > >(tee -a /var/log/app.log) 2>&1
```

---

## 16. File Tests & File Operations

### Checking files before operating on them

```ksh
# Verify a config file exists and is readable before sourcing
function safe_source {
    typeset file="$1"
    if [[ ! -f "$file" ]]; then
        print -u2 "Error: $file not found"
        return 1
    fi
    if [[ ! -r "$file" ]]; then
        print -u2 "Error: $file is not readable"
        return 1
    fi
    . "$file"
}

# Ensure a directory exists before writing to it
function ensure_dir {
    typeset dir="$1"
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir" || { print -u2 "Cannot create $dir"; return 1; }
    fi
}

# Check a file is non-empty before processing
if [[ -s /tmp/data.csv ]]; then
    process_csv /tmp/data.csv
else
    print "Warning: data.csv is empty or missing"
fi
```

### Safe file operations

```ksh
# Atomic write — write to temp file then rename (prevents partial reads)
function atomic_write {
    typeset target="$1"
    typeset tmpfile
    tmpfile=$(mktemp "${target}.XXXXXX")

    # Write to temp file
    generate_content > "$tmpfile"

    # Rename is atomic on the same filesystem
    mv "$tmpfile" "$target"
}

# Create a temp file and clean it up on exit
tmpfile=$(mktemp /tmp/process.XXXXXX)
trap 'rm -f "$tmpfile"' EXIT

# Create a temp directory
tmpdir=$(mktemp -d /tmp/work.XXXXXX)
trap 'rm -rf "$tmpdir"' EXIT

# Lock file — prevent concurrent script runs
LOCKFILE="/var/run/myscript.lock"

if ! mkdir "$LOCKFILE" 2>/dev/null; then
    print -u2 "Another instance is running (lock: $LOCKFILE)"
    exit 1
fi
trap 'rmdir "$LOCKFILE"' EXIT
```

### File path manipulation

```ksh
fullpath="/home/alice/projects/app/src/main.ksh"

# Extract filename (basename equivalent — no subshell)
filename="${fullpath##*/}"          # main.ksh

# Extract directory (dirname equivalent — no subshell)
directory="${fullpath%/*}"          # /home/alice/projects/app/src

# Extract extension
extension="${filename##*.}"         # ksh

# Strip extension
basename="${filename%.*}"           # main

# Resolve absolute path (requires ksh93 or external command)
abspath=$(cd "$(dirname "$0")" && pwd)/$(basename "$0")
```

---

## 17. Pattern Matching & Globbing

### Standard globs

```ksh
# * matches any string (including empty)
echo /var/log/*.log

# ? matches exactly one character
echo /tmp/file?.txt      # file1.txt, fileA.txt etc.

# [set] matches one character from the set
echo /dev/sd[abcd]       # sda, sdb, sdc, sdd

# [^set] or [!set] matches one character NOT in the set
echo file[^0-9].txt      # files not ending with a digit

# Suppress errors for no-match glob (set nullglob-equivalent)
set -o nullglob    # unmatched globs expand to empty string rather than literal
for f in /nonexistent/*.txt; do
    echo "$f"
done
# (no output — glob returns nothing instead of the literal pattern)
```

### Extended globbing (ksh88+ — enabled by default in ksh)

Extended patterns use `!()`  `?()` `*()` `+()` `@()`:

| Pattern | Meaning |
|---------|---------|
| `?(pattern)` | Zero or one occurrence |
| `*(pattern)` | Zero or more occurrences |
| `+(pattern)` | One or more occurrences |
| `@(pattern)` | Exactly one occurrence |
| `!(pattern)` | Anything EXCEPT this pattern |

```ksh
# Match files that are NOT .log files
echo !(*.log)

# Match only .jpg or .png files
echo @(*.jpg|*.png)

# Match zero or more digits followed by .txt
echo +([0-9]).txt      # 1.txt, 42.txt, 100.txt etc.

# Match files that don't start with a dot
echo !(.*)

# Practical: move all non-image files to another directory
for f in !(@(*.jpg|*.png|*.gif))); do
    mv "$f" /tmp/other/
done

# Pattern in case statements
case "$filename" in
    @(*.jpg|*.jpeg|*.png|*.gif))
        echo "Image file"
        ;;
    !(*.log))
        echo "Not a log file"
        ;;
esac
```

### `FIGNORE` — ignore patterns in globbing

```ksh
# Exclude .bak and .tmp files from glob expansion
FIGNORE=".bak:.tmp"
echo *       # won't show *.bak or *.tmp files
```

---

## 18. Regular Expressions

### `[[ =~ ]]` — match against an extended regex (ksh93)

```ksh
# Basic match
email="alice@example.com"
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email"
fi

# Capture groups via .sh.match[] (ksh93)
date_str="2024-07-15"
if [[ "$date_str" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})$ ]]; then
    year="${.sh.match[1]}"
    month="${.sh.match[2]}"
    day="${.sh.match[3]}"
    echo "Year=$year Month=$month Day=$day"
fi

# IP address validation
ip="192.168.1.100"
ipv4_regex='^([0-9]{1,3}\.){3}[0-9]{1,3}$'
if [[ "$ip" =~ $ipv4_regex ]]; then
    echo "Looks like an IP"
fi

# Store regex in a variable (avoids quoting issues)
version_regex='^v?([0-9]+)\.([0-9]+)\.([0-9]+)$'
if [[ "v2.10.3" =~ $version_regex ]]; then
    echo "Major: ${.sh.match[1]}"   # 2
    echo "Minor: ${.sh.match[2]}"   # 10
    echo "Patch: ${.sh.match[3]}"   # 3
fi
```

### Using `grep`, `sed`, `awk` for regex in scripts

```ksh
# grep — filter lines matching a pattern
grep -E '^ERROR' /var/log/app.log
grep -c 'WARN'  /var/log/app.log     # count matching lines

# Extract first match per line
grep -oP '(?<=user=)\w+' access.log

# sed — stream editor for in-place substitution
# Replace first occurrence per line
sed 's/foo/bar/' file.txt

# Replace ALL occurrences per line
sed 's/foo/bar/g' file.txt

# Delete lines matching a pattern
sed '/^#/d' config.ini

# In-place edit with backup
sed -i.bak 's/localhost/db.prod.example.com/g' config.ini

# awk — column/field processing
awk '{print $1}' access.log          # first field
awk -F: '{print $1,$3}' /etc/passwd  # colon-delimited, print user + uid
awk '$3 > 1000 {print $1}' /etc/passwd   # conditional print
awk 'END {print NR}' file.txt        # count lines
```

---

## 19. Signal Handling — `trap`

`trap` executes a command when the shell receives a signal or exits.

### Common signals

| Signal | Number | Triggered by |
|--------|--------|--------------|
| `EXIT` | — | Script exits (any reason) |
| `INT` | 2 | Ctrl+C |
| `TERM` | 15 | `kill` (default) |
| `HUP` | 1 | Terminal closed |
| `ERR` | — | Any command returns non-zero (with `set -e`) |
| `KILL` | 9 | Cannot be trapped |
| `USR1` | 10 | User-defined |
| `USR2` | 12 | User-defined |
| `PIPE` | 13 | Broken pipe |
| `ALRM` | 14 | Alarm timer |
| `DEBUG` | — | Before every command |

### Cleanup on exit

```ksh
#!/usr/bin/ksh
set -o errexit
set -o nounset

# Declare resources that need cleanup
tmpdir=$(mktemp -d)
lockfile="/var/run/myscript.lock"

# Cleanup function — called on any exit
function cleanup {
    typeset exit_code=$?
    rm -rf "$tmpdir"
    rm -f  "$lockfile"
    (( exit_code != 0 )) && print -u2 "Script exited with error code $exit_code"
}

# Register cleanup for EXIT — runs no matter how the script exits
trap cleanup EXIT

# Trap Ctrl+C separately for a user-friendly message
trap 'print "\nInterrupted by user"; exit 130' INT

# Trap TERM for graceful shutdown
trap 'print "Received SIGTERM — shutting down"; exit 143' TERM

# Main work...
touch "$lockfile"
do_work "$tmpdir"
```

### ERR trap — run on any error

```ksh
# Print a traceback on any command failure
function on_error {
    typeset exit_code=$?
    typeset line=$LINENO
    print -u2 "ERROR: command failed with exit code $exit_code at line $line"
    # Print a stack trace
    typeset frame=0
    while caller $frame 2>/dev/null; do
        (( frame++ ))
    done
}

trap on_error ERR
```

### Reload config on SIGHUP (daemon pattern)

```ksh
config_file="/etc/myapp/config.ini"

function load_config {
    . "$config_file"
    print "Config loaded from $config_file"
}

# Reload config when HUP is received (e.g. kill -HUP <pid>)
trap load_config HUP

load_config

while true; do
    do_work
    sleep 30
done
```

### Temporarily ignoring a signal

```ksh
# Ignore SIGINT during a critical section
trap '' INT
critical_database_operation
trap - INT    # restore default signal handling
```

---

## 20. Script Arguments & Option Parsing — `getopts`

### Accessing positional parameters

```ksh
#!/usr/bin/ksh

# $1, $2 etc. are the script arguments
echo "Script: $0"
echo "First arg: $1"
echo "Second arg: $2"
echo "All args: $@"
echo "Count: $#"

# Shift positional parameters left
shift          # $2 becomes $1, $3 becomes $2 etc.; $# decreases
shift 3        # shift 3 positions at once
```

### `getopts` — POSIX-compliant option parsing

```ksh
#!/usr/bin/ksh
# Usage: deploy.sh [-e <env>] [-v] [-n] <app>

function usage {
    cat << EOF
Usage: ${0##*/} [-e <env>] [-v] [-n] <app_name>

Options:
  -e <env>   Target environment: dev, staging, prod (default: dev)
  -v         Verbose output
  -n         Dry run — show what would happen without doing it
  -h         Show this help

EOF
    exit "${1:-0}"
}

# Defaults
typeset environment="dev"
typeset verbose=false
typeset dry_run=false

# Parse options
while getopts ":e:vnh" opt; do
    case "$opt" in
        e)
            environment="$OPTARG"
            ;;
        v)
            verbose=true
            ;;
        n)
            dry_run=true
            ;;
        h)
            usage 0
            ;;
        :)
            print -u2 "Error: option -$OPTARG requires an argument"
            usage 1
            ;;
        \?)
            print -u2 "Error: unknown option -$OPTARG"
            usage 1
            ;;
    esac
done

# Shift past the parsed options
shift $(( OPTIND - 1 ))

# Remaining arguments
if (( $# < 1 )); then
    print -u2 "Error: <app_name> is required"
    usage 1
fi

typeset app_name="$1"

# Validate environment
case "$environment" in
    dev|staging|prod) ;;
    *)
        print -u2 "Error: unknown environment '$environment'"
        usage 1
        ;;
esac

$verbose && print "Verbose mode on"
$dry_run && print "DRY RUN — no changes will be made"

print "Deploying $app_name to $environment..."
```

### Long options (manual parsing — ksh has no `getopt --long` built-in)

```ksh
#!/usr/bin/ksh

typeset env="dev"
typeset verbose=false

while (( $# > 0 )); do
    case "$1" in
        --env=*)
            env="${1#--env=}"
            shift
            ;;
        --env)
            env="$2"
            shift 2
            ;;
        --verbose|-v)
            verbose=true
            shift
            ;;
        --help|-h)
            usage
            ;;
        --)
            shift
            break
            ;;
        -*)
            print -u2 "Unknown option: $1"
            exit 1
            ;;
        *)
            break
            ;;
    esac
done
```

---

## 21. Process Management & Job Control

### Background processes

```ksh
# Run a command in the background
long_running_task &

# Capture the PID of the last background job
bg_pid=$!

# Wait for a specific background job
wait "$bg_pid"
echo "Task finished with exit code $?"

# Wait for ALL background jobs
wait
echo "All background jobs finished"

# Run multiple tasks in parallel and wait
task1 &
task2 &
task3 &
wait    # wait for all three
```

### Job control

```ksh
# List active jobs
jobs
jobs -l    # with PIDs

# Bring the most recent background job to foreground
fg

# Bring job number 2 to foreground
fg %2

# Send a foreground job to background (after Ctrl+Z to suspend)
bg

# Suspend the current foreground job
# (Ctrl+Z — not a command, but the keyboard shortcut)

# Disown a job — remove from job table (keeps running after shell exits)
long_task &
disown $!
disown %1   # by job number
```

### Subshells

```ksh
# Commands in () run in a subshell — variable changes don't affect parent
(
    cd /tmp
    export TEMP_VAR="hello"
    do_work
)
# Back in the original directory; TEMP_VAR is not set here

# Use subshells to group redirections
(
    echo "header"
    cat data.csv
    echo "footer"
) > output.txt
```

### `exec` — replace the current process

```ksh
# Replace the shell process with another command (no fork)
exec /usr/bin/python3 manage.py runserver

# Redirect all script output to a log file from this point forward
exec > /var/log/app.log 2>&1

# Redirect stdin for the rest of the script
exec < /tmp/input.txt
```

### Sending signals

```ksh
# Send a signal to a process
kill -TERM  "$pid"     # graceful terminate (default)
kill -KILL  "$pid"     # force kill (cannot be caught)
kill -HUP   "$pid"     # reload (convention for daemons)
kill -USR1  "$pid"     # user-defined signal 1
kill -0     "$pid"     # test if process exists (no signal sent)

# Send signal to a job by job number
kill -TERM %1

# Kill all processes matching a name
pkill -TERM nginx
killall nginx

# Check if a process is still running
if kill -0 "$pid" 2>/dev/null; then
    echo "Process $pid is running"
fi
```

---

## 22. Coprocesses

A coprocess is a background process with bidirectional pipes connected to the shell.

```ksh
# Start a coprocess with |&
cat -n |&
coproc_pid=$!

# Write to the coprocess's stdin with print -p
print -p "Hello from shell"

# Read from the coprocess's stdout with read -p
read -p -r response
echo "Coprocess said: $response"

# Close the write end of the coprocess pipe
print -p -  # send EOF

# Practical example — persistent bc calculator session
bc -l |&

# Send an expression
print -p "22/7"

# Read the result
read -p -r result
echo "22/7 = $result"

# Send more expressions
print -p "sqrt(2)"
read -p -r result
echo "sqrt(2) = $result"

# Terminate the coprocess
kill "$!"
```

---

## 23. Error Handling & Defensive Scripting

### `set` options for safe scripts

```ksh
#!/usr/bin/ksh

# Exit immediately when any command returns a non-zero exit code
set -o errexit      # same as set -e

# Treat references to unset variables as errors
set -o nounset      # same as set -u

# Pipelines fail if ANY command in the pipeline fails (not just the last)
set -o pipefail

# Print each command before executing (useful for debugging)
set -o xtrace       # same as set -x

# All four together — the defensive script header
set -o errexit -o nounset -o pipefail
```

### Checking command exit codes explicitly

```ksh
# Check $? immediately after a command
deploy_app
if (( $? != 0 )); then
    print -u2 "Deployment failed"
    exit 1
fi

# Inline check with || (only for simple cases — can mask errors with set -e)
run_migration || { print -u2 "Migration failed"; exit 1; }

# Save exit code before anything else changes it
command_that_might_fail
saved_status=$?
do_something_else
if (( saved_status != 0 )); then
    handle_error
fi
```

### Defensive functions

```ksh
# die — print an error message and exit
function die {
    typeset exit_code="${1:-1}"
    shift
    print -u2 "FATAL: $*"
    exit "$exit_code"
}

# require — assert a variable is set and non-empty
function require_var {
    typeset var_name="$1"
    typeset var_value="${!var_name}"   # indirect reference
    if [[ -z "$var_value" ]]; then
        die 1 "Required variable \$$var_name is not set"
    fi
}

# require_cmd — assert a command is available
function require_cmd {
    typeset cmd="$1"
    if ! whence -p "$cmd" > /dev/null 2>&1; then
        die 127 "Required command '$cmd' not found in PATH"
    fi
}

# Usage
require_var DB_HOST
require_var DB_PASSWORD
require_cmd jq
require_cmd curl
```

### Retry logic

```ksh
function retry {
    typeset -i max_attempts="${1:-3}"
    typeset -i delay="${2:-5}"
    shift 2
    typeset -i attempt=1

    while (( attempt <= max_attempts )); do
        if "$@"; then
            return 0
        fi
        print -u2 "Attempt $attempt/$max_attempts failed — retrying in ${delay}s..."
        (( attempt++ ))
        sleep "$delay"
    done

    print -u2 "All $max_attempts attempts failed for: $*"
    return 1
}

# Usage
retry 3 10 curl -f https://api.example.com/health
retry 5 2  deploy_service web
```

### Structured error output

```ksh
readonly PROGNAME="${0##*/}"

function log  { printf '[%s] INFO  %s\n' "$(date '+%H:%M:%S')" "$*"; }
function warn { printf '[%s] WARN  %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }
function err  { printf '[%s] ERROR %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }
function die  { err "$*"; exit 1; }

log  "Starting process"
warn "Disk usage above 80%"
err  "Could not connect to database"
die  "Configuration file not found — aborting"
```

---

## 24. Debugging

### Shell options for tracing

```ksh
# -x: print each command and its expanded arguments before executing
set -x

# -v: print each line of the script before it is parsed
set -v

# -n: parse and check syntax only — do not execute
set -n   # or: ksh -n script.ksh

# Combine -x and -v for maximum detail
set -xv

# Turn tracing off for a section
set +x
sensitive_command --password "$secret"
set -x
```

### `PS4` — customize the trace prompt

```ksh
# Default PS4 is "+ "
# Customize to show filename, function name, and line number
export PS4='[${LINENO}] ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
# or more detailed
export PS4='+[${SECONDS%.*}s] ${BASH_SOURCE##*/}:${LINENO}: '

set -x
my_function
set +x
```

### Manual debug logging

```ksh
# DEBUG flag — set it externally or in the script
DEBUG="${DEBUG:-0}"

function debug {
    (( DEBUG )) && printf '[DEBUG] %s\n' "$*" >&2
}

debug "Entering main loop, counter=$counter"

# Run script with debug mode:
# DEBUG=1 ./script.ksh
```

### Tracing a single function

```ksh
function traced_function {
    set -x
    # ... all commands here are traced
    typeset result=$(complex_calculation "$1")
    set +x
    echo "$result"
}
```

### `typeset -ft` — trace a specific function (ksh93)

```ksh
# Enable xtrace for a named function only
typeset -ft my_function

my_function arg1 arg2    # will print trace output for this call only
```

### Checking script syntax before running

```ksh
# Parse the script without executing — catches syntax errors
ksh -n my_script.ksh

# Lint with shellcheck (external tool — highly recommended)
shellcheck -s ksh my_script.ksh
```

---

## 25. Aliases & Shell Options

### Aliases

```ksh
# Define an alias
alias ll='ls -lah'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# Aliases with arguments are NOT supported directly — use a function instead
function mkcd { mkdir -p "$1" && cd "$1"; }

# View all aliases
alias

# View a specific alias
alias ll

# Remove an alias
unalias ll

# Aliases in scripts: aliases are NOT expanded in scripts by default
# Enable alias expansion in a script
set -o expand_aliases
alias lf='ls -F'
lf /tmp   # now works
```

### Important shell options (`set -o`)

```ksh
# List all options and their current state
set -o

# errexit  — exit on any error
set -o errexit

# nounset  — error on undefined variables
set -o nounset

# pipefail — pipeline fails if any stage fails
set -o pipefail

# xtrace   — trace commands before execution
set -o xtrace

# vi       — vi-style command line editing
set -o vi

# emacs    — emacs-style command line editing (default)
set -o emacs

# noclobber — prevent '>' from overwriting existing files
set -o noclobber
echo "data" >| file.txt   # use >| to force overwrite when noclobber is on

# noglob   — disable filename globbing (useful when passing regex to commands)
set -o noglob
ls *.txt    # treated as literal "*.txt", not a glob

# monitor  — enable job control
set -o monitor

# Turn an option OFF with +o
set +o xtrace

# Check if an option is set
if [[ -o errexit ]]; then
    echo "errexit is on"
fi
```

---

## 26. Useful Patterns & Idioms

### Script self-documentation

```ksh
#!/usr/bin/ksh
# usage: script.ksh [options] <args>

function usage {
    # Extract lines starting with '##' from the script itself
    grep '^##' "$0" | sed 's/^## \?//'
    exit "${1:-0}"
}

## Usage: script.ksh [-v] [-e <env>] <app>
##
## Deploy an application to a target environment.
##
## Options:
##   -v         Verbose
##   -e <env>   Environment (dev/staging/prod)
##   -h         Show this help
```

### Locking — prevent concurrent execution

```ksh
LOCKFILE="/var/run/${0##*/}.lock"

# mkdir is atomic — use it for locking
if ! mkdir "$LOCKFILE" 2>/dev/null; then
    pid=$(cat "$LOCKFILE/pid" 2>/dev/null)
    print -u2 "Already running (PID: ${pid:-unknown}). Exiting."
    exit 1
fi
echo $$ > "$LOCKFILE/pid"
trap 'rm -rf "$LOCKFILE"' EXIT
```

### Spinner / progress indicator

```ksh
function spinner {
    typeset pid=$1
    typeset delay=0.1
    typeset spinstr='|/-\'

    while kill -0 "$pid" 2>/dev/null; do
        typeset temp="${spinstr#?}"
        printf '\r [%c] ' "$spinstr"
        spinstr="${temp}${spinstr%${temp}}"
        sleep "$delay"
    done
    printf '\r    \r'
}

long_running_command &
spinner $!
wait $!
echo "Done"
```

### Confirm prompt

```ksh
function confirm {
    typeset prompt="${1:-Are you sure?} [y/N]: "
    typeset answer
    read -r -p "$prompt" answer
    case "$answer" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

if confirm "Delete all logs in /var/log/app?"; then
    rm -rf /var/log/app/*.log
    echo "Logs deleted"
else
    echo "Cancelled"
fi
```

### Timestamped log wrapper

```ksh
logfile="/var/log/deploy_$(date '+%Y%m%d_%H%M%S').log"

# Redirect all output (stdout + stderr) to both terminal and log file
exec > >(tee -a "$logfile") 2>&1

echo "=== Deploy started at $(date) ==="
# Everything below goes to both terminal and logfile automatically
```

### Rate limiting / throttling parallel jobs

```ksh
# Run at most N jobs concurrently
function run_parallel {
    typeset -i max_jobs="${1:-5}"
    shift
    typeset -i running=0

    for item in "$@"; do
        while (( running >= max_jobs )); do
            wait -n 2>/dev/null   # wait for any single job to finish (ksh93)
            (( running-- ))
        done
        process_item "$item" &
        (( running++ ))
    done

    wait    # wait for remaining jobs
}
```

### Reading INI / key=value config files

```ksh
# Source a simple key=value config (safe — no arbitrary code)
function read_config {
    typeset config_file="$1"
    typeset line key value

    while IFS= read -r line; do
        # Skip blank lines and comments
        [[ "$line" =~ ^[[:space:]]*$ ]] && continue
        [[ "$line" =~ ^[[:space:]]*# ]] && continue

        # Parse key=value
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${.sh.match[1]}"
            value="${.sh.match[2]}"
            # Strip surrounding quotes if present
            value="${value#\"}"
            value="${value%\"}"
            value="${value#\'}"
            value="${value%\'}"
            # Assign dynamically
            typeset -g "$key"="$value"
        fi
    done < "$config_file"
}

read_config /etc/app/config.ini
echo "DB host: $DB_HOST"
```

### Checking dependencies at startup

```ksh
function check_dependencies {
    typeset -a missing=()
    typeset cmd

    for cmd in curl jq aws kubectl; do
        if ! whence -p "$cmd" > /dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done

    if (( ${#missing[@]} > 0 )); then
        print -u2 "Missing required commands: ${missing[*]}"
        print -u2 "Install them and try again."
        exit 127
    fi
}

check_dependencies
```

### Here-doc template rendering

```ksh
# Render a template by substituting environment variables
function render_template {
    typeset template_file="$1"
    typeset output_file="$2"

    eval "cat << 'TEMPLATE_EOF'
$(cat "$template_file")
TEMPLATE_EOF" > "$output_file"
}

# Or using envsubst (requires GNU gettext)
export APP_NAME="myapp"
export APP_PORT="8080"
envsubst < template/nginx.conf.tmpl > /etc/nginx/conf.d/myapp.conf
```

---

## Q&A — Conceptual Questions

---

### Q1: What is the difference between `[ ]`, `[[ ]]`, and `(( ))`?

**`[ ]` — POSIX test command**
- An external command (or built-in) available in all POSIX shells.
- Requires quoting all variable references to prevent word splitting.
- No support for `&&` / `||` inside; use `-a` / `-o` instead.
- No glob or regex pattern matching.

**`[[ ]]` — ksh/bash compound command (preferred)**
- A shell keyword, not a command — no word splitting on unquoted variables.
- Supports `&&` and `||` inside.
- Right-hand side of `==` is a glob pattern (unquoted) or literal (quoted).
- Supports `=~` for extended regex matching.
- Use this for all string and file tests in ksh scripts.

**`(( ))` — arithmetic compound command**
- Evaluates integer arithmetic expressions.
- No `$` needed on variable names inside.
- Returns exit code 0 if the result is non-zero (true), 1 if zero (false).
- Use this for all numeric comparisons and calculations.

```ksh
# Equivalent tests written three ways:
[ "$count" -gt 0 ]          # [ ]    — POSIX, works everywhere
[[ "$count" -gt 0 ]]        # [[ ]]  — ksh/bash
(( count > 0 ))              # (( ))  — cleanest for integers
```

---

### Q2: What is the difference between `$@` and `$*`?

Both expand to all positional parameters, but differ when quoted:

| Expression | Expansion |
|------------|-----------|
| `$@` (unquoted) | Same as `$*` — all params, word-split |
| `$*` (unquoted) | All params joined by first char of `$IFS`, then word-split |
| `"$@"` | Each param as a **separate word** — preserves boundaries |
| `"$*"` | All params joined into a **single word** with IFS separator |

```ksh
set -- "hello world" "foo bar"

for x in "$@"; do echo "[$x]"; done
# [hello world]
# [foo bar]

for x in "$*"; do echo "[$x]"; done
# [hello world foo bar]
```

**Rule: always use `"$@"` when forwarding or iterating arguments.**

---

### Q3: What is the difference between `.` (dot) and `source`?

Both execute a script in the **current shell environment** (not a subshell), so variable assignments and function definitions persist after the call returns.

- `.` is the POSIX standard name, available in all shells.
- `source` is a synonym available in ksh, bash, and zsh.

```ksh
. /etc/app/config.sh      # POSIX — always works
source /etc/app/config.sh # ksh/bash synonym
```

This is different from running `ksh script.sh` or `./script.sh`, which both launch a **child process** — variable changes in the child do not affect the parent.

---

### Q4: What is the difference between `exit` and `return`?

| Command | Where usable | Effect |
|---------|-------------|--------|
| `exit [N]` | Anywhere | Terminates the entire script (or the current subshell) |
| `return [N]` | Inside a function or sourced file | Exits only the current function or sourced file |

```ksh
function validate {
    [[ -z "$1" ]] && return 1   # exit the function with failure
    return 0
}

if ! validate "$input"; then
    exit 1    # exit the whole script
fi
```

---

### Q5: What is the difference between `()` subshell and `{}` group command?

**`( commands )` — subshell**
- Runs commands in a **child process**.
- Variable changes, `cd`, `set` option changes do NOT affect the parent shell.
- A forked process — slightly slower, but isolated.

**`{ commands; }` — group command**
- Runs commands in the **current shell** (no fork).
- Variable changes DO affect the current shell.
- Note the required space after `{` and `;` before `}`.

```ksh
# Subshell — cd does not affect parent
(cd /tmp && ls)
echo "$PWD"    # still the original directory

# Group — cd DOES affect parent
{ cd /tmp && ls; }
echo "$PWD"    # now /tmp

# Common use of grouping: redirect multiple commands' output together
{
    echo "=== Header ==="
    cat data.txt
    echo "=== Footer ==="
} > report.txt
```

---

### Q6: What is the difference between `typeset`, `declare`, `local`, `integer`, and `export`?

In ksh, these are all variations of the same built-in, `typeset`:

| Command | Equivalent to | Effect |
|---------|--------------|--------|
| `typeset var` | `typeset var` | Declare variable (local if inside a function) |
| `typeset -x var` | `export var` | Mark for export to child processes |
| `typeset -i var` | `integer var` | Integer-typed variable |
| `typeset -r var` | `readonly var` | Read-only variable |
| `typeset -l var` | — | Lowercase on assignment |
| `typeset -u var` | — | Uppercase on assignment |
| `typeset -a var` | — | Indexed array |
| `typeset -A var` | — | Associative array (ksh93) |
| `typeset -n var` | — | Nameref (alias for another variable, ksh93) |
| `typeset -f` | — | List all functions |
| `typeset -ft fn` | — | Enable xtrace for a specific function |

`declare` is a bash synonym for `typeset` — it does not exist in pure ksh.
`local` is not a ksh keyword; use `typeset` inside functions instead.

---

### Q7: What is a nameref and when is it useful?

A nameref (`typeset -n`) makes one variable an **alias for another variable by name**. It is the ksh way to pass variables by reference into functions.

```ksh
function double_value {
    typeset -n ref="$1"    # ref is now an alias for whatever variable name was passed
    (( ref *= 2 ))
}

typeset -i count=5
double_value count
echo "$count"    # 10 — the original variable was modified

# Passing arrays by reference
function sum_array {
    typeset -n arr="$1"
    typeset -i total=0
    for val in "${arr[@]}"; do
        (( total += val ))
    done
    echo "$total"
}

typeset -a numbers=(10 20 30 40)
sum_array numbers    # 100
```

Without namerefs, you would need to use `eval` (error-prone) or restructure with global variables.

---

### Q8: What is the difference between `whence`, `type`, `which`, and `command`?

All locate commands, but differ in behavior:

| Command | What it does |
|---------|-------------|
| `whence cmd` | ksh built-in — shows what `cmd` resolves to (alias, function, built-in, or path) |
| `whence -v cmd` | Verbose — includes the type |
| `whence -p cmd` | Search PATH only — ignores aliases and functions |
| `type cmd` | POSIX — similar to `whence -v` |
| `which cmd` | External command — searches PATH, ignores aliases/functions |
| `command cmd` | Bypass aliases and functions — execute the external command directly |
| `command -v cmd` | Print path or how the command would be resolved |

```ksh
alias ls='ls --color=auto'

whence ls        # ls --color=auto       (shows the alias)
whence -p ls     # /bin/ls               (the actual binary)
which ls         # /bin/ls               (always the binary)
command ls       # executes /bin/ls directly, bypassing the alias
```

---

### Q9: What is `IFS` and how does it affect word splitting?

`IFS` (Internal Field Separator) is the set of characters used to split words when the shell performs **word splitting** on unquoted variable expansions and command substitutions.

Default value: space, tab, newline (`$' \t\n'`).

```ksh
# Default splitting — splits on any whitespace
line="one two   three"
for word in $line; do
    echo "[$word]"
done
# [one] [two] [three]

# Change IFS to split on colon (useful for /etc/passwd processing)
IFS=:
read -r user pass uid gid info home shell < /etc/passwd
echo "User: $user, Shell: $shell"

# Always restore or localize IFS changes
typeset saved_IFS="$IFS"
IFS=,
# ... process comma-separated data
IFS="$saved_IFS"

# Set IFS to empty string to prevent any word splitting
IFS=
while read -r line; do
    # $line is never split — each iteration = one full line
    process "$line"
done < data.txt

# Safest pattern for reading lines — set IFS only for the read command
while IFS= read -r line; do
    process "$line"
done < data.txt
```

---

### Q10: How does `set -e` (errexit) interact with functions and pipes?

`set -o errexit` makes the shell exit when **any simple command** fails. There are important nuances:

**It does NOT exit if the failing command is:**
- In the condition of an `if`, `while`, or `until` statement.
- On the left side of `&&` or `||`.
- Negated with `!`.

```ksh
set -o errexit

false           # script exits here

false || true   # OK — the || prevents exit
if false; then  # OK — false is the test condition
    echo "never"
fi
! false         # OK — negated
```

**Pipelines with `set -e`:**

Without `set -o pipefail`, only the **last** command's exit code is checked:

```ksh
set -o errexit
# This does NOT exit even though grep fails (exit 1)
grep "NOTFOUND" /dev/null | wc -l
echo "still running"   # ← executes!

# Add pipefail to catch failures anywhere in a pipeline
set -o pipefail
grep "NOTFOUND" /dev/null | wc -l
echo "never reached"   # ← now exits before here
```

**Inside functions with `set -e`:**

A function's exit status is the exit status of its **last command**. If the last command succeeds, the function "succeeds" even if earlier commands failed — unless `set -e` is active inside it.

---

*Generated 2026-08-20*
