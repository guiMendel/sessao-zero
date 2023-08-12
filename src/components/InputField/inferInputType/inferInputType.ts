/** Infere o tipo do input baseado em seu nome */
export const inferInputType = (fieldName: string) => {
  /** Retorna true se o modelValue inclui qualquer dessas palavras */
  const includesAny = (...words: string[]) =>
    words.some((word) => fieldName.toLowerCase().includes(word))

  if (includesAny('password', 'senha')) return 'password'
  if (includesAny('color', 'cor')) return 'color'
  return 'text'
}
