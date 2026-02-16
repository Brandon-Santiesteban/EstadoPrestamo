import { NextRequest, NextResponse } from 'next/server';
import { groupRowsByEmployee } from '@/lib/grouping';
import { buildEmployeePdf } from '@/lib/pdf';
import { getTransporter, payrollEmailTemplate } from '@/lib/email';
import type { LoanRow } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { rows, payrollMonth, logoBase64 } = (await request.json()) as {
    rows: LoanRow[];
    payrollMonth: string;
    logoBase64?: string;
  };

  const groups = groupRowsByEmployee(rows);
  const transporter = getTransporter();

  const results = await Promise.all(
    groups.map(async (group) => {
      const pdf = await buildEmployeePdf({ group, logoBase64, payrollMonth });
      const template = payrollEmailTemplate({ employeeName: group.employeeName, payrollMonth });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: group.email,
        subject: template.subject,
        html: template.html,
        attachments: [
          {
            filename: `estado-${group.employeeName}.pdf`,
            content: pdf
          }
        ]
      });

      return { email: group.email, status: 'sent' };
    })
  );

  return NextResponse.json({ total: results.length, results });
}
