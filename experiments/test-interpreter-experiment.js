/**
 * Experiment: Design interpreter to convert parsed Links to JSON model
 * Purpose: Work out the logic to interpret the official parser output
 */

import { Parser } from 'links-notation';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Interpret parsed links into a model object
 * @param {Array} links - Parsed links from official parser
 * @returns {object} Model data structure
 */
function interpretLinks(links) {
  const model = {};

  // Helper to get the deepest value from a link chain
  function getDeepestValue(link) {
    if (!link || !link.values || link.values.length === 0) {
      return link?.id || null;
    }

    // If it's a wrapper with a single value, unwrap it
    if (link.id === null && link.values.length === 1) {
      return getDeepestValue(link.values[0]);
    }

    // If it has multiple values, return them
    return link.values.map(v => getDeepestValue(v));
  }

  // Helper to extract field path from a nested link structure
  function extractFieldPath(link) {
    const path = [];

    function collectIds(l) {
      if (!l) return;

      // Add non-null ids
      if (l.id !== null) {
        path.push(l.id);
      }

      // For values that are leaf nodes (no children), add their ids
      if (l.values && l.values.length > 0) {
        for (const v of l.values) {
          if (v.id !== null && (!v.values || v.values.length === 0)) {
            path.push(v.id);
          } else if (v.values && v.values.length > 0) {
            collectIds(v);
          }
        }
      }
    }

    collectIds(link);
    return path;
  }

  // Process links looking for hierarchical patterns
  for (const link of links) {
    const linkStr = link.toString();

    // Pattern: ((model 'Name') (field1 field2 ...) ) (value)
    // This represents: model.field1.field2 = value
    if (link._isFromPathCombination && link.values && link.values.length === 2) {
      const [pathLink, valueLink] = link.values;
      const path = extractFieldPath(pathLink);
      const value = getDeepestValue(valueLink);

      console.log('Path:', path);
      console.log('Value:', value);
      console.log('Link string:', linkStr);
      console.log('---');

      // Interpret based on path structure
      // Skip the model name (first 2 elements: 'model' and actual name)
      if (path.length > 2) {
        const fieldPath = path.slice(2); // Remove 'model' and name from path

        // Set value in model based on field path
        if (fieldPath.length === 2 && fieldPath[0] === 'released' && fieldPath[1] === 'at') {
          model.releaseDate = value;
        } else if (fieldPath.length === 3 && fieldPath[0] === 'last' && fieldPath[1] === 'updated' && fieldPath[2] === 'at') {
          model.lastUpdated = value;
        } else if (fieldPath.length === 4 && fieldPath[0] === 'has' && fieldPath[1] === 'knowledge' && fieldPath[2] === 'cutoff' && fieldPath[3] === 'at') {
          model.knowledgeCutoff = value;
        } else if (fieldPath.length === 1 && fieldPath[0] === 'weights') {
          model.openWeights = value === 'open';
        } else if (fieldPath.length === 1 && fieldPath[0] === 'capabilities') {
          model.capabilities = Array.isArray(value) ? value : [value];
        } else if (fieldPath.length === 2 && fieldPath[0] === 'modalities') {
          if (!model.modalities) model.modalities = {};
          if (fieldPath[1] === 'input') {
            model.modalities.input = Array.isArray(value) ? value : [value];
          } else if (fieldPath[1] === 'output') {
            model.modalities.output = Array.isArray(value) ? value : [value];
          }
        } else if (fieldPath.length === 2 && fieldPath[0] === 'limits') {
          if (!model.limits) model.limits = {};
          if (fieldPath[1] === 'context') {
            const cleaned = typeof value === 'string' ? value.replace(/'/g, '').replace(/ /g, '') : value;
            model.limits.context = parseInt(cleaned);
          } else if (fieldPath[1] === 'output') {
            const cleaned = typeof value === 'string' ? value.replace(/'/g, '').replace(/ /g, '') : value;
            model.limits.output = parseInt(cleaned);
          }
        } else if (fieldPath.length === 2 && fieldPath[0] === 'costs') {
          if (!model.costs) model.costs = {};
          if (fieldPath[1] === 'input') {
            model.costs.input = parseFloat(value);
          } else if (fieldPath[1] === 'output') {
            model.costs.output = parseFloat(value);
          } else if (fieldPath[1] === 'cacheRead') {
            model.costs.cacheRead = parseFloat(value);
          } else if (fieldPath[1] === 'cacheWrite') {
            model.costs.cacheWrite = parseFloat(value);
          }
        }
      }
    }

    // Pattern: (model 'Name') - this is the model name
    else if (!link._isFromPathCombination && link.id === null && link.values && link.values.length === 2) {
      const [first, second] = link.values;
      if (first.id === 'model' && second.id) {
        model.name = second.id;
      }
    }
  }

  return model;
}

async function testInterpreter() {
  console.log('=== Testing Links Interpreter ===\n');

  const parser = new Parser();
  const samplePath = join(__dirname, 'public/providers/anthropic/models/claude-3-5-sonnet-20241022.lino');
  const content = readFileSync(samplePath, 'utf-8');

  const links = parser.parse(content);
  console.log(`Parsed ${links.length} links\n`);

  const model = interpretLinks(links);

  console.log('\n=== Final Model ===');
  console.log(JSON.stringify(model, null, 2));
}

testInterpreter().catch(console.error);
