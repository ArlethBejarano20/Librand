import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BuscadorPiezas = () => {
  const [codigo, setCodigo] = useState('');
  const [cantidadOrden, setCantidadOrden] = useState(1);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para la navegación por carpetas
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [piezasDelCliente, setPiezasDelCliente] = useState([]);

  // 1. Cargar lista de clientes únicos al entrar
  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const { data, error } = await supabase.from('piezas').select('cliente');
    if (error) console.error("Error cargando clientes:", error);
    
    // Filtramos nombres únicos y quitamos nulos
    const listaUnica = [...new Set(data?.map(item => item.cliente))].filter(Boolean);
    setClientes(listaUnica);
  };

  // 2. Al hacer clic en una carpeta de cliente
  const seleccionarCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setResultados([]); // Limpiar búsqueda previa
    const { data, error } = await supabase
      .from('piezas')
      .select('codigo_pieza')
      .eq('cliente', cliente);
    
    if (error) console.error("Error cargando piezas:", error);
    setPiezasDelCliente(data || []);
  };

  // 3. Función principal de búsqueda
  const buscarDatos = async (codigoForzado) => {
    const valor = (codigoForzado || codigo).trim().toUpperCase();
    if (!valor) return;
    
    setLoading(true);
    // Buscamos la pieza por su código exacto
    const { data: pieza, error: errorPieza } = await supabase
      .from('piezas')
      .select('id')
      .eq('codigo_pieza', valor)
      .maybeSingle();

    if (pieza) {
      const { data: instrucciones } = await supabase
        .from('instrucciones_impresion')
        .select('*')
        .eq('pieza_id', pieza.id);
      
      setResultados(instrucciones || []);
      setClienteSeleccionado(null); // Ocultamos carpetas para mostrar los PDFs
    } else {
      alert("Pieza no encontrada: " + valor);
      setResultados([]);
    }
    setLoading(false);
  };

  const abrirTodosLosPDFs = () => {
    if (resultados.length === 0) return alert("No hay documentos para abrir");
    resultados.forEach(item => {
      if (item.url_pdf) window.open(item.url_pdf, '_blank');
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">
        Impresión de JOBPACKET<span className="text-blue-600"></span>
      </h1>

      {/* BARRA DE BÚSQUEDA SUPERIOR */}
      <div className="flex flex-wrap gap-4 mb-10 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 items-center">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Buscar por No. Parte</label>
          <input 
            type="text" 
            placeholder="EJ: ACS900..." 
            className="w-full border-none bg-slate-100 p-3 rounded-xl mt-1 uppercase font-bold focus:ring-2 focus:ring-blue-500"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarDatos()}
          />
        </div>
        <div className="w-24">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Cant.</label>
          <input 
            type="number" 
            className="w-full border-none bg-slate-100 p-3 rounded-xl mt-1 font-bold text-center"
            value={cantidadOrden}
            onChange={(e) => setCantidadOrden(parseInt(e.target.value) || 1)}
          />
        </div>
        <button 
          onClick={() => buscarDatos()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 mt-5"
        >
          {loading ? '...' : 'BUSCAR'}
        </button>
      </div>

     {/* VISTA DE CARPETAS Y DIRECTORIOS */}
{resultados.length === 0 && (
  <div className="animate-fade-in">
    {/* Navegación y Botón Volver */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 text-sm font-bold">
        <button 
          onClick={() => {setClienteSeleccionado(null); setPiezasDelCliente([]); setCodigo('');}}
          className="text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
        >
          CLIENTES
        </button>
        {clienteSeleccionado && <span className="text-slate-300">/</span>}
        {clienteSeleccionado && <span className="text-blue-600 uppercase tracking-widest">{clienteSeleccionado}</span>}
      </div>

      {/* BOTÓN VOLVER DINÁMICO */}
      {clienteSeleccionado && (
        <button 
          onClick={() => {setClienteSeleccionado(null); setPiezasDelCliente([]);}}
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-black transition-all"
        >
          <span>←</span> VOLVER A CLIENTES
        </button>
      )}
    </div>

    {!clienteSeleccionado ? (
      // Vista de Clientes (Carpetas)
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {clientes.map(c => (
          <div 
            key={c}
            onClick={() => seleccionarCliente(c)}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-400 cursor-pointer flex flex-col items-center transition-all hover:scale-105 hover:shadow-md"
          >
            <span className="text-5xl mb-3">📂</span>
            <span className="font-black text-slate-700 text-center uppercase text-sm">{c}</span>
          </div>
        ))}
      </div>
    ) : (
      // Vista de No. Partes (Archivos)
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {piezasDelCliente.map(p => (
          <button 
            key={p.codigo_pieza}
            onClick={() => {setCodigo(p.codigo_pieza); buscarDatos(p.codigo_pieza);}}
            className="text-left p-4 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-slate-100 font-bold transition-all shadow-sm flex justify-between group"
          >
            <span>{p.codigo_pieza}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        ))}
      </div>
    )}
  </div>
)}
      {/* TABLA DE DOCUMENTOS ENCONTRADOS */}
      {resultados.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
          <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Documentación para:</p>
              <h2 className="text-2xl font-black">{codigo}</h2>
            </div>
            <div className="flex gap-3">
                <button onClick={abrirTodosLosPDFs} className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                  ABRIR TODOS LOS PDFs
                </button>
                <button onClick={() => {setResultados([]); setCodigo('');}} className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                  CERRAR
                </button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-5 text-left">Nombre del Documento</th>
                <th className="p-5 text-center">Tipo de Regla</th>
                <th className="p-5 text-center">Copias Totales</th>
                <th className="p-5 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resultados.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-bold text-slate-700">{item.nombre_documento}</td>
                  <td className="p-5 text-center">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">
                      {item.regla}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-3xl font-black text-blue-600">
                      {item.regla === 'POR_ORDEN' ? item.cantidad_base * cantidadOrden : item.cantidad_base}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <a href={item.url_pdf} target="_blank" rel="noreferrer" className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all text-sm border border-blue-100">
                      VER PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BuscadorPiezas;