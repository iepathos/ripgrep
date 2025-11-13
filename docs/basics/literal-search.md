# Literal String Search

> Part of the [Basics](./index.md) page

By default, ripgrep interprets patterns as regular expressions. Sometimes you want to search for literal strings that contain regex metacharacters like `.`, `*`, `(`, `)`, etc.

## Fixed String Mode

Use `-F` or `--fixed-strings` to search for literal strings:

```bash
# Without -F, you'd need to escape the parentheses
rg "function\(\)"

# With -F, search for the exact string
rg -F "function()"

# Search for literal dots, asterisks, brackets, etc.
rg -F "192.168.1.1"
rg -F "file*.txt"
rg -F "[debug]"
```

!!! tip "Performance Benefit"
    Using `-F` enables SIMD acceleration and avoids regex compilation overhead, making literal searches significantly faster than equivalent escaped regex patterns. Ripgrep can use fast literal matching algorithms that are optimized for finding exact byte sequences.

### Literal vs Escaped Regex

When searching for strings with special characters, you have two options:

=== "Literal Search (-F)"
    ```bash
    # Source: tests/misc.rs:176
    rg -F "file*.txt"
    rg -F "192.168.1.1"
    rg -F "function()"
    ```
    **Advantages:** Simpler, faster, no escaping needed

=== "Escaped Regex"
    ```bash
    rg "file\*\.txt"
    rg "192\.168\.1\.1"
    rg "function\(\)"
    ```
    **Advantages:** Can combine with regex features if needed

!!! note "When to Use -F"
    - Searching for code snippets with special characters
    - Looking for URLs, IP addresses, or file paths
    - Maximum search performance when regex features aren't needed
    - Avoiding regex metacharacter interpretation issues

## Combining with Other Options

Literal search works with other ripgrep flags:

```bash
# Case-insensitive literal search
rg -F -i "TODO"

# Literal search with word boundaries
rg -F -w "log"

# Literal search in specific file types
rg -F "api_key" --type python
```
