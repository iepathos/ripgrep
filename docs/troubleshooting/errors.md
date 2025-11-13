# Common Error Messages

> Part of the [Troubleshooting](./index.md) page

## "pattern starts with a dash/hyphen"

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

## "Compiled regex exceeds size limit"

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

## "DFA cache size limit exceeded"

**Cause:** The DFA (Deterministic Finite Automaton) cache used by the regex engine has exceeded its memory limit (default: 1 MB). This can happen with complex patterns or large inputs.

**Solutions:**

Increase the DFA cache size limit with `--dfa-size-limit`:

```
$ rg "complex-pattern" --dfa-size-limit 10M
```

Or simplify your regex pattern to reduce DFA cache usage.

## "Permission denied" or "Access denied"

**Cause:** ripgrep doesn't have permission to read certain files or directories.

**Solutions:**

- Use `--no-messages` to suppress permission errors:

```
$ rg "pattern" --no-messages
```

- Run with appropriate permissions if you need to search protected files
- Use `-u` or `-uu` flags carefully, as they don't bypass filesystem permissions

## "encoding error"

**Cause:** The file contains bytes that aren't valid in the expected text encoding (usually UTF-8).

**Solutions:**

- Use `-E/--encoding` to specify the correct encoding:

```
$ rg "pattern" -E latin1
```

- Use `-a/--text` to search the file anyway, treating it as text
- See the [file encoding chapter](../file-encoding.md) for details

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
$ rg -u "pattern"             # Ignore .gitignore but respect .ignore
$ rg -uu "pattern"            # Ignore all ignore files but skip hidden/binary
$ rg -uuu "pattern"           # Ignore everything (unrestricted search)
$ rg --no-ignore-vcs          # Only ignore version control ignore files
$ rg --no-ignore-global       # Ignore global gitignore
$ rg --no-ignore-parent       # Ignore parent directory ignore files
$ rg --no-ignore-messages     # Suppress ignore-related error messages
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
- **matched lines**: Number of lines containing matches (this metric tracks lines with matches throughout the search, and is particularly relevant when using `-c/--count` mode)
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
