# Troubleshooting

This chapter helps you diagnose and solve common problems when using ripgrep. Most issues can be resolved by understanding ripgrep's filtering behavior and using the `--debug` flag to see what's happening behind the scenes.

## Quick Troubleshooting Checklist

If you're experiencing unexpected behavior, try these steps in order:

1. **Run with `--debug`** to see what files are being searched and why others are skipped
2. **Try `-uuu`** (unrestricted search) to temporarily disable all filtering
3. **Use `-F`** to search for literal text instead of a regex pattern
4. **Try `-i`** to make the search case-insensitive
5. **Check `--stats`** to see how many files were searched and matches found
6. **Review the FAQ** and GUIDE for common issues

## Debug Flags

ripgrep provides several flags to help you understand what it's doing:

### `--debug`

The `--debug` flag shows detailed information about ripgrep's search decisions, including:

- Which files are being searched
- Which files are being skipped and why
- Which ignore files are being loaded (`.gitignore`, `.ignore`, etc.)
- Binary file detection results
- Configuration file loading

Example output:

```
$ rg --debug "pattern" mydir
DEBUG|ignore::walk|crates/ignore/src/walk.rs:1140: ignoring ./mydir/.git: Ignore(IgnoreMatch(GitIgnore, .gitignore, node_modules/*, <...>))
DEBUG|ignore::walk|crates/ignore/src/walk.rs:1140: ignoring ./mydir/target: Ignore(IgnoreMatch(GitIgnore, .gitignore, target/, <...>))
DEBUG|grep_regex::literal|crates/regex/src/literal.rs:58: literal prefixes detected: Literals { lits: [Complete(pattern)], limit_size: 250, limit_class: 10 }
```

Use `--debug` when:
- Files you expect to be searched are missing from results
- You need to understand which ignore files are affecting the search
- You're troubleshooting performance issues

### `--trace`

The `--trace` flag provides even more detailed output than `--debug`, including:

- Regex matching internals
- Low-level search decisions
- Detailed filter processing

**Warning:** `--trace` produces very verbose output. Use it only when `--debug` doesn't provide enough information.

### `--stats`

The `--stats` flag shows statistics about the search after completion:

```
$ rg "pattern" --stats
[normal search output]

6 matches
3 matched lines
2 files contained matches
10 files searched
52849 bytes printed
96749 bytes searched
0.002390 seconds spent searching
0.000839 seconds
```

Use `--stats` to:
- Verify how many files were actually searched
- Check performance metrics
- Understand the scope of your search

## No Results Found

If ripgrep returns zero results when you expect matches, try these troubleshooting steps:

### Files Filtered by .gitignore

**Problem:** ripgrep respects `.gitignore` by default and won't search ignored files.

**Diagnosis:** Run with `--debug` to see if files are being ignored:

```
$ rg --debug "pattern"
DEBUG|ignore::walk: ignoring ./node_modules: Ignore(IgnoreMatch(...))
```

**Solutions:**
- Use `-u` to ignore `.gitignore` files (but still respect `.ignore` and `.rgignore`)
- Use `-uu` to ignore all ignore files (but still filter hidden files and binaries)
- Use `-uuu` for completely unrestricted search (searches everything)
- Use `--no-ignore-vcs` to ignore only version control ignore files

### Hidden Files Skipped

**Problem:** ripgrep skips hidden files and directories (those starting with `.`) by default.

**Solutions:**
- Use `--hidden` to search hidden files
- Use `-uuu` to search everything including hidden files

### Binary Files Filtered

**Problem:** ripgrep automatically detects and skips binary files to avoid printing garbage to your terminal.

**Diagnosis:** Run with `--debug` to see binary file detection:

```
$ rg --debug "pattern"
DEBUG|grep_searcher::searcher: binary file matches (but not printed): ./myfile.bin
```

