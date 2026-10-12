# KSH (Korn Shell) Cheat Sheet

A detailed, professional-grade reference for `ksh` scripting, grouped by topic. Most of this also applies to `bash` and POSIX `sh` — differences from `bash` are called out where they matter.

---

## Script Basics

### Shebang and running a script

The shebang line tells the OS which interpreter to run the file with. It must be the very first line.

```ksh
#!/bin/ksh
# This is a comment — everything after # on a line is ignored.

echo "Hello, world"
```

```ksh
chmod +x script.ksh      # make it executable
./script.ksh               # run it directly (uses the shebang)
ksh script.ksh                # or run it explicitly with the interpreter, ignoring the shebang
```

---

## Variables

### Assignment and expansion

No spaces are allowed around `=`. Reference a variable's value with `$name` or `${name}` — the braces are required whenever the name would otherwise be ambiguous (e.g., immediately followed by other text).

```ksh
name="Ada"
count=5
echo "Hello, $name"
echo "Hello, ${name}!"          # braces needed here — "${name}!" vs. ambiguous "$name!"
echo "${name}_lovelace"           # braces needed — $name_lovelace would look for $name_lovelace

export PATH="$PATH:/usr/local/bin"    # export makes it visible to child processes
readonly MAX_RETRIES=3                  # constant — reassigning it is an error
unset name                                # remove a variable entirely
```

### Special variables

```ksh
echo "$0"      # the script's own name/path
echo "$1"       # first positional argument
echo "$2"        # second positional argument
echo "$#"         # number of positional arguments
echo "$@"          # all positional arguments, each as a separate word
echo "$*"           # all positional arguments, joined into one word
echo "$?"             # exit status of the last command (0 = success)
echo "$$"              # PID of the current shell
echo "$!"               # PID of the last background job
shift                     # discard $1, shift $2->$1, $3->$2, etc.
```

---

## Quoting & Expansion

Quoting controls whether the shell expands variables and command substitutions before using a value.

```ksh
name="Ada"
echo "Hello, $name"      # double quotes: variables and $(...) still expand
echo 'Hello, $name'        # single quotes: nothing expands, fully literal
echo Hello, $name            # unquoted: expands, but also splits on whitespace and globs — risky

# Command substitution: capture a command's output into a variable
today=$(date +%Y-%m-%d)
files=$(ls *.txt)
old_style=`date +%Y-%m-%d`      # backtick form — works, but $(...) nests more cleanly

# Arithmetic expansion
total=$((5 + 3))
echo $((total * 2))
((count++))                        # arithmetic command form — no $ needed for assignment
```

### Parameter expansion (defaults, substitution, lengths)

```ksh
echo "${name:-Guest}"        # use "Guest" if name is unset or empty (doesn't assign it)
echo "${name:=Guest}"          # same, but also assigns "Guest" to name if it was unset/empty
echo "${name:?must be set}"      # print an error and exit the script if name is unset/empty
echo "${name:+set}"                # print "set" if name IS set (the inverse check)

echo "${#name}"           # length of the string in name
echo "${name#A*}"           # remove the shortest match of "A*" from the front
echo "${name##A*}"            # remove the longest match of "A*" from the front
echo "${name%a}"                # remove the shortest match of "a" from the end
echo "${name%%a*}"                # remove the longest match of "a*" from the end
echo "${name/Ada/Grace}"            # replace the first match
echo "${name//a/A}"                   # replace all matches (ksh93/bash; not in POSIX sh)
```

---

## Conditionals

### test, [ ], and [[ ]]

`[` (a.k.a. `test`) is the POSIX-portable form. `[[` is a ksh/bash keyword with safer parsing (no word-splitting surprises, supports `&&`/`||`/pattern matching directly) — prefer it when portability to plain POSIX `sh` doesn't matter.

```ksh
if [ "$count" -gt 0 ]; then
  echo "positive"
elif [ "$count" -eq 0 ]; then
  echo "zero"
else
  echo "negative"
fi

if [[ -n "$name" && "$name" == A* ]]; then      # [[ ]] allows && directly, and glob matching with ==
  echo "Name starts with A"
fi

[ -z "$name" ]      # true if the string is empty
[ -n "$name" ]        # true if the string is non-empty
[ "$a" = "$b" ]         # string equality (use = or ==, not -eq)
[ "$a" -eq "$b" ]         # numeric equality
[ "$a" -lt "$b" ]           # numeric less-than ( -le -gt -ge -ne also available)
```

### case

```ksh
case "$1" in
  start)
    echo "Starting..."
    ;;
  stop|halt)                  # multiple patterns for one branch
    echo "Stopping..."
    ;;
  restart)
    echo "Restarting..."
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
```

---

## Loops

```ksh
for file in *.txt; do
  echo "Processing $file"
done

for i in 1 2 3 4 5; do
  echo "$i"
done

for ((i = 0; i < 5; i++)); do    # C-style, ksh93/bash
  echo "$i"
done

count=0
while [ "$count" -lt 5 ]; do
  echo "$count"
  ((count++))
done

until [ "$count" -eq 0 ]; do        # runs until the condition becomes true
  ((count--))
done

select choice in "Start" "Stop" "Quit"; do    # ksh/bash-only: prints a numbered menu
  case "$choice" in
    Start) echo "Starting"; break ;;
    Stop) echo "Stopping"; break ;;
    Quit) break ;;
  esac
done
```

`break` exits the innermost loop early; `continue` skips to the next iteration.

---

## Functions

