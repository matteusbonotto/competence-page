// CRUD Admin para skills.json e achievements.json
// Salva no localStorage para simular persistência (não sobrescreve arquivos reais)

const skillsPath = 'data/skills.json';
const achievementsPath = 'data/achievements.json';

// Utilidades para LocalStorage (simulação de persistência)
function getLocalData(key, fallback) {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  return fallback;
}
function setLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Carregar JSONs originais (primeira vez)
async function fetchJson(path) {
  const res = await fetch(path);
  return res.json();
}

// CRUD de Habilidades baseado em skills.json
window.skillsData = { categories: [], skills: [] };
window.editingSkillIdx = null;

async function loadSkills() {
  let data = getLocalData('skillsData', null);
  if (!data) {
    data = await fetchJson(skillsPath);
    setLocalData('skillsData', data);
  }
  window.skillsData = data;
  window.renderSkills();
}

window.renderSkills = function renderSkills() {
  const tbody = document.querySelector('#skills-table tbody');
  tbody.innerHTML = '';
  window.skillsData.skills.forEach((skill, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${skill.id || idx + 1}</td>
      <td>${skill.icon ? `<i class='bi ${skill.icon}' style='font-size:1.5rem;'></i>` : ''}</td>
      <td>${skill.title}</td>
      <td>${skill.category}</td>
      <td>${skill.domain}</td>
      <td class="crud-actions">
        <button onclick="window.editSkill(${idx})"><i class="bi bi-pencil"></i></button>
        <button onclick="window.deleteSkill(${idx})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showSkillForm = function showSkillForm(editIdx = null) {
  document.getElementById('skill-form').style.display = 'block';
  if (editIdx !== null) {
    const skill = window.skillsData.skills[editIdx];
    document.getElementById('skill-name').value = skill.title;
    document.getElementById('skill-category').value = skill.category;
    document.getElementById('skill-domain').value = skill.domain || 3;
    document.getElementById('domain-value').innerText = skill.domain || 3;
    document.getElementById('skill-id').value = skill.id;
    document.getElementById('skill-desc').value = skill.description || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    window.editingSkillIdx = editIdx;
  } else {
    document.getElementById('skill-name').value = '';
    document.getElementById('skill-category').value = 'qa';
    document.getElementById('skill-domain').value = 3;
    document.getElementById('domain-value').innerText = 3;
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-desc').value = '';
    document.getElementById('skill-icon').value = '';
    window.editingSkillIdx = null;
  }
}
window.hideSkillForm = function hideSkillForm() {
  document.getElementById('skill-form').style.display = 'none';
}

document.getElementById('skill-form').onsubmit = function (e) {
  e.preventDefault();
  const title = document.getElementById('skill-name').value;
  const category = document.getElementById('skill-category').value;
  const domain = parseInt(document.getElementById('skill-domain').value);
  const id = document.getElementById('skill-id').value || `skill-${Date.now()}`;
  const description = document.getElementById('skill-desc').value;
  const icon = document.getElementById('skill-icon').value;
  const skill = { id, title, category, domain, description, icon };
  if (window.editingSkillIdx !== null) {
    window.skillsData.skills[window.editingSkillIdx] = { ...window.skillsData.skills[window.editingSkillIdx], ...skill };
  } else {
    window.skillsData.skills.push(skill);
  }
  setLocalData('skillsData', window.skillsData);
  window.renderSkills();
  window.hideSkillForm();
};

window.editSkill = function editSkill(idx) {
  window.showSkillForm(idx);
}
window.deleteSkill = function deleteSkill(idx) {
  if (confirm('Excluir esta habilidade?')) {
    window.skillsData.skills.splice(idx, 1);
    setLocalData('skillsData', window.skillsData);
    window.renderSkills();
  }
}

// CRUD de Conquistas
window.achievements = [];
window.editingAchievementId = null;

async function loadAchievements() {
  window.achievements = getLocalData('achievements', null);
  if (!window.achievements) {
    window.achievements = await fetchJson(achievementsPath);
    setLocalData('achievements', window.achievements);
  }
  renderAchievements();
}

window.renderAchievements = function renderAchievements() {
  const tbody = document.querySelector('#achievements-table tbody');
  tbody.innerHTML = '';
  window.achievements.forEach((ach, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ach.id || idx + 1}</td>
      <td>${ach.image ? `<img src="${ach.image}" alt="img" style="width:44px;height:44px;object-fit:cover;border-radius:6px;"/>` : ''}</td>
      <td>${ach.title}</td>
      <td>${ach.description}</td>
      <td>${ach.status === 'unlocked' ? 'Desbloqueada' : 'Bloqueada'}</td>
      <td class="crud-actions">
        <button onclick="window.editAchievement(${idx})"><i class="bi bi-pencil"></i></button>
        <button onclick="window.deleteAchievement(${idx})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAchievementForm = function showAchievementForm(editIdx = null) {
  document.getElementById('achievement-form').style.display = 'block';
  if (editIdx !== null) {
    const ach = window.achievements[editIdx];
    document.getElementById('achievement-title').value = ach.title;
    document.getElementById('achievement-desc').value = ach.description;
    document.getElementById('achievement-status').value = ach.status;
    document.getElementById('achievement-id').value = ach.id || editIdx + 1;
    window.editingAchievementId = editIdx;
  } else {
    document.getElementById('achievement-title').value = '';
    document.getElementById('achievement-desc').value = '';
    document.getElementById('achievement-status').value = 'unlocked';
    document.getElementById('achievement-id').value = '';
    window.editingAchievementId = null;
  }
}
window.hideAchievementForm = function hideAchievementForm() {
  document.getElementById('achievement-form').style.display = 'none';
}

document.getElementById('achievement-form').onsubmit = function (e) {
  e.preventDefault();
  const title = document.getElementById('achievement-title').value;
  const description = document.getElementById('achievement-desc').value;
  const status = document.getElementById('achievement-status').value;
  const id = document.getElementById('achievement-id').value || (window.achievements.length + 1);
  const ach = { id, title, description, status };
  if (window.editingAchievementId !== null) {
    window.achievements[window.editingAchievementId] = ach;
  } else {
    window.achievements.push(ach);
  }
  setLocalData('achievements', window.achievements);
  window.renderAchievements();
  window.hideAchievementForm();
};

window.editAchievement = function editAchievement(idx) {
  window.showAchievementForm(idx);
}
window.deleteAchievement = function deleteAchievement(idx) {
  if (confirm('Excluir esta conquista?')) {
    window.achievements.splice(idx, 1);
    setLocalData('achievements', window.achievements);
    window.renderAchievements();
  }
}

// Inicialização
window.onload = function () {
  loadSkills();
  loadAchievements();
};
