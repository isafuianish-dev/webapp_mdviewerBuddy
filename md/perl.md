# Perl Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items
> All examples target **Perl 5.36+** unless noted otherwise.
> Notes for older versions are marked `[5.10+]` / `[5.20+]` etc.
> Every script is assumed to start with `use strict; use warnings;` (see [section 1](#1-script-basics--entry-point)).

---

## Table of Contents

1. [Script Basics & Entry Point](#1-script-basics--entry-point)
2. [Variables & Data Types](#2-variables--data-types)
3. [Special Variables](#3-special-variables)
4. [Strings](#4-strings)
5. [Numbers & Math](#5-numbers--math)
6. [Arrays](#6-arrays)
7. [Hashes](#7-hashes)
8. [Context — Scalar vs List](#8-context--scalar-vs-list)
9. [Control Flow — `if` / `elsif` / `else` / `unless`](#9-control-flow--if--elsif--else--unless)
10. [Loops — `for` / `foreach` / `while` / `until`](#10-loops--for--foreach--while--until)
11. [Subroutines](#11-subroutines)
12. [References & Complex Data Structures](#12-references--complex-data-structures)
13. [Regular Expressions](#13-regular-expressions)
14. [File I/O](#14-file-io)
15. [Filesystem — Tests, Directories & Paths](#15-filesystem--tests-directories--paths)
16. [Sorting & Searching](#16-sorting--searching)
17. [Packages & Modules](#17-packages--modules)
18. [Object-Oriented Perl](#18-object-oriented-perl)
19. [Exceptions & Error Handling](#19-exceptions--error-handling)
20. [Pragmas](#20-pragmas)
21. [Unicode & Encoding](#21-unicode--encoding)
22. [Command-Line One-Liners](#22-command-line-one-liners)
23. [Processes & External Commands](#23-processes--external-commands)
24. [Signals & Timers](#24-signals--timers)
25. [Date & Time](#25-date--time)
26. [Core Modules Worth Knowing](#26-core-modules-worth-knowing)
27. [`Getopt::Long` — Full CLI Reference](#27-getoptlong--full-cli-reference)
28. [Database Access — `DBI`](#28-database-access--dbi)
29. [Networking & HTTP](#29-networking--http)
30. [Concurrency — `fork` / `IO::Select` / Threads](#30-concurrency--fork--ioselect--threads)
31. [Testing — `Test::More` / `prove`](#31-testing--testmore--prove)
32. [Debugging & Profiling](#32-debugging--profiling)
33. [Best Practices & Style](#33-best-practices--style)
34. [Useful Patterns & Idioms](#34-useful-patterns--idioms)
35. [Version Feature Timeline](#35-version-feature-timeline)
36. [Q&A — Conceptual Questions](#36-qa--conceptual-questions)

---

## 1. Script Basics & Entry Point

### Shebang

```perl
#!/usr/bin/env perl
#!/usr/bin/perl
#!/usr/bin/perl -w          # -w enables warnings globally (prefer `use warnings`)
#!/usr/bin/perl -T          # taint mode (untrusted input checking)
```

### Standard script template

```perl
#!/usr/bin/env perl
# ------------------------------------------------------------
# Script : deploy.pl
# Purpose: Deploy application to a target environment
# Usage  : deploy.pl [-e <env>] [-v] <app_name>
# ------------------------------------------------------------
use v5.36;                      # enables strict, warnings, say, signatures
use Getopt::Long qw(GetOptions);
use Pod::Usage   qw(pod2usage);

sub main (@argv) {
    my %opt = (env => 'staging', verbose => 0);
    GetOptions(\%opt, 'env|e=s', 'verbose|v', 'help|h')
        or pod2usage(2);
    pod2usage(1) if $opt{help};

    my $app = shift @argv // pod2usage("app_name is required");
    say "Deploying $app to $opt{env}" if $opt{verbose};
    return 0;
}

exit main(@ARGV);

__END__

=head1 NAME

deploy.pl - deploy an application

=head1 SYNOPSIS

deploy.pl [options] app_name

=cut
```

### Minimal pre-5.36 header

```perl
use strict;
use warnings;
use feature qw(say);            # `say` prints with a trailing newline
```

### Running scripts

```bash
perl script.pl arg1 arg2        # run with explicit interpreter
chmod +x script.pl && ./script.pl
perl -c script.pl               # compile/syntax check only ("syntax OK")
perl -wc script.pl              # syntax check with warnings
perl -v                         # version
perl -V                         # full build configuration
perl -V:version                 # a single config value
perl -e 'print "hi\n"'          # inline program
perl -E 'say "hi"'              # inline program with all features enabled
perl -MO=Deparse script.pl      # show how perl parsed your code
```

### Getting help — `perldoc`

```bash
perldoc perl                    # top-level index of all manuals
perldoc perlintro               # short introduction
perldoc perlop                  # operators and precedence
perldoc perlre                  # regular expressions
perldoc perlfunc                # index of builtin functions
perldoc -f sprintf              # one builtin function
perldoc -q "sort a hash"        # search the FAQ
perldoc -v '$/'                 # a special variable
perldoc List::Util              # module documentation
perldoc -l List::Util           # path of the module file
perldoc -m List::Util           # show the module source
```

### Comments & POD

```perl
# Single-line comment

=pod

Block of documentation (POD). Ignored by the compiler.
Anything between =pod and =cut is skipped.

=cut

__END__
Everything after __END__ is ignored by the compiler; read it via <DATA>
in the main script.
```

### `__DATA__` / `__END__` sections

```perl
while (my $line = <DATA>) {
    chomp $line;
    say "got: $line";
}

__DATA__
first line
second line
```

### Statement rules

```perl
my $x = 1;                      # statements end with a semicolon
my $y = 2;   my $z = 3;         # several per line is legal, but avoid it
print "a",
      "b";                      # statements may span lines
{ my $scoped = 1; }             # a bare block is a scope
```

---

## 2. Variables & Data Types

### The three basic types (sigils)

| Sigil | Type | Example |
|---|---|---|
| `$` | Scalar (one value) | `my $name = "Ada";` |
| `@` | Array (ordered list) | `my @nums = (1, 2, 3);` |
| `%` | Hash (key → value map) | `my %age = (Ada => 36);` |
| `&` | Subroutine | `&foo` / `\&foo` |
| `*` | Typeglob / filehandle | `*STDOUT` |

The sigil describes what you are **getting**, not what the variable is:

```perl
my @a = (10, 20, 30);
my %h = (x => 1, y => 2);

$a[0];              # one element of @a       -> 10   (sigil is $)
@a[0,1];            # array slice             -> (10, 20)
$h{x};              # one value of %h         -> 1
@h{qw(x y)};        # hash slice              -> (1, 2)
%h{qw(x)};          # key/value slice [5.20+] -> (x => 1)
%a[0,1];            # index/value slice [5.20+] -> (0,10, 1,20)
```

### Declaring variables

```perl
my  $lexical = 1;       # lexically scoped: visible to the enclosing block/file
our $package = 2;       # alias to a package (global) variable $main::package
local $main::global = 3;  # temporarily saves a GLOBAL's value, restored at scope exit
state $counter = 0;     # [5.10+] lexical that keeps its value between calls (needs `use feature 'state'`)
```

```perl
my ($a, $b, $c) = (1, 2, 3);        # list assignment
my ($first, @rest) = @list;         # first element + the remainder
my ($x, $y) = ($y, $x);             # swap without a temp
my $count = () = $str =~ /x/g;      # "countof" idiom (assign to empty list in scalar context)
```

### Scope

```perl
my $x = 'outer';
{
    my $x = 'inner';        # shadows the outer $x
    say $x;                 # inner
}
say $x;                     # outer

# Prefer `my`. Use `local` only for special/global variables:
{
    local $/ = undef;       # slurp mode for this block only
    local $, = ', ';
    local $_ = 'topic';
}
```

### `undef`, definedness, truth

```perl
my $u;                      # undef
defined $u;                 # false
$u = 0;   defined $u;       # true (0 is defined)
undef $u;                   # explicitly reset to undef
```

The **false** values are: `undef`, `0`, `'0'`, `''` (empty string), `()` (empty list) and `0.0`.
Everything else is true — including `'0.0'`, `'00'`, `'0E0'`, and `' '`.

```perl
"0E0";      # true, but numerically zero — used as "success with zero rows" (DBI does this)
"0 but true";   # true and numerically 0; no "non-numeric" warning
```

### Defined-or `//`

```perl
my $port = $opt{port} // 8080;      # use 8080 only if undef (0 stays 0)
my $name = $opt{name} || 'anon';    # `||` also replaces 0 and ''
$opt{retries} //= 3;                # assign only if undef
$opt{label}   ||= 'default';        # assign if false
```

### Scalar values — numbers vs strings

Perl scalars are dynamically typed and convert on demand by the **operator**, not the value:

```perl
"10" + 5;           # 15     (+ forces numeric)
"10" . 5;           # "105"  (. forces string)
"3 apples" + 2;     # 5      (warns: Argument isn't numeric)
"abc" == 0;         # true   (warns)
"10" == 10.0;       # true
"10" eq "10.0";     # false  (string comparison)
```

### Numeric literals

```perl
my $dec = 255;
my $hex = 0xFF;             # 255
my $oct = 0377;             # 255
my $bin = 0b11111111;       # 255
my $big = 1_000_000;        # underscores for readability
my $flt = 3.14e-2;          # 0.0314
my $o2  = 0o377;            # [5.34+] explicit octal
```

### Quoting operators

```perl
my $s1 = 'single: no $interpolation\n';
my $s2 = "double: $interpolated\n";
my $s3 = q(single-quote style, (nesting) ok);
my $s4 = qq{double-quote style with $var};
my @w  = qw(alpha beta gamma);      # list of words, no commas/quotes
my $cmd = `date`;                   # backticks: run command, capture output
my $out = qx{ls -l};                # same as backticks
my $re  = qr/^\d+$/i;               # compiled regex object
```

### Constants

```perl
use constant PI      => 3.14159265;
use constant DEBUG   => 0;
use constant COLORS  => qw(red green blue);     # list constant
use constant {
    HOST => 'localhost',
    PORT => 5432,
};

say PI * 2;
say "host is @{[ HOST ]}";          # constants don't interpolate in strings; use @{[ ]}
my @c = (COLORS);
say((COLORS)[1]);                   # green
```

### Type checks

```perl
use Scalar::Util qw(looks_like_number reftype blessed);

looks_like_number("1e5");           # true
looks_like_number("abc");           # false
ref($x);                            # '' | 'ARRAY' | 'HASH' | 'CODE' | 'SCALAR' | 'REF' | 'Regexp' | class name
blessed($obj);                      # class name, or undef if not an object
reftype($obj);                      # underlying type even for blessed refs
```

---

## 3. Special Variables

### The topic and argument variables

| Variable | Meaning |
|---|---|
| `$_` | Default input / topic variable for many builtins (`print`, `chomp`, `split`, regex match, `for`, `map`, `grep`) |
| `@_` | Arguments passed to the current subroutine (aliased to the caller's variables) |
| `$0` | Name of the running script |
| `@ARGV` | Command-line arguments |
| `%ENV` | Environment variables |
| `@INC` / `%INC` | Module search path / loaded modules |
| `$$` | Current process ID |
| `$^O` | Operating system name (`linux`, `darwin`, `MSWin32`) |
| `$^V` / `$]` | Perl version (`v5.36.0` / `5.036000`) |
| `$^X` | Path to the perl binary |
| `$^T` | Script start time (epoch seconds) |
| `$;` | Multi-dimensional hash key separator (rarely used) |

### Error variables

| Variable | Meaning |
|---|---|
| `$@` | Error from the last `eval` (empty string on success) |
| `$!` | Last system error — number in numeric context, message in string context |
| `%!` | Hash of errno names: `$!{ENOENT}` |
| `$?` | Exit status of the last child process / backtick / `system` |
| `$^E` | Extended OS error (Windows-specific detail) |

```perl
open(my $fh, '<', '/no/such') or warn "open failed: $!\n";
say $! + 0;                     # numeric errno (2)
say "missing" if $!{ENOENT};
```

### Input/output separators

- `$/` (default `"\n"`) — input record separator: what `<FH>` reads up to
- `$\` (default `undef`) — appended to every `print`
- `$,` (default `undef`) — inserted between `print` arguments
- `$"` (default `" "`) — separator used when interpolating an array in a string
- `$|` (default `0`) — autoflush the currently selected filehandle when true
- `$.` — current line number of the last-read filehandle

```perl
{
    local $/ = undef;               # slurp: read the whole file at once
    my $content = <$fh>;
}
{
    local $/ = "";                  # paragraph mode: split on blank lines
    while (my $para = <$fh>) { ... }
}
{
    local $, = ', ';  local $\ = "\n";
    print 'a', 'b', 'c';            # a, b, c
}
my @list = (1, 2, 3);
{ local $" = '-'; say "@list"; }    # 1-2-3
$| = 1;                             # unbuffered STDOUT
```

### Regex match variables

| Variable | Meaning |
|---|---|
| `$1`, `$2`, … | Text captured by the 1st, 2nd, … group |
| `$&` | Entire match |
| `` $` `` | Text before the match |
| `$'` | Text after the match |
| `$+` | Last successfully matched group |
| `@-` / `@+` | Start / end offsets of the match and each group |
| `%+` / `%-` | Named captures (`$+{name}`) |
| `${^MATCH}` | Match text, only with `/p` (safe replacement for `$&`) |

```perl
if ("2026-09-20" =~ /^(\d{4})-(\d\d)-(\d\d)$/) {
    say "year=$1 month=$2 day=$3";
}
```

> Capture variables are **dynamically scoped to the enclosing block** and only updated on a **successful** match. Copy them into a `my` variable straight away.

### Handles

| Name | Meaning |
|---|---|
| `STDIN` / `STDOUT` / `STDERR` | Standard streams |
| `ARGV` | Iterates files named in `@ARGV` (or STDIN) — used by `<>` |
| `DATA` | Reads the text after `__DATA__` |
| `$ARGV` | Name of the file currently being read by `<>` |

### Environment access

```perl
my $home = $ENV{HOME};
$ENV{PATH} = "/opt/bin:$ENV{PATH}";     # affects child processes
delete $ENV{HTTP_PROXY};
for my $k (sort keys %ENV) { say "$k=$ENV{$k}" }
{ local $ENV{LANG} = 'C'; system 'sort', 'file'; }
```

### Warnings and dying hooks

```perl
local $SIG{__WARN__} = sub { print STDERR "[warn] $_[0]" };
local $SIG{__DIE__}  = sub { print STDERR "[die]  $_[0]" };
```

---

## 4. Strings

### Interpolation

```perl
my $name = 'Ada';
my @items = (1, 2, 3);
my %h = (k => 'v');
my $ref = { a => [10, 20] };

say "Hello, $name";                 # Hello, Ada
say "Hello, ${name}!";              # braces delimit the variable name
say "Items: @items";                # Items: 1 2 3
say "Elem: $items[1] $h{k}";        # Elem: 2 v
say "Deep: $ref->{a}[1]";           # Deep: 20
say "Expr: @{[ 2 * 21 ]}";          # Expr: 42  (@{[ ]} evaluates any expression)
say "Email: user\@example.com";     # escape @
say 'No $interp here\n';            # single quotes: literal
```

### Concatenation, repetition, length

```perl
my $s = "foo" . "bar";              # foobar
$s .= "!";                          # append
my $line = '-' x 40;                # repeat string
my @zeros = (0) x 10;               # repeat list
length($s);                         # characters (not bytes, if the string is decoded)
```

### Case, trim, reverse

```perl
lc $s;   uc $s;   lcfirst $s;   ucfirst $s;
ucfirst lc $name;                   # "ada" -> "Ada"
scalar reverse $s;                  # string reverse (needs scalar context!)

(my $t = $s) =~ s/^\s+|\s+$//g;     # trim, keeping the original intact
my $trimmed = $s =~ s/^\s+|\s+$//gr;   # [5.14+] /r returns the modified copy
```

### `chomp`, `chop`, `chr`, `ord`

```perl
chomp(my $line = <STDIN>);          # remove a trailing $/ (newline)
chomp @lines;                       # chomps every element
chop $s;                            # remove the last character, whatever it is
chr(65);   ord('A');                # 'A' / 65
chr(0x263A);                        # a Unicode character (needs output encoding)
```

### Searching & extracting

```perl
index("hello world", "o");          # 4   (first occurrence, -1 if none)
index("hello world", "o", 5);       # 7   (start searching at offset 5)
rindex("hello world", "o");         # 7   (last occurrence)

substr("abcdef", 2);                # "cdef"
substr("abcdef", 1, 3);             # "bcd"
substr("abcdef", -2);               # "ef"
substr("abcdef", 1, -1);            # "bcde"

my $str = "Hello, World";
substr($str, 0, 5) = "HELLO";       # lvalue substr — modifies $str
substr($str, 0, 5, "Howdy");        # 4-arg form: replace in place
```

### Splitting & joining

```perl
split /,/, "a,b,c";                 # ('a','b','c')
split /,/, "a,b,,,";                # ('a','b')        trailing empties removed
split /,/, "a,b,,,", -1;            # ('a','b','','','') keep trailing empties
split /,/, "a,b,c,d", 2;            # ('a', 'b,c,d')   at most 2 fields
split //, "abc";                    # ('a','b','c')    every character
split ' ', "  a   b  c ";           # ('a','b','c')    awk-style: trims and collapses whitespace
split /(,)/, "a,b";                 # ('a', ',', 'b')  captures are kept in the result

join ', ', qw(a b c);               # "a, b, c"
join '', map { chr(ord($_)+1) } split //, 'HAL';   # "IBM"
```

### `sprintf` / `printf` formatting

```perl
sprintf("%s",   "text");            # string
sprintf("%d",   42);                # integer
sprintf("%5d",  42);                # "   42"  width 5, right-aligned
sprintf("%-5d|", 42);               # "42   |"  left-aligned
sprintf("%05d", 42);                # "00042"   zero-padded
sprintf("%+d",  42);                # "+42"     always show sign
sprintf("%.2f", 3.14159);           # "3.14"
sprintf("%8.3f", 3.14159);          # "   3.142"
sprintf("%e",   12345.678);         # "1.234568e+04"
sprintf("%g",   0.0000123);         # "1.23e-05"
sprintf("%x %X %o %b", 255, 255, 8, 5);   # "ff FF 10 101"
sprintf("%#x %#o %#b", 255, 8, 5);        # "0xff 010 0b101"
sprintf("%s has %d items", $n, $c);
sprintf("%3\$s %1\$s %2\$s", "a", "b", "c");   # positional args: "c a b"
sprintf("%*d", 6, 42);              # width taken from the arguments: "    42"
sprintf("%%");                      # literal percent sign
sprintf("%vd", "1.22.333");         # version string: "1.22.333"
sprintf("%.3s", "abcdef");          # precision truncates strings: "abc"
```

### `tr///` (transliteration)

```perl
(my $u = $s) =~ tr/a-z/A-Z/;        # uppercase
my $vowels = ($s =~ tr/aeiou//);    # COUNT vowels (empty replacement counts, no change)
$s =~ tr/a-zA-Z//cd;                # /c complement + /d delete: strip non-letters
$s =~ tr/ //s;                      # /s squeeze repeated spaces to one
my $rot13 = $s =~ tr/A-Za-z/N-ZA-Mn-za-m/r;    # /r returns a copy [5.14+]
```

### Here-documents

```perl
print <<"END";                      # interpolates variables (like "...")
Name:  $name
Total: @{[ $a + $b ]}
END

print <<'END';                      # no interpolation (like '...')
Literal $name and \n stay as written.
END

print <<~EOT;                       # [5.26+] indented heredoc: leading whitespace stripped
    This text is indented in the source,
    but the common indentation is removed in the output.
    EOT

my $sql = lc(<<SQL);                # a heredoc is just a string expression
SELECT * FROM users
SQL
```

### Useful string functions

```perl
lc($a) eq lc($b);                   # case-insensitive equality
fc($a) eq fc($b);                   # [5.16+] Unicode-correct case folding (use feature 'fc')
my $quoted = join ",", map { "'$_'" } @list;      # 'a','b','c'
my $title  = $s =~ s/(\w+)/\u$1/gr;              # capitalise each word (\u = next char upper)
my $proper = $s =~ s/(\w+)/\L\u$1/gr;            # lower-case the word, then upper-case its first letter
quotemeta("a.b*c");                 # "a\.b\*c"  -- escape regex metacharacters
```

### String comparison operators

| Numeric | String | Meaning |
|---|---|---|
| `==` | `eq` | equal |
| `!=` | `ne` | not equal |
| `<` | `lt` | less than |
| `>` | `gt` | greater than |
| `<=` | `le` | less or equal |
| `>=` | `ge` | greater or equal |
| `<=>` | `cmp` | three-way compare (-1, 0, 1) |

> Using `==` on strings or `eq` on numbers is the single most common Perl bug. `"abc" == "xyz"` is **true** (both numify to 0) and warns under `use warnings`.

### Pack & unpack (binary data)

```perl
my $bin = pack("A3 n C", "abc", 258, 65);   # 3-char string, big-endian 16-bit, unsigned char
my ($s, $n, $c) = unpack("A3 n C", $bin);

pack("N", 1);                       # 32-bit big-endian
pack("V", 1);                       # 32-bit little-endian
pack("H*", "48656c6c6f");           # "Hello"  (hex string -> bytes)
unpack("H*", "Hello");              # "48656c6c6f"
unpack("%32C*", $data) % 65535;     # simple 16-bit checksum
unpack("(A2)*", "aabbcc");          # ('aa','bb','cc') — fixed-width split
```

---

## 5. Numbers & Math

### Arithmetic operators

```perl
7 + 3;   7 - 3;   7 * 3;
7 / 2;                  # 3.5   (Perl division is floating point)
int(7 / 2);             # 3     (truncate toward zero)
7 % 3;                  # 1     modulus (result takes the sign of the right operand)
-7 % 3;                 # 2
2 ** 10;                # 1024  exponent (right-associative)
++$i;  $i++;  --$i;  $i--;
$x += 5;  $x -= 5;  $x *= 5;  $x /= 5;  $x **= 2;  $x %= 3;
$x .= "s";   $x x= 3;   $x ||= 1;   $x &&= 1;   $x //= 1;
```

### Builtin math functions

```perl
abs(-5);                # 5
sqrt(16);               # 4
int(-3.7);              # -3
exp(1);                 # e
log(exp(2));            # 2     (natural log; log10 is in POSIX)
sin(0);   cos(0);   atan2(1, 1) * 4;    # pi
hex("ff");              # 255
oct("0755");            # 493
oct("0xff");            # 255
oct("0b101");           # 5
rand(10);               # float in [0, 10)
int(rand(6)) + 1;       # dice roll
srand(42);              # seed for reproducible sequences
```

### Rounding

```perl
use POSIX qw(floor ceil fmod pow round);

floor(3.7);             # 3
ceil(3.2);              # 4
floor(-3.7);            # -4
sprintf("%.0f", 2.5);   # "2"  (banker's rounding from the C library: round-half-even)
sprintf("%.2f", 1.005); # "1.00" (binary floating-point representation!)
POSIX::round(2.5);      # 3   [POSIX 5.22+] round half away from zero
int($x + 0.5);          # naive round for positive numbers
```

### Floating point caution

```perl
0.1 + 0.2 == 0.3;                           # FALSE
abs(0.1 + 0.2 - 0.3) < 1e-9;                # true — compare with a tolerance
```

Use `bigint`, `bignum`, `Math::BigInt` or `Math::BigFloat` for exact/arbitrary precision:

```perl
use Math::BigInt;
my $f = Math::BigInt->new(1);
$f *= $_ for 1 .. 30;
say $f;                 # 265252859812191058636308480000000

use bigint;             # lexically makes all integer literals BigInts
say 2 ** 100;           # 1267650600228229401496703205376
```

### Numeric checks

```perl
use Scalar::Util qw(looks_like_number);
looks_like_number("12.5e3");        # true
"42" =~ /^-?\d+$/;                  # is an integer
"3.14" =~ /^-?\d+(?:\.\d+)?$/;      # is a decimal
$n % 2 == 0;                        # even
```

### Ranges

```perl
my @r  = (1 .. 5);                  # 1 2 3 4 5
my @az = ('a' .. 'e');              # a b c d e
my @aa = ('aa' .. 'ad');            # aa ab ac ad (magic string increment)
my @rv = reverse 1 .. 5;
for my $i (reverse 0 .. $#list) { ... }
```

### Random & shuffling

```perl
use List::Util qw(shuffle sum sum0 min max first reduce);

my @shuffled = shuffle @items;
my $pick     = $items[ rand @items ];
my $total    = sum(@nums);          # undef for an empty list
my $safe     = sum0(@nums);         # 0 for an empty list
```

### Bitwise operators

```perl
5 & 3;    # 1     AND
5 | 3;    # 7     OR
5 ^ 3;    # 6     XOR
~5 & 0xFF;# 250   NOT (mask to the width you need; perl integers are 64-bit)
1 << 4;   # 16    shift left
256 >> 2; # 64    shift right
```

> Bitwise operators act on **numbers** when both operands are numbers and on **strings** when both are strings. Use `use feature 'bitwise'` [5.28+] to get unambiguous `|.` `&.` `^.` for strings.

---

## 6. Arrays

### Creating & accessing

```perl
my @a = (10, 20, 30, 40);
my @empty = ();
my @copy  = @a;                     # copy (shallow)
my $n     = @a;                     # scalar(@a) — number of elements: 4
my $last  = $#a;                    # index of the last element: 3
$a[0];   $a[-1];   $a[$#a];         # first / last / last
@a[1, 2];                           # slice: (20, 30)
@a[1 .. $#a];                       # everything except the first
@a[-2, -1];                         # last two
my ($x, $y) = @a[0, 1];
$#a = 1;                            # truncate to 2 elements
$#a = -1;   @a = ();                # empty the array
```

### Adding & removing

```perl
push    @a, 50;                     # add to the end (returns new length)
push    @a, 60, 70;
pop     @a;                         # remove and return the last
unshift @a, 0;                      # add to the front
shift   @a;                         # remove and return the first

splice(@a, 1, 2);                   # remove 2 elements starting at index 1 (returns them)
splice(@a, 1, 0, 'x', 'y');         # insert at index 1
splice(@a, 1, 2, 'z');              # replace 2 elements with 'z'
splice(@a, -2);                     # remove the last 2
```

### Iterating

```perl
for my $item (@a)            { say $item }
for my $i (0 .. $#a)         { say "$i: $a[$i]" }
while (my ($i, $v) = each @a) { say "$i=$v" }         # index/value pairs
for my ($i, $v) (builtin::indexed @a) { ... }          # [5.36+, stable in 5.40] index + value
say "$_" for @a;                                      # statement modifier
```

### Transforming — `map`, `grep`, `sort`, `reverse`

```perl
my @doubled = map  { $_ * 2 }        @nums;
my @evens   = grep { $_ % 2 == 0 }   @nums;
my $count   = grep { /foo/ }         @lines;          # scalar context: count of matches
my @pairs   = map { [$_, length $_] } @words;
my %lookup  = map { $_ => 1 }        @words;          # set from a list
my %index   = map { $words[$_] => $_ } 0 .. $#words;
my @flat    = map { @$_ } @aoa;                       # flatten one level
my @sorted  = sort { $a <=> $b }     @nums;
my @rev     = reverse @a;
my @uniq    = do { my %s; grep { !$s{$_}++ } @a };    # dedupe, preserving order
```

> Inside a `map` block a leading `{` may be mistaken for an anonymous hash. Use `+{ ... }` for a hash or `{; ... }` / `map { ("$_" => 1) }` to force a block:
> `map { +{ name => $_ } } @names` builds a list of hashrefs.

### Searching

```perl
use List::Util qw(first any all none sum max min);

my $found  = first { $_ > 10 } @nums;          # first matching element or undef
my $has    = any  { $_ eq 'x' } @list;         # true if any element matches
my $every  = all  { $_ > 0 }    @nums;         # true if all match
my $none   = none { $_ < 0 }    @nums;
my ($idx)  = grep { $a[$_] eq 'x' } 0 .. $#a;  # index of first match
say "yes" if grep { $_ eq 'x' } @a;            # membership (O(n))
```

### Joining, slicing, and other utilities

```perl
join(',', @a);
wantarray;                                     # see section 8
exists $a[5];                                  # is index 5 populated?
delete $a[5];                                  # avoid: use splice
scalar(@a);   scalar(reverse 'ab');
my @sorted_copy = sort @a;                     # default sort is ASCII string order
my ($min, $max) = (sort { $a <=> $b } @n)[0, -1];
my @chunk = @a[0 .. 2];
```

### Multi-dimensional arrays (arrays of arrays)

```perl
my @matrix = ([1, 2, 3], [4, 5, 6], [7, 8, 9]);
say $matrix[1][2];                             # 6
push @{ $matrix[0] }, 99;                      # push onto an inner array
push $matrix[0]->@*, 99;                       # [5.24+] postfix deref
for my $row (@matrix) { say join ' ', @$row }
my @transposed = map { my $c = $_; [ map { $_->[$c] } @matrix ] } 0 .. 2;
```

### List::Util & friends

```perl
use List::Util qw(reduce pairs pairkeys pairvalues uniq uniqnum shuffle head tail zip mesh);

my $sum  = reduce { $a + $b } @nums;
my $maxs = reduce { length($a) >= length($b) ? $a : $b } @words;
my @u    = uniq @list;                          # dedupe (string comparison)
my @top3 = head 3, @sorted;
my @pairs = pairs (a => 1, b => 2);             # ([a,1],[b,2])
```

### Common gotchas

```perl
my @a = (1, 2, 3);
my $s = @a;              # 3        scalar assignment gives the COUNT
my ($f) = @a;            # 1        list assignment gives the first element
print "n=" . @a . "\n";  # concatenation forces scalar context: n=3
print "@a[0,1]\n";       # 1 2
my @b = (@a, 4);         # arrays flatten — nothing nested happens
my @c = (\@a, 4);        # to nest, use a reference
```

---

## 7. Hashes

### Creating & accessing

```perl
my %age = (
    Ada   => 36,
    Linus => 54,
);
my %copy = %age;
my %empty;

$age{Ada};                          # 36
$age{'New Key'} = 1;                # quote keys that aren't simple words
$age{Bob} //= 20;                   # set if undefined
@age{qw(Ada Linus)};                # hash slice -> (36, 54)
@age{qw(x y)} = (1, 2);             # slice assignment
my %sub = map { $_ => $age{$_} } grep { exists $age{$_} } qw(Ada Bob);
my %slice = %age{qw(Ada Linus)};    # [5.20+] key/value slice
```

### Existence, deletion, size

```perl
exists $age{Ada};                   # key present? (true even if the value is undef)
defined $age{Ada};                  # key present AND value defined?
delete $age{Ada};                   # remove (returns the value)
delete @age{qw(a b)};               # delete a slice
my $count = keys %age;              # number of entries
my $has_any = %age ? 1 : 0;         # empty hash is false
%age = ();                          # clear
```

### Iterating

```perl
for my $k (keys %age)                { say "$k => $age{$k}" }
for my $k (sort keys %age)           { ... }                     # deterministic order
for my $v (values %age)              { $v++ }                    # values() are ALIASES — this modifies the hash
while (my ($k, $v) = each %age)      { say "$k=$v" }
for my $k (sort { $age{$a} <=> $age{$b} } keys %age) { ... }      # sort by value
for my $k (sort { $age{$b} <=> $age{$a} || $a cmp $b } keys %age) { ... }   # value desc, then key asc
```

> Hash order is **pseudo-random** and changes between runs by design (hash-seed randomisation). Never depend on it; use `sort keys`.
> Do not add or delete keys while iterating with `each` (deleting the current key is safe).

### Inverting, merging, counting

```perl
my %inverse = reverse %h;                       # values must be unique
my %merged  = (%defaults, %overrides);          # right side wins
my %count;   $count{$_}++ for @words;           # word frequencies
my %seen;    my @uniq = grep { !$seen{$_}++ } @list;
my %group;   push @{ $group{ $_->{type} } }, $_ for @records;   # group by a field
```

### Hash of arrays / hash of hashes

```perl
my %hoa = (fruits => ['apple', 'pear'], veg => ['kale']);
push @{ $hoa{fruits} }, 'plum';
say $hoa{fruits}[0];
say scalar @{ $hoa{fruits} };

my %hoh = (ada => { age => 36, lang => 'Perl' });
$hoh{ada}{age}++;
for my $name (sort keys %hoh) {
    for my $field (sort keys %{ $hoh{$name} }) {
        say "$name.$field = $hoh{$name}{$field}";
    }
}
```

### Nested existence — beware autovivification

```perl
my %h;
if (exists $h{a}{b}) { ... }        # creates $h{a} = {} as a side effect!
if ($h{a} && exists $h{a}{b}) { ... }   # safe
# Or: use the `no autovivification;` pragma from CPAN.
```

### Hash functions & modules

```perl
use List::Util qw(pairs pairmap);
my %h = (a => 1, b => 2);
my @kv = map { "$_=$h{$_}" } sort keys %h;

use Hash::Util qw(lock_keys unlock_keys lock_hash);
lock_keys(%h);                      # typo protection: unknown keys now croak
```

### Ordered hashes

Perl hashes are unordered. If you need insertion order, either keep a parallel array of keys or use `Tie::IxHash` (CPAN):

```perl
use Tie::IxHash;
tie my %ordered, 'Tie::IxHash';
%ordered = (z => 1, a => 2, m => 3);
say join ',', keys %ordered;        # z,a,m
```

---

## 8. Context — Scalar vs List

Every Perl expression is evaluated in a **context** that the surrounding code dictates: **scalar**, **list** or **void**. The same expression can return different things.

```perl
my @a = (5, 6, 7);

my $count = @a;              # scalar context -> 3
my ($first) = @a;            # list context   -> 5
my $last = $a[-1];
print "Count: " . @a . "\n"; # . is a scalar operator -> 3
print "Count: ", scalar(@a), "\n";
if (@a > 2) { ... }          # numeric comparison -> scalar context
```

### Context-sensitive builtins

```perl
my $now  = localtime;            # "Sun Sep 20 16:20:00 2026"  (scalar: string)
my @now  = localtime;            # (sec,min,hour,mday,mon,year,wday,yday,isdst)
my $n    = () = $text =~ /\w+/g; # count matches
my @m    = $text =~ /(\d+)/g;    # all captures
my ($k)  = $text =~ /(\w+)/;     # first capture (list assignment)
my $ok   = $text =~ /\d/;        # scalar: true/false
my $rev  = reverse "abc";        # scalar reverse -> "cba"... (when assigned to a scalar)
print reverse "abc";             # LIST context -> prints "abc" unchanged!
print scalar reverse "abc";      # "cba"
```

### `wantarray` — let a sub know how it was called

```perl
sub context {
    return wantarray ? 'list'
         : defined wantarray ? 'scalar'
         : 'void';
}
my @l = context();      # list
my $s = context();      # scalar
context();              # void
```

Use it to return a list in list context and a count/summary in scalar context, but do so sparingly — surprising context-dependent behaviour hurts readability.

### Returning lists

```perl
sub minmax { my @s = sort { $a <=> $b } @_; return ($s[0], $s[-1]) }
my ($min, $max) = minmax(3, 1, 2);
my $x = minmax(3, 1, 2);            # comma operator in scalar context: returns the LAST value (3)
```

### Forcing context

```perl
scalar(@a);             # force scalar
my ($x) = @a;           # force list
"@{[ f() ]}";           # force list inside a string
!!$value;               # normalise to boolean (1 or "")
+@a;                    # numeric (scalar) context
```

---

## 9. Control Flow — `if` / `elsif` / `else` / `unless`

### Basic forms

```perl
if ($x > 0) {
    say "positive";
}
elsif ($x < 0) {
    say "negative";
}
else {
    say "zero";
}

unless ($ok) { say "not ok" }               # inverse of `if`
unless ($a) { ... } else { ... }            # legal, but confusing — prefer `if`
```

> Braces are **mandatory** on block-form `if`/`elsif`/`else` — there is no single-statement brace-less form.

### Statement modifiers

```perl
say "big"       if $n > 100;
say "not empty" unless $s eq '';
$i++            while $i < 10;
$i--            until $i <= 0;
print "$_\n"    for @list;
do_thing()      or die "failed: $!";       # `or` for control flow
open(my $fh, '<', $f) || die ...;          # note: `||` binds tighter than `or`!
```

### Logical operators

- `&&`, `||`, `!`, `//` — high-precedence and / or / not / defined-or. Use them **in expressions**.
- `and`, `or`, `not`, `xor` — low-precedence versions. Use them **for control flow** (`... or die`).

```perl
my $v = $a || $b;          # first true value
my $w = $a && $b;          # $a if false, else $b
my $x = $a // $b;          # first defined value

open(my $fh, '<', $file) || die "...";        # BUG-PRONE: fine with parentheses, but without them...
open my $fh, '<', $file || die "...";         # BUG: parses as open(my $fh, '<', ($file || die)) — die never fires
open my $fh, '<', $file or die "...: $!";     # correct: `or` binds looser than the list operator
```

### Ternary operator

```perl
my $label = $n == 1 ? 'item' : 'items';
my $size  = $n < 10 ? 'small'
          : $n < 100 ? 'medium'
          :            'large';                # chained
($cond ? $x : $y) = 5;                          # the ternary is an lvalue
```

### Comparison chaining `[5.32+]`

```perl
if (0 < $x < 10) { ... }            # chained comparison
if ($a == $b == $c) { ... }         # all equal
```

### Smartmatch & `given/when` (avoid)

`~~`, `given` and `when` are **experimental and deprecated** and behave surprisingly. Use `if/elsif` chains or a dispatch table instead:

```perl
my %dispatch = (
    start => \&start,
    stop  => \&stop,
    _     => sub { die "unknown command\n" },
);
($dispatch{$cmd} // $dispatch{_})->(@args);
```

### `for` as a switch

```perl
for ($input) {
    if (/^\d+$/)  { say "number";    last }
    if (/^\w+$/)  { say "word";      last }
    say "other";
}
```

### Truthiness recap

```perl
if ($s)              # false for: undef, "", "0", 0
if (defined $s)      # tests for undef only
if (length $s)       # non-empty string (warns if undef in older perls)
if (@a)              # array has elements
if (%h)              # hash has entries
if (!@a)             # array is empty
```

---

## 10. Loops — `for` / `foreach` / `while` / `until`

### `foreach`

```perl
for my $x (@list)          { say $x }
foreach my $i (1 .. 10)    { say $i }
for (@list)                { say }               # $_ is the alias
for my $x (@list)          { $x *= 2 }           # $x is an ALIAS: modifies @list in place
for my ($k, $v) (%hash)    { say "$k=$v" }       # [5.36+ experimental, stable in 5.40] several values at once
for my $i (reverse 0 .. $#a) { ... }
```

### C-style `for`

```perl
for (my $i = 0; $i < 10; $i++) { say $i }
for (my ($i, $j) = (0, 10); $i < $j; $i++, $j--) { ... }
for (;;) { last if done() }                      # infinite loop
```

### `while` / `until`

```perl
my $i = 0;
while ($i < 5) { say $i++ }
until ($i == 0) { $i-- }

while (my $line = <$fh>) { chomp $line; ... }    # defined() is added automatically
while (<$fh>)            { chomp; say }          # assigns to $_
while (my ($k, $v) = each %h) { ... }
do { $i++ } while ($i < 10);                     # body runs at least once
do { $i++ } until  ($i >= 10);
```

> `do {} while` is **not** a real loop: `last`/`next` do not work inside it. Wrap it in an outer bare block, or restructure with `while (1) { ...; last if ... }`.

### Loop control

```perl
next;                # jump to the next iteration
last;                # leave the loop
redo;                # restart the current iteration without re-evaluating the condition
next if /^#/;
last unless defined $line;

OUTER:
for my $i (1 .. 3) {
    for my $j (1 .. 3) {
        next OUTER if $j == 2;          # labels target an outer loop
        last OUTER if $i == 3;
        say "$i,$j";
    }
}
```

### `continue` block

```perl
my $i = 0;
while ($i < 10) {
    next if $i % 2;
    say $i;
} continue {
    $i++;                # runs even when `next` is used
}
```

### Bare blocks as loops

```perl
{
    last if $done;       # a bare block is a loop that runs once
    ...
}
```

### Iterating with an index and value

```perl
while (my ($i, $v) = each @a) { say "$i: $v" }
for my $i (0 .. $#a)          { say "$i: $a[$i]" }
use List::Util qw(pairs);
for my $p (pairs %h) { my ($k, $v) = @$p; ... }
```

### Reading input line by line

```perl
while (my $line = <STDIN>) {
    chomp $line;
    last if $line eq 'quit';
    say "you typed: $line";
}

while (<>) {                    # every line of every file on the command line (or STDIN)
    chomp;
    say "$ARGV:$.: $_";
}
```

### Loop performance notes

```perl
# Avoid building big temporary lists just to loop over them:
for my $i (1 .. 1_000_000) { ... }      # a range in foreach is lazy — no list is built
for my $x (grep { ... } @huge) { ... }  # builds the full filtered list first
```

---

## 11. Subroutines

### Defining & calling

```perl
sub greet {
    my ($name, $greeting) = @_;         # unpack @_ into lexicals immediately
    $greeting //= 'Hello';
    return "$greeting, $name!";
}

say greet('Ada');
say greet('Ada', 'Hi');
my $r = greet 'Ada';                    # parentheses optional when predeclared
```

### Signatures `[5.20+, stable in 5.36]`

```perl
use v5.36;                              # enables signatures

sub add ($x, $y)                { return $x + $y }
sub greet ($name, $greeting = 'Hello') { "$greeting, $name!" }   # default value
sub log_it ($level, @messages)  { ... }                           # slurpy array
sub opts ($first, %options)     { ... }                           # slurpy hash
sub ignore ($, $second)         { ... }                           # placeholder for an ignored argument
sub defaults ($x, $y //= 10)    { ... }                           # [5.38+] //= and ||= defaults
```

A signature enforces the argument count (`Too few arguments for subroutine`).

### Return values

```perl
return;                                 # empty list / undef, depending on context
return 42;
return (1, 2, 3);                       # list
return wantarray ? @list : \@list;
sub implicit { my $x = shift; $x * 2 }  # last evaluated expression is returned
```

> Don't write `return undef;` for "nothing" — in list context it gives a one-element list `(undef)` that is **true**. Write a bare `return;`.

### `@_` aliasing & `shift`

```perl
sub increment { $_[0]++ }               # @_ elements are ALIASES of the caller's variables
my $n = 1;  increment($n);  say $n;    # 2

sub first_arg { my $x = shift; ... }    # shift with no args works on @_ inside a sub
sub top       { my $x = shift; ... }    # ... but on @ARGV outside any sub
```

### Named arguments (hash-style)

```perl
sub connect_db {
    my %args = (host => 'localhost', port => 5432, @_);   # defaults, overridden by caller
    ...
}
connect_db(host => 'db1', port => 5433);

sub connect_ref {
    my ($args) = @_;                    # hashref style
    my $host = $args->{host} // 'localhost';
}
connect_ref({ host => 'db1' });
```

### Passing arrays & hashes

```perl
sub total { my @nums = @_; my $t = 0; $t += $_ for @nums; $t }
total(@list);                           # arrays are FLATTENED into @_

sub by_ref { my ($aref, $href) = @_; push @$aref, 1; $href->{k} = 'v' }
by_ref(\@list, \%hash);                 # pass references to keep them intact
```

### Anonymous subs & closures

```perl
my $add = sub ($a, $b) { $a + $b };
say $add->(2, 3);
say &$add(2, 3);
say &{$add}(2, 3);

sub make_counter {
    my $n = shift;
    return sub { return $n++ };         # closure captures $n
}
my $c1 = make_counter(5);
say $c1->(), $c1->();                   # 5 6

my @subs = map { my $i = $_; sub { $i * 2 } } 1 .. 3;   # each closure has its own $i
say $_->() for @subs;
```

### Function references & dispatch tables

```perl
sub hello { say "hello @_" }
my $ref = \&hello;
$ref->('world');
&$ref('world');
&hello;                                 # calls hello with the CURRENT @_ (no parentheses!)

my %actions = (
    add => sub ($x, $y) { $x + $y },
    mul => sub ($x, $y) { $x * $y },
);
say $actions{$op}->(3, 4) if exists $actions{$op};
```

### Recursion

```perl
sub fact { my $n = shift; $n <= 1 ? 1 : $n * fact($n - 1) }

use feature 'current_sub';
my $fib = sub ($n) { $n < 2 ? $n : __SUB__->($n - 1) + __SUB__->($n - 2) };

sub fib_memo {
    state %cache;
    my $n = shift;
    return $cache{$n} //= $n < 2 ? $n : fib_memo($n - 1) + fib_memo($n - 2);
}
```

### `state` variables

```perl
use feature 'state';
sub next_id { state $id = 0; return ++$id }
say next_id() for 1 .. 3;               # 1 2 3
```

### Prototypes (mostly avoid)

```perl
sub mymax(\@) { ... }                   # forces an array reference
sub apply(&@) { my ($code, @list) = @_; map { $code->($_) } @list }
my @r = apply { $_[0] * 2 } 1, 2, 3;    # `&` prototype lets the caller write a block
```

Prototypes change **parsing**, not argument validation. Signatures (above) are what you want for argument handling.

### `caller` & introspection

```perl
sub whoami {
    my ($package, $file, $line, $sub) = caller(0);
    return $sub;                        # "main::whoami"
}
sub trace { my $i = 0; while (my @c = caller($i++)) { say "$c[3] at $c[1] line $c[2]" } }
say __PACKAGE__;   say __FILE__;   say __LINE__;   say __SUB__ // '';
defined &name;                          # does sub `name` exist?
```

### `local` in subs

```perl
our $indent = 0;
sub visit { local $indent = $indent + 2; ...; visit($child) }     # restored on return
```

### Lvalue subs & context-aware returns (advanced)

```perl
my $val = 5;
sub value :lvalue { $val }
value() = 10;                           # assigns to $val
```

### Sub attributes

```perl
sub cached :prototype($) { ... }
sub method :method { ... }
```

---

## 12. References & Complex Data Structures

### Creating references

```perl
my @arr  = (1, 2, 3);
my %hash = (a => 1);
my $s    = "text";
sub func { ... }

my $aref = \@arr;                       # reference to an array
my $href = \%hash;
my $sref = \$s;
my $cref = \&func;
my $rref = \$aref;                      # ref to a ref

my $anon_a = [1, 2, 3];                 # anonymous array
my $anon_h = { name => 'Ada', tags => ['a', 'b'] };    # anonymous hash
my $anon_c = sub { return 42 };         # anonymous code
```

### Dereferencing

```perl
@$aref;             @{$aref};           $aref->@*;          # whole array   (last form: [5.24+])
$$aref[0];          ${$aref}[0];        $aref->[0];         # element
@{$aref}[1, 2];     $aref->@[1, 2];                          # array slice
$#{$aref};          $#$aref;            $aref->$#*;         # last index
%$href;             %{$href};           $href->%*;
$$href{a};          ${$href}{a};        $href->{a};
@{$href}{qw(a b)};  $href->@{qw(a b)};                       # hash slice
$$sref;             ${$sref};           $sref->$*;
&$cref(1);          &{$cref}(1);        $cref->(1);
scalar @$aref;      scalar $aref->@*;
```

### Arrow rules

The arrow between two **subscripts** is optional; the first arrow is required.

```perl
my $data = { users => [ { name => 'Ada', langs => ['Perl', 'C'] } ] };
$data->{users}->[0]->{name};            # explicit
$data->{users}[0]{name};                # idiomatic
$data->{users}[0]{langs}[-1];           # C
```

### Inspecting references

```perl
ref($aref);          # ARRAY
ref($href);          # HASH
ref($cref);          # CODE
ref($sref);          # SCALAR
ref($rref);          # REF
ref(qr/x/);          # Regexp
ref(\*STDOUT);       # GLOB
ref($obj);           # the class name for a blessed reference
"$aref";             # ARRAY(0x55d0c8a3b2a0)  (address as a string)
$aref == $other;     # same-referent test (numeric address comparison)
```

### Nested structures

```perl
my %config = (
    server => {
        host  => 'localhost',
        ports => [80, 443],
    },
    users  => [
        { name => 'ada',   roles => ['admin', 'dev'] },
        { name => 'linus', roles => ['dev'] },
    ],
);

say $config{server}{ports}[1];                          # 443
push @{ $config{users}[0]{roles} }, 'ops';
push $config{users}[0]{roles}->@*, 'ops';               # postfix form
say scalar @{ $config{users} };
for my $u (@{ $config{users} }) {
    say "$u->{name}: @{ $u->{roles} }";
}
my @names = map { $_->{name} } @{ $config{users} };
my @admins = grep { grep { $_ eq 'admin' } @{ $_->{roles} } } @{ $config{users} };
```

### Copying — shallow vs deep

```perl
use Storable qw(dclone);
use Clone    qw(clone);                 # CPAN alternative

my @shallow = @$aref;                   # new top-level array; nested refs still shared
my $deep    = dclone($data);            # fully independent copy
```

### Autovivification

Perl creates intermediate containers on demand when you **write** through a path:

```perl
my %h;
$h{a}{b}{c} = 1;                        # creates $h{a} and $h{a}{b} automatically
push @{ $h{list} }, 'x';                # creates the array on first push
$h{count}{$_}++ for @words;
```

**Reading** through a missing path can also autovivify the intermediate levels:

```perl
if ($h{x}{y}) { ... }                   # $h{x} now exists (= {})!
```

### Weak references (break cycles)

```perl
use Scalar::Util qw(weaken isweak);
my $parent = { name => 'p' };
my $child  = { parent => $parent };
$parent->{child} = $child;              # cycle → memory leak
weaken($child->{parent});               # child no longer keeps the parent alive
```

### Reference counting & `undef`

Perl frees a value the instant its reference count reaches zero (deterministic destruction). Cycles are the only leak scenario — break them with `weaken`.

### Ref-to-ref and ref-of-anonymous

```perl
my @copy = @{ [1, 2, 3] };
my ($first) = @{ func_returning_aref() };
say "Value: ${\ $obj->name }";          # call a method inside a string via ${\ ... }
say "List: @{[ $obj->items ]}";         # or @{[ ... ]}
```

### Data::Dumper & pretty printing

```perl
use Data::Dumper;
$Data::Dumper::Sortkeys = 1;            # deterministic key order
$Data::Dumper::Indent   = 1;            # compact indentation
$Data::Dumper::Terse    = 1;            # omit `$VAR1 =`
print Dumper($data);
local $Data::Dumper::Deparse = 1;       # also dump code refs
```

### Circular structure check & type-safe walkers

```perl
sub walk {
    my ($node, $depth) = @_;
    $depth //= 0;
    my $pad = '  ' x $depth;
    if    (ref $node eq 'HASH')  { for my $k (sort keys %$node) { say "$pad$k:"; walk($node->{$k}, $depth + 1) } }
    elsif (ref $node eq 'ARRAY') { walk($_, $depth + 1) for @$node }
    else                         { say "$pad$node" }
}
```

---

## 13. Regular Expressions

Regexes are built into the language. The match operator is `m//` (`m` is optional with `/`), substitution is `s///`, and they bind to a string with `=~` (match) or `!~` (no match). Without a binding they operate on `$_`.

### Matching

```perl
if ($str =~ /foo/)        { ... }           # contains foo
if ($str !~ /foo/)        { ... }           # does not contain foo
if ($str =~ m{^/usr/bin}) { ... }           # pick your delimiter to avoid escaping slashes
if (/foo/)                { ... }           # matches against $_
my $matched = ($str =~ /foo/);              # 1 or ""
```

### Modifiers (flags)

| Flag | Meaning |
|---|---|
| `i` | Case-insensitive |
| `g` | Global — all matches (`s///g`) or iterate matches (`m//g`) |
| `m` | Multi-line: `^` and `$` match at every line boundary |
| `s` | Single-line: `.` also matches `\n` |
| `x` | Extended: ignore whitespace and allow `#` comments in the pattern |
| `xx` | [5.26+] Also ignore spaces/tabs inside `[...]` character classes |
| `e` | Evaluate the replacement part as Perl code (`s///e`) |
| `ee` | Evaluate twice (evaluate the result as code again) — dangerous |
| `r` | [5.14+] Return the modified copy, leave the original unchanged (`s///r`, `tr///r`) |
| `o` | Compile the pattern only once (rarely needed; use `qr//`) |
| `p` | Preserve `${^PREMATCH}` / `${^MATCH}` / `${^POSTMATCH}` |
| `a` | [5.14+] ASCII-restrict `\d \s \w` and POSIX classes |
| `u` / `l` / `d` | Unicode / locale / default character-set semantics |
| `n` | [5.22+] Non-capturing: plain `( )` groups don't capture |
| `c` | Keep `pos()` after a failed `m//g` match (used with `\G` lexers) |

### Metacharacters

```text
.        any character except newline (any character with /s)
^  $     start / end of string (start / end of each line with /m)
\A  \z   absolute start / absolute end of the string
\Z       end of string, or just before a final newline
\b  \B   word boundary / not a word boundary
\d  \D   digit / non-digit
\w  \W   word character [A-Za-z0-9_] / non-word
\s  \S   whitespace / non-whitespace
\h  \v   horizontal / vertical whitespace
\R       generic linebreak (\r\n, \n, \r ...)
\N       any character except newline (regardless of /s)
\K       "keep": discard everything matched so far from $&
[abc]    character class          [^abc]  negated class     [a-z0-9_]  ranges
[[:alpha:]] [[:digit:]] [[:space:]] [[:upper:]] [[:punct:]]  POSIX classes
\p{L}    Unicode property (letter)     \p{Lu} upper-case     \P{L}  negated
\x41  \x{263A}  \N{U+263A}  \t  \n  \r  \e  \0     character escapes
```

### Quantifiers

```text
*        0 or more (greedy)          *?       0 or more (lazy)          *+       possessive
+        1 or more                   +?       lazy                      ++       possessive
?        0 or 1                      ??       lazy                      ?+       possessive
{n}      exactly n                   {n,}     n or more                 {n,m}    n to m    {,m}  up to m [5.34+]
```

```perl
"aaa" =~ /a+?/;      # $& is "a"   (lazy: as few as possible)
"aaa" =~ /a+/;       # $& is "aaa" (greedy: as many as possible)
'"one" "two"' =~ /"(.*?)"/;      # lazy capture -> one
'"one" "two"' =~ /"([^"]*)"/;    # negated class: usually the clearer, faster choice
```

### Captures & alternation

```perl
if ($date =~ /^(\d{4})-(\d{2})-(\d{2})$/) {
    my ($y, $m, $d) = ($1, $2, $3);
}
my ($y, $m, $d) = $date =~ /^(\d{4})-(\d{2})-(\d{2})$/ or die "bad date";   # capture into a list

"color colour" =~ /colou?r/;                   # optional u
$str =~ /^(?:http|https|ftp):\/\//;            # (?: ) groups WITHOUT capturing
$str =~ /(cat|dog)s?/;                         # alternation
$str =~ /(\w)\1/;                              # backreference: a doubled letter ("ll")
$str =~ /(\w+) \g{1}/;                         # \g{1} — unambiguous numbered backreference
$str =~ /(\w+) \g{-1}/;                        # relative backreference (the previous group)
```

### Named captures

```perl
if ($line =~ /^(?<year>\d{4})-(?<mon>\d\d)-(?<day>\d\d)/) {
    say "$+{year}/$+{mon}/$+{day}";            # %+ holds the named captures
}
$str =~ /(?<word>\w+) \k<word>/;               # named backreference
```

### Global matching

```perl
my @all    = $text =~ /\d+/g;                  # list context: every match
my @pairs  = $text =~ /(\w+)=(\w+)/g;          # with groups: all captures, flattened
my %kv     = $text =~ /(\w+)=(\w+)/g;          # ... which conveniently builds a hash
my $count  = () = $text =~ /\d+/g;             # number of matches

while ($text =~ /(\w+)@(\w+\.\w+)/g) {         # scalar context: iterate one match at a time
    say "user=$1 domain=$2 at pos ", pos($text);
}
```

### Substitution

```perl
$s =~ s/foo/bar/;                   # first occurrence
$s =~ s/foo/bar/g;                  # all occurrences
$s =~ s/foo/bar/gi;                 # case-insensitive
my $new = $s =~ s/foo/bar/gr;       # non-destructive: returns the result
$s =~ s/(\w+)/<$1>/g;               # reference captures with $1
$s =~ s/(\w+) (\w+)/$2 $1/;         # swap two words
$s =~ s/^\s+|\s+$//g;               # trim
$s =~ s/\s+/ /g;                    # collapse whitespace
$s =~ s/(\d+)/$1 * 2/ge;            # /e: replacement is Perl code -> doubles every number
$s =~ s/(\w+)/\u\L$1/g;             # capitalise each word
$s =~ s{/usr/local}{/opt}g;         # different delimiters — no escaping needed
my $count = ($s =~ s/x/y/g);        # returns the number of substitutions made
s/(?<=\d)(?=(?:\d{3})+$)/,/g;       # add thousands separators: 1234567 -> 1,234,567
```

### Lookaround assertions

```perl
/foo(?=bar)/       # positive lookahead:  "foo" followed by "bar"
/foo(?!bar)/       # negative lookahead:  "foo" NOT followed by "bar"
/(?<=\$)\d+/       # positive lookbehind: digits preceded by "$"
/(?<!\$)\d+/       # negative lookbehind: digits NOT preceded by "$"
/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;    # password rule: digit + lower + upper + 8 chars
```

Lookbehind must be fixed-width (a limited variable-length form is allowed from 5.30).

### `x` flag — readable regexes

```perl
my $re = qr{
    ^ \s*
    (?<key>   [\w.-]+ )        # key
    \s* = \s*
    (?<value> .*? )            # value (lazy)
    \s* $
}x;

if ($line =~ $re) { say "$+{key} -> $+{value}" }
```

### `qr//` — compiled regex objects

```perl
my $word = qr/\b\w+\b/i;
my @hits = grep { /$word/ } @lines;
my $full = qr/^${word}\s+${word}$/;            # embed one qr// inside another
my @patterns = (qr/foo/, qr/bar/i);
my $any = join '|', map { quotemeta } @literals;
my $re2  = qr/\b(?:$any)\b/;                   # match any of a list of literal strings safely
$str =~ /^\Q$user_input\E$/;                   # \Q..\E quotes metacharacters in a variable
```

> Always `quotemeta` / `\Q..\E` untrusted input that is meant to be matched literally. Never build a pattern from raw user input — it enables regex injection and catastrophic backtracking (ReDoS).

### `pos`, `\G` and lexers

```perl
my $src = "let x = 42;";
for ($src) {
    while (1) {
        if    (/\G\s+/gc)         { next }
        elsif (/\G(let)\b/gc)     { say "KEYWORD $1" }
        elsif (/\G([A-Za-z_]\w*)/gc) { say "IDENT $1" }
        elsif (/\G(\d+)/gc)       { say "NUMBER $1" }
        elsif (/\G([=;])/gc)      { say "PUNCT $1" }
        else                      { last }
    }
}
```

### Positions: `@-` and `@+`

```perl
"hello world" =~ /(wor)/;
say "$-[0]..$+[0]";          # 6..9  whole match offsets
say "$-[1]..$+[1]";          # 6..9  group 1 offsets
```

### `split` with regexes

```perl
split /\s*,\s*/, "a , b,c";          # ('a','b','c')
split /(?<=,)/, "a,b,c";             # ('a,','b,','c')   split AFTER each comma
split /\R/, $text;                   # split on any linebreak style
split /\|/, "a|b|c";                 # escape a literal pipe
```

### Tricks

```perl
my ($first_word) = $s =~ /^(\w+)/;                      # capture with list assignment
my $ok = $s =~ /^\d+$/ ? 'number' : 'not number';
my @lines_with = grep { /error/i } @log;
my %h = map { /^(\w+)=(.*)$/ ? ($1 => $2) : () } @lines;   # parse key=value lines, skip the rest
(my $copy = $s) =~ s/x/y/;                              # pre-5.14 copy-and-modify
$s =~ tr/a-z//;                                         # count lower-case letters (see Strings)
```

### Performance & safety

- Anchor patterns (`^`, `\A`) whenever possible so a failed match ends quickly.
- Prefer specific character classes (`[^"]*`) over `.*?` to reduce backtracking.
- Nested quantifiers such as `(a+)+` can trigger **catastrophic backtracking** — avoid them or use possessive quantifiers (`(?:a++)+`) and atomic groups `(?>...)`.
- Don't use `$&`, `` $` `` and `$'` in old perls (< 5.20) — they slowed **every** regex in the program. Use `/p` with `${^MATCH}`.
- Precompile hot patterns with `qr//` outside the loop.
- Use the `re` pragma to debug: `use re 'debug';` or `perl -Mre=debug -e '...'`.

---

## 14. File I/O

### Opening files — always three-argument, lexical handles

```perl
open(my $in,  '<',  $path) or die "Cannot open $path: $!";   # read
open(my $out, '>',  $path) or die "Cannot open $path: $!";   # write (truncate)
open(my $app, '>>', $path) or die "Cannot open $path: $!";   # append
open(my $rw,  '+<', $path) or die "Cannot open $path: $!";   # read + write, no truncate
open(my $enc, '<:encoding(UTF-8)', $path) or die ...;        # decode UTF-8 while reading
open(my $mem, '<', \$string) or die ...;                     # read from an in-memory string
open(my $buf, '>', \my $output) or die ...;                  # write into an in-memory string
```

Modes: `<` read · `>` write · `>>` append · `+<` read/write · `+>` read/write (truncate) · `|-` pipe to a command · `-|` pipe from a command.

With `use autodie;` failures throw exceptions and you can omit the `or die`:

```perl
use autodie;
open(my $fh, '<', $path);           # dies with a descriptive message on failure
close($fh);
```

### Reading

```perl
while (my $line = <$in>) {          # one line at a time (low memory)
    chomp $line;
    ...
}
my @lines = <$in>;                  # list context: every line
chomp(my @clean = <$in>);           # ... with newlines removed
my $first = <$in>;                  # scalar context: next line
my $content = do { local $/; <$in> };    # slurp the whole file
read($in, my $buf, 4096);           # read up to N bytes/characters into $buf
my $ch = getc($in);                 # one character
eof($in);   eof();                  # end of file? / end of the last <> file
$.;                                 # current line number
```

### Slurping helpers

```perl
use Path::Tiny;                                     # CPAN
my $text  = path($file)->slurp_utf8;
my @lines = path($file)->lines_utf8({ chomp => 1 });
path($file)->spew_utf8($text);

use File::Slurper qw(read_text write_text);         # CPAN
my $t = read_text($file);
```

### Writing

```perl
print $out "text\n";                # NO comma after the filehandle
print {$out} "text\n";              # braces make complex handle expressions unambiguous
printf $out "%-10s %5d\n", $name, $n;
say $out "with newline";            # needs `use feature 'say'`
print {$ok ? *STDOUT : *STDERR} "message\n";
close($out) or die "Close failed: $!";      # checking close catches delayed write errors
```

### Standard handles

```perl
print STDOUT "normal\n";
print STDERR "error\n";
warn  "goes to STDERR\n";
my $answer = <STDIN>;
$| = 1;                              # unbuffer STDOUT
select(STDERR); $| = 1; select(STDOUT);     # unbuffer STDERR (older idiom)
use IO::Handle;  STDOUT->autoflush(1);      # OO way
```

### The diamond operator `<>`

```perl
# script.pl file1 file2   -> reads file1 then file2; with no args reads STDIN
while (<>) {
    chomp;
    print "$ARGV:$.: $_\n";
}
continue { close ARGV if eof }       # reset $. for each file

while (<<>>) { ... }                 # [5.22+] "double diamond": safe 3-arg open, no shell tricks
```

### In-place edit

```perl
{
    local ($^I, @ARGV) = ('.bak', $file);       # $^I enables in-place editing, keeps a .bak
    while (<>) { s/foo/bar/g; print }
}
```

### Encodings & layers

```perl
binmode(STDOUT, ':encoding(UTF-8)');            # encode output
binmode($fh);                                   # raw bytes (no CRLF translation on Windows)
use open qw(:std :encoding(UTF-8));             # default layer for all opens + std handles
open(my $fh, '<:raw', $file) or die ...;        # binary
```

### Seeking & truncating

```perl
seek($fh, 0, 0);                    # rewind (whence: 0 = start, 1 = current, 2 = end)
seek($fh, -10, 2);                  # 10 bytes before the end
my $pos = tell($fh);
truncate($fh, 0);
```

### Locking

```perl
use Fcntl qw(:flock SEEK_SET);
open(my $fh, '>>', $file) or die ...;
flock($fh, LOCK_EX) or die "flock: $!";         # exclusive lock (blocks)
print $fh "entry\n";
flock($fh, LOCK_UN);                            # released automatically on close
flock($fh, LOCK_EX | LOCK_NB) or say "busy";    # non-blocking attempt
```

### Temporary files

```perl
use File::Temp qw(tempfile tempdir);
my ($fh, $filename) = tempfile('myXXXXXX', TMPDIR => 1, UNLINK => 1);
my $dir = tempdir(CLEANUP => 1);                # removed on exit
my $tmp = File::Temp->new(SUFFIX => '.txt');    # OO: file deleted when object is destroyed
print $tmp "data\n";
say $tmp->filename;
```

### Pipes

```perl
open(my $ls, '-|', 'ls', '-l', $dir) or die "ls: $!";     # read from a command (list form: no shell)
while (<$ls>) { print }
close($ls);

open(my $sort, '|-', 'sort', '-n') or die;                 # write to a command
print $sort "$_\n" for @numbers;
close($sort);
```

### `local *FH` and bareword handles (legacy)

```perl
open(FH, "<$file") or die;          # OLD style: global bareword handle, 2-arg open — avoid
while (<FH>) { ... }
close(FH);
```

### CSV & structured formats

```perl
use Text::CSV;                                    # CPAN — use it; never `split /,/` real CSV
my $csv = Text::CSV->new({ binary => 1, auto_diag => 1 });
open(my $fh, '<:encoding(UTF-8)', 'data.csv') or die;
while (my $row = $csv->getline($fh)) { say join '|', @$row }

use JSON::PP;                                     # core module
my $data = decode_json(path('cfg.json')->slurp_raw);
my $json = JSON::PP->new->utf8->pretty->canonical->encode($data);
```

---

## 15. Filesystem — Tests, Directories & Paths

### File test operators

```perl
-e $path       # exists                          -f $path   # plain file
-d $path       # directory                       -l $path   # symbolic link
-r $path       # readable                        -w $path   # writable
-x $path       # executable                      -s $path   # size in bytes (false if empty)
-z $path       # exists and is empty             -M $path   # age in days since last modification
-A $path       # days since last access          -C $path   # days since inode change
-p $path       # named pipe                      -S $path   # socket
-T $path       # looks like text                 -B $path   # looks like binary
-t STDIN       # is a terminal (interactive)?

if (-e $file && -r _) { ... }        # `_` reuses the previous stat (saves a syscall)
if (-f -r -w $file) { ... }          # [5.10+] stacked tests
my $size = -s $file;
my $age_days = -M $file;
```

### `stat`

```perl
my @st = stat($file);
my ($mode, $size, $mtime) = @st[2, 7, 9];
printf "perms: %04o\n", $mode & 07777;

use File::stat;                                  # OO wrapper, overrides stat()
my $st = stat($file) or die "stat: $!";
say $st->size, ' ', scalar localtime($st->mtime);
```

### Directories

```perl
opendir(my $dh, $dir) or die "opendir $dir: $!";
my @entries = grep { !/^\.\.?$/ } readdir($dh);      # skip . and ..
closedir($dh);

my @files = glob("$dir/*.txt");                      # shell-style wildcards
my @more  = <$dir/*.{pl,pm}>;                        # brace expansion
mkdir($dir, 0755) or die "mkdir: $!";
rmdir($dir)       or die "rmdir: $!";                # only when empty
chdir($dir)       or die "chdir: $!";
```

### Files

```perl
unlink($file) or die "unlink: $!";                   # delete (returns number deleted)
unlink glob("*.tmp");
rename($old, $new) or die "rename: $!";
chmod(0644, $file);
chown($uid, $gid, $file);
utime($atime, $mtime, $file);
symlink($target, $link);   readlink($link);   link($existing, $new);
```

### Core file modules

```perl
use File::Copy qw(copy move);
copy($src, $dst) or die "copy: $!";
move($src, $dst) or die "move: $!";

use File::Path qw(make_path remove_tree);
make_path('a/b/c', { mode => 0755 });               # like mkdir -p
remove_tree('build');                                # like rm -rf

use File::Basename qw(basename dirname fileparse);
basename('/a/b/c.txt');                              # c.txt
dirname('/a/b/c.txt');                               # /a/b
my ($name, $path, $suffix) = fileparse('/a/b/c.txt', qr/\.[^.]*/);   # (c, /a/b/, .txt)

use File::Spec;
my $p = File::Spec->catfile('a', 'b', 'c.txt');      # portable path join
my $d = File::Spec->catdir('a', 'b');
my $t = File::Spec->tmpdir;
File::Spec->rel2abs('x');   File::Spec->abs2rel('/a/b', '/a');

use Cwd qw(getcwd abs_path realpath);
my $here = getcwd;
my $real = abs_path($file);                          # resolves symlinks and ..

use FindBin qw($Bin $Script);                        # directory of the running script
use lib "$FindBin::Bin/../lib";

use File::Compare;   compare($a, $b) == 0;           # are the files identical?
```

### Recursive traversal — `File::Find`

```perl
use File::Find;
find(sub {
    return unless -f && /\.pm$/;                     # $_ is the name, cwd is the directory
    say $File::Find::name;                           # full path
}, 'lib');

find({ wanted => \&wanted, no_chdir => 1 }, @dirs);  # no_chdir: $_ holds the full path
finddepth(sub { ... }, $dir);                        # children before parents (good for deleting)
```

### Recursive helper

```perl
sub walk_dir {
    my ($dir, $cb) = @_;
    opendir(my $dh, $dir) or return;
    for my $e (sort grep { !/^\.\.?$/ } readdir $dh) {
        my $full = "$dir/$e";
        -d $full ? walk_dir($full, $cb) : $cb->($full);
    }
}
walk_dir('.', sub { say shift });
```

### `Path::Tiny` (CPAN — highly recommended)

```perl
use Path::Tiny;
my $p = path('/tmp/demo');
$p->mkpath;
$p->child('a.txt')->spew_utf8("hello\n");
say for $p->children;                              # list entries
$p->visit(sub { say $_ }, { recurse => 1 });
$p->remove_tree;
```

### Portability notes

- Use `File::Spec` (or `Path::Tiny`) instead of hard-coding `/` or `\`.
- `$^O` gives the OS (`linux`, `darwin`, `MSWin32`); `File::Spec->devnull` is `/dev/null` or `nul`.
- Windows `-x` semantics and permission bits differ; `chmod` is mostly a no-op there.

---

## 16. Sorting & Searching

### `sort`

```perl
my @s = sort @words;                             # ASCII-betical order (NOT numeric)
my @n = sort { $a <=> $b } @nums;                # numeric ascending
my @d = sort { $b <=> $a } @nums;                # numeric descending
my @c = sort { lc($a) cmp lc($b) } @words;       # case-insensitive
my @r = reverse sort @words;
```

`$a` and `$b` are special package variables set by `sort`; **never** declare them with `my`.

### Multi-key sorting

```perl
my @sorted = sort {
       $a->{last}  cmp $b->{last}                # 1st: last name asc
    or $a->{first} cmp $b->{first}               # 2nd: first name asc
    or $b->{age}   <=> $a->{age}                 # 3rd: age desc
} @people;

for my $k (sort { $h{$b} <=> $h{$a} || $a cmp $b } keys %h) { ... }   # value desc, key asc
```

### Named sort subs

```perl
sub by_length { length($a) <=> length($b) or $a cmp $b }
my @s = sort by_length @words;
my $cmp = sub { $a <=> $b };
my @t = sort $cmp @nums;
```

### Schwartzian transform (expensive key)

```perl
my @sorted =
    map  { $_->[1] }                             # 3. unwrap
    sort { $a->[0] <=> $b->[0] }                 # 2. sort by the cached key
    map  { [ expensive($_), $_ ] }               # 1. wrap with the key
    @items;

# Guttman–Rosler / "orcish" variants avoid the array refs; cache hash:
my %cache;
my @s2 = sort { ($cache{$a} //= expensive($a)) <=> ($cache{$b} //= expensive($b)) } @items;
```

### Sorting by natural / version order

```perl
use Sort::Naturally;                             # CPAN: nsort
my @files = nsort qw(file10 file2 file1);        # file1 file2 file10

use version;
my @v = sort { version->parse($a) <=> version->parse($b) } qw(1.10.0 1.2.0 1.9.0);
```

### Stability & in-place

```perl
use sort 'stable';                               # (mergesort is stable in modern perls anyway)
@a = sort { $a <=> $b } @a;                      # sorts in place — optimised, no extra copy
```

### Binary search (sorted arrays)

```perl
sub bsearch {
    my ($aref, $target) = @_;
    my ($lo, $hi) = (0, $#$aref);
    while ($lo <= $hi) {
        my $mid = int(($lo + $hi) / 2);
        my $cmp = $aref->[$mid] <=> $target;
        return $mid if $cmp == 0;
        $cmp < 0 ? ($lo = $mid + 1) : ($hi = $mid - 1);
    }
    return -1;
}
```

### Top-N / min / max

```perl
use List::Util qw(min max minstr maxstr first);
my ($lo, $hi) = (min(@n), max(@n));
my @top3 = (sort { $b <=> $a } @n)[0 .. 2];
my ($longest) = sort { length($b) <=> length($a) } @words;
```

### Unique & set operations

```perl
use List::Util qw(uniq);
my @u = uniq @list;

my %in_b = map { $_ => 1 } @b;
my @intersection = grep {  $in_b{$_} } @a;
my @difference   = grep { !$in_b{$_} } @a;
my %seen;  my @union = grep { !$seen{$_}++ } (@a, @b);
```

---

## 17. Packages & Modules

### Packages (namespaces)

```perl
package Shape;                      # everything below belongs to Shape:: until another package
our $count = 0;                     # $Shape::count
sub new { ... }                     # Shape::new
1;                                  # a module file must return a true value (pre-5.38)

package main;                       # switch back
say $Shape::count;
Shape::new();
```

```perl
package Shape { ... }               # [5.14+] block form — scoped, no need to switch back
package Shape 1.02 { ... }          # with a version
```

### Writing a module

`lib/My/Utils.pm`:

```perl
package My::Utils;
use v5.36;
use Exporter 'import';              # provides `import` so `use My::Utils` works

our $VERSION   = '1.00';
our @EXPORT_OK = qw(trim clamp);                    # exported only on request
our %EXPORT_TAGS = (all => \@EXPORT_OK);            # use My::Utils qw(:all)
# our @EXPORT = qw(...);                            # exported by default: avoid, it pollutes namespaces

sub trim  ($s)             { $s =~ s/^\s+|\s+$//gr }
sub clamp ($v, $min, $max) { $v < $min ? $min : $v > $max ? $max : $v }

1;
```

Using it:

```perl
use lib 'lib';                                     # add a directory to @INC
use My::Utils qw(trim clamp);
say trim("  hi  ");
```

### `use`, `require`, `no`

```perl
use Module;                          # compile-time: require + import (executed while parsing)
use Module ();                       # load but do NOT call import
use Module qw(f1 f2);                # import specific names
use Module 1.50;                     # require at least this version
use v5.36;                           # require at least perl 5.36 (and enable its feature bundle)
no Module;                           # calls unimport
require Module;                      # run-time: load once when this line executes
require "path/to/file.pl";
eval { require Optional::Module; 1 } or say "not installed";
my $class = 'My::Plugin::' . $name;
(my $file = "$class.pm") =~ s{::}{/}g;
require $file;                       # dynamic module loading
$class->import;
```

### Module search path

```perl
say for @INC;                        # directories searched by use/require
use lib '/opt/perl/lib';             # compile-time addition to the front of @INC
use FindBin qw($Bin);  use lib "$Bin/lib";     # relative to the script
BEGIN { unshift @INC, '/x' }                    # same, manual
```

```bash
PERL5LIB=/path/to/lib perl script.pl             # environment variable
perl -I lib script.pl                            # command-line switch
perl -MMy::Utils -e 'print My::Utils::trim("  x ")'
```

### Special blocks

```perl
BEGIN { ... }        # runs as soon as it is compiled (before the rest of the file is parsed)
UNITCHECK { ... }    # after the unit is compiled
CHECK { ... }        # after the main program is compiled (LIFO)
INIT { ... }         # just before runtime starts (FIFO)
END { ... }          # at program exit, even after die/exit (LIFO) — good for cleanup
```

### Installing modules from CPAN

```bash
cpan Some::Module                        # the classic client
cpanm Some::Module                       # App::cpanminus — lean, quiet, recommended
cpanm --installdeps .                    # install what cpanfile/Makefile.PL/dist.ini needs
cpanm --local-lib=~/perl5 Some::Module   # per-user install (no root)
perl -MSome::Module -e 'print $Some::Module::VERSION, "\n"'    # is it installed / which version?
cpan -l | head                           # list installed
```

```bash
# per-user library without root:
eval "$(perl -I$HOME/perl5/lib/perl5 -Mlocal::lib)"
```

### Dependency management

`cpanfile`:

```perl
requires 'Moo', '>= 2.0';
requires 'Path::Tiny';
requires 'JSON::MaybeXS';
on 'test' => sub { requires 'Test::More', '0.98'; };
on 'develop' => sub { requires 'Perl::Critic'; };
```

```bash
cpanm --installdeps .                    # install from a cpanfile
carton install                           # pin exact versions into cpanfile.snapshot
carton exec perl script.pl               # run against the pinned local/ tree
```

### Creating a distribution

```bash
cpanm Module::Starter                    # or Dist::Zilla / Minilla for release automation
module-starter --module=My::Module --author="Me" --email=me@example.com
perl Makefile.PL && make && make test && make install
```

### Autoloading & lazy loading

```perl
our $AUTOLOAD;
sub AUTOLOAD {
    my $self = shift;
    (my $name = $AUTOLOAD) =~ s/.*:://;
    return if $name eq 'DESTROY';
    die "No such method: $name" unless exists $self->{$name};
    return $self->{$name};
}
use autouse 'Some::Big::Module' => qw(func1 func2);     # load on first call
```

### Symbol table & introspection

```perl
no strict 'refs';
*{"main::$name"} = sub { ... };                 # install a sub dynamically
for my $sym (keys %My::Utils::) { say $sym }    # list a package's symbols (stash)
say "loaded" if $INC{'My/Utils.pm'};
My::Utils->can('trim') ? 1 : 0;
```

---

## 18. Object-Oriented Perl

### The three rules

1. A **class** is a package.
2. A **method** is a subroutine whose first argument is the invocant (object or class name).
3. An **object** is a reference that has been `bless`ed into a class.

### A basic class

```perl
package Person;
use v5.36;
use Carp qw(croak);

sub new ($class, %args) {
    croak "name is required" unless defined $args{name};
    my $self = bless {
        name => $args{name},
        age  => $args{age} // 0,
    }, $class;
    return $self;
}

sub name ($self)                { $self->{name} }
sub age  ($self, $new = undef)  {
    $self->{age} = $new if defined $new;
    return $self->{age};
}
sub to_string ($self) { sprintf "%s (%d)", $self->{name}, $self->{age} }

1;
```

```perl
my $p = Person->new(name => 'Ada', age => 36);
say $p->name;
$p->age(37);
say $p->to_string;

my $class = 'Person';
my $q = $class->new(name => 'Bob');           # class name in a variable
my $meth = 'name';
say $q->$meth;                                # dynamic method name
my $cref = $q->can('name');                   # method reference
say $q->$cref;
```

### Inheritance

```perl
package Employee;
use v5.36;
use parent -norequire, 'Person';              # -norequire when both classes are in one file

sub new ($class, %args) {
    my $self = Person::new($class, %args);    # or: $class->SUPER::new(%args)
    $self->{salary} = $args{salary} // 0;
    return $self;
}
sub salary ($self) { $self->{salary} }
sub to_string ($self) { $self->SUPER::to_string() . " earns $self->{salary}" }   # override + extend

1;
```

```perl
use parent 'Person';                           # normal usage: loads Person.pm for you
our @ISA = ('Person');                         # the older manual way (@ISA drives method resolution)
```

### Introspection

```perl
ref($obj);                       # class name
$obj->isa('Person');             # true for Person and any subclass
Person->isa('Person');           # works on class names too
$obj->can('name');               # coderef if the method exists, else undef
$obj->DOES('Role');              # role/interface check (defaults to isa)
use Scalar::Util qw(blessed reftype);
blessed($obj);                   # class or undef
say $Employee::VERSION;
say join ', ', @Employee::ISA;
```

### Multiple inheritance & method resolution order

```perl
package C; use mro 'c3'; our @ISA = ('A', 'B');    # C3 resolution: predictable diamond handling
use mro;  say join ' > ', @{ mro::get_linear_isa('C') };
$self->next::method(@_);                           # cooperative call to the next class in MRO
```

The default search is depth-first, left-to-right; use `mro 'c3'` for consistent diamond behaviour.

### Class data & class methods

```perl
package Counter;
my $instances = 0;                       # lexical: private class data
sub new { my $class = shift; $instances++; return bless {}, $class }
sub instances { return $instances }      # class method
sub DESTROY  { $instances-- }
```

### Accessor generation

```perl
for my $field (qw(name age email)) {
    no strict 'refs';
    *{$field} = sub { my $s = shift; $s->{$field} = shift if @_; $s->{$field} };
}
```

### Destructors

```perl
sub DESTROY {
    my $self = shift;
    return if ${^GLOBAL_PHASE} eq 'DESTRUCT';      # avoid touching things during global destruction
    close $self->{fh} if $self->{fh};
}
```

`DESTROY` runs deterministically when the last reference goes away (no GC pauses). Never `die` inside it without `local $@`.

### Operator overloading

```perl
package Vec2;
use overload
    '+'  => \&add,
    '-'  => sub { Vec2->new($_[0]{x} - $_[1]{x}, $_[0]{y} - $_[1]{y}) },
    '*'  => sub { my ($l, $r, $swap) = @_; Vec2->new($l->{x} * $r, $l->{y} * $r) },
    '==' => sub { $_[0]{x} == $_[1]{x} && $_[0]{y} == $_[1]{y} },
    '""' => sub { "($_[0]{x}, $_[0]{y})" },        # stringification
    'bool' => sub { 1 },
    '<=>' => sub { my ($l, $r, $swap) = @_; ($swap ? -1 : 1) * ($l->len <=> (ref $r ? $r->len : $r)) },
    fallback => 1;                                  # derive missing operators when possible

sub new { my ($c, $x, $y) = @_; bless { x => $x, y => $y }, $c }
sub add { Vec2->new($_[0]{x} + $_[1]{x}, $_[0]{y} + $_[1]{y}) }
sub len { sqrt($_[0]{x}**2 + $_[0]{y}**2) }

my $v = Vec2->new(1, 2) + Vec2->new(3, 4);
say "v = $v";                                       # v = (4, 6)
```

### Encapsulation options

```perl
# 1. Convention: keys with a leading underscore are "private" — enforced by nothing
$self->{_cache} = {};

# 2. Closures / inside-out objects — truly private state
package Secret;
my %secret_of;                                       # keyed by refaddr
use Scalar::Util qw(refaddr);
sub new     { my $s = bless \do { my $anon }, shift; $secret_of{refaddr $s} = shift; $s }
sub reveal  { $secret_of{ refaddr $_[0] } }
sub DESTROY { delete $secret_of{ refaddr $_[0] } }

# 3. Lexical subs — private methods (5.18+)
my sub helper ($self) { ... }
helper($self);
```

### Modern OO frameworks (CPAN)

```perl
package Point;
use Moo;                                             # lightweight: Moo, or Moose for the full MOP
use Types::Standard qw(Int Str ArrayRef);

has x     => (is => 'ro',  isa => Int, required => 1);
has y     => (is => 'ro',  isa => Int, default  => 0);
has label => (is => 'rw',  isa => Str, lazy => 1, builder => '_build_label');
has tags  => (is => 'ro',  isa => ArrayRef, default => sub { [] });

sub _build_label ($self) { sprintf "(%d,%d)", $self->x, $self->y }

around label => sub ($orig, $self, @args) { uc $self->$orig(@args) };   # method modifiers
before  save => sub { ... };
after   save => sub { ... };

with 'Role::Printable';                              # composition via roles (Role::Tiny / Moo::Role)
1;
```

- **Moo** — minimal, fast startup, great default; **Moose** — full meta-object protocol; **Mouse** — Moose-like, faster; **Object::Pad** / `class` — experimental next-gen syntax; **Class::Tiny**, **Role::Tiny** — tiny building blocks.

### Core `class` feature `[5.38+ experimental]`

```perl
use v5.38;
use feature 'class';
no warnings 'experimental::class';

class Point {
    field $x :param = 0;
    field $y :param = 0;
    field @history;

    method coords { return ($x, $y) }
    method move ($dx, $dy) { push @history, [$x, $y]; $x += $dx; $y += $dy; return $self }
}

class Point3D :isa(Point) {
    field $z :param :reader = 0;
}

my $p = Point3D->new(x => 1, y => 2, z => 3);
say join ',', $p->coords;
```

### Design guidance

- Prefer **composition** (has-a) and **roles** over deep inheritance trees.
- Use `Carp::croak` in constructors and public methods so errors report the caller's line.
- Accept named arguments (`%args`) in constructors; validate them.
- Don't let outside code reach into `$obj->{field}` — provide accessors.
- Call methods with `->`, never as `method $obj` (indirect object syntax) — it is a source of bugs; disable it with `use v5.36;` or `no feature 'indirect'`.

---

## 19. Exceptions & Error Handling

### `die` and `eval`

```perl
eval {
    risky();
    1;                           # a true value on success
} or do {
    my $err = $@ || 'unknown error';
    warn "Failed: $err";
};

my $result = eval { compute() };
if (my $err = $@) {
    chomp $err;
    say "error: $err";
}
```

`die "message\n"` (with a trailing newline) suppresses the automatic `at SCRIPT line N.` suffix.

### The `$@` clobbering problem

`$@` can be overwritten by destructors that use `eval` while the exception propagates. The `eval { ...; 1 } or do { ... }` idiom above avoids relying on `$@` for success detection. In perl ≥ 5.14 `$@` is set **after** unwinding, which fixed most of the older problems.

### `try` / `catch` `[5.34+ experimental, stable in 5.40]`

```perl
use feature 'try';
no warnings 'experimental::try';

try {
    my $data = decode_json($text);
    process($data);
}
catch ($e) {
    warn "Failed: $e";
}
finally {                       # [5.36+, still experimental]
    cleanup();
}
```

`return` inside a `try` block returns from the **enclosing sub** (unlike `Try::Tiny`, where it returns from the inner block).

### `Try::Tiny` (CPAN, works on any perl)

```perl
use Try::Tiny;
my $value = try {
    dangerous();
} catch {
    warn "caught: $_";           # error is in $_
    return 'fallback';
} finally {
    say "always runs";
};
```

### Exception objects

```perl
package MyError;
sub new   { my ($class, %a) = @_; bless { %a }, $class }
sub throw { my $class = shift; die $class->new(@_) }
sub message { $_[0]{message} }
sub code    { $_[0]{code} // 500 }

package NotFound;  our @ISA = ('MyError');

package main;
eval { NotFound->throw(message => 'no such user', code => 404); 1 } or do {
    my $e = $@;
    if (ref $e && $e->isa('NotFound')) { say "404: ", $e->message }
    elsif (ref $e && $e->isa('MyError')) { say "app error: ", $e->message }
    else { die $e }                              # not ours: rethrow untouched
};
```

Modern choices: `Throwable`, `Exception::Class`, `Moo` + `Throwable` role, or the lightweight `Carp` + string errors for small scripts.

### `Carp` — errors from the caller's viewpoint

```perl
use Carp qw(carp croak cluck confess);
croak "bad argument";                # die, reported at the CALLER's location — use in libraries
carp  "deprecated";                  # warn, from the caller's perspective
confess "internal error";            # die with a full stack backtrace
cluck  "trace";                      # warn with a full stack backtrace
local $Carp::CarpLevel = 1;
```

### `warn` and warnings

```perl
warn "something odd\n";              # to STDERR; does not stop the program
warn "no newline";                   # ... appends "at SCRIPT line N."
local $SIG{__WARN__} = sub { log_it(@_) };      # intercept warnings
use warnings FATAL => 'all';                    # turn every warning into a fatal error
use warnings FATAL => qw(uninitialized);
no warnings 'uninitialized';                    # silence one category in a block
```

### `autodie` — exceptions from built-ins

```perl
use autodie;                              # open, close, unlink, mkdir, ... now die on failure
use autodie qw(:all);                     # also system/exec (needs IPC::System::Simple)

eval { open(my $fh, '<', 'missing.txt'); 1 } or do {
    my $e = $@;
    if ($e && $e->isa('autodie::exception')) {
        say "function: ", $e->function;
        say "file:     ", $e->file;
        say "matches open: ", $e->matches('open') ? 'yes' : 'no';
    }
};
```

### Global handlers

```perl
$SIG{__DIE__} = sub { print STDERR "FATAL: $_[0]" };    # runs before the exception propagates
END { say "cleanup" }                                    # always runs, even on die
$SIG{INT} = sub { die "interrupted\n" };
```

### Exit codes

```perl
exit 0;                        # success
exit 1;                        # generic failure
die "fatal\n";                 # exit code 255 (or errno / $? >> 8, see perlfunc)
system('cmd') == 0 or die "cmd failed: $?";
my $exit = $? >> 8;            # the child's real exit status
my $sig  = $? & 127;           # the signal that killed it (0 = none)
```

### Defensive checks

```perl
use Scalar::Util qw(blessed looks_like_number);
die "need an array ref" unless ref $arg eq 'ARRAY';
die "need a Person"     unless blessed($obj) && $obj->isa('Person');
die "need a number"     unless defined $n && looks_like_number($n);
```

### Cleanup on scope exit (`Guard` / `Scope::Guard`)

```perl
use Scope::Guard qw(guard);
{
    my $g = guard { unlink $tmpfile };        # runs when $g goes out of scope, error or not
    do_work();
}
```

### Common failure messages

| Message | Cause |
|---|---|
| `Can't locate Foo/Bar.pm in @INC` | Module not installed or wrong `@INC` |
| `Can't locate object method "x" via package "Y"` | Method missing, or `Y` isn't loaded |
| `Can't call method "x" on an undefined value` | `$obj` is `undef` |
| `Can't call method "x" on unblessed reference` | Plain ref used as an object |
| `Global symbol "$x" requires explicit package name` | Undeclared variable under `use strict` |
| `Use of uninitialized value $x in ...` | `undef` used in string/number context |
| `Argument "abc" isn't numeric in addition (+)` | Non-numeric string used as a number |
| `Not an ARRAY reference` | Dereferenced the wrong type |
| `Odd number of elements in hash assignment` | Hash assigned a list with a missing value |
| `Deep recursion on subroutine` | Recursion deeper than 100 levels (a warning) |

---

## 20. Pragmas

Pragmas are lexically scoped compiler directives — they affect the enclosing block/file.

### Essential

```perl
use strict;             # vars (declare variables), refs (no symbolic refs), subs (no barewords)
use warnings;           # enable all warnings
use utf8;               # the source file itself is UTF-8 (identifiers, string literals)
use v5.36;              # require perl 5.36 AND enable: strict, warnings, say, signatures, isa...
```

`use v5.12` or newer turns on `strict`; `use v5.36` also turns on `warnings`, disables the `indirect` and `multidimensional` features, and enables `say`, `state`, `fc`, `signatures` and `isa`. (`use v5.38` additionally disables `bareword_filehandles`.)

### `strict` in detail

```perl
use strict 'vars';      # must declare variables with my/our
use strict 'refs';      # no symbolic references: ${"name"} is an error
use strict 'subs';      # barewords are errors

no strict 'refs';       # scoped opt-out for metaprogramming
*{"main::$name"} = sub { ... };
```

### `warnings` in detail

```perl
use warnings;                          # everything
use warnings qw(all);
use warnings FATAL => 'all';           # die on any warning
no warnings 'once';                    # silence "used only once"
no warnings qw(uninitialized numeric);
use warnings::register;                # for module authors: own warning category
```

### `feature`

```perl
use feature qw(say state fc unicode_strings);
use feature ':5.36';                   # a whole bundle
use feature 'signatures';
use feature 'try';         no warnings 'experimental::try';
use feature 'class';       no warnings 'experimental::class';
use feature 'isa';                     # $obj isa Class
use feature 'postderef_qq';            # "$aref->@*" interpolates
use feature 'bitwise';                 # separate numeric and string bitwise operators
```

### `constant`, `parent`, `base`, `fields`

```perl
use constant PI => 4 * atan2(1, 1);
use constant { RED => 0, GREEN => 1, BLUE => 2 };
use parent -norequire, 'Base';         # inherit (modern replacement for base)
use base 'Base';                       # older; still works
```

### `lib`, `vars`, `our`

```perl
use lib 'lib', 'local/lib/perl5';
use vars qw($x @y);                    # old-style global declaration — prefer `our`
our ($x, @y);
```

### `integer`, `bigint`, `bignum`, `bigrat`

```perl
{ use integer; say 10 / 3; }           # 3 — integer arithmetic in this block
use bigint;   say 2**200;              # arbitrary-precision integers
use bignum;   say 0.1 + 0.2;           # 0.3 — arbitrary-precision decimals
use bigrat;   say 1/3 + 1/4;           # 7/12
```

### `open`, `locale`, `encoding`

```perl
use open qw(:std :encoding(UTF-8));    # UTF-8 on all file handles opened here + STDIN/OUT/ERR
use locale;                            # honour the OS locale for sorting/case (rare; prefer Unicode::Collate)
```

### `overload`, `sort`, `mro`, `re`, `autodie`

```perl
use overload '""' => sub { ... };
use sort 'stable';
use mro 'c3';
use re 'debug';                        # trace regex execution
use autodie;
use diagnostics;                       # verbose explanations of warnings (development only)
use English qw(-no_match_vars);        # readable names: $ERRNO, $EVAL_ERROR, $PROGRAM_NAME ...
```

### `Modern::Perl` / `common::sense` / `strictures`

Third-party bundles that enable strict/warnings/features in one line: `use Modern::Perl '2020';`, `use strictures 2;`. With `use v5.36;` you rarely need them.

### Disabling a pragma for a block

```perl
{
    no warnings 'redefine';
    *Some::Module::func = sub { ... };     # monkey-patching — do it in the smallest scope possible
}
```

---

## 21. Unicode & Encoding

### The two rules

1. **Decode** all bytes to characters on the way **in**.
2. **Encode** characters to bytes on the way **out**.

Perl strings hold **characters** ("code points"). Files, sockets and terminals hold **bytes**. If you skip decoding/encoding you get mojibake or `Wide character in print`.

### Boilerplate for UTF-8 programs

```perl
use v5.36;
use utf8;                                        # source code is UTF-8
use open qw(:std :encoding(UTF-8));              # STDIN/STDOUT/STDERR + every open() default to UTF-8
use Encode qw(decode encode);
my @args = map { decode('UTF-8', $_) } @ARGV;   # command-line args arrive as bytes
```

### Encode / decode

```perl
use Encode qw(encode decode encode_utf8 decode_utf8 is_utf8);

my $chars = decode('UTF-8', $bytes);              # bytes -> characters (dies on malformed input by default)
my $bytes = encode('UTF-8', $chars);              # characters -> bytes
my $lax   = decode('UTF-8', $bytes, Encode::FB_DEFAULT);   # replace bad sequences with U+FFFD
my $lat1  = decode('iso-8859-1', $bytes);
my @encodings = Encode->encodings(':all');
```

### Handles & layers

```perl
open(my $fh, '<:encoding(UTF-8)', $file) or die;  # strict validating decoder — recommended
open(my $fh, '<:utf8', $file) or die;             # lax: skips validation (avoid for untrusted data)
binmode(STDOUT, ':encoding(UTF-8)');
binmode(STDIN,  ':encoding(UTF-8)');
```

### Character semantics

```perl
use utf8;
my $s = "héllo wörld ☺";
length($s);                                       # 13 characters (would be more bytes)
uc($s);   lc($s);   ucfirst($s);                  # Unicode-aware with use utf8 / unicode_strings
fc($a) eq fc($b);                                 # case-insensitive comparison (fold-case)
ord("☺");                                         # 9786
chr(9786);   "\x{263A}";   "\N{WHITE SMILING FACE}";   "\N{U+263A}";
say sprintf("U+%04X", ord($_)) for split //, $s;
```

### Regex & Unicode

```perl
"é" =~ /\w/;                       # true with a character string
/\p{Lu}/;   /\p{Han}/;   /\p{Script=Latin}/;    # properties
/\X/;                              # one extended grapheme cluster (a "user-perceived character")
my $graphemes = () = $str =~ /\X/g;
```

### Normalisation & collation

```perl
use Unicode::Normalize qw(NFC NFD NFKC);
my $composed   = NFC($s);          # é as ONE code point
my $decomposed = NFD($s);          # é as e + combining acute
NFC($a) eq NFC($b);                # compare canonically-equivalent strings

use Unicode::Collate;
my @sorted = Unicode::Collate->new->sort(@words);    # locale-appropriate sorting
```

### Detecting and fixing common problems

```perl
# "Wide character in print at ..." -> STDOUT has no encoding layer:
binmode(STDOUT, ':encoding(UTF-8)');

# Double-encoded text ("Ã©" instead of "é"): decoded twice or encoded twice.
my $fixed = decode('UTF-8', encode('Latin-1', $garbled));

# Distinguish bytes from characters while debugging:
use Devel::Peek;  Dump($string);                     # shows the UTF8 flag and bytes
sub utf8_info { my $s = shift; sprintf "utf8=%s len=%d", (utf8::is_utf8($s) ? 'on' : 'off'), length $s }
```

### JSON, databases, web

```perl
use JSON::PP;
my $json = JSON::PP->new->utf8;             # ->utf8 = expects/produces UTF-8 BYTES
my $text = JSON::PP->new;                   # no ->utf8 = works on character strings
my $data = $json->decode($bytes_from_file);

# DBI: MySQL -> mysql_enable_utf8mb4 => 1 ; Postgres -> pg_enable_utf8 => 1 ; SQLite -> sqlite_unicode => 1
```

### `utf8::` functions

```perl
utf8::decode($s);        # in-place: interpret bytes as UTF-8 characters
utf8::encode($s);        # in-place: characters -> UTF-8 bytes
utf8::upgrade($s);       # internal representation only — does not change meaning
utf8::is_utf8($s);       # inspect the internal flag (debugging only; don't branch on it)
```

---

## 22. Command-Line One-Liners

### Switches

| Switch | Meaning |
|---|---|
| `-e 'code'` | Run the code (repeat `-e` for multiple lines) |
| `-E 'code'` | Like `-e` with all `feature`s enabled (`say`, `state`, ...) |
| `-n` | Wrap the code in `while (<>) { ... }` |
| `-p` | Like `-n`, but also print `$_` at the end of each iteration |
| `-l` | Chomp each input line and append `"\n"` to every `print` |
| `-a` | Autosplit `$_` into `@F` (with `-n`/`-p`) |
| `-F<pat>` | Set the `-a` split pattern (`-F: `, `-F'/\t/'`) |
| `-i[ext]` | Edit files in place (optional backup extension) |
| `-0[digits]` | Set `$/` (`-0` = null byte, `-00` = paragraph mode, `-0777` = slurp) |
| `-M<Mod>` / `-m` | `use Module` / `use Module ()` |
| `-I<dir>` | Add a directory to `@INC` |
| `-w` / `-W` / `-X` | Enable / force-enable / disable all warnings |
| `-c` | Check syntax only |
| `-s` | Enable simple `-name` / `-name=value` switch parsing into `$name` |
| `-C` | Enable Unicode features (`-CS` = UTF-8 on STD handles, `-CSDA`) |
| `-T` / `-t` | Taint mode / taint warnings |
| `-d` | Run under the debugger |
| `-v` / `-V` | Version / full configuration |

### Text processing

```bash
perl -ne 'print if /error/i' app.log                    # like grep -i
perl -ne 'print unless /^\s*$/' file                    # drop blank lines
perl -pe 's/foo/bar/g' file                             # like sed 's/foo/bar/g'
perl -pi -e 's/foo/bar/g' *.txt                         # in-place edit
perl -pi.bak -e 's/foo/bar/g' *.txt                     # in-place, keep .bak backups
perl -ne 'print "$.: $_"' file                          # number the lines
perl -ne 'print if 10 .. 20' file                       # lines 10-20 (flip-flop)
perl -ne 'print if /START/ .. /END/' file               # a range between two patterns
perl -ne 'print if $. == 5' file                        # only line 5
perl -lne 'print length' file                           # line lengths
perl -lne '$s += length; END { print $s }' file         # total characters
perl -ne '$c++ if /error/; END { print "$c\n" }' log    # count matching lines
perl -00 -ne 'print if /keyword/' file                  # paragraph mode: matching paragraphs
perl -0777 -pe 's/\n\n+/\n/g' file                      # whole-file slurp substitution
perl -ne 'print unless $seen{$_}++' file                # uniq without sorting, keeps order
perl -e 'print reverse <>' file                         # reverse line order (tac)
perl -pe '$_ = reverse' file                            # reverse each line's characters
perl -ne 'print lc' file                                # lower-case everything
perl -lpe '$_ = ucfirst lc' file                        # capitalise each line
perl -pe 's/^\s+|\s+$//g' file                          # trim (note: also removes the newline)
perl -lpe 's/^\s+|\s+$//g' file                         # trim, keeping one newline per line
perl -pe 's/\r$//' dosfile                              # dos2unix
perl -pe 's/$/\r/' unixfile                             # unix2dos
```

### Fields & columns (`-a` / `-F`)

```bash
perl -lane 'print $F[1]' file                           # 2nd whitespace-separated column
perl -F: -lane 'print $F[0]' /etc/passwd                # first colon-separated field
perl -F, -lane 'print "$F[0] $F[2]"' data.csv           # naive CSV (no quoted commas!)
perl -lane '$sum += $F[2]; END { print $sum }' file     # sum a column
perl -lane 'print scalar @F' file                       # number of fields per line
perl -lane '@F = reverse @F; print "@F"' file           # reverse field order
perl -F'\t' -lane 'print join ",", @F' file.tsv         # TSV to CSV
perl -lane '$h{$F[0]} += $F[1]; END { print "$_ $h{$_}" for sort keys %h }' file   # group-by sum
perl -lane 'print if $F[2] > 100' file                  # numeric filter on a column
```

### Numbers, dates, encodings

```bash
perl -le 'print 2**32'                                   # quick math
perl -le 'print for 1..10'                               # list numbers
perl -le 'printf "%.2f\n", 22/7'
perl -le 'print scalar localtime'                        # current date
perl -le 'print time'                                    # epoch seconds
perl -le 'print scalar localtime(1700000000)'            # epoch -> date
perl -MPOSIX=strftime -le 'print strftime("%F %T", localtime)'
perl -MTime::Piece -le 'print localtime->ymd'
perl -le 'print join ",", map { sprintf "%02x", $_ } unpack "C*", "AB"'    # hex dump
perl -MMIME::Base64 -e 'print encode_base64("secret")'
perl -MMIME::Base64 -e 'print decode_base64("c2VjcmV0")'
perl -MDigest::SHA=sha256_hex -e 'print sha256_hex("text"), "\n"'
perl -MURI::Escape -e 'print uri_escape("a b&c")'        # needs URI::Escape from CPAN
perl -CS -le 'print chr(0x263A)'                         # print a Unicode character
```

### JSON, XML, HTML, CSV helpers

```bash
perl -MJSON::PP -0777 -ne 'print JSON::PP->new->pretty->canonical->encode(decode_json $_)' data.json
perl -MJSON::PP -0777 -ne '$d = decode_json $_; print "$_\n" for keys %$d' data.json
perl -MData::Dumper -e '$Data::Dumper::Sortkeys = 1; print Dumper(\%ENV)'
perl -MYAML::XS -e 'print YAML::XS::Dump({a => [1,2]})'  # from CPAN
```

### Files & system

```bash
perl -e 'print "$_\n" for @INC'                          # module search path
perl -MList::Util=sum -le 'print sum(1..100)'            # 5050
perl -le 'print $ENV{HOME}'
perl -e 'unlink glob("*.tmp")'                           # delete matching files
perl -MFile::Find -e 'find(sub { print "$File::Find::name\n" if -f && /\.log$/ }, ".")'
perl -MCwd -e 'print Cwd::getcwd(), "\n"'
perl -e 'system("ls", "-l") == 0 or die "failed: $?"'
perl -we 'my $x; print $x + 1'                           # see a warning in action
perl -MO=Deparse -e 'print "hi" if $x'                   # deparse: reveal parsing
perl -c -e 'BEGIN { print "hi\n" }'                      # BEGIN blocks run even with -c
```

### Module & environment checks

```bash
perl -MModule::Name -e1 && echo installed || echo missing
perl -MModule::Name -e 'print "$Module::Name::VERSION\n"'
perl -MCPAN -e 'install Module::Name'
perl -V:installsitelib -V:installprivlib
perl -e 'print "$^O $^V\n"'
perl -MConfig -E 'say $Config{archname}'
```

### Real-world log examples

```bash
# Top 10 IP addresses in an access log
perl -lane '$h{$F[0]}++; END { print "$h{$_} $_" for (sort { $h{$b} <=> $h{$a} } keys %h)[0..9] }' access.log

# Response-time average for lines that contain " 200 "
perl -lne 'if (/ 200 .* (\d+)ms$/) { $n++; $t += $1 } END { printf "%.1f\n", $t/$n if $n }' access.log

# Extract email addresses
perl -nle 'print $& while /[\w.+-]+@[\w-]+\.[\w.-]+/g' file

# Rename *.jpeg -> *.jpg
perl -e 'for (glob "*.jpeg") { (my $n = $_) =~ s/jpeg$/jpg/; rename $_, $n }'
# ...or with the rename utility bundled with perl (Debian: prename):  rename 's/\.jpeg$/.jpg/' *.jpeg
```

---

## 23. Processes & External Commands

### `system` — run a command, wait for it

```perl
system('ls', '-l', $dir);                        # LIST form: no shell, arguments are safe
system("ls -l $dir");                            # STRING form: goes through /bin/sh if it has metacharacters — injection risk!
my $rc = system('grep', '-q', 'foo', $file);
if ($rc == -1)          { die "failed to start: $!" }
elsif ($rc & 127)       { die sprintf "died from signal %d", $rc & 127 }
else                    { my $exit = $rc >> 8; say "exit status $exit" }
system(@cmd) == 0 or die "@cmd failed: $?";
```

### Backticks / `qx` — capture output

```perl
my $out   = `date`;                               # scalar context: everything, one string
my @lines = `ls -1`;                              # list context: one element per line
chomp(my $host = `hostname`);
my $status = $? >> 8;

# Safer than backticks with interpolated data:
open(my $ph, '-|', 'ls', '-1', $dir) or die "ls: $!";
chomp(my @files = <$ph>);
close($ph);
```

### `exec` — replace the current process

```perl
exec('vim', $file) or die "exec failed: $!";      # never returns on success
```

### `fork`, `wait`, `waitpid`

```perl
my $pid = fork() // die "fork failed: $!";
if ($pid == 0) {                                   # child
    say "child $$";
    exit 3;
}
waitpid($pid, 0);                                  # parent waits for that child
say "child exited with ", $? >> 8;

my @kids;
for my $job (@jobs) {
    my $pid = fork() // die;
    if (!$pid) { work($job); exit 0 }
    push @kids, $pid;
}
waitpid($_, 0) for @kids;

use POSIX ':sys_wait_h';
while ((my $done = waitpid(-1, WNOHANG)) > 0) { ... }   # reap any finished children without blocking
$SIG{CHLD} = 'IGNORE';                                   # let the OS auto-reap (no zombies)
```

### Capturing STDOUT + STDERR + exit code together

```perl
use IPC::Open3;
use Symbol 'gensym';
my $err = gensym;
my $pid = open3(my $in, my $out, $err, 'command', @args);
close $in;
my @stdout = <$out>;
my @stderr = <$err>;
waitpid($pid, 0);
my $exit = $? >> 8;
```

Higher-level, less error-prone options:

```perl
use IPC::Run3;
run3 ['ls', '-l'], \undef, \my $stdout, \my $stderr;      # CPAN: IPC::Run3

use Capture::Tiny qw(capture capture_stdout);
my ($stdout, $stderr, $exit) = capture { system('ls', '-l') };

use IPC::System::Simple qw(system systemx capture);       # dies on failure; systemx never uses a shell
my $output = capture('ls', '-l');
```

### Environment for children

```perl
{
    local $ENV{PATH} = '/usr/bin:/bin';              # taint-safe PATH
    local $ENV{LC_ALL} = 'C';
    system('sort', 'file');
}
delete @ENV{qw(IFS CDPATH ENV BASH_ENV)};            # scrub for setuid/taint scripts
```

### Process information & control

```perl
say $$;                        # my PID
getppid();                     # parent PID
kill 'TERM', $pid;             # send a signal;  kill 0, $pid  tests whether the process exists
kill 'HUP', @pids;
setpgrp(0, 0);
sleep 2;                       # whole seconds
select(undef, undef, undef, 0.25);     # sleep 250 ms
use Time::HiRes qw(sleep usleep);   sleep(0.25);
getpwuid($<);                  # user info for the real uid   ($> effective uid, $( gid)
umask(022);
nice(5);
exit(0);
```

### Daemonising (sketch)

```perl
use POSIX qw(setsid);
defined(my $pid = fork) or die;
exit 0 if $pid;                                     # parent leaves
setsid() or die "setsid: $!";
open(STDIN,  '<', '/dev/null');
open(STDOUT, '>', '/var/log/mydaemon.log');
open(STDERR, '>&', \*STDOUT);
chdir '/';   umask 0;
```

In production prefer `Proc::Daemon`, systemd (`Type=simple` with logging to journald) or supervisor tools.

### Taint mode & safe execution

```perl
#!/usr/bin/perl -T
$ENV{PATH} = '/bin:/usr/bin';                        # must be set to something safe
my ($safe) = $user_input =~ /^([\w.-]+)$/ or die;    # untaint by capturing with a strict regex
system('/bin/ls', $safe);                            # list form
```

---

## 24. Signals & Timers

### Signal handlers

```perl
$SIG{INT}  = sub { say "Ctrl-C caught"; exit 130 };
$SIG{TERM} = sub { cleanup(); exit 0 };
$SIG{HUP}  = sub { reload_config() };
$SIG{USR1} = sub { dump_stats() };
$SIG{PIPE} = 'IGNORE';                              # don't die on a closed pipe/socket
$SIG{CHLD} = 'IGNORE';                              # auto-reap children
$SIG{INT}  = 'DEFAULT';                             # restore the default action
local $SIG{INT} = sub { $interrupted = 1 };         # scoped handler
kill 'USR1', $$;                                    # signal yourself
say join ' ', sort keys %SIG;                       # available signals
```

`KILL` and `STOP` cannot be caught or ignored.

### Safe signals — keep handlers tiny

Perl delivers signals *between* opcodes ("deferred signals"), which makes it much safer than C — but keep handlers short. Best practice is to set a flag and act in the main loop:

```perl
my $stop = 0;
$SIG{TERM} = $SIG{INT} = sub { $stop = 1 };
until ($stop) {
    do_work();
    select(undef, undef, undef, 0.5);                # interruptible sleep
}
say "shutting down";
```

### `alarm` — timeouts

```perl
my $result = eval {
    local $SIG{ALRM} = sub { die "timeout\n" };
    alarm 5;                                        # deliver SIGALRM in 5 seconds
    my $r = slow_operation();
    alarm 0;                                        # cancel
    $r;
};
if ($@ eq "timeout\n") { warn "took too long" }
elsif ($@)             { die $@ }
```

- Always reset `alarm 0` on the success path **and** make sure exceptions cancel it.
- `alarm` has whole-second resolution — use `Time::HiRes::ualarm` / `setitimer` for finer control.
- `alarm` cannot reliably interrupt some blocking C calls (DNS, some DB drivers); use non-blocking I/O with `IO::Select` or the module's own timeout option.

```perl
use Time::HiRes qw(ualarm setitimer ITIMER_REAL time);
ualarm(250_000);                                     # 250 ms
```

### `sleep`, timing

```perl
sleep 1;
use Time::HiRes qw(sleep time gettimeofday tv_interval);
sleep 0.1;
my $t0 = [gettimeofday];
work();
printf "took %.3fs\n", tv_interval($t0);
my $start = time;                                    # with Time::HiRes: fractional seconds
```

### Periodic tasks

```perl
my $next = time;
while (1) {
    $next += 60;
    do_job();
    my $wait = $next - time;
    sleep $wait if $wait > 0;                        # drift-free scheduling
}
```

### Graceful shutdown pattern

```perl
my ($running, $reload) = (1, 0);
$SIG{INT}  = $SIG{TERM} = sub { $running = 0 };
$SIG{HUP}  = sub { $reload = 1 };
while ($running) {
    if ($reload) { load_config(); $reload = 0 }
    process_next_job() or select(undef, undef, undef, 0.2);
}
END { unlink $pidfile if $pidfile }
```

### Watching for pending signals in a child-process manager

```perl
use POSIX qw(:signal_h :sys_wait_h);
my $sigset = POSIX::SigSet->new(SIGCHLD);
sigprocmask(SIG_BLOCK, $sigset);                     # block during a critical section
# ... critical work ...
sigprocmask(SIG_UNBLOCK, $sigset);
```

---

## 25. Date & Time

### Builtins

```perl
my $now = time;                                     # seconds since the Unix epoch (UTC)
my @t = localtime($now);                            # (sec, min, hour, mday, mon, year, wday, yday, isdst)
my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime;
$year += 1900;                                      # year is years since 1900
$mon  += 1;                                         # month is 0-11
my @u = gmtime($now);                               # same fields, in UTC
say scalar localtime;                               # "Sun Sep 20 16:20:00 2026"
say scalar gmtime(0);                               # "Thu Jan  1 00:00:00 1970"
```

### `POSIX::strftime` / `mktime`

```perl
use POSIX qw(strftime mktime floor);

say strftime("%Y-%m-%d %H:%M:%S", localtime);       # 2026-09-20 16:20:00
say strftime("%Y-%m-%dT%H:%M:%SZ", gmtime);         # ISO 8601 UTC
say strftime("%A, %d %B %Y", localtime);            # Sunday, 20 September 2026
say strftime("%a %b %e %l:%M %p", localtime);
say strftime("%Z %z", localtime);                   # time-zone name / numeric offset
say strftime("%j", localtime);                      # day of year
say strftime("%U %V", localtime);                   # week number (Sun-based / ISO 8601)

my $epoch = mktime(0, 0, 12, 25, 11, 125);          # sec,min,hour,mday,mon(0-11),year-1900 -> epoch
```

Common `strftime` codes: `%Y` year · `%m` month · `%d` day · `%H` 24h hour · `%I` 12h hour · `%M` minute · `%S` second · `%p` AM/PM · `%a`/`%A` weekday · `%b`/`%B` month name · `%j` day of year · `%u` weekday (1=Mon) · `%s` epoch · `%F` = `%Y-%m-%d` · `%T` = `%H:%M:%S` · `%z` offset · `%Z` zone · `%%` percent.

### `Time::Piece` (core; object-oriented, recommended for simple work)

```perl
use Time::Piece;
use Time::Seconds;                                   # ONE_DAY, ONE_HOUR, ONE_WEEK ...

my $t = localtime;                                   # overrides localtime() to return an object
say $t->ymd;                                         # 2026-09-20
say $t->hms;                                         # 16:20:00
say $t->datetime;                                    # 2026-09-20T16:20:00
say $t->year, $t->mon, $t->mday;
say $t->monname, ' ', $t->wdayname, ' ', $t->yday;
say $t->strftime('%d/%m/%Y');
say $t->epoch;
say $t->tzoffset;

my $tomorrow = $t + ONE_DAY;
my $last_week = $t - 7 * ONE_DAY;
my $parsed = Time::Piece->strptime('2026-09-20 08:30', '%Y-%m-%d %H:%M');    # parse a string
my $diff = $parsed - $t;                              # a Time::Seconds object
say $diff->days;   say int($diff->hours);
say $t->month_last_day;   say $t->is_leap_year ? 'leap' : 'common';
if ($parsed < $t) { say "in the past" }
```

`Time::Piece->strptime` always parses as **UTC/floating** time — it does not apply your local zone.

### `Time::Local`

```perl
use Time::Local qw(timelocal timegm timelocal_posix timegm_posix);
my $epoch  = timelocal(0, 30, 8, 20, 8, 2026);        # sec,min,hour,mday,mon(0-11),YEAR (4-digit)
my $utc    = timegm(0, 0, 0, 1, 0, 2026);             # 2026-01-01 00:00:00 UTC
my $posix  = timegm_posix(0, 0, 0, 1, 0, 126);        # POSIX-style year - 1900
```

### `DateTime` (CPAN — the full-featured choice)

```perl
use DateTime;
use DateTime::Format::Strptime;

my $dt = DateTime->now(time_zone => 'UTC');
my $ny = DateTime->new(year => 2026, month => 9, day => 20, hour => 9,
                       time_zone => 'America/New_York');
say $ny->clone->set_time_zone('Asia/Kolkata')->iso8601;      # zone conversion
say $dt->ymd, ' ', $dt->hms, ' ', $dt->day_name, ' ', $dt->month_name;
my $later = $dt->clone->add(days => 30, hours => 2);
my $dur   = $later->subtract_datetime($dt);                  # DateTime::Duration
say $dur->in_units('days');
say DateTime->compare($dt, $later);                          # -1 / 0 / 1
my $strp = DateTime::Format::Strptime->new(pattern => '%Y-%m-%d %H:%M', time_zone => 'UTC', on_error => 'croak');
my $parsed = $strp->parse_datetime('2026-09-20 08:30');
say $parsed->epoch;
say $dt->clone->truncate(to => 'month')->ymd;                # start of the month
say $dt->clone->add(months => 1)->set(day => 1)->subtract(days => 1)->day;    # days in this month
```

`Time::Moment` and `Date::Calc` are lighter/faster alternatives; use `Time::HiRes` for sub-second timing.

### Timing & benchmarks

```perl
use Time::HiRes qw(time sleep gettimeofday tv_interval);
my $t0 = [gettimeofday];
run_job();
printf "elapsed: %.4f s\n", tv_interval($t0);

use Benchmark qw(timethese cmpthese timeit timestr);
cmpthese(-3, {                                       # run each for at least 3 CPU seconds
    regex => sub { my $x = "a-b-c"; $x =~ s/-/_/g },
    tr    => sub { my $x = "a-b-c"; $x =~ tr/-/_/ },
});
```

### Common calculations

```perl
my $days_between = int(($epoch2 - $epoch1) / 86400);        # naive: ignores DST changes
my $is_weekend   = (localtime)[6] =~ /^[06]$/;               # 0 = Sunday, 6 = Saturday
my $age = do {
    my ($y, $m, $d) = (localtime)[5, 4, 3];  $y += 1900; $m++;
    my $years = $y - $birth_y;
    $years-- if $m < $birth_m || ($m == $birth_m && $d < $birth_d);
    $years;
};
my $start_of_day = do { my @t = localtime; $t[0] = $t[1] = $t[2] = 0; mktime(@t) };
```

### Time-zone tips

- Store and compute in **UTC**; convert to a zone only for display.
- The `TZ` environment variable affects `localtime` and `strftime` (`local $ENV{TZ} = 'Asia/Tokyo'; POSIX::tzset();`).
- Day arithmetic across a DST boundary needs a zone-aware library (`DateTime`); adding `86400` seconds is not always "one day".
- For log files always use ISO 8601 with an explicit offset or `Z`.

---

## 26. Core Modules Worth Knowing

Every module in this section ships with Perl (no CPAN install needed) unless marked otherwise. Check with `corelist`: `corelist Module::Name`.

### `Data::Dumper`

```perl
use Data::Dumper;
local $Data::Dumper::Sortkeys = 1;
local $Data::Dumper::Indent   = 1;
local $Data::Dumper::Terse    = 1;
print Dumper($structure);
print Data::Dumper->Dump([$a, $b], ['a', 'b']);      # named output: $a = ...; $b = ...;
```

### `List::Util` & `Scalar::Util`

```perl
use List::Util qw(sum sum0 min max minstr maxstr first reduce reductions shuffle uniq uniqnum
                  any all none notall pairs pairkeys pairvalues pairmap head tail product);

sum(1..10);   product(1..5);   max(@n);   min(@n);
first { $_ > 3 } @n;
reduce { $a * $b } 1 .. 5;
reductions { $a + $b } 1 .. 4;               # (1, 3, 6, 10) running totals  [1.54+]
uniq qw(a b a c);                            # a b c
shuffle @deck;
any { $_ eq 'x' } @l;   all { defined } @l;   none { /err/ } @log;
pairmap { "$a=$b" } (x => 1, y => 2);

use Scalar::Util qw(blessed reftype looks_like_number refaddr weaken dualvar readonly openhandle);
blessed($o);   reftype($o);   refaddr($ref);   looks_like_number($v);
openhandle(\*STDIN) ? 'open' : 'closed';
```

### `POSIX`

```perl
use POSIX qw(floor ceil fmod strftime mktime INT_MAX DBL_MAX LONG_MAX setlocale LC_ALL
             strtol isatty uname getpid EXIT_SUCCESS EXIT_FAILURE);
floor(3.7);   ceil(3.2);   fmod(10, 3);
my ($sys, $node, $release, $version, $machine) = uname();
isatty(*STDOUT) ? "terminal" : "redirected";
```

### `Getopt::Long`, `Pod::Usage` — see [section 27](#27-getoptlong--full-cli-reference)

### `File::*`, `Cwd`, `FindBin` — see [section 15](#15-filesystem--tests-directories--paths)

### `Storable`

```perl
use Storable qw(store retrieve freeze thaw dclone nstore);
store(\%data, 'data.sto');                    # write a binary snapshot
my $data = retrieve('data.sto');
my $copy = dclone($data);                     # deep clone
my $frozen = freeze($data);   my $back = thaw($frozen);
```

Never `retrieve`/`thaw` data from an untrusted source (it can instantiate arbitrary classes).

### `JSON::PP`, `HTTP::Tiny`, `MIME::Base64`, `Digest::*`

```perl
use JSON::PP;
my $js   = JSON::PP->new->utf8->canonical->pretty;
my $text = $js->encode({ a => 1, list => [1, 2, 3], ok => JSON::PP::true });
my $data = $js->decode($text);
my $bool = $data->{ok} ? 'yes' : 'no';

use MIME::Base64 qw(encode_base64 decode_base64 encode_base64url);
my $b64 = encode_base64($bytes, '');          # '' = no trailing newline
use Digest::SHA qw(sha256_hex sha1_hex hmac_sha256_hex);
say sha256_hex($bytes);
say hmac_sha256_hex($message, $key);
use Digest::MD5 qw(md5_hex);                  # checksums only — not for security
Digest::SHA->new(256)->addfile($fh)->hexdigest;
```

### `Text::*`

```perl
use Text::Wrap qw(wrap $columns);
$columns = 60;
print wrap('', '  ', $long_text);                      # first-line indent, following-line indent

use Text::ParseWords qw(shellwords quotewords parse_line);
my @args = shellwords(q{cmd "quoted arg" 'other one' plain});

use Text::Abbrev;                                      # unambiguous abbreviations
use Text::Tabs;                                        # expand/unexpand tabs
```

### `Term::ANSIColor`, `Term::ReadLine`, `Term::ReadKey` (CPAN)

```perl
use Term::ANSIColor qw(color colored);
say colored("OK", 'bold green');
say color('red'), "error", color('reset');

use Term::ReadLine;
my $term = Term::ReadLine->new('app');
while (defined(my $line = $term->readline('> '))) { last if $line eq 'quit'; say "you said $line" }
```

### `Sys::Hostname`, `Config`, `English`, `Env`

```perl
use Sys::Hostname;   say hostname();
use Config;          say $Config{osname}, ' ', $Config{archname}, ' ', $Config{version};
use English qw(-no_match_vars);   say $PROGRAM_NAME, ' ', $PROCESS_ID, ' ', $OS_ERROR;
use Env qw(HOME @PATH);           say $HOME;   say scalar @PATH;   # ties env vars to Perl vars
```

### `Encode`, `Unicode::Normalize` — see [section 21](#21-unicode--encoding)

### `Time::*`, `Benchmark` — see [section 25](#25-date--time)

### `IO::*`

```perl
use IO::File;
my $fh = IO::File->new($path, 'r') or die "$path: $!";
while (defined(my $l = $fh->getline)) { ... }
$fh->close;

use IO::Handle;   STDOUT->autoflush(1);   STDERR->printflush("msg\n");
use IO::Select;   use IO::Socket::INET;   use IO::Socket::UNIX;
use IO::Dir;      use IO::Pipe;           use IO::Seekable;   use IO::Zlib;
```

### `Tie::*`, `Memoize`, `constant`, `overload`

```perl
use Memoize;
memoize('fib');                                       # cache results transparently
sub fib { my $n = shift; $n < 2 ? $n : fib($n-1) + fib($n-2) }

use Tie::File;
tie my @lines, 'Tie::File', 'notes.txt' or die;       # array = file lines (edits write through)
$lines[3] = 'replaced';
untie @lines;
```

### `Math::*`, `Fcntl`, `Errno`, `Socket`

```perl
use Math::BigInt;   use Math::BigFloat;   use Math::Trig;   use Math::Complex;
use Fcntl qw(:flock :seek :mode O_RDONLY O_CREAT O_EXCL);
use Errno qw(ENOENT EACCES EEXIST);
use Socket qw(inet_aton inet_ntoa pack_sockaddr_in AF_INET SOCK_STREAM);
```

### `threads`, `Thread::Queue`, `IPC::*` — see [section 30](#30-concurrency--fork--ioselect--threads)

### Handy CPAN modules (not core, but ubiquitous)

| Task | Module |
|---|---|
| OO framework | `Moo`, `Moose`, `Type::Tiny`, `Role::Tiny` |
| Paths & files | `Path::Tiny`, `File::Slurper`, `File::pushd` |
| HTTP client | `HTTP::Tiny` (core), `LWP::UserAgent`, `Mojo::UserAgent`, `Furl` |
| Web frameworks | `Mojolicious`, `Dancer2`, `Catalyst`, PSGI/Plack |
| JSON / YAML / XML | `JSON::MaybeXS`, `Cpanel::JSON::XS`, `YAML::XS`, `XML::LibXML`, `XML::Twig` |
| CSV | `Text::CSV`, `Text::CSV_XS` |
| Database | `DBI`, `DBIx::Class`, `Mojo::Pg`, `SQL::Abstract` |
| Dates | `DateTime`, `Time::Moment`, `Time::Piece` (core) |
| Templates | `Template` (TT2), `Mojo::Template`, `Text::Xslate` |
| Async / events | `AnyEvent`, `Mojo::IOLoop`, `IO::Async`, `Future` |
| Parallelism | `Parallel::ForkManager`, `MCE` |
| Testing | `Test::More`, `Test2::Suite`, `Test::Deep`, `Test::Exception`, `Test::MockModule` |
| Code quality | `Perl::Critic`, `Perl::Tidy` |
| CLI | `Getopt::Long::Descriptive`, `App::Cmd`, `Term::ANSIColor`, `Text::Table` |
| Logging | `Log::Log4perl`, `Log::Any`, `Mojo::Log` |
| Config | `Config::Tiny`, `Config::General`, `YAML::XS` |
| Introspection | `Data::Printer`, `Devel::NYTProf`, `Devel::Cover`, `PPI` |
| Utilities | `Try::Tiny`, `Scope::Guard`, `Data::Compare`, `List::MoreUtils`, `Clone`, `namespace::clean` |

Look modules up on **metacpan.org**; check release recency, test results (CPAN Testers) and reverse dependencies before adopting one.

---

## 27. `Getopt::Long` — Full CLI Reference

### Basic usage

```perl
use Getopt::Long qw(GetOptions :config no_ignore_case bundling);
use Pod::Usage;

my ($verbose, $dry_run, $help) = (0, 0, 0);
my $name   = 'world';                           # defaults
my $count  = 1;
my @tags;
my %define;

GetOptions(
    'verbose|v+'    => \$verbose,               # -v -v -v  or --verbose  (counter)
    'dry-run|n!'    => \$dry_run,               # --dry-run / --no-dry-run (negatable)
    'name|N=s'      => \$name,                  # string value required
    'count|c=i'     => \$count,                 # integer value required
    'ratio=f'       => \my $ratio,              # float
    'tag|t=s@'      => \@tags,                  # --tag a --tag b  -> @tags = (a, b)
    'define|D=s%'   => \%define,                # --define key=value -> %define
    'level:i'       => \my $level,              # optional integer value (defaults to 0)
    'colour|color'  => \my $colour,             # aliases
    'help|h|?'      => \$help,
) or pod2usage(2);                              # unknown option -> usage + exit 2

pod2usage(1) if $help;
say "Remaining arguments: @ARGV";               # non-option arguments stay in @ARGV
```

### Option spec syntax

| Spec | Meaning |
|---|---|
| `name` | Boolean flag (`--name`) |
| `name!` | Negatable (`--name` / `--no-name`) |
| `name+` | Incremental counter |
| `name=s` | Mandatory string |
| `name:s` | Optional string |
| `name=i` / `=f` | Mandatory integer / float |
| `name=o` | Extended integer (accepts `0x1f`, `017`, `0b101`) |
| `name=s@` | Repeatable → array |
| `name=s%` | `key=value` pairs → hash |
| `name=s{2}` | Exactly two values after one flag |
| `name=s{1,}` | One or more values |
| *aliases* | Separate alternative names with a pipe character in the spec string (see the example above) |

### Storing into a hash

```perl
my %opt = (out => 'a.out', jobs => 1);            # defaults
GetOptions(\%opt, 'out|o=s', 'jobs|j=i', 'verbose|v+', 'debug!', 'include|I=s@', 'help|h')
    or pod2usage(2);
say "Building $opt{out} with $opt{jobs} jobs";
say "Includes: @{ $opt{include} // [] }";
```

### Callbacks & validation

```perl
GetOptions(
    'port=i' => sub {
        my ($opt_name, $value) = @_;
        die "Invalid --$opt_name: $value\n" unless $value >= 1 && $value <= 65535;
        $port = $value;
    },
    'lib=s@' => sub { push @INC, $_[1] },
    '<>'     => sub { push @files, "$_[0]" },       # callback for each non-option argument
);
```

### Configuration

```perl
Getopt::Long::Configure(qw(
    bundling            -abc == -a -b -c ; single-dash options are case-sensitive
    no_ignore_case      -v and -V are different options
    pass_through        leave unknown options in @ARGV instead of failing
    gnu_getopt          GNU-style behaviour (bundling + permute + long options with =)
    require_order       stop at the first non-option (subcommand style)
    auto_abbrev         allow unambiguous abbreviations (--verb for --verbose)
    no_auto_abbrev
));
```

### Sub-commands (`git`-style)

```perl
use Getopt::Long qw(GetOptionsFromArray :config require_order);

my %global;
GetOptions(\%global, 'verbose|v', 'help|h') or pod2usage(2);        # options BEFORE the subcommand
my $cmd = shift @ARGV // pod2usage("subcommand required");

my %commands = (
    add    => \&cmd_add,
    remove => \&cmd_remove,
    list   => \&cmd_list,
);
my $handler = $commands{$cmd} or die "Unknown command '$cmd'\n";
exit $handler->(\%global, @ARGV);

sub cmd_add {
    my ($global, @args) = @_;
    my %o;
    GetOptionsFromArray(\@args, \%o, 'force|f', 'name=s') or return 2;
    ...
    return 0;
}
```

### `Pod::Usage` — help text from your own POD

```perl
=head1 NAME

mytool - do useful things

=head1 SYNOPSIS

mytool [options] <file> ...

  Options:
    -n, --name NAME    who to greet
    -v, --verbose      increase verbosity (repeatable)
    -h, --help         show this help
        --man          show the full manual

=head1 OPTIONS

=over 4

=item B<--name> I<NAME>

The name to greet. Defaults to C<world>.

=back

=head1 DESCRIPTION

B<This program> reads the given files and ...

=cut
```

```perl
pod2usage(-verbose => 0, -exitval => 1);              # SYNOPSIS only
pod2usage(-verbose => 1);                             # SYNOPSIS + OPTIONS
pod2usage(-verbose => 2);                             # the full manual page (--man)
pod2usage(-message => "missing file", -exitval => 2, -output => \*STDERR);
```

### Alternative: `Getopt::Long::Descriptive`, `Getopt::Std`

```perl
use Getopt::Std;                                     # tiny, single-letter options only
my %o;   getopts('vn:f:', \%o);                       # -v (flag)  -n VALUE  -f VALUE
say "verbose on" if $o{v};
```

### Exit-code conventions for CLI tools

- `0` success; `1` general failure; `2` bad usage/arguments; `64–78` `sysexits.h` codes (`EX_USAGE=64`, `EX_DATAERR=65`, `EX_NOINPUT=66`, `EX_CONFIG=78`).
- Print errors to **STDERR**, results to **STDOUT**, so pipelines work.
- Read from `STDIN` when no file is named and `-t STDIN` is false.

```perl
@ARGV or -t STDIN and pod2usage("no input");         # nothing piped and no files: show usage
while (<>) { ... }                                    # works for both files and pipes
```

---

## 28. Database Access — `DBI`

`DBI` is the standard database interface; each database has a driver (`DBD::Pg`, `DBD::mysql`, `DBD::MariaDB`, `DBD::SQLite`, `DBD::Oracle`, `DBD::ODBC`).

### Connecting

```perl
use DBI;

my $dbh = DBI->connect(
    'dbi:Pg:dbname=appdb;host=localhost;port=5432',
    $user, $password,
    {
        RaiseError         => 1,        # die on any error (recommended)
        PrintError         => 0,        # don't ALSO warn
        AutoCommit         => 1,        # 0 = manage transactions manually
        pg_enable_utf8     => 1,        # driver-specific Unicode handling
    },
) or die $DBI::errstr;

my $lite = DBI->connect('dbi:SQLite:dbname=data.db', '', '', { RaiseError => 1, sqlite_unicode => 1 });
my $my   = DBI->connect('dbi:MariaDB:database=app;host=127.0.0.1', $u, $p, { RaiseError => 1, mariadb_auto_reconnect => 1 });

DBI->available_drivers;                 # what is installed
$dbh->disconnect;
```

Keep credentials out of source code: read them from the environment, a config file with `0600` permissions, or a secrets manager.

### Placeholders — ALWAYS use them

```perl
my $sth = $dbh->prepare('SELECT id, name FROM users WHERE age > ? AND status = ?');
$sth->execute(30, 'active');
while (my ($id, $name) = $sth->fetchrow_array) { say "$id $name" }
$sth->finish;
```

Never interpolate values into SQL strings (`"... WHERE name = '$name'"`) — that is **SQL injection**. Placeholders (`?` or `:name`) send data separately from the statement. Identifiers (table/column names) cannot be placeholders; validate them against a whitelist or use `$dbh->quote_identifier`.

### Fetch methods

```perl
my @row      = $sth->fetchrow_array;            # one row as a list
my $aref     = $sth->fetchrow_arrayref;         # one row as an array ref (reused buffer — copy it!)
my $href     = $sth->fetchrow_hashref;          # one row as a hash ref (column names -> values)
my $all      = $sth->fetchall_arrayref;         # every row: [[...], [...]]
my $all_h    = $sth->fetchall_arrayref({});     # every row as hashrefs: [{...}, {...}]
my $by_id    = $sth->fetchall_hashref('id');    # { id => { ...row... } }
my $rows     = $sth->rows;                      # rows affected/returned (not always known for SELECT)
my @names    = @{ $sth->{NAME} };               # column names
```

### One-shot helpers

```perl
my ($count)  = $dbh->selectrow_array('SELECT COUNT(*) FROM users');
my $row      = $dbh->selectrow_hashref('SELECT * FROM users WHERE id = ?', undef, $id);
my $rows     = $dbh->selectall_arrayref('SELECT id, name FROM users', { Slice => {} });
my %names    = map { @$_ } @{ $dbh->selectall_arrayref('SELECT id, name FROM users') };
my $col      = $dbh->selectcol_arrayref('SELECT name FROM users');       # one column as an array ref
my $changed  = $dbh->do('UPDATE users SET status = ? WHERE id = ?', undef, 'gone', $id);   # "0E0" if 0 rows
my $id       = $dbh->last_insert_id(undef, undef, 'users', 'id');         # portable auto-increment id
```

### Bulk operations & binding

```perl
my $ins = $dbh->prepare('INSERT INTO items (sku, qty) VALUES (?, ?)');
$ins->execute(@$_) for @rows;                              # reuse the prepared statement

$ins->execute_array({ ArrayTupleStatus => \my @status }, \@skus, \@qtys);   # driver-optimised batch

use DBI qw(:sql_types);
$sth->bind_param(1, $value, SQL_INTEGER);              # explicit type
$sth->bind_columns(\my ($id, $name));
while ($sth->fetch) { say "$id: $name" }                  # fastest way to read many rows
```

### Transactions

```perl
$dbh->begin_work;                          # temporarily turn off AutoCommit
eval {
    $dbh->do('UPDATE accounts SET bal = bal - ? WHERE id = ?', undef, $amt, $from);
    $dbh->do('UPDATE accounts SET bal = bal + ? WHERE id = ?', undef, $amt, $to);
    $dbh->commit;
    1;
} or do {
    my $err = $@;
    eval { $dbh->rollback };
    die "Transfer failed: $err";
};
```

With `AutoCommit => 0` you must call `commit`/`rollback` yourself; uncommitted work is rolled back on disconnect.

### Error handling & diagnostics

```perl
$dbh->{RaiseError} = 1;
my $ok = eval { $dbh->do($sql, undef, @bind); 1 };
warn "DB error: $DBI::errstr (code $DBI::err, state $DBI::state)" unless $ok;

$dbh->{HandleError} = sub { my ($msg, $h, $ret) = @_; log_it($msg); return 0 };
$dbh->trace(2);                            # DBI tracing;  or  DBI_TRACE=2 perl script.pl
say $sth->{Statement};   say $sth->{ParamValues}{1};
```

### Metadata

```perl
my $tables = $dbh->table_info(undef, 'public', '%', 'TABLE')->fetchall_arrayref({});
my $cols   = $dbh->column_info(undef, 'public', 'users', '%')->fetchall_arrayref({});
my $pk     = [ $dbh->primary_key(undef, 'public', 'users') ];
say $dbh->get_info(17);                    # SQL_DBMS_NAME
```

### Connection management

- `connect_cached` reuses handles; `$dbh->ping` checks the connection.
- Do **not** share a `$dbh` across `fork` — reconnect in the child, and set `$dbh->{InactiveDestroy} = 1` in the child for the inherited handle.
- Long-running services: check `ping` before use or reconnect on failure; configure a driver-level timeout.

### ORMs & query builders (CPAN)

```perl
# SQL::Abstract — build SQL + bind values from data structures
use SQL::Abstract;
my $sql = SQL::Abstract->new;
my ($stmt, @bind) = $sql->select('users', ['id', 'name'], { age => { '>' => 30 }, status => 'active' }, ['name']);
# $stmt = 'SELECT id, name FROM users WHERE ( age > ? AND status = ? ) ORDER BY name'

# DBIx::Class — full ORM
my $rs = $schema->resultset('User')->search({ age => { '>' => 30 } }, { order_by => 'name', rows => 10 });
while (my $u = $rs->next) { say $u->name }
$schema->resultset('User')->create({ name => 'Ada', age => 36 });
$schema->txn_do(sub { ... });
```

---

## 29. Networking & HTTP

### `HTTP::Tiny` (core — no dependencies)

```perl
use HTTP::Tiny;
my $http = HTTP::Tiny->new(
    agent   => 'my-tool/1.0',
    timeout => 10,
    verify_SSL => 1,                                    # requires IO::Socket::SSL + Net::SSLeay
);

my $res = $http->get('https://example.com/api/items');
if ($res->{success}) {
    say "status $res->{status}";
    say $res->{headers}{'content-type'};
    say $res->{content};
} else {
    die "GET failed: $res->{status} $res->{reason}\n$res->{content}";   # status 599 = internal/network error
}

my $post = $http->post_form('https://example.com/login', { user => 'ada', pass => 's3cret' });
my $put  = $http->request('PUT', $url, {
    headers => { 'Content-Type' => 'application/json', Authorization => "Bearer $token" },
    content => encode_json({ name => 'x' }),
});
$http->mirror($url, 'local.copy');                       # download only if modified
```

### `LWP::UserAgent` / `Mojo::UserAgent` (CPAN, feature-rich)

```perl
use LWP::UserAgent;
my $ua = LWP::UserAgent->new(timeout => 15, agent => 'tool/1.0', ssl_opts => { verify_hostname => 1 });
$ua->default_header('Accept' => 'application/json');
my $r = $ua->get($url);
die $r->status_line unless $r->is_success;
my $body = $r->decoded_content;                          # honours charset/encoding

use Mojo::UserAgent;
my $mojo = Mojo::UserAgent->new;
my $tx   = $mojo->get('https://api.example.com/items' => { Accept => 'application/json' });
my $data = $tx->result->json;                            # parsed JSON
say $tx->result->code;
$mojo->post('https://example.com/x' => json => { a => 1 });
```

### REST client pattern

```perl
use JSON::PP;
sub api {
    my ($method, $path, $payload) = @_;
    my $res = HTTP::Tiny->new(timeout => 10)->request($method, "$BASE$path", {
        headers => { 'Content-Type' => 'application/json', Authorization => "Bearer $TOKEN" },
        (defined $payload ? (content => encode_json($payload)) : ()),
    });
    die "API $method $path failed: $res->{status} $res->{reason}\n" unless $res->{success};
    return length $res->{content} ? decode_json($res->{content}) : undef;
}
my $item = api('GET', "/items/42");
```

Retry with exponential back-off on `5xx`/network errors; respect `Retry-After`; never log secrets.

### TCP client (`IO::Socket::INET`)

```perl
use IO::Socket::INET;
my $sock = IO::Socket::INET->new(
    PeerAddr => 'example.com',
    PeerPort => 80,
    Proto    => 'tcp',
    Timeout  => 5,
) or die "connect failed: $@";
$sock->autoflush(1);
print $sock "GET / HTTP/1.0\r\nHost: example.com\r\n\r\n";
while (my $line = <$sock>) { print $line }
close $sock;
```

### TCP server

```perl
use IO::Socket::INET;
my $server = IO::Socket::INET->new(
    LocalPort => 7070, Proto => 'tcp', Listen => 10, ReuseAddr => 1,
) or die "listen: $!";
say "listening on 7070";
$SIG{CHLD} = 'IGNORE';                                    # auto-reap children
while (my $client = $server->accept) {
    my $pid = fork() // die;
    if ($pid == 0) {                                      # child handles one connection
        $server->close;
        $client->autoflush(1);
        while (my $line = <$client>) {
            chomp $line;
            print $client "echo: $line\n";
            last if $line eq 'quit';
        }
        exit 0;
    }
    $client->close;                                       # parent closes its copy
}
```

### Non-blocking multiplexing with `IO::Select`

```perl
use IO::Select;
my $sel = IO::Select->new($server);
while (1) {
    for my $fh ($sel->can_read(1)) {                      # 1-second timeout
        if ($fh == $server) {
            my $new = $server->accept;   $sel->add($new);
        } else {
            my $n = sysread($fh, my $buf, 4096);
            if (!$n) { $sel->remove($fh); close $fh; next }
            syswrite($fh, "got: $buf");
        }
    }
}
```

### UDP & Unix sockets

```perl
my $udp = IO::Socket::INET->new(PeerAddr => '127.0.0.1:9999', Proto => 'udp') or die;
$udp->send("ping");

use IO::Socket::UNIX;
my $unix = IO::Socket::UNIX->new(Type => SOCK_STREAM, Peer => '/tmp/app.sock') or die;
```

### DNS & addresses

```perl
use Socket qw(inet_aton inet_ntoa getaddrinfo getnameinfo AF_INET);
my $packed = inet_aton('example.com');   say inet_ntoa($packed) if $packed;
my ($err, @addrs) = getaddrinfo('example.com', 'https', { socktype => Socket::SOCK_STREAM });
die $err if $err;
my $name = gethostbyaddr(inet_aton('8.8.8.8'), AF_INET);
```

### Small web services

```perl
# Mojolicious::Lite — a complete JSON API in a few lines
use Mojolicious::Lite -signatures;

get '/hello/:name' => sub ($c) { $c->render(json => { hello => $c->param('name') }) };
post '/items'      => sub ($c) { my $d = $c->req->json; $c->render(json => { got => $d }, status => 201) };
app->start;
# run: perl app.pl daemon -l http://*:3000

# PSGI (any server: plackup, starman)
my $app = sub ($env) { [200, ['Content-Type' => 'text/plain'], ["Hello\n"]] };
```

### Email

```perl
use Email::Stuffer;                                        # CPAN
Email::Stuffer->from('me@example.com')->to('you@example.com')
              ->subject('Report')->text_body("See attached.")
              ->attach_file('report.pdf')->send;
```

### Security checklist

- Keep TLS verification **on** (`verify_SSL => 1`, `verify_hostname`); never disable it to "fix" a certificate error.
- Set timeouts on every network call — the default is often "forever".
- Don't build shell commands or URLs by concatenating untrusted input; use `URI`/`URI::Escape` and list-form `system`.
- Treat everything received from the network as tainted; validate before use.

---

## 30. Concurrency — `fork` / `IO::Select` / Threads

### Which model to use?

| Need | Best fit |
|---|---|
| Run independent CPU-bound jobs in parallel | `fork` (`Parallel::ForkManager`, `MCE`) |
| Many concurrent I/O connections | Event loop (`AnyEvent`, `Mojo::IOLoop`, `IO::Async`) or `IO::Select` |
| Shared in-memory state between workers | `threads` + `threads::shared` (heavy) — or better: a queue/DB/Redis |
| Simple pipeline of processes | Pipe opens, `IPC::Open3` |

Perl's interpreter threads **copy the whole interpreter** per thread (very heavy) — prefer processes or an event loop.

### `fork`-based worker pool

```perl
use Parallel::ForkManager;                               # CPAN
my $pm = Parallel::ForkManager->new(4);                  # at most 4 concurrent children

$pm->run_on_finish(sub {
    my ($pid, $exit, $ident, $signal, $core, $data) = @_;
    say "job $ident finished (exit $exit)", ($data ? " with result: $$data" : '');
});

for my $job (@jobs) {
    $pm->start($job) and next;                           # parent: continue the loop; child: run below
    my $result = process($job);
    $pm->finish(0, \$result);                            # child exits; data is serialised back
}
$pm->wait_all_children;
```

### Manual `fork` + pipe for results

```perl
pipe(my $reader, my $writer) or die "pipe: $!";
my $pid = fork() // die "fork: $!";
if ($pid == 0) {
    close $reader;
    print $writer "result from child $$\n";
    close $writer;
    exit 0;
}
close $writer;
my $msg = <$reader>;
close $reader;
waitpid($pid, 0);
print "parent got: $msg";
```

### Shared state between processes

```perl
use IPC::ShareLite;                                       # or Storable + files, or a database/Redis
use Fcntl qw(:flock);
sub locked_append {
    my ($file, $line) = @_;
    open(my $fh, '>>', $file) or die;
    flock($fh, LOCK_EX);
    print $fh "$line\n";
    close $fh;                                            # releases the lock
}
```

### Threads (when you really must)

```perl
use threads;
use threads::shared;
use Thread::Queue;

my $q = Thread::Queue->new;
my $counter :shared = 0;                                  # visible to every thread

my @workers = map {
    threads->create(sub {
        while (defined(my $item = $q->dequeue)) {         # blocks until an item arrives
            my $r = heavy($item);
            { lock($counter); $counter++; }               # lock until the block ends
        }
        return 'done';
    });
} 1 .. 4;

$q->enqueue($_) for @jobs;
$q->end;                                                  # tells workers no more input is coming
$_->join for @workers;
say "processed $counter items";
```

Check `perl -V:useithreads` — many distro perls are built **without** thread support.

### Event loops

```perl
use Mojo::IOLoop;
Mojo::IOLoop->timer(2 => sub { say "after 2 s" });
Mojo::IOLoop->recurring(5 => sub { say "every 5 s" });
Mojo::IOLoop->client({ port => 3000 } => sub ($loop, $err, $stream) { $stream->write("hi\n") });
Mojo::IOLoop->start unless Mojo::IOLoop->is_running;

use AnyEvent;
my $cv = AnyEvent->condvar;
my $w  = AnyEvent->timer(after => 1, interval => 1, cb => sub { say "tick" });
my $sigw = AnyEvent->signal(signal => 'INT', cb => sub { $cv->send });
$cv->recv;                                               # run until $cv->send is called
```

### Futures / promises

```perl
use Mojo::Promise;
my @p = map { Mojo::UserAgent->new->get_p($_) } @urls;
Mojo::Promise->all(@p)->then(sub (@results) { say scalar @results, " responses" })->wait;
```

### Concurrency pitfalls

- After `fork`, both processes hold the same file descriptors — close what you don't use, and never share a DB handle (see [section 28](#28-database-access--dbi)).
- Always `wait`/`waitpid` for children (or set `$SIG{CHLD} = 'IGNORE'`) to avoid zombies.
- Flush buffered output **before** forking (`$| = 1`), otherwise both processes emit the same buffer.
- `exit` in a child runs `END` blocks and destructors; use `POSIX::_exit(0)` when the child must skip them.
- Random numbers: call `srand` in each child so they don't produce identical sequences.
- Use `flock` for files shared between processes, and atomic rename (`write tmp; rename`) for replace-on-write.

---

## 31. Testing — `Test::More` / `prove`

### Basic test file

`t/01-basic.t`:

```perl
use strict;
use warnings;
use Test::More;                              # or: use Test::More tests => 8;
use lib 'lib';
use_ok('My::Utils');
use My::Utils qw(trim clamp);

is(trim('  hi  '), 'hi',         'trim removes surrounding space');
is(clamp(15, 0, 10), 10,         'clamp caps at max');
isnt(trim('a'), 'b',             'values differ');
ok(clamp(-5, 0, 10) == 0,        'clamp floors at min');
like('foobar', qr/^foo/,         'regex match');
unlike('foobar', qr/baz/,        'regex non-match');
cmp_ok(3, '<', 5,                'numeric comparison');
is_deeply([1, { a => 2 }], [1, { a => 2 }], 'deep structure equality');
can_ok('My::Utils', 'trim');
isa_ok(My::Class->new, 'My::Class');
pass('always passes');
diag('a diagnostic message goes to STDERR');
note('a note is shown only with prove -v');

done_testing;                                # when you didn't declare a plan
```

### Running

```bash
prove -l t/                          # -l adds lib/ to @INC; runs every t/*.t
prove -lv t/01-basic.t               # verbose (-v) for one file
prove -lr t/                         # -r recurse into subdirectories
prove -j4 -l t/                      # run 4 test files in parallel
prove -l --state=failed,save t/      # rerun only what failed last time
prove -lc --timer t/                 # colour + per-file timing
perl -Ilib t/01-basic.t              # run a single test directly (raw TAP output)
perl Makefile.PL && make test        # in a distribution
HARNESS_OPTIONS=j4 make test
```

Output uses **TAP** (Test Anything Protocol): `ok 1 - description` / `not ok 2 - description`.

### Comparison tests

```perl
is($got, $expected, $name);                    # string comparison (eq)
is($got, undef,     $name);                    # undef-safe
is_deeply(\@got, \@expected, $name);           # nested structures, prints a diff on failure
cmp_ok($x, '>=', 0, $name);                    # any operator, with better failure messages
ok(!$err, $name);
like($err, qr/timeout/i, $name);
```

### Skipping, TODO, subtests

```perl
SKIP: {
    skip "Needs a database", 3 unless $ENV{TEST_DB};
    ok(connect_db(), 'connected');
    ...
}

TODO: {
    local $TODO = "feature not implemented yet";
    is(new_feature(), 42, 'expected to fail for now');
}

subtest 'user creation' => sub {
    plan tests => 2;
    ok(my $u = User->new(name => 'ada'), 'created');
    is($u->name, 'ada', 'name set');
};

plan skip_all => 'Developer tests only' unless $ENV{RELEASE_TESTING};
BAIL_OUT("Can't continue: database is down") if $fatal;
```

### Testing exceptions

```perl
use Test::Fatal;                                        # CPAN, tiny and reliable
is(exception { risky() }, undef, 'no exception');
like(exception { risky('bad') }, qr/invalid input/, 'dies with a helpful message');

use Test::Exception;                                    # CPAN, more DSL
throws_ok { risky('bad') } qr/invalid/, 'dies';
dies_ok   { risky('bad') } 'dies';
lives_ok  { risky('ok')  } 'lives';

# No extra module needed:
my $ok = eval { risky('bad'); 1 };
ok(!$ok, 'died');
like($@, qr/invalid/, 'expected message');
```

### Mocking

```perl
use Test::MockModule;
my $mock = Test::MockModule->new('My::HTTPClient');
$mock->mock(get => sub { return { status => 200, content => '{"ok":true}' } });
is(fetch_status(), 'ok', 'uses mocked HTTP client');
# the original is restored when $mock goes out of scope

# Without a module: local override
{
    no warnings 'redefine';
    local *My::HTTPClient::get = sub { { status => 500 } };
    ...
}

use Test::MockObject;   my $obj = Test::MockObject->new;   $obj->set_true('save');
```

### Testing output & files

```perl
use Capture::Tiny qw(capture_stdout capture);
my $out = capture_stdout { print_report() };
like($out, qr/Total: 42/, 'report shows total');

use File::Temp qw(tempdir);
my $dir = tempdir(CLEANUP => 1);
open(my $fh, '>', "$dir/x.txt") or die;   print $fh "data";   close $fh;
ok(-s "$dir/x.txt", 'file written');

use Test::Output;   stdout_like { hello() } qr/hello/, 'prints hello';
```

### Data-driven tests

```perl
my @cases = (
    [ '  a  ',  'a',   'spaces'  ],
    [ "\tb\n",  'b',   'tab/newline' ],
    [ '',       '',    'empty'   ],
);
for my $c (@cases) {
    my ($in, $want, $name) = @$c;
    is(trim($in), $want, "trim: $name");
}
```

### `Test2::V0` (modern replacement, CPAN)

```perl
use Test2::V0;
is($got, hash { field name => 'Ada'; field age => match qr/^\d+$/; etc; }, 'structure');
like($list, bag { item 'a'; item 'b'; etc }, 'contains a and b');
ok(lives { risky() }, 'lives');
like(dies { risky('bad') }, qr/invalid/, 'dies');
done_testing;
```

### Coverage & quality

```bash
cover -delete
HARNESS_PERL_SWITCHES=-MDevel::Cover prove -lr t/
cover -report html                       # opens cover_db/coverage.html
perlcritic --severity 3 lib/             # static analysis (Perl::Critic)
perltidy -b -bext='/' lib/My/Module.pm   # format code (Perl::Tidy)
podchecker lib/My/Module.pm              # validate POD
```

### Test-suite layout

```text
lib/My/Module.pm
t/00-load.t              # module compiles: use_ok
t/01-basic.t
t/02-errors.t
t/lib/My/Test/Helper.pm  # shared test helpers
xt/author/               # author-only tests (POD coverage, perlcritic), run with RELEASE_TESTING=1
cpanfile
Makefile.PL  (or dist.ini / Build.PL)
```

### Good testing habits

- One behaviour per assertion; give every test a **name**.
- Test the failure paths as well as the happy path.
- Keep tests independent — no ordering assumptions, clean up with `tempdir(CLEANUP => 1)`.
- Don't hit real networks, clocks or databases in unit tests: inject a fake or mock.
- Seed randomness (`srand(42)`) or inject the RNG to keep tests deterministic.

---

## 32. Debugging & Profiling

### Quick printing

```perl
use Data::Dumper;   $Data::Dumper::Sortkeys = 1;
warn Dumper($data);                                   # to STDERR so STDOUT stays clean
warn "x=$x y=$y at ", __FILE__, ':', __LINE__, "\n";
use Data::Printer;   p $data;                         # CPAN: colourised, readable dump
use Carp qw(cluck confess);   cluck "here";           # stack trace as a warning
say STDERR sprintf('%s:%d  %s', (caller(0))[1, 2], join ',', @_);
```

### Compile-time & static checks

```bash
perl -c script.pl                        # syntax check only
perl -wc script.pl                       # ... with warnings
perl -MO=Deparse script.pl               # what Perl thinks your code means
perl -MO=Deparse,-p script.pl            # with full parentheses (shows precedence)
perl -Mdiagnostics script.pl             # long explanations of warnings/errors
perl -we 'use strict; ...'
perlcritic --brutal script.pl            # code-quality report
```

### The Perl debugger (`perl -d`)

```bash
perl -d script.pl arg1                   # start under the debugger
perl -d -e 1                             # an interactive Perl shell
perl -de 0                               # evaluate expressions interactively
```

| Command | Action |
|---|---|
| `n` | Next line (step **over** subroutine calls) |
| `s` | Step **into** the next call |
| `r` | Run until the current sub returns |
| `c` / `c 42` / `c func` | Continue / continue to a line / to a sub |
| `b 42` / `b func` / `b 42 $x > 10` | Set a breakpoint (line / sub / conditional) |
| `B *` / `B 42` | Delete all / one breakpoint |
| `L` | List breakpoints, actions and watches |
| `w $x` / `W *` | Watch an expression / delete watches |
| `p $x` / `x $ref` | Print a value / dump a structure |
| `l` / `l 10-20` / `l func` | List source lines |
| `v` | View a window of code around the current line |
| `T` | Stack trace |
| `S` | List all subroutines |
| `y` | Show lexical variables (needs `PadWalker`) |
| `R` | Restart the program |
| `h` / `h h` / `perldoc perldebug` | Help |
| `q` | Quit |

Any other input is evaluated as Perl — you can change variables and call functions on the fly.

### Programmatic breakpoints

```perl
$DB::single = 1;                          # stop here when running under `perl -d`
BEGIN { $^P |= 0x1 }                      # DB::sub tracing hooks (advanced)
```

```bash
PERLDB_OPTS='NonStop=1 LineInfo=trace.log AutoTrace=1' perl -d script.pl    # non-interactive trace
```

### Tracing calls & variables

```perl
use Devel::Trace;   # perl -d:Trace script.pl      prints each line executed
use Tie::Watch;     # watch a variable for changes
{
    package Watched;
    sub TIESCALAR { my ($c, $v) = @_; bless \$v, $c }
    sub FETCH     { ${ $_[0] } }
    sub STORE     { warn "STORE $_[1] at ", join(':', (caller)[1, 2]), "\n"; ${ $_[0] } = $_[1] }
}
tie my $watched, 'Watched', 0;
$watched = 5;                             # warns with the file and line of the assignment
```

### Profiling with `Devel::NYTProf` (CPAN — the standard tool)

```bash
cpanm Devel::NYTProf
perl -d:NYTProf script.pl                # writes nytprof.out
nytprofhtml --open                       # browsable HTML report (per-line, per-sub timings)
nytprofcsv                               # CSV output
NYTPROF=start=no:addpid=1 perl -d:NYTProf app.pl     # options via the environment
```

Read the report top-down: exclusive time per sub tells you where CPU goes, call counts show hot loops, and the per-line view exposes slow regexes and repeated work.

### Benchmarking snippets

```perl
use Benchmark qw(cmpthese);
cmpthese(-2, {
    join_concat => sub { my $s = join '', ('x') x 1000 },
    dot_append  => sub { my $s = ''; $s .= 'x' for 1 .. 1000 },
});
```

Micro-benchmarks mislead when data sizes differ from production; profile the real program first.

### Memory diagnostics

```perl
use Devel::Size qw(size total_size);
say total_size(\%big_hash);                          # bytes, including nested data
use Devel::Peek;   Dump($scalar);                    # internal SV structure: flags, refcount, UTF8 bit
use Devel::Cycle;   find_cycle($obj);                # detect reference cycles (memory leaks)
use Devel::Leak;  use Test::LeakTrace;   no_leaks_ok { run() } 'no leak';
```

### Common bugs and how to spot them

| Symptom | Likely cause |
|---|---|
| Works on `perl -c` but wrong at run time | Precedence: parenthesise, check with `-MO=Deparse,-p` |
| `Use of uninitialized value` | A variable is `undef`; print it before use |
| Numbers compared as strings (`==` vs `eq`) | Wrong operator for the data |
| Hash order "changes" | Hashes are unordered — `sort keys` |
| Function receives one big flat list | Arrays/hashes flatten; pass references |
| Output is missing when the program dies | STDOUT is buffered: enable autoflush (`$|` set to 1) or print to STDERR |
| Regex works on the sample but not real data | `$` before a trailing newline, missing `/s`/`/m`, Unicode |
| Variable holds a stale value | Closure over a loop variable, missing `my`, or `local` scope |
| `Can't use string ("...") as a HASH ref` | Under `strict refs`: a scalar was used as a reference |
| `Modification of a read-only value` | Editing `$_` aliased to a constant/literal in `for`/`map` |
| Silent failure | Unchecked return value: add `or die`, or `use autodie` |

### Logging

```perl
use Log::Log4perl qw(:easy);
Log::Log4perl->easy_init({ level => $DEBUG, file => '>>app.log', layout => '%d %p %F{1}:%L %m%n' });
DEBUG "loading $file";   INFO "started";   WARN "slow";   ERROR "failed: $err";   LOGDIE "fatal";

use Log::Any qw($log);  $log->infof('user %s logged in', $name);      # library-friendly facade
```

---

## 33. Best Practices & Style

### Non-negotiables

1. Start every file with `use strict; use warnings;` — or `use v5.36;`.
2. Declare every variable with `my` (or `our`); keep scope as small as possible.
3. **Check** every system call: `open ... or die "...: $!"` (or `use autodie`).
4. Use the **three-argument** form of `open` and **lexical** filehandles.
5. Pass **references** to arrays/hashes; return references for large data.
6. Use **placeholders** for SQL, **list form** for `system`, and `quotemeta` for regex input.
7. Prefer well-tested CPAN modules to hand-rolled parsers (CSV, JSON, HTML, dates, URIs).

### Naming & layout

```perl
my $user_count;                          # snake_case for variables and subs
sub fetch_user_by_id { ... }
package My::Module::Name;                # CamelCase / :: separated packages
use constant MAX_RETRIES => 3;           # UPPER_CASE for constants
my $_private_helper;                     # leading underscore by convention = internal
```

- 4-space indentation (spaces, not tabs); lines ≤ 100 characters; one statement per line.
- Format automatically with `perltidy` and share one `.perltidyrc`.
- Put `use` lines first, grouped: pragmas, core modules, CPAN modules, local modules.

### Subroutines

- Keep them short (about 20–30 lines) and single-purpose.
- Unpack `@_` on the first line (or use signatures); never use `@_` elements throughout the body.
- Validate arguments at public boundaries (`croak` on bad input).
- Return a **bare `return;`** for "nothing", not `return undef;`.
- Avoid prototypes (except `&` for block-taking helpers) — use signatures.
- Avoid `&foo;`-style calls and global variables for communication.

### Data & context

- Be explicit about context: `scalar(@array)`, `my ($first) = @list;`.
- Use `//` (defined-or) for defaults, not `||`, unless zero/empty should be replaced too.
- Use `exists` to test keys and `defined` to test values.
- Never rely on hash ordering — `sort keys`.
- Copy structures with `dclone` when independence matters; remember `@copy = @orig` is shallow.

### Strings & regexes

- Use `/x` and named captures for anything non-trivial; add comments inside the pattern.
- Anchor patterns; avoid `.*` where a negated class works.
- Decode input / encode output at the edges; work in characters inside.
- Build text with `join`, `sprintf`, or heredocs instead of long chains of `.`.

### Error handling

- Throw exceptions for errors, return values for results.
- Use `Carp::croak` in libraries, `die` with a newline for user-facing script errors.
- Use `try/catch` (5.34+) or `Try::Tiny` rather than bare `eval` for anything beyond a one-liner.
- Catch **specific** exception classes; rethrow what you don't handle.
- Always `close` files you wrote to and check the result.

### Modules

- One package per file; the file path mirrors the package name.
- Export nothing by default (`@EXPORT_OK`, not `@EXPORT`).
- Document with POD: `NAME`, `SYNOPSIS`, `DESCRIPTION`, `METHODS`/`FUNCTIONS`, `AUTHOR`, `LICENSE`.
- Declare dependencies in a `cpanfile`; pin versions for deployments with `carton`.
- Add a `$VERSION` and use semantic versioning.

### Security

- Enable taint mode (`-T`) for CGI/setuid scripts or when handling hostile input.
- Never `eval` a string that contains external data; never `s///ee` untrusted text.
- Use `File::Temp` for temp files (predictable names are a race-condition risk); `flock` shared files.
- Never `open(FH, $user_input)` — with 2-arg open, a leading `|`, `>` or `<` changes behaviour. Use 3-arg open.
- Keep secrets out of source control and out of process argument lists (visible in `ps`).
- Verify TLS certificates; set timeouts; limit request and file sizes.
- Run `perlcritic --severity 3` (or stricter) in CI.

### Performance

```perl
# Profile first (Devel::NYTProf), then optimise the measured hot spots.
my $re = qr/.../;                        # hoist compiled regexes out of loops
my %lookup = map { $_ => 1 } @list;      # O(1) membership instead of repeated grep
my @sorted = map { $_->[1] } sort { $a->[0] <=> $b->[0] } map { [key($_), $_] } @data;   # cache sort keys
local $_ = $big_string;                  # avoid copying huge strings: pass references instead
print $fh join('', @chunks);             # fewer, larger writes
```

- Read large files **line by line**, not with slurp; process streams.
- Use `join`/`push` and `.=` for building strings — not repeated `x = x . y` in tight loops of huge strings (`.=` is amortised O(1)).
- `sort { $a <=> $b }` and `sort { $a cmp $b }` are recognised and optimised; keep them in that exact form.
- Avoid `keys %h` in scalar context inside loops of large hashes when you only need "is it empty" (`if (%h)`).
- Prefer `for my $i (1 .. $n)` (lazy range) over C-style loops for simple counting.

### Tooling checklist

```bash
perltidy -b -bext='/' lib/**/*.pm        # format
perlcritic --severity 3 lib/ script/     # lint (Perl::Critic)
prove -lr t/                             # tests
cover -test                              # coverage
podchecker lib/                          # docs
cpanm --installdeps .                    # dependencies
```

---

## 34. Useful Patterns & Idioms

### Read a file into a string / array / hash

```perl
my $text  = do { local (@ARGV, $/) = $file; <> };                 # slurp (classic idiom)
my $text2 = do { open(my $fh, '<:encoding(UTF-8)', $file) or die; local $/; <$fh> };
chomp(my @lines = do { open(my $fh, '<', $file) or die; <$fh> });
my %config = map { chomp; split /\s*=\s*/, $_, 2 } grep { !/^\s*(#|$)/ } @lines;    # key=value config
```

### Count / group / dedupe

```perl
my %freq;    $freq{$_}++ for @words;                                # frequency table
my @top = (sort { $freq{$b} <=> $freq{$a} || $a cmp $b } keys %freq)[0 .. 4];
my %by_type; push @{ $by_type{ $_->{type} } }, $_ for @records;     # group by
my %seen;    my @unique = grep { !$seen{$_}++ } @list;              # dedupe, order preserved
my ($min, $max) = (sort { $a <=> $b } @n)[0, -1];
my %index = map { $records[$_]{id} => $_ } 0 .. $#records;          # id -> position
```

### Swap, rotate, chunk, zip

```perl
($a, $b) = ($b, $a);
push @a, shift @a;                                  # rotate left one step
unshift @a, pop @a;                                 # rotate right
my @chunks; push @chunks, [ splice @list, 0, 3 ] while @list;       # split into groups of 3
use List::Util qw(zip mesh);
my @pairs  = zip \@a, \@b;                          # ([a1,b1],[a2,b2],...)
my %h      = mesh \@keys, \@values;                 # hash from two parallel arrays
@h{@keys} = @values;                                # hash slice version
my @matrix_t = map { my $i = $_; [ map { $_->[$i] } @m ] } 0 .. $#{ $m[0] };   # transpose
```

### Flatten & nested access

```perl
my @flat = map { ref $_ ? @$_ : $_ } @mixed;
sub flatten { map { ref $_ eq 'ARRAY' ? flatten(@$_) : $_ } @_ }
my $val = $data->{a}{b}[0]{c} // 'default';                         # safe read with default (may autovivify a, b)
my $val2 = eval { $data->{a}{b}[0]{c} };                            # ... or trap "not a ref" errors
```

### Ternary chains and dispatch tables

```perl
my $grade = $s >= 90 ? 'A' : $s >= 80 ? 'B' : $s >= 70 ? 'C' : 'F';
my %handlers = ( add => \&add, del => \&del, list => sub { ... } );
($handlers{$cmd} || sub { die "unknown: $cmd\n" })->(@args);
```

### Iterate pairs / with index / in chunks

```perl
for my ($k, $v) (%h) { ... }                        # [5.36+] several values per iteration
while (my ($i, $x) = each @list) { ... }
for my $i (0 .. $#list) { ... }
```

### Default & required arguments

```perl
sub connect_to ($host, %opt) {
    my $port    = $opt{port}    // 5432;
    my $timeout = $opt{timeout} // 30;
    my $user    = $opt{user}    // die "user is required";
}
```

### Retry with back-off

```perl
sub retry ($tries, $code) {
    my $delay = 1;
    for my $attempt (1 .. $tries) {
        my @r = eval { $code->() };
        return @r unless $@;
        die $@ if $attempt == $tries;
        warn "attempt $attempt failed: $@";
        sleep $delay;   $delay *= 2;
    }
}
my $data = retry(5, sub { fetch($url) });
```

### Memoisation

```perl
sub memoize_fn ($f) { my %c; sub { $c{ join $;, @_ } //= $f->(@_) } }
my $slow_sq = sub { sleep 1; $_[0] ** 2 };
my $fast = memoize_fn($slow_sq);
```

### Iterators & generators with closures

```perl
sub counter ($start = 0, $step = 1) { my $n = $start - $step; sub { $n += $step } }
my $it = counter(10, 5);
say $it->(), ' ', $it->(), ' ', $it->();            # 10 15 20

sub file_lines ($path) {
    open(my $fh, '<', $path) or die "$path: $!";
    return sub { my $l = <$fh>; defined $l ? do { chomp $l; $l } : do { close $fh; undef } };
}
my $next = file_lines($file);
while (defined(my $l = $next->())) { ... }
```

### Templating & string building

```perl
my %vars = (name => 'Ada', n => 3);
(my $out = "Hello {{name}}, you have {{n}} messages") =~ s{\{\{(\w+)\}\}}{ $vars{$1} // '' }ge;
printf "%-15s %8.2f %s\n", @$_[0 .. 2] for @rows;                  # report formatting
print join("\n", map { sprintf '%-10s|%5d', @$_ } @rows), "\n";
my $bar = '#' x int($pct / 5) . ' ' x (20 - int($pct / 5));         # text progress bar
$| = 1;   print "\rprogress: $_%" for 1 .. 100;                     # in-place progress
```

### Command dispatch / main-guard

```perl
__PACKAGE__->run(@ARGV) unless caller;              # run only when executed, not when loaded as a module
sub run ($class, @args) { ... }
```

### Safe temp-file replace (atomic write)

```perl
use File::Temp qw(tempfile);
use File::Basename qw(dirname);
my ($tmp_fh, $tmp) = tempfile(DIR => dirname($target));             # same filesystem → rename is atomic
print $tmp_fh $content;
close $tmp_fh or die "close: $!";
rename $tmp, $target or die "rename: $!";
```

### PID file & single-instance guard

```perl
use Fcntl qw(:flock);
open(my $lock, '>>', '/tmp/myjob.lock') or die;
flock($lock, LOCK_EX | LOCK_NB) or do { say "already running"; exit 0 };
truncate($lock, 0);   print $lock "$$\n";   $lock->flush;
# the lock is released when the process exits
```

### Progress, spinners & terminal detection

```perl
my $interactive = -t STDOUT;
say colored("done", 'green') if $interactive;
my ($rows, $cols) = split ' ', `stty size 2>/dev/null` || '24 80';
```

### Simple state machine / parser skeleton

```perl
my %next = (idle => { start => 'running' }, running => { pause => 'paused', stop => 'idle' }, paused => { resume => 'running', stop => 'idle' });
my $state = 'idle';
for my $ev (@events) {
    my $to = $next{$state}{$ev} // do { warn "bad event $ev in $state"; next };
    say "$state --$ev--> $to";
    $state = $to;
}
```

### Table-driven validation

```perl
my %rules = (
    name  => sub { length $_[0] && length $_[0] <= 50 },
    age   => sub { $_[0] =~ /^\d+$/ && $_[0] < 150 },
    email => sub { $_[0] =~ /^[^@\s]+@[^@\s]+\.[^@\s]+$/ },
);
my @errors = grep { !($rules{$_}->($in{$_} // '')) } sort keys %rules;
say @errors ? "invalid: @errors" : 'ok';
```

### Text utilities

```perl
my $wrapped = join "\n", $text =~ /(.{1,70})(?:\s+|$)/g;            # naive word wrap at 70 columns
my $commas  = reverse join ',', unpack '(A3)*', reverse int $n;    # 1234567 -> 1,234,567
my $title   = join ' ', map { ucfirst lc } split / /, $str;
(my $slug = lc $title) =~ s/[^a-z0-9]+/-/g;   $slug =~ s/^-|-$//g;  # URL slug
my $is_palindrome = lc($s) eq reverse lc($s);
my $count = () = $str =~ /\bfoo\b/g;
my @words = $text =~ /\b[\w']+\b/g;
```

---

## 35. Version Feature Timeline

| Version | Highlights |
|---|---|
| **5.8** (2002) | Unicode/PerlIO layers, safe signals, threads (ithreads) |
| **5.10** (2007) | `say`, `state`, `//` (defined-or), named captures `(?<n>...)`, `given/when`, smartmatch, `%+`, `\K`, recursive patterns |
| **5.12** (2010) | `use v5.12` enables `strict`, `package NAME VERSION`, `...` (yada-yada) operator, `each/keys/values` on arrays, Unicode 5.2 |
| **5.14** (2011) | `s///r` and `tr///r` (non-destructive), `package NAME { }` block syntax, `\N{...}` names, `$@` handling fixed |
| **5.16** (2012) | `__SUB__`, `fc`, `use feature ':5.16'`, `\N{}` improvements |
| **5.18** (2013) | Lexical subs (`my sub`, experimental), hash-order randomisation |
| **5.20** (2014) | **Subroutine signatures** (experimental), postfix dereference `->@*`, `%h{...}` key/value slices |
| **5.22** (2015) | `<<>>` double-diamond, separate string-bitwise operators (experimental), `\b{wb}` boundaries, `use re 'strict'`, hex float literals |
| **5.24** (2016) | Postfix dereference stable, `\b{...}` improvements |
| **5.26** (2017) | `<<~` indented heredocs, `/xx`, lexical subs stable, `.` removed from `@INC` by default (security) |
| **5.28** (2018) | `use feature 'bitwise'` stable, Unicode 10, `\p{...}` improvements |
| **5.30** (2019) | Limited variable-length lookbehind, `\p{}` for Unicode 12, performance work |
| **5.32** (2020) | Chained comparisons (`$a < $b < $c`), `isa` operator, Unicode 13 |
| **5.34** (2021) | `try/catch` (experimental), `{,n}` quantifier, `0o755` octal syntax |
| **5.36** (2022) | **`use v5.36` enables `warnings` + signatures + `say` + `isa`**; `builtin::` functions (`true`, `false`, `trim`, `ceil`, `floor`, `indexed`, `blessed`, `reftype`, `refaddr`, `weaken`); multi-var `foreach` (experimental); `finally`; `defer` blocks (experimental); `-g` switch |
| **5.38** (2023) | Core **`class` / `field` / `method`** (experimental), the defined-or and logical-or assignment operators as signature defaults, `__CLASS__`, `use v5.38` disables bareword filehandles, `module_true` feature |
| **5.40** (2024) | `try/catch` stable, `builtin::` mostly stable, multi-var `foreach` stable, `__CLASS__` and `:reader` field attribute, `use v5.40` imports `builtin` functions, `^^` operator |
| **5.42** (2025) | Further `class`/`field` polish (`:writer`, `my method`), `any`/`all` keyword operators (experimental), smartmatch/switch kept under `use feature 'smartmatch'`, Unicode 16 |

Check the exact behaviour of your interpreter with `perl -v` and `perldoc perldelta` (release notes) / `perldoc perl5NNNdelta`.

### Writing version-aware code

```perl
use v5.36;                                     # hard requirement
use if $] >= 5.038, 'feature', 'class';        # conditional import (needs the `if` module)
BEGIN { require 5.010_001 }                    # minimum version check (5.10.1)
say "Running on $^V ($])";
if ($] < 5.010) { die "perl 5.10 or newer is required\n" }
```

### Feature bundles

```perl
use feature ':5.10';   # say state switch
use feature ':5.16';   # + unicode_strings current_sub fc evalbytes
use feature ':5.36';   # + isa signatures ; removes indirect and multidimensional
use v5.36;             # same bundle + strict + warnings
```

### Migrating legacy code

- Replace 2-arg `open`/bareword handles with 3-arg `open` and lexical handles.
- Replace `local $_;`-style hacks and prototype tricks with signatures.
- Add `use strict; use warnings;` first, fix what breaks, then refactor.
- Replace indirect object syntax (`new Foo(...)`) with `Foo->new(...)`.
- Replace `given/when` and `~~` with `if`/`elsif` or dispatch tables.
- Run `perlcritic` and `perl -MO=Deparse` to understand old code before touching it.

---

## 36. Q&A — Conceptual Questions

**Q: What is the difference between `my`, `our` and `local`?**
`my` creates a **lexical** variable, visible only in the enclosing block/file and invisible to called subs — use it by default. `our` declares a lexical *alias* to a **package (global)** variable so you can use it without a fully-qualified name under `strict`. `local` doesn't create a variable at all; it **temporarily replaces the value of an existing global** for the dynamic extent of the block and restores it on exit — used for special variables like `$/`, `$,` and `%ENV`.

---

**Q: What is the difference between `==` and `eq`?**
`==` compares **numerically**, `eq` compares as **strings**. `"abc" == "xyz"` is true (both numify to 0, with a warning), and `"10" eq "10.0"` is false. Pick the operator by the *data type you intend*, since Perl scalars carry no fixed type.

---

**Q: What is context, and why does `my ($x) = @a` differ from `my $x = @a`?**
Context is the "what does the caller want" signal — scalar, list or void — that an expression's environment supplies. The left side `($x)` is a list, so `@a` is evaluated in **list** context and its first element goes to `$x`. The left side `$x` is a scalar, so `@a` is evaluated in **scalar** context and yields the **element count**. Functions can observe context with `wantarray`.

---

**Q: What is the difference between `undef`, empty string and `0`?**
`undef` means "no value", `''` is a defined empty string and `0` is a defined number. All three are **false**, but only `undef` fails `defined`. Use `defined` (or `//`) when `0` and `''` are legitimate values, and `exists` to test whether a hash key is present at all.

---

**Q: How do arrays and hashes differ from references to them?**
`@a` and `%h` are containers; when passed to a sub they are **flattened** into a single list of scalars, losing their identity. A reference (`\@a`, `\%h`, `[...]`, `{...}`) is a single scalar that points to the container, so it can be passed, stored, nested, and modified in place without copying. Nested data structures are always built from references.

---

**Q: What is autovivification and how do I avoid its surprises?**
Perl creates missing intermediate hashes/arrays automatically when you *assign* through a path (`$h{a}{b} = 1`) — and also when you merely *read* deeper than one level (`if ($h{a}{b})` creates `$h{a}`). This is convenient for building structures but means existence checks on nested keys silently modify the data. Test each level (`$h{a} && exists $h{a}{b}`), or `use no autovivification;` (CPAN) in code that must not grow structures.

---

**Q: What does `use strict; use warnings;` actually do?**
`strict` makes the compiler reject undeclared variables (`vars`), symbolic references (`refs`) and unquoted barewords (`subs`). `warnings` enables run-time diagnostics such as *uninitialized value*, *isn't numeric*, *used only once* and *redefined*. Together they turn most typos and type mix-ups into immediate messages instead of silent wrong results. Modern code starts with `use v5.36;`, which enables both.

---

**Q: What is the difference between `foreach` aliasing and copying?**
The loop variable in `for my $x (@list)` is an **alias** to each element — assigning to `$x` modifies the array. Iterating over a literal list of constants makes the elements read-only (`Modification of a read-only value`). Copy first (`my $copy = $x;`) when you want to change a value without touching the source. `map`, `grep` and `sort`'s `$_` behave the same way.

---

**Q: How are arguments passed to subroutines?**
Everything goes into the flattened array `@_`, and its elements are **aliases** of the caller's arguments — `$_[0]++` modifies the caller's variable. The idiom `my ($x, $y) = @_;` (or a signature) copies them into private lexicals, which is almost always what you want. To pass an array or hash intact, pass a reference.

---

**Q: What is a closure?**
An anonymous (or nested) sub that captures the lexical variables that were in scope when it was created, keeping them alive as long as the sub exists. Closures give you private state (`make_counter`), callbacks with context, and iterators. Each execution of the enclosing scope creates a fresh set of captured variables (that is why `map { my $i = $_; sub { $i } }` works but a shared outer variable doesn't).

---

**Q: What does `bless` do?**
`bless $ref, 'Class'` marks the thing a reference points to as belonging to a package. From then on method calls on that reference are resolved through that package (and its `@ISA` parents). Perl has no separate "class" construct: a class is a package, a method is a sub that expects the invocant first, an object is a blessed reference. `class`/`field`/`method` (5.38+) and Moo/Moose add a friendlier syntax on the same foundation.

---

**Q: What is the difference between `use` and `require`?**
`use Module LIST` happens at **compile time**: it does `BEGIN { require Module; Module->import(LIST) }`, so imported names and pragmas are visible for the rest of the compilation. `require` runs at **run time**, loads the file once (recorded in `%INC`), and does not call `import`. Use `require` for optional or lazily-loaded modules, with `eval { require X; 1 }` to test availability.

---

**Q: Why should I use the three-argument `open` and lexical filehandles?**
The 2-arg form parses special characters in the *filename* (`|cmd`, `>file`, a leading space…), turning user input into a command-injection or data-loss bug. The 3-arg form keeps mode and path separate. Lexical handles (`my $fh`) are scoped, auto-closed when they leave scope, don't collide with other code, and can be passed around like any scalar; bareword `FH` handles are package globals.

---

**Q: What is the difference between `s///` and `tr///`?**
`s///` is a full regex substitution (patterns, captures, `/e` code in the replacement). `tr///` (a.k.a. `y///`) is a fast, character-by-character **transliteration or counting** tool — no patterns, just character sets and ranges. Use `tr/a-z//` to count characters and `tr/a-z/A-Z/` for a simple map; use `s///` for anything pattern-based.

---

**Q: How do greedy and non-greedy quantifiers differ?**
Greedy quantifiers (`*`, `+`, `?`, `{n,m}`) match as much as possible and backtrack only if the rest of the pattern fails. Adding `?` (`*?`, `+?`) makes them match as little as possible. For `"<b>x</b><b>y</b>" =~ /<b>(.+)<\/b>/` greedy captures `x</b><b>y`; lazy `(.+?)` captures `x`. A negated class (`[^<]+`) is usually clearer and faster than a lazy dot.

---

**Q: What is the difference between `$&`, `$1`, `%+` and `@-`/`@+`?**
`$&` is the whole match, `$1`, `$2`… are positional capture groups, `%+` holds *named* captures (`$+{year}`), and `@-`/`@+` give the start/end **offsets** of the match and each group. They are dynamically scoped and only set after a **successful** match — a failed match leaves the previous values in place, so copy them immediately.

---

**Q: What is the difference between `die` and `warn`, and how do I catch errors?**
`warn` prints to STDERR and continues; `die` raises an exception that unwinds the stack unless something catches it. Wrap risky code in `eval { ...; 1 } or do { handle($@) }`, or use `try/catch` (5.34+) or `Try::Tiny`. `die` can throw any scalar, including **objects** — the basis of exception classes — and `Carp::croak` reports the error at the *caller's* line, which is what you want in a library.

---

**Q: Why does `print reverse "hello"` print "hello"?**
`print` provides **list context** to its arguments, so `reverse` reverses a one-element *list* — leaving the string as is. `reverse` only reverses characters in **scalar** context: `print scalar reverse "hello"` or `my $r = reverse "hello"` prints "olleh".

---

**Q: What is the difference between `@array` in scalar and list context?**
In list context it yields the elements; in scalar context (`my $n = @a`, `if (@a > 3)`, `scalar(@a)`) it yields the **count**. `$#a` is the last **index** (count − 1). That is why `print "n=" . @a` prints the count while `print "n=", @a` prints the elements.

---

**Q: How do I sort numerically or by multiple keys?**
The default `sort` compares strings (so `10` sorts before `9`). Supply a block with `$a` and `$b`: `sort { $a <=> $b } @n` for numbers, and chain criteria with `or` or `||`: `sort { $a->{last} cmp $b->{last} or $b->{age} <=> $a->{age} } @people`. Use the Schwartzian transform (map → sort → map) when computing the key is expensive.

---

**Q: What does `local $_` protect against?**
`$_` is a global. Any function that clobbers it (`while (<FH>)` inside a callback, a nested `for`) will corrupt the caller's `$_` in the middle of its own `map`/`for`. `local $_ = $value;` saves and restores it. Modern code avoids the problem by naming loop variables (`for my $item (...)`).

---

**Q: What are `BEGIN`, `END` and `__DATA__`?**
`BEGIN` blocks run as soon as they're compiled — that is how `use` works. `END` blocks run at program exit (even after `die`/`exit`) in reverse order — useful for cleanup. `__DATA__`/`__END__` mark the end of code; text after `__DATA__` is readable through the `DATA` filehandle, handy for embedded fixtures and templates.

---

**Q: How can I make Perl code faster?**
Profile first (`Devel::NYTProf`). Common wins: use hashes for lookups instead of repeated `grep`, precompile regexes with `qr//`, avoid re-reading/concatenating giant strings, process files line by line, cache expensive sort keys, use `List::Util` (implemented in XS) instead of hand-written loops, use `Text::CSV_XS`/`JSON::XS`-style XS parsers, and push work into the database. If the hot loop is numeric, consider `PDL` or an XS/`Inline::C` kernel.

---

**Q: How do I handle Unicode correctly?**
Follow one rule: **decode on input, encode on output**, and work with character strings in between. Put `use utf8;` in source files with non-ASCII literals, `use open qw(:std :encoding(UTF-8));` to set default layers, and `decode('UTF-8', $_)` for `@ARGV`. Use `\p{...}`/`\X` for Unicode-aware matching, `fc` for case-insensitive comparison, and `Unicode::Normalize` (NFC) before comparing user text. "Wide character in print" means you forgot an output layer.

---

**Q: What is the difference between `system`, backticks, `exec` and `fork`?**
`system` runs a command, waits, and returns its status (the exit code is `$? >> 8`). Backticks/`qx` run a command and **capture its output**. `exec` **replaces** the current process and never returns on success. `fork` clones the process into parent and child so both keep running — the base for parallel workers. Prefer the **list form** (`system 'ls', '-l', $dir`) to avoid the shell and injection.

---

**Q: What is taint mode?**
With `-T`, Perl marks all data from outside the program (arguments, environment, files, sockets) as **tainted** and refuses to use it in dangerous operations (`system`, `open` for writing, `eval`, `unlink`…) until you *untaint* it by extracting it with a strict regex capture. It is a safety net for setuid/CGI-style code — not a substitute for input validation.

---

**Q: How do I write a testable script?**
Put logic in subs/modules and keep the "main" tiny: `main(@ARGV) unless caller;` (or `exit main(@ARGV)`) lets the file be both run and `require`d by tests. Inject dependencies (filehandles, clocks, HTTP clients) instead of using globals, return values rather than printing, and write `t/*.t` files with `Test::More` (run via `prove -lr t/`).

---

**Q: What is CPAN, and how should I use it safely?**
CPAN is the Comprehensive Perl Archive Network — the central repository of over 200,000 modules, browsable at metacpan.org and installed with `cpanm`/`cpan`. Vet a module by its recent releases, test matrix (CPAN Testers), documentation, open issues and reverse dependencies. Pin exact versions with a `cpanfile` + `carton` for production, and install per-project (`local::lib`, `carton`) instead of touching the system Perl.

---

**Q: When should I *not* use Perl?**
Perl remains superb for text processing, glue scripts, log/data munging, sysadmin automation, bioinformatics, quick web services (Mojolicious/PSGI) and legacy-system maintenance. It is a weaker fit where you need a strong static type system, mobile/GUI front ends, a large hiring pool for greenfield teams, or heavy numeric/ML tooling — Python, Go, Rust and TypeScript have larger ecosystems there.

---
