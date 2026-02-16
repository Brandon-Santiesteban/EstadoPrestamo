import * as XLSX from 'xlsx';
import { z } from 'zod';
import type { LoanRow } from './types';

type RawCell = string | number | Date | null | undefined;

const toDateString = (value: RawCell): string => {
  if (value instanceof Date) {
    return value.toLocaleDateString('es-CR');
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const date = new Date(parsed.y, parsed.m - 1, parsed.d);
      return date.toLocaleDateString('es-CR');
    }

    return String(value);
  }

  return String(value ?? '').trim();
};

const toNumber = (value: RawCell): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const cleaned = value
    .replace(/\s/g, '')
    .replace(/[$₡,]/g, '')
    .replace(/\.(?=.*\.)/g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const rowSchema = z.object({
  FECHA: z.preprocess((value) => toDateString(value as RawCell), z.string()),
  NOMBRE: z.preprocess((value) => String(value ?? '').trim(), z.string()),
  DESCRIPCION: z.preprocess((value) => String(value ?? '').trim(), z.string()),
  SEUDONIMO: z.preprocess((value) => String(value ?? '').trim(), z.string()),
  CORREO: z.preprocess((value) => String(value ?? '').trim(), z.string()),
  PRESTAMO: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  INTERES_10: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  LE_QUEDA_POR_PAGAR: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  CUOTA: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  INT: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  ABONO_CAPITAL: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  DIFERENCIA_SUELDO_ABONO: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  TOTAL_A_DESCONTAR: z.preprocess((value) => toNumber(value as RawCell), z.number()),
  SALDO_PENDIENTE: z.preprocess((value) => toNumber(value as RawCell), z.number())
});

const normalizeHeader = (header: string) =>
  header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const headersMap: Record<string, keyof LoanRow> = {
  FECHA: 'FECHA',
  NOMBRE: 'NOMBRE',
  DESCRIPCION: 'DESCRIPCION',
  SEUDONIMO: 'SEUDONIMO',
  CORREO: 'CORREO',
  PRESTAMO: 'PRESTAMO',
  'INTERESES 10%': 'INTERES_10',
  'LE QUEDA POR PAGAR': 'LE_QUEDA_POR_PAGAR',
  CUOTA: 'CUOTA',
  INT: 'INT',
  'ABONO CAPITAL': 'ABONO_CAPITAL',
  'DIFERENCIA DE SUELDO ABONO': 'DIFERENCIA_SUELDO_ABONO',
  'TOTAL A DESCONTAR': 'TOTAL_A_DESCONTAR',
  'SALDO PENDIENTE': 'SALDO_PENDIENTE'
};

export const parseExcel = async (file: File): Promise<LoanRow[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, RawCell>>(firstSheet, {
    defval: '',
    raw: true
  });

  return rawRows.map((raw, index) => {
    const normalized = Object.entries(raw).reduce<Record<string, RawCell>>((acc, [key, value]) => {
      const mapped = headersMap[normalizeHeader(key)];
      if (mapped) acc[mapped] = value;
      return acc;
    }, {});

    const parsed = rowSchema.safeParse(normalized);
    if (!parsed.success) {
      throw new Error(`Fila ${index + 2} inválida: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`);
    }

    return parsed.data;
  });
};
