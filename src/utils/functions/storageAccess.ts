/** Funcao para recuperar um item da sessao e dar JSON.parse nele */
export function getFromSessionStorage<ItemType>(key: string): ItemType | null {
  const item = sessionStorage.getItem(key)

  if (item == null) return null

  return item === 'undefined' ? undefined : JSON.parse(item)
}

/** Funcao para definir um valor na sessao ja com JSON.stringify */
export function setInSessionStorage<ItemType>(
  key: string,
  value: ItemType
): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}
