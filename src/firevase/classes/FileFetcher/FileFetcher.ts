// 1. Transformar Syncable no Fetcher e recriar o Syncable como uma extends que so define especificamente o trigger
// 2. Criar o FileFetcher que define como baixar a URL do arquivo
// 3. Criar o fileRef que usa o FileFetcher para automaticamente popular seu value quando for lido
// 4. Criar o populateFiels que gera os fileRefs pra cada Resource
// 5. Criar o setFile, que seria algo como setFile(adventure, 'banner', file)
// 6. Implementar um sistema de listeners de filePath:
//  - Sempre que um setFile com um filePath especifico concluir
//  - Atualiza todos os fileRefs que usam esse filePath para usar a nova URL
//  - Pode usar um firevaseEvent

import { StorageReference, getDownloadURL } from 'firebase/storage'
import { Fetcher } from '../Fetcher'

export class FileFetcher extends Fetcher<StorageReference, string> {
  protected fetchImplementation = async () => {
    if (this._target == undefined) return

    try {
      const url = await getDownloadURL(this._target)

      this._hasLoaded = true

      this.onFetch(url, this.cleanup)
    } catch (error) {
      this.handleError(error as any)
    }
  }

  private handleError = (error: { code: string }) => {
    if (error.code === 'storage/object-not-found') return

    console.error(error)
  }
}
