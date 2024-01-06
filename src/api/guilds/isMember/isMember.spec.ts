import { mocksTable } from '@/tests/mock/mocksTable'
import { mockGuild, mockPlayer } from '@/tests/mock/vase'
import { isMember } from '.'

describe('isMember', () => {
  it('should be true if player is owner', () => {
    expect(
      isMember(
        mockPlayer('resource', { id: '1' }),
        mockGuild('unrefed-resource', { ownerUid: '1' }, mocksTable)
      )
    ).toBe(true)
  })

  it('should be true if player has joined', () => {
    expect(
      isMember(
        mockPlayer('resource', { id: '1' }),
        mockGuild(
          'unrefed-resource',
          { players: [{ id: '1' }] as any },
          mocksTable
        )
      )
    ).toBe(true)
  })

  it('should be false if player has neither joined nor is the owner', () => {
    expect(
      isMember(
        mockPlayer('resource', { id: '1' }),
        mockGuild('unrefed-resource', { ownerUid: '2' }, mocksTable)
      )
    ).toBe(false)
  })
})
