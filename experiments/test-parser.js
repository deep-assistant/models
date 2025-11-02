/**
 * Experiment: Test the official links-notation parser
 * Purpose: Understand how to use the official parser and what output it produces
 */

import { Parser, Link } from 'links-notation';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testParser() {
  console.log('=== Testing Links Notation Official Parser ===\n');

  // Initialize parser
  const parser = new Parser();
  await parser.initialize();
  console.log('Parser initialized ✓\n');

  // Read sample .lino file
  const samplePath = join(__dirname, '../providers/anthropic/models/claude-3-5-sonnet-20241022.lino');
  const content = readFileSync(samplePath, 'utf-8');

  console.log('Sample .lino file content:');
  console.log('---');
  console.log(content);
  console.log('---\n');

  // Parse the content
  console.log('Parsing with official parser...\n');
  try {
    const result = parser.parse(content);

    console.log('Parse result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n');

    console.log('Result type:', typeof result);
    console.log('Is Array:', Array.isArray(result));
    console.log('Length:', result?.length);
    console.log('\n');

    if (Array.isArray(result)) {
      console.log('First few links:');
      result.slice(0, 5).forEach((link, i) => {
        console.log(`\nLink ${i}:`);
        console.log('  toString():', link.toString());
        console.log('  id:', link.id);
        console.log('  values:', link.values);
        console.log('  values type:', typeof link.values);
        console.log('  values isArray:', Array.isArray(link.values));
      });
    }

  } catch (error) {
    console.error('Parse error:', error);
    console.error('Error stack:', error.stack);
  }
}

testParser().catch(console.error);
