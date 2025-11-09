# Common Options

This chapter covers the most frequently used ripgrep flags that you'll need on a daily basis. For a complete list of all options, run `rg --help`. For a concise reference of just the common flags, use `rg -h`.

## Search Basics

These flags control how patterns are interpreted and matched against text.

### Case Sensitivity

By default, ripgrep uses **smart case**: if your pattern is all lowercase, the search is case-insensitive; if it contains any uppercase letters, the search becomes case-sensitive.

- **`-i, --ignore-case`**: Force case-insensitive search regardless of pattern
  ```bash
  # Find "error", "ERROR", "Error", etc.
  rg -i error
  ```
  Useful when searching prose or when you want to catch all case variations.

- **`-s, --case-sensitive`**: Force case-sensitive search
  ```bash
  # Only find exact case match "Error"
  rg -s Error
  ```
  Useful when searching code where case matters (e.g., distinguishing `Error` from `error`).

- **`-S, --smart-case`**: Enable smart case (the default)
  ```bash
  rg -S pattern  # Lowercase pattern → case-insensitive
  rg -S Pattern  # Uppercase present → case-sensitive
  ```

### Pattern Types

By default, ripgrep treats patterns as regular expressions. These flags change that behavior:

- **`-F, --fixed-strings`**: Treat pattern as a literal string, not a regex
  ```bash
  # Find literal text "(.*)" without regex interpretation
  rg -F '(.*)'
  ```
  Useful when searching for text containing regex special characters like `.*`, `[]`, `()`, etc.

- **`-w, --word-regexp`**: Only match whole words
  ```bash
  # Find "test" as a word, not "testing" or "attest"
  rg -w test
  ```
  Uses word boundaries to ensure the pattern isn't part of a larger word.

- **`-x, --line-regexp`**: Only match complete lines
  ```bash
  # Find lines that contain exactly "import sys"
  rg -x 'import sys'
  ```

### Multiline Matching

By default, patterns match within single lines. For patterns that span multiple lines:

- **`-U, --multiline`**: Enable multiline mode where patterns can match across line boundaries
  ```bash
  # Match function definitions spanning multiple lines
  rg -U 'fn \w+\([^)]*\)\s*->'

  # Find multi-line comments
  rg -U '/\*.*?\*/'
  ```

- **`--multiline-dotall`**: Make `.` match newlines in multiline mode
  ```bash
  # Match struct definitions with any content between braces
  rg -U --multiline-dotall 'struct \w+ \{.*?\}'
  ```
  Use with `-U` to make dot match newline characters. Without this, `.` doesn't match `\n` even in multiline mode.

### Regex Engine Selection

Ripgrep uses Rust's regex engine by default, which is very fast. For advanced regex features, you can switch to the PCRE2 engine:

- **`-P, --pcre2`**: Use PCRE2 engine for advanced features like lookahead/lookbehind and backreferences
  ```bash
  # Lookahead: find "foo" only if followed by "bar"
  rg -P 'foo(?=bar)'

  # Lookbehind: find "bar" only if preceded by "foo"
  rg -P '(?<=foo)bar'

  # Backreferences: find repeated words
  rg -P '(\w+)\s+\1'
  ```
  See the [Regular Expressions](./regex.md) chapter for detailed regex syntax and PCRE2 features.

- **`--engine ENGINE`**: Explicitly choose regex engine
  ```bash
  # Force PCRE2 engine
  rg --engine pcre2 'pattern'

  # Force default Rust regex
  rg --engine default 'pattern'

  # Auto-select based on pattern (default)
  rg --engine auto 'pattern'
  ```

### Invert Match

- **`-v, --invert-match`**: Show lines that DON'T match the pattern
  ```bash
  # Show all lines except comments
  rg -v '^#'

  # Find files without TODOs
  rg -v TODO
  ```
  Useful for filtering out noise or finding the absence of something.

### Multiple Patterns

- **`-e, --regexp PATTERN`**: Specify multiple patterns (match any)
  ```bash
  # Find lines with "error" OR "warning"
  rg -e error -e warning
  ```

- **`-f, --file FILE`**: Read patterns from a file (one per line)
  ```bash
  # Search for all patterns listed in patterns.txt
  rg -f patterns.txt
  ```

## Output Formatting

These flags control what information is displayed with each match.

### Line Numbers and Filenames

- **`-n, --line-number`**: Show line numbers (default when searching files)
  ```bash
  rg -n pattern
  # Output: file.txt:42:matching line
  ```

- **`-N, --no-line-number`**: Hide line numbers
  ```bash
  rg -N pattern
  ```

- **`-H, --with-filename`**: Show filenames (default when searching multiple files)
  ```bash
  rg -H pattern
  ```

- **`-I, --no-filename`**: Hide filenames
  ```bash
  rg -I pattern
  ```

- **`--column`**: Show column numbers of matches
  ```bash
  rg --column pattern
  # Output: file.txt:42:7:matching line
  #                    ^ column number
  ```

### Context Lines

Show lines before and/or after each match to understand the surrounding code:

- **`-A NUM, --after-context NUM`**: Show NUM lines after each match
  ```bash
  # Show 3 lines after each match
  rg -A 3 'fn main'
  ```

- **`-B NUM, --before-context NUM`**: Show NUM lines before each match
  ```bash
  # Show 2 lines before each match
  rg -B 2 'panic!'
  ```

- **`-C NUM, --context NUM`**: Show NUM lines before AND after each match
  ```bash
  # Show 5 lines of context around each match
  rg -C 5 'struct Config'
  ```

When showing context, ripgrep prints `--` as a separator between match groups.

### Match Output

- **`-o, --only-matching`**: Print only the matched part of lines, not the full line
  ```bash
  # Extract email addresses
  rg -o '\b\w+@\w+\.\w+\b'

  # Extract function names
  rg -o 'fn \w+' | rg -o '\w+$'
  ```
  Useful for extracting specific data from files.

- **`-r, --replace REPLACEMENT`**: Replace matched text in output (doesn't modify files)
  ```bash
  # Show how lines would look with replacements
  rg 'foo' -r 'bar'

  # Use capture groups
  rg '(\w+)@(\w+)' -r '$2@$1'
  ```
  This changes the display only. To modify files, use other tools like `sed`. See the [Replacements chapter](./replacements.md) for more details.

- **`-b, --byte-offset`**: Show absolute byte offset in file for each match
  ```bash
  # Display byte positions for binary file analysis
  rg -b pattern
  # Output: file.txt:42:137:matching line
  #                    ^^^ byte offset
  ```
  Useful for precise location tracking and binary file analysis.

- **`--hyperlink-format FORMAT`**: Generate clickable terminal links using OSC 8 escape sequences
  ```bash
  # Use built-in editor formats
  rg --hyperlink-format vscode pattern
  rg --hyperlink-format cursor pattern

  # Custom format with variables: {path}, {line}, {column}
  rg --hyperlink-format 'file://{path}:{line}:{column}' pattern
  ```
  Requires a terminal that supports OSC 8 hyperlinks. Built-in formats: `vscode`, `cursor`, `macvim`, `sublime`, `textmate`, `emacs`, `vim`.

### Color and Formatting

- **`--color WHEN`**: Control colored output
  - `auto` (default): Color if outputting to terminal
  - `always`: Force color even when piping
  - `never`: Disable color (useful for scripts)
  ```bash
  # Force color for paging
  rg --color always pattern | less -R

  # Disable color for clean output
  rg --color never pattern > results.txt
  ```

- **`--colors TYPE:STYLE:VALUE`**: Fine-grained color customization
  ```bash
  # Customize match highlighting color to red
  rg --colors 'match:fg:red' pattern

  # Bold path names, green matches
  rg --colors 'path:style:bold' --colors 'match:fg:green' pattern

  # Use 256-color palette or 24-bit RGB
  rg --colors 'match:fg:0,128,255' pattern
  ```
  Types: `path`, `line`, `column`, `match`. Styles: `fg` (foreground), `bg` (background), `style` (bold, intense, underline, italic).

- **`--heading`** / **`--no-heading`**: Control file grouping in output
  ```bash
  # Group matches by file with filename as header
  rg --heading pattern

  # Inline format: path:line:match on each line
  rg --no-heading pattern
  ```
  With `--heading`, matches are grouped under filenames. With `--no-heading`, every line shows the full path.

- **`-p, --pretty`**: Alias for `--color always --heading --line-number`
  ```bash
  # Human-friendly output with grouping and colors
  rg -p pattern
  ```
  This is a convenient shorthand for readable output when piping to a pager.

## File Filtering

These flags control which files are searched.

### File Type Filtering

- **`-t, --type TYPE`**: Only search files of this type
  ```bash
  # Search only Rust files
  rg -trust pattern

  # Search Python and JavaScript files
  rg -tpy -tjs pattern
  ```

- **`-T, --type-not TYPE`**: Exclude files of this type
  ```bash
  # Search everything except log files
  rg -Tlog pattern
  ```

- **`--type-list`**: Show all supported file types
  ```bash
  rg --type-list
  ```

Ripgrep knows about common file extensions for popular languages and formats. You can also define custom types in your [configuration file](./configuration-file.md).

### Glob Patterns

- **`-g, --glob PATTERN`**: Include/exclude files matching glob pattern
  ```bash
  # Only search .rs files
  rg -g '*.rs' pattern

  # Search .py files in src/ directory tree
  rg -g 'src/**/*.py' pattern

  # Exclude minified JavaScript
  rg -g '!*.min.js' pattern

  # Combine multiple globs
  rg -g '*.{rs,toml}' pattern
  ```
  Use `!` prefix to exclude. Globs use `*` for any chars and `**` for directory recursion.

- **`--iglob PATTERN`**: Like `--glob` but case-insensitive

### Unrestricted Search

The `-u` flag progressively removes ripgrep's smart filtering. Each `-u` adds more:

- **`-u`**: Don't respect `.gitignore` and other ignore files
  ```bash
  # Search ignored files like those in .gitignore
  rg -u pattern
  ```

- **`-uu`**: Also search hidden files and binary files
  ```bash
  # Search everything including hidden and binary files
  rg -uu pattern
  ```

- **`-uuu`**: Disable all filtering (ignore files, hidden files, and binary detection)
  ```bash
  # The kitchen sink - search absolutely everything
  rg -uuu pattern
  ```
  This is the most permissive mode, combining all unrestricted behaviors: searches ignored files (`.gitignore`), hidden files (`.dotfiles`), and doesn't skip binary files.

Use `-u` when you need to search `.gitignore`d files, `-uu` when you also need hidden/binary files, and `-uuu` for maximum coverage.

### Hidden Files and Symlinks

- **`--hidden`**: Search hidden files and directories (those starting with `.`)
  ```bash
  # Search .config files
  rg --hidden 'database'
  ```
  By default, hidden files are skipped.

- **`-L, --follow`**: Follow symbolic links
  ```bash
  rg -L pattern
  ```
  By default, symlinks are not followed (to avoid cycles and duplication).

### Directory Depth

- **`-d, --max-depth NUM`**: Limit directory recursion depth
  ```bash
  # Search only current directory (no subdirectories)
  rg -d 1 pattern

  # Descend at most 3 levels
  rg -d 3 pattern
  ```

### File Size Limits

- **`--max-filesize NUM+SUFFIX`**: Ignore files larger than this size
  ```bash
  # Skip files larger than 100KB
  rg --max-filesize 100K pattern

  # Skip files larger than 5MB
  rg --max-filesize 5M pattern
  ```
  Suffixes: `K` (kilobytes), `M` (megabytes), `G` (gigabytes).

### Binary Files

By default, ripgrep auto-detects binary files (by finding NUL bytes) and skips them to avoid polluting output.

- **`--binary`**: Force searching binary files (shows matches even if NUL bytes detected)
  ```bash
  # Search binary files for strings
  rg --binary 'pattern'
  ```

- **`-a, --text`**: Treat all files as text, disabling binary detection
  ```bash
  # Search everything as text
  rg -a pattern
  ```

- **`--max-columns-preview NUM`**: Tune binary detection threshold
  ```bash
  # Files with lines longer than 200 chars are considered binary
  rg --max-columns-preview 200 pattern
  ```
  Default is 150. Ripgrep checks the first preview bytes for NUL characters.

### Advanced Filtering

- **`--same-file-system`**: Don't cross filesystem boundaries when searching
  ```bash
  # Stay on same filesystem (avoid mounted drives, network shares)
  rg --same-file-system pattern
  ```
  Useful to avoid searching network mounts or external drives.

- **`--no-ignore-parent`**: Don't respect ignore files in parent directories
  ```bash
  # Only use .gitignore in current directory, not parents
  rg --no-ignore-parent pattern
  ```
  By default, ripgrep traverses up and respects `.gitignore`/`.ignore` files in parent directories.

- **`--path-separator SEPARATOR`**: Use custom path separator in output
  ```bash
  # Use forward slashes on Windows for Unix-style paths
  rg --path-separator / pattern
  ```
  Useful for cross-platform scripts and consistent output formatting.

## Output Modes

Instead of showing matching lines, these flags produce alternative output formats.

### Structured Output

- **`--json`**: Output results in JSON Lines format (one JSON object per line)
  ```bash
  # Get machine-readable output for tooling
  rg --json 'pattern'
  ```
  Each line is a JSON object with a `type` field indicating the message type:
  - `begin`: Start of search in a file
  - `match`: A match with fields like `path`, `line_number`, `lines` (matched text), `submatches` (match positions)
  - `context`: Context lines around matches (when using `-A/-B/-C`)
  - `end`: End of search in a file
  - `summary`: Final statistics (if `--stats` is used)

  Useful for integrating ripgrep into scripts, editors, and other tools that need structured data.

- **`--vimgrep`**: Output in vim-compatible quickfix format
  ```bash
  # Generate vim quickfix format: path:line:col:text
  rg --vimgrep 'pattern'
  ```
  Format: `path:line:column:matching text`. Useful for IDE integration and editor plugins that support quickfix format.

### Counting

- **`-c, --count`**: Show count of matching lines per file
  ```bash
  rg -c 'TODO'
  # src/main.rs:5
  # src/lib.rs:12
  ```

- **`--count-matches`**: Show count of all matches (not just lines)
  ```bash
  # Count total occurrences, not just lines
  rg --count-matches 'TODO'
  ```
  Difference: if a line has 3 matches, `-c` counts it as 1, `--count-matches` counts it as 3.

### Listing Files

- **`-l, --files-with-matches`**: Only print filenames containing matches
  ```bash
  # List files with TODOs
  rg -l 'TODO'
  ```

- **`--files-without-match`**: Only print filenames with NO matches
  ```bash
  # Find files missing copyright headers
  rg --files-without-match 'Copyright'
  ```

- **`--files`**: List all files that would be searched (ignore pattern)
  ```bash
  # Show which files ripgrep would search
  rg --files

  # List all Rust files
  rg --files -trust
  ```

### Quiet Mode

- **`-q, --quiet`**: Suppress all output, exit with code 0 if match found
  ```bash
  # Use in scripts for conditional logic
  if rg -q 'deprecated' src/; then
    echo "Found deprecated code!"
  fi
  ```
  Exits immediately on first match for performance.

## Performance and Limits

### Match Limits

- **`-m, --max-count NUM`**: Stop after NUM matches per file
  ```bash
  # Show just first 5 matches in each file
  rg -m 5 pattern
  ```
  Useful for quick sampling or improving performance on large codebases.

### Parallelism

- **`-j, --threads NUM`**: Number of threads to use (default: auto-detect)
  ```bash
  # Use 4 threads
  rg -j 4 pattern

  # Single-threaded (for debugging)
  rg -j 1 pattern
  ```

### Memory-Mapped I/O

- **`--mmap`**: Use memory-mapped I/O (sometimes faster)
- **`--no-mmap`**: Don't use memory mapping (the default)
  ```bash
  # Try mmap for potentially faster searches
  rg --mmap pattern
  ```
  Memory mapping can be faster on some systems but uses more memory.

### Sorting

Results can be sorted by various criteria, though this requires buffering all results and impacts performance:

- **`--sort SORTBY`**: Sort results in ascending order
- **`--sortr SORTBY`**: Sort results in descending order (reverse)
  ```bash
  # Sort by file path
  rg --sort path pattern

  # Sort by modification time (newest first)
  rg --sortr modified pattern

  # Sort by creation time
  rg --sort created pattern
  ```
  Available criteria: `path` (lexicographic), `modified` (modification time), `accessed` (access time), `created` (creation time).

  Note: Sorting disables parallelism and buffers all results, which can be slow on large searches.

### Line Length Limits

Long lines can slow down searches. These flags help manage that:

- **`--max-columns NUM`**: Don't print lines longer than NUM bytes
  ```bash
  # Skip very long lines (often minified code or data)
  rg --max-columns 500 pattern
  ```
  Lines exceeding this length are skipped entirely.

- **`--max-columns-preview NUM`**: For binary detection, check first NUM bytes for NUL
  ```bash
  # Adjust binary detection sensitivity
  rg --max-columns-preview 200 pattern
  ```
  Default is 150. Used to decide if a file is binary.

## Getting Help

- **`-h`**: Show short help with the most common flags
  ```bash
  rg -h
  ```
  This is a condensed version showing just what you need most often.

- **`--help`**: Show comprehensive help with all flags and detailed descriptions
  ```bash
  rg --help
  ```

- **`-V, --version`**: Show version information
  ```bash
  rg -V
  ```

- **`--type-list`**: List all recognized file types
  ```bash
  rg --type-list
  ```

- **`--pcre2-version`**: Show PCRE2 library version and JIT availability
  ```bash
  rg --pcre2-version
  ```
  Useful for verifying PCRE2 support before using the `-P` flag.

### Debugging and Performance Analysis

These flags help troubleshoot search behavior and analyze performance:

- **`--debug`**: Show debug information about search strategy and configuration
  ```bash
  rg --debug pattern
  ```
  Shows which files are searched, which are ignored, regex engine selection, and configuration details. Useful for understanding why certain files are included or excluded.

- **`--trace`**: Show trace-level debug information (very verbose)
  ```bash
  rg --trace pattern 2> trace.log
  ```
  Even more detailed than `--debug`. Typically redirected to a file due to verbosity.

- **`--stats`**: Show search statistics after results
  ```bash
  rg --stats pattern
  ```
  Displays metrics including:
  - Elapsed time
  - Bytes searched and printed
  - Number of matched lines
  - Number of searches with matches

  Useful for performance analysis and understanding search scope.

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

## See Also

- [Regular Expressions](./regex.md) - Learn ripgrep's regex syntax
- [Replacements](./replacements.md) - Detailed guide to the `-r` flag and capture groups
- [Configuration File](./configuration-file.md) - Set default flags and custom file types
- [File Encoding](./file-encoding.md) - Handle different text encodings
