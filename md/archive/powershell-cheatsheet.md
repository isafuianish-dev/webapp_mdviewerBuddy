# PowerShell Cheat Sheet

A detailed, professional-grade reference for PowerShell (5.1 and 7+), grouped by topic. PowerShell is object-oriented at the pipeline level — commands pass structured .NET objects to each other, not plain text, which is what makes it different from POSIX shells like bash or ksh.

---

## Basics & Cmdlet Syntax

### Verb-Noun cmdlets

Built-in commands ("cmdlets") follow a consistent `Verb-Noun` naming pattern, which makes the command set discoverable without memorizing everything.

```powershell
Get-Process                  # list running processes
Get-Service                    # list services
Get-ChildItem                    # list files/folders (like ls/dir)
Get-Command Get-*                  # discover cmdlets by verb
Get-Verb                             # list all approved verbs (Get, Set, New, Remove, ...)
```

### Getting help

```powershell
Get-Help Get-Process              # basic help
Get-Help Get-Process -Full          # full help with all parameter details
Get-Help Get-Process -Examples        # just the usage examples
Get-Help Get-Process -Online            # open the web docs
Update-Help                               # download the latest local help content

Get-Member -InputObject (Get-Process)[0]    # list every property/method on an object
```

---

## Variables & Data Types

```powershell
$name = "Ada"
$count = 5
$isActive = $true
$nothing = $null

"$name has $count items"      # string interpolation inside double quotes
'$name is literal here'         # single quotes: no interpolation

$name.GetType().Name        # "String" — everything in PowerShell is a typed .NET object
[int]"42"                     # explicit cast to a type
[string]42                      # cast the other way

# Arrays
$fruits = @("apple", "banana", "cherry")
$fruits[0]                # "apple"
$fruits.Count                # 3
$fruits += "date"              # append (creates a new array under the hood)

# Hashtables (dictionaries)
$user = @{ Name = "Ada"; Role = "Engineer" }
$user["Name"]           # "Ada"
$user.Name                # same thing, property-style access
$user.Keys
$user.Values
```

---

## Operators

PowerShell's comparison operators are words, not symbols — `<` and `>` are reserved for redirection.

```powershell
5 -eq 5           # equal
5 -ne 3             # not equal
5 -gt 3               # greater than
5 -lt 10                # less than
5 -ge 5                   # greater than or equal
5 -le 5                     # less than or equal

"Ada" -like "A*"       # wildcard match (*, ?)
"Ada" -match "^A"        # regex match
"Ada" -contains "A"        # (for collections) does the collection contain this exact item?

$true -and $false      # logical and
$true -or $false          # logical or
-not $true                  # logical not (also: !$true)

# Comparisons are case-insensitive by default; use the -c prefix to force case-sensitive
"ADA" -eq "ada"        # true
"ADA" -ceq "ada"          # false
```

---

## Control Flow

```powershell
if ($score -ge 90) {
  $grade = "A"
} elseif ($score -ge 80) {
  $grade = "B"
} else {
  $grade = "F"
}

switch ($status) {
  "pending"   { "Waiting"; break }
  "shipped"   { "On the way"; break }
  "delivered" { "Done"; break }
  default     { "Unknown" }
}

switch -Wildcard ($filename) {
  "*.txt" { "Text file" }
  "*.ps1" { "PowerShell script" }
}
```

---

## Loops

```powershell
foreach ($fruit in $fruits) {
  Write-Output $fruit
}

for ($i = 0; $i -lt 5; $i++) {
  Write-Output $i
}

$i = 0
while ($i -lt 5) {
  $i++
}

do {
  $i--
} while ($i -gt 0)          # runs at least once

1..5 | ForEach-Object {           # pipeline form — often preferred for one-liners
  Write-Output $_                    # $_ is the current pipeline item
}
```

---

## The Pipeline

The pipeline (`|`) passes whole objects from one cmdlet to the next, so downstream commands can filter, reshape, or sort by property name instead of parsing text.

```powershell
Get-Process | Where-Object { $_.CPU -gt 100 }                 # filter
Get-Process | Sort-Object -Property CPU -Descending              # sort
Get-Process | Select-Object -First 5 Name, CPU, Id                 # pick columns and limit rows
Get-Process | ForEach-Object { $_.Name.ToUpper() }                   # transform each item

Get-ChildItem *.log | Measure-Object -Property Length -Sum          # aggregate

# Shorthand: -Where and % are common abbreviations for Where-Object/ForEach-Object
Get-Process | ? { $_.CPU -gt 100 } | % { $_.Name }
```

---

## Functions

