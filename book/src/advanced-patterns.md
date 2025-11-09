# Advanced Patterns

This chapter covers advanced regex pattern features in ripgrep, including multiline search, PCRE2 engine support, lookaround assertions, backreferences, Unicode patterns, and performance considerations.

## Table of Contents

- [Multiline Search](#multiline-search)
- [PCRE2 Engine](#pcre2-engine)
- [Lookaround Assertions](#lookaround-assertions)
- [Backreferences](#backreferences)
- [Unicode Patterns](#unicode-patterns)
- [Engine Selection](#engine-selection)
- [Named Capture Groups](#named-capture-groups)
- [Inline Regex Flags](#inline-regex-flags)
- [Performance Considerations](#performance-considerations)
- [Limitations and Gotchas](#limitations-and-gotchas)
- [Practical Examples](#practical-examples)
- [Regex Limits](#regex-limits)

## Multiline Search

By default, ripgrep searches line-by-line, and patterns cannot match across line boundaries. The `-U` or `--multiline` flag enables multiline mode, allowing patterns to match text that spans multiple lines.

### Basic Usage

```bash
# Search for "foo" followed by "bar" on the next line
rg -U 'foo\nbar'

# Match patterns spanning multiple lines
rg -U 'struct.*\{.*field'
```

### How Multiline Mode Works

When multiline mode is enabled:

1. Ripgrep reads entire files into memory instead of processing line-by-line
2. The pattern can include `\n` to match newlines
3. The `.` metacharacter still does **not** match newlines by default (see [Multiline Dotall](#multiline-dotall-mode))
4. Use `\p{any}` to match any character including newlines

### Memory Implications

**Important**: Multiline mode requires reading entire files into memory, which has performance implications:

- Cannot use memory mapping for stdin
- Large files consume more memory
- Slower than line-by-line search for most cases

However, ripgrep automatically optimizes when possible. If your pattern contains `\n` but doesn't actually need to match across lines, the memory penalty is avoided.

### When to Use Multiline

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

## PCRE2 Engine

Ripgrep supports two regex engines:

1. **Default engine**: Fast Rust regex with finite automata
2. **PCRE2 engine**: Provides advanced features like lookaround and backreferences

### Enabling PCRE2

Use the `-P` or `--pcre2` flag to enable the PCRE2 engine:

```bash
# Use PCRE2 for lookahead
rg -P 'foo(?=bar)'

# Check if PCRE2 is available
rg --pcre2-version
```

### PCRE2 Availability

PCRE2 is an optional compile-time feature. Check availability with:

```bash
rg --pcre2-version
```

If PCRE2 is not compiled in, this command exits with an error.

### Default vs PCRE2 Features

| Feature | Default Engine | PCRE2 Engine |
|---------|---------------|--------------|
| Basic regex | ✓ | ✓ |
| Character classes | ✓ | ✓ |
| Quantifiers | ✓ | ✓ |
| Unicode support | ✓ | ✓ |
| Named captures | ✓ | ✓ |
| Lookahead/Lookbehind | ✗ | ✓ |
| Backreferences | ✗ | ✓ |
| Performance | Faster | Slower |
| Error messages | Better | Less helpful |

### When to Use PCRE2

Use PCRE2 when you need:

- Lookahead or lookbehind assertions
- Backreferences for matching repeated patterns
- Complex pattern features not in the default engine

For most searches, the default engine is faster and sufficient.

### PCRE2 Error Messages

**Warning**: PCRE2 provides less helpful error messages than the default engine. If you get cryptic errors, try your pattern with the default engine first to debug.

## Lookaround Assertions

Lookaround assertions match patterns based on surrounding context without including that context in the match. **Requires PCRE2** (`-P` flag).

### Types of Lookaround

1. **Positive Lookahead** `(?=...)`: Assert pattern ahead matches
2. **Negative Lookahead** `(?!...)`: Assert pattern ahead doesn't match
3. **Positive Lookbehind** `(?<=...)`: Assert pattern behind matches
4. **Negative Lookbehind** `(?<!...)`: Assert pattern behind doesn't match

### Lookahead Examples

```bash
# Find lines ending with 'o' before the last word
rg -P '.*o(?!.*\s)'

# Find "foo" only if followed by "bar"
rg -P 'foo(?=bar)'

# Find "foo" NOT followed by "bar"
rg -P 'foo(?!bar)'
```

### Lookbehind Examples

```bash
# Find "bar" preceded by "foo" on previous line (requires multiline)
rg -UP '(?<=foo\n)bar'

# Find digits preceded by "$"
rg -P '(?<=\$)\d+'

# Find words NOT preceded by "un"
rg -P '(?<!un)\w+able'
```

### Combining with --only-matching

Lookaround is powerful when combined with `-o`/`--only-matching` for precise extraction:

```bash
# Extract numbers preceded by "$"
rg -Po '(?<=\$)\d+\.?\d*'

# Extract words between quotes
rg -Po '(?<=").*?(?=")'
```

### Use Cases

Lookaround assertions are useful for:

- Filtering matches based on context
- Extracting specific parts without surrounding text
- Complex validation patterns
- Finding patterns with specific neighboring content

## Backreferences

Backreferences allow you to match previously captured groups. **Requires PCRE2** (`-P` flag).

### Numbered Backreferences

```bash
# Find repeated words (word followed by same word)
rg -P '(\w+)\s+\1'

# Find repeated patterns
rg -P '(\d{3})-\1'
```

The `\1` refers to the first capture group, `\2` to the second, etc.

### Named Backreferences

Use named captures with `(?P<name>...)` and reference with `\k<name>`:

```bash
# Find repeated words using named captures
rg -P '(?P<word>\w+)\s+\k<word>'
```

### Backreferences in Replacements

Backreferences are particularly useful with the `-r` flag for replacements:

```bash
# Swap two words
rg -P '(\w+)\s+(\w+)' -r '$2 $1'

# Transform patterns
rg -P '(\w+)@(\w+)\.com' -r 'User: $1, Domain: $2'
```

See the [Replacements chapter](./replacements.md) for more details.

### Performance Note

Backreferences prevent some regex optimizations, which can make searches slower. Use them only when necessary.

## Unicode Patterns

Ripgrep has excellent Unicode support enabled by default. All regex metacharacters are Unicode-aware.

### Unicode Character Classes

Use `\p{Property}` syntax to match Unicode character properties:

```bash
# Find emoji
rg '\p{Emoji}'

# Find Greek text
rg '\p{Greek}+'

# Find alphabetic characters (all scripts)
rg '\p{Alphabetic}+'

# Find uppercase letters (all scripts)
rg '\p{Uppercase}+'
```

### Common Unicode Properties

| Property | Matches |
|----------|---------|
| `\p{Emoji}` | Emoji characters |
| `\p{Greek}` | Greek script |
| `\p{Han}` | Chinese characters |
| `\p{Cyrillic}` | Cyrillic script |
| `\p{Alphabetic}` | Alphabetic characters |
| `\p{Uppercase}` | Uppercase letters |
| `\p{Lowercase}` | Lowercase letters |
| `\p{White_Space}` | Whitespace |
| `\p{any}` | Any character (including newlines) |

### Unicode-Aware Metacharacters

By default, these metacharacters are Unicode-aware:

- `\w`: Matches all Unicode word characters (not just ASCII)
- `\s`: Matches all Unicode whitespace
- `\d`: Matches Unicode decimal digits
- `\b`: Unicode word boundaries

```bash
# Match Unicode word characters (includes accented letters, etc.)
rg '\w+'

# Match Unicode whitespace
rg '\s+'
```

### Case-Insensitive Unicode

The `-i` flag performs Unicode case folding:

```bash
# Matches "café", "CAFÉ", "Café", etc.
rg -i 'café'

# Works across all scripts
rg -i 'Σ'  # Matches Σ and σ (Greek)
```

### Disabling Unicode

For ASCII-only searches with better performance, use `--no-unicode`:

```bash
# ASCII-only mode (faster for ASCII text)
rg --no-unicode '\w+'
```

**Note**: `--no-unicode` affects the entire search, not individual patterns.

## Engine Selection

The `--engine` flag allows you to explicitly choose which regex engine to use, or let ripgrep choose automatically.

### Engine Options

```bash
# Use default Rust regex engine (fastest)
rg --engine=default 'pattern'

# Use PCRE2 engine (advanced features)
rg --engine=pcre2 'pattern'

# Automatically choose based on pattern (recommended for complex patterns)
rg --engine=auto 'pattern'
```

### Auto Engine Selection

The `auto` option analyzes your pattern and chooses the appropriate engine:

- Uses **PCRE2** if pattern requires lookaround or backreferences
- Uses **default** engine otherwise for better performance

```bash
# Uses PCRE2 automatically (requires lookahead)
rg --engine=auto 'foo(?=bar)'

# Uses default engine automatically (no PCRE2 features)
rg --engine=auto 'foo.*bar'
```

### Tradeoffs

**Explicit engine choice** (`default` or `pcre2`):
- Predictable performance
- Clear error messages if features unavailable
- Recommended for scripts and automation

**Auto engine** (`auto`):
- Convenient for interactive use
- May have surprising performance changes with pattern modifications
- Good for complex ad-hoc queries

### Deprecated Flag

**Note**: `--auto-hybrid-regex` is deprecated. Use `--engine=auto` instead.

## Named Capture Groups

Named capture groups make complex patterns more readable and are essential for sophisticated replacements.

### Defining Named Captures

Both engines support named capture groups with `(?P<name>...)` syntax:

```bash
# Define named groups
rg '(?P<func>\w+)\((?P<args>.*)\)'
```

### Using Named Captures in Replacements

Reference named captures in replacements with `$name` or `${name}`:

```bash
# Extract function names
rg '(?P<func>\w+)\(' -r 'Function: $func'

# Restructure matches
rg '(?P<first>\w+), (?P<last>\w+)' -r '$last, $first'

# Use braces for disambiguation
rg '(?P<word>\w+)' -r '${word}s'  # Pluralize
```

### Named vs Numbered Captures

```bash
# Numbered captures ($1, $2, ...)
rg '(\w+)@(\w+)\.com' -r 'User: $1, Domain: $2'

# Named captures (more readable for complex patterns)
rg '(?P<user>\w+)@(?P<domain>\w+)\.com' -r 'User: $user, Domain: $domain'
```

Named captures are particularly valuable for:
- Complex patterns with many capture groups
- Making replacement expressions self-documenting
- Maintaining readability in large patterns

See the [Replacements chapter](./replacements.md) for more examples.

## Inline Regex Flags

Inline flags allow you to control regex behavior within the pattern itself.

### Common Inline Flags

| Flag | Effect |
|------|--------|
| `(?s)` | Dotall: `.` matches newlines |
| `(?i)` | Case-insensitive |
| `(?m)` | Multi-line: `^` and `$` match line boundaries |
| `(?x)` | Verbose: allow whitespace and comments |
| `(?-s)` | Disable dotall |
| `(?-i)` | Case-sensitive |

### Inline Flag Syntax

Two ways to use inline flags:

1. **For entire pattern**: `(?flags)pattern`
2. **For specific part**: `(?flags:pattern)`

```bash
# Dotall for entire pattern
rg -U '(?s)world.+detective'

# Dotall only for middle part
rg -U 'world(?s:.+)detective'

# Case-insensitive for specific part
rg 'foo(?i:bar|baz)qux'  # Matches "foobarqux", "fooBarqux", "fooBAZqux"
```

### Flag Precedence

Inline flags override command-line flags:

```bash
# -i flag overridden by (?-i) in pattern
rg -i 'foo(?-i:bar)'  # "foo" is case-insensitive, "bar" is case-sensitive
```

### Verbose Mode Example

The `(?x)` flag enables verbose mode with comments:

```bash
rg '(?x)
    \d{3}    # Area code
    -        # Separator
    \d{4}    # Number
'
```

**Note**: In shell, you'll need proper quoting for multiline patterns.

## Performance Considerations

Advanced regex features can impact performance. Understanding these implications helps you write efficient searches.

### Multiline Mode Performance

**Memory usage**:
- Multiline mode reads entire files into memory
- Cannot use memory mapping
- Large files can consume significant RAM

**Automatic optimization**:
- Ripgrep detects when patterns don't actually need multiline mode
- Avoids memory penalty when possible

**Recommendations**:
- Use multiline mode only when actually matching across lines
- Test on large files if memory is a concern
- Consider line-based alternatives when possible

### PCRE2 Engine Performance

**Generally slower** than default engine:
- Backtracking regex implementation vs finite automata
- More complex matching algorithm
- Less optimized for large-scale text search

**When PCRE2 is worth it**:
- Need lookaround or backreferences
- Pattern complexity requires PCRE2 features
- Search space is limited (specific files/directories)

**Recommendation**: Use default engine unless you need PCRE2-specific features.

### Backreferences and Lookaround

These features prevent some optimizations:
- Backreferences require backtracking
- Lookaround can be expensive for complex patterns
- May scan more text than simple patterns

**Use sparingly** for best performance.

### Performance Testing

Use `--stats` flag to see performance metrics:

```bash
rg --stats -U 'pattern'
```

This shows:
- Files searched
- Bytes searched
- Matches found
- Search time

### Performance Tips

1. **Prefer default engine** when possible
2. **Avoid multiline** unless necessary
3. **Test with `--stats`** on representative data
4. **Use specific file types** to limit search space (`-t`)
5. **Profile complex patterns** before using in production scripts

## Limitations and Gotchas

Common pitfalls and limitations when using advanced regex features.

### PCRE2 Silent Failures

**Critical gotcha**: PCRE2 may silently fail to match when using `\n` without `--multiline`:

```bash
# May not work as expected
rg -P 'foo\nbar'

# Correct: use both -P and -U
rg -PU 'foo\nbar'
```

The default engine gives better error messages for this case.

### Dotall Confusion

**Remember**: `.` does **not** match newlines by default, even in multiline mode:

```bash
# FAILS - . doesn't match \n
rg -U 'foo.+bar'

# SUCCEEDS - need --multiline-dotall
rg -U --multiline-dotall 'foo.+bar'

# ALTERNATIVE - use (?s) inline flag
rg -U '(?s)foo.+bar'

# ALTERNATIVE - use \p{any}
rg -U 'foo\p{any}+bar'
```

### Forgetting -P Flag

Lookaround and backreferences **require** `-P` flag:

```bash
# ERROR - lookahead requires PCRE2
rg 'foo(?=bar)'

# CORRECT
rg -P 'foo(?=bar)'
```

### Unicode Scope

`--no-unicode` affects **all** patterns globally, not individual patterns:

```bash
# Both patterns are ASCII-only
rg --no-unicode -e 'pattern1' -e 'pattern2'
```

You cannot mix Unicode and ASCII-only patterns in a single search.

### Regex Size Limits

Extremely complex patterns may hit size limits:

```bash
# Error: "compiled regex exceeds size limit"
# Solution: use --regex-size-limit
rg --regex-size-limit 100M 'extremely_complex_pattern'
```

See [Regex Limits](#regex-limits) section below.

### Engine-Specific Behavior

Some patterns behave differently between engines:

- Test PCRE2 patterns with `-P` before relying on them
- Default engine has stricter pattern requirements
- Error messages differ between engines

## Practical Examples

Real-world examples demonstrating advanced pattern techniques.

### Multi-line Log Parsing

Find ERROR entries with their stack traces:

```bash
# Find ERROR with following context lines
rg -U 'ERROR.*\n.*stack trace'

# Find ERROR with complete stack trace (multiple lines)
rg -U --multiline-dotall 'ERROR.*?at .*?\)'
```

### Function Usage Analysis

Find function definitions that use specific features:

```bash
# Find functions using a specific API (requires PCRE2 + multiline)
rg -UP '(?s)fn (\w+).*?\{(?=.*use_api).*?\}'

# Find functions with TODO comments
rg -UP '(?s)fn (\w+).*?\{(?=.*TODO).*?\}'
```

### Extracting Specific Content

Use lookaround with `--only-matching` for precise extraction:

```bash
# Extract dollar amounts
rg -Po '(?<=\$)\d+\.?\d*'

# Extract email usernames (without domain)
rg -Po '\w+(?=@\w+\.com)'

# Extract content between quotes
rg -Po '(?<=").*?(?=")'

# Extract XML/HTML tag content
rg -Po '(?<=<title>).*?(?=</title>)'
```

### Finding Repeated Patterns

Use backreferences to find duplications:

```bash
# Find repeated words
rg -P '\b(\w+)\s+\1\b'

# Find repeated numbers
rg -P '(\d{3})-\1'

# Find repeated lines (requires multiline)
rg -UP '^(.+)$\n\1$'
```

### Unicode Script Searches

Search for specific writing systems:

```bash
# Find Chinese text
rg '\p{Han}+'

# Find mixed script text (Latin + Cyrillic)
rg '\p{Latin}.*\p{Cyrillic}'

# Find emoji
rg '\p{Emoji}'

# Find right-to-left script (Arabic, Hebrew)
rg '\p{Arabic}|\p{Hebrew}'
```

### Complex Replacements

Use named captures for readable transformations:

```bash
# Transform dates from YYYY-MM-DD to MM/DD/YYYY
rg '(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})' -r '$month/$day/$year'

# Extract and restructure email addresses
rg '(?P<user>\w+)@(?P<domain>\w+)\.com' -r 'User: $user, Domain: $domain'

# Format log entries
rg '(?P<time>\d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<msg>.+)' \
   -r '[$level] $time - $msg'
```

### Combining Multiline and PCRE2

Powerful queries combining multiple features:

```bash
# Find struct definitions with specific fields (multiline + lookahead)
rg -UP '(?s)struct (\w+).*?\{(?=.*field_name).*?\}'

# Find functions calling deprecated APIs with context
rg -UP '(?s)fn (\w+).*?\{(?=.*deprecated_api).*?\}' -A 2 -B 2

# Match code blocks with specific patterns
rg -UP '(?s)fn test_\w+.*?\{(?=.*assert).*?\}'
```

## Regex Limits

Ripgrep has configurable limits to prevent excessive memory use and compilation time.

### PCRE2 Version Check

Before using PCRE2 features, check availability:

```bash
# Show PCRE2 version and JIT status
rg --pcre2-version

# Output example:
# PCRE2 10.42 (JIT: enabled)
```

If PCRE2 is not compiled in, this command exits with an error.

### Regex Size Limit

Controls the maximum size of compiled regex:

```bash
# Default limit is usually sufficient
# Increase for extremely complex patterns
rg --regex-size-limit 100M 'very_complex_pattern'
```

**When you might need this**:
- Very large alternations (`pattern1|pattern2|...|pattern1000`)
- Extremely complex nested patterns
- Auto-generated regexes

**Error message**:
```
error: compiled regex exceeds size limit
```

### DFA Size Limit

Controls DFA (deterministic finite automaton) size for the default engine:

```bash
# Increase DFA size limit
rg --dfa-size-limit 100M 'pattern'
```

**When you might need this**:
- Complex patterns with many possible states
- Large character class combinations

### Automatic Limit Suggestions

When you hit a limit, ripgrep's error message suggests the appropriate flag to increase it:

```
error: regex compiled too large
help: use --regex-size-limit to increase the limit
```

## Decision Tree: Choosing the Right Features

Use this guide to select appropriate flags for your search:

```
Do you need to match across line boundaries?
├─ Yes → Use -U (--multiline)
│   └─ Does . need to match newlines?
│       ├─ Yes → Add --multiline-dotall or use (?s)
│       └─ No → Just -U is sufficient
└─ No → Default line-by-line search

Do you need lookaround or backreferences?
├─ Yes → Use -P (--pcre2)
│   └─ Matching across lines?
│       └─ Yes → Use -PU together
└─ No → Default engine is faster

Do you need Unicode character classes?
├─ Yes → Default behavior (Unicode enabled)
└─ No → Use --no-unicode for ASCII-only (faster)

Complex pattern with multiple features?
└─ Consider --engine=auto for automatic selection
```

## Summary

Advanced regex features in ripgrep provide powerful search capabilities:

- **Multiline mode** (`-U`) for patterns spanning lines
- **PCRE2 engine** (`-P`) for lookaround and backreferences
- **Unicode support** for international text with `\p{Property}`
- **Named captures** for readable complex patterns
- **Inline flags** for fine-grained control

**Key principles**:
1. Use default engine unless you need PCRE2 features
2. Avoid multiline mode for performance unless necessary
3. Test complex patterns with `--stats` to understand performance
4. Combine features thoughtfully for powerful queries
5. Remember gotchas (. doesn't match \n by default, PCRE2 needs -P)

For most searches, simple patterns with the default engine are sufficient. Use advanced features when the problem requires them, understanding the performance tradeoffs.

**Related chapters**:
- [Basic Usage](./basics.md) - Fundamental regex patterns
- [Replacements](./replacements.md) - Using captures in replacements
- [File Encoding](./file-encoding.md) - Handling different encodings
