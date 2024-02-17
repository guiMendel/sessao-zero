import { FirevaseClient } from '@/firevase'
import { FilesRefs } from '../types'
import { PathsFrom } from '@/firevase/types'
import { fileRef } from '@/firevase/classes/FileFetcher'
import { CleanupManager } from '@/firevase/classes/CleanupManager'
import { getStorage, ref } from 'firebase/storage'

const storage = getStorage()

type PopulateFilesParams<C extends FirevaseClient, P extends PathsFrom<C>> = {
  client: C
  resourcePath: P
  resourceId: string
  cleanupManager: CleanupManager
}

export const populateFiles = <
  C extends FirevaseClient,
  P extends PathsFrom<C>
>({
  client,
  resourcePath,
  resourceId,
  cleanupManager,
}: PopulateFilesParams<C, P>): FilesRefs<C, P> => {
  const fileNames = client.fileSettings?.[resourcePath] as string[] | undefined

  console.log({ resourcePath, fileNames })

  if (!fileNames) return {} as FilesRefs<C, P>

  /** Gets the target for a fiven file name */
  const getFileTarget = (fileName: string) =>
    ref(storage, `${resourcePath as string}/${resourceId}/${fileName}`)

  return fileNames.reduce(
    (files, fileName) => ({
      ...files,
      [fileName]: fileRef(getFileTarget(fileName), cleanupManager),
    }),
    {} as FilesRefs<C, P>
  )
}
