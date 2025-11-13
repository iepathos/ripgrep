# Basics

This chapter covers the fundamental usage of ripgrep, including pattern matching, literal strings, regular expressions, and basic output formatting. If you're new to ripgrep, start here.

## Quick Start

Here are the most common ripgrep commands to get you started:

```bash
# Simple search for a pattern
rg TODO

# Case-insensitive search
rg -i error

# Search for exact string (no regex)
rg -F "function()"

# Count matches per file
rg -c pattern

# List files containing matches
rg -l pattern

# Search with line numbers and context
rg -n -C 2 pattern
```

## Subsections

This page is organized into the following subpages:

- [Pattern Matching](./pattern-matching.md) - Learn how to search for patterns, use multiple patterns, and load patterns from files
- [Literal String Search](./literal-search.md) - Search for exact strings without regex interpretation using fixed-string mode
- [Regular Expressions](./regex-basics.md) - Master regex metacharacters, character classes, Unicode patterns, quantifiers, and groups
- [Case Sensitivity](./case-sensitivity.md) - Control case-sensitive, case-insensitive, and smart-case search behavior
- [Word and Line Boundaries](./boundaries.md) - Match whole words and entire lines with boundary matching options
- [Output Format](./output.md) - Customize output with line numbers, column numbers, color, context lines, and heading modes
- [Count and List Modes](./count-list.md) - Count matches and list files with or without matches
- [Practice Examples](./practice.md) - Hands-on exercises and common mistakes to avoid

## Common Flags Cheat Sheet

| Flag | Short | Description |
|------|-------|-------------|
| `--fixed-strings` | `-F` | Literal string search (no regex) |
| `--ignore-case` | `-i` | Case-insensitive search |
| `--smart-case` | `-S` | Smart case sensitivity |
| `--word-regexp` | `-w` | Match whole words only |
| `--line-regexp` | `-x` | Match whole lines only |
| `--line-number` | `-n` | Show line numbers |
| `--count` | `-c` | Count matches per file |
| `--count-matches` | | Count individual matches |
| `--files-with-matches` | `-l` | List files with matches |
| `--files-without-match` | | List files without matches |
| `--invert-match` | `-v` | Show non-matching lines |
| `--after-context` | `-A` | Show N lines after match |
| `--before-context` | `-B` | Show N lines before match |
| `--context` | `-C` | Show N lines before and after |
| `--color` | | Control color output |
| `--column` | | Show column numbers |
| `--no-heading` | | Print file path on each line |

## Next Steps

Now that you understand the basics, you can explore more advanced topics:

- **[Recursive Search](../recursive-search.md)** - Control how ripgrep traverses directories
- **[Automatic Filtering](../automatic-filtering.md)** - Understand gitignore and automatic file filtering
- **[Manual Filtering](../manual-filtering-globs.md)** - Use globs and file types to filter searches
- **[Advanced Patterns](../advanced-patterns.md)** - Multiline search, PCRE2, and complex regex
- **[Replacements](../replacements.md)** - Find and replace with capture groups
- **[Output Formats](../output-formats.md)** - JSON output, custom formats, and more
