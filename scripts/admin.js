// CRUD Admin para skills.json e achievements.json
// Salva no localStorage para simular persistência (não sobrescreve arquivos reais)


const API_BASE = 'http://localhost:3001/api';

// Funções utilitárias para API
// Funções utilitárias para arquivos locais
async function fetchJsonLocal(path) {
  const res = await fetch(path);
  return res.json();
}
// Simulação de persistência local (não salva no arquivo real)
async function postJsonLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

// CRUD de Habilidades baseado em skills.json
window.skillsData = { categories: [], skills: [] };
window.editingSkillIdx = null;



// Corrigir endpoint para 'skills' (plural)
async function loadSkills() {
  // Tenta carregar do localStorage primeiro (simulação de persistência)
  let data = null;
  try {
    const local = localStorage.getItem('skillsData');
    if (local) {
      data = JSON.parse(local);
    } else {
      data = await fetchJsonLocal('data/skills.json');
    }
  } catch (e) {
    data = await fetchJsonLocal('data/skills.json');
  }
  window.skillsData = data;
  window.renderSkills();
}

window.renderSkills = function renderSkills() {
    const list = document.getElementById('skills-list');
    if (!list) return;
    list.innerHTML = '';
    if (!window.skillsData.skills || window.skillsData.skills.length === 0) {
      list.innerHTML = '<div class="alert alert-info">Nenhuma habilidade cadastrada.</div>';
      return;
    }
    window.skillsData.skills.forEach(function(skill) {
      var card = document.createElement('div');
      card.className = 'card mb-2 shadow-sm';
      card.innerHTML = '<div class="card-body d-flex align-items-center justify-content-between flex-wrap">'
        + '<div class="d-flex align-items-center flex-wrap gap-3">'
        +   '<i class="bi ' + (skill.icon || 'bi-lightbulb') + ' fs-2 text-primary me-2"></i>'
        +   '<div>'
        +     '<h5 class="card-title mb-1">' + (skill.title || '') + '</h5>'
        +     '<div class="mb-1"><span class="badge bg-secondary">' + (skill.category || '') + '</span></div>'
        +     '<small class="text-muted">Domínio: ' + (skill.domain || 3) + '</small>'
        +   '</div>'
        + '</div>'
        + '<div class="d-flex align-items-center gap-2 flex-wrap">'
        +   '<button class="btn btn-outline-primary btn-sm" title="Editar" onclick=\"showSkillModal(window.skillsData.skills.find(function(s){return s.id==\'' + skill.id + '\'}))\"><i class="bi bi-pencil"></i></button>'
        +   '<button class="btn btn-outline-danger btn-sm" title="Excluir" onclick=\"if(confirm(\'Excluir habilidade?\')){window.deleteSkill && window.deleteSkill(\'' + skill.id + '\');}\"><i class="bi bi-trash"></i></button>'
        + '</div>'
        + '</div>';
      list.appendChild(card);
    });
}

