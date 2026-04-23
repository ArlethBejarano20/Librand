import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AdminPiezas = () => {
  const [form, setForm] = useState({ codigo: '', cliente: '', urlPlano: '', urlDIP: '', urlChecklist: '' });
  const [loading, setLoading] = useState(false);

  const guardarPieza = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insertar la pieza
      const { data: nuevaPieza, error: errPieza } = await supabase
        .from('piezas')
        .insert([{ codigo_pieza: form.codigo.toUpperCase(), cliente: form.cliente }])
        .select()
        .single();

      if (errPieza) throw errPieza;

      // 2. Preparar los 3 documentos vinculados al ID de la nueva pieza
      const documentos = [
        { pieza_id: nuevaPieza.id, nombre_documento: 'Plano', paginas: 'Todas', regla: 'FIJO', cantidad_base: 1, url_pdf: form.urlPlano },
        { pieza_id: nuevaPieza.id, nombre_documento: 'DIP', paginas: 'Todas', regla: 'FIJO', cantidad_base: 2, url_pdf: form.urlDIP },
        { pieza_id: nuevaPieza.id, nombre_documento: 'Manufacturing Checklist', paginas: 'Todas', regla: 'POR_ORDEN', cantidad_base: 1, url_pdf: form.urlChecklist }
      ];

      const { error: errDocs } = await supabase.from('instrucciones_impresion').insert(documentos);
      if (errDocs) throw errDocs;

      alert("¡Pieza y documentos guardados con éxito!");
      setForm({ codigo: '', cliente: '', urlPlano: '', urlDIP: '', urlChecklist: '' });
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Registrar Nueva Pieza</h2>
      <form onSubmit={guardarPieza} className="space-y-4">
        <div>
          <label className="block text-sm font-bold">Código de Pieza:</label>
          <input required className="w-full border p-2 rounded" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold">Cliente:</label>
          <input required className="w-full border p-2 rounded" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} />
        </div>
        <hr />
        <div className="grid grid-cols-1 gap-4">
          <input placeholder="URL del PDF: Plano" className="border p-2 rounded text-sm" value={form.urlPlano} onChange={e => setForm({...form, urlPlano: e.target.value})} />
          <input placeholder="URL del PDF: DIP" className="border p-2 rounded text-sm" value={form.urlDIP} onChange={e => setForm({...form, urlDIP: e.target.value})} />
          <input placeholder="URL del PDF: Checklist" className="border p-2 rounded text-sm" value={form.urlChecklist} onChange={e => setForm({...form, urlChecklist: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
          {loading ? 'Guardando...' : 'Guardar Pieza Completa'}
        </button>
      </form>
    </div>
  );
};

export default AdminPiezas;