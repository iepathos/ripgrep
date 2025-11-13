# Output Modes

> Part of the [Common Options](./index.md) page

Instead of showing matching lines, these flags produce alternative output formats.

## Structured Output

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

## Counting

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

## Listing Files

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

## Quiet Mode

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
