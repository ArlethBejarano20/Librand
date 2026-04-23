import React, { useState } from 'react';
import BuscadorPiezas from './BuscadorPiezas';
import AdminPiezas from './AdminPiezas';

function App() {
  // Este estado controla qué vista mostrar
  const [vista, setVista] = useState('buscador');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BARRA DE NAVEGACIÓN */}
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl text-gray-400">Libra Industries</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setVista('buscador')}
              className={`px-4 py-2 rounded transition ${vista === 'buscador' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
            Buscador
            </button>
            <button 
              onClick={() => setVista('admin')}
              className={`px-4 py-2 rounded transition ${vista === 'admin' ? 'bg-green-600' : 'hover:bg-gray-700'}`}
            >
              Registrar Pieza
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO DINÁMICO */}
      <div className="container mx-auto">
        {vista === 'buscador' ? (
          <BuscadorPiezas />
        ) : (
          <AdminPiezas />
        )}
      </div>
    </div>
  );
}

export default App;