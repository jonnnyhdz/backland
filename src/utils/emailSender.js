const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreo = async ({ name, phone, gmail, message }) => {
  try {
const response = await resend.emails.send({
  from: process.env.EMAIL_SENDER, // debe incluir nombre
  to: process.env.EMAIL_RECEIVER,
subject: 'BoostMedia',
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px; background-color: #ffffff;">
    <h2 style="color: #2c3e50; text-align: center;">📬 Nuevo mensaje de contacto</h2>
    <p style="font-size: 16px; color: #333;"><strong>Nombre:</strong> ${name}</p>
    <p style="font-size: 16px; color: #333;"><strong>Teléfono:</strong> ${phone}</p>
    <p style="font-size: 16px; color: #333;"><strong>Correo electrónico:</strong> ${gmail}</p>
    <p style="font-size: 16px; color: #333;"><strong>Mensaje:</strong></p>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px;">
      <p style="font-size: 15px; color: #555; white-space: pre-wrap;">${message}</p>
    </div>
    <p style="margin-top: 30px; font-size: 14px; color: #999; text-align: center;">BoostMedia - Formulario de contacto</p>
  </div>
`

,
});


console.log('📨 Respuesta de Resend:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al enviar correo con Resend:', error);
    throw error;
  }
};

module.exports = { enviarCorreo };
