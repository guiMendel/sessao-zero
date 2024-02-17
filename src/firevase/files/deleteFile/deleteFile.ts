import { FirevaseClient } from '@/firevase'
import { HalfResource } from '@/firevase/resources'
import { FilesFrom, PathsFrom } from '@/firevase/types'
import { deleteObject } from 'firebase/storage'
import { getFileRef } from '../getFileRef'
import { firevaseEvents } from '@/firevase/events'

export const deleteFile = <C extends FirevaseClient, P extends PathsFrom<C>>(
  source: HalfResource<C, P>,
  fileName: FilesFrom<C>[P][number]
) => {
  const storageRef = getFileRef({
    fileName,
    resourceId: source.id,
    resourcePath: source.resourcePath,
  })

  const promise = deleteObject(storageRef)

  promise.then(() => firevaseEvents.emit('fileUploaded', storageRef, undefined))

  return promise
}
