import { mockFantasyDatabase } from '@/tests/mock/backend'

import { syncableRef } from '@/firevase/Syncable'
import { hasLoaded } from '.'
import { fantasyVase, mockKnight } from '@/tests/mock/fantasyVase'
import { CleanupManager } from '@/firevase/CleanupManager'
import { collection, doc, query } from 'firebase/firestore'
import { db } from '@/api/firebase'
import { toRaw } from 'vue'

describe('hasLoaded', () => {
  it('only returns true when all refs are loaded', () => {
    const ref1 = syncableRef(
      fantasyVase,
      'knights',
      'empty-document',
      new CleanupManager()
    )

    const ref2 = syncableRef(
      fantasyVase,
      'kings',
      'empty-document',
      new CleanupManager()
    )

    expect(hasLoaded(ref1, ref2)).toBe(false)
    ;(ref2.sync as any)._hasLoaded = true

    expect(hasLoaded(ref1, ref2)).toBe(false)
    ;(ref1.sync as any)._hasLoaded = true

    expect(hasLoaded(ref1, ref2)).toBe(true)
  })

  it('is able to check if a doc ref has a loaded relation', () => {
    const knightId = '1'

    mockFantasyDatabase({
      knights: {
        [knightId]: mockKnight('uploadable'),
      },
    })

    const knight = syncableRef(
      fantasyVase,
      'knights',
      doc(collection(db, 'knights'), knightId),
      new CleanupManager()
    )

    expect(hasLoaded([knight, 'king'])).toBe(false)

    if (!knight.value) throw new Error('Database error')

    toRaw(knight.value).king.sync.triggerSync()

    expect(hasLoaded([knight, 'king'])).toBe(true)
  })

  it('is able to check if a query ref has a loaded relation for each instance', () => {
    const knightId1 = '1'
    const knightId2 = '2'

    mockFantasyDatabase({
      knights: {
        [knightId1]: mockKnight('uploadable'),
        [knightId2]: mockKnight('uploadable'),
      },
    })

    const knights = syncableRef(
      fantasyVase,
      'knights',
      query(collection(db, 'knights')),
      new CleanupManager()
    )

    expect(hasLoaded([knights, 'king'])).toBe(false)

    knights.sync.triggerSync()
    knights.value.forEach((knight) => toRaw(knight).king.sync.triggerSync())

    expect(hasLoaded([knights, 'king'])).toBe(true)
  })
})
