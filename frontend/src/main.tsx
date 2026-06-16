import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'

import { Toaster } from 'react-hot-toast'

import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { CommandsPage } from './pages/CommandsPage'
import { CommandDetailsPage } from './pages/CommandDetailsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>

        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/commands/:id" element={<CommandDetailsPage />} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
)