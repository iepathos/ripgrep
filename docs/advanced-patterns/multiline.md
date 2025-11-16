# Multiline Search

By default, ripgrep searches line-by-line, and patterns cannot match across line boundaries. The `-U` or `--multiline` flag enables multiline mode, allowing patterns to match text that spans multiple lines.

## Basic Usage

```bash
# Search for "foo" followed by "bar" on the next line
rg -U 'foo\nbar'

# Match patterns spanning multiple lines
rg -U 'struct.*\{.*field'
```

## How Multiline Mode Works

When multiline mode is enabled:

1. Ripgrep reads entire files into memory instead of processing line-by-line
2. The pattern can include `\n` to match newlines
3. The `.` metacharacter still does **not** match newlines by default (see [Multiline Dotall Mode](#multiline-dotall-mode))
4. Use `\p{any}` to match any character including newlines

## Memory Implications

**Important**: Multiline mode requires reading entire files into memory, which has performance implications:

- Cannot use memory mapping for stdin
- Large files consume more memory
- Slower than line-by-line search for most cases

However, ripgrep automatically optimizes when possible. If your pattern contains `\n` but doesn't actually need to match across lines, the memory penalty is avoided.

## When to Use Multiline

Use multiline mode when:

- Searching for patterns that span lines (e.g., multi-line log entries)
- Matching code blocks with specific structure
- Finding XML/JSON elements spanning multiple lines

**Example**: Finding multi-line function definitions

```bash
rg -U 'fn \w+\(.*\).*\{.*\}'
```

## Multiline Dotall Mode

Even in multiline mode, the `.` metacharacter does **not** match newlines by default. To make `.` match newlines, use the `--multiline-dotall` flag.

### Using Multiline Dotall

```bash
# This FAILS - . doesn't match \n
rg -U 'world.+detective'

# This SUCCEEDS - . now matches \n
rg -U --multiline-dotall 'world.+detective'
```

### Alternative: Inline Syntax

You can enable dotall mode inline using the `(?s)` flag:

```bash
# Enable dotall for the entire pattern
rg -U '(?s)world.+detective'

# Enable dotall for specific part only
rg -U 'world(?s:.+)detective'
```

### Using \p{any}

The `\p{any}` Unicode character class always matches any character including newlines, regardless of dotall mode:

```bash
# This always works, with or without --multiline-dotall
rg -U 'world\p{any}+detective'
```
