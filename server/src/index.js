const express = require('express');
const cors = require('cors');
const path = require('node:path');
const apiRoutes = require('./routes/api');
const { initSchema } = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializa o banco de dados
initSchema();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas da API
app.use('/api', apiRoutes);

// Rota raiz de verificação
app.get('/', (req, res) => {
  res.json({
    app: 'SISVERÃO API',
    version: '1.0.0',
    cbmrs: 'Operação Verão - CBMRS',
    status: 'online'
  });
});

app.listen(PORT, () => {
  console.log(`🚒 SISVERÃO API rodando na porta ${PORT} (http://localhost:${PORT})`);
});
