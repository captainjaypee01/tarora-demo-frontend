import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Insights from './pages/Insights'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="devices" element={<Devices />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  )
}

export default App
