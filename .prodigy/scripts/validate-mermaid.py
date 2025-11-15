#!/usr/bin/env python3
"""
Validates all Mermaid diagrams in the docs directory.
Usage: python3 validate-mermaid.py [docs_dir]
"""

import sys
import re
from pathlib import Path
from typing import List, Tuple, Dict

# Colors for terminal output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'  # No Color

def extract_mermaid_diagrams(file_path: Path) -> List[Tuple[int, str]]:
    """Extract all Mermaid diagrams from a markdown file.

    Returns: List of (line_number, diagram_content) tuples
    """
    diagrams = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_mermaid = False
    start_line = 0
    diagram_lines = []

    for i, line in enumerate(lines, 1):
        if line.strip() == '```mermaid':
            in_mermaid = True
            start_line = i
            diagram_lines = []
        elif in_mermaid and line.strip() == '```':
            diagrams.append((start_line, '\n'.join(diagram_lines)))
            in_mermaid = False
        elif in_mermaid:
            diagram_lines.append(line.rstrip())

    return diagrams

def validate_diagram(diagram: str) -> List[str]:
    """Validate a single Mermaid diagram.

    Returns: List of error messages (empty if valid)
    """
    errors = []
    warnings = []

    # Check for diagram type declaration
    diagram_types = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey'
    ]
    if not any(diagram.strip().startswith(dt) for dt in diagram_types):
        errors.append("Missing diagram type declaration (graph, flowchart, etc.)")

    # Check for unmatched brackets
    square_open = diagram.count('[')
    square_close = diagram.count(']')
    if square_open != square_close:
        errors.append(f"Unmatched square brackets ({square_open} [ vs {square_close} ])")

    curly_open = diagram.count('{')
    curly_close = diagram.count('}')
    if curly_open != curly_close:
        errors.append(f"Unmatched curly braces ({curly_open} {{ vs {curly_close} }})")

    paren_open = diagram.count('(')
    paren_close = diagram.count(')')
    if paren_open != paren_close:
        errors.append(f"Unmatched parentheses ({paren_open} ( vs {paren_close} ))")

    # Check for HTML entities
    if re.search(r'&#\d+;', diagram):
        entities = re.findall(r'&#\d+;', diagram)
        errors.append(f"Contains HTML entities: {', '.join(set(entities))}")

    # Check for HTML tags
    if re.search(r'<br\s*/?>|<BR\s*/?>', diagram):
        errors.append("Contains HTML <br/> tags")

    # Heuristic checks for potential rendering issues
    if diagram.strip().startswith(('graph', 'flowchart')):
        # Check for nodes with too many outgoing edges (may render poorly)
        # Find all node connections (e.g., "NodeA --> NodeB")
        connections = re.findall(r'(\w+)\s*(?:-->|->|---|-\.->)', diagram)
        if connections:
            from collections import Counter
            node_counts = Counter(connections)
            for node, count in node_counts.items():
                if count > 4:
                    warnings.append(f"Node '{node}' has {count} outgoing connections - consider using subgraphs for clarity")

        # Check for potential subgraph cycles
        # If a node is defined inside a subgraph and also referenced outside,
        # and that subgraph is named the same as the node, it creates a cycle
        subgraph_names = re.findall(r'subgraph\s+(\w+)', diagram)
        node_ids = re.findall(r'(\w+)\[', diagram)
        for sg_name in subgraph_names:
            if sg_name in node_ids:
                warnings.append(f"Subgraph '{sg_name}' has same name as a node - this may cause cycles. Use different names.")

    # Return errors (warnings are just informational for now)
    return errors

def main():
    docs_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('docs')

    if not docs_dir.exists():
        print(f"{Colors.RED}Error: Directory '{docs_dir}' not found{Colors.NC}")
        sys.exit(1)

    print(f"Validating Mermaid diagrams in {docs_dir}...")
    print()

    total_diagrams = 0
    invalid_diagrams = 0
    results: Dict[str, List[Tuple[int, List[str]]]] = {}

    # Find all markdown files
    md_files = sorted(docs_dir.rglob('*.md'))

    for md_file in md_files:
        diagrams = extract_mermaid_diagrams(md_file)

        for line_num, diagram_content in diagrams:
            total_diagrams += 1
            errors = validate_diagram(diagram_content)

            if errors:
                invalid_diagrams += 1
                rel_path = md_file.relative_to(docs_dir.parent)
                if str(rel_path) not in results:
                    results[str(rel_path)] = []
                results[str(rel_path)].append((line_num, errors))
                print(f"{Colors.RED}✗ Invalid diagram in {rel_path}:{line_num}{Colors.NC}")
                for error in errors:
                    print(f"  - {error}")
            else:
                rel_path = md_file.relative_to(docs_dir.parent)
                print(f"{Colors.GREEN}✓ Valid diagram in {rel_path}:{line_num}{Colors.NC}")

    # Summary
    print()
    print("=" * 40)
    print("Validation Summary")
    print("=" * 40)
    print(f"Total diagrams: {total_diagrams}")
    print(f"{Colors.GREEN}Valid: {total_diagrams - invalid_diagrams}{Colors.NC}")
    print(f"{Colors.RED}Invalid: {invalid_diagrams}{Colors.NC}")

    if invalid_diagrams > 0:
        print()
        print(f"{Colors.YELLOW}Files with invalid diagrams:{Colors.NC}")
        for file_path, issues in results.items():
            print(f"  {file_path}")
            for line_num, errors in issues:
                print(f"    Line {line_num}: {len(errors)} issue(s)")

        print()
        print(f"{Colors.YELLOW}To fix invalid diagrams, run:{Colors.NC}")
        print("  claude /prodigy-fix-mermaid-diagrams")
        sys.exit(1)
    else:
        print()
        print(f"{Colors.GREEN}✓ All Mermaid diagrams are valid!{Colors.NC}")
        sys.exit(0)

if __name__ == '__main__':
    main()
