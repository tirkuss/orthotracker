import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Save, Camera, X, ImageIcon, Check } from 'lucide-react'
import { useApp } from '../hooks/useApp'

function AddPatient() {
  const { storagePaths } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name_age_sex: '',
    phone: '',
    address: '',
    clinic: '',
    complaint: '',
    treatment_plan: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    const newPhotos = files.map(file => ({
      path: file.path,
      preview: URL.createObjectURL(file)
    }))
    setSelectedPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (index) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name_age_sex) {
      alert('Patient name is required.')
      return
    }

    setIsSaving(true)
    try {
      const patientId = await window.api.addPatient(formData)
      for (const photo of selectedPhotos) {
        await window.api.uploadImage({
          patientId,
          filePath: photo.path,
          storagePaths
        })
      }
      navigate('/patient/' + patientId)
    } catch (error) {
      console.error(error)
      alert('Error saving patient data.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9F8] flex flex-col pb-32">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100">
            <ChevronLeft className="w-5 h-5 text-accent" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-1">
              NEW PATIENT
            </span>
            <h1 className="text-3xl font-extrabold text-accent tracking-tight">Add Patient</h1>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        <input
          type="text"
          name="name_age_sex"
          placeholder="Name Age Sex (e.g. Priya Sharma 25 F)"
          required
          className="w-full px-6 py-5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none text-lg font-bold"
          value={formData.name_age_sex}
          onChange={handleInputChange}
        />

        <div className="space-y-4">
          {['Phone', 'Address', 'Clinic', 'Chief complaint', 'Treatment plan', 'Start date', 'Notes'].map((label) => (
            <div key={label}>
              <label className="text-xs font-bold text-gray-500 mb-2 block px-1">{label}</label>
              {label === 'Start date' ? (
                <input type="date" name="start_date" className="input-field" value={formData.start_date} onChange={handleInputChange} />
              ) : (
                <textarea
                  name={label.toLowerCase().replace(' ', '_')}
                  placeholder={'Enter ' + label.toLowerCase() + '...'}
                  rows={label === 'Notes' ? 3 : 2}
                  className="input-field"
                  value={formData[label.toLowerCase().replace(' ', '_')]}
                  onChange={handleInputChange}
                />
              )}
            </div>
          ))}
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Photos</span>
            <span className="text-xs font-bold text-gray-400">{selectedPhotos.length} selected</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <button type="button" onClick={() => fileInputRef.current?.click()} className="card p-8 flex flex-col items-center gap-2 hover:bg-gray-50 border-dashed border-2 border-gray-100">
              <ImageIcon className="w-8 h-8 text-brand" />
              <span className="font-bold text-accent">Gallery</span>
            </button>
            <button type="button" className="card p-8 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
              <Camera className="w-8 h-8 text-brand" />
              <span className="font-bold text-accent">Camera</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handlePhotoSelect} />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {selectedPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border group">
                <img src={photo.preview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-accent/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-light via-brand-light to-transparent">
        <button onClick={handleSubmit} disabled={isSaving} className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 py-5 bg-brand hover:bg-brand-dark text-white rounded-3xl font-bold text-xl shadow-2xl active:scale-95">
          {isSaving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Check className="w-6 h-6" />Save Patient</>}
        </button>
      </div>
    </div>
  )
}
export default AddPatient