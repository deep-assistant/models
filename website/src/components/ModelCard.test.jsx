import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModelCard from './ModelCard'

describe('ModelCard', () => {
  const mockModel = {
    id: 'test-model',
    name: 'Test Model',
    releaseDate: '2024-10-22',
    lastUpdated: '2024-10-22',
    knowledgeCutoff: '2024-04-30',
    openWeights: false,
    capabilities: ['tool calls', 'temperature'],
    modalities: {
      input: ['text', 'image'],
      output: ['text']
    },
    limits: {
      context: 200000,
      output: 8192
    },
    costs: {
      input: 3.00,
      output: 15.00,
      cacheRead: 0.30,
      cacheWrite: 3.75
    }
  }

  it('should render model name', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Test Model')).toBeDefined()
  })

  it('should render release information', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Released:')).toBeDefined()
    expect(screen.getAllByText('2024-10-22')[0]).toBeDefined()
    expect(screen.getByText('Last Updated:')).toBeDefined()
    expect(screen.getByText('Knowledge Cutoff:')).toBeDefined()
    expect(screen.getByText('2024-04-30')).toBeDefined()
  })

  it('should render open weights status as No when false', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Open Weights:')).toBeDefined()
    expect(screen.getByText('No')).toBeDefined()
  })

  it('should render open weights status as Yes when true', () => {
    const openWeightsModel = { ...mockModel, openWeights: true }
    render(<ModelCard model={openWeightsModel} />)
    expect(screen.getByText('Yes')).toBeDefined()
  })

  it('should render capabilities', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Capabilities')).toBeDefined()
    expect(screen.getByText('tool calls')).toBeDefined()
    expect(screen.getByText('temperature')).toBeDefined()
  })

  it('should not render capabilities section when empty', () => {
    const modelWithoutCapabilities = { ...mockModel, capabilities: [] }
    render(<ModelCard model={modelWithoutCapabilities} />)
    expect(screen.queryByText('Capabilities')).toBeNull()
  })

  it('should render modalities', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Modalities')).toBeDefined()
    const inputLabels = screen.getAllByText('Input:')
    expect(inputLabels.length).toBeGreaterThan(0)
    expect(screen.getByText('text, image')).toBeDefined()
    const outputLabels = screen.getAllByText('Output:')
    expect(outputLabels.length).toBeGreaterThan(0)
    expect(screen.getByText('text')).toBeDefined()
  })

  it('should render limits with formatted numbers', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Limits')).toBeDefined()
    expect(screen.getByText('Context Window:')).toBeDefined()
    expect(screen.getByText('200,000 tokens')).toBeDefined()
    expect(screen.getByText('Max Output:')).toBeDefined()
    expect(screen.getByText('8,192 tokens')).toBeDefined()
  })

  it('should render costs with formatted currency', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Pricing (per million tokens)')).toBeDefined()
    const inputLabels = screen.getAllByText('Input:')
    expect(inputLabels.length).toBeGreaterThan(0)
    expect(screen.getByText('$3.00')).toBeDefined()
    const outputLabels = screen.getAllByText('Output:')
    expect(outputLabels.length).toBeGreaterThan(0)
    expect(screen.getByText('$15.00')).toBeDefined()
  })

  it('should render cache costs when present', () => {
    render(<ModelCard model={mockModel} />)
    expect(screen.getByText('Cache Read:')).toBeDefined()
    expect(screen.getByText('$0.30')).toBeDefined()
    expect(screen.getByText('Cache Write:')).toBeDefined()
    expect(screen.getByText('$3.75')).toBeDefined()
  })

  it('should not render cache costs when not present', () => {
    const modelWithoutCache = {
      ...mockModel,
      costs: {
        input: 3.00,
        output: 15.00
      }
    }
    render(<ModelCard model={modelWithoutCache} />)
    expect(screen.queryByText('Cache Read:')).toBeNull()
    expect(screen.queryByText('Cache Write:')).toBeNull()
  })

  it('should handle minimal model data', () => {
    const minimalModel = {
      id: 'minimal',
      name: 'Minimal Model'
    }
    render(<ModelCard model={minimalModel} />)
    expect(screen.getByText('Minimal Model')).toBeDefined()
  })
})
