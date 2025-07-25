// CRUD Admin para skills.json e achievements.json
// Salva no localStorage para simular persistência (não sobrescreve arquivos reais)


const API_BASE = 'http://localhost:3001/api';

// Funções utilitárias para API
// Funções utilitárias para arquivos locais
async function fetchJsonLocal(path) {
  const res = await fetch(path);
  return res.json();
  // Fim da função showAchievementForm
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
    window.skillsData.skills.forEach(function (skill) {
      var card = document.createElement('div');
      card.className = 'card mb-2 shadow-sm';
      card.innerHTML = '<div class="card-body d-flex align-items-center justify-content-between flex-wrap">'
        + '<div class="d-flex align-items-center flex-wrap gap-3">'
        + '<i class="bi ' + (skill.icon || 'bi-lightbulb') + ' fs-2 text-primary me-2"></i>'
        + '<div>'
        + '<h5 class="card-title mb-1">' + (skill.title || '') + '</h5>'
        + '<div class="mb-1"><span class="badge bg-secondary">' + (skill.category || '') + '</span></div>'
        + '<small class="text-muted">Domínio: ' + (skill.domain || 3) + '</small>'
        + '</div>'
        + '</div>'
        + '<div class="d-flex align-items-center gap-2 flex-wrap">'
        + '<button class="btn btn-outline-primary btn-sm" title="Editar" onclick=\"showSkillModal(window.skillsData.skills.find(function(s){return s.id==\'' + skill.id + '\'}))\"><i class="bi bi-pencil"></i></button>'
        + '<button class="btn btn-outline-danger btn-sm" title="Excluir" onclick=\"if(confirm(\'Excluir habilidade?\')){window.deleteSkill && window.deleteSkill(\'' + skill.id + '\');}\"><i class="bi bi-trash"></i></button>'
        + '</div>'
        + '</div>';
      list.appendChild(card);
    });
  }

  window.showSkillForm = function showSkillForm(editIdx = null) {
    document.getElementById('skill-form').style.display = 'block';
    // Garante que o modal Bootstrap será exibido
    if (window.bootstrap && window.bootstrap.Modal) {
      var modalEl = document.getElementById('skillModal');
      if (modalEl) {
        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    }
    if (editIdx !== null) {
      const skill = window.skillsData.skills[editIdx];
      document.getElementById('skill-name').value = skill.title || '';
      document.getElementById('skill-category').value = skill.category || 'qa';
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
      setTimeout(updateDomainDisplay, 0);
      window.editingSkillIdx = editIdx;
    } else {
      document.getElementById('skill-name').value = '';
      document.getElementById('skill-category').value = 'qa';
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
      setTimeout(updateDomainDisplay, 0);
      window.editingSkillIdx = null;
    }
  }

  // Atualiza o campo de domínio calculado no formulário (criação e edição)

  function updateDomainDisplay() {
    // Para formulário principal
    const t = parseInt(document.getElementById('score-theoretical')?.value) || 0;
    const tec = parseInt(document.getElementById('score-technical')?.value) || 0;
    const ps = parseInt(document.getElementById('score-problem-solving')?.value) || 0;
    const kt = parseInt(document.getElementById('score-knowledge-transfer')?.value) || 0;
    const tr = parseInt(document.getElementById('score-trends')?.value) || 0;
    const total = t + tec + ps + kt + tr;
    const percent = Math.round((total / 25) * 100);
    if (document.getElementById('domain-value')) document.getElementById('domain-value').innerText = `${total}/25 (${percent}%)`;
    if (document.getElementById('skill-domain')) document.getElementById('skill-domain').value = `${total}/25 (${percent}%)`;

    // Para modal (campos com prefixo modal-)
    const mt = parseInt(document.getElementById('modal-score-theoretical')?.value) || 0;
    const mtec = parseInt(document.getElementById('modal-score-technical')?.value) || 0;
    const mps = parseInt(document.getElementById('modal-score-problem-solving')?.value) || 0;
    const mkt = parseInt(document.getElementById('modal-score-knowledge-transfer')?.value) || 0;
    const mtr = parseInt(document.getElementById('modal-score-trends')?.value) || 0;
    const mtotal = mt + mtec + mps + mkt + mtr;
    const mpercent = Math.round((mtotal / 25) * 100);
    if (document.getElementById('modal-domain-value')) document.getElementById('modal-domain-value').innerText = `${mtotal}/25 (${mpercent}%)`;
    if (document.getElementById('modal-skill-domain')) document.getElementById('modal-skill-domain').value = `${mtotal}/25 (${mpercent}%)`;
  }


  ['score-theoretical', 'score-technical', 'score-problem-solving', 'score-knowledge-transfer', 'score-trends',
    'modal-score-theoretical', 'modal-score-technical', 'modal-score-problem-solving', 'modal-score-knowledge-transfer', 'modal-score-trends']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateDomainDisplay);
      }
    });
  window.hideSkillForm = function hideSkillForm() {
    document.getElementById('skill-form').style.display = 'none';
    // Fecha o modal Bootstrap se estiver aberto
    if (window.bootstrap && window.bootstrap.Modal) {
      var modalEl = document.getElementById('skillModal');
      if (modalEl) {
        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      }
    }
  }

  // Adiciona listeners para fechar o modal ao clicar no X ou Cancelar
  document.addEventListener('DOMContentLoaded', function () {
    var closeBtn = document.querySelector('#skillModal .btn-close');
    var cancelBtn = document.querySelector('#skillModal .btn-secondary');
    if (closeBtn) closeBtn.addEventListener('click', window.hideSkillForm);
    if (cancelBtn) cancelBtn.addEventListener('click', window.hideSkillForm);
  });
}