window.showSkillForm = function showSkillForm(editIdx = null) {
  document.getElementById('skill-form').style.display = 'block';
  if (editIdx !== null) {
    const skill = window.skillsData.skills[editIdx];
    document.getElementById('skill-name').value = skill.title || '';
    document.getElementById('skill-category').value = skill.category || 'qa';
    document.getElementById('skill-domain').value = skill.domain || 3;
    document.getElementById('domain-value').innerText = skill.domain || 3;
    document.getElementById('skill-id').value = skill.id || '';
    document.getElementById('skill-desc').value = skill.description || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-unlock-threshold').value = skill.unlock_threshold ?? 0;
    document.getElementById('skill-parent').value = skill.parent || '';
    document.getElementById('skill-children').value = Array.isArray(skill.children) ? skill.children.join(',') : '';
    document.getElementById('skill-relatedAchievements').value = Array.isArray(skill.relatedAchievements) ? skill.relatedAchievements.join(',') : '';
    // Scores
    const scores = skill.scores || {};
    document.getElementById('score-theoretical').value = scores.theoretical ?? 3;
    document.getElementById('score-technical').value = scores.technical ?? 3;
    document.getElementById('score-problem-solving').value = scores.problem_solving ?? 3;
    document.getElementById('score-knowledge-transfer').value = scores.knowledge_transfer ?? 3;
    document.getElementById('score-trends').value = scores.trends ?? 3;
    window.editingSkillIdx = editIdx;
  } else {
    document.getElementById('skill-name').value = '';
    document.getElementById('skill-category').value = 'qa';
    document.getElementById('skill-domain').value = 3;
    document.getElementById('domain-value').innerText = 3;
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-desc').value = '';
    document.getElementById('skill-icon').value = '';
    document.getElementById('skill-unlock-threshold').value = 0;
    document.getElementById('skill-parent').value = '';
    document.getElementById('skill-children').value = '';
    document.getElementById('skill-relatedAchievements').value = '';
    document.getElementById('score-theoretical').value = 3;
    document.getElementById('score-technical').value = 3;
    document.getElementById('score-problem-solving').value = 3;
    document.getElementById('score-knowledge-transfer').value = 3;
    document.getElementById('score-trends').value = 3;
    window.editingSkillIdx = null;
  }
}
window.hideSkillForm = function hideSkillForm() {
  document.getElementById('skill-form').style.display = 'none';
}



document.getElementById('skill-form').onsubmit = async function (e) {
  e.preventDefault();
  const title = document.getElementById('skill-name').value;
  const category = document.getElementById('skill-category').value;
  const domain = parseInt(document.getElementById('skill-domain').value);
  const id = document.getElementById('skill-id').value || `skill-${Date.now()}`;
  const description = document.getElementById('skill-desc').value;
  const icon = document.getElementById('skill-icon').value;
  const unlock_threshold = parseInt(document.getElementById('skill-unlock-threshold').value) || 0;
  const parent = document.getElementById('skill-parent').value.trim() || undefined;
  const childrenRaw = document.getElementById('skill-children').value;
  const children = childrenRaw ? childrenRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const relatedAchievementsRaw = document.getElementById('skill-relatedAchievements').value;
  const relatedAchievements = relatedAchievementsRaw ? relatedAchievementsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const scores = {
    theoretical: parseInt(document.getElementById('score-theoretical').value) || 3,
    technical: parseInt(document.getElementById('score-technical').value) || 3,
    problem_solving: parseInt(document.getElementById('score-problem-solving').value) || 3,
    knowledge_transfer: parseInt(document.getElementById('score-knowledge-transfer').value) || 3,
    trends: parseInt(document.getElementById('score-trends').value) || 3
  };
  const skill = { id, title, category, domain, description, icon, unlock_threshold, scores };
  if (parent) skill.parent = parent;
  if (children.length) skill.children = children;
  if (relatedAchievements.length) skill.relatedAchievements = relatedAchievements;
  if (window.editingSkillIdx !== null) {
    window.skillsData.skills[window.editingSkillIdx] = skill;
  } else {
    window.skillsData.skills.push(skill);
  }
  await postJsonApi('skills', window.skillsData);
  window.renderSkills();
  window.hideSkillForm();
};

window.editSkill = function editSkill(idx) {
  window.showSkillForm(idx);
}
window.deleteSkill = async function deleteSkill(idx) {
  if (confirm('Excluir esta habilidade?')) {
    window.skillsData.skills.splice(idx, 1);
    await postJsonApi('skills', window.skillsData);
    window.renderSkills();
  }
}

// CRUD de Conquistas

window.achievements = [];
window.editingAchievementId = null;


