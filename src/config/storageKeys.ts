/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao session storage */
export const sessionStorageKeys = {
  /** Chave para o jwt de login do jogador atual */
  playerJwt: 'player-jwt',

  /** Chave para informacoes de convite para guilda */
  guildInvitation: 'guild-invitation',
}

/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao local storage */
export const localStorageKeys = {
  /** Prefixo da chave para determinar se o usuario ja passou por uma first visit prompt page (ver definicao no meta do roteador) */
  firstVisitPromptPrefix: 'first-visit-prompt',

  /** Prefico da chave para persistir dados da store */
  storePersistPrefix: 'store-persist',

  /** Acessar qual a ultima guilda selecionada */
  lastSelectedGuild: 'last-selected-guild',
}
