const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const contactoRoutes = require('./src/routes/contact');
app.use('/api', contactoRoutes);

app.get('/', (req, res) => {
  res.send('<h1>API Formulario funcionando</h1>');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
