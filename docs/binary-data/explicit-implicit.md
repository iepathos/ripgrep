# Explicit vs Implicit Files

!!! info "Related Topics"
    This page covers explicit vs implicit file behavior. See also:

    - [Detection](detection.md) - How ripgrep detects binary files
    - [Modes](modes.md) - Different binary handling modes
    - [Flags](flags.md) - Command-line flags for binary control

One of the most important concepts in ripgrep's binary handling is the distinction between **implicit** and **explicit** files:

| File Type | How Specified | Binary Behavior | Warning Message |
|-----------|---------------|-----------------|-----------------|
| **Explicit** | `rg pattern file.txt` or `cat file.txt \| rg pattern` | Search continues, warning shown if binary data found | `binary file matches (found "\0" byte around offset N)` |
| **Implicit** | `rg pattern` (recursive), `rg pattern -g '*.txt'` | Search stops immediately, warning shown if binary data found after a match | `WARNING: stopped searching binary file after match (found "\0" byte around offset N)` |

**Why this distinction?** It's about user intent:

- If you explicitly name a file, you probably want to search it even if it's binary
- If ripgrep discovers a file during recursive search, it should skip binary files to avoid wasting time and producing garbage output

```mermaid
flowchart TD
    Start[Start Search] --> Type{File Type}

    Type -->|Explicit - rg pattern file.txt| ExplicitSearch[Search File]
    Type -->|Implicit - rg pattern recursive| ImplicitSearch[Search File]

    ExplicitSearch --> ExplicitMatch{"Match
Found?"}
    ImplicitSearch --> ImplicitMatch{"Match
Found?"}

    ExplicitMatch -->|Yes| ExplicitBinary{"Binary
Data?"}
    ImplicitMatch -->|Yes| ImplicitBinary{"Binary
Data?"}

    ExplicitBinary -->|Yes| ExplicitWarn["Show Match
+ Warning
Continue Search"]
    ExplicitBinary -->|No| ExplicitShow["Show Match
Continue Search"]

    ImplicitBinary -->|Yes| ImplicitWarn["Show Match
+ WARNING
STOP Search"]
    ImplicitBinary -->|No| ImplicitShow["Show Match
Continue Search"]

    ExplicitMatch -->|No| ExplicitContinue["Continue
Search"]
    ImplicitMatch -->|No| ImplicitContinue["Continue
Search"]

    ExplicitWarn --> ExplicitContinue
    ExplicitShow --> ExplicitContinue
    ImplicitWarn --> End[Done]
    ImplicitShow --> ImplicitContinue

    ExplicitContinue --> ExplicitEOF{"End of
File?"}
    ImplicitContinue --> ImplicitEOF{"End of
File?"}

    ExplicitEOF -->|No| ExplicitSearch
    ExplicitEOF -->|Yes| End
    ImplicitEOF -->|No| ImplicitSearch
    ImplicitEOF -->|Yes| End

    style ExplicitSearch fill:#e3f2fd
    style ImplicitSearch fill:#fff3e0
    style ExplicitWarn fill:#e1f5fe
    style ImplicitWarn fill:#ffecb3
    style End fill:#e8f5e9
```

**Figure**: Explicit vs implicit file search behavior showing how binary detection affects search continuation.

## Example - Implicit (recursive search)

!!! example "Implicit File Behavior"
    When ripgrep discovers files recursively, it stops searching after finding binary data to avoid wasting time.

```bash
# Recursive search stops at binary files
$ rg "Project Gutenberg" -g 'hay'
hay:1:The Project Gutenberg EBook of A Study In Scarlet
hay: WARNING: stopped searching binary file after match (found "\0" byte around offset 77041)
```

## Example - Explicit file

!!! example "Explicit File Behavior"
    When you explicitly specify a file, ripgrep assumes you want to search it regardless of binary content.

```bash
# Explicit file shows warning but continues
$ rg "Project Gutenberg" hay
1:The Project Gutenberg EBook of A Study In Scarlet
binary file matches (found "\0" byte around offset 77041)
```

## Making implicit files behave like explicit files

!!! tip "Converting Implicit to Explicit Behavior"
    Use the `--binary` flag when you want recursive searches to treat all files like they were explicitly specified. This is useful when you need comprehensive search results even from binary files.

```bash
# Recursive search with binary warnings
rg --binary "pattern" -g '*.bin'  # (1)!

# 1. Treats discovered files as explicit - shows warnings but continues searching
```

