/** Espera amount ms e entao resolve */
export async function sleep<T>(amount: number, value: T): Promise<T>

export async function sleep(amount: number): Promise<void>

export async function sleep(amount: number, value?: unknown) {
  return new Promise((resolve) => setTimeout(() => resolve(value), amount))
}
