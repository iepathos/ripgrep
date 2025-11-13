# Binary Detection

> Part of the [Binary Data](./index.md) page

## What is Binary Detection?

Binary detection is a **heuristic process** that identifies whether a file contains binary (non-text) data and handles it differently from plain text files. The primary motivation is that binary files—like executables, images, or compressed archives—often produce nonsensical or disruptive output when searched with textual patterns.

Ripgrep uses a simple but effective heuristic: **the presence of NUL bytes** (`\x00`). When a NUL byte is encountered, the file is considered binary. While not perfect (some text encodings may contain NUL bytes, and some binary formats may not), this heuristic works well in practice since:

- Text files rarely contain NUL bytes
- Binary files typically do contain NUL bytes
- The check is extremely fast

**Important:** Binary detection is **disabled by default** in the `grep-searcher` library but **enabled by default** in ripgrep's CLI for implicit file searches (recursive directory traversal). This means if you use ripgrep as a library, you need to explicitly enable binary detection if you want it.

## How Binary Detection Works

Binary detection behavior depends on the search mode ripgrep uses:

### Buffered Search (Default, or `--no-mmap`)

When ripgrep reads files using a fixed-size buffer (the default for most files, or explicitly with `--no-mmap`):

1. As each buffer is filled from the file, ripgrep scans it for NUL bytes
2. If a NUL byte is found, the file is classified as binary
3. Depending on the mode, ripgrep either stops searching or shows a warning
4. This happens **continuously** as the file is read, so binary detection is thorough

**Example:**
```bash
# Buffered search with binary detection
rg --no-mmap "pattern" file.bin
```

### Memory-Mapped Search (`--mmap`)

When ripgrep uses memory mapping (explicit with `--mmap`, or automatically for some files):

1. Only the **first ~64KB** of the file is scanned for NUL bytes initially
2. Additionally, **matching lines and context lines** are scanned for NUL bytes
3. If a NUL byte is found in either location, the file is classified as binary
4. This is more conservative (less thorough) but much more efficient for large files

**Why the difference?** Memory efficiency. Scanning an entire 10GB memory-mapped file for NUL bytes would be wasteful if ripgrep can make a reasonable determination from the first 64KB.

**Example:**
```bash
# Memory-mapped search - only checks first 64KB + matches
rg --mmap "pattern" largefile.bin
```
