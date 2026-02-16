import type { EmployeeGroup, LoanRow } from './types';

export const groupRowsByEmployee = (rows: LoanRow[]): EmployeeGroup[] => {
  const grouped = new Map<string, EmployeeGroup>();

  rows.forEach((row) => {
    const key = `${row.NOMBRE.toLowerCase()}|${row.CORREO.toLowerCase()}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        employeeName: row.NOMBRE,
        email: row.CORREO,
        rows: []
      });
    }
    grouped.get(key)?.rows.push(row);
  });

  return [...grouped.values()];
};
