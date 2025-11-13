# No Results Found

> Part of the [Troubleshooting](./index.md) page

If ripgrep returns zero results when you expect matches, try these troubleshooting steps:

## Check What Files Would Be Searched

**First step:** Use the `--files` flag to see which files ripgrep would search (without actually searching them):

```
$ rg --files
```

This diagnostic flag is crucial for understanding filtering issues. If your expected files aren't in this list, they're being filtered out.

**Combine with other filters:**

```
$ rg --files -t rust           # See which Rust files would be searched
$ rg --files -g "*.config"     # See which .config files would be searched
$ rg --files --hidden          # Include hidden files in the listing
```

## Files Filtered by .gitignore

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

## Hidden Files Skipped

**Problem:** ripgrep skips hidden files and directories (those starting with `.`) by default.

**Solutions:**
- Use `--hidden` to search hidden files
- Use `-uuu` to search everything including hidden files

## Binary Files Filtered

**Problem:** ripgrep automatically detects and skips binary files to avoid printing garbage to your terminal.

**Diagnosis:** Run with `--debug` to see binary file detection:

```
$ rg --debug "pattern"
DEBUG|grep_searcher::searcher: binary file matches (but not printed): ./myfile.bin
```

**Solutions:**
- Use `-a` or `--text` to search binary files anyway
- Use `--binary` to explicitly control binary file handling
- See the [Binary and Encoding Problems](./binary-encoding.md) section below

## Case Sensitivity

**Problem:** The pattern doesn't match because of case differences.

**Solutions:**
- Use `-i` or `--ignore-case` to make the search case-insensitive
- Use `-S` or `--smart-case` to search case-insensitively if the pattern is all lowercase
- Check if smart-case is enabled in your configuration file

## File Type Not Recognized

**Problem:** Files are being filtered out because their type isn't recognized or matched by your `-t` filter.

**Diagnosis:** Use `--type-list` to see all file types ripgrep knows about:

```
$ rg --type-list
```

This shows all available file types and their associated patterns. Check if your file type is listed and what extensions/patterns it matches.

**Example:**

```
$ rg --type-list | grep -i rust
rust: *.rs

$ rg --type-list | grep -i python
py: *.py, *.pyw, *.pyi, *.pyx
```

**Solutions:**
- If your file type isn't in the list, use `-g` glob patterns instead of `-t`:
  ```
  $ rg "pattern" -g "*.myext"
  ```
- Add custom file types in your configuration file
- Check that you're using the correct type name (e.g., `py` not `python`)

## Pattern Doesn't Match

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
