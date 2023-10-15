import { mainTitle } from '@/utils/config'
import { nextTick } from 'vue'

/** Permite alterar o titulo da pagina */
export function setTitle(title: string | undefined) {
  // Gera o titulo
  const newTitle = title == undefined ? mainTitle : `${title} | ${mainTitle}`

  // Usa-se o next stick de acordo com https://stackoverflow.com/a/51640162/14342654
  // Usamos sempre para ser extra cuidadoso
  nextTick(() => (document.title = newTitle))
}
