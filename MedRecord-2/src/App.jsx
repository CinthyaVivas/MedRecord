import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MedicamentosPage from './pages/MedicamentosPage';
import CitasPage from './pages/CitasPage';
import RecordatoriosPage from './pages/RecordatoriosPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/medicamentos" />} />
            <Route path="/medicamentos" element={<MedicamentosPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/recordatorios" element={<RecordatoriosPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;