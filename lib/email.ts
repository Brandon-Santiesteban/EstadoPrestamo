import nodemailer from 'nodemailer';

export const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

export const payrollEmailTemplate = ({
  employeeName,
  payrollMonth
}: {
  employeeName: string;
  payrollMonth: string;
}) => ({
  subject: `Estado de cuenta de nómina - ${payrollMonth}`,
  html: `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <p>Estimado/a <strong>${employeeName}</strong>,</p>
    <p>Adjuntamos su estado de cuenta correspondiente a la nómina de <strong>${payrollMonth}</strong>.</p>
    <p>Por favor, revise el detalle y contáctenos ante cualquier consulta.</p>
    <br />
    <p>Atentamente,<br /><strong>Departamento de Nómina</strong></p>
  </div>
  `
});
