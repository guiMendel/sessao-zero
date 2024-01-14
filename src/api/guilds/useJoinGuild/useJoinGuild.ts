import { addRelation, removeRelation } from '@/firevase/relations'
import { HalfResource, Resource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { toValue } from 'vue'
import { Vase, vase } from '../..'
import { useNotification } from '@/api/notifications'

export const useJoinGuild = () => {
  const { getBooleanInput } = useInput()
  const { alert } = useAlert()
  const { notifyPlayer } = useNotification()

  return async (
    player: Resource<Vase, 'players'>,
    guild: HalfResource<Vase, 'guilds'>,
    playerHasRequestedAdmission: boolean
  ) =>
    guild.open
      ? player &&
        getBooleanInput({
          cancellable: true,
          messageHtml: playerHasRequestedAdmission
            ? `Deseja cancelar a solicitação de entrada da guilda <strong>${guild.name}</ strong>?`
            : `Gostaria mesmo de entrar na guilda <strong>${guild.name}</ strong>?`,
          trueButton: { buttonProps: { variant: 'colored' } },
        })
          .then(async (decision) => {
            if (!decision || !player) return

            // Se requer admissao, apenas solicita
            if (guild.requireAdmission) {
              alert('success', 'Solicitação enviada!')

              // Se ja solicitou, cancela a solicitação
              if (playerHasRequestedAdmission)
                return removeRelation(vase, player, 'admissionRequests', [
                  guild,
                ])

              // Envia uma notificacao ao dono
              notifyPlayer(guild.ownerUid, {
                type: 'admissionRequest',
                params: { guild, player },
              })

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
          })
          .catch(() => {})
      : Promise.reject('A guilda não está aberta')
}
