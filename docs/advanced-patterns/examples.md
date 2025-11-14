# Practical Examples

> Part of the [Advanced Patterns](./index.md) page

Real-world examples demonstrating advanced pattern techniques.

## Choosing the Right Flags

Understanding which flags to use for different search scenarios:

```mermaid
flowchart TD
    Start[Pattern Type] --> Multi{"Spans multiple
lines?"}

    Multi -->|Yes| Dotall{"Need . to
match newlines?"}
    Multi -->|No| Features{"Need lookaround
or backrefs?"}

    Dotall -->|Yes| UseDotall[""Use: -U --multiline-dotall
or -U '(?s")pattern'"]
    Dotall -->|No| UseMulti["Use: -U pattern"]

    Features -->|Yes| UsePCRE["Use: -P pattern"]
    Features -->|No| UseDefault[""Use: pattern
(default engine")"]

    UsePCRE --> PCREMulti{Also multiline?}
    PCREMulti -->|Yes| UsePU["Use: -PU pattern"]
    PCREMulti -->|No| End[Execute Search]

    UseDotall --> End
    UseMulti --> End
    UseDefault --> End

    style UsePCRE fill:#fff3e0
    style UsePU fill:#fff3e0
    style UseMulti fill:#e1f5ff
    style UseDotall fill:#e1f5ff
    style UseDefault fill:#e8f5e9
```

**Figure**: Decision flow for selecting the appropriate ripgrep flags based on pattern requirements.

## Multi-line Log Parsing

Find ERROR entries with their stack traces:

```bash
# Find ERROR with following context lines
rg -U 'ERROR.*\n.*stack trace'  # (1)!

# Find ERROR with complete stack trace (multiple lines)
rg -U --multiline-dotall 'ERROR.*?at .*?\)'  # (2)!
```

1. `-U` enables multiline mode; `\n` explicitly matches the newline character
2. `--multiline-dotall` makes `.` match newlines; `.*?` is non-greedy (stops at first match)

!!! example "Expected Output"
    ```
    app.log:15:ERROR: Database connection failed
    app.log:16:  stack trace: at connect() /src/db.rs:42
    ```

    The multiline pattern matches the ERROR line and captures the following stack trace context.

## Function Usage Analysis

Find function definitions that use specific features:

```bash
# Find functions using a specific API (requires PCRE2 + multiline)
rg -UP '(?s)fn (\w+).*?\{(?=.*use_api).*?\}'  # (1)!

# Find functions with TODO comments
rg -UP '(?s)fn (\w+).*?\{(?=.*TODO).*?\}'  # (2)!
```

1. `(?s)` enables dotall mode inline; `(?=.*use_api)` is a lookahead that checks if `use_api` appears anywhere in the function body
2. Lookahead doesn't consume characters, so it finds functions containing TODO without including TODO in the match

!!! example "Expected Output"
    ```
    src/api.rs:45:fn initialize_client() {
    src/api.rs:46:    use_api::connect();
    src/api.rs:47:    // ...
    src/api.rs:48:}
    ```

    The lookahead `(?=.*use_api)` checks if the function body contains the API call without capturing it in the match.

## Extracting Specific Content

Use lookaround with `--only-matching` for precise extraction:

=== "Dollar Amounts"
    ```bash
    rg -Po '(?<=\$)\d+\.?\d*'
    ```

    Expected output:
    ```
    invoice.txt:42.99
    invoice.txt:17.50
    invoice.txt:199
    ```

=== "Email Usernames"
    ```bash
    rg -Po '\w+(?=@\w+\.com)'
    ```

    Expected output:
    ```
    contacts.txt:john
    contacts.txt:alice
    ```

=== "Quoted Text"
    ```bash
    rg -Po '(?<=").*?(?=")'
    ```

    Expected output:
    ```
    config.json:database_url
    config.json:secret_key
    ```

=== "XML/HTML Content"
    ```bash
    rg -Po '(?<=<title>).*?(?=</title>)'
    ```

    Expected output:
    ```
    page.html:Welcome to My Site
    doc.xml:Introduction
    ```

!!! tip "Using -o for Extraction"
    The `-o` (or `--only-matching`) flag is essential for extraction - it shows only the matched portion, not the entire line.

## Finding Repeated Patterns

Use backreferences to find duplications:

```bash
# Find repeated words
rg -P '\b(\w+)\s+\1\b'  # (1)!

# Find repeated numbers
rg -P '(\d{3})-\1'  # (2)!

# Find repeated lines (requires multiline)
rg -UP '^(.+)$\n\1$'  # (3)!
```

1. `(\w+)` captures a word; `\1` references the first capture group, matching the same word again
2. `(\d{3})` captures three digits; `\1` ensures the same three digits appear after the hyphen
3. `^(.+)$` captures an entire line; `\n\1$` matches a newline followed by the exact same line

!!! example "Expected Output"
    ```
    document.txt:42:The the quick brown fox
    document.txt:89:You can can use this feature
    ids.txt:15:123-123 (repeated number pattern)
    log.txt:ERROR: Connection timeout
    log.txt:ERROR: Connection timeout
    ```

!!! warning "Backreferences Require PCRE2"
    The `-P` flag is mandatory for backreferences. The `\1` syntax refers back to the first captured group `(\w+)`.

## Unicode Script Searches

Search for specific writing systems:

