# Search Basics

These flags control how patterns are interpreted and matched against text.

## Case Sensitivity

By default, ripgrep uses **case-sensitive** matching. This means `rg error` will only match the exact lowercase word "error", not "Error" or "ERROR".

```bash
# Source: Default behavior (crates/core/flags/defs.rs:654)
# Case-sensitive by default - only matches exact case
echo -e "error\nError\nERROR" | rg error
# Output: error
```

For more flexible matching, use these flags:

- **`-S, --smart-case`**: Enable smart case matching (pattern case determines behavior)
  ```bash
  # Lowercase pattern → case-insensitive
  rg -S error    # Matches: error, Error, ERROR

  # Uppercase present → case-sensitive
  rg -S Error    # Matches: Error only
  ```

  ```mermaid
  flowchart TD
      Start[Pattern with -S flag] --> HasUpper{"Contains
  uppercase?"}
      HasUpper -->|Yes| CaseSens[Case-Sensitive Search]
      HasUpper -->|No| CaseInsens[Case-Insensitive Search]

      CaseSens --> Ex1["'Error' matches: 'Error'
  Skips: 'error', 'ERROR'"]
      CaseInsens --> Ex2["'error' matches:
  'error', 'Error', 'ERROR'"]

      style HasUpper fill:#e1f5ff
      style CaseSens fill:#ffebee
      style CaseInsens fill:#e8f5e9
  ```

  **Figure**: Smart case behavior with `-S` flag - pattern case determines match sensitivity.

  !!! tip "Smart Case is Useful"
      Enable smart case with `-S` when you want lowercase patterns to match any case variation. This is convenient for searching logs or prose where you care about the content but not the exact capitalization.

- **`-i, --ignore-case`**: Force case-insensitive search regardless of pattern
  ```bash
  # Find "error", "ERROR", "Error", etc.
  rg -i error
  ```
  Useful when searching prose or when you want to catch all case variations.

- **`-s, --case-sensitive`**: Explicitly force case-sensitive search
  ```bash
  # Only find exact case match "Error"
  rg -s Error
  ```
  Useful for overriding configuration files that may have set different defaults, or when you want to be explicit about case-sensitive matching.

## Pattern Types

By default, ripgrep treats patterns as regular expressions. These flags change that behavior:

```mermaid
flowchart TD
    Start[Pattern Input] --> Type{Pattern Type?}

    Type -->|Default| Regex[Regular Expression]
    Type -->|-F| Literal[Literal String]
    Type -->|-w| Word[Word Boundary]
    Type -->|-x| Line[Complete Line]

    Regex --> R1["'test.*' matches
'test', 'testing', etc."]
    Literal --> L1["'test.*' matches
literal 'test.*'"]
    Word --> W1["'test' matches
'test' only,
not 'testing'"]
    Line --> X1["'test' matches
only if entire line
is 'test'"]

    style Type fill:#e1f5ff
    style Regex fill:#fff3e0
    style Literal fill:#e8f5e9
    style Word fill:#f3e5f5
    style Line fill:#fce4ec
```

**Figure**: Pattern type selection determines how ripgrep interprets your search pattern.

- **`-F, --fixed-strings`**: Treat pattern as a literal string, not a regex
  ```bash
  # Find literal text "(.*)" without regex interpretation
  rg -F '(.*)'
  ```

  !!! tip "When to Use Fixed Strings"
      Use `-F` when searching for code snippets or text containing regex metacharacters like `.*`, `[]`, `()`, `{}`, `$`, `^`. This avoids regex syntax errors and matches exactly what you type.

- **`-w, --word-regexp`**: Only match whole words
  ```bash
  # Find "test" as a word, not "testing" or "attest"
  rg -w test
  ```
  Uses word boundaries to ensure the pattern isn't part of a larger word.

- **`-x, --line-regexp`**: Only match complete lines
  ```bash
  # Find lines that contain exactly "import sys"
  rg -x 'import sys'
  ```

## Multiline Matching

By default, patterns match within single lines. For patterns that span multiple lines:

