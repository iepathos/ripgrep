# Troubleshooting

This chapter helps you diagnose and solve common problems when using ripgrep. Most issues can be resolved by understanding ripgrep's filtering behavior and using the `--debug` flag to see what's happening behind the scenes.

## Quick Troubleshooting Checklist

If you're experiencing unexpected behavior, try these steps in order:

1. **Run with `--files`** to see which files would be searched (without actually searching)
2. **Run with `--debug`** to see what files are being searched and why others are skipped
3. **Try `-uuu`** (unrestricted search) to temporarily disable all filtering
4. **Use `-F`** to search for literal text instead of a regex pattern
5. **Try `-i`** to make the search case-insensitive
6. **Check `--stats`** to see how many files were searched and matches found
7. **Review the FAQ** and GUIDE for common issues

## Navigation

This troubleshooting guide is organized into several focused sections:

- **[Debug Flags](./debug-flags.md)** - Understanding `--debug`, `--trace`, and `--stats` flags
- **[No Results Found](./no-results.md)** - Diagnosing why you're getting no search results
- **[Performance Issues](./performance.md)** - Optimizing ripgrep search speed
- **[Common Error Messages](./errors.md)** - Understanding and fixing error messages
- **[Binary and Encoding Problems](./binary-encoding.md)** - Handling binary files and encoding issues
- **[When to File a Bug](./bug-reports.md)** - Preparing good bug reports and getting help

## Related Resources

- **FAQ**: Common questions and answers - [FAQ.md](../FAQ.md)
- **User Guide**: Comprehensive documentation - [GUIDE.md](../GUIDE.md)
- **Configuration**: See the [configuration file chapter](../configuration-file.md) for persistent settings
- **File Encoding**: See the [file encoding chapter](../file-encoding.md) for encoding details
