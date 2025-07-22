// ===== APLICAÇÃO PRINCIPAL =====
class SkillMappingApp {
    constructor() {
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        console.log('Inicializando aplicação...');
        
        // Mostra loading inicial
        this.showGlobalLoading();

        // Carrega dados
        const dataLoaded = await window.dataService.loadData();
        
        if (!dataLoaded) {
            console.log('Erro ao carregar dados, usando dados de exemplo...');
            window.dataService.loadExampleData();
        }

        // Inicializa componentes
        this.initializeComponents();
        this.setupEventListeners();
        this.updateUI();

        // Remove loading
        this.hideGlobalLoading();

        console.log('Aplicação inicializada com sucesso');
    }

    initializeComponents() {
        // Inicializa a árvore de habilidades
        window.skillTree = new SkillTree('skill-tree');
        
        // Renderiza a árvore inicial
        window.skillTree.render(this.currentCategory);
    }

    setupEventListeners() {
        // Filtros de categoria
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.changeCategory(category);
            });
        });

        // Botões de fechar drawer/modal
        document.getElementById('close-drawer').addEventListener('click', () => {
            window.skillTree.closeDetails();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            window.skillTree.closeDetails();
        });

        // Overlay para fechar modal
        document.getElementById('overlay').addEventListener('click', () => {
            window.skillTree.closeDetails();
        });

        // Responsividade
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Event listeners para evidências
        this.setupAchievementListeners();

        // Event listeners para drawer mobile
        this.setupAchievementDrawer();
    }

    setupAchievementDrawer() {
        // Criar drawer se não existir
        if (!document.getElementById('achievement-drawer')) {
            const drawer = document.createElement('div');
            drawer.id = 'achievement-drawer';
            drawer.className = 'achievement-drawer';
            drawer.innerHTML = `
                <div class="achievement-drawer-handle"></div>
                <div class="achievement-drawer-header">
                    <h3 id="achievement-drawer-title">Detalhes da Conquista</h3>
                    <button class="achievement-drawer-close" id="achievement-drawer-close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="achievement-drawer-content" id="achievement-drawer-content">
                    <!-- Conteúdo será inserido dinamicamente -->
                </div>
            `;
            document.body.appendChild(drawer);

            // Event listeners para fechar drawer
            document.getElementById('achievement-drawer-close').addEventListener('click', () => {
                this.closeAchievementDrawer();
            });

            // Fechar drawer ao clicar no handle
            drawer.querySelector('.achievement-drawer-handle').addEventListener('click', () => {
                this.closeAchievementDrawer();
            });

            // Fechar drawer com swipe down (touch)
            let startY = 0;
            let currentY = 0;
            drawer.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            });

            drawer.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (diff > 0 && diff < 100) {
                    drawer.style.transform = `translateY(${diff}px)`;
                }
            });

            drawer.addEventListener('touchend', () => {
                const diff = currentY - startY;
                
                if (diff > 50) {
                    this.closeAchievementDrawer();
                } else {
                    drawer.style.transform = 'translateY(0)';
                }
            });
        }
    }

    openAchievementDrawer(achievementId) {
        const achievement = window.dataService.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        const drawer = document.getElementById('achievement-drawer');
        const title = document.getElementById('achievement-drawer-title');
        const content = document.getElementById('achievement-drawer-content');

        const isUnlocked = achievement.status === 'unlocked';

        let subcategoriesHTML = '';
        if (achievement.subcategories) {
            subcategoriesHTML = Object.entries(achievement.subcategories)
                .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                .join('');
        }

        title.textContent = achievement.title;
        
        content.innerHTML = `
            <div class="achievement-drawer-image">
                <img src="${achievement.image || 'assets/default-achievement.png'}" alt="${achievement.title}" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23333\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"12\" fill=\"white\" text-anchor=\"middle\" dy=\".3em\">IMG</text></svg>'"
                     ${!isUnlocked ? 'style="filter: grayscale(100%); opacity: 0.6;"' : ''}>
            </div>
            
            <div class="achievement-drawer-status ${isUnlocked ? 'unlocked' : 'locked'}">
                <i class="bi bi-${isUnlocked ? 'unlock' : 'lock'}"></i>
                ${isUnlocked ? 'CONQUISTA DESBLOQUEADA' : 'CONQUISTA BLOQUEADA'}
            </div>
            
            <div class="achievement-drawer-description">
                ${subcategoriesHTML || achievement.description}
            </div>
            
            ${isUnlocked && achievement.evidence ? 
                `<div class="achievement-drawer-evidence">
                    <button class="evidence-btn" onclick="window.open('${achievement.evidence}', '_blank')">
                        <i class="bi bi-file-earmark-arrow-down"></i>
                        Ver Evidência
                    </button>
                </div>` : ''
            }
        `;

        // Abrir drawer
        drawer.classList.add('open');

        // Adicionar overlay se não existir
        if (!document.getElementById('achievement-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'achievement-overlay';
            overlay.className = 'overlay';
            overlay.addEventListener('click', () => {
                this.closeAchievementDrawer();
            });
            document.body.appendChild(overlay);
        }
        
        document.getElementById('achievement-overlay').classList.add('active');
    }

    closeAchievementDrawer() {
        const drawer = document.getElementById('achievement-drawer');
        const overlay = document.getElementById('achievement-overlay');
        
        if (drawer) {
            drawer.classList.remove('open');
            drawer.style.transform = '';
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    changeCategory(category) {
        // Atualiza categoria atual
        this.currentCategory = category;

        // Atualiza botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Atualiza árvore
        window.skillTree.render(category);

        // Atualiza estatísticas se necessário
        this.updateSummaryCards();
    }

    updateUI() {
        this.updateSummaryCards();
        this.renderAchievements();
    }

    updateSummaryCards() {
        // Estatísticas de habilidades
        const skillStats = window.dataService.getSkillStats();
        document.getElementById('avg-domain').textContent = `${skillStats.avgDomain}%`;

        // Estatísticas de conquistas
        const achievementStats = window.dataService.getAchievementStats();
        document.getElementById('unlocked-count').textContent = achievementStats.unlocked.toString().padStart(2, '0');
        document.getElementById('locked-count').textContent = achievementStats.locked.toString().padStart(2, '0');

        // Top skill
        const topSkill = window.dataService.getTopSkill();
        document.getElementById('top-skill-name').textContent = topSkill.name;
        document.getElementById('top-skill-progress').style.width = `${topSkill.progress}%`;
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        const achievements = window.dataService.achievements;

        container.innerHTML = '';

        achievements.forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            container.appendChild(card);
        });
    }

    createAchievementCard(achievement) {
        const isUnlocked = achievement.status === 'unlocked';
        
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        let subcategoriesHTML = '';
        if (achievement.subcategories) {
            subcategoriesHTML = Object.entries(achievement.subcategories)
                .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                .join('');
        }

        // Container da imagem com overlay de cadeado se necessário
        const imageContainer = `
            <div class="image-container">
                <img src="${achievement.image || 'assets/default-achievement.png'}" alt="${achievement.title}" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23333\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"12\" fill=\"white\" text-anchor=\"middle\" dy=\".3em\">IMG</text></svg>'">
                ${!isUnlocked ? '<div class="image-lock-overlay"><i class="bi bi-lock"></i></div>' : ''}
            </div>
        `;

        // Verifica se é mobile para usar layout simplificado
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            card.innerHTML = `
                <!-- Status badge pequeno no canto -->
                <div class="status-badge-mobile ${isUnlocked ? 'unlocked' : 'locked'}">
                    <i class="bi bi-${isUnlocked ? 'unlock' : 'lock'}"></i>
                    <span>${isUnlocked ? 'OK' : 'LOCK'}</span>
                </div>
                
                ${imageContainer}
                
                <div class="content">
                    <h4>${achievement.title}</h4>
                </div>
                
                <button class="view-btn-mobile" onclick="window.skillMappingApp.openAchievementDrawer('${achievement.id}')">
                    Ver
                </button>
            `;
        } else {
            // Layout desktop original
            card.innerHTML = `
                ${imageContainer}
                
                <div class="content">
                    <h4>${achievement.title}</h4>
                    <div class="subcategories">
                        ${subcategoriesHTML || achievement.description}
                    </div>
                    ${isUnlocked && achievement.evidence ? 
                        `<button class="evidence-btn" onclick="window.open('${achievement.evidence}', '_blank')">
                            Ver evidência <i class="bi bi-file-earmark-arrow-down"></i>
                        </button>` : ''
                    }
                </div>
                
                <div class="status-badge ${isUnlocked ? 'unlocked' : 'locked'}">
                    <i class="bi bi-${isUnlocked ? 'unlock' : 'lock'}"></i>
                    ${isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
                </div>
            `;
        }

        // Animação de entrada
        card.classList.add('fade-in');

        return card;
    }

    setupAchievementListeners() {
        // Event delegation para botões de evidência
        document.addEventListener('click', (e) => {
            if (e.target.closest('.evidence-btn')) {
                const btn = e.target.closest('.evidence-btn');
                const url = btn.getAttribute('data-url') || btn.onclick;
                
                if (typeof url === 'string') {
                    window.open(url, '_blank');
                }
            }
        });
    }

    handleResize() {
        // Fecha drawer/modal se mudou para mobile/desktop
        const isMobile = window.innerWidth <= 768;
        const drawer = document.getElementById('skill-drawer');
        const modal = document.getElementById('skill-modal');
        
        if (isMobile && drawer && drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            if (modal) modal.classList.add('open');
        } else if (!isMobile && modal && modal.classList.contains('open')) {
            modal.classList.remove('open');
            if (drawer) drawer.classList.add('open');
        }

        // Fechar drawer de conquistas no mobile se mudou para desktop
        if (!isMobile) {
            this.closeAchievementDrawer();
        }

        // Recriar cards de conquistas para layout correto
        this.renderAchievements();
    }

    handleKeyboardNavigation(e) {
        // ESC para fechar detalhes
        if (e.key === 'Escape') {
            window.skillTree.closeDetails();
            this.closeAchievementDrawer();
        }

        // Números para filtros rápidos
        if (e.key >= '1' && e.key <= '4') {
            const categories = ['all', 'qa', 'dev', 'ux'];
            const index = parseInt(e.key) - 1;
            if (categories[index]) {
                this.changeCategory(categories[index]);
            }
        }
    }

    showGlobalLoading() {
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-size: 1.2rem;
            ">
                <div style="text-align: center;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid #334155;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    Carregando sistema de competências...
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
    }

    hideGlobalLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    // Métodos utilitários
    simulateSkillProgress(skillId, newDomain) {
        const skill = window.dataService.getSkillById(skillId);
        if (skill) {
            skill.domain = newDomain;
            this.updateUI();
            window.skillTree.update();
        }
    }

    unlockAchievement(achievementId) {
        const achievement = window.dataService.getAchievementById(achievementId);
        if (achievement) {
            achievement.status = 'unlocked';
            this.updateUI();
        }
    }

    exportProgress() {
        const data = {
            skills: window.dataService.skills,
            achievements: window.dataService.achievements,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `competencias-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Busca por habilidades
    searchSkills(query) {
        if (!query.trim()) {
            window.skillTree.render(this.currentCategory);
            return;
        }

        const results = window.dataService.skills.filter(skill => 
            skill.title.toLowerCase().includes(query.toLowerCase()) ||
            skill.description.toLowerCase().includes(query.toLowerCase())
        );

        // Implementar visualização dos resultados da busca
        console.log('Resultados da busca:', results);
    }

    // Método para demonstração/debug
    showDebugInfo() {
        console.log('=== DEBUG INFO ===');
        console.log('Data Service:', window.dataService);
        console.log('Skill Tree:', window.skillTree);
        console.log('Current Category:', this.currentCategory);
        console.log('Skills:', window.dataService.skills);
        console.log('Achievements:', window.dataService.achievements);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.skillMappingApp = new SkillMappingApp();
});

// Funções globais para debug/demonstração
window.debugApp = () => window.skillMappingApp.showDebugInfo();
window.exportProgress = () => window.skillMappingApp.exportProgress();
window.simulateProgress = (skillId, domain) => window.skillMappingApp.simulateSkillProgress(skillId, domain);
window.unlockAchievement = (id) => window.skillMappingApp.unlockAchievement(id);
