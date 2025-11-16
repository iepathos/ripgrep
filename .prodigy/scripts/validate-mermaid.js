#!/usr/bin/env node

/**
 * Validates all Mermaid diagrams in the docs directory using @mermaid-js/mermaid-cli.
 * Usage: node validate-mermaid.js [docs_dir]
 */

import { readFileSync, readdirSync, statSync, writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join, relative } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

// Colors for terminal output
const Colors = {
  RED: '\x1b[0;31m',
  GREEN: '\x1b[0;32m',
  YELLOW: '\x1b[1;33m',
  NC: '\x1b[0m'  // No Color
};

/**
 * Extract all Mermaid diagrams from a markdown file.
 * @param {string} filePath - Path to markdown file
 * @returns {Array<{line: number, content: string}>} Array of diagrams with line numbers
 */
function extractMermaidDiagrams(filePath) {
  const diagrams = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let inMermaid = false;
  let startLine = 0;
  let diagramLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '```mermaid') {
      inMermaid = true;
      startLine = i + 1;
      diagramLines = [];
    } else if (inMermaid && line.trim() === '```') {
      diagrams.push({
        line: startLine,
        content: diagramLines.join('\n')
      });
      inMermaid = false;
    } else if (inMermaid) {
      diagramLines.push(line);
    }
  }

  return diagrams;
}

/**
 * Analyze diagram structure to identify patterns.
 * @param {string} diagram - Diagram content
 * @param {string[]} lines - Diagram lines (trimmed)
 * @returns {{isLinearProgression: boolean, isWideTree: boolean, maxBranchWidth: number, spineLength: number}}
 */
function analyzeGraphStructure(diagram, lines) {
  // Build adjacency map
  const adjacency = new Map(); // node -> [children]
  const inDegree = new Map(); // node -> count of incoming edges

  for (const line of lines) {
    // Match arrows: A --> B or A -->|label| B
    const arrowMatch = line.match(/(\w+)\s*--+>(?:\|[^|]+\|)?\s*(\w+)/);
    if (arrowMatch) {
      const source = arrowMatch[1];
      const target = arrowMatch[2];

      if (!adjacency.has(source)) adjacency.set(source, []);
      adjacency.get(source).push(target);

      inDegree.set(target, (inDegree.get(target) || 0) + 1);
      if (!inDegree.has(source)) inDegree.set(source, 0);
    }
  }

  // Find max branch width (max children from any single node)
  let maxBranchWidth = 0;
  for (const children of adjacency.values()) {
    maxBranchWidth = Math.max(maxBranchWidth, children.length);
  }

  // Find spine length (longest path with low branching)
  let spineLength = 0;
  for (const [node, children] of adjacency.entries()) {
    if (children.length <= 2) { // Part of spine if ≤2 children
      spineLength++;
    }
  }

  // Detect reconvergence (nodes with multiple incoming edges)
  const hasReconvergence = Array.from(inDegree.values()).some(deg => deg > 1);

  // Linear progression: long spine, modest branching, some reconvergence
  const isLinearProgression = spineLength >= 5 && maxBranchWidth <= 5 && hasReconvergence;

  // Wide tree: high branch width, no reconvergence
  const isWideTree = maxBranchWidth > 8 && !hasReconvergence;

  return { isLinearProgression, isWideTree, maxBranchWidth, spineLength };
}

/**
 * Check diagram readability by analyzing complexity.
 * @param {string} diagram - Diagram content
 * @returns {{readable: boolean, warnings: string[]}}
 */
