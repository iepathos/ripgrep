# Output Modes

> Part of the [Common Options](./index.md) page

Instead of showing matching lines, these flags produce alternative output formats.

## Structured Output

- **`--json`**: Output results in JSON Lines format (one JSON object per line)
  ```bash
  # Get machine-readable output for tooling
  rg --json 'pattern'
  ```
  Each line is a JSON object with a `type` field indicating the message type. Here are examples of each message type:

  === "Match"
      ```json
      {
        "type": "match",
        "data": {
          "path": {
            "text": "src/main.rs"
          },
          "lines": {
            "text": "fn main() {\n"
          },
          "line_number": 1,
          "absolute_offset": 0,
          "submatches": [
            {
              "match": {
                "text": "main"
              },
              "start": 3,
              "end": 7
            }
          ]
        }
      }
      ```

  === "Begin"
      ```json
      {
        "type": "begin",
        "data": {
          "path": {
            "text": "src/main.rs"
          }
        }
      }
      ```

  === "End"
      ```json
      {
        "type": "end",
        "data": {
          "path": {
            "text": "src/main.rs"
          },
          "binary_offset": null,
          "stats": {
            "elapsed": {
              "secs": 0,
              "nanos": 1234567,
              "human": "0.001235s"
            },
            "searches": 1,
            "searches_with_match": 1,
            "bytes_searched": 1024,
            "bytes_printed": 256,
            "matched_lines": 5,
            "matches": 5
          }
        }
      }
      ```

  === "Context"
      ```json
      {
        "type": "context",
        "data": {
          "path": {
            "text": "src/main.rs"
          },
          "lines": {
            "text": "    // Context line before match\n"
          },
          "line_number": 2,
          "absolute_offset": 15,
          "submatches": []
        }
      }
      ```

  === "Summary"
      ```json
      {
        "type": "summary",
        "data": {
          "elapsed_total": {
            "secs": 0,
            "nanos": 5678900,
            "human": "0.005679s"
          },
          "stats": {
            "elapsed": {
              "secs": 0,
              "nanos": 5000000,
              "human": "0.005000s"
            },
            "searches": 42,
            "searches_with_match": 15,
            "bytes_searched": 1048576,
            "bytes_printed": 4096,
            "matched_lines": 127,
            "matches": 135
          }
        }
      }
      ```

  !!! tip "Using JSON Output"
      JSON Lines format is ideal for streaming parsers. Each line is a complete, valid JSON object that can be processed independently. Perfect for integration with tools like `jq`, custom scripts, or editor plugins.

- **`--vimgrep`**: Output in vim-compatible quickfix format
  ```bash
  # Generate vim quickfix format: path:line:col:text
  rg --vimgrep 'pattern'
  ```
  Format: `path:line:column:matching text`. Useful for IDE integration and editor plugins that support quickfix format.

  !!! warning "Performance Impact"
      The vimgrep format shows all matches on separate lines, even if multiple matches are on the same line. This can result in quadratic output when many matches occur on the same line.

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

  !!! note "System-Dependent Performance"
      Memory mapping can be faster on some systems but uses more memory. Performance depends on your OS, file system, and available RAM. Benchmark with your specific use case.

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

  !!! tip "Performance Impact"
      Sorting disables parallelism and buffers all results in memory before displaying them. This can significantly impact performance on large searches. Consider using external sorting tools if speed is critical.

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

  !!! info "About JIT Compilation"
      JIT (Just-In-Time compilation) can significantly improve PCRE2 pattern matching performance by compiling regex patterns to native machine code. This flag shows if JIT support is available in your ripgrep build. Use this to verify PCRE2 support before using the `-P` flag for advanced regex features.

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

## See Also

- [File Filtering](file-filtering.md) - Control which files are searched with type filters and glob patterns
- [Output Formatting](output-formatting.md) - Customize how matches are displayed
- [Performance](../../performance.md) - In-depth guide to optimizing search performance
- [Search Basics](search-basics.md) - Learn about regex patterns and search modes
