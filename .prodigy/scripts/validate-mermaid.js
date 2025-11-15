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
 * Validate a single Mermaid diagram using mmdc CLI.
 * @param {string} diagram - Diagram content
 * @returns {{valid: boolean, error: string|null}}
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

    return {
      valid: true,
      error: null
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
      error: errorMsg
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
  const docsDir = process.argv[2] || 'docs';
  const baseDir = process.cwd();

  console.log(`Validating Mermaid diagrams in ${docsDir}...\n`);

  let totalDiagrams = 0;
  let invalidDiagrams = 0;
  const results = {};

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
    console.log(`${Colors.GREEN}Valid: ${totalDiagrams - invalidDiagrams}${Colors.NC}`);
    console.log(`${Colors.RED}Invalid: ${invalidDiagrams}${Colors.NC}`);

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
        files: results
      }));

      process.exit(1);
    } else {
      console.log(`\n${Colors.GREEN}✓ All Mermaid diagrams are valid!${Colors.NC}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${Colors.RED}Error during validation:${Colors.NC}`, error.message);
    process.exit(1);
  }
}

main();
