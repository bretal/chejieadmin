import { type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { readdir, unlink } from 'node:fs/promises'
import { resolve, relative, join } from 'node:path'

interface Options {
  uploadUrl: string
  appName: string
  appVersion: string
  enabled?: boolean
  deleteAfterUpload?: boolean
}

export function sourceMapUploadPlugin(opts: Options): Plugin {
  const enabled = opts.enabled ?? false

  return {
    name: 'sourcemap-upload',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      if (!enabled) return

      const outDir = resolve(process.cwd(), 'dist')
      const files = await findMapFiles(outDir)

      for (const fp of files) {
        try {
          const content = readFileSync(fp, 'utf-8')
          const res = await fetch(opts.uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app: opts.appName,
              version: opts.appVersion,
              filename: relative(outDir, fp).replace(/\\/g, '/'),
              map: content,
            }),
          })
          if (res.ok && opts.deleteAfterUpload) {
            await unlink(fp).catch(() => {})
          }
        } catch (e) {
          console.warn(`[sourcemap-upload] Failed to upload: ${fp}`, e)
        }
      }
    },
  }
}

async function findMapFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      const sub = await findMapFiles(full)
      results.push(...sub)
    } else if (e.name.endsWith('.js.map') || e.name.endsWith('.css.map')) {
      results.push(full)
    }
  }
  return results
}
