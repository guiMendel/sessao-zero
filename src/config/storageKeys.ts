/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao session storage */
export const sessionStorageKeys = {
  /** Chave para o jwt de login do jogador atual */
  playerJwt: 'player-jwt',

  /** Chave para informacoes de convite para guilda */
  guildInvitation: 'guild-invitation',
}

/** Guarda as string que devem ser utilizadas como chaves quando for realizado o acesso ao local storage */
export const localStorageKeys = {
  /** Prefixo da chave para acessar quais prompts ja fora vistos */
  firstVisitPrompts: 'first-visit-prompts',

  /** Prefico da chave para persistir dados da store */
  storePersistPrefix: 'store-persist',

  /** Acessar qual a ultima guilda selecionada */
  lastSelectedGuild: 'last-selected-guild',
}
