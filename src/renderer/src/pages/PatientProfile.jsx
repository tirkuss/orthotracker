import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit3, Trash2, Calendar, FileText, X, Plus, Phone, MapPin, Building, ChevronRight, Check } from 'lucide-react'
import { useApp } from '../hooks/useApp'

function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { storagePaths } = useApp()
  const [patient, setPatient] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null)
  const [showApptModal, setShowApptModal] = useState(false)
  const [newAppointment, setNewAppointment] = useState({ date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => { loadPatient() }, [id])

  const loadPatient = async () => {
    const data = await window.api.getPatientById(id)
    setPatient(data)
    setEditData(data)
  }

  const handleSave = async () => {
    await window.api.updatePatient(id, editData, 'General profile update')
    setIsEditing(false)
    loadPatient()
  }

  if (!patient) return <div className="p-10 text-center text-gray-400">Loading profile...</div>

  const photoPath = (filename, type = 'photos') => 'file://' + storagePaths[type + 'Path'] + '/' + filename

  return (
    <div className="min-h-screen bg-[#F8F9F8] flex flex-col pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <ChevronLeft className="w-5 h-5 text-accent" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-1">PATIENT</span>
              <h1 className="text-3xl font-extrabold text-accent tracking-tight">{patient.name_age_sex}</h1>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className={'p-3 bg-white rounded-2xl shadow-sm border border-gray-100 ' + (isEditing ? 'text-brand' : 'text-gray-400')}>
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        <section className="card p-6 space-y-4">
          {[{ icon: Calendar, label: 'Start Date', key: 'start_date' }, { icon: Phone, label: 'Phone', key: 'phone' }, { icon: MapPin, label: 'Address', key: 'address' }, { icon: Building, label: 'Clinic', key: 'clinic' }].map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center"><item.icon className="w-4 h-4 text-brand" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                {isEditing ? (
                  <input className="input-field py-1 text-sm mt-1" type={item.key === 'start_date' ? 'date' : 'text'} value={editData[item.key]} onChange={e => setEditData({...editData, [item.key]: e.target.value})} />
                ) : (
                  <p className="font-bold text-accent">{patient[item.key] || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="card p-6 space-y-6">
          {['Complaint', 'Treatment plan', 'Notes'].map((key) => (
            <div key={key}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{key}</p>
              {isEditing ? (
                <textarea className="input-field py-2 text-sm" rows="2" value={editData[key.toLowerCase().replace(' ', '_')]} onChange={e => setEditData({...editData, [key.toLowerCase().replace(' ', '_')]: e.target.value})} />
              ) : (
                <p className="font-bold text-accent leading-relaxed">{patient[key.toLowerCase().replace(' ', '_')] || '—'}</p>
              )}
            </div>
          ))}
        </section>

        <section className="card p-6 space-y-4">
          <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Initial Photos</span>
          <div className="grid grid-cols-4 gap-2">
            {patient.photos.map(photo => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer" onClick={() => setFullscreenPhoto(photo)}>
                <img src={photoPath(photo.filename, 'thumbnails')} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        <button onClick={() => setIsEditing(!isEditing)} className={'p-3 bg-white rounded-2xl shadow-sm border border-gray-100 ' + (isEditing ? 'text-brand' : 'text-gray-400')}>
  <Edit3 className="w-5 h-5" />
</button>

        <section className="space-y-4">
          <span className="text-[10px] font-bold text-brand uppercase tracking-widest px-2">Review History</span>
          {patient.appointments.slice().reverse().map((appt, idx) => (
            <div key={appt.id} className="card p-4 flex items-start gap-4">
              <div className="w-3 h-3 bg-brand rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-accent">Visit {patient.appointments.length - idx} · {appt.date}</h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{appt.notes}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <button onClick={() => setShowApptModal(true)} className="fixed bottom-8 right-8 bg-brand text-white py-4 px-8 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all z-30">
        <Plus className="w-5 h-5" />
        <span className="font-bold">Add Review</span>
      </button>

      {fullscreenPhoto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col p-4">
           <button onClick={() => setFullscreenPhoto(null)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-2xl text-white"><X className="w-6 h-6" /></button>
           <div className="flex-1 flex items-center justify-center">
             <img src={photoPath(fullscreenPhoto.filename, 'photos')} className="max-w-full max-h-full object-contain" />
           </div>
        </div>
      )}

      {showApptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full relative">
             <button onClick={() => setShowApptModal(false)} className="absolute top-6 right-6 text-gray-400"><X className="w-6 h-6" /></button>
             <h3 className="text-2xl font-black text-accent mb-6">Add Review</h3>
             <div className="space-y-4">
                <input type="date" className="input-field" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} />
                <textarea className="input-field" rows="4" placeholder="Wire change, etc..." value={newAppointment.notes} onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})} />
                <button onClick={async () => {
                   await window.api.addAppointment({ ...newAppointment, patient_id: id })
                   setShowApptModal(false)
                   loadPatient()
                }} className="w-full py-4 bg-brand text-white rounded-2xl font-bold">Save Review</button>
             </div>
           </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-light via-brand-light to-transparent z-40">
          <button onClick={handleSave} className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 py-5 bg-brand text-white rounded-3xl font-bold text-xl shadow-2xl active:scale-95">
            <Check className="w-6 h-6" />Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
export default PatientProfile