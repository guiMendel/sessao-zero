// TODO: remover esses objetos e fazer as funcoes de storage serem strongly typed

/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao session storage */
export const sessionStorageKeys = {
  /** Chave para informacoes de convite para guilda */
  guildInvitation: 'guild-invitation',
}

/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao local storage */
export const localStorageKeys = {
  /** Quais prompts ja fora vistos */
  firstVisitPrompts: 'first-visit-prompts',

  /** Mode de acessibilidade de alto contraste */
  highContrast: 'high-contrast',

  /** Campos de login e criar jogador */
  loginFields: 'login-fields',

  /** Campos de criar aventura */
  createAdventureFields: 'create-adventure-fields',

  /** Se esta vendo aventuras que narra ou as aventuras que nao narra */
  adventureViewMode: 'adventure-view-mode',
}
