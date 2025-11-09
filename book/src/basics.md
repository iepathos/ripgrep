# Basics

This chapter covers the fundamental usage of ripgrep, including pattern matching, literal strings, regular expressions, and basic output formatting. If you're new to ripgrep, start here.

## Quick Start

Here are the most common ripgrep commands to get you started:

```bash
# Simple search for a pattern
rg TODO

# Case-insensitive search
rg -i error

# Search for exact string (no regex)
rg -F "function()"

# Count matches per file
rg -c pattern

# List files containing matches
rg -l pattern

# Search with line numbers and context
rg -n -C 2 pattern
```

## Pattern Matching

### Basic Search

The simplest way to use ripgrep is to provide a pattern to search for:

```bash
rg TODO
```

This searches recursively through all files in the current directory for the pattern "TODO".

### Multiple Patterns

You can specify multiple patterns using the `-e` or `--regexp` flag:

```bash
# Match lines containing either TODO or FIXME
rg -e TODO -e FIXME

# Match multiple patterns
rg -e "error" -e "warning" -e "critical"
```

### Patterns from a File

For complex searches with many patterns, you can store them in a file and use `-f` or `--file`:

```bash
# Create a patterns file
echo "TODO" > patterns.txt
echo "FIXME" >> patterns.txt
echo "HACK" >> patterns.txt

# Search using patterns from file
rg -f patterns.txt
```

Each line in the patterns file is treated as a separate pattern.

## Literal String Search

By default, ripgrep interprets patterns as regular expressions. Sometimes you want to search for literal strings that contain regex metacharacters like `.`, `*`, `(`, `)`, etc.

### Fixed String Mode

Use `-F` or `--fixed-strings` to search for literal strings:

```bash
# Without -F, you'd need to escape the parentheses
rg "function\(\)"

# With -F, search for the exact string
rg -F "function()"

# Search for literal dots, asterisks, brackets, etc.
rg -F "192.168.1.1"
rg -F "file*.txt"
rg -F "[debug]"
```

**When to use `-F`:**
- Searching for code snippets with special characters
- Looking for URLs, IP addresses, or file paths
- Better performance when you don't need regex features
- Avoiding regex metacharacter interpretation issues

## Regular Expressions

Ripgrep uses Rust's regex engine by default, which supports a rich set of regex features.

### Basic Metacharacters

```bash
# . matches any character (except newline)
rg "error."          # Matches "error1", "errors", "error!"

# * means zero or more of the preceding element
rg "lo*p"            # Matches "lp", "loop", "looop"

# + means one or more of the preceding element
rg "lo+p"            # Matches "loop", "looop" but not "lp"

# ? means zero or one of the preceding element
rg "colou?r"         # Matches "color" or "colour"

# ^ matches start of line
rg "^TODO"           # Matches lines starting with "TODO"

# $ matches end of line
rg "error$"          # Matches lines ending with "error"
```

### Character Classes

```bash
# [abc] matches any single character a, b, or c
rg "[aeiou]"         # Matches any vowel

# [a-z] matches any character in the range
rg "[0-9]+"          # Matches one or more digits
rg "[a-zA-Z]+"       # Matches alphabetic words

# [^abc] matches any character except a, b, or c
rg "[^0-9]"          # Matches any non-digit character
```

### Predefined Character Classes

```bash
# \d matches any digit [0-9]
rg "\d+"             # Matches numbers like "42", "123"

# \w matches word characters [a-zA-Z0-9_]
rg "\w+"             # Matches words

# \s matches whitespace characters (space, tab, newline)
rg "\s+error"        # Matches "error" with leading whitespace

# \D matches non-digits
# \W matches non-word characters
# \S matches non-whitespace
```

### Word and Line Boundaries

```bash
# \b matches word boundary
rg "\btest\b"        # Matches "test" but not "testing" or "contest"

# \B matches non-word boundary
rg "\Btest"          # Matches "contest" but not "test"
```

### Quantifiers

```bash
# {n} matches exactly n times
rg "[0-9]{3}"        # Matches exactly 3 digits like "123"

# {n,} matches n or more times
rg "[a-z]{5,}"       # Matches words with 5 or more letters

# {n,m} matches between n and m times
rg "[0-9]{2,4}"      # Matches 2-4 digits like "42", "123", "1234"
```

### Groups and Alternation

```bash
# () creates a capturing group
rg "(error|warning): (.+)"    # Captures error/warning and message

# | means "or"
rg "error|warning"            # Matches either "error" or "warning"

# Non-capturing groups with (?:)
rg "(?:http|https)://\S+"     # Matches URLs
```