## Edge Cases and Gotchas

!!! info "Performance vs Accuracy Tradeoffs"
    Ripgrep makes several performance optimizations that can affect binary detection. These tradeoffs favor speed while maintaining useful behavior.

### Performance Optimizations

#### 1. `--files-with-matches` / `-l`

When using `-l` (just list filenames), ripgrep can list a binary file before detecting the NUL byte, because it stops reading after the first match:

```bash
# Binary file might be listed even if it's binary
rg -l "pattern"  # (1)!

# 1. Stops after first match - may list binary files before detecting NUL bytes
```

This is an acceptable tradeoff: showing the filename is still useful, and the performance gain from stopping early is significant.

#### 2. `--quiet` / `-q`

Similar to `-l`, quiet mode may skip binary detection because it exits immediately upon finding any match:

```bash
# May exit before detecting binary data
rg --quiet "pattern"  # (1)!

# 1. Exits on first match - binary detection may not occur
```

#### 3. `--count` / `-c`

Count mode scans the entire file to count all matches, so binary detection works correctly:

```bash
# Binary detection works properly with count
rg -c "pattern"  # (1)!

# 1. Scans entire file - binary detection always occurs
```

### Matches Before NUL Bytes

!!! warning "Edge Case: Matches Before NUL Bytes"
    If a match occurs in the same buffer as a NUL byte but **before** the NUL byte, that match may not be printed. This is because ripgrep processes the buffer sequentially and classifies it as binary before outputting the match.

    **Example scenario:**
    ```
    Buffer contents: "match_text ... \x00 ..."
                         ^           ^
                      match here   NUL here
    ```

    The match might not be shown because the buffer is classified as binary before the match is output.

## Troubleshooting

!!! question "Why does `rg -l` show binary files?"
    When using `--files-with-matches` / `-l`, ripgrep stops reading after the first match for performance. This means it might list a binary file before encountering a NUL byte that would normally trigger binary detection.

    **This is expected behavior** - the performance benefit of stopping early outweighs the minor inconvenience of occasionally listing binary files.

    **Workaround:** If you need to exclude binary files from `-l` output, use `rg -l pattern | xargs file | grep text` to filter the results.

!!! question "Why doesn't `--quiet` detect binary files?"
    Similarly, `--quiet` / `-q` exits immediately upon finding any match, potentially before binary detection occurs. This is a deliberate performance optimization.

## For Library Users

If you're using the `grep-searcher` crate in your own Rust code, binary detection works differently:

!!! note "Library vs CLI Defaults"
    Binary detection is **disabled by default** in the library, unlike the CLI where binary files are skipped by default during recursive search. You must explicitly enable it using the `BinaryDetection` API.

    **Why the difference?** The CLI enables binary detection automatically for recursive search to provide a better user experience (avoiding binary file noise), while the library defaults to maximum flexibility, letting you opt-in to the behavior you need.

### Default Behavior

```rust
use grep_searcher::SearcherBuilder;

// By default, no binary detection
let searcher = SearcherBuilder::new().build();
```

### Enabling Binary Detection

Use the `BinaryDetection` API to configure detection:

=== "Quit on NUL"

    Stop searching when a NUL byte is found (similar to implicit file behavior):

    ```rust
    use grep_searcher::{BinaryDetection, SearcherBuilder};

    let searcher = SearcherBuilder::new()
        .binary_detection(BinaryDetection::quit(b'\x00'))
        .build();
    ```

=== "Convert NUL"

    Replace NUL bytes with line terminators to continue searching:

    ```rust
    use grep_searcher::{BinaryDetection, SearcherBuilder};

    let searcher = SearcherBuilder::new()
        .binary_detection(BinaryDetection::convert(b'\x00'))
        .build();
    ```

    !!! warning "Buffered Search Only"
        The `convert` strategy only works with buffered search, not memory-mapped search.

=== "None (Default)"

    Disable binary detection entirely:

    ```rust
    use grep_searcher::{BinaryDetection, SearcherBuilder};

    let searcher = SearcherBuilder::new()
        .binary_detection(BinaryDetection::none())
        .build();
    ```

### API Methods

- **`BinaryDetection::none()`**: No binary detection (default for library)
- **`BinaryDetection::quit(byte)`**: Stop searching when `byte` is found
- **`BinaryDetection::convert(byte)`**: Replace `byte` with line terminator
