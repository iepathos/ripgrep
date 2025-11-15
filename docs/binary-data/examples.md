# Examples and Troubleshooting

> Part of the [Binary Data](./index.md) page

## Quick Reference

This table summarizes when binary detection triggers and what output you'll see:

| Scenario | File Type | Flag | Binary Detection? | Output |
|----------|-----------|------|-------------------|--------|
| Recursive search | Binary | (none) | Yes | Silent skip **(1)** |
| Recursive search | Binary | `--binary` | Yes | Shows WARNING **(2)** |
| Explicit file | Binary | (none) | Yes | Shows warning **(3)** |
| Any file | Any | `--text` | No | Raw output (may corrupt terminal) **(4)** |
| Large file (>64KB) | Binary | `--mmap` | Maybe | Only checks first 64KB + match regions **(5)** |
| Large file (>64KB) | Binary | `--no-mmap` | Yes | Checks all buffers **(6)** |
| stdin | Binary | (none) | Yes | Shows warning (treated as explicit) **(7)** |

1. **Default behavior**: Implicit binary files produce no output to avoid cluttering results
2. **`--binary` flag**: Enables warnings for implicit files to reveal what was skipped
3. **Explicit files**: Always searched and warned about, even without `--binary`
4. **`--text` flag**: Bypasses all binary detection - use with caution
5. **`--mmap` mode**: Fast but may miss binary content after the first 64KB buffer
6. **`--no-mmap` mode**: Slower but thorough - checks every 64KB chunk
7. **stdin handling**: Always treated as explicit input, so warnings are shown

## Binary Detection Decision Flow

```mermaid
flowchart TD
    A[File to search] --> B{"Explicit file<br/>or stdin?"}
    B -->|Yes| C{--text flag?}
    B -->|No<br/>Implicit| D{--binary flag?}

    C -->|Yes| E["Search as text<br/>Show all content"]
    C -->|No| F{Contains NUL byte?}

    D -->|Yes| F
    D -->|No| G{Contains NUL byte?}

    F -->|Yes| H["Show binary file matches<br/>or WARNING: stopped searching"]
    F -->|No| I["Search normally<br/>Show matches"]

    G -->|Yes| J["Silent skip<br/>No output"]
    G -->|No| I

    style E fill:#ffe6e6
    style H fill:#fff4e6
    style I fill:#e6ffe6
    style J fill:#f0f0f0
```

## Examples

### Implicit vs. Explicit File Handling

```mermaid
graph LR
    subgraph Implicit["Implicit Files (Recursive Search)"]
        I1[rg pattern] --> I2{Binary?}
        I2 -->|Yes| I3["Silent skip<br/>no output"]
        I2 -->|No| I4[Show matches]
    end

    subgraph ImplicitBinary["With --binary Flag"]
        IB1[rg --binary pattern] --> IB2{Binary?}
        IB2 -->|Yes| IB3[Show WARNING]
        IB2 -->|No| IB4[Show matches]
    end

    subgraph Explicit["Explicit Files"]
        E1[rg pattern file.bin] --> E2{Binary?}
        E2 -->|Yes| E3["Show warning<br/>binary file matches"]
        E2 -->|No| E4[Show matches]
    end

    style I3 fill:#f0f0f0
    style IB3 fill:#fff4e6
    style E3 fill:#fff4e6
    style I4 fill:#e6ffe6
    style IB4 fill:#e6ffe6
    style E4 fill:#e6ffe6
```

**Figure**: File handling behavior comparison. Implicit files are silently skipped unless `--binary` is used, while explicit files always show warnings when binary content is detected.

### Example 1: Default Behavior (Implicit Files)

```bash
# Recursive search - binary files are silently skipped
$ rg "config"
src/config.rs:10:pub struct Config {
```

!!! info "Source: tests/binary.rs:328"
    No output for `compiled.bin` because it's binary and implicit. This is the default behavior for recursive searches to avoid performance issues.

### Example 2: With `--binary` Flag