document.getElementById('skill-form').onsubmit = async function (e) {
  e.preventDefault();
  const title = document.getElementById('skill-name').value;
  const category = document.getElementById('skill-category').value;
  // Calcula domínio a partir dos scores
  const t = parseInt(document.getElementById('score-theoretical').value) || 0;
  const tec = parseInt(document.getElementById('score-technical').value) || 0;
  const ps = parseInt(document.getElementById('score-problem-solving').value) || 0;
  const kt = parseInt(document.getElementById('score-knowledge-transfer').value) || 0;
  const tr = parseInt(document.getElementById('score-trends').value) || 0;
  const domain = t + tec + ps + kt + tr;
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
      <div class="card-img">${ach.image ? `<img src="${ach.image}" alt="${ach.title}" style="max-width:80px;max-height:80px;object-fit:contain;" />` : ''}</div>
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
    setTimeout(() => {
      const btnEdit = card.querySelector('[data-edit-achievement]');
      if (btnEdit) {
        btnEdit.addEventListener('click', function () {
          window.showAchievementForm(idx);
        });
      }
    }, 0);
    list.appendChild(card);
  });
}

window.showAchievementForm = function showAchievementForm(editIdx = null) {
  // Sempre abre o modal Bootstrap
  if (window.bootstrap && window.bootstrap.Modal) {
    var modalEl = document.getElementById('achievementModal');
    if (modalEl) {
      var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }
  // Referências dos campos
  var form = document.getElementById('achievement-modal-form');
  var imgInput = document.getElementById('modal-achievement-img');
  var imgPreview = document.getElementById('modal-achievement-img-preview');
  var imgUrl = document.getElementById('modal-achievement-img-url');
  var title = document.getElementById('modal-achievement-title');
  var desc = document.getElementById('modal-achievement-desc');
  var statusSwitch = document.getElementById('modal-achievement-status-switch');
  var statusHidden = document.getElementById('modal-achievement-status');
  var idField = document.getElementById('modal-achievement-id');
  var diff = document.getElementById('modal-achievement-difficulty');
  var starsDiv = document.getElementById('modal-achievement-difficulty-stars');
  var cat = document.getElementById('modal-achievement-category');
  var evidence = document.getElementById('modal-achievement-evidence');
  var skillsSelect = document.getElementById('modal-achievement-relatedSkills');
  var unlockedDateInput = document.getElementById('modal-achievement-unlockedDate');

  // Limpa tudo para novo
  if (form) form.reset();
  if (imgInput) imgInput.value = '';
  if (imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
  if (imgUrl) imgUrl.value = '';
  if (title) title.value = '';
  if (desc) desc.value = '';
  if (statusSwitch) statusSwitch.checked = true;
  if (statusHidden) statusHidden.value = 'unlocked';
  if (idField) idField.value = '';
  if (diff) diff.value = 3;
  if (starsDiv) starsDiv.setAttribute('data-score', 3);
  if (cat) cat.value = 'QA';
  if (evidence) evidence.value = '';
  if (skillsSelect) Array.from(skillsSelect.options).forEach(opt => opt.selected = false);
  if (unlockedDateInput) unlockedDateInput.value = '';

  // Se for edição, preenche os campos
  if (editIdx !== null && window.achievements && window.achievements[editIdx]) {
    const ach = window.achievements[editIdx];
    if (title) title.value = ach.title || '';
    if (desc) desc.value = ach.description || '';
    if (statusSwitch && statusHidden) {
      statusSwitch.checked = ach.status === 'unlocked';
      statusHidden.value = ach.status || 'unlocked';
    }
    if (idField) idField.value = ach.id || '';
    if (diff) diff.value = ach.difficulty || 3;
    if (starsDiv) starsDiv.setAttribute('data-score', ach.difficulty || 3);
    if (cat) cat.value = ach.category || 'QA';
    if (evidence) evidence.value = ach.evidence || '';
    if (skillsSelect && Array.isArray(ach.relatedSkills)) {
      Array.from(skillsSelect.options).forEach(opt => {
        opt.selected = ach.relatedSkills.includes(opt.value);
      });
    }
    if (unlockedDateInput) unlockedDateInput.value = ach.unlockedDate || '';
    if (ach.image && imgPreview) {
      imgPreview.src = ach.image;
      imgPreview.style.display = 'block';
      if (imgUrl) imgUrl.value = ach.image.startsWith('data:') ? '' : ach.image;
    } else if (imgPreview) {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
      if (imgUrl) imgUrl.value = '';
    }
    if (imgInput) imgInput.value = '';
    window.editingAchievementId = editIdx;
  } else {
    window.editingAchievementId = null;
  }
  // Fim da função showAchievementForm
  window.hideAchievementForm = function hideAchievementForm() {
    if (window.bootstrap && window.bootstrap.Modal) {
      var modalEl = document.getElementById('achievementModal');
      if (modalEl) {
        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      }
    }
  }

  document.getElementById('achievement-modal-form').onsubmit = async function (e) {
    e.preventDefault();
    const title = document.getElementById('modal-achievement-title').value;
    const description = document.getElementById('modal-achievement-desc').value;
    const status = document.getElementById('modal-achievement-status').value;
    const id = document.getElementById('modal-achievement-id').value || `ach-${Date.now()}`;
    const difficulty = parseInt(document.getElementById('modal-achievement-difficulty').value) || 3;
    const category = document.getElementById('modal-achievement-category').value;
    const evidence = document.getElementById('modal-achievement-evidence').value || null;
    const relatedSkillsRaw = document.getElementById('modal-achievement-relatedSkills').value;
    const relatedSkills = relatedSkillsRaw ? relatedSkillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const unlockedDate = document.getElementById('modal-achievement-unlockedDate').value || '';
    const imgInput = document.getElementById('modal-achievement-img');
    const imgUrl = document.getElementById('modal-achievement-img-url').value.trim();
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
  // Preview da imagem ao selecionar arquivo ou colar URL (modal)
  const modalImgInput = document.getElementById('modal-achievement-img');
  const modalImgUrl = document.getElementById('modal-achievement-img-url');
  const modalImgPreview = document.getElementById('modal-achievement-img-preview');
  if (modalImgInput) {
    modalImgInput.addEventListener('change', function (e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          modalImgPreview.src = ev.target.result;
          modalImgPreview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      } else {
        modalImgPreview.src = '';
        modalImgPreview.style.display = 'none';
      }
    });
  }
  if (modalImgUrl) {
    modalImgUrl.addEventListener('input', function (e) {
      const url = e.target.value.trim();
      if (url) {
        modalImgPreview.src = url;
        modalImgPreview.style.display = 'block';
      } else {
        modalImgPreview.src = '';
        modalImgPreview.style.display = 'none';
      }
    });
  }

  // Não é mais necessário: edição agora usa showAchievementModal diretamente
  window.deleteAchievement = async function deleteAchievement(idx) {
    if (confirm('Excluir esta conquista?')) {
      window.achievements.splice(idx, 1);
      await postJsonApi('achievements', window.achievements);
      window.renderAchievements();
    }
  }

  // Fim do bloco aberto anteriormente
}

window.onload = function () {
  loadSkills();
  loadAchievements();
};