```bash
# Find Chinese text
rg '\p{Han}+'

# Find mixed script text (Latin + Cyrillic)
rg '\p{Latin}.*\p{Cyrillic}'

# Find emoji
rg '\p{Emoji}'

# Find right-to-left script (Arabic, Hebrew)
rg '\p{Arabic}|\p{Hebrew}'
```

!!! example "Expected Output"
    ```
    multilang.txt:5:你好世界 (Chinese: Hello World)
    docs.txt:12:Introduction Введение (Mixed Latin-Cyrillic)
    messages.txt:8:Great work! 🎉
    greetings.txt:3:مرحبا (Arabic: Hello)
    ```

!!! tip "Unicode Performance"
    Unicode searches are enabled by default. Use `--no-unicode` for ASCII-only searches when performance is critical.

## Complex Replacements

Use named captures for readable transformations:

=== "Date Formatting"
    ```bash
    rg '(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})' -r '$month/$day/$year'
    ```

    Before: `2024-03-15`
    After: `03/15/2024`

=== "Email Restructuring"
    ```bash
    rg '(?P<user>\w+)@(?P<domain>\w+)\.com' -r 'User: $user, Domain: $domain'
    ```

    Before: `alice@example.com`
    After: `User: alice, Domain: example`

=== "Log Reformatting"
    ```bash
    rg '(?P<time>\d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<msg>.+)' \
       -r '[$level] $time - $msg'
    ```

    Before: `14:32:15 ERROR Connection failed`
    After: `[ERROR] 14:32:15 - Connection failed`

!!! tip "Named Captures for Clarity"
    Named captures like `(?P<name>...)` make replacement patterns more readable than numbered references (`$1`, `$2`).

## Combining Multiline and PCRE2

Powerful queries combining multiple features:

```bash
# Find struct definitions with specific fields (multiline + lookahead)
rg -UP '(?s)struct (\w+).*?\{(?=.*field_name).*?\}'  # (1)!

# Find functions calling deprecated APIs with context
rg -UP '(?s)fn (\w+).*?\{(?=.*deprecated_api).*?\}' -A 2 -B 2  # (2)!

# Match code blocks with specific patterns
rg -UP '(?s)fn test_\w+.*?\{(?=.*assert).*?\}'  # (3)!
```

1. Combines `-P` (PCRE2 for lookahead), `-U` (multiline), `(?s)` (dotall), and `(?=...)` (lookahead)
2. `-A 2 -B 2` shows 2 lines of context before and after matches for debugging
3. `test_\w+` matches test function names; lookahead ensures they contain assertions

!!! example "Expected Output"
    ```
    src/models.rs:23:struct Config {
    src/models.rs:24:    field_name: String,
    src/models.rs:25:    // ...
    src/models.rs:26:}
    ```

    The `(?s)` flag enables dotall mode, the lookahead `(?=.*field_name)` searches within the braces for the field.

## Limitations and Gotchas

Common pitfalls and limitations when using advanced regex features.

### PCRE2 Silent Failures

!!! danger "Critical Gotcha: PCRE2 + Newlines"
    PCRE2 may silently fail to match when using `\n` without `--multiline`:

    ```bash
    # May not work as expected
    rg -P 'foo\nbar'

    # Correct: use both -P and -U
    rg -PU 'foo\nbar'
    ```

    The default engine gives better error messages for this case. Always test PCRE2 patterns with multiline input.

### Dotall Confusion

!!! warning "Dot Does Not Match Newlines by Default"
    The `.` metacharacter does **not** match newlines, even in multiline mode:

    ```bash
    # FAILS - . doesn't match \n
    rg -U 'foo.+bar'

    # SUCCEEDS - need --multiline-dotall
    rg -U --multiline-dotall 'foo.+bar'

    # ALTERNATIVE - use (?s) inline flag
    rg -U '(?s)foo.+bar'

    # ALTERNATIVE - use \p{any}
    rg -U 'foo\p{any}+bar'
    ```

    Use `--multiline-dotall`, the `(?s)` flag, or `\p{any}` to match across newlines.

### Forgetting -P Flag

!!! warning "PCRE2 Features Require -P Flag"
    Lookaround and backreferences **require** the `-P` flag:

    ```bash
    # ERROR - lookahead requires PCRE2
    rg 'foo(?=bar)'

    # CORRECT
    rg -P 'foo(?=bar)'
    ```

    Without `-P`, ripgrep will report an error about unsupported syntax.

### Unicode Scope

!!! note "Global Unicode Setting"
    `--no-unicode` affects **all** patterns globally, not individual patterns:

    ```bash
    # Both patterns are ASCII-only
    rg --no-unicode -e 'pattern1' -e 'pattern2'
    ```

    You cannot mix Unicode and ASCII-only patterns in a single search invocation.

### Regex Size Limits

!!! warning "Pattern Complexity Limits"
    Extremely complex patterns may hit size limits:

    ```bash
    # Error: "compiled regex exceeds size limit"
    # Solution: use --regex-size-limit
    rg --regex-size-limit 100M 'extremely_complex_pattern'
    ```

    See [Performance Considerations](./performance.md) for optimization strategies.

### Engine-Specific Behavior

!!! note "Regex Engine Differences"
    Some patterns behave differently between engines:

    - Test PCRE2 patterns with `-P` before relying on them
    - Default engine has stricter pattern requirements
    - Error messages differ between engines

    When in doubt, test your pattern with both engines to ensure consistent behavior.
