# RIPGREP CLI IMPLEMENTATION ANALYSIS

## Overview
Ripgrep contains 104 command-line flags organized into 7 categories. These control search modes, output formats, file filtering, and various behavioral options.

## Search Modes (from lowargs.rs enum SearchMode)

### Primary Search Modes
1. **Standard** - Default mode: searches files and prints matching lines
   - Activated by default (no specific flag required)
   - Can be reverted with --no-* flags

2. **FilesWithMatches** (-l/--files-with-matches) 
   - Show only paths of files containing at least one match
   - Useful for building lists of affected files

3. **FilesWithoutMatch** (-f/--files-without-match)
   - Show only paths of files with zero matches
   - Inverse of FilesWithMatches

4. **Count** (-c/--count)
   - Show count of matching lines per file
   - One number per file searched

5. **CountMatches** (--count-matches)
   - Show total count of all matches per file
   - Different from Count which counts lines

6. **JSON** (--json)
   - Output results in JSON Lines format
   - Five message types: begin, match, context, summary, end
   - Supports hyperlinks (via --hyperlink-format)

### Special Modes (SpecialMode enum)
- **HelpShort** (-h) - Condensed help output
- **HelpLong** (--help) - Verbose help with detailed flag documentation
- **VersionShort** (-V) - Simple version string
- **VersionLong** (--version) - Version with build features
- **VersionPCRE2** (--pcre2-version) - PCRE2 library version

### File Listing Modes
- **Files** (--files) - List all files that would be searched (no search performed)
- **Types** (--type-list) - List all available file type definitions

### Generation Modes (GenerateMode enum)
- **Man** (--generate man) - Generate man page
- **CompleteBash** (--generate complete-bash) - Bash shell completion
- **CompleteZsh** (--generate complete-zsh) - Zsh shell completion
- **CompleteFish** (--generate complete-fish) - Fish shell completion
- **CompletePowerShell** (--generate complete-powershell) - PowerShell completion

---

## Case Sensitivity Modes (CaseMode enum)

1. **Sensitive** (default)
   - All patterns match case sensitively
   - `a` does not match `A`

2. **Insensitive** (-i/--ignore-case)
   - All patterns match case insensitively
   - `a` matches both `a` and `A`

3. **Smart** (-S/--smart-case)
   - Automatic case matching based on pattern
   - If pattern is all lowercase, matching is case-insensitive
   - If pattern contains uppercase, matching is case-sensitive
   - Example: `foo` matches `Foo`, but `Foo` does not match `foo`

---

## Regex Engine Choices (EngineChoice enum)

1. **Default** (default)
   - Uses Rust's regex crate (regex-automata backend)
   - Fast finite automata-based engine
   - Supports most standard regex features

2. **Auto** (--auto-hybrid-regex, deprecated)
   - Dynamically chooses between Default and PCRE2
   - Tries Default first, falls back to PCRE2 if pattern fails
   - Better: use --engine=auto

3. **PCRE2** (-P/--pcre2)
   - Uses PCRE2 regex engine
   - Supports advanced features: lookaround, backreferences, etc.
   - Optional compile-time feature

---

## Output Formats

### Primary Output Format
- **Standard** - Default: `path:line_num:col:match_text`
- **JSON** - Structured JSON Lines format with message types
  - Messages: begin, match, context, summary, end
  - Preserves UTF-8 or binary data appropriately
  - Reference: grep-printer JSON specification

### Output Format Modifiers
- **Pretty** (-p/--pretty) - Alias for --colors always --heading --line-number
- **Vimgrep** (-H/--vimgrep) - Vim-compatible format `path:line:col:text`

### Color/Formatting Options
- **--color** - Control when to use color
  - Choices: never, auto (default), always, ansi
  
- **--colors** - Customize color settings
  - Format: `type:spec` (e.g., `match:fg:red`)
  - Applies to: path, line, column, match

- **--hyperlink-format** - Format hyperlinks in output
  - For integrated terminal navigation

---

## Output Modifiers

### Context Options
- **-B NUM / --before-context NUM** - Show N lines before each match
- **-A NUM / --after-context NUM** - Show N lines after each match
- **-C NUM / --context NUM** - Show N lines before and after
- **-P / --passthru** - Print all lines (matching and non-matching)
- **--context-separator SEP** - String to separate non-contiguous context blocks

