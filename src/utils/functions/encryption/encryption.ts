// TODO: se esse negocio envolver dinheiro vmaos precisar urgentemente deixar isso aqui seguro

export const encrypt = (message: string) => window.btoa(message)

export const decrypt = (token: string) => window.atob(token)
