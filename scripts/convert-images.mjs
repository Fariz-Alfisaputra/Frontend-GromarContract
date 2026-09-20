import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

async function convertPngToWebp() {
  const files = fs.readdirSync(publicDir)
  const pngFiles = files.filter(f => f.endsWith('.png'))

  console.log(`Found ${pngFiles.length} PNG files in ${publicDir}`)
  let totalOld = 0
  let totalNew = 0

  for (const file of pngFiles) {
    const inputPath = path.join(publicDir, file)
    const outputPath = path.join(publicDir, file.replace(/\.png$/, '.webp'))

    const oldSize = fs.statSync(inputPath).size
    totalOld += oldSize

    // Convert to webp with quality 80
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath)

    const newSize = fs.statSync(outputPath).size
    totalNew += newSize

    const savings = ((1 - newSize / oldSize) * 100).toFixed(1)
    console.log(`Converted: ${file} (${(oldSize / 1024).toFixed(1)} KB) -> ${(newSize / 1024).toFixed(1)} KB (Saved ${savings}%)`)
  }

  console.log('\n--- SUMMARY ---')
  console.log(`Total Original: ${(totalOld / 1024).toFixed(1)} KB`)
  console.log(`Total WebP: ${(totalNew / 1024).toFixed(1)} KB`)
  console.log(`Total Saved: ${((1 - totalNew / totalOld) * 100).toFixed(1)}%`)
}

convertPngToWebp().catch(console.error)
