import React, { useEffect, useState } from 'react';
import { equipmentsApi, equipmentTypesApi } from '../services/api/equipments.api';
import { stationsApi } from '../services/api/stations.api';
import { DataTable } from '../components/shared/DataTable';
import { FormModal, FormField, inputStyle } from '../components/shared/FormModal';

interface Equipment {
  id: string;
  name: string;
  ip?: string;
  status: string;
  station: { name: string };
  type: { name: string };
}

const STATUS_OPTIONS = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];

export function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
  const [types, setTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: '', stationId: '', typeId: '', ip: '', status: 'ONLINE', portCount: 0 });

  function load() {
    setLoading(true);
    Promise.all([equipmentsApi.list(), stationsApi.list(), equipmentTypesApi.list()])
      .then(([eqs, sts, tys]) => {
        setEquipments(eqs);
        setStations(sts);
        setTypes(tys);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', stationId: stations[0]?.id ?? '', typeId: types[0]?.id ?? '', ip: '', status: 'ONLINE', portCount: 0 });
    setModalOpen(true);
  }

  function openEdit(eq: any) {
    setEditing(eq);
    setForm({ name: eq.name, stationId: eq.stationId, typeId: eq.typeId, ip: eq.ip ?? '', status: eq.status, portCount: 0 });
    setModalOpen(true);
  }

  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const { portCount, ...rest } = form;
        await equipmentsApi.update(editing.id, rest);
      } else {
        await equipmentsApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao salvar equipamento');
    }
  }

  async function handleDelete(eq: Equipment) {
    if (!confirm(`Excluir o equipamento "${eq.name}"? Isso também excluirá suas portas e conexões.`)) return;
    try {
      await equipmentsApi.remove(eq.id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao excluir equipamento');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e2e8f0', margin: 0 }}>Equipamentos</h2>
        <button onClick={openCreate} style={primaryBtn} disabled={stations.length === 0 || types.length === 0}>
          + Novo Equipamento
        </button>
      </div>

      {stations.length === 0 && (
        <p style={{ color: '#f59e0b', marginBottom: 12 }}>Cadastre uma estação antes de criar equipamentos.</p>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <DataTable
            getId={(e) => e.id}
            rows={equipments}
            onEdit={openEdit}
            onDelete={handleDelete}
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'type', label: 'Tipo', render: (e) => e.type?.name },
              { key: 'station', label: 'Estação', render: (e) => e.station?.name },
              { key: 'ip', label: 'IP' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </div>
      )}

      <FormModal
        title={editing ? 'Editar Equipamento' : 'Novo Equipamento'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <FormField label="Nome">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </FormField>
        <FormField label="Estação">
          <select style={inputStyle} value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} required>
            {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="Tipo">
          <select style={inputStyle} value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} required>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </FormField>
        <FormField label="IP">
          <input style={inputStyle} value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="192.168.0.1" />
        </FormField>
        <FormField label="Status">
          <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        {!editing && (
          <FormField label="Quantidade de portas (cria automaticamente)">
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.portCount}
              onChange={(e) => setForm({ ...form, portCount: Number(e.target.value) })}
            />
          </FormField>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
      </FormModal>
    </div>
  );
}

const primaryBtn: React.CSSProperties = { background: '#3b82f6', border: 'none', borderRadius: 8, padding: '10px 16px', color: 'white', fontWeight: 600, cursor: 'pointer' };
