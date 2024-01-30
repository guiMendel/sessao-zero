import { useNotification } from '@/api/notifications'
import { addRelation, removeRelation } from '@/firevase/relations'
import { HalfResource, Resource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { Vase, vase } from '../..'

export const useJoinGuild = () => {
  const { getBooleanInput } = useInput()
  const { alert } = useAlert()
  const { notifyPlayer } = useNotification()

  return async (
    player: Resource<Vase, 'players'>,
    guild: HalfResource<Vase, 'guilds'>,
    playerHasRequestedAdmission: boolean
  ) => {
    if (!guild.open)
      return Promise.reject(
        'A guilda não está aceitando novos membros atualmente'
      )

    if (!player) return Promise.reject('Jogador inválido')

    const decision = await getBooleanInput({
      cancelValue: false,
      messageHtml: playerHasRequestedAdmission
        ? `Deseja cancelar a solicitação de entrada da guilda <strong>${guild.name}</ strong>?`
        : `Gostaria mesmo de entrar na guilda <strong>${guild.name}</ strong>?`,
      trueButton: { buttonProps: { variant: 'colored' } },
    })

    if (!decision) return

    // Se requer admissao, apenas solicita
    if (guild.requireAdmission) {
      // Se ja solicitou, cancela a solicitação
      if (playerHasRequestedAdmission)
        return removeRelation(vase, player, 'admissionRequests', [guild])

      // Envia uma notificacao ao dono
      notifyPlayer(guild.ownerUid, {
        type: 'admissionRequest',
        params: { guild, player },
      })

      alert('success', 'Solicitação enviada!')

      return addRelation(vase, player, 'admissionRequests', [guild])
    }

    // Adiciona na guilda diretamente
    const promise = addRelation(vase, player, 'guilds', [guild])

    alert('success', `Bem vindo a ${guild.name}!`)

    // Se havia uma solicitacao para entrar nessa guilda, remove ela
    if (playerHasRequestedAdmission)
      return Promise.all([
        promise,
        removeRelation(vase, player, 'admissionRequests', [guild]),
      ])

    return promise
  }
}
