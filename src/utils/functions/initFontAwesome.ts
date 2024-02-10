/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {
  faBan,
  faBars,
  faChampagneGlasses,
  faCheck,
  faChevronDown,
  faChevronRight,
  faCircle,
  faCircleCheck,
  faCircleUser,
  faCircleXmark,
  faCompass,
  faCrown,
  faDiceFive,
  faDiceFour,
  faDiceOne,
  faDiceSix,
  faDiceThree,
  faDiceTwo,
  faDoorClosed,
  faDoorOpen,
  faEllipsisVertical,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFire,
  faHammer,
  faHandPointLeft,
  faHandPointRight,
  faHeart,
  faKey,
  faLink,
  faLock,
  faMagnifyingGlassPlus,
  faPaperPlane,
  faPenRuler,
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
  faUserLargeSlash,
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
    faBan,
    faLock,
    faDoorClosed,
    faEnvelope,
    faFire,
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
    faUser,
    faEllipsisVertical,
    faUserLargeSlash,
    faLink,
    faKey,
    faCircleXmark,
    faCircleCheck,
    faPenRuler
  )

  return ['font-awesome-icon', FontAwesomeIcon]
}
