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

## Hyperlink Formats

ripgrep supports custom hyperlink formats using a template syntax:

```bash
# Default format (file path only)
rg --hyperlink-format default pattern

# Custom format with line number
rg --hyperlink-format 'file://{path}:{line}' pattern

# VS Code integration
rg --hyperlink-format 'vscode://file/{path}:{line}:{column}' pattern
```

## Format Variables

Available variables for hyperlink templates:

- `{path}`: Absolute or relative file path
- `{line}`: Line number of the match
- `{column}`: Column number of the match

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
rg --hyperlink-format 'file://{path}' pattern
```

### Editor Schemes

Open files directly in specific editors:

```bash
# VS Code
rg --hyperlink-format 'vscode://file/{path}:{line}:{column}' pattern

# IntelliJ/PyCharm/WebStorm
rg --hyperlink-format 'idea://open?file={path}&line={line}' pattern

# Sublime Text
rg --hyperlink-format 'subl://open?url=file://{path}&line={line}' pattern

# Atom
rg --hyperlink-format 'atom://open/?path={path}&line={line}' pattern
```

## Configuration

Set up hyperlinks globally via your ripgrep config file:

```bash
# ~/.ripgreprc or $RIPGREP_CONFIG_PATH
--hyperlink-format=vscode://file/{path}:{line}:{column}
```

## Examples

### Example 1: VS Code Integration

```bash
# Search with VS Code hyperlinks
rg --hyperlink-format 'vscode://file/{path}:{line}:{column}' TODO
```

Click on any result to open the file at the exact line in VS Code.

### Example 2: File System Links

```bash
# Open files in default application
rg --hyperlink-format 'file://{path}' pattern
```

### Example 3: Custom Editor Integration

```bash
# Neovim remote integration
rg --hyperlink-format 'nvim://edit/{path}:+{line}' pattern
```

### Example 4: Web-based Code Viewer

```bash
# Link to GitHub blob view (requires full URL construction in shell)
rg pattern | while read line; do
  # Custom processing to generate GitHub URLs
done
```

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

### Conditional Hyperlinks

Only use hyperlinks when output is to terminal:

```bash
# In shell script
if [ -t 1 ]; then
  rg --hyperlink-format 'vscode://file/{path}:{line}:{column}' pattern
else
  rg pattern
fi
```

### Custom Link Processing

Process hyperlinks with other tools:

```bash
# Extract paths from hyperlinks
rg --hyperlink-format 'file://{path}' pattern | sed 's/.*file:\/\/\([^[:space:]]*\).*/\1/'
```

## Security Considerations

- Be cautious with hyperlink formats from untrusted sources
- Validate URL schemes before registering handlers
- Some terminals may execute arbitrary commands via URL schemes
- Consider disabling hyperlinks in security-sensitive environments

## See Also

- [Output Formats](output-formats.md) - Other output customization options
- [Configuration File](configuration-file.md) - Setting up persistent configuration
- [Common Options](common-options.md) - Other frequently used flags
