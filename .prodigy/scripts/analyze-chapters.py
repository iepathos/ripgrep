#!/usr/bin/env python3
"""Analyze MkDocs chapter structure for size and complexity."""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Any

SIZE_THRESHOLD = 500
SECTION_THRESHOLD = 100
CODE_BLOCK_RATIO_THRESHOLD = 0.4
MIN_SUBSECTIONS = 3
MAX_SUBSECTIONS = 12


def count_lines(file_path: Path) -> Tuple[int, int, int]:
    """Count total lines, content lines, and code block lines."""
    if not file_path.exists():
        return 0, 0, 0

    content = file_path.read_text(encoding='utf-8')
    lines = content.split('\n')
    total_lines = len(lines)

    # Count code block lines
    in_code_block = False
    code_lines = 0
    content_lines = 0

    for line in lines:
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue

        if in_code_block:
            code_lines += 1
        elif line.strip():  # Non-empty, non-code line
            content_lines += 1

    return total_lines, content_lines, code_lines


def extract_sections(file_path: Path) -> List[Dict[str, Any]]:
    """Extract H2 sections with metadata."""
    if not file_path.exists():
        return []

    content = file_path.read_text(encoding='utf-8')
    lines = content.split('\n')

    sections = []
    current_section = None
    current_start = 0
    in_code_block = False

    for i, line in enumerate(lines):
        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue

        # Detect H2 headers (## Title)
        if not in_code_block and line.startswith('## ') and not line.startswith('###'):
            # Save previous section
            if current_section:
                current_section['end_line'] = i - 1
                current_section['line_count'] = i - current_start

                # Count content lines in section
                section_lines = lines[current_start:i]
                content_count = sum(1 for l in section_lines if l.strip() and not l.strip().startswith('```'))
                current_section['content_lines'] = content_count

                sections.append(current_section)

            # Start new section
            title = line[3:].strip()  # Remove "## "
            current_section = {
                'title': title,
                'start_line': i,
                'line_count': 0,
                'content_lines': 0
            }
            current_start = i

    # Save last section
    if current_section:
        current_section['end_line'] = len(lines) - 1
        current_section['line_count'] = len(lines) - current_start

        section_lines = lines[current_start:]
        content_count = sum(1 for l in section_lines if l.strip() and not l.strip().startswith('```'))
        current_section['content_lines'] = content_count

        sections.append(current_section)

    return sections


def analyze_heading_hierarchy(file_path: Path) -> Dict[str, int]:
    """Count headings by level."""
    if not file_path.exists():
        return {'h1': 0, 'h2': 0, 'h3': 0, 'h4': 0}

    content = file_path.read_text(encoding='utf-8')
    lines = content.split('\n')

    counts = {'h1': 0, 'h2': 0, 'h3': 0, 'h4': 0}
    in_code_block = False

    for line in lines:
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue

        if not in_code_block:
            if line.startswith('# ') and not line.startswith('##'):
                counts['h1'] += 1
            elif line.startswith('## ') and not line.startswith('###'):
                counts['h2'] += 1
            elif line.startswith('### ') and not line.startswith('####'):
                counts['h3'] += 1
            elif line.startswith('#### '):
                counts['h4'] += 1

    return counts


def classify_chapter(total_lines: int, sections: List[Dict], content_lines: int) -> Tuple[str, str]:
    """Classify chapter complexity and recommend action."""
    substantial_sections = [s for s in sections if s['content_lines'] >= SECTION_THRESHOLD]

    # Oversized - needs subsections
    if total_lines > SIZE_THRESHOLD and len(substantial_sections) >= MIN_SUBSECTIONS:
        return 'high', 'split_into_subsections'

    # Large - consider subsections
    if total_lines > SIZE_THRESHOLD * 0.7 and len(sections) >= 4:
        return 'medium', 'consider_subsections'

    # Too small - may need consolidation
    if total_lines < 100:
        return 'info', 'consider_consolidation'

    # Well-sized
    return 'low', 'no_action'


