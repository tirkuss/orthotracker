import { ipcMain } from 'electron'
import sharp from 'sharp'
import { join, basename } from 'path'
import fs from 'fs-extra'
import { getDb } from './db'

export function setupImageHandlers() {
  ipcMain.handle('image:upload', async (_, { patientId, filePath, storagePaths }) => {
    const db = getDb()
    const fileName = `${Date.now()}-${basename(filePath)}`
    const targetPath = join(storagePaths.photosPath, fileName)
    const thumbPath = join(storagePaths.thumbnailsPath, fileName)

    await sharp(filePath).jpeg({ quality: 80 }).toFile(targetPath)
    await sharp(filePath).resize(300, 300, { fit: 'inside' }).jpeg({ quality: 60 }).toFile(thumbPath)

    db.prepare('INSERT INTO photos (patient_id, filename) VALUES (?, ?)').run(patientId, fileName)
    return { fileName }
  })
}