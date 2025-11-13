# Quick Reference

> Part of the [Common Options](./index.md) page

## Quick Reference

Here are the most essential flags for daily use:

| Flag | Purpose | Example |
|------|---------|---------|
| `-i` | Case-insensitive search | `rg -i error` |
| `-w` | Match whole words only | `rg -w test` |
| `-F` | Literal string (not regex) | `rg -F '(.*)'` |
| `-v` | Invert match (non-matching lines) | `rg -v TODO` |
| `-c` | Count matches per file | `rg -c pattern` |
| `-l` | List files with matches | `rg -l pattern` |
| `-A/-B/-C` | Show context lines | `rg -C 3 pattern` |
| `-t` | Filter by file type | `rg -trust pattern` |
| `-g` | Filter by glob pattern | `rg -g '*.rs' pattern` |
| `-u` | Search ignored files | `rg -u pattern` |
| `--hidden` | Search hidden files | `rg --hidden pattern` |

## Combining Flags

Many flags work well together:

```bash
# Case-insensitive search in Python files only, with context
rg -i -tpy -C 2 'database connection'

# Count TODOs in Rust files, including ignored files
rg -c -trust -u 'TODO'

# List JavaScript files containing "deprecated", exclude minified files
rg -l -tjs -g '!*.min.js' 'deprecated'

# Pretty output with context, search hidden config files
rg -p -C 5 --hidden 'password'
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
