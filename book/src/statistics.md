# Statistics and Metrics

ripgrep can output detailed statistics about the search operation, providing insights into performance, match counts, and files processed.

## Overview

Statistics are useful for:
- Understanding search performance
- Debugging slow searches
- Analyzing codebases
- Gathering metrics for reporting
- Optimizing search patterns

## Enabling Statistics

Enable statistics output with the `--stats` flag:

```bash
rg --stats pattern
```

This prints statistics after all search results.

## Statistics Output Format

The statistics output includes several categories of information:

```
3 matches
2 matched lines
1 files contained matches
5 files searched
150 bytes printed
1500 bytes searched
0.025 seconds spent searching
0.001 seconds spent in main thread
```

## Key Metrics

### Match Statistics

- **Matches**: Total number of pattern matches found
- **Matched lines**: Number of unique lines containing matches
- **Files contained matches**: Count of files with at least one match

### Search Scope

- **Files searched**: Total number of files examined
- **Bytes searched**: Total bytes read and searched
- **Bytes printed**: Amount of data output (including context)

### Performance Metrics

- **Seconds spent searching**: Actual search time across all threads
- **Seconds spent in main thread**: Wall-clock time for the entire operation

## Understanding the Metrics

### Matches vs. Matched Lines

A line can contain multiple matches:

```bash
# Search for 'the'
echo "the quick brown fox jumps over the lazy dog" | rg --stats 'the'
```

Output:
```
the quick brown fox jumps over the lazy dog

2 matches
1 matched lines
```

### Thread Time vs. Wall Time

With parallel search:
- **Searching time**: Sum of time across all threads (can exceed wall time)
- **Main thread time**: Actual elapsed time

Example:
```
0.400 seconds spent searching  (4 threads × 0.1s each)
0.100 seconds spent in main thread  (wall-clock time)
```

## Use Cases

### Performance Analysis

Compare different search strategies:

```bash
# Compare regex vs. fixed string
time rg --stats 'complex.*pattern'
time rg --stats -F 'literal_string'
```

### Codebase Metrics

Analyze code patterns:

```bash
# Count TODO comments
rg --stats 'TODO|FIXME|XXX'

# Find test coverage
rg --stats -trs '#\[test\]'
```

### Search Optimization

Identify slow searches:

```bash
# Check if binary files slow down search
rg --stats --binary pattern
rg --stats --no-binary pattern
```

## Combining with Other Options

### Statistics with File Counts

```bash
# Count matches per file type
rg --stats -tpy 'import'
rg --stats -tjs 'import'
```

### Statistics with Quiet Mode

```bash
# Just get statistics, suppress output
rg --stats -q pattern
```

### Statistics in JSON

```bash
# Machine-readable statistics (not currently supported directly)
# Workaround: Parse stats from stderr
rg --stats pattern 2>&1 | grep 'matches\|files\|seconds'
```

## Examples

### Example 1: Find Most Common Pattern

```bash
# Compare prevalence of different patterns
echo "Searching for error handling patterns:"
rg --stats -trs 'Result<' | grep matches
rg --stats -trs 'Option<' | grep matches
rg --stats -trs '\.unwrap\(' | grep matches
```

### Example 2: Performance Benchmark

```bash
# Measure search performance on large codebase
echo "Performance test:"
rg --stats --no-ignore 'pattern' /usr/share/
```

### Example 3: Codebase Analysis

```bash
# Analyze function definitions
rg --stats -trs 'pub fn ' | tee fn-stats.txt
```

### Example 4: Debugging Slow Search

```bash
# Identify why search is slow
rg --stats --debug 'pattern' 2>&1 | less
```

## Interpreting Results

### High Match Count, Few Files

Suggests:
- Pattern is very common
- Matches concentrated in specific files
- May benefit from more specific pattern

### Many Files Searched, Few Matches

Suggests:
- Pattern is rare
- Good filtering by file type may help
- Pattern might be too specific

### Long Search Time

Possible causes:
- Large number of files
- Complex regex pattern
- Binary files being searched
- Inefficient ignore patterns

## Performance Tips Based on Statistics

If statistics show:

1. **High files searched count**: Use file type filters (`-t`) or glob patterns
2. **High bytes searched**: Consider excluding large files or binary data
3. **High search time**: Simplify regex patterns or use fixed strings (`-F`)
4. **Low parallelism benefit**: Check if sorting or other options disabled threading

## Statistics in Scripts

Capture statistics for reporting:

```bash
#!/bin/bash
OUTPUT=$(rg --stats 'pattern' 2>&1)
MATCHES=$(echo "$OUTPUT" | grep "^[0-9]* matches" | cut -d' ' -f1)
FILES=$(echo "$OUTPUT" | grep "files contained matches" | cut -d' ' -f1)
echo "Found $MATCHES matches across $FILES files"
```

## Best Practices

- Use `--stats` to verify search coverage
- Compare statistics when optimizing patterns
- Monitor search time for performance regression testing
- Use statistics to understand codebase composition
- Include `--stats` in documentation examples for transparency
- Combine with `--debug` for detailed troubleshooting

## Limitations

- Statistics are written to stderr, not stdout
- No built-in JSON format for statistics (requires parsing)
- Thread time may exceed wall time with parallel execution
- Byte counts include full file scans, not just matched content

## See Also

- [Performance](performance.md) - Performance tuning and optimization
- [Troubleshooting](troubleshooting.md) - Debugging search issues
- [Common Options](common-options.md) - Other useful flags
