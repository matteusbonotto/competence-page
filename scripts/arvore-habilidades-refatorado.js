// ===== GERENCIADOR DA ÁRVORE DE HABILIDADES =====
class ArvoreHabilidades {
    constructor(id_container) {
        this.container = document.getElementById(id_container);
        this.categoria_atual = 'all';
        this.nos_expandidos = new Set();
        this.no_selecionado = null;
    }

    // Renderizar a árvore completa de habilidades
    async renderizar(id_categoria = 'all') {
        if (!window.dataService.loaded) {
            this.mostrar_carregamento();
            return;
        }

        this.categoria_atual = id_categoria;
        this.container.innerHTML = '';

        const habilidades_raiz = window.dataService.getRootSkills(id_categoria);
        
        if (habilidades_raiz.length === 0) {
            this.mostrar_vazio();
            return;
        }

        const wrapper_arvore = document.createElement('div');
        wrapper_arvore.className = 'tree-wrapper';
        wrapper_arvore.style.display = 'flex';
        wrapper_arvore.style.flexDirection = 'row';
        wrapper_arvore.style.justifyContent = 'center';
        wrapper_arvore.style.gap = '60px';
        wrapper_arvore.style.flexWrap = 'wrap';

        // Renderizar cada habilidade raiz e seus filhos
        habilidades_raiz.forEach(habilidade => {
            const elemento_no = this.criar_no(habilidade);
            wrapper_arvore.appendChild(elemento_no);
        });

        this.container.appendChild(wrapper_arvore);
        this.anexar_ouvintes_eventos();
    }

    // Criar um nó da árvore de habilidades
    criar_no(habilidade, nivel = 0) {
        const esta_desbloqueada = window.dataService.isSkillUnlocked(habilidade.id);
        const tem_filhos = habilidade.children && habilidade.children.length > 0;
        const esta_expandido = this.nos_expandidos.has(habilidade.id);

        // Container principal do nó
        const container_no = document.createElement('div');
        container_no.className = 'tree-branch';
        container_no.setAttribute('data-skill-id', habilidade.id);

        // Nó principal da habilidade
        const no_habilidade = document.createElement('div');
        no_habilidade.className = `tree-node ${esta_desbloqueada ? 'unlocked' : 'locked'}`;
        no_habilidade.setAttribute('data-category', habilidade.category || 'default');
        no_habilidade.setAttribute('data-tooltip', `Domínio: ${habilidade.domain || 0}/5`);

        // Conteúdo do nó de habilidade
        const conteudo_no = document.createElement('div');
        conteudo_no.className = 'node-content';

        // Ícone da habilidade
        const icone_habilidade = document.createElement('i');
        icone_habilidade.className = `${habilidade.icon || 'bi-star'} node-icon`;
        conteudo_no.appendChild(icone_habilidade);

        // Título da habilidade
        const titulo_habilidade = document.createElement('div');
        titulo_habilidade.className = 'node-title';
        titulo_habilidade.textContent = habilidade.title;
        conteudo_no.appendChild(titulo_habilidade);

        // Indicador de domínio
        const indicador_dominio = document.createElement('div');
        indicador_dominio.className = 'node-domain';
        indicador_dominio.textContent = `${habilidade.domain || 0}/5`;
        conteudo_no.appendChild(indicador_dominio);

        no_habilidade.appendChild(conteudo_no);

        // Ícone de cadeado para nós bloqueados
        if (!esta_desbloqueada) {
            const icone_cadeado = document.createElement('div');
            icone_cadeado.className = 'lock-icon';
            icone_cadeado.innerHTML = '<i class="bi bi-lock"></i>';
            no_habilidade.appendChild(icone_cadeado);
        } // Fim Ícone Cadeado

        // Botão de expansão se tiver filhos
        if (tem_filhos) {
            const botao_expandir = document.createElement('button');
            botao_expandir.className = `expand-btn ${esta_expandido ? 'expanded' : ''}`;
            // Usar texto simples em vez de ícones para melhor controle
            botao_expandir.innerHTML = `<span style="line-height: 1; font-family: monospace;">${esta_expandido ? '−' : '+'}</span>`;
            botao_expandir.addEventListener('click', (evento) => {
                evento.stopPropagation();
                this.alternar_expansao_no(habilidade.id);
            });
            no_habilidade.appendChild(botao_expandir);
        } // Fim Botão Expandir

        // Adicionar evento de clique para mostrar detalhes
        no_habilidade.addEventListener('click', () => {
            this.selecionar_no(habilidade.id);
        });

        container_no.appendChild(no_habilidade);

        // Container para filhos se expandido
        if (tem_filhos && esta_expandido) {
            const container_filhos = document.createElement('div');
            container_filhos.className = 'children-container';
            
            // Renderizar nós filhos
            habilidade.children.forEach(id_filho => {
                const habilidade_filho = window.dataService.getSkill(id_filho);
                if (habilidade_filho) {
                    const elemento_filho = this.criar_no(habilidade_filho, nivel + 1);
                    container_filhos.appendChild(elemento_filho);
                }
            });

            container_no.appendChild(container_filhos);
        } // Fim Container Filhos

        return container_no;
    }

