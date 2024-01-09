import { mainTitle } from '@/utils/config'

export const setTitle = (title: string | undefined) =>
  (document.title = title ? `${title} | ${mainTitle}` : mainTitle)
