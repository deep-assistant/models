import { useState, useEffect } from 'react'
import './App.css'
import ModelCard from './components/ModelCard'
import { loadAllModels } from './utils/linoParser'

function App() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAllModels()
      .then((loadedModels) => {
        // Sort models by release date (newest first)
        const sorted = loadedModels.sort((a, b) => {
          return new Date(b.releaseDate) - new Date(a.releaseDate)
        })
        setModels(sorted)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading models:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Models Database</h1>
        <p className="subtitle">Anthropic Claude Models</p>
      </header>

      <main className="app-main">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && (
          <div className="loading">Loading models...</div>
        )}

        {error && (
          <div className="error">Error loading models: {error}</div>
        )}

        {!loading && !error && filteredModels.length === 0 && (
          <div className="no-results">No models found</div>
        )}

        <div className="models-container">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Data from{' '}
          <a
            href="https://github.com/sst/models.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            models.dev
          </a>{' '}
          | Stored in{' '}
          <a
            href="https://github.com/link-foundation/links-notation"
            target="_blank"
            rel="noopener noreferrer"
          >
            .lino format
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
