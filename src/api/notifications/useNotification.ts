import { useResource } from '@/firevase/resources'
import { vase } from '..'
import { NotificationTypes, notificationTypes } from '.'

export type NotificationParams<K extends keyof NotificationTypes> = {
  type: K
  params: Parameters<NotificationTypes[K]['makeBody']>[0]
}

export const useNotification = () => {
  const api = useResource(vase, 'notifications')

  return {
    /** Generates a notification for a player */
    notifyPlayer: <K extends keyof NotificationTypes>(
      playerId: string,
      { params, type }: NotificationParams<K>
    ) =>
      api.create({
        body: notificationTypes[type].makeBody(params),
        playerId,
        unread: true,
      }),

    /** Sets a notification as read */
    readNotification: (notificationId: string) =>
      api.update(notificationId, { unread: false }),

    /** Deletes a notification */
    deleteNotification: (notificationId: string) =>
      api.deleteForever(notificationId),
  }
}
