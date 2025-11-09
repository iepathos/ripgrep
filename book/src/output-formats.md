# Output Formats

ripgrep provides multiple output formats and customization options to tailor search results to your needs, from standard grep-like output to JSON for programmatic consumption.

## Overview

By default, ripgrep outputs search results in a grep-compatible format. However, it offers extensive formatting options including JSON output, custom colors, field separators, and specialized formats like vimgrep. This chapter covers all output formatting capabilities.

## Standard Output Format

The default output format shows matching lines with optional file paths, line numbers, and column numbers:

```bash
# Basic output
rg pattern

# With line numbers (default in many cases)
rg -n pattern

# With column numbers
rg --column pattern
```

## JSON Output

JSON output is useful for programmatic consumption and integration with other tools:

```bash
# Output results as JSON Lines (one JSON object per line)
rg --json pattern

# Pretty-printed JSON
rg --json -p pattern
```

### JSON Output Structure

Each match is represented as a JSON object with fields including:
- `type`: The type of message (match, context, begin, end, summary)
- `data`: Match data including path, line number, text, and submatches

## Color Customization

ripgrep supports extensive color customization:

```bash
# Control color output
rg --color always pattern  # Always use colors
rg --color never pattern   # Never use colors
rg --color auto pattern    # Auto-detect (default)

# Custom color specifications
rg --colors 'match:fg:red' --colors 'match:bg:yellow' pattern
```

### Color Specifications

Available color types:
- `match`: Matching text
- `path`: File paths
- `line`: Line numbers
- `column`: Column numbers

Color attributes:
- Foreground: `fg:color`
- Background: `bg:color`
- Style: `none`, `bold`, `intense`, `underline`

## Field Separators

Customize separators between different fields in the output:

```bash
# Custom match separator
rg --field-match-separator ':' pattern

# Custom context separator
rg --field-context-separator '-' pattern
```

## Vimgrep Format

Special format compatible with vim's quickfix:

```bash
# Vimgrep format: file:line:column:text
rg --vimgrep pattern
```

## Heading Mode

Control whether file paths are printed as headings or on each line:

```bash
# Enable heading mode (file paths as headers)
rg --heading pattern

# Disable heading mode (file path on each line)
rg --no-heading pattern
```

## Null Separators

Use null bytes as separators for safe handling of filenames with special characters:

```bash
# Null byte separator for file paths
rg --null pattern

# Print NUL byte after each file path
rg -0 pattern
```

## Buffering Modes

Control output buffering behavior:

```bash
# Line-buffered output (flush after each line)
rg --line-buffered pattern

# Block-buffered output (default)
rg --block-buffered pattern
```

## Additional Output Options

### Only Matching Text

Print only the matched portions of lines:

```bash
rg -o pattern
rg --only-matching pattern
```

### Byte Offsets

Show byte offsets instead of line numbers:

```bash
rg -b pattern
rg --byte-offset pattern
```

### Trim Whitespace

Trim ASCII whitespace from matching lines:

```bash
rg --trim pattern
```

### Max Columns

Control maximum column width for matches:

```bash
# Limit columns shown
rg --max-columns 100 pattern

# Show preview of long lines
rg --max-columns-preview pattern
```

## Examples

### Example 1: JSON Output for Scripting

```bash
# Search and parse with jq
rg --json 'TODO' | jq -r 'select(.type == "match") | "\(.data.path.text):\(.data.line_number)"'
```

### Example 2: Custom Colors for Readability

```bash
# Green matches on dark background
rg --colors 'match:fg:green' --colors 'match:style:bold' pattern
```

### Example 3: Vimgrep Integration

```bash
# Search and load results in vim quickfix
rg --vimgrep pattern > /tmp/results.txt
vim -q /tmp/results.txt
```

## Best Practices

- Use `--json` for scripts and automation
- Use `--vimgrep` for editor integration
- Use `--color never` when piping to other commands
- Use `--null` when handling filenames with special characters
- Use `--heading` for human-readable output with many matches
- Use `--no-heading` when processing output line-by-line

## Performance Considerations

- JSON output has minimal performance overhead
- Colored output may be slightly slower on some terminals
- Buffering modes can affect perceived performance in pipelines
- `--only-matching` can be slower for complex patterns

## See Also

- [Replacements](replacements.md) - Modify output with replacements
- [Common Options](common-options.md) - Other frequently used flags
- [Context Lines](context-lines.md) - Add context to matches
