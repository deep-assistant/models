import { describe, it, expect } from 'vitest'
import { parseLinoFile } from './linoParser'

describe('parseLinoFile', () => {
  it('should parse model name correctly', () => {
    const content = `model 'Claude Sonnet 3.5 v2'`
    const result = parseLinoFile(content)
    expect(result.name).toBe('Claude Sonnet 3.5 v2')
  })

  it('should parse release date correctly', () => {
    const content = `model 'Test Model'
  released at
    2024-10-22`
    const result = parseLinoFile(content)
    expect(result.releaseDate).toBe('2024-10-22')
  })

  it('should parse last updated date correctly', () => {
    const content = `model 'Test Model'
  last updated at
    2024-10-22`
    const result = parseLinoFile(content)
    expect(result.lastUpdated).toBe('2024-10-22')
  })

  it('should parse knowledge cutoff correctly', () => {
    const content = `model 'Test Model'
  has knowledge cutoff at
    2024-04-30`
    const result = parseLinoFile(content)
    expect(result.knowledgeCutoff).toBe('2024-04-30')
  })

  it('should parse weights correctly', () => {
    const content = `model 'Test Model'
  weights
    closed`
    const result = parseLinoFile(content)
    expect(result.openWeights).toBe(false)
  })

  it('should parse open weights correctly', () => {
    const content = `model 'Test Model'
  weights
    open`
    const result = parseLinoFile(content)
    expect(result.openWeights).toBe(true)
  })

  it('should parse capabilities correctly', () => {
    const content = `model 'Test Model'
  capabilities
    (
      tool calls
      temperature
      attachments
    )`
    const result = parseLinoFile(content)
    expect(result.capabilities).toEqual(['tool calls', 'temperature', 'attachments'])
  })

  it('should parse modalities correctly', () => {
    const content = `model 'Test Model'
  modalities
    input
      text image
    output
      text`
    const result = parseLinoFile(content)
    expect(result.modalities).toEqual({
      input: ['text', 'image'],
      output: ['text']
    })
  })

  it('should parse limits correctly', () => {
    const content = `model 'Test Model'
  limits
    context
      '200 000'
    output
      '8 192'`
    const result = parseLinoFile(content)
    expect(result.limits).toEqual({
      context: 200000,
      output: 8192
    })
  })

  it('should parse costs correctly', () => {
    const content = `model 'Test Model'
  costs
    input
      3.00
    output
      15.00
    cacheRead
      0.30
    cacheWrite
      3.75`
    const result = parseLinoFile(content)
    expect(result.costs).toEqual({
      input: 3.00,
      output: 15.00,
      cacheRead: 0.30,
      cacheWrite: 3.75
    })
  })

  it('should parse complete model file correctly', () => {
    const content = `model 'Claude Sonnet 3.5 v2'
  released at
    2024-10-22
  last updated at
    2024-10-22
  has knowledge cutoff at
    2024-04-30
  weights
    closed
  capabilities
    (
      tool calls
      temperature
      attachments
    )
  modalities
    input
      text image
    output
      text
  limits
    context
      '200 000'
    output
      '8 192'
  costs
    input
      3.00
    output
      15.00
    cacheRead
      0.30
    cacheWrite
      3.75`

    const result = parseLinoFile(content)

    expect(result).toEqual({
      name: 'Claude Sonnet 3.5 v2',
      releaseDate: '2024-10-22',
      lastUpdated: '2024-10-22',
      knowledgeCutoff: '2024-04-30',
      openWeights: false,
      capabilities: ['tool calls', 'temperature', 'attachments'],
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
    })
  })

  it('should handle empty content gracefully', () => {
    const content = ''
    const result = parseLinoFile(content)
    expect(result).toEqual({})
  })

  it('should skip empty lines', () => {
    const content = `model 'Test Model'

  released at
    2024-10-22`
    const result = parseLinoFile(content)
    expect(result.name).toBe('Test Model')
    expect(result.releaseDate).toBe('2024-10-22')
  })
})
