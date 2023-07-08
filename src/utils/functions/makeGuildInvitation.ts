/** Gera um link de convite para uma guilda
 * @param fullPath Se deve mostrar a rota inteira ou somente o path
 * @param id O id da guilda para qual convidar. O valor padrao eh a string ":id" para ser utilizado na pelo router na especificacao da rota
 * @param passcode A palavra passe para entrar na guilda. O valor padrao eh a string ":passcode" para ser utilizado na pelo router na especificacao da rota
 */
export function makeGuildInvitation(
  fullPath: boolean,
  id: number | string = ':id',
  passcode = ':passcode'
) {
  return `${
    fullPath ? window.location.origin : ''
  }/join-guild/${id}/${passcode}`
}
