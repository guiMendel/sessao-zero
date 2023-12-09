/** Espera amount ms e entao resolve */
export const sleep = async (amount: number) =>
  new Promise((resolve) => setTimeout(resolve, amount))
