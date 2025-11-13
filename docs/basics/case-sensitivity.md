# Case Sensitivity

> Part of the [Basics](./index.md) page

By default, ripgrep performs case-sensitive searches.

## Case-Insensitive Search

Use `-i` or `--ignore-case` to search case-insensitively:

```bash
# Matches "TODO", "todo", "Todo", "ToDo", etc.
rg -i todo

# Case-insensitive search for error messages
rg -i "error: .+"
```

## Case-Sensitive Search

Use `-s` or `--case-sensitive` to force case-sensitive search (useful to override config files):

```bash
rg -s TODO
```

## Smart Case

Use `-S` or `--smart-case` for automatic case sensitivity:
- If pattern is all lowercase → case-insensitive search
- If pattern contains uppercase → case-sensitive search

```bash
# Case-insensitive (pattern is all lowercase)
rg -S todo          # Matches "TODO", "todo", "Todo"

# Case-sensitive (pattern contains uppercase)
rg -S TODO          # Matches only "TODO"

# Case-sensitive (pattern contains uppercase)
rg -S Error         # Matches "Error" but not "error"
```

**Smart case is very popular and is often set in configuration files.**