function checkDiagramReadability(diagram) {
  const warnings = [];
  const lines = diagram.split('\n').map(l => l.trim());

  // Detect diagram type and direction
  const firstLine = lines[0] || '';
  const isVertical = /graph\s+(TD|TB)|flowchart\s+(TD|TB)/i.test(firstLine);
  const isHorizontal = /graph\s+LR|flowchart\s+LR/i.test(firstLine);

  if (!isVertical && !isHorizontal) {
    // Other diagram types (stateDiagram, etc.) - no complexity check
    return { readable: true, warnings: [] };
  }

  // Count nodes (approximate by counting node definitions)
  // Node patterns: A[Label], A{Label}, A(Label), A((Label)), etc.
  const nodeMatches = diagram.match(/\w+[\[\{\(]/g) || [];
  const nodeCount = new Set(nodeMatches.map(m => m.replace(/[\[\{\(].*/, ''))).size;

  // Analyze graph structure for pattern detection
  const structure = analyzeGraphStructure(diagram, lines);

  // Check for wide vertical diagrams
  if (isVertical && structure.isWideTree) {
    warnings.push(
      `Wide tree diagram with ${structure.maxBranchWidth} parallel branches (>8 max). ` +
      `Consider using 'graph LR' for better readability or split into multiple diagrams.`
    );
  } else if (isVertical && structure.isLinearProgression) {
    warnings.push(
      `Linear progression diagram with branches (spine: ${structure.spineLength} nodes, max branch: ${structure.maxBranchWidth}). ` +
      `Consider simplifying by removing detail nodes or using subgraphs instead of converting to LR.`
    );
  }

  // Check for excessive total nodes (any layout)
  if (nodeCount > 20) {
    warnings.push(
      `Complex diagram with ${nodeCount} nodes (>20). ` +
      `Consider breaking into focused sub-diagrams or using subgraphs for organization.`
    );
  }

  return {
    readable: warnings.length === 0,
    warnings
  };
}

/**
 * Validate a single Mermaid diagram using mmdc CLI.
 * @param {string} diagram - Diagram content
 * @returns {{valid: boolean, error: string|null, readable: boolean, warnings: string[]}}
 */
function validateDiagram(diagram) {
  const tempDir = mkdtempSync(join(tmpdir(), 'mermaid-'));
  const inputFile = join(tempDir, 'diagram.mmd');
  const outputFile = join(tempDir, 'output.svg');

  try {
    // Write diagram to temp file
    writeFileSync(inputFile, diagram, 'utf-8');

    // Try to render with mmdc - if it succeeds, diagram is valid
    execSync(
      `./node_modules/.bin/mmdc -i "${inputFile}" -o "${outputFile}" -q`,
      {
        stdio: 'pipe',
        timeout: 10000
      }
    );

    // Clean up temp files
    try {
      unlinkSync(inputFile);
      unlinkSync(outputFile);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Check readability
    const readability = checkDiagramReadability(diagram);

    return {
      valid: true,
      error: null,
      ...readability
    };
  } catch (error) {
    // Clean up temp file
    try {
      unlinkSync(inputFile);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Extract error message from stderr
    const stderr = error.stderr?.toString() || error.message || String(error);
    const errorMsg = stderr
      .split('\n')
      .find(line => line.includes('Error:') || line.includes('Parse error'))
      || stderr.trim() || 'Unknown validation error';

    return {
      valid: false,
      error: errorMsg,
      readable: false,
      warnings: []
    };
  }
}

/**
 * Find all markdown files in a directory recursively.
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function findMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip hidden directories
        if (!entry.startsWith('.')) {
          traverse(fullPath);
        }
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files.sort();
}

/**
 * Main validation function
 */
async function main() {
  // Docs dir from argument (expected to be absolute path from shell script)
  const docsDir = process.argv[2] || join(process.cwd(), 'docs');
  // Base dir for relative path calculation - use the directory containing 'docs'
  // Extract parent directory from absolute docs path
  const baseDir = join(docsDir, '..');

  console.log(`Validating Mermaid diagrams in ${docsDir}...\n`);

  let totalDiagrams = 0;
  let invalidDiagrams = 0;
  let unreadableDiagrams = 0;
  const results = {};
  const readabilityIssues = {};

  try {
    const mdFiles = findMarkdownFiles(docsDir);

    for (const mdFile of mdFiles) {
      const diagrams = extractMermaidDiagrams(mdFile);

      for (const { line, content } of diagrams) {
        totalDiagrams++;
        const validation = validateDiagram(content);

        const relPath = relative(baseDir, mdFile);

        if (!validation.valid) {
          invalidDiagrams++;

          if (!results[relPath]) {
            results[relPath] = [];
          }
          results[relPath].push({
            line,
            error: validation.error
          });

          console.log(`${Colors.RED}✗ Invalid diagram in ${relPath}:${line}${Colors.NC}`);
          console.log(`  ${validation.error}\n`);
        } else if (!validation.readable && validation.warnings.length > 0) {
          unreadableDiagrams++;

          if (!readabilityIssues[relPath]) {
            readabilityIssues[relPath] = [];
          }
          readabilityIssues[relPath].push({
            line,
            warnings: validation.warnings
          });

          console.log(`${Colors.YELLOW}⚠ Readability issue in ${relPath}:${line}${Colors.NC}`);
          for (const warning of validation.warnings) {
            console.log(`  ${warning}`);
          }
          console.log('');
        } else {
          console.log(`${Colors.GREEN}✓ Valid diagram in ${relPath}:${line}${Colors.NC}`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(40));
    console.log('Validation Summary');
    console.log('='.repeat(40));
    console.log(`Total diagrams: ${totalDiagrams}`);
    console.log(`${Colors.GREEN}Valid & Readable: ${totalDiagrams - invalidDiagrams - unreadableDiagrams}${Colors.NC}`);
    console.log(`${Colors.YELLOW}Valid but Unreadable: ${unreadableDiagrams}${Colors.NC}`);
    console.log(`${Colors.RED}Invalid: ${invalidDiagrams}${Colors.NC}`);

    // Show readability issues first (warnings, not errors)
    if (unreadableDiagrams > 0) {
      console.log(`\n${Colors.YELLOW}Files with readability issues:${Colors.NC}`);
      for (const [filePath, issues] of Object.entries(readabilityIssues)) {
        console.log(`  ${filePath}`);
        for (const { line, warnings } of issues) {
          console.log(`    Line ${line}:`);
          for (const warning of warnings) {
            console.log(`      - ${warning}`);
          }
        }
      }
      console.log(`\n${Colors.YELLOW}These diagrams render correctly but may be hard to read.${Colors.NC}`);
      console.log(`${Colors.YELLOW}Consider using 'graph LR' or splitting into multiple diagrams.${Colors.NC}`);
    }

    if (invalidDiagrams > 0) {
      console.log(`\n${Colors.YELLOW}Files with invalid diagrams:${Colors.NC}`);
      for (const [filePath, issues] of Object.entries(results)) {
        console.log(`  ${filePath}`);
        for (const { line, error } of issues) {
          console.log(`    Line ${line}: ${error}`);
        }
      }

      console.log(`\n${Colors.YELLOW}To fix invalid diagrams, run:${Colors.NC}`);
      console.log('  claude /prodigy-fix-mermaid-diagrams');

      // Output structured JSON for Claude to consume on stderr
      console.error(JSON.stringify({
        total: totalDiagrams,
        invalid: invalidDiagrams,
        unreadable: unreadableDiagrams,
        files: results,
        readabilityIssues: readabilityIssues
      }));

      process.exit(1);
    } else if (unreadableDiagrams > 0) {
      console.log(`\n${Colors.YELLOW}⚠ All diagrams are syntactically valid, but ${unreadableDiagrams} may be hard to read.${Colors.NC}`);
      console.log(`${Colors.YELLOW}Review the warnings above and consider refactoring for better readability.${Colors.NC}`);

      // Output structured JSON for Claude to consume on stderr
      console.error(JSON.stringify({
        total: totalDiagrams,
        invalid: 0,
        unreadable: unreadableDiagrams,
        files: {},
        readabilityIssues: readabilityIssues
      }));

      process.exit(0);  // Don't fail the build for readability warnings
    } else {
      console.log(`\n${Colors.GREEN}✓ All Mermaid diagrams are valid and readable!${Colors.NC}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${Colors.RED}Error during validation:${Colors.NC}`, error.message);
    process.exit(1);
  }
}

main();
