/**
 * Parse .lino (Links Notation) files to extract model data
 */

/**
 * Parse a .lino file content into a structured object
 * @param {string} content - The .lino file content
 * @returns {object} Parsed model data
 */
export function parseLinoFile(content) {
  const lines = content.split('\n').map(line => line.trimEnd());
  const model = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Model name (first line)
    if (line.startsWith("model '")) {
      const match = line.match(/model '(.+)'/);
      if (match) {
        model.name = match[1];
      }
      i++;
      continue;
    }

    // Get indentation level (reserved for future use)
    // const indent = line.search(/\S/);

    // Released at
    if (line.trim() === 'released at') {
      i++;
      if (i < lines.length) {
        model.releaseDate = lines[i].trim();
      }
      i++;
      continue;
    }

    // Last updated at
    if (line.trim() === 'last updated at') {
      i++;
      if (i < lines.length) {
        model.lastUpdated = lines[i].trim();
      }
      i++;
      continue;
    }

    // Knowledge cutoff
    if (line.trim() === 'has knowledge cutoff at') {
      i++;
      if (i < lines.length) {
        model.knowledgeCutoff = lines[i].trim();
      }
      i++;
      continue;
    }

    // Weights
    if (line.trim() === 'weights') {
      i++;
      if (i < lines.length) {
        model.openWeights = lines[i].trim() === 'open';
      }
      i++;
      continue;
    }

    // Capabilities
    if (line.trim() === 'capabilities') {
      model.capabilities = [];
      i++;
      // Skip opening parenthesis
      if (i < lines.length && lines[i].trim() === '(') {
        i++;
      }
      // Read capabilities until closing parenthesis
      while (i < lines.length && lines[i].trim() !== ')') {
        const cap = lines[i].trim();
        if (cap) {
          model.capabilities.push(cap);
        }
        i++;
      }
      // Skip closing parenthesis
      if (i < lines.length && lines[i].trim() === ')') {
        i++;
      }
      continue;
    }

    // Modalities
    if (line.trim() === 'modalities') {
      model.modalities = {};
      i++;

      // Read input modalities
      if (i < lines.length && lines[i].trim() === 'input') {
        i++;
        if (i < lines.length) {
          model.modalities.input = lines[i].trim().split(' ');
        }
        i++;
      }

      // Read output modalities
      if (i < lines.length && lines[i].trim() === 'output') {
        i++;
        if (i < lines.length) {
          model.modalities.output = lines[i].trim().split(' ');
        }
        i++;
      }
      continue;
    }

    // Limits
    if (line.trim() === 'limits') {
      model.limits = {};
      i++;

      // Read context limit
      if (i < lines.length && lines[i].trim() === 'context') {
        i++;
        if (i < lines.length) {
          const value = lines[i].trim().replace(/'/g, '').replace(/ /g, '');
          model.limits.context = parseInt(value);
        }
        i++;
      }

      // Read output limit
      if (i < lines.length && lines[i].trim() === 'output') {
        i++;
        if (i < lines.length) {
          const value = lines[i].trim().replace(/'/g, '').replace(/ /g, '');
          model.limits.output = parseInt(value);
        }
        i++;
      }
      continue;
    }

    // Costs
    if (line.trim() === 'costs') {
      model.costs = {};
      i++;

      // Read input cost
      if (i < lines.length && lines[i].trim() === 'input') {
        i++;
        if (i < lines.length) {
          model.costs.input = parseFloat(lines[i].trim());
        }
        i++;
      }

      // Read output cost
      if (i < lines.length && lines[i].trim() === 'output') {
        i++;
        if (i < lines.length) {
          model.costs.output = parseFloat(lines[i].trim());
        }
        i++;
      }

      // Read cache read cost
      if (i < lines.length && lines[i].trim() === 'cacheRead') {
        i++;
        if (i < lines.length) {
          model.costs.cacheRead = parseFloat(lines[i].trim());
        }
        i++;
      }

      // Read cache write cost
      if (i < lines.length && lines[i].trim() === 'cacheWrite') {
        i++;
        if (i < lines.length) {
          model.costs.cacheWrite = parseFloat(lines[i].trim());
        }
        i++;
      }
      continue;
    }

    i++;
  }

  return model;
}

/**
 * Load all model files from the providers directory
 * @returns {Promise<Array>} Array of parsed models
 */
export async function loadAllModels() {
  // This will be replaced with actual file loading in the build process
  const models = [];

  // Import all .lino files from the providers directory
  const modelFiles = import.meta.glob('/public/providers/**/*.lino', {
    query: '?raw',
    import: 'default'
  });

  for (const path in modelFiles) {
    try {
      const content = await modelFiles[path]();
      const model = parseLinoFile(content);
      model.id = path.split('/').pop().replace('.lino', '');
      models.push(model);
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
    }
  }

  return models;
}