// Corrigir endpoint para 'achievements' (plural)
async function loadAchievements() {
  let data = null;
  try {
    const local = localStorage.getItem('achievementsData');
    if (local) {
      data = JSON.parse(local);
    } else {
      data = await fetchJsonLocal('data/achievements.json');
    }
  } catch (e) {
    data = await fetchJsonLocal('data/achievements.json');
  }
  window.achievements = data;
  window.renderAchievements();
}
  await postJsonLocal('skillsData', window.skillsData);

window.renderAchievements = function renderAchievements() {
  const list = document.getElementById('achievements-list');
  if (!list) return;
  list.innerHTML = '';
  if (!window.achievements || window.achievements.length === 0) {
    list.innerHTML = '<div class="empty-msg">Nenhuma conquista cadastrada.</div>';
    return;
  }
  window.achievements.forEach((ach, idx) => {
    const card = document.createElement('div');
    card.className = 'admin-card achievement-card col-12';
    card.innerHTML = `
      <div class="card-img">${ach.image ? `<img src="${ach.image}" alt="${ach.title}" />` : ''}</div>
      <div class="card-content">
        <div class="card-title-row">
          <span class="card-title">${ach.title}</span>
          <span class="card-category badge bg-primary">${(ach.category || '').toUpperCase()}</span>
          <span class="card-status badge bg-secondary">${ach.status === 'unlocked' ? 'Desbloqueada' : 'Bloqueada'}</span>
        </div>
        <div class="card-desc">${ach.description || ''}</div>
        <div class="card-scores">
          <span>Dificuldade: <span class="stars">${'⭐'.repeat(ach.difficulty || 1)}</span></span>
          <span>Data: <b>${ach.unlockedDate || '-'}</b></span>
          <span>Evidência: ${ach.evidence ? `<a href="${ach.evidence}" target="_blank">Ver</a>` : '-'}</span>
        </div>
        <div class="card-meta">
          <span>Skills Relacionadas: <b>${(ach.relatedSkills || []).join(', ')}</b></span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline-success btn-sm">Ativo</button>
        <button class="btn btn-outline-primary btn-sm" data-edit-achievement="${idx}">Editar</button>
        <button class="btn btn-outline-danger btn-sm" onclick="window.deleteAchievement(${idx})">Excluir</button>
      </div>
    `;
    // Adiciona evento para o botão Editar
    setTimeout(() => {
      const btnEdit = card.querySelector('[data-edit-achievement]');
      if (btnEdit) {
        btnEdit.addEventListener('click', function() {
          window.showAchievementModal(window.achievements[idx]);
        });
      }
    }, 0);
    list.appendChild(card);
  });
}

window.showAchievementForm = function showAchievementForm(editIdx = null) {
  document.getElementById('achievement-form').style.display = 'block';
  const imgInput = document.getElementById('achievement-img');
  const imgPreview = document.getElementById('achievement-img-preview');
  const imgUrl = document.getElementById('achievement-img-url');
  const unlockedDateInput = document.getElementById('achievement-unlockedDate');
  if (editIdx !== null) {
    const ach = window.achievements[editIdx];
    document.getElementById('achievement-title').value = ach.title || '';
    document.getElementById('achievement-desc').value = ach.description || '';
    document.getElementById('achievement-status').value = ach.status || 'unlocked';
    document.getElementById('achievement-id').value = ach.id || '';
    document.getElementById('achievement-difficulty').value = ach.difficulty || 3;
    document.getElementById('achievement-category').value = ach.category || 'QA';
    document.getElementById('achievement-evidence').value = ach.evidence || '';
    document.getElementById('achievement-relatedSkills').value = Array.isArray(ach.relatedSkills) ? ach.relatedSkills.join(',') : '';
    unlockedDateInput.value = ach.unlockedDate || '';
    if (ach.image) {
      imgPreview.src = ach.image;
      imgPreview.style.display = 'block';
      imgUrl.value = ach.image.startsWith('data:') ? '' : ach.image;
    } else {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
      imgUrl.value = '';
    }
    imgInput.value = '';
    window.editingAchievementId = editIdx;
  } else {
    document.getElementById('achievement-title').value = '';
    document.getElementById('achievement-desc').value = '';
    document.getElementById('achievement-status').value = 'unlocked';
    document.getElementById('achievement-id').value = '';
    document.getElementById('achievement-difficulty').value = 3;
    document.getElementById('achievement-category').value = 'QA';
    document.getElementById('achievement-evidence').value = '';
    document.getElementById('achievement-relatedSkills').value = '';
    unlockedDateInput.value = '';
    imgPreview.src = '';
    imgPreview.style.display = 'none';
    imgInput.value = '';
    imgUrl.value = '';
    window.editingAchievementId = null;
  }
}
window.hideAchievementForm = function hideAchievementForm() {
  document.getElementById('achievement-form').style.display = 'none';
}




