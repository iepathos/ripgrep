# Practical Examples

> Part of the [Advanced Patterns](./index.md) page

Real-world examples demonstrating advanced pattern techniques.

## Multi-line Log Parsing

Find ERROR entries with their stack traces:

```bash
# Find ERROR with following context lines
rg -U 'ERROR.*\n.*stack trace'

# Find ERROR with complete stack trace (multiple lines)
rg -U --multiline-dotall 'ERROR.*?at .*?\)'
```

## Function Usage Analysis

Find function definitions that use specific features:

```bash
# Find functions using a specific API (requires PCRE2 + multiline)
rg -UP '(?s)fn (\w+).*?\{(?=.*use_api).*?\}'

# Find functions with TODO comments
rg -UP '(?s)fn (\w+).*?\{(?=.*TODO).*?\}'
```

## Extracting Specific Content

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

## Finding Repeated Patterns

Use backreferences to find duplications:

```bash
# Find repeated words
rg -P '\b(\w+)\s+\1\b'

# Find repeated numbers
rg -P '(\d{3})-\1'

# Find repeated lines (requires multiline)
rg -UP '^(.+)$\n\1$'
```

## Unicode Script Searches

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

## Complex Replacements

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

## Combining Multiline and PCRE2

Powerful queries combining multiple features:

```bash
# Find struct definitions with specific fields (multiline + lookahead)
rg -UP '(?s)struct (\w+).*?\{(?=.*field_name).*?\}'

# Find functions calling deprecated APIs with context
rg -UP '(?s)fn (\w+).*?\{(?=.*deprecated_api).*?\}' -A 2 -B 2

# Match code blocks with specific patterns
rg -UP '(?s)fn test_\w+.*?\{(?=.*assert).*?\}'
```

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

See [Performance Considerations](./performance.md) section for more details.

### Engine-Specific Behavior

Some patterns behave differently between engines:

- Test PCRE2 patterns with `-P` before relying on them
- Default engine has stricter pattern requirements
- Error messages differ between engines
