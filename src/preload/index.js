import { contextBridge, ipcRenderer } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

var api = {
  selectStorage: function() { return ipcRenderer.invoke('db:select-storage') },
  initDb: function(path) { return ipcRenderer.invoke('db:init', path) },
  addPatient: function(patient) { return ipcRenderer.invoke('patient:add', patient) },
  getPatients: function() { return ipcRenderer.invoke('patient:get-all') },
  getPatientById: function(id) { return ipcRenderer.invoke('patient:get-by-id', id) },
  updatePatient: function(id, patient, logAction) { return ipcRenderer.invoke('patient:update', id, patient, logAction) },
  addAppointment: function(appointment) { return ipcRenderer.invoke('appointment:add', appointment) },
  uploadImage: function(data) { return ipcRenderer.invoke('image:upload', data) },
  exportData: function(paths) { return ipcRenderer.invoke('data:export-all', paths) },
  importData: function(data) { return ipcRenderer.invoke('data:import-all', data) },
  exportPdf: function(data) { return ipcRenderer.invoke('patient:export-pdf', data) },
  confirmExit: function() { return ipcRenderer.invoke('app:confirm-exit') }
}

if (process.contextIsolated) {
  try {
    exposeElectronAPI()
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = exposeElectronAPI()
  window.api = api
}