# Inline Regex Flags

> Part of the [Advanced Patterns](./index.md) page

Inline flags allow you to control regex behavior within the pattern itself.

## Common Inline Flags

| Flag | Effect |
|------|--------|
| `(?s)` | Dotall: `.` matches newlines |
| `(?i)` | Case-insensitive |
| `(?m)` | Multi-line: `^` and `$` match line boundaries |
| `(?x)` | Verbose: allow whitespace and comments |
| `(?-s)` | Disable dotall |
| `(?-i)` | Case-sensitive |

## Inline Flag Syntax

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

## Flag Precedence

Inline flags override command-line flags:

```bash
# -i flag overridden by (?-i) in pattern
rg -i 'foo(?-i:bar)'  # "foo" is case-insensitive, "bar" is case-sensitive
```

## Verbose Mode Example

The `(?x)` flag enables verbose mode with comments:

```bash
rg '(?x)
    \d{3}    # Area code
    -        # Separator
    \d{4}    # Number
'
```

**Note**: In shell, you'll need proper quoting for multiline patterns.