    // Alternar expansão de um nó
    alternar_expansao_no(id_habilidade) {
        if (this.nos_expandidos.has(id_habilidade)) {
            this.nos_expandidos.delete(id_habilidade);
        } else {
            this.nos_expandidos.add(id_habilidade);
        }
        
        // Re-renderizar apenas o nó específico
        this.renderizar_no_especifico(id_habilidade);
    }

    // Selecionar um nó e mostrar detalhes
    selecionar_no(id_habilidade) {
        const habilidade = window.dataService.getSkill(id_habilidade);
        if (!habilidade) return;

        // Atualizar nó selecionado
        this.no_selecionado = id_habilidade;
        this.atualizar_estados_visuais_nos();

        // Mostrar detalhes da habilidade
        this.mostrar_detalhes_habilidade(habilidade);
    }

    // Mostrar detalhes de uma habilidade
    mostrar_detalhes_habilidade(habilidade) {
        const eh_dispositivo_movel = window.innerWidth <= 768;

        if (eh_dispositivo_movel) {
            // Mobile: usar modal
            this.mostrar_modal_habilidade(habilidade);
        } else {
            // Desktop: usar drawer
            this.mostrar_drawer_habilidade(habilidade);
        }
    }

    // Mostrar modal de habilidade (mobile)
    mostrar_modal_habilidade(habilidade) {
        const container_modal = document.getElementById('skill-modal');
        const conteudo_modal = container_modal.querySelector('.modal-body');

        conteudo_modal.innerHTML = this.gerar_html_detalhes_habilidade(habilidade);
        container_modal.classList.add('open');

        // Prevenir scroll do body no mobile
        document.body.classList.add('modal-open');
    }

    // Mostrar drawer de habilidade (desktop)
    mostrar_drawer_habilidade(habilidade) {
        const container_drawer = document.getElementById('skill-drawer');
        const conteudo_drawer = container_drawer.querySelector('.drawer-content');

        conteudo_drawer.innerHTML = this.gerar_html_detalhes_habilidade(habilidade);
        container_drawer.classList.add('open');
    }

