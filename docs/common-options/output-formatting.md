# Output Formatting

> Part of the [Common Options](./index.md) page

These flags control what information is displayed with each match.

## Line Numbers and Filenames

- **`-n, --line-number`**: Show line numbers (default when searching files)
  ```bash
  rg -n pattern
  # Output: file.txt:42:matching line
  ```

- **`-N, --no-line-number`**: Hide line numbers
  ```bash
  rg -N pattern
  ```

- **`-H, --with-filename`**: Show filenames (default when searching multiple files)
  ```bash
  rg -H pattern
  ```

- **`-I, --no-filename`**: Hide filenames
  ```bash
  rg -I pattern
  ```

- **`--column`**: Show column numbers of matches
  ```bash
  rg --column pattern
  # Output: file.txt:42:7:matching line
  #                    ^ column number
  ```

## Context Lines

Show lines before and/or after each match to understand the surrounding code:

- **`-A NUM, --after-context NUM`**: Show NUM lines after each match
  ```bash
  # Show 3 lines after each match
  rg -A 3 'fn main'
  ```

- **`-B NUM, --before-context NUM`**: Show NUM lines before each match
  ```bash
  # Show 2 lines before each match
  rg -B 2 'panic!'
  ```

- **`-C NUM, --context NUM`**: Show NUM lines before AND after each match
  ```bash
  # Show 5 lines of context around each match
  rg -C 5 'struct Config'
  ```

When showing context, ripgrep prints `--` as a separator between match groups.

## Match Output

- **`-o, --only-matching`**: Print only the matched part of lines, not the full line
  ```bash
  # Extract email addresses
  rg -o '\b\w+@\w+\.\w+\b'

  # Extract function names
  rg -o 'fn \w+' | rg -o '\w+$'
  ```
  Useful for extracting specific data from files.

- **`-r, --replace REPLACEMENT`**: Replace matched text in output (doesn't modify files)
  ```bash
  # Show how lines would look with replacements
  rg 'foo' -r 'bar'

  # Use capture groups
  rg '(\w+)@(\w+)' -r '$2@$1'
  ```
  This changes the display only. To modify files, use other tools like `sed`. See the [Replacements chapter](../replacements.md) for more details.

- **`-b, --byte-offset`**: Show absolute byte offset in file for each match
  ```bash
  # Display byte positions for binary file analysis
  rg -b pattern
  # Output: file.txt:42:137:matching line
  #                    ^^^ byte offset
  ```
  Useful for precise location tracking and binary file analysis.

- **`--hyperlink-format FORMAT`**: Generate clickable terminal links using OSC 8 escape sequences
  ```bash
  # Use built-in editor formats
  rg --hyperlink-format vscode pattern
  rg --hyperlink-format cursor pattern

  # Custom format with variables: {path}, {line}, {column}
  rg --hyperlink-format 'file://{path}:{line}:{column}' pattern
  ```
  Requires a terminal that supports OSC 8 hyperlinks. Built-in formats: `vscode`, `cursor`, `macvim`, `sublime`, `textmate`, `emacs`, `vim`.

## Color and Formatting

- **`--color WHEN`**: Control colored output
  - `auto` (default): Color if outputting to terminal
  - `always`: Force color even when piping
  - `never`: Disable color (useful for scripts)
  ```bash
  # Force color for paging
  rg --color always pattern | less -R

  # Disable color for clean output
  rg --color never pattern > results.txt
  ```

- **`--colors TYPE:STYLE:VALUE`**: Fine-grained color customization
  ```bash
  # Customize match highlighting color to red
  rg --colors 'match:fg:red' pattern

  # Bold path names, green matches
  rg --colors 'path:style:bold' --colors 'match:fg:green' pattern

  # Use 256-color palette or 24-bit RGB
  rg --colors 'match:fg:0,128,255' pattern
  ```
  Types: `path`, `line`, `column`, `match`. Styles: `fg` (foreground), `bg` (background), `style` (bold, intense, underline, italic).

- **`--heading`** / **`--no-heading`**: Control file grouping in output
  ```bash
  # Group matches by file with filename as header
  rg --heading pattern

  # Inline format: path:line:match on each line
  rg --no-heading pattern
  ```
  With `--heading`, matches are grouped under filenames. With `--no-heading`, every line shows the full path.

- **`-p, --pretty`**: Alias for `--color always --heading --line-number`
  ```bash
  # Human-friendly output with grouping and colors
  rg -p pattern
  ```
  This is a convenient shorthand for readable output when piping to a pager.