document.getElementById('achievement-form').onsubmit = async function (e) {
  e.preventDefault();
  const title = document.getElementById('achievement-title').value;
  const description = document.getElementById('achievement-desc').value;
  const status = document.getElementById('achievement-status').value;
  const id = document.getElementById('achievement-id').value || `ach-${Date.now()}`;
  const difficulty = parseInt(document.getElementById('achievement-difficulty').value) || 3;
  const category = document.getElementById('achievement-category').value;
  const evidence = document.getElementById('achievement-evidence').value || null;
  const relatedSkillsRaw = document.getElementById('achievement-relatedSkills').value;
  const relatedSkills = relatedSkillsRaw ? relatedSkillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const unlockedDate = document.getElementById('achievement-unlockedDate').value || '';
  const imgInput = document.getElementById('achievement-img');
  const imgUrl = document.getElementById('achievement-img-url').value.trim();
  let image = imgUrl;

  // Se o usuário fez upload, faz upload real para o backend
  if (imgInput.files && imgInput.files[0]) {
    const formData = new FormData();
    formData.append('image', imgInput.files[0]);
    try {
      const res = await fetch(`${API_BASE}/upload-achievement-image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.path) {
        image = data.path;
      } else {
        alert('Erro ao fazer upload da imagem.');
        return;
      }
    } catch (err) {
      alert('Erro ao fazer upload da imagem.');
      return;
    }
  }
  if (!image) image = '';
  const ach = { id, title, description, status, difficulty, category, evidence, relatedSkills, image };
  if (unlockedDate) ach.unlockedDate = unlockedDate;
  if (window.editingAchievementId !== null) {
    window.achievements[window.editingAchievementId] = ach;
  } else {
    window.achievements.push(ach);
  }
  await postJsonApi('achievements', window.achievements);
  await postJsonLocal('achievementsData', window.achievements);
  window.renderAchievements();
  window.hideAchievementForm();
};
// Preview da imagem ao selecionar arquivo ou colar URL
document.getElementById('achievement-img').addEventListener('change', function (e) {
  const imgPreview = document.getElementById('achievement-img-preview');
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      imgPreview.src = ev.target.result;
      imgPreview.style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    imgPreview.src = '';
    imgPreview.style.display = 'none';
  }
});
document.getElementById('achievement-img-url').addEventListener('input', function (e) {
  const url = e.target.value.trim();
  const imgPreview = document.getElementById('achievement-img-preview');
  if (url) {
    imgPreview.src = url;
    imgPreview.style.display = 'block';
  } else {
    imgPreview.src = '';
    imgPreview.style.display = 'none';
  }
});

// Não é mais necessário: edição agora usa showAchievementModal diretamente
window.deleteAchievement = async function deleteAchievement(idx) {
  if (confirm('Excluir esta conquista?')) {
    window.achievements.splice(idx, 1);
    await postJsonApi('achievements', window.achievements);
    window.renderAchievements();
  }
}

// Inicialização
window.onload = function () {
  loadSkills();
  loadAchievements();
};
