import React, { useState } from 'react';
import BuscadorPiezas from './BuscadorPiezas';
import AdminPiezas from './AdminPiezas';

function App() {
  // Este estado controla qué vista mostrar
  const [vista, setVista] = useState('buscador');

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-slate-200 border-b-2 border-slate-300 py-3 px-4 sticky top-0 z-[100]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              ORDEN DE ACOMODO:
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <p className="text-sm md:text-base font-black text-slate-800">
              <span className="text-blue-600 mr-1">1.</span> PLANO
            </p>
            <p className="text-sm md:text-base font-black text-slate-800">
              <span className="text-blue-600 mr-1">2.</span> MANUFACTURING CHECKLIST
            </p>
            <p className="text-sm md:text-base font-black text-slate-800">
              <span className="text-blue-600 mr-1">3.</span> DIP
            </p>
          </div>

        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN */}
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl text-gray-400 tracking-tighter">Libra Industries</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setVista('buscador')}
              className={`px-4 py-2 rounded transition font-bold text-sm ${vista === 'buscador' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-700 text-gray-400'}`}
            >
              Buscador
            </button>
            <button 
              onClick={() => setVista('admin')}
              className={`px-4 py-2 rounded transition font-bold text-sm ${vista === 'admin' ? 'bg-green-600 shadow-lg' : 'hover:bg-gray-700 text-gray-400'}`}
            >
              Registrar Pieza
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO DINÁMICO */}
      <div className="container mx-auto pb-10">
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