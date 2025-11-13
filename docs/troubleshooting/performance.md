# Performance Issues

> Part of the [Troubleshooting](./index.md) page

If ripgrep is slower than expected, try these diagnostic and optimization steps:

!!! tip "Quick Performance Wins"
    1. **Use literal search** with `-F` when not needing regex - significantly faster
    2. **Use file type filters** (`-t`) to limit search space
    3. **Skip large files** with `--max-filesize`
    4. **Prefer default engine** over PCRE2 unless you need lookaround/backreferences

!!! note "Detailed Performance Guide"
    For comprehensive performance information including multiline mode, PCRE2 engine details, I/O strategies, and regex limits, see [Performance Considerations](../advanced-patterns/performance.md).

## Use --stats to Diagnose

Always start by running with `--stats` to see what ripgrep is actually doing:

```bash
$ rg "pattern" --stats
10000 files searched
5 MB searched
2.5 seconds spent searching
```

If you see an unexpectedly large number of files or bytes, you need to filter more aggressively.

## Reduce Search Scope

**Filter by file type:**

```bash
$ rg "pattern" -t rust  # Only search Rust files
$ rg "pattern" -g "*.rs"  # Use glob pattern
```

**Exclude directories:**

```bash
$ rg "pattern" -g "!vendor/*"  # Exclude vendor directory
```

## Avoid Complex PCRE2 Patterns

**Problem:** PCRE2 regexes (`-P` flag) can be much slower than ripgrep's default regex engine.

**Why it's slow:** PCRE2 uses backtracking, which can have exponential time complexity on certain patterns and inputs. ripgrep's default engine uses finite automata with guaranteed linear time.

!!! warning "PCRE2 Backtracking Risk"
    PCRE2 patterns can cause exponential time complexity with nested quantifiers like `(a+)+` or `(.*)*`. This can lead to extremely slow searches or even appear to hang on large files. Always test PCRE2 patterns on representative data before using in production scripts.

**Specific pathological patterns to avoid:**
- Nested quantifiers: `(a+)+`, `(.*)*`
- Complex alternations with overlapping possibilities
- Patterns that cause extensive backtracking on non-matches

**When PCRE2 is worth using:**
- Need lookaround (`(?=...)`, `(?!...)`) or backreferences
- Pattern complexity requires PCRE2 features
- Search space is limited (specific files/directories)
- You've tested the pattern on representative data and performance is acceptable

**Solutions:**
- Avoid `-P/--pcre2` unless you specifically need features like lookaround or backreferences
- If using PCRE2, simplify your regex pattern
- Test without `-P` to see if the default engine is faster
- See [Performance Considerations](../advanced-patterns/performance.md#pcre2-engine-performance) for detailed PCRE2 performance information

## Adjust Threading

By default, ripgrep uses multiple threads. You can adjust this:

```bash
$ rg "pattern" --threads 4  # Limit to 4 threads
$ rg "pattern" -j 1  # Single-threaded search
```

!!! note
    Some flags like `--sort` automatically disable parallelism to maintain order.

## Memory Mapping Strategy

Ripgrep automatically selects the best I/O strategy:

- **Memory mapping** (`mmap`): Used for single file searches
    - Maps file directly into memory
    - Faster for large files
    - Lower memory overhead
- **Buffered reading**: Used for directory searches
    - Reads files incrementally
    - Better for many small files
    - More predictable memory usage

**Manual control if needed:**

```bash
$ rg "pattern" --mmap  # Force memory mapping
$ rg "pattern" --no-mmap  # Force buffered reading
```

!!! tip
    Let ripgrep choose automatically unless you have specific performance issues.

## Performance Tuning Flags

<!-- Source: docs/advanced-patterns/performance.md:199-231 -->

**Skip large files:**
```bash
# Skip files larger than 10MB
$ rg --max-filesize 10M 'pattern'
```

Ignores files larger than 10MB. Useful for avoiding slow searches through large binary files or logs.

**Handle long lines:**
```bash
# Set maximum line length to process
$ rg --max-columns 500 'pattern'
```

Ignores lines longer than 500 characters. Prevents slow regex matching on extremely long lines like minified code.

**Stop after N matches:**
```bash
# Stop searching after finding 100 matches
$ rg --max-count 100 'pattern'
```

Stops after finding 100 matches. Useful for quick verification or when you only need a few examples.

**Limit recursion depth:**
```bash
# Limit directory recursion to 3 levels
$ rg --max-depth 3 'pattern'
```

Limits how deep ripgrep will recurse into directories.

**Avoid crossing filesystem boundaries:**
```bash
# Stay on one filesystem
$ rg --one-file-system 'pattern'
```

Prevents searching across mount points. Avoids accidentally searching network drives or external disks.

**Configure regex engine limits:**
```bash
# Increase DFA memory limit (default: 10M)
$ rg --dfa-size-limit 50M 'pattern'

# Increase regex compilation size (default: 10M)
$ rg --regex-size-limit 50M 'pattern'
```

These limits prevent excessive memory use. Increase them if you encounter "DFA size limit exceeded" or "regex too large" errors.

## Testing and Profiling

!!! example "Performance Testing Workflow"
    ```bash
    # Test with stats on representative data
    $ rg --stats 'pattern' > /dev/null

    # Compare different approaches
    $ time rg -F 'literal' > /dev/null
    $ time rg 'regex' > /dev/null

    # Profile complex patterns before production use
    $ rg --stats -P 'complex.*pattern' testdata/
    ```

**Best practices:**
- Test with `--stats` flag to see performance metrics
- Profile complex patterns before using in production scripts
- Use `time` command for comparing different approaches
- Test on your actual datasets, not toy examples
- Always test PCRE2 patterns on representative data
