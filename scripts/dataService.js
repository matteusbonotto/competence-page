// ===== SERVIÇO DE DADOS =====
class DataService {
    constructor() {
        this.skills = [];
        this.achievements = [];
        this.categories = [];
        this.loaded = false;
    }

    async loadData() {
        try {
            console.log('Carregando dados...');

            const [skillsResponse, achievementsResponse] = await Promise.all([
                fetch('data/skills.json'),
                fetch('data/achievements.json')
            ]);

            if (!skillsResponse.ok || !achievementsResponse.ok) {
                throw new Error('Erro ao carregar dados');
            }

            const skillsData = await skillsResponse.json();
            const achievementsData = await achievementsResponse.json();

            this.skills = skillsData.skills || [];
            this.categories = skillsData.categories || [];
            this.achievements = achievementsData || [];
            this.loaded = true;

            console.log('Dados carregados:', {
                skills: this.skills.length,
                achievements: this.achievements.length,
                categories: this.categories.length
            });

            return true;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return false;
        }
    }

    getSkillById(id) {
        return this.skills.find(skill => skill.id === id);
    }

    getAchievementById(id) {
        return this.achievements.find(achievement => achievement.id === id);
    }

    getSkillsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.skills;
        }
        return this.skills.filter(skill => skill.category === categoryId);
    }

    getRootSkills(categoryId = 'all') {
        const skills = this.getSkillsByCategory(categoryId);
        return skills.filter(skill => !skill.parent);
    }

    getChildSkills(parentId) {
        return this.skills.filter(skill => skill.parent === parentId);
    }

    isSkillUnlocked(skillId) {
        const skill = this.getSkillById(skillId);
        if (!skill) return false;

        // Se não tem pai, está sempre desbloqueado
        if (!skill.parent) return true;

        // Verifica se o pai atingiu o threshold necessário
        const parent = this.getSkillById(skill.parent);
        if (!parent) return false;

        return parent.domain >= (skill.unlock_threshold || 0);
    }

    getSkillStats() {
        if (this.skills.length === 0) return { total: 0, unlocked: 0, avgDomain: 0 };

        const unlockedSkills = this.skills.filter(skill => this.isSkillUnlocked(skill.id));
        const totalDomain = this.skills.reduce((sum, skill) => sum + (skill.domain || 0), 0);
        const maxPossibleDomain = this.skills.length * 6; // Máximo domínio possível (6 por skill)
        const avgDomain = maxPossibleDomain > 0 ? Math.round((totalDomain / maxPossibleDomain) * 100) : 0;

        return {
            total: this.skills.length,
            unlocked: unlockedSkills.length,
            avgDomain: avgDomain
        };
    }

    getAchievementStats() {
        if (this.achievements.length === 0) return { unlocked: 0, locked: 0, total: 0, progress: 0 };

        const unlocked = this.achievements.filter(a => a.status === 'unlocked').length;
        const locked = this.achievements.filter(a => a.status === 'locked').length;
        const total = this.achievements.length;
        const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

        return { unlocked, locked, total, progress };
    }

    getTopSkill() {
        if (this.skills.length === 0) return { name: 'Nenhuma habilidade', progress: 0 };

        const topSkill = this.skills.reduce((max, skill) => {
            return (skill.domain || 0) > (max.domain || 0) ? skill : max;
        }, { domain: 0, title: 'Nenhuma habilidade encontrada' });

        return {
            name: topSkill.title || 'Nenhuma habilidade',
            progress: Math.round(((topSkill.domain || 0) / 6) * 100)
        };
    }

    getRelatedAchievements(skillId) {
        return this.achievements.filter(achievement =>
            achievement.relatedSkills && achievement.relatedSkills.includes(skillId)
        );
    }

    // Método para simular dados de exemplo se os arquivos não existirem
    loadExampleData() {
        console.log('Carregando dados de exemplo...');

        this.categories = [
            { id: 'qa', name: 'Quality Assurance' },
            { id: 'dev', name: 'Development' },
            { id: 'ux', name: 'User Experience' }
        ];

        this.skills = [
            {
                id: 'qa-root',
                title: 'Quality Assurance',
                description: 'Garantia de qualidade de software e processos de teste',
                category: 'qa',
                icon: 'bi-shield-check',
                domain: 5,
                unlock_threshold: 0,
                scores: {
                    theoretical: 5,
                    technical: 4,
                    problem_solving: 5,
                    knowledge_transfer: 4,
                    trends: 3
                },
                children: ['qa-testing', 'qa-automation'],
                relatedAchievements: ['istqb-cert']
            },
            {
                id: 'qa-testing',
                title: 'Manual Testing',
                description: 'Técnicas e práticas de teste manual',
                category: 'qa',
                icon: 'bi-bug',
                domain: 4,
                unlock_threshold: 3,
                parent: 'qa-root',
                scores: {
                    theoretical: 4,
                    technical: 4,
                    problem_solving: 4,
                    knowledge_transfer: 3,
                    trends: 3
                },
                children: ['qa-functional', 'qa-exploratory'],
                relatedAchievements: []
            },
            {
                id: 'qa-automation',
                title: 'Test Automation',
                description: 'Automação de testes e frameworks',
                category: 'qa',
                icon: 'bi-robot',
                domain: 3,
                unlock_threshold: 4,
                parent: 'qa-root',
                scores: {
                    theoretical: 3,
                    technical: 4,
                    problem_solving: 3,
                    knowledge_transfer: 2,
                    trends: 4
                },
                children: [],
                relatedAchievements: ['selenium-cert']
            },
            {
                id: 'qa-functional',
                title: 'Functional Testing',
                description: 'Testes funcionais e de regressão',
                category: 'qa',
                icon: 'bi-check2-square',
                domain: 2,
                unlock_threshold: 3,
                parent: 'qa-testing',
                scores: {
                    theoretical: 3,
                    technical: 2,
                    problem_solving: 3,
                    knowledge_transfer: 2,
                    trends: 2
                },
                children: [],
                relatedAchievements: []
            },
            {
                id: 'qa-exploratory',
                title: 'Exploratory Testing',
                description: 'Testes exploratórios e descoberta de bugs',
                category: 'qa',
                icon: 'bi-search',
                domain: 1,
                unlock_threshold: 3,
                parent: 'qa-testing',
                scores: {
                    theoretical: 2,
                    technical: 1,
                    problem_solving: 2,
                    knowledge_transfer: 1,
                    trends: 1
                },
                children: [],
                relatedAchievements: []
            },
            // Skills de DEV
            {
                id: 'dev-root',
                title: 'Development',
                description: 'Desenvolvimento de software e programação',
                category: 'dev',
                icon: 'bi-code-slash',
                domain: 4,
                unlock_threshold: 0,
                scores: {
                    theoretical: 4,
                    technical: 4,
                    problem_solving: 4,
                    knowledge_transfer: 3,
                    trends: 4
                },
                children: ['dev-frontend', 'dev-backend'],
                relatedAchievements: []
            },
            {
                id: 'dev-frontend',
                title: 'Frontend',
                description: 'Desenvolvimento de interfaces e experiência do usuário',
                category: 'dev',
                icon: 'bi-window',
                domain: 3,
                unlock_threshold: 3,
                parent: 'dev-root',
                scores: {
                    theoretical: 3,
                    technical: 4,
                    problem_solving: 3,
                    knowledge_transfer: 3,
                    trends: 4
                },
                children: [],
                relatedAchievements: []
            },
            {
                id: 'dev-backend',
                title: 'Backend',
                description: 'Desenvolvimento de APIs e sistemas server-side',
                category: 'dev',
                icon: 'bi-server',
                domain: 2,
                unlock_threshold: 3,
                parent: 'dev-root',
                scores: {
                    theoretical: 3,
                    technical: 2,
                    problem_solving: 3,
                    knowledge_transfer: 2,
                    trends: 3
                },
                children: [],
                relatedAchievements: []
            }
        ];

        this.achievements = [
            {
                id: 'istqb-cert',
                title: 'ISTQB Foundation',
                description: 'Certificação internacional em fundamentos de teste de software',
                image: 'assets/istqb.png',
                status: 'unlocked',
                evidence: 'https://example.com/istqb-cert.pdf',
                relatedSkills: ['qa-root'],
                subcategories: {
                    'Fundamentos': 'Conceitos básicos de teste',
                    'Técnicas': 'Técnicas de design de teste',
                    'Gestão': 'Gestão de atividades de teste'
                }
            },
            {
                id: 'selenium-cert',
                title: 'Selenium WebDriver',
                description: 'Certificação em automação de testes web com Selenium',
                image: 'assets/selenium.png',
                status: 'locked',
                evidence: null,
                relatedSkills: ['qa-automation'],
                subcategories: {
                    'WebDriver': 'API do Selenium WebDriver',
                    'Locators': 'Estratégias de localização de elementos',
                    'Framework': 'Criação de frameworks de teste'
                }
            },
            {
                id: 'agile-cert',
                title: 'Agile Testing',
                description: 'Práticas de teste em metodologias ágeis',
                image: 'assets/agile.png',
                status: 'unlocked',
                evidence: 'https://example.com/agile-cert.pdf',
                relatedSkills: ['qa-root', 'qa-testing'],
                subcategories: {
                    'Scrum': 'Teste em sprints e incrementos',
                    'Kanban': 'Fluxo contínuo de teste',
                    'BDD': 'Behavior Driven Development'
                }
            },
            {
                id: 'performance-cert',
                title: 'Performance Testing',
                description: 'Testes de performance e carga',
                image: 'assets/performance.png',
                status: 'locked',
                evidence: null,
                relatedSkills: ['qa-automation'],
                subcategories: {
                    'Load Testing': 'Testes de carga',
                    'Stress Testing': 'Testes de estresse',
                    'JMeter': 'Ferramenta Apache JMeter'
                }
            }
        ];

        this.loaded = true;
        console.log('Dados de exemplo carregados');
    }
}

// Instância global do serviço
window.dataService = new DataService();
