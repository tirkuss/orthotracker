import { ipcMain, dialog } from 'electron'
import AdmZip from 'adm-zip'
import { join } from 'path'
import fs from 'fs-extra'
import { getDb, initDb } from './db'

export function setupBackupHandlers() {
  ipcMain.handle('data:export-all', async (_, { storagePaths }) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Patient Database',
      defaultPath: 'ortho_export_' + new Date().toISOString().split('T')[0] + '.zip',
      filters: [{ name: 'ZIP Files', extensions: ['zip'] }]
    })

    if (!filePath) return false

    const zip = new AdmZip()
    zip.addLocalFile(join(storagePaths.storagePath, 'ortho_tracker.sqlite'))
    zip.addLocalFolder(storagePaths.photosPath, 'photos')
    zip.addLocalFolder(storagePaths.thumbnailsPath, 'thumbnails')
    
    zip.writeZip(filePath)
    return true
  })

  ipcMain.handle('data:import-all', async (_, { currentStoragePath }) => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Import Patient Database',
      filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
      properties: ['openFile']
    })

    if (filePaths.length === 0) return false

    const zip = new AdmZip(filePaths[0])
    zip.extractAllTo(currentStoragePath, true)
    
    // Re-initialize DB connection
    initDb(currentStoragePath)
    return true
  })
}

export function startAutosave(storagePaths) {
  const interval = 24 * 60 * 60 * 1000 // 24 hours
  
  setInterval(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = 'backup-' + timestamp + '.sqlite'
    const backupPath = join(storagePaths.backupsPath, backupName)
    
    await fs.copy(join(storagePaths.storagePath, 'ortho_tracker.sqlite'), backupPath)
    
    // Keep only last 7 days of backups
    const files = await fs.readdir(storagePaths.backupsPath)
    const sqliteBackups = files.filter(f => f.startsWith('backup-') && f.endsWith('.sqlite')).sort()
    
    if (sqliteBackups.length > 7) {
      for (let i = 0; i < sqliteBackups.length - 7; i++) {
        await fs.remove(join(storagePaths.backupsPath, sqliteBackups[i]))
      }
    }
  }, interval)
}