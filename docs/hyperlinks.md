# Hyperlinks

Modern terminals support clickable hyperlinks through OSC 8 escape sequences. ripgrep can generate these hyperlinks for search results, making it easy to jump directly to matches in your editor.

## Overview

Hyperlink support allows terminal emulators to display clickable file paths that open directly in your preferred editor or application. This is particularly useful when:
- Reviewing search results interactively
- Working in a terminal-heavy workflow
- Quickly navigating between files
- Integrating with IDE-like terminal experiences

## Enabling Hyperlinks

Use the `--hyperlink-format` flag to enable hyperlink generation:

```bash
# Basic hyperlink format
rg --hyperlink-format default pattern
```

## Built-in Aliases

Instead of writing full hyperlink format strings, ripgrep provides convenient built-in aliases for common editors and schemes:

<!-- Source: crates/printer/src/hyperlink/aliases.rs:6-68 -->

| Alias | Expands to |
|-------|-----------|
| `default` | Platform-aware file:// scheme (see below) |
| `file` | `file://{host}{path}` |
| `vscode` | `vscode://file/{path}:{line}:{column}` |
| `vscode-insiders` | `vscode-insiders://file/{path}:{line}:{column}` |
| `vscodium` | `vscodium://file/{path}:{line}:{column}` |
| `cursor` | `cursor://file/{path}:{line}:{column}` |
| `macvim` | `mvim://open?url=file://{path}&line={line}&column={column}` |
| `textmate` | `txmt://open?url=file://{path}&line={line}&column={column}` |
| `kitty` | `file://{host}{path}#{line}` |
| `grep+` | `grep+://{path}:{line}` |
| `none` | Explicitly disable hyperlinks |

**The `default` alias** is platform-aware and expands differently per platform:
- Unix/Linux/macOS: `file://{host}{path}` (includes hostname)
- Windows: `file://{path}` (omits hostname for compatibility)

The default alias follows RFC 8089 file:// URI specification and is the recommended choice for general use.

**Note:** The `file` alias differs from `default` by always including the hostname, even on Windows. Use `default` for cross-platform compatibility.

**The `none` alias** can be used to explicitly disable hyperlinks, which is useful for overriding config file settings:

```bash
# Disable hyperlinks even if config file sets them
rg --hyperlink-format none pattern
```

## Hyperlink Formats

You can use built-in aliases or create custom hyperlink formats using a template syntax:

```bash
# Using a built-in alias
rg --hyperlink-format vscode pattern

# Using default platform-aware format
rg --hyperlink-format default pattern

# Custom format with line number
rg --hyperlink-format 'file://{path}:{line}' pattern
```

## Format Variables

Available variables for hyperlink templates:

- `{path}`: Absolute or relative file path
- `{line}`: Line number of the match
- `{column}`: Column number of the match
- `{host}`: Machine hostname (automatically populated by ripgrep from your system hostname)
- `{wslprefix}`: WSL distro prefix like `wsl$/Ubuntu` (Windows only, automatically set from the `WSL_DISTRO_NAME` environment variable when running in WSL)

The `{host}` variable is useful for network file shares or remote development environments. The `{wslprefix}` variable enables proper file:// URLs when working in Windows Subsystem for Linux by automatically detecting the WSL distro name.

## Terminal Support

Not all terminals support OSC 8 hyperlinks. Compatible terminals include:

### Well Supported
- **iTerm2** (macOS): Full support
- **Windows Terminal**: Full support
- **WezTerm**: Full support
- **Hyper**: Full support
- **Kitty**: Full support

### Partial Support
- **GNOME Terminal**: Supported in recent versions
- **Konsole**: Supported in recent versions
- **Alacritty**: Support in progress

### Not Supported
- **Traditional Terminal.app** (macOS): No support
- **Basic xterm**: No support
- **Most older terminal emulators**: No support

## URL Schemes

Different URL schemes enable different behaviors:

### File Scheme

Open files in default application:

```bash
# Using the built-in 'file' alias
rg --hyperlink-format file pattern

# Equivalent custom format
rg --hyperlink-format 'file://{path}' pattern
```

### Editor Schemes

Open files directly in specific editors using built-in aliases:

```bash
# VS Code
rg --hyperlink-format vscode pattern

# VS Code Insiders
rg --hyperlink-format vscode-insiders pattern

# VSCodium
rg --hyperlink-format vscodium pattern

# Cursor
rg --hyperlink-format cursor pattern

# MacVim
rg --hyperlink-format macvim pattern

# TextMate
rg --hyperlink-format textmate pattern

# Kitty terminal editor integration
rg --hyperlink-format kitty pattern

# grep+ macOS application
rg --hyperlink-format grep+ pattern
```

### Custom Editor Integration

For editors not included in the built-in aliases, you can create custom hyperlink formats:

**WARNING:** These are community-suggested formats and may require custom URL scheme handlers to be registered with your OS. They are not built into ripgrep or guaranteed to work.

