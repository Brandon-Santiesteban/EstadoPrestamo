export type LoanRow = {
  FECHA: string;
  NOMBRE: string;
  DESCRIPCION: string;
  SEUDONIMO: string;
  CORREO: string;
  PRESTAMO: number;
  INTERES_10: number;
  LE_QUEDA_POR_PAGAR: number;
  CUOTA: number;
  INT: number;
  ABONO_CAPITAL: number;
  DIFERENCIA_SUELDO_ABONO: number;
  TOTAL_A_DESCONTAR: number;
  SALDO_PENDIENTE: number;
};

export type EmployeeGroup = {
  employeeName: string;
  email: string;
  rows: LoanRow[];
};
