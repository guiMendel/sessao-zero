/** Funcao para recuperar um item da storage e dar JSON.parse nele
 * @param key chave to item a ser recuperado
 * @param storage se deve acessar o local ou session storage
 * @returns o valor armazenado, ou undefined se nao houver
 */
export function getFromStorage<ItemType>(
  key: string,
  storage: 'local' | 'session' = 'local'
): ItemType | undefined {
  const targetStorage = storage === 'local' ? localStorage : sessionStorage

  const item = targetStorage.getItem(key)

  if (item == undefined || item === 'undefined') return undefined

  return JSON.parse(item)
}

/** Funcao para definir um valor na storage ja com JSON.stringify
 * @param key chave to item a ser armazenado
 * @param value valor a ser armazenado
 * @param storage se deve acessar o local ou session storage
 */
export function setInStorage<ItemType>(
  key: string,
  value: ItemType,
  storage: 'local' | 'session' = 'local'
): void {
  const targetStorage = storage === 'local' ? localStorage : sessionStorage

  targetStorage.setItem(key, JSON.stringify(value))
}

/** Funcao para limpar chaves de storage
 * @param keyPattern uma chave, um array de chaves ou um regex que indica quais chaves devem ser removidas
 * @storage qual storage utilizar
 */
export function eraseInStorage(
  keyPattern: string | string[] | RegExp,
  storage: 'local' | 'session' = 'local'
) {
  const targetStorage = storage === 'local' ? localStorage : sessionStorage

  // Caso seja uma simples string, levamos para o caso de array para simplificar
  if (typeof keyPattern === 'string') keyPattern = [keyPattern]

  // Caso seja um array
  if (Array.isArray(keyPattern)) {
    for (const targetKey of keyPattern) targetStorage.removeItem(targetKey)

    return
  }

  // So pode ser um regex. Vamos checar contra todas as chaves
  for (const storedKey of Object.keys(targetStorage)) {
    if (keyPattern.test(storedKey)) targetStorage.removeItem(storedKey)
  }
}
