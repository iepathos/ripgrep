# Manual Filtering: Globs

Glob patterns provide powerful manual control over which files ripgrep searches. The `-g/--glob` flag lets you include or exclude files using familiar wildcard syntax, always overriding automatic ignore logic from `.gitignore` and other sources.

While [automatic filtering](automatic-filtering.md) handles most common cases, glob patterns give you precise control when you need it. They're especially useful for one-off searches where you want to specify exactly which files to search or skip.

## Quick Reference

| Wildcard | Matches | Example | Description |
|----------|---------|---------|-------------|
| `*` | Zero or more chars (not `/`) | `*.rs` | All Rust files |
| `?` | Exactly one char (not `/`) | `file?.txt` | file1.txt, fileA.txt |
| `[...]` | One char from set | `[a-z]*` | Files starting with lowercase |
| `{a,b}` | Either alternative | `*.{rs,toml}` | Rust or TOML files |
| `**` | Zero or more directories | `foo/**` | All files under foo/ |
| `!` | Negation (exclude) | `!test*.rs` | Exclude test files |

!!! tip "Case-insensitive matching"
    Use `--iglob` for single case-insensitive patterns, or `--glob-case-insensitive` to make all globs case-insensitive.

## Basic Glob Syntax

Glob patterns use several standard wildcards:

- `*` - Matches zero or more characters (except `/`)
- `?` - Matches exactly one character (except `/`)
- `[ab]` - Matches one character from the set (a or b)
- `{a,b}` - Matches either alternative (a or b)

### Wildcard Examples

Match all Rust files:
```bash
rg -g '*.rs' 'fn main'
```

Match files with single character before extension:
```bash
rg -g 'file?.txt' pattern
```

Match files starting with lowercase letters:
```bash
rg -g '[a-z]*' pattern
```

Match either Rust or TOML files:
```bash
rg -g '*.{rs,toml}' pattern
```

## Character Classes

Character classes `[...]` provide flexible character matching:

- `[ab]` - Matches `a` or `b`
- `[!ab]` - Matches any character except `a` or `b`
- `[a-z]` - Matches any character in the range (lowercase letters)
- `[0-9]` - Matches any digit

Examples:
```bash
# Match files starting with digits
rg -g '[0-9]*' pattern

# Match files NOT starting with dots (hidden files)
rg -g '[!.]*' pattern

# Match files with alphanumeric names
rg -g '[a-zA-Z0-9]*' pattern
```

## Recursive Matching with `**`

The `**` wildcard matches zero or more directories, enabling recursive searches:

```bash
# Match foo in any directory
rg -g '**/foo' pattern

# Match all files under foo/
rg -g 'foo/**' pattern

# Match bar in any subdirectory of foo/
rg -g 'foo/**/bar' pattern
```

### Common Pitfall: Directory Matching

A frequent mistake is using `-g foo` to search directory `foo`. This glob matches files named exactly `foo`, not files inside the directory:

```bash
# ❌ Wrong: doesn't match foo/bar.rs
rg -g 'foo' pattern

# ✅ Correct: matches all files under foo/
rg -g 'foo/**' pattern
```

Always use `foo/**` to match files within a directory.

## Including and Excluding Files

By default, glob patterns include files. Prefix a glob with `!` to exclude files that match:

```bash
# Search all Rust files except tests
rg -g '*.rs' -g '!test*.rs' pattern

# Search src/ but exclude generated code
rg -g 'src/**' -g '!**/generated/**' pattern
```

### Precedence Rules

When multiple globs are specified, later patterns take precedence over earlier ones:

```bash
# Include all .rs files, then exclude test files
rg -g '*.rs' -g '!**/tests/**' pattern

# Exclude tests, but re-include integration tests
rg -g '!**/tests/**' -g '**/tests/integration/**' pattern
```

This allows building complex filters by layering include and exclude patterns.

## Multiple Glob Patterns

The `-g/--glob` flag can be used multiple times. Each pattern applies independently, and a file is searched if any include pattern matches and no exclude pattern matches:

```bash
# Search both Rust and Python files
rg -g '*.rs' -g '*.py' pattern

# Search source files but exclude tests and examples
rg -g 'src/**' -g '!**/tests/**' -g '!**/examples/**' pattern
```

Think of multiple `-g` flags as building up a filter set that refines which files to search.

## Brace Expansion

Ripgrep extends standard glob syntax with brace expansion for alternatives:

```bash
# Match either Rust or TOML files
rg -g '*.{rs,toml}' pattern

# Match multiple source directories
rg -g '{src,lib,bin}/**/*.rs' pattern

# Match multiple file patterns
rg -g '{Cargo.toml,Cargo.lock,*.rs}' pattern
```

**Note:** Empty alternatives like `{,c}` are not currently supported (as of ripgrep 14.1+). Brace expansion is a ripgrep extension beyond standard `.gitignore` syntax.

## Case-Insensitive Globs

Two flags control case sensitivity for glob matching:

- `--iglob GLOB` - Single case-insensitive glob pattern
- `--glob-case-insensitive` - Makes all `-g` patterns case-insensitive
- `--no-glob-case-insensitive` - Restores case-sensitive matching (negates `--glob-case-insensitive`)

Examples:
```bash
# Match .html, .HTML, .Html, etc.
rg --iglob '*.html' pattern

# Make all globs case-insensitive
rg --glob-case-insensitive -g '*.rs' -g '*.toml' pattern

# Restore case-sensitive matching after earlier use of --glob-case-insensitive
rg --glob-case-insensitive -g '*.html' --no-glob-case-insensitive -g '*.RS' pattern
```

