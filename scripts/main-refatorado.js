// ===== APLICAÇÃO PRINCIPAL DE MAPEAMENTO DE COMPETÊNCIAS =====
class AplicacaoMapeamentoCompetencias {
    constructor() {
        // Variáveis de controle de categoria e filtros
        this.categoria_atual = 'all';
        this.filtro_conquista_atual = 'all';
        this.modo_visualizacao_atual = 'list';
        this.ordem_classificacao_atual = 'unlocked-first'; // 'unlocked-first' ou 'locked-first'
        
        // Configurações de paginação
        this.conquistas_por_pagina = 10;
        this.pagina_conquista_atual = 1;
        this.conquistas_filtradas = [];
        
        // Inicializar aplicação
        this.inicializar();
    }

    async inicializar() {
        console.log('Inicializando aplicação de mapeamento de competências...');

        // Mostrar indicador de carregamento global
        this.mostrar_carregamento_global();

        // Carregar dados do serviço
        const dados_carregados = await window.dataService.loadData();

        if (!dados_carregados) {
            console.log('Erro ao carregar dados, usando dados de exemplo...');
            window.dataService.loadExampleData();
        }

        // Inicializar componentes da aplicação
        this.inicializar_componentes();
        this.configurar_ouvintes_eventos();
        this.atualizar_interface_usuario();

        // Remover indicador de carregamento
        this.ocultar_carregamento_global();

        console.log('Aplicação de mapeamento de competências inicializada com sucesso');

        // Configurar atualizações periódicas das métricas (a cada 30 segundos)
        this.configurar_atualizacoes_periodicas();
    }

    configurar_atualizacoes_periodicas() {
        // Atualizar métricas periodicamente para manter sincronização
        setInterval(() => {
            this.atualizar_cartoes_resumo();
        }, 30000); // 30 segundos

        // Atualizar quando a janela ganha foco (usuário volta para a aba)
        window.addEventListener('focus', () => {
            this.atualizar_cartoes_resumo();
        });
    }

    // Método público para forçar atualização das métricas
    atualizar_metricas_manual() {
        this.atualizar_cartoes_resumo();
        console.log('Métricas atualizadas manualmente');
    }

    inicializar_componentes() {
        // Inicializar a árvore de habilidades
        window.arvore_habilidades = new ArvoreHabilidades('skill-tree');

        // Renderizar a árvore inicial com categoria atual
        window.arvore_habilidades.renderizar(this.categoria_atual);
    }

