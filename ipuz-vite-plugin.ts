import type { PluginOption, Rollup } from 'vite'
import fsp from 'node:fs/promises'

const ipuzFileRegex = /\.ipuz(\?[^.]*)?$/i
const jsonFileRegex = /\.json(\?[^.]*)?$/i

// copied from https://github.com/vitejs/vite/blob/029dcd6d77d3e3ef10bc38e9a0829784d9760fdb/packages/vite/src/client/client.ts#L113
function cleanUrl(pathname: string): string {
  const url = new URL(pathname, 'http://vite.dev')
  url.searchParams.delete('direct')
  return url.pathname + url.search
}

// copied from https://github.com/vitejs/vite/blob/e9a2746ca77473b1814fd05db3d299c074135fe5/packages/vite/src/node/plugins/loadFallback.ts#L11
async function load(this: Rollup.PluginContext, id: string) {
  try {
    const cleanedId = cleanUrl(id)
    const content = await fsp.readFile(cleanedId, 'utf-8')
    this.addWatchFile(cleanedId)
    return content
  } catch {
    const content = await fsp.readFile(id, 'utf-8')
    this.addWatchFile(id)
    return content
  }
}

export default function ipuzVitePlugin(): PluginOption {
  return {
    name: 'ipuz-plugin',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (ipuzFileRegex.test(source)) {
        const {
          id = source,
          meta = {},
          ...rest
        } = (await this.resolve(source, importer, options)) ?? {}
        return {
          ...rest,
          id: id.replace(ipuzFileRegex, '.json$1'),
          meta: { ...meta, ipuz: { idRewritten: true } },
        }
      }

      return null
    },
    load(id) {
      if (jsonFileRegex.test(id)) {
        const { idRewritten } = this.getModuleInfo(id)?.meta.ipuz ?? {}
        if (!!idRewritten) {
          return load.call(this, id.replace(jsonFileRegex, '.ipuz$1'))
        }
      }
      return null
    },
  }
}
