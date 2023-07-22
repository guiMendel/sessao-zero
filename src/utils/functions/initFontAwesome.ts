/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {
  faHandPointLeft,
  faHandPointRight,
  faPaperPlane,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons'

export const initFontAwesome = (): [
  'font-awesome-icon',
  typeof FontAwesomeIcon
] => {
  /* add icons to the library */
  library.add(faHandPointLeft, faHandPointRight, faPaperPlane, faRightToBracket)

  return ['font-awesome-icon', FontAwesomeIcon]
}
