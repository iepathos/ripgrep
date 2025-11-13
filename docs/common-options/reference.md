# Quick Reference

> Part of the [Common Options](./index.md) page

## Quick Reference

Here are the most essential flags for daily use:

!!! tip "Pro Tip"
    Use `-S` (smart case) for flexible searching - it's case-insensitive unless you include uppercase letters. Combine with `-w` for precise whole-word matches.

| Flag | Purpose | Example |
|------|---------|---------|
| `-i` | Case-insensitive search | `rg -i error` |
| `-S` | Smart case (insensitive unless uppercase) | `rg -S Error` |
| `-w` | Match whole words only | `rg -w test` |
| `-F` | Literal string (not regex) | `rg -F '(.*)'` |
| `-v` | Invert match (non-matching lines) | `rg -v TODO` |
| `-c` | Count matches per file | `rg -c pattern` |
| `-l` | List files with matches | `rg -l pattern` |
| `-o` | Show only matched part | `rg -o '\w+@\w+'` |
| `-e` | Multiple patterns | `rg -e foo -e bar` |
| `-f` | Patterns from file | `rg -f patterns.txt` |
| `-A/-B/-C` | Show N lines after/before/around matches | `rg -C 3 pattern` |
| `-t` | Filter by file type | `rg -trust pattern` |
| `-g` | Filter by glob pattern | `rg -g '*.rs' pattern` |
| `-u/-uu/-uuu` | Search ignored/hidden/binary files (levels) | `rg -uuu pattern` |
| `--hidden` | Search hidden files | `rg --hidden pattern` |
| `--files` | List files that would be searched | `rg --files` |
| `--stats` | Show search statistics | `rg --stats pattern` |

!!! warning "Performance Note"
    The `-uuu` flag searches everything including binary files, which is significantly slower. Use `-u` (ignores .gitignore) or `-uu` (+ hidden files) for better performance unless you specifically need to search binary files.

!!! note "Smart Case Behavior"
    `-S` (smart case) automatically becomes case-sensitive when your pattern contains uppercase letters. For example, `rg -S error` matches "error", "Error", "ERROR", but `rg -S Error` only matches "Error".

## Combining Flags

Many flags work well together:

```bash
# Smart case search in Python files with context
# Source: tests/feature.rs:212 (smart-case example)
rg -S -tpy -C 2 'Database'

# Multiple patterns: find either foo or bar
# Source: tests/feature.rs:551 (multiple -e flags)
rg -e foo -e bar

# Show only the matched email addresses, not full lines
# Source: tests/multiline.rs:45 (only-matching example)
rg -o '\w+@\w+\.\w+'

# Count TODOs in Rust files, including ignored files
rg -c -trust -u 'TODO'

# List JavaScript files containing "deprecated", exclude minified files
rg -l -tjs -g '!*.min.js' 'deprecated'

# Get detailed statistics about your search
# Source: tests/feature.rs:425 (stats example)
rg --stats 'pattern' | tail -10
```

## Comparison with grep

If you're coming from `grep`, here are some equivalents:

| grep | ripgrep | Notes |
|------|---------|-------|
| `grep -r` | `rg` | Recursive by default |
| `grep -i` | `rg -i` | Case-insensitive |
| `grep -n` | `rg -n` | Line numbers (default in rg) |
| `grep -v` | `rg -v` | Invert match |
| `grep -c` | `rg -c` | Count matches |
| `grep -l` | `rg -l` | List files with matches |
| `grep -w` | `rg -w` | Word boundaries |
| `grep -F` | `rg -F` | Fixed strings (literal) |
| `grep -A/-B/-C` | `rg -A/-B/-C` | Context lines |

Ripgrep respects `.gitignore` by default (use `-u` to disable), shows colors automatically, and is generally faster.
