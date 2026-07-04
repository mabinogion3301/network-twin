import React, { useEffect, useState } from 'react';
import { connectionsApi, portsApi } from '../services/api/connections.api';
import { equipmentsApi } from '../services/api/equipments.api';
import { DataTable } from '../components/shared/DataTable';
import { FormModal, FormField, inputStyle } from '../components/shared/FormModal';

const TYPE_OPTIONS = [
  // Capacidades (linha tracejada)
  { value: 'ELETRONORTE_CAPACITY', label: 'Capacidade Eletronorte' },
  { value: 'TIM_CAPACITY',         label: 'Capacidade TIM' },
  { value: 'ELETROSUL_CAPACITY',   label: 'Capacidade Eletrosul' },
  // Fibras (linha cheia)
  { value: 'ELETRONORTE_FIBER',    label: 'Fibra Eletronorte' },
  { value: 'TIM_FIBER',            label: 'Fibra TIM' },
  { value: 'ELETROSUL_FIBER',      label: 'Fibra Eletrosul' },
  { value: 'GVT_FIBER',            label: 'Fibra GVT' },
  { value: 'CHESF_FIBER',          label: 'Fibra Chesf' },
  { value: 'FURNAS_FIBER',         label: 'Fibra Furnas' },
  { value: 'PETROBRAS_FIBER',      label: 'Fibra Petrobras' },
  { value: 'CEMIG_FIBER',          label: 'Fibra Cemig' },
  { value: 'TELEBRAS_FIBER',       label: 'Fibra Telebras' },
  { value: 'RNP_FIBER',            label: 'Fibra RNP' },
  { value: 'PRODEPA_FIBER',        label: 'Fibra Prodepa' },
  { value: 'OTHER',                label: 'Outro' },
];

export function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [sourcePorts, setSourcePorts] = useState<any[]>([]);
  const [targetPorts, setTargetPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sourceEquipmentId: '',
    sourcePortId: '',
    targetEquipmentId: '',
    targetPortId: '',
    type: 'FIBER',
    isBackup: false,
  });

  function load() {
    setLoading(true);
    Promise.all([connectionsApi.list(), equipmentsApi.list()])
      .then(([conns, eqs]) => {
        setConnections(conns);
        setEquipments(eqs);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    if (form.sourceEquipmentId) portsApi.listByEquipment(form.sourceEquipmentId).then(setSourcePorts);
    else setSourcePorts([]);
  }, [form.sourceEquipmentId]);

  useEffect(() => {
    if (form.targetEquipmentId) portsApi.listByEquipment(form.targetEquipmentId).then(setTargetPorts);
    else setTargetPorts([]);
  }, [form.targetEquipmentId]);

  function openCreate() {
    setForm({ name: '', sourceEquipmentId: '', sourcePortId: '', targetEquipmentId: '', targetPortId: '', type: 'FIBER', isBackup: false });
    setModalOpen(true);
  }

  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await connectionsApi.create({
        name: form.name,
        sourcePortId: form.sourcePortId,
        targetPortId: form.targetPortId,
        type: form.type,
        isBackup: form.isBackup,
      });
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao salvar conexão');
    }
  }

  async function handleDelete(conn: any) {
    if (!confirm(`Excluir a conexão "${conn.name}"?`)) return;
    try {
      await connectionsApi.remove(conn.id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message?.message ?? err?.message ?? 'Erro ao excluir conexão');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e2e8f0', margin: 0 }}>Conexões</h2>
        <button onClick={openCreate} style={primaryBtn} disabled={equipments.length < 2}>+ Nova Conexão</button>
      </div>

      {equipments.length < 2 && (
        <p style={{ color: '#f59e0b', marginBottom: 12 }}>Cadastre ao menos 2 equipamentos antes de criar conexões.</p>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <DataTable
            getId={(c) => c.id}
            rows={connections}
            onDelete={handleDelete}
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'type', label: 'Tipo' },
              { key: 'source', label: 'Origem', render: (c: any) => c.sourcePort?.equipment?.name },
              { key: 'target', label: 'Destino', render: (c: any) => c.targetPort?.equipment?.name },
              { key: 'status', label: 'Status' },
              { key: 'isBackup', label: 'Backup', render: (c: any) => (c.isBackup ? 'Sim' : 'Não') },
            ]}
          />
        </div>
      )}

      <FormModal title="Nova Conexão" open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}>
        <FormField label="Nome (ex: FO-001)">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </FormField>

        <FormField label="Equipamento de Origem">
          <select style={inputStyle} value={form.sourceEquipmentId} onChange={(e) => setForm({ ...form, sourceEquipmentId: e.target.value, sourcePortId: '' })} required>
            <option value="">Selecione...</option>
            {equipments.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </select>
        </FormField>
        <FormField label="Porta de Origem">
          <select style={inputStyle} value={form.sourcePortId} onChange={(e) => setForm({ ...form, sourcePortId: e.target.value })} required disabled={!form.sourceEquipmentId}>
            <option value="">Selecione...</option>
            {sourcePorts.map((p) => <option key={p.id} value={p.id}>Porta {p.number}</option>)}
          </select>
        </FormField>

        <FormField label="Equipamento de Destino">
          <select style={inputStyle} value={form.targetEquipmentId} onChange={(e) => setForm({ ...form, targetEquipmentId: e.target.value, targetPortId: '' })} required>
            <option value="">Selecione...</option>
            {equipments.filter((eq) => eq.id !== form.sourceEquipmentId).map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </select>
        </FormField>
        <FormField label="Porta de Destino">
          <select style={inputStyle} value={form.targetPortId} onChange={(e) => setForm({ ...form, targetPortId: e.target.value })} required disabled={!form.targetEquipmentId}>
            <option value="">Selecione...</option>
            {targetPorts.map((p) => <option key={p.id} value={p.id}>Porta {p.number}</option>)}
          </select>
        </FormField>

        <FormField label="Tipo">
          <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>

        <FormField label="É link backup?">
          <input type="checkbox" checked={form.isBackup} onChange={(e) => setForm({ ...form, isBackup: e.target.checked })} />
        </FormField>
        {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
      </FormModal>
    </div>
  );
}

const primaryBtn: React.CSSProperties = { background: '#3b82f6', border: 'none', borderRadius: 8, padding: '10px 16px', color: 'white', fontWeight: 600, cursor: 'pointer' };