- **`-U, --multiline`**: Enable multiline mode where patterns can match across line boundaries
  ```bash
  # Source: tests/multiline.rs:8
  # Match patterns spanning multiple lines
  rg -U 'abc\ndef'

  # Find multi-line comments
  rg -U '/\*.*?\*/'
  ```

- **`--multiline-dotall`**: Make `.` match newlines in multiline mode
  ```bash
  # Source: tests/multiline.rs:28-43
  # Match patterns where . needs to cross line boundaries
  rg -U --multiline-dotall 'of this world.+detective work'
  ```

  !!! warning "Multiline Gotcha: Dot Behavior"
      In multiline mode (`-U`), the `.` metacharacter **still doesn't match newlines** by default. You must add `--multiline-dotall` to make `.` match `\n`. Without it, `.*` stops at line boundaries even in multiline mode.

      ```bash
      # This FAILS - dot doesn't match newline even with -U
      rg -U 'world.+detective'

      # This SUCCEEDS - multiline-dotall makes dot match newline
      rg -U --multiline-dotall 'world.+detective'
      ```

## Regex Engine Selection

Ripgrep uses Rust's regex engine by default, which is very fast. For advanced regex features, you can switch to the PCRE2 engine:

```mermaid
flowchart LR
    Pattern[Regex Pattern] --> Need{"Need advanced
features?"}

    Need -->|No| Default["Default Engine
Fast & Efficient"]
    Need -->|Yes| PCRE2["PCRE2 Engine
-P flag"]

    Default --> D1["Basic regex:
., *, +, ?, [], etc."]
    PCRE2 --> P1["Lookahead/Lookbehind
Backreferences
Conditional patterns"]

    style Default fill:#e8f5e9
    style PCRE2 fill:#fff3e0
    style Need fill:#e1f5ff
```

**Figure**: Regex engine selection - use PCRE2 only when you need advanced features.

- **`-P, --pcre2`**: Use PCRE2 engine for advanced features like lookahead/lookbehind and backreferences
  ```bash
  # Source: tests/regression.rs:1152 (lookahead example)
  # Lookahead: find pattern only if followed by another pattern
  rg -P 'foo(?=bar)'

  # Lookbehind: find pattern only if preceded by another pattern
  rg -P '(?<=foo)bar'

  # Backreferences: find repeated words
  rg -P '(\w+)\s+\1'
  ```

  !!! warning "PCRE2 Performance Impact"
      PCRE2 is **significantly slower** than the default Rust regex engine. Only use `-P` when you genuinely need lookahead, lookbehind, or backreferences. For simple patterns, the default engine is much faster.

  See the [Regular Expressions](../basics/regex-basics.md) chapter for detailed regex syntax and PCRE2 features.

- **`--engine ENGINE`**: Explicitly choose regex engine
  ```bash
  # Force PCRE2 engine
  rg --engine pcre2 'pattern'

  # Force default Rust regex
  rg --engine default 'pattern'

  # Auto-select based on pattern (default)
  rg --engine auto 'pattern'
  ```

## Invert Match

- **`-v, --invert-match`**: Show lines that DON'T match the pattern
  ```bash
  # Show all lines except comments
  rg -v '^#'

  # Find files without TODOs
  rg -v TODO
  ```
  Useful for filtering out noise or finding the absence of something.

## Multiple Patterns

- **`-e, --regexp PATTERN`**: Specify multiple patterns (match any)
  ```bash
  # Find lines with "error" OR "warning"
  rg -e error -e warning
  ```

- **`-f, --file FILE`**: Read patterns from a file (one per line)
  ```bash
  # Search for all patterns listed in patterns.txt
  rg -f patterns.txt
  ```

!!! example "Combining Multiple Patterns"
    Use `-e` for OR logic (match any pattern):
    ```bash
    # Find any severity level
    rg -e ERROR -e WARNING -e INFO

    # Search for multiple function names
    rg -e 'fn initialize' -e 'fn setup' -e 'fn configure'
    ```

    For complex pattern lists, use `-f` with a file:
    ```bash
    # patterns.txt
    TODO
    FIXME
    HACK
    XXX

    # Find all code annotations
    rg -f patterns.txt
    ```