### Field/Line Options
- **-n / --line-number** - Show line numbers
- **-n / --line-number-no** - Suppress line numbers
- **-C / --column** - Show column numbers
- **-b / --byte-offset** - Show byte offset
- **-H / --with-filename** - Show file path (default for multiple files)
- **-I / --no-filename** - Never show file path
- **-H / --heading** - Group matches by file (implies colors)
- **-o / --only-matching** - Show only matched portion of line
- **-M NUM / --max-columns NUM** - Omit lines longer than NUM characters
- **-m / --max-columns-preview** - Show preview for truncated lines

### Replace Mode
- **-r TEXT / --replace TEXT** - Replace matches with TEXT
  - Supports capture group references
  - Use like: `rg 'pattern(group)' -r 'replacement $1'`

### Separator Options
- **--field-match-separator SEP** - Separator between fields on match lines (default: :)
- **--field-context-separator SEP** - Separator between fields on context lines (default: -)
- **--path-separator SEP** - Path component separator
- **-0 / --null** - Print NUL byte after each file path
- **--null-data** - Use NUL as line terminator

### Buffer Modes (BufferMode enum)
- **Auto** (default) - Automatic based on tty detection
- **-n / --line-buffered** - Flush after each line (better for `tail -f`)
- **-b / --block-buffered** - Flush in blocks (maximum performance)

---

## Search Modifiers

### Pattern Matching Modes
- **-F / --fixed-strings** - Treat patterns as literal strings (no regex)
- **-w / --word-regexp** - Match only at word boundaries
- **-x / --line-regexp** - Match entire lines only
- **-e PATTERN / --regexp PATTERN** - Specify pattern (can repeat)
- **-f FILE / --file FILE** - Read patterns from file (one per line)
- **-U / --multiline** - Enable multiline matching (. matches \n)
- **--multiline-dotall** - Make . match newlines explicitly

### Boundary Matching
- Word boundaries: -w/--word-regexp
- Line boundaries: -x/--line-regexp

### Encoding Options (EncodingMode enum)
- **Auto** (default) - BOM sniffing with UTF-8 default
- **-E ENC / --encoding ENC** - Force specific encoding (BOM can override)
  - Examples: utf-8, latin1, shift_jis, etc.
  - Supported encodings from encoding_rs crate

- **--no-encoding** - Disable encoding detection, search raw bytes

### Binary File Handling (BinaryMode enum)
- **Auto** (default) - Skip binary files, search explicit files
- **--binary** (SearchAndSuppress) - Search but suppress matches, replace NUL with newlines
- **-a / --text** (AsText) - Treat all files as text

### Limit Options
- **-m NUM / --max-count NUM** - Stop after NUM matches
- **-v / --include-zero** - Include files with zero matches in summary
- **--max-filesize NUM** - Ignore files larger than NUM bytes
- **--dfa-size-limit NUM** - Maximum DFA size in bytes
- **--regex-size-limit NUM** - Maximum compiled regex size

---

## File Filtering Options

### File Type Filtering
- **-t TYPE / --type TYPE** - Only search files of TYPE
- **-T TYPE / --type-not TYPE** - Skip files of TYPE
- **--type-add GLOB** - Add custom glob to file type
- **-T / --type-clear TYPE** - Remove globs from file type
- **--type-list** - List all available types

### Glob Filtering
- **-g GLOB / --glob GLOB** - Include/exclude by glob pattern
  - Negate with !pattern
  - Can specify multiple times

- **-i GLOB / --iglob GLOB** - Case-insensitive glob
- **--glob-case-insensitive** - All globs match case-insensitively

### Ignore Files
- **--no-ignore** - Ignore all ignore files completely
- **--no-ignore-dot** - Ignore .ignore and .rgignore files
- **--no-ignore-vcs** - Ignore .gitignore, .hgignore, etc.
- **--no-ignore-exclude** - Ignore local exclusion files
- **--no-ignore-global** - Ignore global ignore files (~/.config/ripgrep)
- **--no-ignore-parent** - Don't search parent directory ignore files
- **--no-ignore-files** - Don't use --ignore-file arguments
- **--no-ignore-messages** - Suppress parse error messages
- **--ignore-file FILE** - Specify custom ignore file
- **--ignore-file-case-insensitive** - Case-insensitive matching in ignore files

### Directory Traversal
- **-d NUM / --max-depth NUM** - Max directory nesting level
- **-L / --follow** - Follow symbolic links
- **-o / --one-file-system** - Don't cross filesystem boundaries
- **-u / --unrestricted** - Reduce restrictions (use multiple times)
  - -u: ignore .ignore files
  - -uu: ignore .ignore AND binary files
  - -uuu: ignore .ignore AND search hidden files

### Directory/File Listing
- **--files** - List files that would be searched
- **-l / --files-with-matches** - List files with matches
- **-L / --files-without-match** - List files without matches

