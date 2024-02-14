import { Vase, vase } from '@/api'
import { NotificationParams, useNotification } from '@/api/notifications'
import { addRelation, removeRelation } from '@/firevase/relations'
import { Resource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { toValue } from 'vue'

export const useAddPlayer = () => {
  const { getBooleanInput } = useInput()
  const { alert } = useAlert()
  const { notifyPlayer } = useNotification()

  return async (
    player: Resource<Vase, 'players'>,
    adventure: Resource<Vase, 'adventures'>
  ) => {
    if (!adventure.open)
      return Promise.reject(
        'A aventura não está aceitando novos membros atualmente'
      )

    if (!player) return Promise.reject('Jogador inválido')

    const playerHasRequestedAdmission = toValue(
      player.adventureAdmissionRequests
    )?.some((requestedAdventure) => requestedAdventure.id === adventure.id)

    const decision = await getBooleanInput({
      cancelValue: false,
      messageHtml: playerHasRequestedAdmission
        ? `Deseja cancelar a solicitação de entrada da aventura <strong>${adventure.name}</ strong>?`
        : `Quer mesmo entrar na aventura <b>${adventure.name}</b>?`,
      trueButton: { buttonProps: { variant: 'colored' } },
    })

    if (!decision) return

    // Se requer admissao, apenas solicita
    if (adventure.requireAdmission) {
      // Se ja solicitou, cancela a solicitação
      if (playerHasRequestedAdmission)
        return removeRelation(vase, player, 'adventureAdmissionRequests', [
          adventure,
        ])

      // Envia uma notificacao aos narradores
      for (const narrator of toValue(adventure.narrators))
        notifyPlayer(narrator.id, {
          type: 'adventureAdmissionRequest',
          params: { adventure, player },
        })

      alert('success', 'Solicitação enviada!')

      return addRelation(vase, player, 'adventureAdmissionRequests', [
        adventure,
      ])
    }

    // Adiciona na aventura diretamente
    const promise = addRelation(vase, player, 'playerAdventures', [adventure])

    const notification: NotificationParams<'playerJoinedAdventure'> = {
      type: 'playerJoinedAdventure',
      params: { adventure, player },
    }

    for (const narrator of toValue(adventure.narrators))
      notifyPlayer(narrator.id, notification)

    alert('success', `Bem vindo a ${adventure.name}!`)

    // Se havia uma solicitacao para entrar nessa aventura, remove ela
    if (playerHasRequestedAdmission)
      return Promise.all([
        promise,
        removeRelation(vase, player, 'adventureAdmissionRequests', [adventure]),
      ])

    return promise
  }
}
