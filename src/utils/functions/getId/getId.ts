let idCounter = 0

/** Gets a unique string each time */
export const getId = () => (idCounter++).toString()