**Solutions:**
- Use `-a` or `--text` to search binary files anyway
- Use `--binary` to explicitly control binary file handling
- See the [Binary File Handling](#binary-and-encoding-problems) section below

### Case Sensitivity

**Problem:** The pattern doesn't match because of case differences.

**Solutions:**
- Use `-i` or `--ignore-case` to make the search case-insensitive
- Use `-S` or `--smart-case` to search case-insensitively if the pattern is all lowercase
- Check if smart-case is enabled in your configuration file

### Pattern Doesn't Match

**Problem:** Your regex pattern isn't matching what you expect.

**Diagnosis:**
- Use `-F` or `--fixed-strings` to search for literal text instead of a regex
- Test with a simpler pattern to verify the file is being searched
- Use `--debug` to see the literal prefixes ripgrep extracted from your pattern

**Example:**

```
$ rg "foo.*bar"  # regex search
$ rg -F "foo.*bar"  # literal search for the exact string "foo.*bar"
```

## Performance Issues

If ripgrep is slower than expected, try these diagnostic and optimization steps:

### Use --stats to Diagnose

Always start by running with `--stats` to see what ripgrep is actually doing:

```
$ rg "pattern" --stats
10000 files searched
5 MB searched
2.5 seconds spent searching
```

If you see an unexpectedly large number of files or bytes, you need to filter more aggressively.

### Reduce Search Scope

**Filter by file type:**

```
$ rg "pattern" -t rust  # Only search Rust files
$ rg "pattern" -g "*.rs"  # Use glob pattern
```

**Exclude directories:**

```
$ rg "pattern" -g "!vendor/*"  # Exclude vendor directory
```

### Avoid Complex PCRE2 Patterns

**Problem:** PCRE2 regexes (`-P` flag) can be much slower than ripgrep's default regex engine.

**Why it's slow:** PCRE2 uses backtracking, which can have exponential time complexity on certain patterns and inputs. ripgrep's default engine uses finite automata with guaranteed linear time.

**Solutions:**
- Avoid `-P/--pcre2` unless you specifically need features like lookaround or backreferences
- If using PCRE2, simplify your regex pattern
- Test without `-P` to see if the default engine is faster
- See the [FAQ](../FAQ.md#pcre2-slow) for more details

### Adjust Threading

By default, ripgrep uses multiple threads. You can adjust this:

```
$ rg "pattern" --threads 4  # Limit to 4 threads
$ rg "pattern" -j 1  # Single-threaded search
```

### Try Memory Mapping

For large files, memory mapping can help:

```
$ rg "pattern" --mmap  # Enable memory mapping
```

Or disable it if it's causing problems:

```
$ rg "pattern" --no-mmap
```

## Common Error Messages

### "pattern starts with a dash/hyphen"

**Error:** When you try to search for text starting with `-`, ripgrep interprets it as a flag.

**Example:**

```
$ rg -foo
error: unexpected argument '-o' found
```

**Solutions:**

Use `--` to separate flags from the pattern:

```
$ rg -- -foo
```

Or use `-e` to explicitly specify the pattern:

```
$ rg -e -foo
```

### "Compiled regex exceeds size limit"

**Error:**

```
$ rg '\pL{1000}'
Compiled regex exceeds size limit of 10485760 bytes.
```

**Cause:** The regex pattern is too large when compiled. This often happens with large character classes (like `\pL` for all Unicode letters) or many alternations.

**Solutions:**

Increase the limit with `--regex-size-limit`:

```
$ rg '\pL{1000}' --regex-size-limit 1G
```

Or simplify your pattern:

```
$ rg '[a-zA-Z]{1000}'  # Use a smaller character class
```

### "Permission denied" or "Access denied"

**Cause:** ripgrep doesn't have permission to read certain files or directories.

**Solutions:**

- Use `--no-messages` to suppress permission errors:

```
$ rg "pattern" --no-messages
```

- Run with appropriate permissions if you need to search protected files
- Use `-u` or `-uu` flags carefully, as they don't bypass filesystem permissions

### "encoding error"

**Cause:** The file contains bytes that aren't valid in the expected text encoding (usually UTF-8).

**Solutions:**

- Use `-E/--encoding` to specify the correct encoding:

```
$ rg "pattern" -E latin1
```

- Use `-a/--text` to search the file anyway, treating it as text
- See the [file encoding chapter](file-encoding.md) for details

## Binary and Encoding Problems

### How ripgrep Detects Binary Files

ripgrep uses a simple heuristic: if it encounters a NUL byte (`\0`) in the first few KB of a file, it treats the file as binary and skips it by default.

### Searching Binary Files

If you need to search binary files:

```
$ rg -a "pattern"  # Search binary files, print matches
$ rg --binary "pattern"  # Explicitly enable binary search
```

Use `--debug` to see which files are being skipped as binary:

```
$ rg --debug "pattern"
DEBUG|grep_searcher::searcher: binary file matches (but not printed): ./file.bin
```

### Encoding Issues

If files aren't UTF-8 encoded, ripgrep may fail to search them correctly.

**Diagnose:**

```
$ rg --debug "pattern"
DEBUG|grep_searcher::searcher: encoding error: ...
```

**Fix:**

Specify the correct encoding:

```
$ rg -E latin1 "pattern"
$ rg -E utf-16le "pattern"
```

For more details, see the [file encoding chapter](file-encoding.md).

## Ignore File Issues

### Understanding Ignore Behavior

ripgrep respects multiple types of ignore files, in order of precedence:

1. `.ignore` (ripgrep-specific)
2. `.rgignore` (ripgrep-specific, deprecated)
3. `.gitignore` (version control)
4. Global gitignore (from Git configuration)
5. Parent directory ignore files

### Diagnosing Ignore Problems

Use `--debug` to see which ignore files are being loaded and used:

```
$ rg --debug "pattern"
DEBUG|ignore::walk: ignoring ./node_modules: Ignore(IgnoreMatch(GitIgnore, .gitignore, node_modules/*, <...>))
```

### Bypassing Ignore Files

Different flags control different ignore behaviors:

```
$ rg -u "pattern"        # Ignore .gitignore but respect .ignore
$ rg -uu "pattern"       # Ignore all ignore files but skip hidden/binary
$ rg -uuu "pattern"      # Ignore everything (unrestricted search)
$ rg --no-ignore-vcs     # Only ignore version control ignore files
$ rg --no-ignore-global  # Ignore global gitignore
$ rg --no-ignore-parent  # Ignore parent directory ignore files
```

### Parent Directory Ignore Files

Remember that `.gitignore` files in parent directories also affect the search. Use `--debug` to see all ignore files being used.

## Regex Pattern Errors

### Common Regex Mistakes

**Unescaped special characters:**

```
$ rg "foo.bar"     # Matches "foo" + any char + "bar"
$ rg "foo\.bar"    # Matches literal "foo.bar"
$ rg -F "foo.bar"  # Literal search (no escaping needed)
```

**Backreferences in default mode:**

```
$ rg "(\w+) \1"      # ERROR: backreferences not supported
$ rg -P "(\w+) \1"   # OK: PCRE2 supports backreferences
```

**Lookaround in default mode:**

```
$ rg "foo(?=bar)"    # ERROR: lookahead not supported
$ rg -P "foo(?=bar)" # OK: PCRE2 supports lookahead
```

For advanced regex features (backreferences, lookaround, etc.), you need PCRE2:

```
$ rg -P "(?<=@)\w+"  # Use PCRE2 for lookbehind
```

See the [FAQ](../FAQ.md#fancy) for more information about regex engines.

### Pattern Too Complex

If your pattern is complex and causing errors:

1. **Simplify the pattern** - Break it into multiple simpler searches
2. **Use literal search** - Try `-F` if you're searching for literal text
3. **Increase limits** - Use `--regex-size-limit` if the pattern is large
4. **Avoid PCRE2** - Try without `-P` to use the faster default engine

## Statistics Output

The `--stats` flag provides detailed information about the search:

```
$ rg "TODO" --stats
src/main.rs
12:    // TODO: implement this feature
25:    // TODO: add error handling

src/lib.rs
8:    // TODO: optimize this function

3 matches
3 matched lines
2 files contained matches
15 files searched
1234 bytes printed
45678 bytes searched
0.005123 seconds spent searching
0.001234 seconds
```

**Understanding the output:**
- **matches**: Total number of matches found
- **matched lines**: Number of lines containing matches (with `-c/--count`)
- **files contained matches**: How many files had at least one match
- **files searched**: Total files ripgrep examined
- **bytes searched**: Total bytes of content searched
- **seconds spent searching**: Time spent in the actual search algorithm
- **seconds**: Total wall clock time

Use `--stats` to:
- Verify your search is running on the expected files
- Diagnose performance issues (too many files searched)
- Debug why you're getting zero results (check files searched count)

## PCRE2 Availability

If you're trying to use PCRE2 features with the `-P` flag and getting errors:

**Check if PCRE2 is available:**

```
$ rg --pcre2-version
```

If PCRE2 is not available, you'll see an error. If it is available, you'll see version information and whether JIT (Just-In-Time compilation) is enabled:

```
PCRE2 10.42 is available (JIT is available)
```

**If PCRE2 is not available:**
- Your ripgrep binary wasn't compiled with PCRE2 support
- Install a version with PCRE2 support, or build from source with the `pcre2` feature

## Exit Codes

ripgrep uses exit codes to indicate search results, which is useful in scripts:

- **Exit 0**: At least one match was found
- **Exit 1**: No matches found (not an error)
- **Exit 2**: An error occurred

**Example usage in scripts:**

```bash
if rg -q "pattern" file.txt; then
    echo "Pattern found"
else
    echo "Pattern not found or error occurred"
fi
```

The `-q/--quiet` flag suppresses output and is useful with exit codes for conditional logic.

## When to File a Bug

Before filing a bug report, please check:

1. **Review the FAQ and GUIDE** - Your issue may be a known behavior or already documented
2. **Run with `--debug`** - Gather diagnostic information
3. **Test with a minimal example** - Simplify your reproduction case
4. **Check common non-bugs:**
   - Pattern starting with `-` (use `rg -- -pattern` or `rg -e -pattern`)
   - Old Rust version for building (use latest stable Rust)
   - Package manager issues (contact package maintainer)
   - Snap package permission issues (use GitHub binary releases instead)

### Preparing a Good Bug Report

A good bug report includes:

1. **Output of `rg --version`**
2. **How you installed ripgrep** (cargo, apt, homebrew, etc.)
3. **Operating system and version**
4. **Command run with `--debug` flag**
5. **Complete `--debug` output**
6. **Minimal reproduction case** (pattern and sample file if possible)
7. **Expected vs. actual behavior**

See the [bug report template](https://github.com/BurntSushi/ripgrep/blob/master/.github/ISSUE_TEMPLATE/bug_report.yml) for the complete format.

## Additional Resources

- **FAQ**: Common questions and answers - [FAQ.md](../FAQ.md)
- **User Guide**: Comprehensive documentation - [GUIDE.md](../GUIDE.md)
- **GitHub Issues**: Search for known issues and solutions
- **Configuration**: See the [configuration file chapter](configuration-file.md) for persistent settings
- **File Encoding**: See the [file encoding chapter](file-encoding.md) for encoding details
- **Common Options**: See the [common options chapter](common-options.md) for flag reference
