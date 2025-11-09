# Introduction

ripgrep is a line-oriented search tool that recursively searches the current directory for a regex pattern. By default, ripgrep will respect gitignore rules and automatically skip hidden files/directories and binary files.

## What is ripgrep?

ripgrep is a command line tool that searches your files for patterns that you give it. ripgrep behaves as if reading each file line by line. If a line matches the pattern provided to ripgrep, then that line will be printed. If a line does not match the pattern, then the line is not printed.

## Key Features

- **Fast**: ripgrep is built on top of Rust's regex engine, which uses finite automata, SIMD, and aggressive literal optimizations to make searching very fast.
- **Respects ignore files**: By default, ripgrep respects `.gitignore`, `.ignore`, and `.rgignore` files.
- **Automatic filtering**: Hidden files, binary files, and symbolic links are automatically filtered by default.
- **Cross-platform**: Works on Linux, macOS, and Windows.
- **Powerful filtering**: Support for glob patterns and file type filtering.
- **Multiple encoding support**: Handles UTF-8, UTF-16, and other encodings with BOM detection.

## Installation

For installation instructions, please see the [README](https://github.com/BurntSushi/ripgrep#installation) in the ripgrep repository.

## Quick Start

Once installed, you can start using ripgrep immediately:

```bash
# Search for 'pattern' in current directory
rg pattern

# Search for 'pattern' in a specific file
rg pattern path/to/file

# Search for 'pattern' in a specific directory
rg pattern path/to/dir

# Case-insensitive search
rg -i pattern

# Search only in specific file types
rg -tpy pattern  # Search only Python files
```

## Getting Help

- Use `rg -h` for a condensed help output
- Use `rg --help` for detailed help (pipe into a pager)
- Visit the [FAQ](https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md) for common questions
- Check the [GUIDE](https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md) for in-depth usage

## Assumptions

This guide assumes that:
- ripgrep is [installed](https://github.com/BurntSushi/ripgrep#installation)
- You have passing familiarity with using command line tools
- You are using a Unix-like system (although most commands translate easily to any command line shell environment)
