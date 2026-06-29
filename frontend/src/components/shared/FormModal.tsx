import React from 'react';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel?: string;
}

export function FormModal({ title, open, onClose, onSubmit, children, submitLabel = 'Salvar' }: Props) {
  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#1e293b', borderRadius: 12, padding: 24, width: 420, maxHeight: '85vh', overflowY: 'auto' }}
      >
        <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={cancelBtn}>
            Cancelar
          </button>
          <button type="submit" style={submitBtn}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#94a3b8', fontSize: 12 }}>{label}</span>
      {children}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  padding: 8,
  borderRadius: 6,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
};

const cancelBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #334155', borderRadius: 6, padding: '8px 16px', color: '#cbd5e1', cursor: 'pointer' };
const submitBtn: React.CSSProperties = { background: '#3b82f6', border: 'none', borderRadius: 6, padding: '8px 16px', color: 'white', fontWeight: 600, cursor: 'pointer' };
