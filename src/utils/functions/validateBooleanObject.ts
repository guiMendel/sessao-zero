/** Checks if all attributes of the object evaluate to true
 *
 * @param object An object with boolean fields
 */
export function validateBooleanObject(object: {
  [key: string]: boolean | undefined
}) {
  return Object.values(object).every((condition) => condition)
}
