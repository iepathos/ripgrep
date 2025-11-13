# Performance Issues

> Part of the [Troubleshooting](./index.md) page

If ripgrep is slower than expected, try these diagnostic and optimization steps:

## Use --stats to Diagnose

Always start by running with `--stats` to see what ripgrep is actually doing:

```
$ rg "pattern" --stats
10000 files searched
5 MB searched
2.5 seconds spent searching
```

If you see an unexpectedly large number of files or bytes, you need to filter more aggressively.

## Reduce Search Scope

**Filter by file type:**

```
$ rg "pattern" -t rust  # Only search Rust files
$ rg "pattern" -g "*.rs"  # Use glob pattern
```

**Exclude directories:**

```
$ rg "pattern" -g "!vendor/*"  # Exclude vendor directory
```

## Avoid Complex PCRE2 Patterns

**Problem:** PCRE2 regexes (`-P` flag) can be much slower than ripgrep's default regex engine.

**Why it's slow:** PCRE2 uses backtracking, which can have exponential time complexity on certain patterns and inputs. ripgrep's default engine uses finite automata with guaranteed linear time.

**Solutions:**
- Avoid `-P/--pcre2` unless you specifically need features like lookaround or backreferences
- If using PCRE2, simplify your regex pattern
- Test without `-P` to see if the default engine is faster
- See the [FAQ](../FAQ.md#pcre2-slow) for more details

## Adjust Threading

By default, ripgrep uses multiple threads. You can adjust this:

```
$ rg "pattern" --threads 4  # Limit to 4 threads
$ rg "pattern" -j 1  # Single-threaded search
```

## Try Memory Mapping

For large files, memory mapping can help:

```
$ rg "pattern" --mmap  # Enable memory mapping
```

Or disable it if it's causing problems:

```
$ rg "pattern" --no-mmap
```