### Common Pattern Examples

```bash
# Email addresses
rg "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"

# IP addresses (simplified)
rg "\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"

# Hexadecimal colors
rg "#[0-9a-fA-F]{6}"

# Function calls (basic)
rg "\w+\([^)]*\)"

# URLs
rg "https?://[^\s]+"
```

## Case Sensitivity

By default, ripgrep performs case-sensitive searches.

### Case-Insensitive Search

Use `-i` or `--ignore-case` to search case-insensitively:

```bash
# Matches "TODO", "todo", "Todo", "ToDo", etc.
rg -i todo

# Case-insensitive search for error messages
rg -i "error: .+"
```

### Case-Sensitive Search

Use `-s` or `--case-sensitive` to force case-sensitive search (useful to override config files):

```bash
rg -s TODO
```

### Smart Case

Use `-S` or `--smart-case` for automatic case sensitivity:
- If pattern is all lowercase → case-insensitive search
- If pattern contains uppercase → case-sensitive search

```bash
# Case-insensitive (pattern is all lowercase)
rg -S todo          # Matches "TODO", "todo", "Todo"

# Case-sensitive (pattern contains uppercase)
rg -S TODO          # Matches only "TODO"

# Case-sensitive (pattern contains uppercase)
rg -S Error         # Matches "Error" but not "error"
```

**Smart case is very popular and is often set in configuration files.**

## Word and Line Boundary Matching

### Whole Word Matching

Use `-w` or `--word-regexp` to match whole words only:

```bash
# Without -w
rg "test"           # Matches "test", "testing", "contest", "latest"

# With -w
rg -w "test"        # Matches only "test"

# Practical example
rg -w "log"         # Matches "log" but not "logger", "login", "dialog"
```

This is equivalent to surrounding your pattern with `\b` word boundaries.

### Whole Line Matching

Use `-x` or `--line-regexp` to match entire lines only:

```bash
# Match lines that are exactly "TODO"
rg -x "TODO"

# Match lines containing only digits
rg -x "[0-9]+"

# Combined with other flags
rg -x -i "error"    # Match lines that are exactly "error" (any case)
```

## Output Format

### Default Output

By default, ripgrep shows:
- File path (in heading mode)
- Line number (when enabled with `-n`)
- Matching line with colored highlights

```bash
# Basic output
rg pattern

# Output with line numbers (very common)
rg -n pattern
```

**Example output:**
```
src/main.rs
42:    let pattern = "TODO";
107:    // TODO: implement error handling

tests/test.rs
23:    // TODO: add more test cases
```

### Line Numbers

```bash
# Show line numbers (very common, often in config)
rg -n pattern

# Suppress line numbers
rg -N pattern
```

### Column Numbers

```bash
# Show column numbers (byte offset within line)
rg --column pattern

# Combined with line numbers
rg -n --column pattern
```

**Example output:**
```
src/main.rs
42:15:    let pattern = "TODO";
```
(line 42, column 15)

### Heading vs Non-Heading Mode

**Heading mode** (default): Group matches by file with file path as heading:
```
src/main.rs
42:    let pattern = "TODO";
107:    // TODO: implement error handling

tests/test.rs
23:    // TODO: add more test cases
```

**Non-heading mode** (`--no-heading`): Show file path on each line:
```bash
rg --no-heading pattern
```

Output:
```
src/main.rs:42:    let pattern = "TODO";
src/main.rs:107:    // TODO: implement error handling
tests/test.rs:23:    // TODO: add more test cases
```

### Color Output

```bash
# Auto color (default): colors when outputting to terminal
rg --color auto pattern

# Always use colors (useful when piping to less -R)
rg --color always pattern | less -R

# Never use colors
rg --color never pattern
```

### Context Lines

Show lines before and after each match:

```bash
# Show 2 lines after each match
rg -A 2 pattern

# Show 2 lines before each match
rg -B 2 pattern

# Show 2 lines before and after (context)
rg -C 2 pattern

# Asymmetric context
rg -B 3 -A 1 pattern
```

**Example:**
```bash
rg -C 2 "TODO"
```

Output:
```
src/main.rs
40-    fn process_data() {
41-        // Initialize
42:        // TODO: implement error handling
43-        let data = vec![];
44-        process(&data);
```

(Lines with `:` are matches, lines with `-` are context)

## Count and List Modes

### Counting Matches

