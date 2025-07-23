
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3001;

const skillsPath = path.join(__dirname, 'data', 'skills.json');
const achievementsPath = path.join(__dirname, 'data', 'achievements.json');


app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos da pasta assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configuração do multer para uploads
const uploadDir = path.join(__dirname, 'assets', 'achievements');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Garante nome único
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${base}-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// Endpoint para upload de imagem de conquista
app.post('/api/upload-achievement-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  // Caminho relativo para uso no frontend/JSON
  const relativePath = `assets/achievements/${req.file.filename}`;
  res.json({ path: relativePath });
});

// Utilidade para ler JSON
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
// Utilidade para salvar JSON
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// CRUD Skills
app.get('/api/skills', (req, res) => {
  res.json(readJson(skillsPath));
});
app.post('/api/skills', (req, res) => {
  writeJson(skillsPath, req.body);
  res.json({ success: true });
});

// CRUD Achievements
app.get('/api/achievements', (req, res) => {
  res.json(readJson(achievementsPath));
});
app.post('/api/achievements', (req, res) => {
  writeJson(achievementsPath, req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
