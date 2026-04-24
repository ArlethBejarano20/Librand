import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BuscadorPiezas = () => {
  const [codigo, setCodigo] = useState('');
  const [cantidadOrden, setCantidadOrden] = useState(1);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [piezasDelCliente, setPiezasDelCliente] = useState([]);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const { data, error } = await supabase.from('piezas').select('cliente');
    if (error) return console.error("Error:", error);
    const listaLimpia = data?.map(item => item.cliente?.trim().toUpperCase()).filter(Boolean);
    setClientes([...new Set(listaLimpia)].sort());
  };

  const seleccionarCliente = async (clienteNombre) => {
    setClienteSeleccionado(clienteNombre);
    setResultados([]); 
    const { data, error } = await supabase
      .from('piezas')
      .select('codigo_pieza')
      .ilike('cliente', clienteNombre);
    if (error) console.error("Error:", error);
    setPiezasDelCliente(data || []);
  };

  const buscarDatos = async (codigoForzado) => {
    const valor = (codigoForzado || codigo).trim().toUpperCase();
    if (!valor) return;
    setLoading(true);
    const { data: pieza } = await supabase.from('piezas').select('id').ilike('codigo_pieza', valor).maybeSingle();

    if (pieza) {
      const { data: instrucciones } = await supabase
        .from('instrucciones_impresion')
        .select('*')
        .eq('pieza_id', pieza.id)
        .order('nombre_documento', { ascending: true });
      setResultados(instrucciones || []);
      setClienteSeleccionado(null); 
    } else {
      alert("Pieza no encontrada");
      setResultados([]);
    }
    setLoading(false);
  };

  const abrirTodosLosPDFs = () => {
    resultados.forEach(item => {
      if (item.url_pdf && item.url_pdf !== 'URL') window.open(item.url_pdf, '_blank');
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight italic">
        Impresion <span className="text-blue-600">JOBPACKET</span>
      </h1>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex flex-wrap gap-4 mb-10 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 items-center">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Buscar por No. Parte</label>
          <input 
            type="text" 
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
        <button onClick={() => buscarDatos()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold mt-5 shadow-lg shadow-blue-200">
          {loading ? '...' : 'BUSCAR'}
        </button>
      </div>

      {/* LÓGICA DE NAVEGACIÓN (CARPETAS VS PIEZAS) */}
      {resultados.length === 0 && (
        <div className="animate-fade-in">
          {/* Encabezado de navegación */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {clienteSeleccionado ? `PIEZAS DE / ${clienteSeleccionado}` : "Selecciona un Cliente"}
            </h2>
            {clienteSeleccionado && (
              <button 
                onClick={() => {setClienteSeleccionado(null); setPiezasDelCliente([]);}}
                className="text-xs font-black bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-all"
              >
                ← VOLVER A CLIENTES
              </button>
            )}
          </div>

          {!clienteSeleccionado ? (
            /* VISTA DE CARPETAS (CLIENTES) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {clientes.map(c => (
                <button 
                  key={c}
                  onClick={() => seleccionarCliente(c)}
                  className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 text-left"
                >
                  <div className="mb-4 p-3 bg-slate-100 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</span>
                  <h3 className="font-black text-slate-800 text-xl group-hover:text-blue-600 uppercase">{c}</h3>
                </button>
              ))}
            </div>
          ) : (
            /* VISTA DE PIEZAS (NO. PARTE) - DISEÑO MEJORADO */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {piezasDelCliente.map(p => (
                <button 
                  key={p.codigo_pieza}
                  onClick={() => {setCodigo(p.codigo_pieza); buscarDatos(p.codigo_pieza);}}
                  className="p-5 bg-white border-l-4 border-slate-200 hover:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase">No. Parte</p>
                  <p className="font-black text-slate-700 text-lg group-hover:text-blue-600">{p.codigo_pieza}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TABLA DE RESULTADOS (Se mantiene igual) */}
      {resultados.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
           <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Documentación para:</p>
              <h2 className="text-2xl font-black">{codigo}</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={abrirTodosLosPDFs} className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                ABRIR TODOS
              </button>
              <button onClick={() => {setResultados([]); setCodigo('');}} className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                CERRAR
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                <tr>
                  <th className="p-5 text-left">Documento</th>
                  <th className="p-5 text-center">Regla</th>
                  <th className="p-5 text-center">Copias</th>
                  <th className="p-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultados.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-700">{item.nombre_documento}</td>
                    <td className="p-5 text-center">
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {item.regla}
                      </span>
                    </td>
                    <td className="p-5 text-center font-black text-3xl text-blue-600">
                      {item.regla === 'POR_ORDEN' ? item.cantidad_base * cantidadOrden : item.cantidad_base}
                    </td>
                    <td className="p-5 text-right">
                      <a href={item.url_pdf} target="_blank" rel="noreferrer" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all text-sm border border-blue-100 shadow-sm">
                        VER PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorPiezas;