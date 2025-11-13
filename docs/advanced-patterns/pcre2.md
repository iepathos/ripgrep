# PCRE2 Engine

> Part of the [Advanced Patterns](./index.md) page

Ripgrep supports two regex engines:

1. **Default engine**: Fast Rust regex with finite automata
2. **PCRE2 engine**: Provides advanced features like lookaround and backreferences

## Enabling PCRE2

Use the `-P` or `--pcre2` flag to enable the PCRE2 engine:

```bash
# Use PCRE2 for lookahead
rg -P 'foo(?=bar)'

# Check if PCRE2 is available
rg --pcre2-version
```

## PCRE2 Availability

PCRE2 is an optional compile-time feature. Check availability with:

```bash
rg --pcre2-version
```

If PCRE2 is not compiled in, this command exits with an error.

## Default vs PCRE2 Features

| Feature | Default Engine | PCRE2 Engine |
|---------|---------------|--------------|
| Basic regex | ✓ | ✓ |
| Character classes | ✓ | ✓ |
| Quantifiers | ✓ | ✓ |
| Unicode support | ✓ | ✓ |
| Named captures | ✓ | ✓ |
| Lookahead/Lookbehind | ✗ | ✓ |
| Backreferences | ✗ | ✓ |
| Performance | Faster | Slower |
| Error messages | Better | Less helpful |

## When to Use PCRE2

Use PCRE2 when you need:

- Lookahead or lookbehind assertions
- Backreferences for matching repeated patterns
- Complex pattern features not in the default engine

For most searches, the default engine is faster and sufficient.

## PCRE2 Error Messages

**Warning**: PCRE2 provides less helpful error messages than the default engine. If you get cryptic errors, try your pattern with the default engine first to debug.

## Engine Selection

The `--engine` flag allows you to explicitly choose which regex engine to use, or let ripgrep choose automatically.

### Engine Options

```bash
# Use default Rust regex engine (fastest)
rg --engine=default 'pattern'

# Use PCRE2 engine (advanced features)
rg --engine=pcre2 'pattern'

# Automatically choose based on pattern (recommended for complex patterns)
rg --engine=auto 'pattern'
```

### Auto Engine Selection

The `auto` option analyzes your pattern and chooses the appropriate engine:

- Uses **PCRE2** if pattern requires lookaround or backreferences
- Uses **default** engine otherwise for better performance

```bash
# Uses PCRE2 automatically (requires lookahead)
rg --engine=auto 'foo(?=bar)'

# Uses default engine automatically (no PCRE2 features)
rg --engine=auto 'foo.*bar'
```

### Tradeoffs

**Explicit engine choice** (`default` or `pcre2`):
- Predictable performance
- Clear error messages if features unavailable
- Recommended for scripts and automation

**Auto engine** (`auto`):
- Convenient for interactive use
- May have surprising performance changes with pattern modifications
- Good for complex ad-hoc queries

### Deprecated Flag

**Note**: `--auto-hybrid-regex` is deprecated. Use `--engine=auto` instead.

## PCRE2 Version Check

Before using PCRE2 features, check availability:

```bash
# Show PCRE2 version and JIT status
rg --pcre2-version

# Output example:
# PCRE2 10.42 (JIT: enabled)
```

If PCRE2 is not compiled in, this command exits with an error.

**JIT Compilation**: The "JIT: enabled" status indicates that PCRE2's Just-In-Time compiler is available. JIT compilation converts regex patterns into native machine code at runtime, providing significant performance improvements (often 2-10x faster) for PCRE2 pattern matching. When JIT is enabled, PCRE2 patterns run much faster, though still typically slower than ripgrep's default finite automata engine.
