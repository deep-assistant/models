/**
 * Experiment: Understand how capabilities are parsed
 */

import { Parser } from 'links-notation';

const content = `model 'Test Model'
  capabilities
    (
      tool calls
      temperature
      attachments
    )`;

const parser = new Parser();
const links = parser.parse(content);

console.log('Total links:', links.length);
console.log('\n=== All Links ===');
links.forEach((link, i) => {
  console.log(`\nLink ${i}:`);
  console.log('  toString():', link.toString());
  console.log('  JSON:', JSON.stringify(link, null, 2));
});

// Find the capabilities link
const capLink = links.find(l => l.toString().includes('capabilities'));
console.log('\n=== Capabilities Link ===');
console.log(JSON.stringify(capLink, null, 2));
