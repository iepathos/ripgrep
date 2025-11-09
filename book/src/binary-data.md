# Binary Data

Binary data handling is one of ripgrep's most important and nuanced features. Understanding how ripgrep detects and processes binary files is crucial for getting the results you expect, whether you're searching source code or working with mixed file types.

## What is Binary Detection?

Binary detection is a **heuristic process** that identifies whether a file contains binary (non-text) data and handles it differently from plain text files. The primary motivation is that binary files—like executables, images, or compressed archives—often produce nonsensical or disruptive output when searched with textual patterns.

Ripgrep uses a simple but effective heuristic: **the presence of NUL bytes** (`\x00`). When a NUL byte is encountered, the file is considered binary. While not perfect (some text encodings may contain NUL bytes, and some binary formats may not), this heuristic works well in practice since:

- Text files rarely contain NUL bytes
- Binary files typically do contain NUL bytes
- The check is extremely fast

**Important:** Binary detection is **disabled by default** in the `grep-searcher` library but **enabled by default** in ripgrep's CLI for implicit file searches (recursive directory traversal). This means if you use ripgrep as a library, you need to explicitly enable binary detection if you want it.

## Binary Modes

Ripgrep supports three distinct binary handling modes, controlled by the `--binary` and `--text` flags:

### Auto Mode (Default)

The default mode automatically determines the binary handling strategy based on how the file is specified:

- **Explicit files** (e.g., `rg pattern file.bin`): Uses `SearchAndSuppress` mode—the file is searched, but if binary data is detected, a warning is shown instead of the matches
- **Implicit files** (e.g., `rg pattern` in a directory, or `rg pattern -g '*.bin'`): Quits searching immediately when binary data is detected, no output or warning