```ksh
greet() {
  local name="$1"          # local scopes the variable to this function (ksh93/bash)
  echo "Hello, $name"
}

greet "Ada"

function status_check {        # alternate ksh syntax, equivalent to the POSIX form above
  return 0                        # return sets $? (0-255 only — use stdout for real data)
}

status_check
echo "Exit status: $?"

get_count() {
  echo 42            # functions "return" data by printing to stdout...
}
count=$(get_count)     # ...and the caller captures it with command substitution
```

---

## Arrays

Indexed arrays are a ksh93/bash extension (not in POSIX `sh`).

```ksh
fruits=(apple banana cherry)

echo "${fruits[0]}"          # apple — first element
echo "${fruits[@]}"            # all elements
echo "${#fruits[@]}"             # number of elements

fruits[3]="date"                   # append/assign by index
for fruit in "${fruits[@]}"; do
  echo "$fruit"
done

# Associative arrays (ksh93, and bash 4+)
typeset -A colors
colors[apple]="red"
colors[banana]="yellow"
echo "${colors[apple]}"
```

---

## Input/Output & Redirection

```ksh
command > output.txt          # redirect stdout, overwrite
command >> output.txt           # redirect stdout, append
command < input.txt               # redirect stdin from a file
command 2> errors.txt               # redirect stderr only
command > all.txt 2>&1                # redirect stdout AND stderr to the same file
command 2>/dev/null                     # discard stderr entirely

command1 | command2         # pipe: command1's stdout becomes command2's stdin
command1 | tee output.txt      # pipe, but also save a copy to a file

cat <<EOF > report.txt        # heredoc: multi-line input until the EOF marker
Line one
Line two, with $variable expansion
EOF

cat <<'EOF'                     # quoted marker — no expansion inside the heredoc
$variable stays literal
EOF
```

---

## String Manipulation

Already covered in Parameter Expansion above; a few more common patterns:

```ksh
str="Hello, World"
echo "${str:0:5}"        # "Hello" — substring: offset 0, length 5 (ksh93/bash)
echo "${str:7}"             # "World" — from offset 7 to the end
echo "${str^^}"                # "HELLO, WORLD" — uppercase (bash 4+, not ksh88)
echo "${str,,}"                   # "hello, world" — lowercase (bash 4+, not ksh88)

print -- "$str" | tr 'a-z' 'A-Z'    # portable uppercase via tr
print -- "$str" | wc -c               # character count
print -- "$str" | cut -d',' -f1         # "Hello" — split on comma, take field 1
```

---

## Process Control & Signals

```ksh
long_running_command &      # run in the background
job_pid=$!                    # PID of that background job
wait "$job_pid"                 # block until it finishes
wait                               # block until ALL background jobs finish

jobs                # list active jobs in this shell
kill %1                # kill job number 1
kill -9 "$job_pid"        # force-kill by PID

trap 'echo "Interrupted"; exit 1' INT      # run cleanup code on Ctrl+C
trap 'rm -f "$tmpfile"' EXIT                 # run cleanup unconditionally on script exit
```

---

## File Tests

Used inside `[ ]` / `[[ ]]` to check the filesystem before acting.

```ksh
if [ -f "$path" ]; then echo "regular file"; fi
if [ -d "$path" ]; then echo "directory"; fi
if [ -e "$path" ]; then echo "exists (any type)"; fi
if [ -r "$path" ]; then echo "readable"; fi
if [ -w "$path" ]; then echo "writable"; fi
if [ -x "$path" ]; then echo "executable"; fi
if [ -s "$path" ]; then echo "exists and is non-empty"; fi
if [ -L "$path" ]; then echo "symbolic link"; fi
```

---

## Useful Built-ins

### typeset

Declares a variable with type/attribute constraints — the ksh equivalent of `declare` in bash.

```ksh
typeset -i number=42        # integer — arithmetic happens automatically on assignment
typeset -r constant=10        # readonly
typeset -l lower="ABC"          # forces lowercase on assignment -> "abc"
typeset -u upper="abc"            # forces uppercase on assignment -> "ABC"
typeset -Z5 padded=7                 # zero-pad to width 5 -> "00007"
```

### print / echo and read

`print` is the ksh-native output builtin (more consistent across systems than `echo`, which has portability quirks around flags like `-n`).

```ksh
print "Hello"
print -n "No newline"          # suppress the trailing newline
print -r -- "$raw_string"        # -r: don't interpret backslash escapes; -- ends option parsing

read name                  # read one line of input into `name`
read -p "Enter name: " name  # prompt, then read (ksh93)
read -r line < file.txt        # -r: don't interpret backslashes; read one line from a file
while read -r line; do
  echo "Got: $line"
done < input.txt              # classic pattern for processing a file line by line
```

### getopts

Parses `-x`/`-x value` style flags in a script's own arguments.

```ksh
while getopts "vf:o:" opt; do
  case "$opt" in
    v) verbose=1 ;;
    f) input_file="$OPTARG" ;;
    o) output_file="$OPTARG" ;;
    \?) echo "Unknown option"; exit 1 ;;
  esac
done
shift $((OPTIND - 1))    # remove parsed options, leaving remaining positional args in $1, $2, ...
```

---

## Quick Task Reference

- **Run a command only if the previous one succeeded:** `cmd1 && cmd2`
- **Run a command only if the previous one failed:** `cmd1 || cmd2`
- **Check if a variable is empty:** `[ -z "$var" ]`
- **Loop over files matching a pattern:** `for f in *.txt; do ... done`
- **Capture a command's output:** `result=$(command)`
- **Run something in the background and wait for it:** `cmd & pid=$!; wait "$pid"`
- **Read a file line by line:** `while read -r line; do ... done < file`
- **Clean up no matter how the script exits:** `trap 'cleanup' EXIT`
- **Parse script flags:** `getopts`
- **Default a variable if unset:** `${var:-default}`
