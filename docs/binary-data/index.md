# Binary Data

Binary data handling is one of ripgrep's most important and nuanced features. Understanding how ripgrep detects and processes binary files is crucial for getting the results you expect, whether you're searching source code or working with mixed file types.

## Subsections

This page is organized into the following subpages:

- [Binary Detection](./detection.md) - Learn what binary detection is and why ripgrep uses NUL byte heuristics
- [Binary Modes](./modes.md) - Understand Auto, SearchAndSuppress, and AsText modes for handling binary files
- [Explicit vs Implicit Files](./explicit-implicit.md) - Learn the crucial distinction between explicit and implicit file searches
- [Binary Flags Reference](./flags.md) - Complete reference for `--binary`, `--text`, and related flags
- [Examples and Troubleshooting](./examples.md) - Practical examples and solutions to common binary data issues

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

## Related Topics

- **[File Encoding](../file-encoding.md)**: Understanding how ripgrep handles different text encodings, which can interact with binary detection
- **[Manual Filtering: File Types](../manual-filtering-types.md)**: Controlling which file types are searched, complementing binary detection
- **[Compressed Files](../compressed-files.md)**: Using `--search-zip` to search inside compressed archives (which are binary but may contain text)