This dual behavior balances precision (don't waste time on binary files) with recall (if the user explicitly named a file, they probably want to search it).

### SearchAndSuppress Mode

When you use the `--binary` flag, ripgrep will search binary files but suppress matches and emit warnings when NUL bytes are found:

```bash
# Search binary files in directory, showing warnings
rg --binary pattern
```

In this mode, **NUL bytes are replaced with line terminators** during searching. This is a memory-saving heuristic: true binary data isn't line-oriented, so treating it as such without this replacement could result in impractically large "lines" (imagine a 100MB binary file with no line breaks).

### AsText Mode

The `--text` (or `-a`) flag completely disables binary detection, treating all files as plain text:

```bash
# Force search binary files as text
rg --text pattern
rg -a pattern
```

**⚠️ Warning:** This may print raw binary data to your terminal, including escape sequences that could corrupt your terminal display or cause unexpected behavior. Use with caution and consider piping to `cat -v` or similar if you need to inspect the output safely.

The `--text` flag overrides `--binary` if both are specified.

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

## Implicit vs. Explicit Files

One of the most important concepts in ripgrep's binary handling is the distinction between **implicit** and **explicit** files:

| File Type | How Specified | Binary Behavior | Warning Message |
|-----------|---------------|-----------------|-----------------|
| **Explicit** | `rg pattern file.txt` or `cat file.txt \| rg pattern` | Search continues, warning shown if binary data found | `binary file matches (found "\0" byte around offset N)` |
| **Implicit** | `rg pattern` (recursive), `rg pattern -g '*.txt'` | Search stops immediately, warning shown if binary data found after a match | `WARNING: stopped searching binary file after match (found "\0" byte around offset N)` |

**Why this distinction?** It's about user intent:

- If you explicitly name a file, you probably want to search it even if it's binary
- If ripgrep discovers a file during recursive search, it should skip binary files to avoid wasting time and producing garbage output

**Example - Implicit (recursive search):**
```bash
# Recursive search stops at binary files
$ rg "Project Gutenberg" -g 'hay'
hay:1:The Project Gutenberg EBook of A Study In Scarlet
hay: WARNING: stopped searching binary file after match (found "\0" byte around offset 77041)
```

**Example - Explicit file:**
```bash
# Explicit file shows warning but continues
$ rg "Project Gutenberg" hay
1:The Project Gutenberg EBook of A Study In Scarlet
binary file matches (found "\0" byte around offset 77041)
```

**Making implicit files behave like explicit files:**

Use the `--binary` flag to make recursively-discovered files emit warnings instead of being silently skipped:

```bash
# Recursive search with binary warnings
rg --binary "pattern" -g '*.bin'
```

## Flags Reference

### `--binary`

**Purpose:** Search binary files and show warnings instead of skipping them.

**Effect:** Applies `SearchAndSuppress` mode to implicit files, making them behave like explicit files.

**When to use:**
- You want to know which binary files contain matches
- You're searching in directories that mix text and binary files
- You suspect binary files might contain text patterns you care about

**Example:**
```bash
# Show warnings for binary files in recursive search
rg --binary TODO
```

**Important:** This flag **only affects implicit files** (those found via recursive search or globs). Explicit file arguments already get warnings by default.

### `--text` / `-a`

**Purpose:** Completely disable binary detection, treating all files as text.

**Effect:** Sets `AsText` mode—no NUL byte detection, no special handling.

**When to use:**
- Searching files with unusual encodings that contain NUL bytes
- Searching data formats that are technically binary but human-readable (some JSON variants, etc.)
- Debugging when you suspect binary detection is interfering

**⚠️ Caution:** Can print raw binary data that may corrupt your terminal.

**Example:**
```bash
# Treat everything as text, even binaries
rg --text "pattern" binary_file.bin
```

### `--no-binary`

**Purpose:** Disable the `--binary` flag.

**Effect:** Reverts to default `Auto` mode behavior.

**Example:**
```bash
# Explicitly disable binary warnings
rg --no-binary "pattern"
```

### `--no-text`

**Purpose:** Disable the `--text` flag.

**Effect:** Re-enables binary detection if `--text` was set.

**Example:**
```bash
# Re-enable binary detection
rg --no-text "pattern"
```

## Edge Cases and Gotchas

### Performance Optimizations

Ripgrep makes several performance optimizations that can affect binary detection:

#### 1. `--files-with-matches` / `-l`

When using `-l` (just list filenames), ripgrep can list a binary file before detecting the NUL byte, because it stops reading after the first match:

```bash
# Binary file might be listed even if it's binary
rg -l "pattern"
```

This is an acceptable tradeoff: showing the filename is still useful, and the performance gain from stopping early is significant.

#### 2. `--quiet` / `-q`

Similar to `-l`, quiet mode may skip binary detection because it exits immediately upon finding any match:

```bash
# May exit before detecting binary data
rg --quiet "pattern"
```

#### 3. `--count` / `-c`

Count mode scans the entire file to count all matches, so binary detection works correctly:

```bash
# Binary detection works properly with count
rg -c "pattern"
```

### Matches Before NUL Bytes

If a match occurs in the same buffer as a NUL byte but **before** the NUL byte, that match may not be printed. This is because ripgrep processes the buffer sequentially and classifies it as binary before outputting the match.

**Example scenario:**
```
Buffer contents: "match_text ... \x00 ..."
                     ^           ^
                  match here   NUL here
```

The match might not be shown because the buffer is classified as binary before the match is output.

## For Library Users

If you're using the `grep-searcher` crate in your own Rust code, binary detection works differently:

### Default Behavior

Binary detection is **disabled by default** in the library (unlike the CLI):

```rust
use grep_searcher::SearcherBuilder;

// By default, no binary detection
let searcher = SearcherBuilder::new().build();
```

### Enabling Binary Detection

Use the `BinaryDetection` API to configure detection:

```rust
use grep_searcher::{BinaryDetection, SearcherBuilder};

// Quit on NUL byte (stop searching)
let searcher = SearcherBuilder::new()
    .binary_detection(BinaryDetection::quit(b'\x00'))
    .build();

// Convert NUL bytes to line terminators
let searcher = SearcherBuilder::new()
    .binary_detection(BinaryDetection::convert(b'\x00'))
    .build();

// No binary detection (default)
let searcher = SearcherBuilder::new()
    .binary_detection(BinaryDetection::none())
    .build();
```

### API Methods

- **`BinaryDetection::none()`**: No binary detection (default for library)
- **`BinaryDetection::quit(byte)`**: Stop searching when `byte` is found
- **`BinaryDetection::convert(byte)`**: Replace `byte` with line terminator

**Note:** The `convert` strategy only works with buffered search, not memory-mapped search.

## Performance Considerations

Binary detection has minimal performance impact:

- **Detection overhead:** Extremely low—just a byte-by-byte scan during normal reading
- **Performance benefit:** Can be significant by skipping binary files early, especially in recursive searches
- **Memory impact:** The NUL-to-newline conversion in `SearchAndSuppress` mode prevents excessive memory usage from treating binary data as single giant lines

**When to use each mode:**

| Mode | Use When | Performance Profile |
|------|----------|-------------------|
| **Auto (default)** | General-purpose searching | Best balance: skips binaries but searches explicit files |
| **`--binary`** | Need to know about binary matches | Slightly slower: searches more files, but still stops early |
| **`--text`** | Files incorrectly detected as binary | Potentially slower: may search irrelevant data |
| **Disabled (library)** | Complete control needed | Fastest, but may produce garbage output |

## Examples

### Example 1: Default Behavior (Implicit Files)

```bash
# Recursive search - binary files are silently skipped
$ rg "config"
src/config.rs:10:pub struct Config {
```

No output for `compiled.bin` because it's binary and implicit.

### Example 2: With `--binary` Flag

```bash
# Recursive search - binary files show warnings
$ rg --binary "config"
src/config.rs:10:pub struct Config {
compiled.bin: WARNING: stopped searching binary file after match (found "\0" byte around offset 1234)
```

### Example 3: Explicit File (Always Searched)

```bash
# Explicit file - shows binary warning
$ rg "signature" compiled.bin
binary file matches (found "\0" byte around offset 2048)
```

### Example 4: Force Text Mode

```bash
# Search binary as text (may show garbage)
$ rg --text "signature" compiled.bin
[raw binary output, possibly terminal corruption]
```

### Example 5: Memory Map vs. Buffered

```bash
# With mmap (only checks first 64KB + matches)
$ rg --mmap "pattern" largefile.bin
# Match near start of file: shown
# Binary data after 64KB: might not be detected unless pattern matches

# With buffered reading (thorough detection)
$ rg --no-mmap "pattern" largefile.bin
# All buffers scanned for NUL bytes
```

### Example 6: stdin Input

```bash
# stdin is treated like explicit file
$ cat binary.bin | rg "pattern"
binary file matches (found "\0" byte around offset 512)
```

## Decision Flowchart

Here's how ripgrep decides what to do with binary data:

```
                    ┌─────────────────┐
                    │ File to search  │
                    └────────┬────────┘
                             │
                   ┌─────────▼──────────┐
                   │ --text flag set?   │
                   └─────────┬──────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   Yes               No
                    │                 │
                    ▼                 ▼
            ┌───────────────┐  ┌──────────────────┐
            │ Treat as text │  │ Binary detection │
            │ (no detection)│  │ enabled          │
            └───────────────┘  └─────────┬────────┘
                                         │
                               ┌─────────▼──────────┐
                               │ File explicit or   │
                               │ implicit?          │
                               └─────────┬──────────┘
                                         │
                                ┌────────┴────────┐
                                │                 │
                            Explicit          Implicit
                                │                 │
                                ▼                 ▼
                      ┌──────────────────┐  ┌─────────────────┐
                      │ SearchAndSuppress│  │ --binary flag?  │
                      │ (show warning)   │  └────────┬────────┘
                      └──────────────────┘           │
                                            ┌────────┴────────┐
                                            │                 │
                                           Yes               No
                                            │                 │
                                            ▼                 ▼
                                  ┌──────────────────┐  ┌────────────┐
                                  │ SearchAndSuppress│  │ Quit early │
                                  │ (show warning)   │  │ (silent)   │
                                  └──────────────────┘  └────────────┘
```

## Troubleshooting

### "I expected a match but got a binary warning"

**Cause:** The file contains a NUL byte and is being treated as binary.

**Solution:** Use `--text` to force text mode:
```bash
rg --text "pattern" file
```

### "My UTF-16 file isn't being searched"

**Cause:** UTF-16 encoding uses NUL bytes, triggering binary detection.

**Solution:** Use `--text` or convert the file to UTF-8 first:
```bash
# Force text mode
rg --text "pattern" utf16file.txt

# Or use --encoding (if supported)
rg --encoding utf-16le "pattern" utf16file.txt
```

### "Binary detection seems inconsistent with large files"

**Cause:** Memory-mapped mode only checks the first 64KB + matches.

**Solution:** Use `--no-mmap` to force buffered reading:
```bash
rg --no-mmap "pattern" largefile
```

### "Recursive search misses files that explicit search finds"

**Cause:** Implicit files are silently skipped when binary, explicit files show warnings.

**Solution:** Use `--binary` to see warnings for implicit files:
```bash
rg --binary "pattern"
```

## Related Topics

- **[File Encoding](./file-encoding.md)**: Understanding how ripgrep handles different text encodings, which can interact with binary detection
- **[Manual Filtering: File Types](./manual-filtering.md#file-types)**: Controlling which file types are searched, complementing binary detection
- **[Compressed Files](./compressed-files.md)**: Using `--search-zip` to search inside compressed archives (which are binary but may contain text)

## Summary

Binary data handling in ripgrep balances three concerns:

1. **Performance**: Skip irrelevant binary files quickly
2. **User intent**: Search files the user explicitly names
3. **Safety**: Avoid corrupting the terminal with binary output

Key takeaways:

- Binary detection uses NUL bytes as the heuristic
- Implicit files (recursive) are skipped silently; explicit files show warnings
- Use `--binary` to see warnings for all files
- Use `--text` to force searching everything as text (with caution)
- Memory-mapped and buffered searches detect binaries differently
- Library users must explicitly enable binary detection