```bash
# Recursive search - binary files show warnings
$ rg --binary "config"
src/config.rs:10:pub struct Config {
compiled.bin: WARNING: stopped searching binary file after match (found "\0" byte around offset 1234)
```

!!! info "Source: tests/binary.rs:168, crates/printer/src/standard.rs:1401"
    The `--binary` flag enables warnings for implicit binary files. The warning format comes from the printer implementation.

### Example 3: Explicit File (Always Searched)

```bash
# Explicit file - shows binary warning
$ rg "signature" compiled.bin
binary file matches (found "\0" byte around offset 2048)  # (1)!
```

1. The offset indicates where the NUL byte was detected (byte 2048 in this case), helping you understand how much of the file was scanned before binary content was found.

!!! info "Source: tests/binary.rs:70, crates/printer/src/standard.rs:1412"
    Explicit files are always searched, even if binary. The offset value helps locate where binary content was detected.

### Example 4: Force Text Mode

```bash
# Search binary as text (may show garbage)
$ rg --text "signature" compiled.bin
[raw binary output, possibly terminal corruption]
```

!!! warning "Terminal Safety"
    The `--text` flag bypasses binary detection entirely. This can corrupt your terminal with control characters. Use with caution or pipe to `cat -v` to visualize control characters safely.

### Example 5: Memory Map vs. Buffered

=== "Memory-Mapped (--mmap)"
    ```bash
    # Only checks first 64KB + match regions
    $ rg --mmap "pattern" largefile.bin
    # Match near start of file: shown
    # Binary data after 64KB: might not be detected unless pattern matches
    ```

    **Detection scope**: First 64KB buffer + regions around pattern matches

    **Use when**: Performance is critical and binary content is near the start

=== "Buffered (--no-mmap)"
    ```bash
    # Thorough detection across entire file
    $ rg --no-mmap "pattern" largefile.bin
    # All buffers scanned for NUL bytes
    ```

    **Detection scope**: Every 64KB chunk throughout the file

    **Use when**: You need consistent binary detection across large files

!!! tip "Buffer Size and Detection Coverage"
    The default buffer capacity is 64KB (65536 bytes). Memory-mapped files only check the first buffer plus regions around matches, while buffered reading checks every 64KB chunk sequentially for more thorough binary detection.

    **Source**: crates/searcher/src/line_buffer.rs:6

### Example 6: stdin Input

```bash
# stdin is treated like explicit file
$ cat binary.bin | rg "pattern"
binary file matches (found "\0" byte around offset 512)
```

!!! info "Source: tests/misc.rs:803"
    stdin is always treated as an explicit file, so binary detection warnings are shown even without `--binary`.

## Troubleshooting

### "I expected a match but got a binary warning"

!!! question "Problem"
    The file contains a NUL byte and is being treated as binary.

!!! success "Solution"
    Use `--text` to force text mode:
    ```bash
    rg --text "pattern" file
    ```

### "My UTF-16 file isn't being searched"

!!! question "Problem"
    UTF-16 encoding uses NUL bytes, triggering binary detection.

!!! success "Solution"
    Use `--text` or convert the file to UTF-8 first:
    ```bash
    # Force text mode
    rg --text "pattern" utf16file.txt

    # Or use --encoding (if supported)
    rg --encoding utf-16le "pattern" utf16file.txt
    ```

### "Binary detection seems inconsistent with large files"

!!! question "Problem"
    Memory-mapped mode only checks the first 64KB + match regions.

!!! success "Solution"
    Use `--no-mmap` to force buffered reading:
    ```bash
    rg --no-mmap "pattern" largefile
    ```

    This ensures every 64KB buffer is checked for NUL bytes, providing consistent binary detection throughout the file.

### "Recursive search misses files that explicit search finds"

!!! question "Problem"
    Implicit files are silently skipped when binary, explicit files show warnings.

!!! success "Solution"
    Use `--binary` to see warnings for implicit files:
    ```bash
    rg --binary "pattern"
    ```

    This reveals which files were skipped due to binary content, helping you identify files that need explicit searching or `--text` mode.
