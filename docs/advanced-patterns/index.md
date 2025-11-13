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

```mermaid
graph TD
    A[Start: Choose ripgrep features] --> B{Match across<br/>line boundaries?}
    B -->|Yes| C[Use -U --multiline]
    B -->|No| D[Default line-by-line]

    C --> E{Does . need to<br/>match newlines?}
    E -->|Yes| F[Add --multiline-dotall<br/>or use (?s)]
    E -->|No| G[Just -U is sufficient]

    A --> H{Need lookaround or<br/>backreferences?}
    H -->|Yes| I[Use -P --pcre2]
    H -->|No| J[Default engine faster]

    I --> K{Matching across lines?}
    K -->|Yes| L[Use -PU together]

    A --> M{Need Unicode<br/>character classes?}
    M -->|Yes| N[Default behavior<br/>Unicode enabled]
    M -->|No| O[Use --no-unicode<br/>ASCII-only faster]

    A --> P{Complex pattern with<br/>multiple features?}
    P -->|Yes| Q[Use --engine=auto<br/>for automatic selection]
```

!!! note "About --engine=auto"
    The `--engine=auto` flag analyzes your pattern and automatically selects the best regex engine. It chooses the default engine for simple patterns (faster) or switches to PCRE2 when it detects features like lookaround or backreferences. This is useful when you're not sure which engine to use.

### Engine Comparison: Default vs PCRE2

| Feature | Default Engine | PCRE2 Engine (`-P`) |
|---------|---------------|---------------------|
| **Performance** | Faster - optimized for speed | Slower - more feature-rich |
| **Lookaround** | Not supported | ✓ `(?=...)` `(?!...)` `(?<=...)` `(?<!...)` |
| **Backreferences** | Not supported | ✓ `\1` `\2` etc. |
| **Named captures** | ✓ Supported | ✓ Supported |
| **Unicode classes** | ✓ `\p{Letter}` etc. | ✓ `\p{Letter}` etc. |
| **Multiline mode** | ✓ With `-U` | ✓ With `-U` (use `-PU`) |
| **When to use** | Most searches - default choice | When you need lookaround or backreferences |

!!! tip "Choosing the Right Engine"
    Start with the default engine. Only use `-P` (PCRE2) when you specifically need lookaround assertions or backreferences. The default engine is significantly faster for most search patterns.

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

- [Basic Usage](../basics/index.md) - Fundamental regex patterns
- [Replacements](../replacements.md) - Using captures in replacements
- [File Encoding](../file-encoding.md) - Handling different encodings
