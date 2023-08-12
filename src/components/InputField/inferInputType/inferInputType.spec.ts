import { describe, expect, it } from 'vitest'
import { inferInputType } from '.'

describe('inferInputType', () => {
  it.each([
    [['password', 'senha'], 'password'],
    [['color', 'cor'], 'color'],
  ])('should map names %o to %s', (names, result) => {
    for (const name of names) expect(inferInputType(name)).toBe(result)
  })

  it('should map unknown names to text', () => {
    expect(inferInputType('sushi ball')).toBe('text')
  })
})
