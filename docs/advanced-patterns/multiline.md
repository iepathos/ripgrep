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

!!! warning "Performance Impact"
    Multiline mode requires reading entire files into memory, which has significant performance implications:

    - Cannot use memory mapping for stdin
    - Large files consume more memory
    - Slower than line-by-line search for most cases

### Automatic Optimization

Ripgrep intelligently analyzes your pattern to avoid the memory penalty when possible. If your pattern contains `\n` but doesn't actually need to match across lines, ripgrep can still use its efficient line-by-line processing.

**Patterns that avoid the memory penalty:**

```bash
# Source: crates/core/flags/defs.rs:4177-4181
# Pattern has \n but doesn't match across line boundaries
rg -U 'foo\nbar'  # Each match is on separate lines
```

**Patterns that require full memory loading:**

```bash
# Pattern needs to span lines using . or \p{any}
rg -U --multiline-dotall 'foo.*bar'  # May match across multiple lines
rg -U 'foo\p{any}+bar'  # Explicitly matches any character including newlines
```

!!! tip "Performance Best Practice"
    When possible, avoid multiline mode entirely. If you can express your search using line-by-line patterns, you'll get much better performance.

## When to Use Multiline

Use multiline mode when:

- Searching for patterns that span lines (e.g., multi-line log entries)
- Matching code blocks with specific structure
- Finding XML/JSON elements spanning multiple lines

## Common Use Cases

### Multi-line Log Entry Matching

Find log entries that span multiple lines, such as stack traces or error blocks:

```bash
# Find ERROR entries that include the next line (often a stack trace)
rg -U 'ERROR:.*\n.*at .*'

# Find multi-line JSON log entries
rg -U '\{[^}]*\n[^}]*"level":\s*"error"'
```

### Code Block Searching

!!! example "Finding Function Definitions"
    Search for multi-line function signatures and bodies:

    ```bash
    # Source: tests/multiline.rs:6-10
    # Find functions with specific patterns across lines
    rg -U 'fn \w+\(.*\).*\{.*\}'

    # Find struct definitions with specific fields
    rg -U 'struct.*\{.*\n.*field.*\n.*\}'
    ```

### XML/JSON Element Matching

Match structured data that spans multiple lines:

```bash
# Find XML elements with specific attributes
rg -U '<user.*\n.*role="admin"'

# Find JSON objects with nested properties
rg -U '\{.*\n.*"status":\s*"active".*\n.*"role"'
```

### Multi-line Text Patterns

!!! example "Matching Across Line Boundaries"
    ```bash
    # Source: tests/multiline.rs:21-25, 28-43
    # Find phrases that span lines (requires --multiline-dotall or \p{any})
    rg -U 'of this world\p{any}+?detective work'

    # Alternative using dotall mode
    rg -U --multiline-dotall 'of this world.+?detective work'
    ```

## Multiline Dotall Mode

Even in multiline mode, the `.` metacharacter does **not** match newlines by default. To make `.` match newlines, use the `--multiline-dotall` flag.

### Using Multiline Dotall

!!! note "Default Behavior"
    In multiline mode, `.` still does **not** match newlines unless you explicitly enable dotall mode.

```bash
# Source: tests/multiline.rs:21-25
# This FAILS - . doesn't match \n
rg -U 'world.+detective'

# Source: tests/multiline.rs:28-43
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

!!! tip "Portable Alternative to Dotall"
    Using `\p{any}` is more explicit and doesn't require the `--multiline-dotall` flag:

    ```bash
    # Source: tests/multiline.rs:46-64
    # This always works, with or without --multiline-dotall
    rg -U 'world\p{any}+detective'

    # Commonly used with non-greedy matching
    rg -U 'Watson|Sherlock\p{any}+?Holmes'
    ```

## See Also

- [PCRE2](pcre2.md) - Advanced regex features and syntax
- [Unicode](unicode.md) - Unicode character classes like `\p{any}`
- [Performance](performance.md) - Understanding ripgrep's performance characteristics
- [Inline Flags](inline-flags.md) - Using flags like `(?s)` within patterns
