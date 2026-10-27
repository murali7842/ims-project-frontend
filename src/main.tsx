import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Poppins (installed via @fontsource/poppins) in the weights the app uses
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    
  </StrictMode>,
)
