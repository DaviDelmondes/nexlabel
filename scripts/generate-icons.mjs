/**
 * Gera public/icon.png (512×512) e public/favicon.ico (48/32/16px)
 * com o logo Nexlabel: letra "N" roxa (#7c3aed) em fundo escuro (#09090b)
 *
 * Execute: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

/**
 * Monta o SVG do ícone em qualquer tamanho.
 * O "N" é desenhado como path geométrico — não depende de fontes do sistema.
 *
 * Design base num canvas 100×100:
 *   barra esquerda  x:18→30  y:16→84
 *   barra direita   x:70→82  y:16→84
 *   diagonal        de (30,16)→(70,84)  [stroke ~14px de espessura]
 */
function makeSvg(size) {
  const r = Math.round(size * 0.18)  // border-radius ≈ 18%
  const k = size / 100               // fator de escala

  const pts = [
    [18, 16], [18, 84], [30, 84], [30, 38],
    [70, 84], [82, 84], [82, 16], [70, 16],
    [70, 62], [30, 16],
  ].map(([x, y]) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`)

  const d = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(' ')} Z`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#09090b"/>
  <path d="${d}" fill="#7c3aed"/>
</svg>`
}

/** Combina buffers PNG em um único arquivo .ico */
function buildIco(images) {
  // images: Array<{ buf: Buffer, size: number }>
  const HEADER_SIZE    = 6
  const DIR_ENTRY_SIZE = 16
  const count          = images.length

  let offset = HEADER_SIZE + DIR_ENTRY_SIZE * count

  // Header
  const header = Buffer.alloc(HEADER_SIZE)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: ICO
  header.writeUInt16LE(count, 4)

  // Directory entries
  const dirEntries = images.map(({ buf, size }) => {
    const entry = Buffer.alloc(DIR_ENTRY_SIZE)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)  // width  (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)  // height
    entry.writeUInt8(0, 2)   // colorCount (0 = >8bpp)
    entry.writeUInt8(0, 3)   // reserved
    entry.writeUInt16LE(1, 4)  // planes
    entry.writeUInt16LE(32, 6) // bitCount
    entry.writeUInt32LE(buf.length, 8)  // image data size
    entry.writeUInt32LE(offset, 12)     // image data offset
    offset += buf.length
    return entry
  })

  return Buffer.concat([header, ...dirEntries, ...images.map(i => i.buf)])
}

async function main() {
  console.log('Gerando ícones Nexlabel...\n')

  // ── 512×512 PNG ─────────────────────────────────────────────────────────
  await sharp(Buffer.from(makeSvg(512)))
    .png()
    .toFile(join(publicDir, 'icon.png'))
  console.log('✓  public/icon.png     (512×512)')

  // ── favicon.ico com 3 tamanhos ──────────────────────────────────────────
  // Renderiza em 4× e reduz para preservar qualidade
  const icoImages = await Promise.all(
    [48, 32, 16].map(async size => {
      const buf = await sharp(Buffer.from(makeSvg(size * 4)))
        .resize(size, size, { kernel: 'lanczos3' })
        .png()
        .toBuffer()
      return { buf, size }
    })
  )

  const ico = buildIco(icoImages)
  writeFileSync(join(publicDir, 'favicon.ico'), ico)
  console.log('✓  public/favicon.ico  (48×48, 32×32, 16×16)')

  console.log('\nícones gerados com sucesso.')
}

main().catch(err => { console.error(err); process.exit(1) })
