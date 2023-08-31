/** Define como relacionar possiveis nomes de um campo com seu tipo e autocomplete */
export interface PropertyNameRelation {
  matchNames: string[]
  type?: string
  autocomplete?: string
  display?: string
}

/** Mapeia a relacao entre nomes possiveis para os campos e os seus tipos e autocompletes */
export const fieldPropertyNameRelations: PropertyNameRelation[] = [
  {
    matchNames: ['passwordConfirmation'],
    type: 'password',
    autocomplete: 'create-password',
    display: 'confirmar senha',
  },
  {
    matchNames: ['password'],
    type: 'password',
    autocomplete: 'current-password',
    display: 'senha',
  },
  {
    matchNames: ['color'],
    type: 'color',
    display: 'cor',
  },
  {
    matchNames: ['email'],
    type: 'email',
    autocomplete: 'email',
  },
  {
    matchNames: ['nickname'],
    autocomplete: 'username',
    display: 'apelido',
  },
  {
    matchNames: ['name'],
    autocomplete: 'name',
    display: 'nome',
  },
  {
    matchNames: ['about'],
    display: 'sobre',
  },
]

/** Infere o tipo e o autocomplete do campo a partir do seu nome */
export const inferFieldProperties = (
  fieldName: string
): { type: string; autocomplete: string; display: string } => {
  for (const relation of fieldPropertyNameRelations) {
    if (
      relation.matchNames.some((word) =>
        fieldName.toLowerCase().includes(word.toLowerCase())
      )
    )
      return {
        type: 'text',
        autocomplete: 'on',
        display: fieldName,
        ...relation,
      }
  }

  return { type: 'text', autocomplete: 'on', display: fieldName }
}
