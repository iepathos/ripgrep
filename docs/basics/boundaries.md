# Word and Line Boundaries

> Part of the [Basics](./index.md) page

## Whole Word Matching

Use `-w` or `--word-regexp` to match whole words only:

```bash
# Without -w
rg "test"           # Matches "test", "testing", "contest", "latest"

# With -w
rg -w "test"        # Matches only "test"

# Practical example
rg -w "log"         # Matches "log" but not "logger", "login", "dialog"
```

This is equivalent to surrounding your pattern with `\b` word boundaries.

## Whole Line Matching

Use `-x` or `--line-regexp` to match entire lines only:

```bash
# Match lines that are exactly "TODO"
rg -x "TODO"

# Match lines containing only digits
rg -x "[0-9]+"

# Combined with other flags
rg -x -i "error"    # Match lines that are exactly "error" (any case)
```

## Word Boundaries in Regex

```bash
# \b matches word boundary
rg "\btest\b"        # Matches "test" but not "testing" or "contest"

# \B matches non-word boundary
rg "\Btest"          # Matches "contest" but not "test"
```
