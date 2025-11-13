# Debug Flags

> Part of the [Troubleshooting](./index.md) page

ripgrep provides several flags to help you understand what it's doing:

## `--debug`

The `--debug` flag shows detailed information about ripgrep's search decisions, including:

- Which files are being searched
- Which files are being skipped and why
- Which ignore files are being loaded (`.gitignore`, `.ignore`, etc.)
- Binary file detection results
- Configuration file loading
- Regex engine selection (default Rust regex vs PCRE2)

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

## `--trace`

The `--trace` flag provides even more detailed output than `--debug`, showing trace-level debug information about all aspects of ripgrep's operation, including:

- Low-level search decisions
- Detailed filter processing
- Internal algorithm behavior

**Warning:** `--trace` produces very verbose output. Use it only when `--debug` doesn't provide enough information.

## `--stats`

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
