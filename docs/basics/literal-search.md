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

**When to use `-F`:**
- Searching for code snippets with special characters
- Looking for URLs, IP addresses, or file paths
- Better performance when you don't need regex features
- Avoiding regex metacharacter interpretation issues