Use `--iglob` when you need one case-insensitive pattern, or `--glob-case-insensitive` when all your patterns should ignore case. Use `--no-glob-case-insensitive` to selectively restore case-sensitive matching.

## Gitignore Compatibility

Glob patterns use the same syntax as `.gitignore` files, making them familiar if you already use Git:

- Patterns match file paths relative to the search root
- `*` doesn't match directory separators
- `**` matches zero or more directories
- `!` prefix for negation

This compatibility means you can often copy patterns from `.gitignore` files directly into `-g` flags.

## Escaping Metacharacters

To match special characters literally, use character class notation:

```bash
# Match files with literal asterisk in name
rg -g '*[*]*' pattern

# Match files with literal question mark
rg -g '*[?]*' pattern
```

**Note:** Backslash escaping behavior is platform-dependent. Character classes provide reliable cross-platform escaping.

## Glob Override Behavior

**Important:** Glob patterns always override automatic filtering from `.gitignore`, `.ignore`, and other sources. When you use `-g`, you're taking explicit control:

```bash
# Search all .rs files, even if .gitignore excludes them
rg -g '*.rs' pattern

# Search ignored directories
rg -g 'target/**/*.rs' pattern
```

This override behavior gives you ultimate control when automatic filtering is too restrictive.

### Ignore Hierarchy and Precedence

Glob patterns with `-g/--glob` are "override patterns" that sit at the top of ripgrep's ignore hierarchy. The complete precedence order (highest to lowest priority) is:

1. **Override patterns** - `--include`/`--exclude` (not currently implemented) and `-g/--glob` patterns
2. **Custom ignore files** - Files specified with `--ignore-file`
3. **`.ignore` files** - Repository-specific ignore rules
4. **`.gitignore` files** - Git ignore rules
5. **`.git/info/exclude`** - Git local excludes
6. **Global gitignore** - User's global Git ignore file
7. **Explicit ignore files** - Other repository ignore configurations
8. **Hidden file detection** - Automatic filtering of dotfiles

When you use `-g`, your patterns take precedence over all automatic ignore sources, which is why globs can force ripgrep to search files that would normally be excluded.

## Practical Examples

### Search Only Rust Files
```bash
rg -g '*.rs' 'use std'
```

### Search All Files in src/
```bash
rg -g 'src/**' 'TODO'
```

### Exclude Test Directories
```bash
# Exclude both common test directory naming conventions
rg -g '!**/test/**' -g '!**/tests/**' pattern
```

### Combine Multiple Patterns
```bash
# Search Rust and TOML in src/, excluding tests
rg -g 'src/**/*.{rs,toml}' -g '!**/tests/**' pattern
```

### Search Configuration Files
```bash
rg -g '*.{toml,json,yaml,yml}' 'database'
```

### Search Only Migration Files
```bash
rg -g '**/migrations/**/*.sql' 'CREATE TABLE'
```

## Comparison: Globs vs Type Filters

Globs provide more flexibility than type filters (`-t`), but type filters are more concise for common cases:

| Goal | Type Filter | Glob Pattern |
|------|-------------|--------------|
| Search Rust files | `-t rust` | `-g '*.rs'` |
| Search multiple types | `-t rust -t python` | `-g '*.{rs,py}'` |
| Search specific directory | N/A | `-g 'src/**'` |
| Exclude pattern | `-T rust` | `-g '!*.rs'` |
| Complex filtering | N/A | `-g 'src/**/*.rs' -g '!**/tests/**'` |

Use type filters when searching by file type. Use globs when you need path-based filtering or complex include/exclude logic.

## Preview Files with --files

Before running a search, preview which files match your globs using `--files`:

```bash
# See which files would be searched
rg --files -g '*.rs' -g '!**/tests/**'
```

This helps verify your glob patterns match the files you expect.

## Performance Considerations

Glob patterns are evaluated for every file in the search tree. More specific patterns perform better than broad ones:

```bash
# ✅ Specific pattern (faster)
rg -g 'src/**/*.rs' pattern

# ❌ Broad pattern requiring more exclusions (slower)
rg -g '**/*.rs' -g '!target/**' -g '!.git/**' -g '!vendor/**' pattern
```

When possible, use include patterns that target specific directories rather than exclude patterns that filter out large portions of the file tree.

### Advanced: Glob Optimization

Ripgrep automatically optimizes glob patterns into specialized matching strategies for better performance. The optimizer analyzes each pattern and selects the most efficient matching approach from these strategies:

```rust
// Source: crates/globset/src/glob.rs:16-47
enum MatchStrategy {
    Literal(String),           // Exact path match
    BasenameLiteral(String),   // Exact filename match
    Extension(String),         // Extension-only match
    Prefix(String),            // Path prefix match
    Suffix { suffix, component }, // Path suffix match
    RequiredExtension(String), // Extension + regex
    Regex,                     // Full regex evaluation
}
```

Simple patterns like `*.rs` are converted to faster `Extension` matching rather than full regex evaluation. Complex patterns with `**`, `?`, or `[...]` require `Regex` matching, which is more expensive.

!!! tip "Performance optimization"
    Prefer simple extension-based patterns (`*.rs`) over complex path patterns when possible. The optimizer handles this automatically, but understanding these strategies can help you write more efficient globs.

## Summary

Glob patterns give you precise control over which files ripgrep searches:

- Use `-g/--glob` for manual file filtering
- Globs override all automatic ignore logic
- Support standard wildcards: `*`, `?`, `[...]`, `{a,b}`
- Use `**` for recursive directory matching
- Prefix with `!` to exclude files
- Later patterns take precedence over earlier ones
- Compatible with `.gitignore` syntax

For most searches, [automatic filtering](automatic-filtering.md) handles file selection. Use globs when you need explicit control over which files to search or skip.
