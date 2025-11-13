# Advanced Patterns

This chapter covers advanced regex pattern features in ripgrep, including multiline search, PCRE2 engine support, lookaround assertions, backreferences, Unicode patterns, and performance considerations.

## Table of Contents

- [Multiline Search](./multiline.md)
- [PCRE2 Engine](./pcre2.md)
- [Lookaround Assertions](./lookaround.md)
- [Backreferences](./backreferences.md)
- [Unicode Patterns](./unicode.md)
- [Inline Regex Flags](./inline-flags.md)
- [Performance Considerations](./performance.md)
- [Practical Examples](./examples.md)

## Quick Reference

### Decision Tree: Choosing the Right Features

Use this guide to select appropriate flags for your search:

```
Do you need to match across line boundaries?
├─ Yes → Use -U (--multiline)
│   └─ Does . need to match newlines?
│       ├─ Yes → Add --multiline-dotall or use (?s)
│       └─ No → Just -U is sufficient
└─ No → Default line-by-line search

Do you need lookaround or backreferences?
├─ Yes → Use -P (--pcre2)
│   └─ Matching across lines?
│       └─ Yes → Use -PU together
└─ No → Default engine is faster

Do you need Unicode character classes?
├─ Yes → Default behavior (Unicode enabled)
└─ No → Use --no-unicode for ASCII-only (faster)

Complex pattern with multiple features?
└─ Consider --engine=auto for automatic selection
```

## Summary

Advanced regex features in ripgrep provide powerful search capabilities:

- **Multiline mode** (`-U`) for patterns spanning lines
- **PCRE2 engine** (`-P`) for lookaround and backreferences
- **Unicode support** for international text with `\p{Property}`
- **Named captures** for readable complex patterns
- **Inline flags** for fine-grained control

**Key principles**:
1. Use default engine unless you need PCRE2 features
2. Avoid multiline mode for performance unless necessary
3. Test complex patterns with `--stats` to understand performance
4. Combine features thoughtfully for powerful queries
5. Remember gotchas (. doesn't match \n by default, PCRE2 needs -P)

For most searches, simple patterns with the default engine are sufficient. Use advanced features when the problem requires them, understanding the performance tradeoffs.

## Related Chapters

- [Basic Usage](../basics.md) - Fundamental regex patterns
- [Replacements](../replacements.md) - Using captures in replacements
- [File Encoding](../file-encoding.md) - Handling different encodings