def kebab_case(text: str) -> str:
    """Convert text to kebab-case."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text)
    return text


def generate_subsection_recommendations(chapter: Dict, sections: List[Dict], base_path: Path) -> List[Dict]:
    """Generate subsection recommendations for oversized chapters."""
    recommendations = []

    # Only recommend for substantial sections
    substantial_sections = [s for s in sections if s['content_lines'] >= SECTION_THRESHOLD]

    # Skip meta-content sections
    meta_keywords = ['best practices', 'troubleshooting', 'tips', 'notes', 'summary']

    for section in substantial_sections:
        title_lower = section['title'].lower()
        if any(keyword in title_lower for keyword in meta_keywords):
            continue

        subsection_id = kebab_case(section['title'])
        parent_id = chapter['id']

        recommendation = {
            'id': subsection_id,
            'title': section['title'],
            'file': f"docs/{parent_id}/{subsection_id}.md",
            'estimated_lines': section['line_count'],
            'source_sections': [section['title']],
            'reason': f"Substantial content ({section['content_lines']} lines) focused on specific topic"
        }
        recommendations.append(recommendation)

    return recommendations[:MAX_SUBSECTIONS]  # Limit to max subsections


def analyze_single_file_chapter(chapter: Dict, base_path: Path) -> Dict:
    """Analyze a single-file chapter."""
    file_path = base_path / chapter['file']

    total_lines, content_lines, code_lines = count_lines(file_path)
    sections = extract_sections(file_path)
    headings = analyze_heading_hierarchy(file_path)

    priority, action = classify_chapter(total_lines, sections, content_lines)

    code_ratio = code_lines / total_lines if total_lines > 0 else 0
    substantial_sections = [s for s in sections if s['content_lines'] >= SECTION_THRESHOLD]

    analysis = {
        'chapter_id': chapter['id'],
        'chapter_title': chapter['title'],
        'current_file': chapter['file'],
        'type': 'single-file',
        'priority': priority,
        'recommended_action': action,
        'metrics': {
            'total_lines': total_lines,
            'content_lines': content_lines,
            'code_lines': code_lines,
            'code_block_ratio': round(code_ratio, 2),
            'h2_sections': len(sections),
            'substantial_sections': len(substantial_sections),
            'heading_counts': headings
        }
    }

    # Add subsection recommendations for oversized chapters
    if action in ['split_into_subsections', 'consider_subsections']:
        subsections = generate_subsection_recommendations(chapter, sections, base_path)
        if subsections:
            analysis['proposed_structure'] = {
                'type': 'multi-subpage',
                'index_file': f"docs/{chapter['id']}/index.md",
                'subsections': subsections
            }

    return analysis


def analyze_multi_subpage_chapter(chapter: Dict, base_path: Path) -> Dict:
    """Analyze a multi-subpage chapter."""
    index_path = base_path / chapter['index_file']

    # Analyze index file
    index_total, index_content, _ = count_lines(index_path)

    # Analyze each subpage
    subpage_metrics = []
    total_subpage_lines = 0

    for subpage in chapter.get('subpages', []):
        subpage_path = base_path / subpage['file']
        total, content, code = count_lines(subpage_path)
        total_subpage_lines += total

        subpage_metrics.append({
            'id': subpage['id'],
            'title': subpage['title'],
            'file': subpage['file'],
            'total_lines': total,
            'content_lines': content
        })

    # Check for balance
    if subpage_metrics:
        avg_lines = total_subpage_lines / len(subpage_metrics)
        max_lines = max(m['total_lines'] for m in subpage_metrics)
        min_lines = min(m['total_lines'] for m in subpage_metrics)

        # Flag if one subpage is >2x average
        imbalanced = max_lines > 2 * avg_lines if avg_lines > 0 else False
        oversized_subpages = [m for m in subpage_metrics if m['total_lines'] > 300]
    else:
        imbalanced = False
        oversized_subpages = []

    analysis = {
        'chapter_id': chapter['id'],
        'chapter_title': chapter['title'],
        'type': 'multi-subpage',
        'priority': 'info',
        'recommended_action': 'no_action',
        'metrics': {
            'index_lines': index_total,
            'index_content_lines': index_content,
            'total_subpages': len(subpage_metrics),
            'total_subpage_lines': total_subpage_lines,
            'average_subpage_lines': round(total_subpage_lines / len(subpage_metrics), 0) if subpage_metrics else 0,
            'subpage_metrics': subpage_metrics
        }
    }

    # Check for issues
    if imbalanced:
        analysis['priority'] = 'medium'
        analysis['issue'] = 'imbalanced_subpages'
        analysis['recommended_action'] = 'rebalance_subpages'

    if oversized_subpages:
        analysis['oversized_subpages'] = oversized_subpages
        if not imbalanced:
            analysis['priority'] = 'low'
            analysis['issue'] = 'oversized_subpages'

    if index_total == 0:
        analysis['priority'] = 'medium'
        analysis['issue'] = 'missing_index'
        analysis['recommended_action'] = 'create_index'

    return analysis


def process_pages(pages: List[Dict], base_path: Path) -> List[Dict]:
    """Recursively process all pages."""
    results = []

    for page in pages:
        # Skip section containers
        if page.get('type') == 'section':
            results.extend(process_pages(page.get('pages', []), base_path))
            continue

        # Analyze multi-subpage chapters
        if page.get('type') == 'multi-subpage':
            analysis = analyze_multi_subpage_chapter(page, base_path)
            results.append(analysis)
            continue

        # Analyze single-file chapters
        if 'file' in page:
            analysis = analyze_single_file_chapter(page, base_path)
            results.append(analysis)

    return results


def main():
    """Main analysis function."""
    # Load configuration
    base_path = Path('/Users/glen/.prodigy/worktrees/ripgrep/session-e4aaa127-1a02-4085-9479-1ebd4ed1eca6')
    pages_path = base_path / 'workflows/data/mkdocs-chapters.json'
    output_path = base_path / '.prodigy/mkdocs-analysis/structure-report.json'

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load pages
    with open(pages_path, 'r') as f:
        config = json.load(f)

    # Analyze all pages
    analyses = process_pages(config['pages'], base_path)

    # Categorize results
    oversized = [a for a in analyses if a['priority'] == 'high']
    large = [a for a in analyses if a['priority'] == 'medium']
    well_sized = [a for a in analyses if a['priority'] == 'low']
    multi_subpage = [a for a in analyses if a['type'] == 'multi-subpage']

    # Generate report
    report = {
        'analysis_date': datetime.now().isoformat(),
        'project': 'ripgrep',
        'pages_analyzed': len(analyses),
        'thresholds': {
            'size_threshold': SIZE_THRESHOLD,
            'section_threshold': SECTION_THRESHOLD
        },
        'summary': {
            'oversized_pages': len(oversized),
            'large_pages': len(large),
            'well_sized_pages': len(well_sized),
            'multi_subpage_pages': len(multi_subpage)
        },
        'recommendations': [a for a in analyses if a['recommended_action'] != 'no_action'],
        'well_organized_pages': well_sized
    }

    # Write report
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
