# Mermaid Diagram Validation

This directory contains Node.js scripts for validating Mermaid diagrams using the official `@mermaid-js/mermaid-cli` library.

## Setup

The validation script requires Node.js and npm. Dependencies are automatically installed by the workflow.

```bash
cd .prodigy/scripts
npm install
```

## Usage

```bash
node validate-mermaid.js <docs_dir>
```

For example:
```bash
node validate-mermaid.js ../../docs
```

## How It Works

The script:

1. Recursively finds all `.md` files in the specified directory
2. Extracts Mermaid diagram code blocks (` ```mermaid ... ``` `)
3. Validates each diagram by attempting to render it with `mmdc` (mermaid-cli)
4. Reports validation results with file paths and line numbers
5. Exits with code 1 if any diagrams are invalid, code 0 if all are valid
6. Outputs structured JSON validation data to stderr for consumption by Claude

## Integration with Workflow

The `workflows/mkdocs-drift.yml` workflow uses this script in the reduce phase:

```yaml
- shell: "cd .prodigy/scripts && npm install --silent && node validate-mermaid.js ../../$DOCS_DIR"
  on_failure:
    claude: "/prodigy-fix-mermaid-diagrams --validation-output '${shell.stderr}'"
    commit_required: true
```

When validation fails, the error output (JSON on stderr) is passed to the `/prodigy-fix-mermaid-diagrams` command for automated fixing.

## Why Node.js Instead of Python?

The previous Python implementation used regex-based heuristics to detect common syntax issues. While fast, it couldn't validate actual Mermaid syntax.

The Node.js version uses the **official Mermaid parser** (`@mermaid-js/mermaid-cli`), which:

- Provides authoritative syntax validation
- Catches all syntax errors that would fail during rendering
- Uses the same parser as the actual documentation build
- Ensures diagrams will render correctly in production

This is the same tool used by the Mermaid project itself for validation and rendering.
