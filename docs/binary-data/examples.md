# Examples and Troubleshooting

> Part of the [Binary Data](./index.md) page

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
