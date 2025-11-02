import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as linoParser from './utils/linoParser'

// Mock the linoParser module
vi.mock('./utils/linoParser', () => ({
  loadAllModels: vi.fn()
}))

describe('App', () => {
  const mockModels = [
    {
      id: 'model-1',
      name: 'Claude Sonnet 4.5',
      releaseDate: '2025-09-29',
      lastUpdated: '2025-09-29',
      knowledgeCutoff: '2024-04-30',
      openWeights: false
    },
    {
      id: 'model-2',
      name: 'Claude Haiku 4.5',
      releaseDate: '2025-10-01',
      lastUpdated: '2025-10-01',
      knowledgeCutoff: '2024-04-30',
      openWeights: false
    },
    {
      id: 'model-3',
      name: 'Claude Opus 4.1',
      releaseDate: '2025-08-05',
      lastUpdated: '2025-08-05',
      knowledgeCutoff: '2024-04-30',
      openWeights: false
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    linoParser.loadAllModels.mockReturnValue(new Promise(() => {}))
    render(<App />)
    expect(screen.getByText('Loading models...')).toBeDefined()
  })

  it('should display all models when no search term is entered', async () => {
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
      expect(screen.getByText('Claude Haiku 4.5')).toBeDefined()
      expect(screen.getByText('Claude Opus 4.1')).toBeDefined()
    })
  })

  it('should sort models by release date (newest first)', async () => {
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      const modelCards = screen.getAllByRole('heading', { level: 2 })
      expect(modelCards[0].textContent).toBe('Claude Haiku 4.5') // 2025-10-01
      expect(modelCards[1].textContent).toBe('Claude Sonnet 4.5') // 2025-09-29
      expect(modelCards[2].textContent).toBe('Claude Opus 4.1') // 2025-08-05
    })
  })

  it('should filter models by search term (case insensitive)', async () => {
    const user = userEvent.setup()
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText('Search models...')
    await user.type(searchInput, 'sonnet')

    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
      expect(screen.queryByText('Claude Haiku 4.5')).toBeNull()
      expect(screen.queryByText('Claude Opus 4.1')).toBeNull()
    })
  })

  it('should display "No models found" when search returns no results', async () => {
    const user = userEvent.setup()
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText('Search models...')
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('No models found')).toBeDefined()
    })
  })

  it('should filter models case-insensitively', async () => {
    const user = userEvent.setup()
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Claude Haiku 4.5')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText('Search models...')
    await user.type(searchInput, 'HAIKU')

    await waitFor(() => {
      expect(screen.getByText('Claude Haiku 4.5')).toBeDefined()
      expect(screen.queryByText('Claude Sonnet 4.5')).toBeNull()
    })
  })

  it('should display error message when loading fails', async () => {
    const errorMessage = 'Failed to load models'
    linoParser.loadAllModels.mockRejectedValue(new Error(errorMessage))
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(`Error loading models: ${errorMessage}`)).toBeDefined()
    })
  })

  it('should render header with correct title', () => {
    linoParser.loadAllModels.mockResolvedValue([])
    render(<App />)
    expect(screen.getByText('AI Models Database')).toBeDefined()
    expect(screen.getByText('Anthropic Claude Models')).toBeDefined()
  })

  it('should render footer with links', () => {
    linoParser.loadAllModels.mockResolvedValue([])
    render(<App />)
    expect(screen.getByText('models.dev')).toBeDefined()
    expect(screen.getByText('.lino format')).toBeDefined()
  })

  it('should display all models when search is cleared', async () => {
    const user = userEvent.setup()
    linoParser.loadAllModels.mockResolvedValue(mockModels)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText('Search models...')

    // Type search term
    await user.type(searchInput, 'sonnet')
    await waitFor(() => {
      expect(screen.queryByText('Claude Haiku 4.5')).toBeNull()
    })

    // Clear search
    await user.clear(searchInput)
    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet 4.5')).toBeDefined()
      expect(screen.getByText('Claude Haiku 4.5')).toBeDefined()
      expect(screen.getByText('Claude Opus 4.1')).toBeDefined()
    })
  })
})
