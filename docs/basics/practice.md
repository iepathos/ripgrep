# Practice Examples

> Part of the [Basics](./index.md) page

Try these exercises to solidify your understanding:

## Practice Exercises

1. **Basic Search:**
   ```bash
   # Find all TODO comments in your project
   rg "TODO"
   ```

2. **Case-Insensitive:**
   ```bash
   # Find all error messages (any case)
   rg -i "error"
   ```

3. **Literal Search:**
   ```bash
   # Find function calls to "log()"
   rg -F "log()"
   ```

4. **Word Boundaries:**
   ```bash
   # Find variable named "id" (not "valid", "identity", etc.)
   rg -w "id"
   ```

5. **Count Matches:**
   ```bash
   # Count how many times each file uses "import"
   rg -c "import"
   ```

6. **With Context:**
   ```bash
   # Find errors with surrounding context
   rg -C 3 "error"
   ```

7. **Regex Pattern:**
   ```bash
   # Find hexadecimal numbers
   rg "0x[0-9a-fA-F]+"
   ```

8. **Inverted Match:**
   ```bash
   # Find all non-empty lines
   rg -v "^$"
   ```

## Common Mistakes

### Forgetting to Escape Regex Metacharacters

**Problem:**
```bash
# This searches for regex pattern "file.txt", which matches "file_txt", "fileXtxt", etc.
rg "file.txt"
```

**Solution:**
```bash
# Use -F for literal search
rg -F "file.txt"

# Or escape the dot
rg "file\.txt"
```

### Case Sensitivity Confusion

**Problem:**
```bash
# Doesn't match "TODO", "Todo"
rg "todo"
```

**Solution:**
```bash
# Use -i or -S
rg -i "todo"
rg -S todo
```

### Matching Partial Words

**Problem:**
```bash
# Matches "test", "testing", "contest", "latest", etc.
rg "test"
```

**Solution:**
```bash
# Use -w for whole words
rg -w "test"
```
