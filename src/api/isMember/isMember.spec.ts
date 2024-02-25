import { mockGuild, mockPlayer } from '@/tests/mock/vase'
import { isMember } from '.'

describe('isMember', () => {
  it('should be true if player is owner', () => {
    expect(
      isMember(
        mockPlayer('resource', { id: '1' }),
        mockGuild('resource', { ownerUid: '1' })
      )
    ).toBe(true)
  })

  it('should be true if player has joined', () => {
    expect(
      isMember(
        mockPlayer('resource', { id: '1' }),
        mockGuild('resource', { players: [{ id: '1' }] as any })
      )
    ).toBe(true)
  })

  it('should be false if player has neither joined nor is the owner', () => {
    expect(
      isMember(
        mockPlayer('half-resource', { id: '10' }),
        mockGuild('resource', { ownerUid: '2' })
      )
    ).toBe(false)
  })
})