### Hidden & Special
- **-. / --hidden** - Search hidden files/directories (default: skip)
- **--no-require-git** - Use .gitignore outside git repos
- **--no-config** - Don't read configuration files
- **-z / --search-zip** - Search within compressed files

---

## Performance & Resource Options

### Memory Management
- **-U / --mmap** - Use memory maps when possible (default: auto)
  - Auto: Heuristic-based selection
  - AlwaysTryMmap: Force memory maps
  - Never: Never use memory maps

### Parallel Processing
- **-j NUM / --threads NUM** - Approximate thread count to use
  - Default: number of logical CPUs
  - 0 = unlimited

### Preprocessor
- **--pre COMMAND** - Execute COMMAND for each file before searching
  - Useful for searching compressed, archived, or processed files
  - Example: `rg --pre 'unzip -p' pattern archive.zip`

- **-p GLOB / --pre-glob GLOB** - Limit preprocessor to files matching GLOB

---

## Logging & Diagnostic Options

### Logging Levels (LoggingMode enum)
- **--debug** - Show debug messages
- **--trace** - Show detailed trace messages

### Statistics
- **--stats** - Print search statistics
  - Outputs: files searched, matches found, time, etc.

### Error Handling
- **-q / --quiet** - Suppress all output (error handling mode)
- **--no-messages** - Suppress error messages

---

## Sorting Options (SortModeKind enum)

- **--sort KIND** - Sort results (ascending)
  - **path** - By file path (default if sorting)
  - **modified** - By modification time
  - **accessed** - By access time
  - **created** - By creation time

- **--sortr KIND** - Sort in descending order (reverse)

- **--sort-files** - (DEPRECATED) Use --sort instead

---

## Hostname & Hyperlinks

- **--hostname-bin PROGRAM** - Get hostname by running PROGRAM
  - Used for hyperlink generation
  
- **--hyperlink-format FORMAT** - Control hyperlink output format
  - Useful for clickable file:line references in compatible terminals

---

## Configuration & Special

- **--no-config** - Don't read ripgrep config files
- **--trace** - Show trace messages for debugging
- **--stats** - Print search statistics after completion

---

## Configuration Files

Ripgrep searches for config in:
- `.ripgreprc` (project level)
- `~/.config/ripgrep/ripgreprc` (user level, Unix)
- `%APPDATA%/ripgrep/ripgreprc` (user level, Windows)

Format: One flag per line, same as CLI but without leading dashes

---

## Summary by Category

| Category | Count | Purpose |
|----------|-------|---------|
| **Input** | 6 | Pattern input and file sources |
| **Search** | 31 | Search behavior and matching modes |
| **Filter** | 23 | File/directory filtering and traversal |
| **Output** | 33 | Output formatting and presentation |
| **OutputModes** | 5 | Alternative output modes (count, files, JSON) |
| **Logging** | 3 | Debug logging and statistics |
| **OtherBehaviors** | 3 | Miscellaneous (follow links, generate docs) |
| **TOTAL** | **104** | |

---

## Common Use Cases

### 1. Search with Context
```bash
rg -C 2 "pattern"           # 2 lines before and after
rg -A 3 "pattern"           # 3 lines after
rg -B 2 "pattern"           # 2 lines before
```

### 2. JSON Output (for parsing)
```bash
rg --json "pattern" | jq    # Parse with jq
```

### 3. Case Insensitive (Smart)
```bash
rg -S "mypattern"           # auto-case matching
```

### 4. File Type Filtering
```bash
rg --type rust "pattern"    # Only .rs files
rg -t py -t js "pattern"    # Python or JavaScript
```

### 5. Replace Mode
```bash
rg -r '$1_new' '(\w+)\.txt'  # Use capture groups
```

### 6. Search Compressed Files
```bash
rg --pre 'unzip -p' "pattern" archive.zip
```

### 7. Color Control
```bash
rg --color never "pattern"   # No colors (for piping)
rg --color always "pattern"  # Force colors (for piping to less -R)
```

---

## Implementation Details

### File Structure (crates/cli/src)
- **flags/defs.rs** - All 104 flag definitions
- **flags/lowargs.rs** - Low-level argument types and enums
- **flags/hiargs.rs** - High-level arguments (converted from lowargs)
- **flags/parse.rs** - CLI parsing logic

### Key Design Principles
1. Flags use trait-based dynamic dispatch (Flag trait)
2. Each flag is defined as a unit struct with Flag implementation
3. Support for short (-X), long (--xxx), and negation (--no-xxx) forms
4. Flags are organized by category for documentation
5. Low-level parsing validates values, high-level conversion constructs final configuration
