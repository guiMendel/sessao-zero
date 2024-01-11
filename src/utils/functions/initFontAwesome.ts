/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {
  faBars,
  faChampagneGlasses,
  faCheck,
  faChevronDown,
  faChevronRight,
  faCircle,
  faCircleUser,
  faCompass,
  faCrown,
  faDiceFive,
  faDiceFour,
  faDiceOne,
  faDiceSix,
  faDiceThree,
  faDiceTwo,
  faDoorOpen,
  faEye,
  faEyeSlash,
  faHammer,
  faHandPointLeft,
  faHandPointRight,
  faHeart,
  faMagnifyingGlassPlus,
  faPaperPlane,
  faPersonRays,
  faPersonRunning,
  faPlus,
  faRepeat,
  faRightToBracket,
  faScrewdriverWrench,
  faScroll,
  faStreetView,
  faTrash,
  faUser,
  faUserGroup,
  faUsers,
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
    faDiceOne,
    faDiceTwo,
    faDiceThree,
    faDiceFour,
    faDiceFive,
    faDiceSix,
    faBars,
    faRepeat,
    faPersonRunning,
    faUsers,
    faHammer,
    faPlus,
    faChevronDown,
    faChampagneGlasses,
    faUserGroup,
    faScroll,
    faMagnifyingGlassPlus,
    faUser
  )

  return ['font-awesome-icon', FontAwesomeIcon]
}
