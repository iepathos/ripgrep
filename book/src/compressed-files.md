# Compressed Files

ripgrep provides built-in support for searching compressed files through the `-z/--search-zip` flag, automatically decompressing content on-the-fly without requiring manual extraction.

## Overview

The `-z` or `--search-zip` flag enables ripgrep to transparently search inside compressed files across seven different compression formats. When enabled, ripgrep automatically detects the compression format based on file extension and decompresses the content during search.

This feature differs from the custom `--pre` preprocessor in that it's built directly into ripgrep for better performance and requires no external tools or scripts.

## Supported Compression Formats

ripgrep's `-z` flag supports the following compression formats:

| Format | Extensions | Description |
|--------|-----------|-------------|
| **Brotli** | `.br` | Modern compression algorithm with high compression ratios |
| **Bzip2** | `.bz2`, `.tbz2` | Block-sorting compression, good for text |
| **Gzip** | `.gz`, `.tgz` | Widely used compression, fast decompression |
| **LZ4** | `.lz4` | Extremely fast compression and decompression |
| **LZMA** | `.lzma` | High compression ratio, slower than others |
| **XZ** | `.xz` | LZMA-based with additional features |
| **Zstandard** | `.zst` | Modern algorithm balancing speed and compression ratio |

## Basic Usage

### Searching Compressed Files

Enable compressed file search with the `-z` flag:

```bash
# Search all files including compressed ones
rg -z 'pattern'

# Long form
rg --search-zip 'pattern'
```

### Examples

Search log files compressed with gzip:

```bash
rg -z 'error' logs/
```

Search through compressed source code archives:

```bash
rg -z 'function calculateTotal' release.tar.gz
```

Find patterns in bzip2-compressed data:

```bash
rg -z 'TODO' backup.tar.bz2
```

## How It Works

### Automatic Format Detection

ripgrep detects the compression format based on file extension:

1. Checks file extension against known compression formats
2. Selects appropriate decompression algorithm
3. Spawns decompression process
4. Searches decompressed content stream
5. Reports matches with original compressed filename

### Out-of-Process Decompression

Decompression happens in separate processes to:
- Isolate decompression failures
- Enable parallel decompression across files
- Maintain ripgrep's performance characteristics
- Handle corrupted archives gracefully

## Combining with Other Flags

### With File Type Filtering

Combine compression support with file type filtering:

```bash
# Search only Rust files in compressed archives
rg -z -t rust 'pattern'

# Search Python files in gzipped logs
rg -z -t py 'import' logs.tar.gz
```

### With Context Lines

Add context around matches in compressed files:

```bash
# Show 3 lines of context in compressed logs
rg -z -C 3 'ERROR' logs.gz
```

### With Output Formatting

Use JSON output for compressed file matches:

```bash
# JSON output for scripting
rg -z --json 'pattern' archive.tar.xz
```

## Performance Considerations

### Decompression Overhead

- Each compressed file requires spawning a decompression process
- Decompression adds CPU overhead compared to plain text search
- Parallel processing helps amortize decompression costs

### Optimization Tips

1. **Use file type filtering** to avoid decompressing unnecessary files
2. **Limit search scope** with glob patterns or directory restrictions
3. **Consider extracting** archives if searching repeatedly
4. **Use faster formats** like LZ4 or Zstandard when possible

### Benchmarking

Compare search performance with and without compression:

```bash
# Compressed search
time rg -z 'pattern' archive.tar.gz

# Extracted search (for comparison)
tar xzf archive.tar.gz
time rg 'pattern' extracted/
```

## Comparison with Preprocessor

ripgrep offers two ways to handle special file formats:

| Feature | `-z/--search-zip` | `--pre` |
|---------|-------------------|---------|
| **Setup** | Built-in, no configuration | Requires custom script |
| **Performance** | Optimized, no process spawning overhead | Process per file |
| **Formats** | 7 compression formats only | Any format with conversion tool |
| **Flexibility** | Fixed format support | Unlimited extensibility |
| **Use case** | Standard compressed files | Custom formats (PDF, Office, etc.) |

### When to Use Each

**Use `-z/--search-zip` for:**
- Standard compressed archives (`.gz`, `.xz`, `.zst`, etc.)
- Best performance with built-in formats
- No external dependencies

**Use `--pre` for:**
- Custom file formats (PDF, Word documents, etc.)
- Encryption/decryption workflows
- Format conversions not supported by `-z`

### Combining Both

You can use both flags together:

```bash
# Search compressed PDFs with custom preprocessor
rg -z --pre ./pdf-preprocessor --pre-glob '*.pdf' 'pattern'
```

## Examples

### Example 1: Searching Compressed Logs

```bash
# Find errors in rotated gzip logs
rg -z 'ERROR|FATAL' /var/log/*.gz
```

### Example 2: Searching Tarballs

```bash
# Search through compressed source archives
rg -z 'vulnerability' releases/*.tar.xz
```

### Example 3: Multiple Compression Formats

```bash
# Search across different compression formats
rg -z 'config' backups/
```

### Example 4: With File Type and Context

```bash
# Search Rust code in compressed archives with context
rg -z -t rust -C 5 'unsafe' archive.tar.gz
```

## Troubleshooting

### Compressed File Not Searched

**Issue**: Compressed file is skipped

**Solutions**:
- Verify file has correct extension (`.gz`, `.xz`, etc.)
- Check that `-z` flag is enabled
- Ensure file is actually compressed (use `file` command)

### Decompression Errors

**Issue**: Errors about decompression failures

**Solutions**:
- Verify archive is not corrupted
- Check that compression format matches extension
- Try decompressing manually to validate

### Performance Issues

**Issue**: Search is very slow with `-z`

**Solutions**:
- Use file type filtering to reduce decompressed files
- Consider extracting archives for repeated searches
- Check if archives are unusually large

## Best Practices

- Enable `-z` only when searching compressed files
- Use file type filtering to avoid unnecessary decompression
- Consider extraction for archives searched repeatedly
- Combine with glob patterns to target specific compressed files
- Monitor decompression overhead with `--stats` flag

## See Also

- [Preprocessor](preprocessor.md) - Custom file preprocessing for other formats
- [Performance](performance.md) - Performance tuning and optimization
- [Common Options](common-options.md) - Other frequently used flags
