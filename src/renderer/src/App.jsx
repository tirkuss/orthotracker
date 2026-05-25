import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './hooks/useApp'
import Home from './pages/Home'
import AddPatient from './pages/AddPatient'
import PatientProfile from './pages/PatientProfile'

function AppRoutes() {
  var appState = useApp()
  if (appState.loading) return <div className="h-screen flex items-center justify-center">Loading...</div>
  if (!appState.storagePaths) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-blue-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">Welcome to OrthoTracker</h1>
          <p className="text-gray-600 mb-8">Please select a folder to store your database.</p>
          <button onClick={appState.selectStorage} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Select Data Folder</button>
        </div>
      </div>
    )
  }
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/patient/:id" element={<PatientProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  )
}

function App() { return <AppProvider><AppRoutes /></AppProvider> }
export default App