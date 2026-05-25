import React, { useState, useEffect, useMemo } from 'react'
import { Search, UserPlus, Info, ArrowUpDown, Sparkles, ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'

function Home() {
  const { storagePaths } = useApp()
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => { if (storagePaths) window.api.getPatients().then(setPatients) }, [storagePaths])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => p.name_age_sex.toLowerCase().includes(searchTerm.toLowerCase()) || (p.phone && p.phone.includes(searchTerm)))
  }, [patients, searchTerm])

  const groupedPatients = useMemo(() => {
    const groups = {}
    filteredPatients.forEach(p => {
      const char = p.name_age_sex[0].toUpperCase()
      if (!groups[char]) groups[char] = []
      groups[char].push(p)
    })
    return Object.keys(groups).sort().map(char => ({ char, patients: groups[char] }))
  }, [filteredPatients])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9F8]">
      <div className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">ORTHODONTIC</span>
            <h1 className="text-4xl font-extrabold text-accent">Patient Tracker</h1>
          </div>
          <button onClick={() => setShowAbout(true)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"><Info className="text-accent" /></button>
        </div>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name or phone..." className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl shadow-inner focus:ring-2 focus:ring-brand outline-none text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={async () => {
             var success = await window.api.importData({ currentStoragePath: storagePaths.storagePath })
             if (success) { alert('Imported!'); window.api.getPatients().then(setPatients); }
          }} className="card p-6 flex flex-col gap-4 text-left">
            <ArrowUpDown className="text-gray-600" />
            <h3 className="font-bold text-accent">Import / Export</h3>
          </button>
          <button onClick={() => setShowAbout(true)} className="card p-6 flex flex-col gap-4 text-left">
            <Sparkles className="text-gray-600" />
            <h3 className="font-bold text-accent">About</h3>
          </button>
        </div>
      </div>
      <div className="flex-1 flex px-6 pb-6 overflow-hidden gap-4">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="mb-4 text-sm font-semibold text-gray-500">Showing {filteredPatients.length} of {patients.length} patients</div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            {groupedPatients.map(group => (
              <div key={group.char} id={'letter-' + group.char}>
                <h2 className="text-2xl font-black text-accent mb-4 px-2">{group.char}</h2>
                <div className="space-y-3">
                  {group.patients.map(p => (
                    <Link key={p.id} to={'/patient/' + p.id} className="card p-4 flex items-center justify-between hover:translate-x-1 transition-transform">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center font-bold text-brand uppercase">{p.name_age_sex.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div><div className="font-bold text-accent text-lg">{p.name_age_sex}</div><div className="text-sm text-gray-400">Phone: {p.phone || 'N/A'}</div></div>
                      </div>
                      <ChevronRight className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-4 flex flex-col justify-between py-12 text-[10px] font-black text-gray-300">
          {alphabet.map(letter => (
            <button key={letter} className={'hover:text-brand ' + (groupedPatients.some(g => g.char === letter) ? 'text-brand' : '')} onClick={() => document.getElementById('letter-' + letter)?.scrollIntoView({ behavior: 'smooth' })}>{letter}</button>
          ))}
        </div>
      </div>
      <Link to="/add-patient" className="fixed bottom-8 right-8 w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 z-30"><UserPlus /></Link>
      {showAbout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 text-gray-400"><X /></button>
            <div className="text-center">
              <h2 className="text-3xl font-black text-accent mb-2">OrthoTracker</h2>
              <p className="text-gray-500 mb-8">Secure offline-first management.</p>
              <div className="bg-gray-50 p-6 rounded-3xl mb-8">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Created By</p>
                <p className="text-2xl font-black text-brand">Dr. Sukrit Thakur</p>
              </div>
              <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-accent text-white rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Home