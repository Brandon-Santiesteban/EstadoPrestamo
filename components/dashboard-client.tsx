'use client';

import { useMemo, useState } from 'react';
import { Search, Moon, Sun, Upload } from 'lucide-react';
import { parseExcel } from '@/lib/excel';
import type { LoanRow } from '@/lib/types';
import { currency } from '@/lib/format';

export default function DashboardClient() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  const [query, setQuery] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | undefined>();
  const [payrollMonth, setPayrollMonth] = useState('ENERO');
  const [darkMode, setDarkMode] = useState(false);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const value = `${row.NOMBRE} ${row.SEUDONIMO}`.toLowerCase();
        return value.includes(query.toLowerCase());
      }),
    [rows, query]
  );

  const onExcelUpload = async (file?: File) => {
    if (!file) return;
    const parsed = await parseExcel(file);
    setRows(parsed);
  };

  const onLogoUpload = async (file?: File) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setLogoBase64(base64);
  };

  const generatePdf = async (email: string) => {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, payrollMonth, logoBase64, email })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const sendMassEmails = async () => {
    await fetch('/api/send-payroll-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, payrollMonth, logoBase64 })
    });
    alert('Proceso de envío ejecutado.');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <main className="min-h-screen p-6">
        <section className="mx-auto max-w-7xl space-y-6">
          <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h1 className="text-xl font-bold">Dashboard de Préstamos</h1>
              <p className="text-sm text-slate-500">Carga de Excel, generación de PDF y envío masivo.</p>
            </div>
            <button
              onClick={() => setDarkMode((value) => !value)}
              className="rounded-xl border border-slate-300 p-2 dark:border-slate-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 font-medium">
                <Upload size={18} /> Upload Zone - Excel
              </div>
              <input type="file" accept=".xlsx,.xls" className="mt-3" onChange={(e) => onExcelUpload(e.target.files?.[0])} />
            </label>

            <label className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 font-medium">
                <Upload size={18} /> Upload Zone - Logo Empresa
              </div>
              <input type="file" accept="image/*" className="mt-3" onChange={(e) => onLogoUpload(e.target.files?.[0])} />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 md:grid-cols-[1fr,220px,220px]">
              <label className="relative block">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  placeholder="Buscar por nombre o seudónimo"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 dark:border-slate-700 dark:bg-slate-950"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>

              <input
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 uppercase dark:border-slate-700 dark:bg-slate-950"
                placeholder="Mes de nómina"
              />

              <button onClick={sendMassEmails} className="rounded-xl bg-brand-500 py-2 font-medium text-white hover:bg-brand-600">
                Enviar correos masivos
              </button>
            </div>
          </section>

          <section className="overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  {[
                    'FECHA',
                    'NOMBRE',
                    'SEUDONIMO',
                    'DESCRIPCION',
                    'CORREO',
                    'TOTAL A DESCONTAR',
                    'SALDO PENDIENTE',
                    'ACCIONES'
                  ].map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={`${row.CORREO}-${index}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{row.FECHA}</td>
                    <td className="px-3 py-2">{row.NOMBRE}</td>
                    <td className="px-3 py-2">{row.SEUDONIMO}</td>
                    <td className="px-3 py-2">{row.DESCRIPCION}</td>
                    <td className="px-3 py-2">{row.CORREO}</td>
                    <td className="px-3 py-2">{currency(row.TOTAL_A_DESCONTAR)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          row.SALDO_PENDIENTE > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                        }`}
                      >
                        {currency(row.SALDO_PENDIENTE)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => generatePdf(row.CORREO)}
                        className="rounded-lg border border-slate-300 px-3 py-1 dark:border-slate-700"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                      Cargue un archivo Excel para visualizar los registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>
      </main>
    </div>
  );
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
