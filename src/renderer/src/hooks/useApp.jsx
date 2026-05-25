import React, { createContext, useContext, useState, useEffect } from 'react'

var AppContext = createContext()

export function AppProvider(props) {
  var children = props.children
  var [storagePaths, setStoragePaths] = useState(null)
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    var savedPath = localStorage.getItem('ortho_storage_path')
    if (savedPath) {
      window.api.initDb(savedPath).then(function(paths) {
        setStoragePaths(paths)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  var selectStorage = async function() {
    var path = await window.api.selectStorage()
    if (path) {
      var paths = await window.api.initDb(path)
      localStorage.setItem('ortho_storage_path', path)
      setStoragePaths(paths)
    }
  }

  return (
    <AppContext.Provider value={{ storagePaths: storagePaths, selectStorage: selectStorage, loading: loading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}