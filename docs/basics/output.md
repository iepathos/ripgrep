# Output Format

> Part of the [Basics](./index.md) page

## Default Output

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

## Line Numbers

```bash
# Show line numbers (very common, often in config)
rg -n pattern

# Suppress line numbers
rg -N pattern
```

## Column Numbers

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

## Heading vs Non-Heading Mode

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

## Color Output

```bash
# Auto color (default): colors when outputting to terminal
rg --color auto pattern

# Always use colors (useful when piping to less -R)
rg --color always pattern | less -R

# Never use colors
rg --color never pattern
```

## Context Lines

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