    configurar_ouvintes_eventos() {
        // Configurar filtros de categoria de habilidades
        document.querySelectorAll('.filter-btn').forEach(botao_filtro => {
            botao_filtro.addEventListener('click', (evento) => {
                const categoria = evento.target.getAttribute('data-category');
                this.alterar_categoria(categoria);
            });
        });

        // Configurar filtros de status de conquistas
        document.querySelectorAll('.status-filter-btn').forEach(botao_status => {
            botao_status.addEventListener('click', (evento) => {
                // Garantir que o clique no ícone também funcione
                let elemento_alvo = evento.target;
                // Se clicou no elemento <i>, subir para o botão
                if (elemento_alvo.tagName === 'I' && elemento_alvo.closest('.status-filter-btn')) {
                    elemento_alvo = elemento_alvo.closest('.status-filter-btn');
                }
                const status = elemento_alvo.getAttribute('data-status');
                if (status) {
                    this.alterar_filtro_conquista(status);
                }
            });
        });

        // Configurar toggle de visualização (lista/grade)
        document.querySelectorAll('.view-btn').forEach(botao_visualizacao => {
            botao_visualizacao.addEventListener('click', (evento) => {
                const modo_visualizacao = evento.target.getAttribute('data-view');
                this.alterar_modo_visualizacao(modo_visualizacao);
            });
        });

        // Configurar toggle de ordenação
        const botao_ordenacao = document.getElementById('sort-btn');
        if (botao_ordenacao) {
            botao_ordenacao.addEventListener('click', () => {
                this.alternar_ordem_classificacao();
            });
        }

        // Configurar botão "Ver Mais" para paginação
        const botao_carregar_mais = document.getElementById('load-more-btn');
        if (botao_carregar_mais) {
            botao_carregar_mais.addEventListener('click', () => {
                this.carregar_mais_conquistas();
            });
        }

        // Configurar botões de fechar drawer/modal
        const botao_fechar_drawer = document.getElementById('close-drawer');
        if (botao_fechar_drawer) {
            botao_fechar_drawer.addEventListener('click', () => {
                this.fechar_detalhes_conquista();
            });
        }

        const botao_fechar_modal = document.getElementById('close-modal');
        if (botao_fechar_modal) {
            botao_fechar_modal.addEventListener('click', () => {
                this.fechar_detalhes_conquista();
            });
        }

        // Configurar overlay para fechar modal
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.fechar_detalhes_conquista();
            });
        }

        // Configurar responsividade
        window.addEventListener('resize', () => {
            this.lidar_com_redimensionamento();
        });

        // Configurar navegação por teclado
        document.addEventListener('keydown', (evento) => {
            this.lidar_com_navegacao_teclado(evento);
        });

        // Configurar event listeners para evidências
        this.configurar_ouvintes_conquistas();
    }

    // Função principal para abrir detalhes das conquistas
    abrir_detalhes_conquista(id_conquista) {
        const conquista = window.dataService.achievements.find(conquista_item => conquista_item.id === id_conquista);
        if (!conquista) return;

        const eh_dispositivo_movel = window.innerWidth <= 768;

        if (eh_dispositivo_movel) {
            // Mobile: usar modal compartilhado
            this.mostrar_modal_conquista(conquista);
        } else {
            // Desktop: usar drawer compartilhado
            this.mostrar_drawer_conquista(conquista);
        }
    }

    mostrar_drawer_conquista(conquista) {
        const container_drawer = document.getElementById('skill-drawer');
        const conteudo_drawer = container_drawer.querySelector('.drawer-content');

        conteudo_drawer.innerHTML = this.gerar_html_detalhes_conquista(conquista);
        container_drawer.classList.add('open');
    }

    mostrar_modal_conquista(conquista) {
        const container_modal = document.getElementById('skill-modal');
        const conteudo_modal = container_modal.querySelector('.modal-body');

        conteudo_modal.innerHTML = this.gerar_html_detalhes_conquista(conquista);
        container_modal.classList.add('open');

        // Prevenir scroll do body no mobile
        if (window.innerWidth <= 768) {
            document.body.classList.add('modal-open');
        }
    }

    fechar_detalhes_conquista() {
        // Fechar drawer e modal
        const drawer = document.getElementById('skill-drawer');
        const modal = document.getElementById('skill-modal');

        if (drawer) drawer.classList.remove('open');
        if (modal) modal.classList.remove('open');

        // Restaurar scroll do body
        document.body.classList.remove('modal-open');

        // Também chamar o método da árvore se existir
        if (window.arvore_habilidades && window.arvore_habilidades.fechar_detalhes) {
            window.arvore_habilidades.fechar_detalhes();
        }
    }

    gerar_html_detalhes_conquista(conquista) {
        const esta_desbloqueada = conquista.status === 'unlocked';

        let html_subcategorias = '';
        if (conquista.subcategories) {
            html_subcategorias = Object.entries(conquista.subcategories)
                .map(([chave, valor]) => `<div><strong>${chave}:</strong> ${valor}</div>`)
                .join('');
        }

        return `
            <div class="detalhes-conquista">
                <!-- Início Cabeçalho Conquista -->
                <div class="cabecalho-conquista ${esta_desbloqueada ? 'desbloqueada' : 'bloqueada'}">
                    <div class="imagem-conquista">
                        <img src="${conquista.image}" alt="${conquista.title}" loading="lazy">
                        <div class="badge-status ${conquista.status}">
                            <i class="bi ${esta_desbloqueada ? 'bi-unlock' : 'bi-lock'}"></i>
                        </div>
                    </div> <!-- Fim Imagem Conquista -->
                    
                    <div class="informacoes-conquista">
                        <h3 class="titulo-conquista">${conquista.title}</h3>
                        <p class="descricao-conquista">${conquista.description}</p>
                        
                        <div class="metadados-conquista">
                            <span class="categoria-conquista">${conquista.category}</span>
                            <span class="dificuldade-conquista">
                                ${'★'.repeat(conquista.difficulty)}${'☆'.repeat(5 - conquista.difficulty)}
                            </span>
                        </div> <!-- Fim Metadados Conquista -->
                        
                        ${conquista.unlockedDate ? `
                            <div class="data-desbloqueio">
                                <i class="bi bi-calendar-check"></i>
                                Desbloqueada em: ${conquista.unlockedDate}
                            </div>
                        ` : ''}
                    </div> <!-- Fim Informações Conquista -->
                </div> <!-- Fim Cabeçalho Conquista -->
                
                ${conquista.evidence ? `
                    <div class="secao-evidencia">
                        <h4><i class="bi bi-file-earmark-text"></i> Evidência</h4>
                        <a href="${conquista.evidence}" target="_blank" class="link-evidencia">
                            Ver evidência <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                    </div> <!-- Fim Seção Evidência -->
                ` : ''}
                
                ${html_subcategorias ? `
                    <div class="secao-subcategorias">
                        <h4><i class="bi bi-tags"></i> Detalhes</h4>
                        ${html_subcategorias}
                    </div> <!-- Fim Seção Subcategorias -->
                ` : ''}
            </div> <!-- Fim Detalhes Conquista -->
        `;
    }

    // Continuar com outros métodos...
    alterar_categoria(nova_categoria) {
        if (this.categoria_atual === nova_categoria) return;

        this.categoria_atual = nova_categoria;
        this.atualizar_botoes_filtro_categoria();
        
        // Atualizar árvore de habilidades
        if (window.arvore_habilidades) {
            window.arvore_habilidades.renderizar(nova_categoria);
        }
        
        console.log(`Categoria alterada para: ${nova_categoria}`);
    }

    alterar_filtro_conquista(novo_filtro) {
        if (this.filtro_conquista_atual === novo_filtro) return;

        this.filtro_conquista_atual = novo_filtro;
        this.pagina_conquista_atual = 1; // Reset para primeira página
        this.atualizar_botoes_filtro_status();
        this.renderizar_conquistas();
        
        console.log(`Filtro de conquista alterado para: ${novo_filtro}`);
    }

    alterar_modo_visualizacao(novo_modo) {
        if (this.modo_visualizacao_atual === novo_modo) return;

        this.modo_visualizacao_atual = novo_modo;
        this.atualizar_botoes_visualizacao();
        this.renderizar_conquistas();
        
        console.log(`Modo de visualização alterado para: ${novo_modo}`);
    }

    alternar_ordem_classificacao() {
        this.ordem_classificacao_atual = this.ordem_classificacao_atual === 'unlocked-first' 
            ? 'locked-first' 
            : 'unlocked-first';
        
        this.atualizar_botao_ordenacao();
        this.renderizar_conquistas();
        
        console.log(`Ordem de classificação alterada para: ${this.ordem_classificacao_atual}`);
    }

    carregar_mais_conquistas() {
        this.pagina_conquista_atual++;
        this.renderizar_conquistas(false); // false = não limpar lista existente
        
        console.log(`Carregando mais conquistas - Página: ${this.pagina_conquista_atual}`);
    }

    // Método para lidar com redimensionamento da janela
    lidar_com_redimensionamento() {
        // Fechar detalhes se estiverem abertos durante redimensionamento
        this.fechar_detalhes_conquista();
        
        // Reajustar componentes se necessário
        if (window.arvore_habilidades && window.arvore_habilidades.reajustar_layout) {
            window.arvore_habilidades.reajustar_layout();
        }
    }

    // Método para navegação por teclado
    lidar_com_navegacao_teclado(evento) {
        // ESC para fechar modais/drawers
        if (evento.key === 'Escape') {
            this.fechar_detalhes_conquista();
        }
        
        // Números 1-4 para filtros rápidos de categoria
        if (evento.key >= '1' && evento.key <= '4') {
            const categorias = ['qa', 'dev', 'ux', 'data'];
            const indice_categoria = parseInt(evento.key) - 1;
            if (categorias[indice_categoria]) {
                this.alterar_categoria(categorias[indice_categoria]);
            }
        }
        
        // Tecla 'A' para mostrar todas as categorias
        if (evento.key.toLowerCase() === 'a') {
            this.alterar_categoria('all');
        }
    }

    // Configurar ouvintes específicos para conquistas
    configurar_ouvintes_conquistas() {
        // Event delegation para cards de conquista
        document.addEventListener('click', (evento) => {
            const card_conquista = evento.target.closest('.achievement-card');
            if (card_conquista) {
                const id_conquista = card_conquista.getAttribute('data-id');
                if (id_conquista) {
                    this.abrir_detalhes_conquista(id_conquista);
                }
            }
        });
    }

    // Atualizar interface do usuário
    atualizar_interface_usuario() {
        this.atualizar_cartoes_resumo();
        this.renderizar_conquistas();
        this.atualizar_botoes_filtro_categoria();
        this.atualizar_botoes_filtro_status();
        this.atualizar_botoes_visualizacao();
        this.atualizar_botao_ordenacao();
    }

    // Mostrar/ocultar indicadores de carregamento
    mostrar_carregamento_global() {
        const indicador_carregamento = document.getElementById('loading-indicator');
        if (indicador_carregamento) {
            indicador_carregamento.style.display = 'block';
        }
    }

    ocultar_carregamento_global() {
        const indicador_carregamento = document.getElementById('loading-indicator');
        if (indicador_carregamento) {
            indicador_carregamento.style.display = 'none';
        }
    }

    // Placeholder para métodos que serão implementados
    atualizar_cartoes_resumo() {
        // TODO: Implementar atualização dos cartões de resumo
        console.log('Atualizando cartões de resumo...');
    }

    renderizar_conquistas(limpar_lista = true) {
        // TODO: Implementar renderização das conquistas
        console.log('Renderizando conquistas...');
    }

    atualizar_botoes_filtro_categoria() {
        // TODO: Implementar atualização dos botões de filtro de categoria
        console.log('Atualizando botões de filtro de categoria...');
    }

    atualizar_botoes_filtro_status() {
        // TODO: Implementar atualização dos botões de filtro de status
        console.log('Atualizando botões de filtro de status...');
    }

    atualizar_botoes_visualizacao() {
        // TODO: Implementar atualização dos botões de visualização
        console.log('Atualizando botões de visualização...');
    }

    atualizar_botao_ordenacao() {
        // TODO: Implementar atualização do botão de ordenação
        console.log('Atualizando botão de ordenação...');
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    // Criar instância global da aplicação
    window.aplicacao_mapeamento = new AplicacaoMapeamentoCompetencias();
});

// ===== EXPOSIÇÃO DE MÉTODOS GLOBAIS =====
window.abrir_detalhes_conquista = function(id_conquista) {
    if (window.aplicacao_mapeamento) {
        window.aplicacao_mapeamento.abrir_detalhes_conquista(id_conquista);
    }
};

window.alterar_categoria = function(categoria) {
    if (window.aplicacao_mapeamento) {
        window.aplicacao_mapeamento.alterar_categoria(categoria);
    }
};

window.atualizar_metricas = function() {
    if (window.aplicacao_mapeamento) {
        window.aplicacao_mapeamento.atualizar_metricas_manual();
    }
};
