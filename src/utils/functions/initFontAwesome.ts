/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {
  faCheck,
  faChevronRight,
  faCircle,
  faCircleUser,
  faCompass,
  faCrown,
  faDoorOpen,
  faEye,
  faEyeSlash,
  faHandPointLeft,
  faHandPointRight,
  faHeart,
  faPaperPlane,
  faPersonRays,
  faPlus,
  faRightToBracket,
  faScrewdriverWrench,
  faStreetView,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

export const initFontAwesome = (): [
  'font-awesome-icon',
  typeof FontAwesomeIcon
] => {
  /* add icons to the library */
  library.add(
    faHandPointLeft,
    faHandPointRight,
    faPaperPlane,
    faRightToBracket,
    faStreetView,
    faEye,
    faEyeSlash,
    faPersonRays,
    faXmark,
    faCompass,
    faCrown,
    faTrash,
    faCircle,
    faCircleUser,
    faChevronRight,
    faDoorOpen,
    faScrewdriverWrench,
    faCheck,
    faXmark,
    faHeart,
    faPlus
  )

  return ['font-awesome-icon', FontAwesomeIcon]
}
