# Pattern Matching

> Part of the [Basics](./index.md) page

## Basic Search

The simplest way to use ripgrep is to provide a pattern to search for:

```bash
rg TODO
```

This searches recursively through all files in the current directory for the pattern "TODO".

## Multiple Patterns

You can specify multiple patterns using the `-e` or `--regexp` flag:

```bash
# Match lines containing either TODO or FIXME
rg -e TODO -e FIXME

# Match multiple patterns
rg -e "error" -e "warning" -e "critical"
```

## Patterns from a File

For complex searches with many patterns, you can store them in a file and use `-f` or `--file`:

```bash
# Create a patterns file
echo "TODO" > patterns.txt
echo "FIXME" >> patterns.txt
echo "HACK" >> patterns.txt

# Search using patterns from file
rg -f patterns.txt
```

Each line in the patterns file is treated as a separate pattern.
