/** Funcao para recuperar um item da sessao e dar JSON.parse nele
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

/** Funcao para definir um valor na sessao ja com JSON.stringify
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
