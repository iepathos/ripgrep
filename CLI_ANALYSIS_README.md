# Ripgrep CLI Analysis - Document Index

This directory contains a comprehensive analysis of ripgrep's command-line interface implementation.

## Documents

### 1. RIPGREP_CLI_ANALYSIS_SUMMARY.md
Executive summary with key findings and architecture overview. Start here for a quick understanding of ripgrep's CLI capabilities and design.

**Contents:**
- Overview (104 flags, 7 categories)
- Search modes (6 variants)
- Pattern matching modes
- Case matching strategies
- Implementation architecture
- Design patterns used

### 2. RIPGREP_CLI_FLAGS_REFERENCE.txt
Complete reference of all 104 command-line flags organized by category with types and descriptions.

**Sections:**
- INPUT FLAGS (6) - Pattern and file input
- SEARCH FLAGS (31) - Pattern matching behavior
- FILTER FLAGS (23) - File/directory filtering
- OUTPUT FLAGS (33) - Output formatting
- OUTPUT MODE FLAGS (5) - Alternative output modes
- LOGGING FLAGS (3) - Debug and statistics
- OTHER BEHAVIOR FLAGS (3) - Misc features
- ENUMS & MODES - All mode variants
- ARCHITECTURE - Implementation details

### 3. RIPGREP_CLI_ANALYSIS.md
In-depth technical analysis with detailed explanations of each feature category.

**Covers:**
- Search modes with examples
- Output format specifications
- Context and field options
- File filtering strategies
- Performance tuning options
- Configuration system
- Common use cases with examples

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Flags | 104 |
| Categories | 7 |
| Search Modes | 6 |
| Enum Types | 11 |
| Implementation Lines | 7,775+ |
| Source Files | 4 core |

## Flag Breakdown

- **Input** (6) - Pattern and file sources
- **Search** (31) - Matching behavior
- **Filter** (23) - File filtering
- **Output** (33) - Formatting
- **OutputModes** (5) - Alternative modes
- **Logging** (3) - Diagnostics
- **OtherBehaviors** (3) - Miscellaneous

## Core Implementation Files

Located in `crates/core/flags/`:

1. **defs.rs** (7775 lines)
   - 104 Flag trait implementations
   - Documentation and help text
   - Category organization

2. **lowargs.rs**
   - LowArgs struct definition
   - All mode enums (SearchMode, CaseMode, etc.)
   - Low-level type definitions

3. **hiargs.rs**
   - High-level argument conversion
   - File type definitions
   - Configuration builders

4. **parse.rs**
   - CLI argument parser
   - Config file reading
   - Validation logic

## Design Highlights

- **Trait-Based** - Dynamic dispatch via Flag trait
- **Two-Tier Architecture** - Low-level (validated) to high-level (configured)
- **Category Organization** - Logical grouping for help/docs
- **Negation Support** - All flags support --no-* variants
- **Extensible** - Easy to add new flags or modes

## Quick Reference

### Search Modes
- Standard (default)
- FilesWithMatches (-l)
- FilesWithoutMatch (-L)
- Count (-c)
- CountMatches (--count-matches)
- JSON (--json)

### Output Formats
- Standard path:line:col:match
- JSON (5 message types)
- Vimgrep (vim-compatible)
- Pretty (colorized)

### Key Features
- 3 regex engines (Default, PCRE2, Auto)
- 3 case modes (Sensitive, Insensitive, Smart)
- Smart binary file detection
- Configurable output (colors, separators, buffering)
- Advanced filtering (types, globs, ignores)
- Performance tuning (memory maps, threading, limits)

## Related Documentation

For more information about ripgrep:
- Main repository: https://github.com/BurntSushi/ripgrep
- Book: https://docs.rs/grep-printer/

---

Generated: 2025-11-08
