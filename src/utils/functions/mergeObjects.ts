// Fonte: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge

/** Verifica se eh um objeto */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/** Realiza o merge dos objetos fornecidos */
export function mergeObjects(
  target: Record<any, any>,
  ...sources: Record<any, any>[]
): Record<any, any> {
  // Ignora se nao tiver objetos fonte
  if (sources.length == 0) return target

  // Pega o primeiro dos objetos
  const source = sources.shift()

  // Se um dos 2 nao for objeto, continua sem fazer merge nessa recursao
  if (isObject(target) && isObject(source)) {
    // Para cada atributo a ser introduzido
    for (const key in source) {
      // Se este atributo em si for outro objeto
      if (isObject(source[key])) {
        // Garante que o objeto alvo tenha um campo com esse atributo
        target[key] ??= {}

        // Faz o merge desse atributo
        mergeObjects(target[key], source[key])
      }

      // Caso o atributo nao seja um objeto
      else target[key] = source[key]
    }
  }

  return mergeObjects(target, ...sources)
}
