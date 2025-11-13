# Common Options

This chapter covers the most frequently used ripgrep flags that you'll need on a daily basis. For a complete list of all options, run `rg --help`. For a concise reference of just the common flags, use `rg -h`.

!!! tip "Quick Help Reference"
    Use `rg -h` for a concise list of common flags, or `rg --help` for the complete reference including all advanced options.

The common options are organized by use case to help you quickly find the right flag for your task:

- **Search behavior** - Control how ripgrep interprets patterns and matches text
- **Output formatting** - Customize how results are displayed
- **File filtering** - Select which files to search
- **Alternative output modes** - Generate machine-readable or specialized output formats

## Subsections

- **[Search Basics](./search-basics.md)** - Pattern matching modes, case sensitivity, regex engines, and matching strategies
- **[Output Formatting](./output-formatting.md)** - Line numbers, context lines, color, and display options
- **[File Filtering](./file-filtering.md)** - File type filtering, glob patterns, hidden files, and binary file handling
- **[Output Modes](./output-modes.md)** - Alternative output formats like JSON, quickfix, counting, and file listing
- **[Reference](./reference.md)** - Quick reference guide, flag combinations, and grep comparisons

## See Also

- [Regular Expressions](../basics/regex-basics.md) - Learn ripgrep's regex syntax
- [Replacements](../replacements.md) - Detailed guide to the `-r` flag and capture groups
- [Configuration File](../configuration-file.md) - Set default flags and custom file types
- [File Encoding](../file-encoding.md) - Handle different text encodings
