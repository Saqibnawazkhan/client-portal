import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  full?: boolean;
  optional?: boolean;
  help?: string;
  children: ReactNode;
}

export function Field({ label, full, optional, help, children }: FieldProps) {
  return (
    <div className={`field${full ? ' field-full' : ''}`}>
      <label className="field-label">
        {label}
        {optional && <span className="optional-tag"> · optional</span>}
      </label>
      {children}
      {help && <div className="field-help">{help}</div>}
    </div>
  );
}

interface SectionHeadProps {
  n: string | number;
  title: string;
  action?: ReactNode;
}

export function SectionHead({ n, title, action }: SectionHeadProps) {
  return (
    <div className="row between wrap" style={{ gap: 12, marginBottom: 18 }}>
      <div className="row" style={{ gap: 12 }}>
        <span className="step-num">{n}</span>
        <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h3>
      </div>
      {action}
    </div>
  );
}