    // Gerar HTML dos detalhes da habilidade
    gerar_html_detalhes_habilidade(habilidade) {
        const esta_desbloqueada = window.dataService.isSkillUnlocked(habilidade.id);
        const nivel_dominio = habilidade.domain || 0;

        return `
            <!-- Início Detalhes Habilidade -->
            <div class="detalhes-habilidade">
                <!-- Início Cabeçalho Habilidade -->
                <div class="cabecalho-habilidade ${esta_desbloqueada ? 'desbloqueada' : 'bloqueada'}">
                    <div class="icone-habilidade-grande">
                        <i class="${habilidade.icon || 'bi-star'}"></i>
                        ${!esta_desbloqueada ? '<div class="badge-bloqueado"><i class="bi bi-lock"></i></div>' : ''}
                    </div> <!-- Fim Ícone Habilidade Grande -->
                    
                    <div class="informacoes-habilidade">
                        <h3 class="titulo-habilidade">${habilidade.title}</h3>
                        <p class="descricao-habilidade">${habilidade.description || 'Sem descrição disponível'}</p>
                        
                        <!-- Início Barra Progresso Domínio -->
                        <div class="barra-progresso-dominio">
                            <div class="rotulo-progresso">
                                <span>Nível de Domínio</span>
                                <span class="valor-dominio">${nivel_dominio}/5</span>
                            </div>
                            <div class="barra-progresso">
                                <div class="preenchimento-progresso" style="width: ${(nivel_dominio / 5) * 100}%"></div>
                            </div>
                            <div class="estrelas-dominio">
                                ${'★'.repeat(nivel_dominio)}${'☆'.repeat(5 - nivel_dominio)}
                            </div>
                        </div> <!-- Fim Barra Progresso Domínio -->
                        
                        <div class="metadados-habilidade">
                            <span class="categoria-habilidade">${habilidade.category}</span>
                            ${habilidade.unlock_threshold ? `
                                <span class="limite-desbloqueio">
                                    Desbloqueio: ${habilidade.unlock_threshold} pontos
                                </span>
                            ` : ''}
                        </div> <!-- Fim Metadados Habilidade -->
                    </div> <!-- Fim Informações Habilidade -->
                </div> <!-- Fim Cabeçalho Habilidade -->
                
                ${habilidade.children && habilidade.children.length > 0 ? `
                    <!-- Início Seção Habilidades Relacionadas -->
                    <div class="secao-habilidades-relacionadas">
                        <h4><i class="bi bi-diagram-3"></i> Habilidades Relacionadas</h4>
                        <div class="lista-habilidades-relacionadas">
                            ${habilidade.children.map(id_filho => {
                                const habilidade_filho = window.dataService.getSkill(id_filho);
                                if (!habilidade_filho) return '';
                                const filho_desbloqueado = window.dataService.isSkillUnlocked(id_filho);
                                return `
                                    <div class="item-habilidade-relacionada ${filho_desbloqueado ? 'desbloqueada' : 'bloqueada'}" 
                                         onclick="window.aplicacao_mapeamento.abrir_detalhes_habilidade('${id_filho}')">
                                        <i class="${habilidade_filho.icon || 'bi-star'}"></i>
                                        <span>${habilidade_filho.title}</span>
                                        ${!filho_desbloqueado ? '<i class="bi bi-lock"></i>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div> <!-- Fim Seção Habilidades Relacionadas -->
                ` : ''}
                
                ${habilidade.relatedAchievements && habilidade.relatedAchievements.length > 0 ? `
                    <!-- Início Seção Conquistas Relacionadas -->
                    <div class="secao-conquistas-relacionadas">
                        <h4><i class="bi bi-trophy"></i> Conquistas Relacionadas</h4>
                        <div class="lista-conquistas-relacionadas">
                            ${habilidade.relatedAchievements.map(id_conquista => {
                                const conquista = window.dataService.achievements.find(c => c.id === id_conquista);
                                if (!conquista) return '';
                                return `
                                    <div class="item-conquista-relacionada ${conquista.status}" 
                                         onclick="window.aplicacao_mapeamento.abrir_detalhes_conquista('${id_conquista}')">
                                        <img src="${conquista.image}" alt="${conquista.title}" class="miniatura-conquista">
                                        <span>${conquista.title}</span>
                                        <i class="bi ${conquista.status === 'unlocked' ? 'bi-unlock' : 'bi-lock'}"></i>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div> <!-- Fim Seção Conquistas Relacionadas -->
                ` : ''}
            </div> <!-- Fim Detalhes Habilidade -->
        `;
    }

    // Fechar detalhes da habilidade
    fechar_detalhes() {
        const drawer = document.getElementById('skill-drawer');
        const modal = document.getElementById('skill-modal');

        if (drawer) drawer.classList.remove('open');
        if (modal) modal.classList.remove('open');

        // Restaurar scroll do body
        document.body.classList.remove('modal-open');

        // Limpar seleção
        this.no_selecionado = null;
        this.atualizar_estados_visuais_nos();
    }

    // Atualizar estados visuais dos nós
    atualizar_estados_visuais_nos() {
        // Remover classe selected de todos os nós
        document.querySelectorAll('.tree-node.selected').forEach(no => {
            no.classList.remove('selected');
        });

        // Adicionar classe selected ao nó atual
        if (this.no_selecionado) {
            const no_selecionado = document.querySelector(`[data-skill-id="${this.no_selecionado}"] .tree-node`);
            if (no_selecionado) {
                no_selecionado.classList.add('selected');
            }
        }
    }

    // Renderizar apenas um nó específico
    renderizar_no_especifico(id_habilidade) {
        const elemento_no = document.querySelector(`[data-skill-id="${id_habilidade}"]`);
        if (!elemento_no) return;

        const habilidade = window.dataService.getSkill(id_habilidade);
        if (!habilidade) return;

        const novo_elemento = this.criar_no(habilidade);
        elemento_no.replaceWith(novo_elemento);
    }

    // Anexar ouvintes de eventos
    anexar_ouvintes_eventos() {
        // Event listeners já são adicionados durante a criação dos nós
        console.log('Ouvintes de eventos da árvore anexados');
    }

    // Mostrar indicador de carregamento
    mostrar_carregamento() {
        this.container.innerHTML = `
            <!-- Início Indicador Carregamento -->
            <div class="indicador-carregamento">
                <div class="spinner"></div>
                <p>Carregando árvore de habilidades...</p>
            </div> <!-- Fim Indicador Carregamento -->
        `;
    }

    // Mostrar estado vazio
    mostrar_vazio() {
        this.container.innerHTML = `
            <!-- Início Estado Vazio -->
            <div class="estado-vazio">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Nenhuma habilidade encontrada</h3>
                <p>Não foram encontradas habilidades para a categoria selecionada.</p>
            </div> <!-- Fim Estado Vazio -->
        `;
    }

    // Reajustar layout (para responsividade)
    reajustar_layout() {
        // Re-renderizar a árvore atual
        this.renderizar(this.categoria_atual);
    }
}
