# Binary Flags Reference

> Part of the [Binary Data](./index.md) page

## `--binary`

**Purpose:** Search binary files and show warnings instead of skipping them.

**Effect:** Applies `SearchAndSuppress` mode to implicit files, making them behave like explicit files.

**When to use:**
- You want to know which binary files contain matches
- You're searching in directories that mix text and binary files
- You suspect binary files might contain text patterns you care about

**Example:**
```bash
# Show warnings for binary files in recursive search
rg --binary TODO
```

**Important:** This flag **only affects implicit files** (those found via recursive search or globs). Explicit file arguments already get warnings by default.

## `--text` / `-a`

**Purpose:** Completely disable binary detection, treating all files as text.

**Effect:** Sets `AsText` mode—no NUL byte detection, no special handling.

**When to use:**
- Searching files with unusual encodings that contain NUL bytes
- Searching data formats that are technically binary but human-readable (some JSON variants, etc.)
- Debugging when you suspect binary detection is interfering

**⚠️ Caution:** Can print raw binary data that may corrupt your terminal.

**Example:**
```bash
# Treat everything as text, even binaries
rg --text "pattern" binary_file.bin
```

## `--no-binary`

**Purpose:** Disable the `--binary` flag.

**Effect:** Reverts to default `Auto` mode behavior.

**Example:**
```bash
# Explicitly disable binary warnings
rg --no-binary "pattern"
```

## `--no-text`

**Purpose:** Disable the `--text` flag.

**Effect:** Re-enables binary detection if `--text` was set.

**Example:**
```bash
# Re-enable binary detection
rg --no-text "pattern"
```

## Decision Flowchart

Here's how ripgrep decides what to do with binary data:

```
                    ┌─────────────────┐
                    │ File to search  │
                    └────────┬────────┘
                             │
                   ┌─────────▼──────────┐
                   │ --text flag set?   │
                   └─────────┬──────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   Yes               No
                    │                 │
                    ▼                 ▼
            ┌───────────────┐  ┌──────────────────┐
            │ Treat as text │  │ Binary detection │
            │ (no detection)│  │ enabled          │
            └───────────────┘  └─────────┬────────┘
                                         │
                               ┌─────────▼──────────┐
                               │ File explicit or   │
                               │ implicit?          │
                               └─────────┬──────────┘
                                         │
                                ┌────────┴────────┐
                                │                 │
                            Explicit          Implicit
                                │                 │
                                ▼                 ▼
                      ┌──────────────────┐  ┌─────────────────┐
                      │ SearchAndSuppress│  │ --binary flag?  │
                      │ (show warning)   │  └────────┬────────┘
                      └──────────────────┘           │
                                            ┌────────┴────────┐
                                            │                 │
                                           Yes               No
                                            │                 │
                                            ▼                 ▼
                                  ┌──────────────────┐  ┌────────────┐
                                  │ SearchAndSuppress│  │ Quit early │
                                  │ (show warning)   │  │ (silent)   │
                                  └──────────────────┘  └────────────┘
```
