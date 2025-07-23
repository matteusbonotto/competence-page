const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

const skillsPath = path.join(__dirname, 'data', 'skills.json');
const achievementsPath = path.join(__dirname, 'data', 'achievements.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
