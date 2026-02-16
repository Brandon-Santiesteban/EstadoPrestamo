import { NextRequest, NextResponse } from 'next/server';
import { buildEmployeePdf } from '@/lib/pdf';
import { groupRowsByEmployee } from '@/lib/grouping';
import type { LoanRow } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { rows, payrollMonth, logoBase64, email } = (await request.json()) as {
    rows: LoanRow[];
    payrollMonth: string;
    logoBase64?: string;
    email: string;
  };

  const groups = groupRowsByEmployee(rows);
  const group = groups.find((item) => item.email === email);

  if (!group) {
    return NextResponse.json({ error: 'No se encontró el empleado.' }, { status: 404 });
  }

  const pdfBuffer = await buildEmployeePdf({ group, logoBase64, payrollMonth });

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=estado-${group.employeeName}.pdf`
    }
  });
}
