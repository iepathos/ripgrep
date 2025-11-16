#!/bin/bash
# Validates all Mermaid diagrams in the docs directory
# Usage: ./validate-mermaid.sh [docs_dir]

set -e

# Save original working directory
ORIGINAL_CWD="$(pwd)"
DOCS_DIR="${1:-docs}"

# Convert to absolute path if relative
if [[ "$DOCS_DIR" != /* ]]; then
    DOCS_DIR="$ORIGINAL_CWD/$DOCS_DIR"
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: node is required but not installed"
    exit 1
fi

# Get script directory and install dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Install dependencies if needed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    (cd "$SCRIPT_DIR" && npm install --silent)
fi

# Run the Node.js validation script from the script directory, passing absolute path
cd "$SCRIPT_DIR"
node validate-mermaid.js "$DOCS_DIR"
