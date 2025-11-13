# Backreferences

> Part of the [Advanced Patterns](./index.md) page

Backreferences allow you to match previously captured groups. **Requires PCRE2** (`-P` flag).

## Numbered Backreferences

```bash
# Find repeated words (word followed by same word)
rg -P '(\w+)\s+\1'

# Find repeated patterns
rg -P '(\d{3})-\1'
```

The `\1` refers to the first capture group, `\2` to the second, etc.

## Named Backreferences

Use named captures with `(?P<name>...)` and reference with `\k<name>`:

```bash
# Find repeated words using named captures
rg -P '(?P<word>\w+)\s+\k<word>'
```

## Backreferences in Replacements

Backreferences are particularly useful with the `-r` flag for replacements:

```bash
# Swap two words
rg -P '(\w+)\s+(\w+)' -r '$2 $1'

# Transform patterns
rg -P '(\w+)@(\w+)\.com' -r 'User: $1, Domain: $2'
```

See the [Replacements chapter](../replacements.md) for more details.

## Performance Note

Backreferences prevent some regex optimizations, which can make searches slower. Use them only when necessary.

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

See the [Replacements chapter](../replacements.md) for more examples.
