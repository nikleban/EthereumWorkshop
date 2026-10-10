import { Routes, Route, Navigate } from 'react-router'
import { HomePage } from '@/pages/homePage/HomePage'
import { DashBoardPage } from '@/pages/Dashboard/DashBoardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard/:ethAddress" element={<DashBoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
