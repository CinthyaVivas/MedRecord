import { useState } from 'react';
import ListaMedicamentos from '../components/ListaMedicamentos';
import RegistrarMedicamento from '../components/RegistrarMedicamento';
import Modal from '../components/Modal';

function MedicamentosPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setModalAbierto(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Medicamentos</h1>
        <button onClick={() => setModalAbierto(true)}>+ Añadir medicamento</button>
      </div>

      <ListaMedicamentos refreshTrigger={refreshTrigger} />

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)}>
        <RegistrarMedicamento onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}

export default MedicamentosPage;