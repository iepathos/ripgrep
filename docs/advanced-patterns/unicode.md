# Unicode Patterns

> Part of the [Advanced Patterns](./index.md) page

Ripgrep has excellent Unicode support enabled by default. All regex metacharacters are Unicode-aware.

## Unicode Character Classes

Use `\p{Property}` syntax to match Unicode character properties:

```bash
# Find emoji
rg '\p{Emoji}'

# Find Greek text
rg '\p{Greek}+'

# Find alphabetic characters (all scripts)
rg '\p{Alphabetic}+'

# Find uppercase letters (all scripts)
rg '\p{Uppercase}+'
```

## Common Unicode Properties

| Property | Matches |
|----------|---------|
| `\p{Emoji}` | Emoji characters |
| `\p{Greek}` | Greek script |
| `\p{Han}` | Chinese characters |
| `\p{Cyrillic}` | Cyrillic script |
| `\p{Alphabetic}` | Alphabetic characters |
| `\p{Uppercase}` | Uppercase letters |
| `\p{Lowercase}` | Lowercase letters |
| `\p{White_Space}` | Whitespace |
| `\p{any}` | Any character (including newlines) |

**Note on Emoji Matching**: Emoji matching with `\p{Emoji}` may vary across different regex engines and Unicode versions. Some complex emoji (like multi-codepoint sequences, skin tone modifiers, or zero-width joiners) may require additional pattern logic. Always test emoji patterns with your specific use case and data.

## Unicode-Aware Metacharacters

By default, these metacharacters are Unicode-aware:

- `\w`: Matches all Unicode word characters (not just ASCII)
- `\s`: Matches all Unicode whitespace
- `\d`: Matches Unicode decimal digits
- `\b`: Unicode word boundaries

```bash
# Match Unicode word characters (includes accented letters, etc.)
rg '\w+'

# Match Unicode whitespace
rg '\s+'
```

## Case-Insensitive Unicode

The `-i` flag performs Unicode case folding:

```bash
# Matches "café", "CAFÉ", "Café", etc.
rg -i 'café'

# Works across all scripts
rg -i 'Σ'  # Matches Σ and σ (Greek)
```

## Disabling Unicode

For ASCII-only searches with better performance, use `--no-unicode`:

```bash
# ASCII-only mode (faster for ASCII text)
rg --no-unicode '\w+'
```

**Note**: `--no-unicode` affects the entire search, not individual patterns.
