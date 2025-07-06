// hashPassword.js
const bcrypt = require('bcrypt');

const contraseña = 'admin123';

bcrypt.hash(contraseña, 10).then(hash => {
  console.log('Hash generado:', hash);
}).catch(err => {
  console.error('Error generando el hash:', err);
});
