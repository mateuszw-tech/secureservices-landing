import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Handle OPTIONS preflight request
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    console.log('=== Contact form request received ===');
    
    const data = await request.json();
    console.log('Form data:', JSON.stringify(data, null, 2));
    
    const { name, email, company, phone, service, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      console.log('Validation failed: missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Wypełnij wszystkie wymagane pola.' }),
        { status: 400, headers }
      );
    }

    // Check env variables
    console.log('SMTP_HOST:', import.meta.env.SMTP_HOST ? 'SET' : 'NOT SET');
    console.log('SMTP_PORT:', import.meta.env.SMTP_PORT ? 'SET' : 'NOT SET');
    console.log('SMTP_USER:', import.meta.env.SMTP_USER ? 'SET' : 'NOT SET');
    console.log('SMTP_PASS:', import.meta.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
    console.log('CONTACT_EMAIL:', import.meta.env.CONTACT_EMAIL ? 'SET' : 'NOT SET');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: parseInt(import.meta.env.SMTP_PORT || '587'),
      secure: import.meta.env.SMTP_SECURE === 'true',
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Needed for shared hosting with mismatched certificates
      }
    });

    // Service labels
    const serviceLabels: Record<string, string> = {
      'szbi': 'Dokumentacja SZBI',
      'iso': 'Audyt ISO 27001',
      'rodo': 'Ochrona danych osobowych (IOD)',
      'awareness': 'Szkolenia dla pracowników',
      'pentest': 'Testy penetracyjne',
      'vulnerability': 'Badanie podatności sieci',
      'incident': 'Reagowanie na incydenty',
      'it-support': 'Wsparcie informatyczne',
      'webdev': 'Aplikacje internetowe',
      'ai': 'Szkolenia z AI',
      'other': 'Inne / Konsultacja ogólna',
    };

    const serviceName = service ? serviceLabels[service] || service : 'Nie wybrano';

    // Email content
    const htmlContent = `
      <h2>Nowe zapytanie ze strony SecureServices</h2>
      <hr />
      <p><strong>Imię i nazwisko:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone || 'Nie podano'}</p>
      <p><strong>Firma:</strong> ${company || 'Nie podano'}</p>
      <p><strong>Usługa:</strong> ${serviceName}</p>
      <hr />
      <p><strong>Wiadomość:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const textContent = `
Nowe zapytanie ze strony SecureServices
---------------------------------------
Imię i nazwisko: ${name}
Email: ${email}
Telefon: ${phone || 'Nie podano'}
Firma: ${company || 'Nie podano'}
Usługa: ${serviceName}
---------------------------------------
Wiadomość:
${message}
    `;

    console.log('Attempting to send email...');

    // Send email
    await transporter.sendMail({
      from: `"SecureServices Website" <${import.meta.env.SMTP_USER}>`,
      to: import.meta.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Nowe zapytanie: ${serviceName} - ${name}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Email sent successfully!');

    return new Response(
      JSON.stringify({ success: true, message: 'Wiadomość została wysłana.' }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('=== Contact form error ===');
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Wystąpił błąd podczas wysyłania wiadomości.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
};
