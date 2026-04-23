import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const BuscadorPiezas = () => {
  const [codigo, setCodigo] = useState('');
  const [cantidadOrden, setCantidadOrden] = useState(1);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const buscarDatos = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    
    // Buscamos la pieza para obtener su ID
    const { data: pieza, error: errorPieza } = await supabase
      .from('piezas')
      .select('id, cliente')
      .eq('codigo_pieza', codigo.trim())
      .single();

    if (errorPieza) {
      alert("Pieza no encontrada");
      setLoading(false);
      return;
    }

    // Buscamos todas las instrucciones asociadas a esa pieza
    const { data: instrucciones, error: errorInst } = await supabase
      .from('instrucciones_impresion')
      .select('*')
      .eq('pieza_id', pieza.id);

    if (errorInst) console.error(errorInst);
    
    setResultados(instrucciones || []);
    setLoading(false);
  };

  const abrirTodosLosPDFs = () => {
    if (resultados.length === 0) {
      alert("No hay documentos para abrir");
      return;
    }
    resultados.forEach((item) => {
      if (item.url_pdf) {
        window.open(item.url_pdf, '_blank');
      }
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Generación de Documentos para Ordenes</h1>
    
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          buscarDatos();
        }}
        className="flex gap-4 mb-8 bg-gray-100 p-4 rounded-lg"
      >
        <input 
          type="text" 
          placeholder="Código de pieza..." 
          className="border p-2 rounded w-full"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        />
        <input 
          type="number" 
          placeholder="Cant." 
          className="border p-2 rounded w-32"
          value={cantidadOrden}
          onChange={(e) => setCantidadOrden(parseInt(e.target.value) || 0)}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        
        {/* Botón de abrir todo al lado del de buscar */}
        <button 
          type="button"
          onClick={abrirTodosLosPDFs}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >Abrir PDFs </button>
      </form>

      <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">No.Parte</th>
            <th className="p-3 text-left">Documento</th>
            <th className="p-3 text-left">Páginas</th>
            <th className="p-3 text-left">Regla</th>
            <th className="p-3 text-center text-yellow-400">TOTAL COPIAS</th>
            <th className="p-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((item) => {
            const totalCopias = item.regla === 'POR_ORDEN' 
              ? item.cantidad_base * cantidadOrden 
              : item.cantidad_base;
              
            return (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {/* 1. CELDA NO. PARTE - Ahora sí coincide con el TH */}
                <td className="p-3 font-bold text-gray-700">{codigo}</td>
                
                {/* 2. CELDA DOCUMENTO */}
                <td className="p-3 font-medium">{item.nombre_documento}</td>
                
                {/* 3. CELDA PÁGINAS */}
                <td className="p-3 text-gray-600 text-sm">{item.paginas}</td>
                
                {/* 4. CELDA REGLA */}
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.regla === 'POR_ORDEN' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {item.regla}
                  </span>
                </td>
                
                {/* 5. CELDA TOTAL COPIAS */}
                <td className="p-3 text-center text-2xl font-black text-blue-600">
                  {totalCopias}
                </td>
                
                {/* 6. CELDA ACCIÓN */}
                <td className="p-3 text-right">
                  <a href={item.url_pdf} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold">
                    Ver PDF
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BuscadorPiezas;