```bash
# IntelliJ/PyCharm/WebStorm (community format)
rg --hyperlink-format 'idea://open?file={path}&line={line}' pattern

# Sublime Text (community format)
rg --hyperlink-format 'subl://open?url=file://{path}&line={line}' pattern

# Neovim remote (community format)
rg --hyperlink-format 'nvim://edit/{path}:+{line}' pattern
```

Note: Custom editor formats may require additional URL scheme registration with your operating system.

## Configuration

Set up hyperlinks globally via your ripgrep config file:

```bash
# ~/.ripgreprc or $RIPGREP_CONFIG_PATH

# Using a built-in alias (recommended)
--hyperlink-format=vscode

# Or using a custom format
--hyperlink-format=vscode://file/{path}:{line}:{column}
```

## Examples

### Example 1: VS Code Integration with Built-in Alias

```bash
# Search with VS Code hyperlinks (using built-in alias)
rg --hyperlink-format vscode TODO
```

Click on any result to open the file at the exact line in VS Code. This is equivalent to the full format `vscode://file/{path}:{line}:{column}` but more concise.

### Example 2: Using the Default Platform-Aware Format

```bash
# Use default format (includes hostname on Unix, omits on Windows)
rg --hyperlink-format default pattern
```

On Unix/Linux/macOS, this expands to `file://{host}{path}`. On Windows, it expands to `file://{path}`.

### Example 3: Kitty Terminal Editor Integration

```bash
# Open results using kitty's file:// handler (with line number fragment)
rg --hyperlink-format kitty pattern
```

### Example 4: Disabling Hyperlinks

```bash
# Explicitly disable hyperlinks (useful to override config file)
rg --hyperlink-format none pattern
```

### Example 5: Custom Editor Integration

```bash
# Neovim remote integration (custom format)
rg --hyperlink-format 'nvim://edit/{path}:+{line}' pattern
```

Note: Custom formats require URL scheme registration with your operating system.

## Best Practices

- Test hyperlinks in your terminal before relying on them
- Configure your terminal to handle custom URL schemes
- Use absolute paths for hyperlinks when working with remote files
- Include line and column numbers for precise navigation
- Set up config file for consistent hyperlink behavior
- Verify URL scheme registration for your editor

## Troubleshooting

### Hyperlinks Not Clickable

Possible causes:
1. Terminal doesn't support OSC 8 sequences
2. Hyperlink format is invalid
3. URL scheme not registered with OS
4. Terminal hyperlink feature disabled

Solutions:
```bash
# Test if terminal supports hyperlinks
printf '\e]8;;http://example.com\e\\This is a link\e]8;;\e\\\n'

# Check ripgrep version (hyperlinks require recent version)
rg --version

# Verify URL scheme registration
# macOS: Check in /System/Library/CoreServices/SystemVersion.plist
# Linux: Check .desktop files in ~/.local/share/applications/
```

### Wrong Application Opens

The URL scheme might be registered to a different application:

```bash
# macOS: Check default handler
defaults read ~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist

# Linux: Update default application
xdg-mime default code.desktop x-scheme-handler/vscode
```

### Path Resolution Issues

Use absolute paths to avoid ambiguity:

```bash
# Use absolute paths in hyperlinks
rg --hyperlink-format 'file://{path}' pattern "$(pwd)"
```

## Advanced Usage

### Escaping Special Characters

To include literal braces in your hyperlink format, use double braces:

```bash
# Include literal { and } characters in format
rg --hyperlink-format 'myscheme://{{literal}}/{path}' pattern

# This expands to: myscheme://{literal}/path/to/file
```

Use `{{` for a literal `{` and `}}` for a literal `}`.

### Format Validation Requirements

Hyperlink formats must meet these validation constraints:

- Must contain at least a `{path}` variable
- If `{column}` is used, `{line}` must also be present
- Format must start with a valid URL scheme (alphanumeric characters, `+`, `-`, or `.`)

!!! warning "Invalid Format Examples"
    ```bash
    # Invalid: Missing {path}
    rg --hyperlink-format 'file://{line}' pattern

    # Invalid: {column} without {line}
    rg --hyperlink-format 'file://{path}:{column}' pattern

    # Invalid: No URL scheme
    rg --hyperlink-format '{path}:{line}' pattern
    ```

### Conditional Hyperlinks

Only use hyperlinks when output is to terminal:

```bash
# In shell script
if [ -t 1 ]; then
  rg --hyperlink-format vscode pattern
else
  rg pattern
fi
```

### Custom Link Processing

Process hyperlinks with other tools:

```bash
# Extract paths from hyperlinks
rg --hyperlink-format file pattern | sed 's/.*file:\/\/\([^[:space:]]*\).*/\1/'
```

## Security Considerations

- Be cautious with hyperlink formats from untrusted sources
- Validate URL schemes before registering handlers
- Some terminals may execute arbitrary commands via URL schemes
- Consider disabling hyperlinks in security-sensitive environments

## See Also

- [Output Formats](output-formats.md) - Other output customization options
- [Configuration File](configuration-file.md) - Setting up persistent configuration
- [Common Options](common-options/output-formatting.md) - Output formatting options
