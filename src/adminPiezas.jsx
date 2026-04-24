import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AdminPiezas = () => {
  const [cliente, setCliente] = useState('');
  const [codigoPieza, setCodigoPieza] = useState('');
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);

  // Estado inicial de la tabla de documentos
  const [instrucciones, setInstrucciones] = useState([
    { nombre_documento: 'PLANO', regla: 'FIJO', cantidad_base: 1, url_pdf: '' },
    { nombre_documento: 'MANUFACTURING CHECKLIST', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' },
    { nombre_documento: 'DIP', regla: 'FIJO', cantidad_base: 2, url_pdf: '' },
    { nombre_documento: '', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' },
  ]);

  // PUNTO 3: Limpiar todo el formulario
  const limpiarFormulario = () => {
    setCliente('');
    setCodigoPieza('');
    setEditando(false);
    setInstrucciones([
      { nombre_documento: 'PLANO', regla: 'FIJO', cantidad_base: 1, url_pdf: '' },
      { nombre_documento: 'MANUFACTURING CHECKLIST', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' },
      { nombre_documento: 'DIP', regla: 'FIJO', cantidad_base: 2, url_pdf: '' },
      { nombre_documento: '', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' },
    ]);
  };

  // PUNTO 2: Cargar datos existentes para editar
  const cargarPiezaParaEditar = async () => {
    const valor = codigoPieza.trim().toUpperCase();
    if (!valor) return alert("Por favor, ingresa un Número de Parte primero.");

    setLoading(true);
    try {
      const { data: pieza, error } = await supabase
        .from('piezas')
        .select('*, instrucciones_impresion(*)')
        .ilike('codigo_pieza', valor)
        .maybeSingle();

      if (error) throw error;

      if (pieza) {
        setCliente(pieza.cliente || '');
        setCodigoPieza(pieza.codigo_pieza || '');
        setEditando(true);
        if (pieza.instrucciones_impresion && pieza.instrucciones_impresion.length > 0) {
          setInstrucciones(pieza.instrucciones_impresion);
        } else {
          // Si la pieza existe pero no tiene docs, dejamos los campos vacíos para llenar
          setInstrucciones([{ nombre_documento: '', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' }]);
        }
      } else {
        alert("No se encontró la pieza: " + valor);
      }
    } catch (e) {
      console.error("Error al cargar:", e);
      alert("Error al buscar la pieza");
    } finally {
      setLoading(false);
    }
  };

  const agregarFila = () => {
    setInstrucciones([...instrucciones, { nombre_documento: '', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: '' }]);
  };

  const manejarCambioFila = (index, campo, valor) => {
    const nuevas = [...instrucciones];
    nuevas[index][campo] = campo === 'nombre_documento' ? valor.toUpperCase() : valor;
    setInstrucciones(nuevas);
  };

  // PUNTO 1: Guardar (Upsert) - Actualiza fecha automáticamente
  const guardarPiezaCompleta = async () => {
    if (!cliente || !codigoPieza) return alert("El Cliente y el No. Parte son obligatorios.");
    
    setLoading(true);
    try {
      // 1. Insertar/Actualizar Pieza
      const { data: pieza, error: errorPieza } = await supabase
        .from('piezas')
        .upsert({ 
          cliente: cliente.trim().toUpperCase(), 
          codigo_pieza: codigoPieza.trim().toUpperCase(),
          updated_at: new Date() // Forzamos actualización de fecha
        }, { onConflict: 'codigo_pieza' })
        .select().single();

      if (errorPieza) throw errorPieza;

      // 2. Limpiar documentos vacíos y preparar carga
      const filasAInsertar = instrucciones
        .filter(ins => ins.nombre_documento.trim() !== '')
        .map(ins => ({
          pieza_id: pieza.id,
          nombre_documento: ins.nombre_documento.trim().toUpperCase(),
          regla: ins.regla,
          cantidad_base: ins.cantidad_base,
          url_pdf: ins.url_pdf.trim() || 'URL'
        }));

      // 3. Reemplazar instrucciones (Borrar y Volver a insertar)
      await supabase.from('instrucciones_impresion').delete().eq('pieza_id', pieza.id);
      const { error: errorIns } = await supabase.from('instrucciones_impresion').insert(filasAInsertar);

      if (errorIns) throw errorIns;

      alert(editando ? " CAMBIOS ACTUALIZADOS" : "REGISTRO EXITOSO");
      limpiarFormulario();
    } catch (error) {
      console.error(error);
      alert("Error crítico al guardar. Revisa la conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter uppercase ${editando ? 'text-orange-600' : 'text-slate-800'}`}>
            {editando ? ' Modo Edición' : ' Registro de Pieza'}
          </h2>
          <p className="text-slate-400 font-bold text-sm">
            {editando ? 'Modificando archivos de una pieza existente' : 'Agregando nueva configuración al sistema'}
          </p>
        </div>
        <button 
          onClick={limpiarFormulario}
          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-2xl font-black text-xs transition-all border border-red-100 uppercase"
        >
          Limpiar Formulario
        </button>
      </div>

      {/* SECCIÓN DE DATOS PRINCIPALES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Parte</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                placeholder="EJ: ACS900..."
                className="flex-1 bg-slate-100 border-none p-4 rounded-2xl font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={codigoPieza}
                onChange={(e) => setCodigoPieza(e.target.value)}
              />
              <button 
                onClick={cargarPiezaParaEditar}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-2xl font-black text-xs transition-all"
              >
                EDITAR
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Carpeta</label>
            <input 
              type="text" 
              placeholder="EJ: JABIL"
              className="w-full bg-slate-100 border-none p-4 rounded-2xl mt-1 font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* TABLA DE DOCUMENTACIÓN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <span className="text-xs font-black uppercase tracking-widest">Documentos del Jobpacket</span>
          <button 
            onClick={agregarFila}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
          >
            + AÑADIR FILA
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                <th className="p-4">Nombre del Documento</th>
                <th className="p-4 text-center">Regla de Copias</th>
                <th className="p-4 text-center w-24">Cant</th>
                <th className="p-4">Link del PDF (Supabase)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {instrucciones.map((ins, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <input 
                      type="text" 
                      placeholder="EJ: PLANO..."
                      className="w-full bg-slate-50 border-none p-3 rounded-xl text-sm font-bold uppercase"
                      value={ins.nombre_documento}
                      onChange={(e) => manejarCambioFila(index, 'nombre_documento', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <select 
                      className="w-full bg-slate-50 border-none p-3 rounded-xl text-xs font-black uppercase"
                      value={ins.regla}
                      onChange={(e) => manejarCambioFila(index, 'regla', e.target.value)}
                    >
                      <option value="POR_ORDEN">POR ORDEN</option>
                      <option value="FIJO">FIJO </option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-none p-3 rounded-xl text-center font-bold"
                      value={ins.cantidad_base}
                      onChange={(e) => manejarCambioFila(index, 'cantidad_base', parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full bg-slate-50 border-none p-3 rounded-xl text-[10px] text-blue-600 italic outline-none"
                      value={ins.url_pdf}
                      onChange={(e) => manejarCambioFila(index, 'url_pdf', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={guardarPiezaCompleta}
            disabled={loading}
            className={`px-12 py-4 rounded-2xl font-black shadow-lg transition-all disabled:opacity-50 text-white ${
              editando ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'
            }`}
          >
            {loading ? 'PROCESANDO...' : editando ? 'ACTUALIZAR CAMBIOS' : 'GUARDAR NUEVA PIEZA'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminPiezas;