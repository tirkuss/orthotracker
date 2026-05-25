import { ipcMain, dialog } from 'electron'
import { jsPDF } from 'jspdf'
import { join } from 'path'
import fs from 'fs-extra'

export function setupPdfHandlers() {
  ipcMain.handle('patient:export-pdf', async (_, { patient, storagePaths }) => {
    const safeName = patient.name_age_sex.replace(/[^a-z0-9]/gi, '_')
    const safeAddress = (patient.address || '').replace(/[^a-z0-9]/gi, '_').substring(0, 20)
    const fileName = safeName + '+' + safeAddress + '.pdf'

    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Patient PDF',
      defaultPath: fileName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })

    if (!filePath) return false

    const doc = new jsPDF()
    let y = 20

    // Header
    doc.setFontSize(22)
    doc.setTextColor(0, 51, 153)
    doc.text('OrthoTracker Patient Profile', 20, y)
    y += 15

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text('Generated on ' + new Date().toLocaleDateString(), 20, y)
    y += 20

    // Patient Info
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text('General Information', 20, y)
    y += 10

    doc.setFontSize(12)
    const info = [
      ['Name (Age/Sex)', patient.name_age_sex],
      ['Phone', patient.phone || 'N/A'],
      ['Address', patient.address || 'N/A'],
      ['Clinic', patient.clinic || 'N/A'],
      ['Start Date', patient.start_date || 'N/A']
    ]

    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label + ':', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text('' + value, 60, y)
      y += 8
    })

    y += 10
    doc.setFontSize(16)
    doc.text('Clinical Details', 20, y)
    y += 10
    doc.setFontSize(12)
    
    const clinical = [
      ['Chief Complaint', patient.complaint],
      ['Treatment Plan', patient.treatment_plan],
      ['Notes', patient.notes]
    ]

    clinical.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label + ':', 20, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(value || 'None', 170)
      doc.text(lines, 20, y)
      y += lines.length * 7 + 5
    })

    // Appointments
    if (patient.appointments.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFontSize(16)
      doc.text('Review Appointments', 20, y)
      y += 10
      doc.setFontSize(11)
      patient.appointments.forEach(appt => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFont('helvetica', 'bold')
        doc.text(appt.date, 20, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(appt.notes || '', 170)
        doc.text(lines, 20, y)
        y += lines.length * 6 + 5
      })
    }

    // Photos
    if (patient.photos.length > 0) {
      doc.addPage()
      y = 20
      doc.setFontSize(16)
      doc.text('Patient Photos', 20, y)
      y += 20

      for (const photo of patient.photos) {
        const imgPath = join(storagePaths.photosPath, photo.filename)
        if (fs.existsSync(imgPath)) {
          const imgData = fs.readFileSync(imgPath).toString('base64')
          const imgFormat = photo.filename.split('.').pop().toUpperCase() === 'PNG' ? 'PNG' : 'JPEG'
          
          const props = doc.getImageProperties(imgData)
          const ratio = props.width / props.height
          const width = 170
          const height = width / ratio

          if (y + height > 280) {
            doc.addPage()
            y = 20
          }

          doc.addImage(imgData, imgFormat, 20, y, width, height)
          y += height + 10
        }
      }
    }

    doc.save(filePath)
    return true
  })
}