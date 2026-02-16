import * as XLSX from 'xlsx';
import { z } from 'zod';
import type { LoanRow } from './types';

const rowSchema = z.object({
  FECHA: z.string().default(''),
  NOMBRE: z.string().default(''),
  DESCRIPCION: z.string().default(''),
  SEUDONIMO: z.string().default(''),
  CORREO: z.string().default(''),
  PRESTAMO: z.coerce.number().default(0),
  INTERES_10: z.coerce.number().default(0),
  LE_QUEDA_POR_PAGAR: z.coerce.number().default(0),
  CUOTA: z.coerce.number().default(0),
  INT: z.coerce.number().default(0),
  ABONO_CAPITAL: z.coerce.number().default(0),
  DIFERENCIA_SUELDO_ABONO: z.coerce.number().default(0),
  TOTAL_A_DESCONTAR: z.coerce.number().default(0),
  SALDO_PENDIENTE: z.coerce.number().default(0)
});

const headersMap: Record<string, keyof LoanRow> = {
  FECHA: 'FECHA',
  NOMBRE: 'NOMBRE',
  DESCRIPCION: 'DESCRIPCION',
  SEUDONIMO: 'SEUDONIMO',
  CORREO: 'CORREO',
  PRESTAMO: 'PRESTAMO',
  'Intereses 10%': 'INTERES_10',
  'Le queda por pagar': 'LE_QUEDA_POR_PAGAR',
  CUOTA: 'CUOTA',
  INT: 'INT',
  'ABONO CAPITAL': 'ABONO_CAPITAL',
  'Diferencia de sueldo abono': 'DIFERENCIA_SUELDO_ABONO',
  'TOTAL A DESCONTAR': 'TOTAL_A_DESCONTAR',
  'SALDO PENDIENTE': 'SALDO_PENDIENTE'
};

export const parseExcel = async (file: File): Promise<LoanRow[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, string | number>>(firstSheet, { defval: '' });

  return rawRows.map((raw) => {
    const normalized = Object.entries(raw).reduce<Record<string, string | number>>((acc, [key, value]) => {
      const mapped = headersMap[key.trim()];
      if (mapped) acc[mapped] = value;
      return acc;
    }, {});

    return rowSchema.parse(normalized);
  });
};
