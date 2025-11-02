#!/usr/bin/env node

/**
 * Convert TOML model files to .lino (Links Notation) format
 */

const fs = require('fs');
const path = require('path');

/**
 * Simple TOML parser for our specific use case
 */
function parseTOML(content) {
  const lines = content.split('\n');
  const data = {};
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      data[currentSection] = {};
      continue;
    }

    // Key-value pair
    const match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      const parsedValue = parseValue(value);

      if (currentSection) {
        data[currentSection][key] = parsedValue;
      } else {
        data[key] = parsedValue;
      }
    }
  }

  return data;
}

/**
 * Parse a TOML value
 */
function parseValue(value) {
  value = value.trim();

  // String
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  // Array
  if (value.startsWith('[') && value.endsWith(']')) {
    const items = value.slice(1, -1).split(',').map(item => {
      item = item.trim();
      if (item.startsWith('"') && item.endsWith('"')) {
        return item.slice(1, -1);
      }
      return item;
    });
    return items;
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Number (including underscores)
  const numberMatch = value.match(/^[\d_]+\.?\d*$/);
  if (numberMatch) {
    return parseFloat(value.replace(/_/g, ''));
  }

  return value;
}

/**
 * Format numbers with spaces as thousands separators
 */
function formatNumber(value) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return `'${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}'`;
  }
  return value.toString();
}

/**
 * Convert TOML data to .lino format
 */
function tomlToLino(data) {
  const lines = [];

  // Model name
  const modelName = data.name || '';
  lines.push(`model '${modelName}'`);

  // Release date
  if (data.release_date) {
    lines.push(`  released at`);
    lines.push(`    ${data.release_date}`);
  }

  // Last updated
  if (data.last_updated) {
    lines.push(`  last updated at`);
    lines.push(`    ${data.last_updated}`);
  }

  // Knowledge cutoff
  if (data.knowledge) {
    lines.push(`  has knowledge cutoff at`);
    lines.push(`    ${data.knowledge}`);
  }

  // Weights
  if (data.open_weights !== undefined) {
    const weightsStatus = data.open_weights ? 'open' : 'closed';
    lines.push(`  weights`);
    lines.push(`    ${weightsStatus}`);
  }

  // Capabilities
  const capabilities = [];
  if (data.reasoning) capabilities.push('reasoning');
  if (data.tool_call) capabilities.push('tool calls');
  if (data.temperature) capabilities.push('temperature');
  if (data.attachment) capabilities.push('attachments');

  if (capabilities.length > 0) {
    lines.push(`  capabilities`);
    lines.push(`    (`);
    for (const cap of capabilities) {
      lines.push(`      ${cap}`);
    }
    lines.push(`    )`);
  }

  // Modalities
  if (data.modalities) {
    lines.push(`  modalities`);

    if (data.modalities.input) {
      lines.push(`    input`);
      const inputMods = data.modalities.input.join(' ');
      lines.push(`      ${inputMods}`);
    }

    if (data.modalities.output) {
      lines.push(`    output`);
      const outputMods = data.modalities.output.join(' ');
      lines.push(`      ${outputMods}`);
    }
  }

  // Limits
  if (data.limit) {
    lines.push(`  limits`);

    if (data.limit.context !== undefined) {
      lines.push(`    context`);
      lines.push(`      ${formatNumber(data.limit.context)}`);
    }

    if (data.limit.output !== undefined) {
      lines.push(`    output`);
      lines.push(`      ${formatNumber(data.limit.output)}`);
    }
  }

  // Costs
  if (data.cost) {
    lines.push(`  costs`);

    if (data.cost.input !== undefined) {
      lines.push(`    input`);
      lines.push(`      ${data.cost.input.toFixed(2)}`);
    }

    if (data.cost.output !== undefined) {
      lines.push(`    output`);
      lines.push(`      ${data.cost.output.toFixed(2)}`);
    }

    if (data.cost.cache_read !== undefined) {
      lines.push(`    cacheRead`);
      lines.push(`      ${data.cost.cache_read.toFixed(2)}`);
    }

    if (data.cost.cache_write !== undefined) {
      lines.push(`    cacheWrite`);
      lines.push(`      ${data.cost.cache_write.toFixed(2)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: toml-to-lino.js <input.toml> <output.lino>');
    process.exit(1);
  }

  const [inputFile, outputFile] = args;

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file ${inputFile} does not exist`);
    process.exit(1);
  }

  const tomlContent = fs.readFileSync(inputFile, 'utf8');
  const data = parseTOML(tomlContent);
  const linoContent = tomlToLino(data);

  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, linoContent, 'utf8');

  console.log(`Converted ${inputFile} -> ${outputFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseTOML, tomlToLino };
