import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { UploadProvider } from './context/UploadContext'  // <-- import UploadProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <UploadProvider>         {/* Wrap App with UploadProvider */}
          <App />
        </UploadProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      registration => {
        console.log('✅ ServiceWorker registered: ', registration);
      },
      err => {
        console.error('❌ ServiceWorker registration failed: ', err);
      }
    );
  });
}
