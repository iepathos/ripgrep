#!/bin/bash
# Validates all Mermaid diagrams in the docs directory
# Usage: ./validate-mermaid.sh [docs_dir]

set -e

DOCS_DIR="${1:-docs}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required but not installed"
    exit 1
fi

# Run the Python validation script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/validate-mermaid.py" "$DOCS_DIR"
