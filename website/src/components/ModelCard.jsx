import './ModelCard.css';

/**
 * Component to display a single AI model card
 */
export default function ModelCard({ model }) {
  const formatNumber = (num) => {
    return num?.toLocaleString() || 'N/A';
  };

  const formatCost = (cost) => {
    return cost !== undefined ? `$${cost.toFixed(2)}` : 'N/A';
  };

  return (
    <div className="model-card">
      <h2 className="model-name">{model.name}</h2>

      <div className="model-section">
        <h3>Release Information</h3>
        <div className="model-info">
          <div className="info-row">
            <span className="label">Released:</span>
            <span className="value">{model.releaseDate}</span>
          </div>
          <div className="info-row">
            <span className="label">Last Updated:</span>
            <span className="value">{model.lastUpdated}</span>
          </div>
          <div className="info-row">
            <span className="label">Knowledge Cutoff:</span>
            <span className="value">{model.knowledgeCutoff}</span>
          </div>
          <div className="info-row">
            <span className="label">Open Weights:</span>
            <span className="value">{model.openWeights ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {model.capabilities && model.capabilities.length > 0 && (
        <div className="model-section">
          <h3>Capabilities</h3>
          <div className="capabilities">
            {model.capabilities.map((cap, idx) => (
              <span key={idx} className="capability-badge">
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {model.modalities && (
        <div className="model-section">
          <h3>Modalities</h3>
          <div className="model-info">
            <div className="info-row">
              <span className="label">Input:</span>
              <span className="value">
                {model.modalities.input?.join(', ') || 'N/A'}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Output:</span>
              <span className="value">
                {model.modalities.output?.join(', ') || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {model.limits && (
        <div className="model-section">
          <h3>Limits</h3>
          <div className="model-info">
            <div className="info-row">
              <span className="label">Context Window:</span>
              <span className="value">{formatNumber(model.limits.context)} tokens</span>
            </div>
            <div className="info-row">
              <span className="label">Max Output:</span>
              <span className="value">{formatNumber(model.limits.output)} tokens</span>
            </div>
          </div>
        </div>
      )}

      {model.costs && (
        <div className="model-section">
          <h3>Pricing (per million tokens)</h3>
          <div className="model-info">
            <div className="info-row">
              <span className="label">Input:</span>
              <span className="value">{formatCost(model.costs.input)}</span>
            </div>
            <div className="info-row">
              <span className="label">Output:</span>
              <span className="value">{formatCost(model.costs.output)}</span>
            </div>
            {model.costs.cacheRead !== undefined && (
              <div className="info-row">
                <span className="label">Cache Read:</span>
                <span className="value">{formatCost(model.costs.cacheRead)}</span>
              </div>
            )}
            {model.costs.cacheWrite !== undefined && (
              <div className="info-row">
                <span className="label">Cache Write:</span>
                <span className="value">{formatCost(model.costs.cacheWrite)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
