# Count and List Modes

> Part of the [Basics](./index.md) page

## Counting Matches

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

## Listing Files

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
