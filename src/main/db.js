import Database from 'better-sqlite3'
import { join } from 'path'
import fs from 'fs-extra'
import { ipcMain, dialog } from 'electron'

let db; let storagePath
export const getDb = function() { return db }
export const initDb = function(customPath) {
  storagePath = customPath
  var dbPath = join(storagePath, 'ortho_tracker.sqlite')
  var photosPath = join(storagePath, 'photos')
  var thumbnailsPath = join(storagePath, 'thumbnails')
  var backupsPath = join(storagePath, 'backups')

  fs.ensureDirSync(photosPath); fs.ensureDirSync(thumbnailsPath); fs.ensureDirSync(backupsPath)
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(
    'CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, name_age_sex TEXT NOT NULL, phone TEXT, address TEXT, clinic TEXT, complaint TEXT, treatment_plan TEXT, start_date TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);' +
    'CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, filename TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE);' +
    'CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, date TEXT, notes TEXT, FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE);' +
    'CREATE TABLE IF NOT EXISTS edit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, action TEXT, details TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE);'
  )
  return { storagePath: storagePath, photosPath: photosPath, thumbnailsPath: thumbnailsPath, backupsPath: backupsPath }
}

export function setupDbHandlers() {
  ipcMain.handle('db:select-storage', async () => {
    var result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
    return (!result.canceled && result.filePaths.length > 0) ? result.filePaths[0] : null
  })
  ipcMain.handle('db:init', async (_, path) => initDb(path))
  ipcMain.handle('patient:add', async (_, p) => {
    return db.prepare('INSERT INTO patients (name_age_sex, phone, address, clinic, complaint, treatment_plan, start_date, notes) VALUES (?,?,?,?,?,?,?,?)').run(p.name_age_sex, p.phone, p.address, p.clinic, p.complaint, p.treatment_plan, p.start_date, p.notes).lastInsertRowid
  })
  ipcMain.handle('patient:get-all', async () => db.prepare('SELECT * FROM patients ORDER BY name_age_sex ASC').all())
  ipcMain.handle('patient:get-by-id', async (_, id) => {
    var patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id)
    var appointments = db.prepare('SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC').all(id)
    var photos = db.prepare('SELECT * FROM photos WHERE patient_id = ? ORDER BY created_at DESC').all(id)
    var logs = db.prepare('SELECT * FROM edit_logs WHERE patient_id = ? ORDER BY timestamp DESC').all(id)
    return Object.assign({}, patient, { appointments: appointments, photos: photos, logs: logs })
  })
  ipcMain.handle('patient:update', async (_, id, p, log) => {
    db.prepare('UPDATE patients SET name_age_sex=?, phone=?, address=?, clinic=?, complaint=?, treatment_plan=?, start_date=?, notes=? WHERE id = ?').run(p.name_age_sex, p.phone, p.address, p.clinic, p.complaint, p.treatment_plan, p.start_date, p.notes, id)
    if (log) db.prepare('INSERT INTO edit_logs (patient_id, action, details) VALUES (?, ?, ?)').run(id, 'Update', log)
    return true
  })
  ipcMain.handle('appointment:add', async (_, a) => db.prepare('INSERT INTO appointments (patient_id, date, notes) VALUES (?, ?, ?)').run(a.patient_id, a.date, a.notes).lastInsertRowid)
}