# Lookaround Assertions

> Part of the [Advanced Patterns](./index.md) page

Lookaround assertions match patterns based on surrounding context without including that context in the match. **Requires PCRE2** (`-P` flag).

## Types of Lookaround

1. **Positive Lookahead** `(?=...)`: Assert pattern ahead matches
2. **Negative Lookahead** `(?!...)`: Assert pattern ahead doesn't match
3. **Positive Lookbehind** `(?<=...)`: Assert pattern behind matches
4. **Negative Lookbehind** `(?<!...)`: Assert pattern behind doesn't match

## Lookahead Examples

```bash
# Find lines ending with 'o' before the last word
rg -P '.*o(?!.*\s)'

# Find "foo" only if followed by "bar"
rg -P 'foo(?=bar)'

# Find "foo" NOT followed by "bar"
rg -P 'foo(?!bar)'
```

## Lookbehind Examples

```bash
# Find "bar" preceded by "foo" on previous line (requires multiline)
rg -UP '(?<=foo\n)bar'

# Find digits preceded by "$"
rg -P '(?<=\$)\d+'

# Find words NOT preceded by "un"
rg -P '(?<!un)\w+able'
```

## Combining with --only-matching

Lookaround is powerful when combined with `-o`/`--only-matching` for precise extraction:

```bash
# Extract numbers preceded by "$"
rg -Po '(?<=\$)\d+\.?\d*'

# Extract words between quotes
rg -Po '(?<=").*?(?=")'
```

## Use Cases

Lookaround assertions are useful for:

- Filtering matches based on context
- Extracting specific parts without surrounding text
- Complex validation patterns
- Finding patterns with specific neighboring content
