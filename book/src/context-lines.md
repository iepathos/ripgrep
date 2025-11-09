# Context Lines

When searching for patterns, it's often helpful to see the lines surrounding each match to understand the context. ripgrep provides powerful options for displaying context lines before and after matches.

## Overview

Context lines help you understand the surrounding code or text when a pattern matches. This is particularly useful when debugging, code review, or understanding how a term is used in context.

## Basic Context Options

ripgrep provides three main flags for controlling context:

```bash
# Show 2 lines after each match
rg -A 2 pattern

# Show 2 lines before each match
rg -B 2 pattern

# Show 2 lines before and after each match
rg -C 2 pattern
```

## After Context

Display lines after each match:

```bash
# Long form
rg --after-context 3 pattern

# Short form
rg -A 3 pattern
```

This is useful when:
- Reading function implementations
- Understanding the effect of a statement
- Seeing what happens after an error message

## Before Context

Display lines before each match:

```bash
# Long form
rg --before-context 3 pattern

# Short form
rg -B 3 pattern
```

This is useful when:
- Finding what leads to a match
- Understanding variable declarations
- Seeing setup code before execution

## Symmetric Context

Display the same number of lines before and after:

```bash
# Long form
rg --context 3 pattern

# Short form
rg -C 3 pattern
```

This is equivalent to `-A 3 -B 3` and provides balanced context.

## Context Separators

By default, ripgrep separates groups of matches with `--`:

```
file1.txt:10:matching line
file1.txt-11-context line after
file1.txt-12-context line after
--
file1.txt:20:another matching line
file1.txt-21-context line after
```

### Customizing Separators

Change the separator between match groups:

```bash
# Use custom separator
rg -C 2 --context-separator '=====' pattern

# Use empty separator
rg -C 2 --context-separator '' pattern
```

## Line Number Display

Context lines are marked differently from matching lines:

- Matching lines use `:` after line number: `file.txt:42:match`
- Context lines use `-` after line number: `file.txt-43-context`

```bash
# With line numbers (often default)
rg -n -C 2 pattern

# Without line numbers
rg -N -C 2 pattern
```

## Combining with Other Options

### Context with Multiple Patterns

```bash
# Show context for any match
rg -C 2 -e pattern1 -e pattern2
```

### Context with File Filtering

```bash
# Show context only in Python files
rg -C 3 -tpy 'def '
```

### Context with Replacements

```bash
# Show context with replacement preview
rg -C 2 -r 'new_value' 'old_value'
```

## Examples

### Example 1: Understanding Function Context

```bash
# Find function definitions with implementation preview
rg -A 10 'fn main' src/
```

### Example 2: Error Context

```bash
# Find error messages with surrounding code
rg -C 5 'error\|ERROR\|Error' logs/
```

### Example 3: Configuration Values

```bash
# Find config keys with neighboring settings
rg -C 3 'database_url' config/
```

### Example 4: Custom Separator

```bash
# More visible match group separation
rg -C 2 --context-separator '─────────────' 'TODO'
```

## Best Practices

- Start with `-C 2` for general purpose context
- Use `-A` when you care about what follows (e.g., function bodies)
- Use `-B` when you care about what precedes (e.g., comments, setup)
- Increase context size for complex code, decrease for simple searches
- Use custom separators to make output more readable
- Combine with `--heading` for clearer file organization

## Performance Considerations

- Context lines have minimal performance impact
- Larger context sizes slightly increase memory usage
- Context doesn't significantly affect search speed
- Consider reducing context when output is very large

## Troubleshooting

### Overlapping Matches

When matches are close together, their context may overlap. ripgrep handles this gracefully by not duplicating lines.

### No Separator Appearing

Separators only appear when there are multiple distinct match groups. Single matches or overlapping contexts won't show separators.

## See Also

- [Basics](basics.md) - Basic search usage
- [Output Formats](output-formats.md) - Other output customization options
- [Common Options](common-options.md) - Frequently used flags
