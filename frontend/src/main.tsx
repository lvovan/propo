import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initClarity } from './services/clarityService'
import { migrateStorageKeys } from './services/storageMigration'

initClarity()
migrateStorageKeys()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
