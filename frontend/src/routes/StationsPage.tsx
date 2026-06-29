import React, { useEffect, useState } from 'react';
import { stationsApi } from '../services/api/stations.api';
import { DataTable } from '../components/shared/DataTable';
import { FormModal, FormField, inputStyle } from '../components/shared/FormModal';

interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const STATUS_OPTIONS = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];

export function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form, setForm] = useState({ name: '', city: '', state: '', status: 'ONLINE', notes: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    stationsApi.list().then(setStations).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', city: '', state: '', status: 'ONLINE', notes: '', latitude: '', longitude: '' });
    setModalOpen(true);
  }

  function openEdit(station: Station) {
    setEditing(station);
    setForm({
      name: station.name,
      city: station.city,
      state: station.state,
      status: station.status,
      notes: station.notes ?? '',
      latitude: station.latitude != null ? String(station.latitude) : '',
      longitude: station.longitude != null ? String(station.longitude) : '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };
      if (editing) {
        await stationsApi.update(editing.id, payload);
      } else {
        await stationsApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao salvar estação');
    }
  }

  async function handleDelete(station: Station) {
    if (!confirm(`Excluir a estação "${station.name}"?`)) return;
    try {
      await stationsApi.remove(station.id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao excluir estação');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e2e8f0', margin: 0 }}>Estações</h2>
        <button onClick={openCreate} style={primaryBtn}>+ Nova Estação</button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <DataTable
            getId={(s) => s.id}
            rows={stations}
            onEdit={openEdit}
            onDelete={handleDelete}
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'city', label: 'Cidade' },
              { key: 'state', label: 'UF' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </div>
      )}

      <FormModal
        title={editing ? 'Editar Estação' : 'Nova Estação'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <FormField label="Nome">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </FormField>
        <FormField label="Cidade">
          <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </FormField>
        <FormField label="Estado (UF)">
          <input style={inputStyle} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required maxLength={2} />
        </FormField>
        <FormField label="Status">
          <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: 12 }}>
          <FormField label="Latitude (opcional, p/ mapa do Brasil)">
            <input
              style={inputStyle}
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-15.7942"
              type="text"
              inputMode="decimal"
            />
          </FormField>
          <FormField label="Longitude (opcional, p/ mapa do Brasil)">
            <input
              style={inputStyle}
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="-47.8822"
              type="text"
              inputMode="decimal"
            />
          </FormField>
        </div>
        <p style={{ color: '#64748b', fontSize: 11, margin: '-4px 0 8px' }}>
          Dica: pegue lat/long de qualquer endereço no Google Maps (clique direito → "O que há aqui?").
        </p>
        <FormField label="Observações">
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </FormField>
        {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
      </FormModal>
    </div>
  );
}

const primaryBtn: React.CSSProperties = { background: '#3b82f6', border: 'none', borderRadius: 8, padding: '10px 16px', color: 'white', fontWeight: 600, cursor: 'pointer' };