```bash
# Count matching lines per file
rg -c pattern

# Count individual matches (can be multiple per line)
rg --count-matches pattern
```

**Example output:**
```
src/main.rs:2
tests/test.rs:1
README.md:0
```

### Listing Files

```bash
# List files with matches
rg -l pattern

# List files without matches
rg --files-without-match pattern
```

**Practical use:**
```bash
# Find all Rust files containing "unsafe"
rg -l "unsafe" -t rust

# Find test files that don't test the API
rg --files-without-match "test_api" -g "*test*.rs"
```

## Inverted Matching

Use `-v` or `--invert-match` to show lines that do NOT match the pattern:

```bash
# Show all lines without "debug"
rg -v "debug"

# Show all non-empty lines
rg -v "^$"

# Find files without TODO comments
rg -l "TODO" | rg -v README
```

**Practical examples:**
```bash
# Filter out log lines with "DEBUG" level
rg "error" app.log | rg -v "DEBUG"

# Find Rust files without documentation comments
rg -v "^///" -t rust

# Show configuration without comments
rg -v "^#" config.conf
```

## Common Flags Cheat Sheet

| Flag | Short | Description |
|------|-------|-------------|
| `--fixed-strings` | `-F` | Literal string search (no regex) |
| `--ignore-case` | `-i` | Case-insensitive search |
| `--smart-case` | `-S` | Smart case sensitivity |
| `--word-regexp` | `-w` | Match whole words only |
| `--line-regexp` | `-x` | Match whole lines only |
| `--line-number` | `-n` | Show line numbers |
| `--count` | `-c` | Count matches per file |
| `--count-matches` | | Count individual matches |
| `--files-with-matches` | `-l` | List files with matches |
| `--files-without-match` | | List files without matches |
| `--invert-match` | `-v` | Show non-matching lines |
| `--after-context` | `-A` | Show N lines after match |
| `--before-context` | `-B` | Show N lines before match |
| `--context` | `-C` | Show N lines before and after |
| `--color` | | Control color output |
| `--column` | | Show column numbers |
| `--no-heading` | | Print file path on each line |

## Common Mistakes

### Forgetting to Escape Regex Metacharacters

**Problem:**
```bash
# This searches for regex pattern "file.txt", which matches "file_txt", "fileXtxt", etc.
rg "file.txt"
```

**Solution:**
```bash
# Use -F for literal search
rg -F "file.txt"

# Or escape the dot
rg "file\.txt"
```

### Case Sensitivity Confusion

**Problem:**
```bash
# Doesn't match "TODO", "Todo"
rg "todo"
```

**Solution:**
```bash
# Use -i or -S
rg -i "todo"
rg -S todo
```

### Matching Partial Words

**Problem:**
```bash
# Matches "test", "testing", "contest", "latest", etc.
rg "test"
```

**Solution:**
```bash
# Use -w for whole words
rg -w "test"
```

## Next Steps

Now that you understand the basics, you can explore more advanced topics:

- **[Recursive Search](./recursive-search.md)** - Control how ripgrep traverses directories
- **[Automatic Filtering](./automatic-filtering.md)** - Understand gitignore and automatic file filtering
- **[Manual Filtering](./manual-filtering-globs.md)** - Use globs and file types to filter searches
- **[Advanced Patterns](./advanced-patterns.md)** - Multiline search, PCRE2, and complex regex
- **[Replacements](./replacements.md)** - Find and replace with capture groups
- **[Output Formats](./output-formats.md)** - JSON output, custom formats, and more

## Practice Examples

Try these exercises to solidify your understanding:

1. **Basic Search:**
   ```bash
   # Find all TODO comments in your project
   rg "TODO"
   ```

2. **Case-Insensitive:**
   ```bash
   # Find all error messages (any case)
   rg -i "error"
   ```

3. **Literal Search:**
   ```bash
   # Find function calls to "log()"
   rg -F "log()"
   ```

4. **Word Boundaries:**
   ```bash
   # Find variable named "id" (not "valid", "identity", etc.)
   rg -w "id"
   ```

5. **Count Matches:**
   ```bash
   # Count how many times each file uses "import"
   rg -c "import"
   ```

6. **With Context:**
   ```bash
   # Find errors with surrounding context
   rg -C 3 "error"
   ```

7. **Regex Pattern:**
   ```bash
   # Find hexadecimal numbers
   rg "0x[0-9a-fA-F]+"
   ```

8. **Inverted Match:**
   ```bash
   # Find all non-empty lines
   rg -v "^$"
   ```
