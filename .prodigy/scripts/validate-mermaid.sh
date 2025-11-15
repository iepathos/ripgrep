#!/bin/bash
# Validates all Mermaid diagrams in the docs directory
# Usage: ./validate-mermaid.sh [docs_dir]

set -e

DOCS_DIR="${1:-docs}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: node is required but not installed"
    exit 1
fi

# Get script directory and install dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --silent
fi

# Run the Node.js validation script
node validate-mermaid.js "$DOCS_DIR"
