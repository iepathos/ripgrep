# Literal String Search

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

!!! note "Configuration Override"
    If you've set `--fixed-strings` as a default in your [configuration file](../configuration-file.md), you can explicitly disable it for a specific search using `--no-fixed-strings` to restore regex pattern matching.

    ```bash
    # Disable fixed-strings mode for this search
    rg --no-fixed-strings "file.*\.txt"
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

Literal search works with other ripgrep flags. These flags are independent and can be combined freely:

```bash
# Case-insensitive literal search
rg -F -i "TODO"                    # (1)!

# Literal search with word boundaries
rg -F -w "log"                     # (2)!

# Literal search in specific file types
rg -F "api_key" --type python      # (3)!
```

1. Combines literal search with [case-insensitive](case-sensitivity.md) matching
2. Matches "log" as a complete word, not as part of "login" or "catalog"
3. Restricts search to Python files while treating pattern as literal string

!!! tip "Flag Independence"
    The `-F` flag works independently with other search modifiers. Each flag controls a separate aspect of the search behavior, so they can be combined in any way that makes sense for your use case.

!!! example "Common Use Cases"
    Literal search is ideal for:

    - **Log analysis:** `rg -F "[ERROR]" logs/`
    - **Configuration values:** `rg -F "database.url" --type yaml`
    - **Code patterns:** `rg -F "TODO(username)" --type rust`
    - **IP addresses:** `rg -F "192.168.1.1" access.log`

!!! warning "Limitations"
    When using `-F`, you cannot use regex features like:

    - Wildcards (`.*`, `.+`)
    - Character classes (`[a-z]`, `\d`)
    - Anchors (`^`, `$`)
    - Alternation (`foo|bar`)

    If you need regex features, use escaped patterns instead of `-F`.

## Related Topics

- [Regex Basics](regex-basics.md) - Learn about regular expression patterns when you need more than literal matching
- [Case Sensitivity](case-sensitivity.md) - Control case-sensitive and case-insensitive matching
- [Pattern Matching](pattern-matching.md) - Overview of different pattern matching modes
- [Performance](../troubleshooting/performance.md) - Tips for optimizing search performance
- [Configuration File](../configuration-file.md) - Set default flags including `--fixed-strings`
