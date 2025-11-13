# Replacements

Ripgrep can replace matched text in its output using the `-r/--replace` flag. This is useful for reformatting search results, extracting parts of matches, or transforming text patterns.

!!! warning "File Safety"
    Replacements only affect ripgrep's output and **never modify your files**. Your source files remain completely unchanged.

!!! tip "Quick Reference"
    ```bash
    # Basic replacement
    rg PATTERN -r REPLACEMENT

    # Numbered capture groups
    rg '(\w+) (\w+)' -r '$2 $1'

    # Named capture groups
    rg '(?P<name>\w+)' -r 'Hello $name'

    # Always use single quotes!
    rg '(\w+)' -r '$1'  # ✓ Correct
    rg '(\w+)' -r "$1"  # ✗ Wrong
    ```

## The Replace Flag

The basic syntax is:

```bash title="Basic replacement syntax"
rg PATTERN -r REPLACEMENT
```

The `-r` flag (or `--replace`) tells ripgrep to replace each match with the specified replacement text in the output. For example:

```bash
# Replace "foo" with "bar" in output
rg foo -r bar

# Search for "error" but display "ERROR" in results
rg error -r ERROR
```

Remember: this modifies what ripgrep prints, not the files themselves. Your files remain unchanged.

## Capture Groups

The real power of replacements comes from capture groups, which let you reference parts of the matched text in your replacement string.

### Numbered Capture Groups

Capture groups in your regex pattern are numbered based on the position of their opening parenthesis, starting from 1. The special group `$0` represents the entire match.

```bash
# Swap two words
rg '(\w+) (\w+)' -r '$2 $1'

# Extract area code from phone numbers
rg '(\d{3})-(\d{3})-(\d{4})' -r 'Area code: $1'
```

In the first example:
- `(\w+)` is capture group `$1` (first word)
- `(\w+)` is capture group `$2` (second word)
- The replacement `'$2 $1'` swaps them

### Named Capture Groups

You can also use named capture groups for more readable patterns. The syntax is `(?P<name>pattern)` in Rust regex. The alternative syntax `(?<name>pattern)` is also supported in both Rust regex and PCRE2 mode.

```bash
# Using named groups for clarity
rg '(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})' -r 'Year: ${year}, Month: ${month}'

# Extract protocol and domain from URLs
rg '(?P<protocol>https?)://(?P<domain>[^/]+)' -r '$protocol at $domain'
```

Named groups make complex patterns more maintainable and self-documenting.

### Capture Group Syntax Rules

!!! info "Understanding Capture Group References"
    Understanding how ripgrep parses capture group references is important:

    - **Valid characters**: Group names consist of letters, numbers, and underscores only (`[_0-9A-Za-z]`)
    - **Longest match**: Ripgrep takes the longest matching name after `$`
      - `$1a` refers to a group named "1a", not group 1 followed by "a"
      - Use braces to separate: `${1}a` means group 1 followed by "a"
    - **Brace syntax**: Use `${name}` or `${1}` to disambiguate from following text
    - **Invalid references**: If a group doesn't exist, it's replaced with an empty string
    - **Literal dollar sign**: Use `$$` to write a literal `$`

Examples:

```bash
# Without braces - "1a" is interpreted as a group name
rg '(\w+)' -r '$1a'        # Looks for group named "1a"

# With braces - separate group reference from text
rg '(\w+)' -r '${1}a'      # Group 1 followed by "a"

# Literal dollar sign
rg 'price' -r '$$5.00'     # Outputs "$5.00"
```

## Shell Quoting

!!! danger "Critical: Always Use Single Quotes"
    In shells like Bash and zsh, **always use single quotes** for the replacement string to prevent shell variable expansion.

    ```bash
    # Wrong - shell expands $1 (usually to empty string)
    rg '(\w+)' -r "$1"

    # Correct - single quotes prevent shell expansion
    rg '(\w+)' -r '$1'
    ```

    Without proper quoting, `$1` gets replaced by a shell variable (which is likely undefined and empty) before ripgrep even sees it.

## Output Modification Behavior

By default, replacements work on each individual match, not entire lines:

```bash
# Replaces only the matched pattern, not the whole line
rg 'foo' -r 'bar'
# Line: "foo and foo" becomes "bar and bar"
```

To replace entire lines, match the entire line:

```bash
# Match and replace entire line
rg '.*error.*' -r 'REDACTED'
```

### Using with Other Flags

Replacements work well with other ripgrep flags:

**With `--only-matching` (-o)**: Extract and transform parts of matches

```bash
# Extract and reformat email addresses
rg '(\w+)@(\w+\.com)' -o -r '$1 at $2'
# Input:  "Contact: john@example.com"
# Output: "john at example.com"
```

**With context flags** (`-A`, `-B`, `-C`): Replacements only apply to matched lines, not context lines

```bash
# Replace matches but keep context unchanged
rg 'error' -r 'ERROR' -C1
# If input is:
#   info message
#   error occurred
#   debug info
# Output shows:
#   info message          (context - unchanged)
#   ERROR occurred        (match - replaced)
#   debug info            (context - unchanged)
```

**With `--json`**: The JSON output includes a `submatches` array with replacement text in the `match` field

```bash
# Example JSON output with replacements
rg 'error' -r 'ERROR' --json
# Produces output like:
# {
#   "type": "match",
#   "data": {
#     "submatches": [
#       {
#         "match": {"text": "ERROR"},
#         "start": 10,
#         "end": 15
#       }
#     ]
#   }
# }
```

