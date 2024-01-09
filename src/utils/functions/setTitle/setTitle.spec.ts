import { mainTitle } from '@/utils/config'
import { setTitle } from './setTitle'

describe('setTitle', () => {
  it('sets the provided string and the main title to the document title', () => {
    const title = 'scooby'

    setTitle(title)

    expect(document.title).toBe(`${title} | ${mainTitle}`)
  })

  it('sets main title if providing undefined', () => {
    setTitle(undefined)

    expect(document.title).toBe(mainTitle)
  })
})
