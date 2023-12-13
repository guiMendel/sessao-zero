import { mockGuild, mockPlayer } from '@/tests'
import { isMember } from '.'

describe('isMember', () => {
  it('should be true if player is owner', () => {
    expect(
      isMember(mockPlayer({ id: '1' }), mockGuild({ ownerUid: '1' }))
    ).toBe(true)
  })

  it('should be true if player has joined', () => {
    expect(
      isMember(
        mockPlayer({ id: '1' }),
        mockGuild({ players: [{ id: '1' }] as any })
      )
    ).toBe(true)
  })

  it('should be false if player has neither joined nor is the owner', () => {
    expect(
      isMember(mockPlayer({ id: '1' }), mockGuild({ ownerUid: '2' }))
    ).toBe(false)
  })
})
