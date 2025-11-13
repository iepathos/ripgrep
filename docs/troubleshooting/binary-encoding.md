# Binary and Encoding Problems

> Part of the [Troubleshooting](./index.md) page

## How ripgrep Detects Binary Files

ripgrep uses a simple heuristic: if it encounters a NUL byte (`\0`) in the first few KB of a file, it treats the file as binary and skips it by default.

## Searching Binary Files

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

## Encoding Issues

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

For more details, see the [file encoding chapter](../file-encoding.md).
