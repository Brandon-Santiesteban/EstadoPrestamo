import PDFDocument from 'pdfkit';
import type { EmployeeGroup } from './types';

const money = (value: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(value || 0);

export const buildEmployeePdf = async ({
  group,
  logoBase64,
  payrollMonth
}: {
  group: EmployeeGroup;
  logoBase64?: string;
  payrollMonth: string;
}) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const completed = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  if (logoBase64) {
    const image = Buffer.from(logoBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    doc.image(image, 40, 35, { fit: [100, 45] });
  }

  doc.fontSize(16).text(`Para: ${group.employeeName}`, 160, 40);
  doc.fontSize(10).text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CR')}`, 160, 64);

  doc.roundedRect(40, 95, 240, 26, 6).fill('#facc15');
  doc.fillColor('#1e293b').fontSize(12).text(`Nómina a descontar: ${payrollMonth.toUpperCase()}`, 50, 103);
  doc.fillColor('#000000');

  const headers = [
    'Descripcion',
    'Prestamo',
    'Interes Cuota',
    'Abono Capital',
    'Cuota',
    'Diferencia de sueldo abono',
    'Total'
  ];

  const colWidths = [100, 62, 62, 62, 52, 88, 62];
  const startY = 140;
  let y = startY;

  const drawRow = (cells: string[], background?: string) => {
    let x = 40;
    if (background) {
      doc.rect(40, y - 2, colWidths.reduce((a, b) => a + b, 0), 22).fill(background);
      doc.fillColor('#111827');
    }

    cells.forEach((cell, index) => {
      doc.rect(x, y - 2, colWidths[index], 22).stroke('#cbd5e1');
      doc.fontSize(8).text(cell, x + 4, y + 4, { width: colWidths[index] - 8 });
      x += colWidths[index];
    });

    doc.fillColor('#000000');
    y += 22;
  };

  drawRow(headers, '#e2e8f0');

  const totals = {
    prestamo: 0,
    interes: 0,
    abonoCapital: 0,
    cuota: 0,
    diferencia: 0,
    total: 0
  };

  for (const row of group.rows) {
    totals.prestamo += row.PRESTAMO;
    totals.interes += row.INT;
    totals.abonoCapital += row.ABONO_CAPITAL;
    totals.cuota += row.CUOTA;
    totals.diferencia += row.DIFERENCIA_SUELDO_ABONO;
    totals.total += row.TOTAL_A_DESCONTAR;

    drawRow([
      row.DESCRIPCION,
      money(row.PRESTAMO),
      money(row.INT),
      money(row.ABONO_CAPITAL),
      money(row.CUOTA),
      money(row.DIFERENCIA_SUELDO_ABONO),
      money(row.TOTAL_A_DESCONTAR)
    ]);
  }

  drawRow(
    [
      'Totales',
      money(totals.prestamo),
      money(totals.interes),
      money(totals.abonoCapital),
      money(totals.cuota),
      money(totals.diferencia),
      money(totals.total)
    ],
    '#FFFF00'
  );

  doc.end();
  return completed;
};