## Practical Examples

### Simple Literal Replacement

```bash
# Replace all instances of old API endpoint
rg 'api.old.com' -r 'api.new.com'
```

### Swapping Words

```bash
# Reverse first and last names
rg '([A-Z][a-z]+) ([A-Z][a-z]+)' -r '$2, $1'
# "John Watson" becomes "Watson, John"
```

### Extracting Data

```bash
# Extract just the path from log entries
rg 'GET (/[^\s]+)' -r '$1' -o
# Input:  "GET /api/users HTTP/1.1"
# Output: "/api/users"
```

### Reformatting Dates

```bash
# Convert YYYY-MM-DD to Month DD, YYYY
rg '(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})' \
   -r '${month}/${day}/${year}'
```

### Multiple Matches Per Line

```bash
# Replace all occurrences of a pattern in each line
rg 'TODO' -r 'DONE'
# "TODO: Fix TODO items" becomes "DONE: Fix DONE items"
```

### Removing Matches

Use an empty replacement string to remove matches from output:

```bash
# Remove all email addresses from output
rg '\S+@\S+' -r ''
```

## Edge Cases and Special Behaviors

### Invalid Capture Groups

References to non-existent groups are replaced with empty strings:

```bash
# Pattern has only 1 group, but replacement uses $2
rg '(\w+)' -r '$1 and $2'
# $2 is replaced with empty string
```

### Empty Replacements

An empty replacement string removes matches:

```bash
rg 'pattern' -r ''
```

### Multiline Mode

Replacements work with multiline mode (`-U`):

```bash
# Match and replace across lines
rg -U 'foo\nbar' -r 'baz'
```

### Maximum Column Limits

When using `--max-columns`, replacements are applied before the column limit check:

```bash
# Replacement happens first, then column limit applies
rg 'short' -r 'very_long_replacement' --max-columns 50
```

## Comparison: Numbered vs Named Groups

| Feature | Numbered (`$1, $2`) | Named (`$name`) |
|---------|-------------------|----------------|
| Syntax | `(\w+)` → `$1` | `(?P<name>\w+)` → `$name` |
| Readability | Requires counting | Self-documenting |
| Maintenance | Fragile if pattern changes | More robust |
| Best for | Simple patterns | Complex patterns |

Example showing both:

=== "Numbered Groups"

    ```bash
    # Numbered groups - simple but requires counting
    rg '(\d{4})-(\d{2})-(\d{2})' -r '$1/$2/$3'
    ```

    Good for simple patterns with few groups.

=== "Named Groups"

    ```bash
    # Named groups - clearer intent
    rg '(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})' \
       -r '$year/$month/$day'
    ```

    Better for complex patterns where clarity matters.

## Common Mistakes and Troubleshooting

### Forgot Shell Quoting

```bash
# Problem: Shell expands $1 before ripgrep sees it
rg '(\w+)' -r "$1"

# Solution: Use single quotes
rg '(\w+)' -r '$1'
```

### Wrong Group Numbers with Nested Groups

```bash
# Groups are numbered by opening parenthesis position
rg '((\w+) (\w+))' -r '$1 / $2 / $3'
# $1 = entire match (both words)
# $2 = first word
# $3 = second word
```

### Name Parsing Issues

```bash
# Ambiguous: is this group "1a" or group 1 + "a"?
rg '(\w+)' -r '$1a'      # Looks for group named "1a"

# Unambiguous with braces
rg '(\w+)' -r '${1}a'    # Group 1 followed by "a"
```

## Real-World Use Cases

**Reformatting log entries:**
```bash
# Convert Apache logs to simplified format
rg '(\S+) - - \[([^\]]+)\] "GET (\S+)"' \
   -r 'IP: $1 | Time: $2 | Path: $3'
```

**Extracting structured data:**
```bash
# Pull out just the error codes
rg 'error_code=(\d+)' -r '$1' -o
```

**Sanitizing output:**
```bash
# Redact sensitive data
rg 'password=\S+' -r 'password=***REDACTED***'
```

**Data transformation pipelines:**
```bash
# Chain with other tools for complex transforms
rg '(\w+),(\w+)' -r '$2 $1' -o | sort | uniq
```

## Performance Considerations

!!! note "Performance Impact"
    Replacements require extracting capture groups, which adds some overhead compared to simple matching. However, this overhead is generally negligible for most use cases. Ripgrep's implementation amortizes allocations across matches for efficiency.

    For performance-critical scenarios, consider:

    - Using simpler patterns when possible
    - Avoiding unnecessary capture groups
    - Using `--only-matching` to reduce output volume

## Reference: Replacement Syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `$0` | Entire match | `rg 'foo' -r '$0$0'` → "foofoo" |
| `$1`, `$2`, ... | Numbered groups | `rg '(\w+)' -r '$1'` |
| `$name` | Named group | `rg '(?P<x>\w+)' -r '$x'` |
| `${1}`, `${name}` | Braced reference | `rg '(\w+)' -r '${1}!'` |
| `$$` | Literal `$` | `rg 'price' -r '$$5'` → "$5" |

## See Also

- [Output Formats](./output-formats.md) - For other output formatting options
- [Introduction](./introduction.md) - For getting started with ripgrep
- [Recursive Search](./recursive-search.md) - For file traversal and pattern matching
