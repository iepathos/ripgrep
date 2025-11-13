# File Filtering

> Part of the [Common Options](./index.md) page

These flags control which files are searched.

## File Type Filtering

- **`-t, --type TYPE`**: Only search files of this type
  ```bash
  # Search only Rust files
  rg -trust pattern

  # Search Python and JavaScript files
  rg -tpy -tjs pattern
  ```

- **`-T, --type-not TYPE`**: Exclude files of this type
  ```bash
  # Search everything except log files
  rg -Tlog pattern
  ```

- **`--type-list`**: Show all supported file types
  ```bash
  rg --type-list
  ```

Ripgrep knows about common file extensions for popular languages and formats. You can also define custom types in your [configuration file](../configuration-file.md).

## Glob Patterns

- **`-g, --glob PATTERN`**: Include/exclude files matching glob pattern
  ```bash
  # Only search .rs files
  rg -g '*.rs' pattern

  # Search .py files in src/ directory tree
  rg -g 'src/**/*.py' pattern

  # Exclude minified JavaScript
  rg -g '!*.min.js' pattern

  # Combine multiple globs
  rg -g '*.{rs,toml}' pattern
  ```
  Use `!` prefix to exclude. Globs use `*` for any chars and `**` for directory recursion.

- **`--iglob PATTERN`**: Like `--glob` but case-insensitive

## Unrestricted Search

The `-u` flag progressively removes ripgrep's smart filtering. Each `-u` adds more:

- **`-u`**: Don't respect `.gitignore` and other ignore files
  ```bash
  # Search ignored files like those in .gitignore
  rg -u pattern
  ```

- **`-uu`**: Also search hidden files and binary files
  ```bash
  # Search everything including hidden and binary files
  rg -uu pattern
  ```

- **`-uuu`**: Disable all filtering (ignore files, hidden files, and binary detection)
  ```bash
  # The kitchen sink - search absolutely everything
  rg -uuu pattern
  ```
  This is the most permissive mode, combining all unrestricted behaviors: searches ignored files (`.gitignore`), hidden files (`.dotfiles`), and doesn't skip binary files.

Use `-u` when you need to search `.gitignore`d files, `-uu` when you also need hidden/binary files, and `-uuu` for maximum coverage.

## Hidden Files and Symlinks

- **`--hidden`**: Search hidden files and directories (those starting with `.`)
  ```bash
  # Search .config files
  rg --hidden 'database'
  ```
  By default, hidden files are skipped.

- **`-L, --follow`**: Follow symbolic links
  ```bash
  rg -L pattern
  ```
  By default, symlinks are not followed (to avoid cycles and duplication).

## Directory Depth

- **`-d, --max-depth NUM`**: Limit directory recursion depth
  ```bash
  # Search only current directory (no subdirectories)
  rg -d 1 pattern

  # Descend at most 3 levels
  rg -d 3 pattern
  ```

## File Size Limits

- **`--max-filesize NUM+SUFFIX`**: Ignore files larger than this size
  ```bash
  # Skip files larger than 100KB
  rg --max-filesize 100K pattern

  # Skip files larger than 5MB
  rg --max-filesize 5M pattern
  ```
  Suffixes: `K` (kilobytes), `M` (megabytes), `G` (gigabytes).

## Binary Files

By default, ripgrep auto-detects binary files (by finding NUL bytes) and skips them to avoid polluting output.

- **`--binary`**: Force searching binary files (shows matches even if NUL bytes detected)
  ```bash
  # Search binary files for strings
  rg --binary 'pattern'
  ```

- **`-a, --text`**: Treat all files as text, disabling binary detection
  ```bash
  # Search everything as text
  rg -a pattern
  ```

- **`--max-columns-preview NUM`**: Tune binary detection threshold
  ```bash
  # Files with lines longer than 200 chars are considered binary
  rg --max-columns-preview 200 pattern
  ```
  Default is 150. Ripgrep checks the first preview bytes for NUL characters.

## Advanced Filtering

- **`--same-file-system`**: Don't cross filesystem boundaries when searching
  ```bash
  # Stay on same filesystem (avoid mounted drives, network shares)
  rg --same-file-system pattern
  ```
  Useful to avoid searching network mounts or external drives.

- **`--no-ignore-parent`**: Don't respect ignore files in parent directories
  ```bash
  # Only use .gitignore in current directory, not parents
  rg --no-ignore-parent pattern
  ```
  By default, ripgrep traverses up and respects `.gitignore`/`.ignore` files in parent directories.

- **`--path-separator SEPARATOR`**: Use custom path separator in output
  ```bash
  # Use forward slashes on Windows for Unix-style paths
  rg --path-separator / pattern
  ```
  Useful for cross-platform scripts and consistent output formatting.