```powershell
function Get-Greeting {
  param(
    [string]$Name = "World",
    [int]$Times = 1
  )
  for ($i = 0; $i -lt $Times; $i++) {
    "Hello, $Name!"
  }
}

Get-Greeting -Name "Ada" -Times 2
Get-Greeting "Ada"                    # positional argument also works

function Get-Square {
  param([Parameter(Mandatory)][int]$Number)     # required parameter
  return $Number * $Number
}

# Advanced function with pipeline input and validation
function Test-Positive {
  [CmdletBinding()]
  param(
    [Parameter(ValueFromPipeline)]
    [int]$Value
  )
  process {
    $Value -gt 0
  }
}

1, -2, 3 | Test-Positive        # True, False, True — `process` runs once per pipeline item
```

---

## Objects & Properties

```powershell
Get-Process | Get-Member          # inspect every property and method an object exposes

$user = [PSCustomObject]@{
  Name = "Ada"
  Role = "Engineer"
}
$user.Name

$people = @(
  [PSCustomObject]@{ Name = "Ada"; Age = 36 },
  [PSCustomObject]@{ Name = "Grace"; Age = 42 }
)
$people | Where-Object { $_.Age -gt 40 } | Select-Object Name

$people | Format-Table -AutoSize     # print as a readable table
$people | ConvertTo-Json               # serialize to JSON
$people | Export-Csv people.csv -NoTypeInformation
```

---

## Error Handling

```powershell
try {
  Get-Content "does-not-exist.txt" -ErrorAction Stop
} catch {
  Write-Error "Failed: $($_.Exception.Message)"
} finally {
  Write-Output "Cleanup runs either way"
}

# -ErrorAction controls how a cmdlet reacts to a non-terminating error
Get-Content "missing.txt" -ErrorAction SilentlyContinue     # suppress and continue
Get-Content "missing.txt" -ErrorAction Stop                   # promote to a terminating error (catchable)

$Error[0]                 # the most recent error record, from the automatic $Error collection
$?                           # $true/$false — did the last command succeed?

throw "Something went wrong"          # raise a terminating error manually
```

---

## File System & I/O

```powershell
Get-ChildItem                       # list current directory (alias: ls, dir, gci)
Get-ChildItem -Recurse -Filter *.log
Test-Path "C:\logs\app.log"           # does the path exist?

Get-Content "file.txt"                  # read a file's lines
Get-Content "file.txt" -Raw               # read the whole file as one string
Set-Content "file.txt" "new content"        # overwrite a file
Add-Content "file.txt" "appended line"        # append to a file

Copy-Item "a.txt" "b.txt"
Move-Item "old.txt" "new.txt"
Remove-Item "temp.txt"
Remove-Item "temp-folder" -Recurse -Force

New-Item -ItemType Directory -Path "C:\reports"
New-Item -ItemType File -Path "C:\reports\out.txt"
```

---

## Modules & Environment

```powershell
Get-Module -ListAvailable         # every module installed on the system
Import-Module Az                    # load a module into the current session
Install-Module -Name Pester           # install from the PowerShell Gallery

$env:PATH                    # read an environment variable
$env:MY_VAR = "value"          # set one for this session
[Environment]::GetEnvironmentVariable("PATH", "Machine")   # a persistent, system-level read

$PROFILE               # path to the current user's PowerShell profile script
notepad $PROFILE          # edit it — code here runs at the start of every session
```

---

## Remoting & Background Jobs

```powershell
Invoke-Command -ComputerName Server01 -ScriptBlock { Get-Process }   # run remotely
Enter-PSSession -ComputerName Server01                                 # interactive remote session

$job = Start-Job -ScriptBlock { Start-Sleep 5; "done" }    # run asynchronously in the background
Get-Job                                                        # list jobs and their state
Receive-Job -Job $job -Wait                                      # block until finished, then get the result
Remove-Job -Job $job
```

---

## Quick Task Reference

- **List and filter objects:** `Get-X | Where-Object { ... }`
- **Pick specific properties:** `Select-Object Name, Id`
- **Sort results:** `Sort-Object -Property X -Descending`
- **Inspect an object's shape:** `... | Get-Member`
- **Read a whole file as text:** `Get-Content file.txt -Raw`
- **Suppress a non-fatal error:** `-ErrorAction SilentlyContinue`
- **Turn an error into something catchable:** `-ErrorAction Stop` + `try/catch`
- **Loop over pipeline input in a function:** a `process { }` block with `[Parameter(ValueFromPipeline)]`
- **Check if the last command succeeded:** `$?`
- **Edit your startup script:** `notepad $PROFILE`
