// ===== INÍCIO APLICAÇÃO PAINEL ADMINISTRATIVO - SISTEMA DE MAPEAMENTO DE COMPETÊNCIAS =====

/**
 * Classe principal para gerenciamento do painel administrativo
 * Responsável por coordenar todas as operações CRUD de habilidades e conquistas
 */
class AplicacaoPainelAdministrativo {
  constructor() {
    console.log('Inicializando Aplicação do Painel Administrativo...');
    
    // ===== INÍCIO PROPRIEDADES DE ESTADO =====
    this.servico_dados = new ServicoDeServico();
    this.dados_habilidades_carregadas = null;
    this.dados_conquistas_carregadas = null;
    this.secao_ativa_atual = 'dashboard';
    this.modo_edicao_ativo = false;
    this.item_sendo_editado = null;
    this.alteracoes_nao_salvas = false;
    // ===== FIM PROPRIEDADES DE ESTADO =====
    
    // ===== INÍCIO ELEMENTOS DOM PRINCIPAIS =====
    this.elemento_area_conteudo = null;
    this.elemento_barra_navegacao = null;
    this.elemento_titulo_pagina = null;
    this.elemento_modal_habilidade = null;
    this.elemento_modal_conquista = null;
    // ===== FIM ELEMENTOS DOM PRINCIPAIS =====
    
    // ===== INÍCIO CONFIGURAÇÕES DA APLICAÇÃO =====
    this.configuracao_paginacao = {
      itens_por_pagina: 20,
      pagina_atual: 1
    };
    
    this.configuracao_filtros = {
      filtro_categoria_ativo: null,
      filtro_dominio_ativo: null,
      texto_busca_ativo: ''
    };
    // ===== FIM CONFIGURAÇÕES DA APLICAÇÃO =====
    
    // Inicializar aplicação após carregamento do DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.inicializar_aplicacao());
    } else {
      this.inicializar_aplicacao();
    }
  }

  // ===== INÍCIO MÉTODOS DE INICIALIZAÇÃO =====
  
  /**
   * Inicializa a aplicação do painel administrativo
   */
  async inicializar_aplicacao() {
    console.log('Inicializando aplicação do painel administrativo...');
    
    try {
      // Cachear elementos DOM importantes
      this.cachear_elementos_dom();
      
      // Configurar ouvintes de eventos
      this.configurar_ouvintes_eventos();
      
      // Carregar dados iniciais
      await this.carregar_dados_iniciais();
      
      // Configurar interface inicial
      this.configurar_interface_inicial();
      
      console.log('Aplicação do painel administrativo inicializada com sucesso');
      
    } catch (erro_inicializacao) {
      console.error('Erro na inicialização da aplicação:', erro_inicializacao);
      this.exibir_mensagem_erro('Erro ao inicializar aplicação', erro_inicializacao.message);
    }
  }

  /**
   * Cacheia elementos DOM importantes para evitar consultas repetidas
   */
  cachear_elementos_dom() {
    console.log('Cacheando elementos DOM...');
    
    this.elemento_area_conteudo = document.getElementById('areaConteudo');
    this.elemento_barra_navegacao = document.getElementById('barraLateralNavegacao');
    this.elemento_titulo_pagina = document.getElementById('tituloPagina');
    this.elemento_modal_habilidade = document.getElementById('modalHabilidade');
    this.elemento_modal_conquista = document.getElementById('modalConquista');
    
    // Validar elementos essenciais
    const elementos_essenciais = [
      { elemento: this.elemento_area_conteudo, nome: 'areaConteudo' },
      { elemento: this.elemento_titulo_pagina, nome: 'tituloPagina' }
    ];
    
    elementos_essenciais.forEach(({ elemento, nome }) => {
      if (!elemento) {
        throw new Error(`Elemento essencial não encontrado: ${nome}`);
      }
    });
  }

  /**
   * Configura todos os ouvintes de eventos da interface
   */
  configurar_ouvintes_eventos() {
    console.log('Configurando ouvintes de eventos...');
    
    // ===== INÍCIO EVENTOS DE NAVEGAÇÃO =====
    document.querySelectorAll('.item-navegacao').forEach(item_navegacao => {
      item_navegacao.addEventListener('click', (evento) => {
        evento.preventDefault();
        const nome_secao = evento.currentTarget.getAttribute('data-secao');
        this.navegar_para_secao(nome_secao);
      });
    });
    // ===== FIM EVENTOS DE NAVEGAÇÃO =====
    
    // ===== INÍCIO EVENTOS DE BOTÕES PRINCIPAIS =====
    this.configurar_evento_botao('botaoToggleMenu', () => this.alternar_menu_lateral());
    this.configurar_evento_botao('botaoSalvarDados', () => this.salvar_todas_alteracoes());
    this.configurar_evento_botao('botaoExportarDados', () => this.exportar_dados_sistema());
    this.configurar_evento_botao('botaoNovaHabilidade', () => this.abrir_formulario_nova_habilidade());
    this.configurar_evento_botao('botaoNovaConquista', () => this.abrir_formulario_nova_conquista());
    // ===== FIM EVENTOS DE BOTÕES PRINCIPAIS =====
    
    // ===== INÍCIO EVENTOS DE MODAIS =====
    this.configurar_evento_botao('botaoSalvarHabilidade', () => this.salvar_habilidade_editada());
    this.configurar_evento_botao('botaoSalvarConquista', () => this.salvar_conquista_editada());
    // ===== FIM EVENTOS DE MODAIS =====
    
    // ===== INÍCIO EVENTOS DE FORMULÁRIOS =====
    this.configurar_eventos_formularios();
    // ===== FIM EVENTOS DE FORMULÁRIOS =====
    
    // ===== INÍCIO EVENTOS DE TECLADO =====
    document.addEventListener('keydown', (evento) => this.processar_teclas_atalho(evento));
    // ===== FIM EVENTOS DE TECLADO =====
    
    // ===== INÍCIO EVENTOS DE JANELA =====
    window.addEventListener('beforeunload', (evento) => this.verificar_alteracoes_nao_salvas(evento));
    // ===== FIM EVENTOS DE JANELA =====
  }

  /**
   * Configura evento para um botão específico
   * @param {string} id_botao - ID do botão
   * @param {Function} callback_evento - Função a ser executada
   */
  configurar_evento_botao(id_botao, callback_evento) {
    const elemento_botao = document.getElementById(id_botao);
    if (elemento_botao) {
      elemento_botao.addEventListener('click', callback_evento);
    }
  }

  /**
   * Configura eventos específicos de formulários
   */
  configurar_eventos_formularios() {
    // Evento para detectar mudanças em formulários
    document.addEventListener('input', (evento) => {
      if (evento.target.closest('form')) {
        this.marcar_alteracoes_nao_salvas();
      }
    });
    
    // Evento para submissão de formulários
    document.addEventListener('submit', (evento) => {
      evento.preventDefault();
      this.processar_submissao_formulario(evento.target);
    });
  }

  /**
   * Carrega todos os dados necessários para a aplicação
   */
  async carregar_dados_iniciais() {
    console.log('Carregando dados iniciais...');
    
    try {
      this.exibir_indicador_carregamento(true);
      
      const dados_completos = await this.servico_dados.carregar_todos_dados();
      
      this.dados_habilidades_carregadas = dados_completos.habilidades;
      this.dados_conquistas_carregadas = dados_completos.conquistas;
      
      // Atualizar estatísticas do dashboard
      this.atualizar_estatisticas_dashboard();
      
      console.log('Dados iniciais carregados com sucesso');
      
    } catch (erro_carregamento) {
      console.error('Erro ao carregar dados iniciais:', erro_carregamento);
      this.exibir_mensagem_erro('Erro ao carregar dados', erro_carregamento.message);
    } finally {
      this.exibir_indicador_carregamento(false);
    }
  }

  /**
   * Configura a interface inicial da aplicação
   */
  configurar_interface_inicial() {
    console.log('Configurando interface inicial...');
    
    // Definir seção inicial
    this.navegar_para_secao('dashboard');
    
    // Configurar responsive design
    this.configurar_interface_responsiva();
    
    // Aplicar tema padrão
    this.aplicar_tema_interface();
  }
  
  // ===== FIM MÉTODOS DE INICIALIZAÇÃO =====

  // ===== INÍCIO MÉTODOS DE NAVEGAÇÃO =====
  
  /**
   * Navega para uma seção específica do painel
   * @param {string} nome_secao - Nome da seção destino
   */
  navegar_para_secao(nome_secao) {
    console.log(`Navegando para seção: ${nome_secao}`);
    
    if (this.secao_ativa_atual === nome_secao) {
      console.log('Seção já está ativa');
      return;
    }
    
    // Verificar alterações não salvas antes de navegar
    if (this.alteracoes_nao_salvas && !this.confirmar_navegacao_com_alteracoes()) {
      return;
    }
    
    // Atualizar estado da navegação
    this.atualizar_estado_navegacao(nome_secao);
    
    // Mostrar seção correspondente
    this.exibir_secao_correspondente(nome_secao);
    
    // Atualizar título da página
    this.atualizar_titulo_pagina(nome_secao);
    
    // Carregar dados específicos da seção se necessário
    this.carregar_dados_secao(nome_secao);
    
    this.secao_ativa_atual = nome_secao;
  }

  /**
   * Atualiza o estado visual da navegação
   * @param {string} nome_secao - Nome da seção ativa
   */
  atualizar_estado_navegacao(nome_secao) {
    // Remover classe ativa de todos os itens
    document.querySelectorAll('.item-navegacao').forEach(item => {
      item.classList.remove('active');
    });
    
    // Adicionar classe ativa ao item correspondente
    const item_ativo = document.querySelector(`[data-secao="${nome_secao}"]`);
    if (item_ativo) {
      item_ativo.classList.add('active');
    }
  }

  /**
   * Exibe a seção correspondente ao nome fornecido
   * @param {string} nome_secao - Nome da seção a exibir
   */
  exibir_secao_correspondente(nome_secao) {
    // Ocultar todas as seções
    document.querySelectorAll('.area-conteudo > section').forEach(secao => {
      secao.classList.add('d-none');
    });
    
    // Mostrar seção específica
    const id_secao = `secao${nome_secao.charAt(0).toUpperCase() + nome_secao.slice(1)}`;
    const secao_destino = document.getElementById(id_secao);
    
    if (secao_destino) {
      secao_destino.classList.remove('d-none');
    } else {
      console.warn(`Seção não encontrada: ${id_secao}`);
    }
  }

  /**
   * Atualiza o título da página conforme a seção
   * @param {string} nome_secao - Nome da seção ativa
   */
  atualizar_titulo_pagina(nome_secao) {
    const titulos_secoes = {
      dashboard: 'Dashboard',
      habilidades: 'Gerenciar Habilidades',
      conquistas: 'Gerenciar Conquistas',
      configuracoes: 'Configurações do Sistema'
    };
    
    const titulo_secao = titulos_secoes[nome_secao] || 'Painel Administrativo';
    
    if (this.elemento_titulo_pagina) {
      this.elemento_titulo_pagina.textContent = titulo_secao;
    }
    
    // Atualizar título do documento
    document.title = `${titulo_secao} - Sistema de Mapeamento de Competências`;
  }

  /**
   * Carrega dados específicos de uma seção se necessário
   * @param {string} nome_secao - Nome da seção
   */
  async carregar_dados_secao(nome_secao) {
    switch (nome_secao) {
      case 'habilidades':
        await this.carregar_dados_secao_habilidades();
        break;
      case 'conquistas':
        await this.carregar_dados_secao_conquistas();
        break;
      case 'dashboard':
        this.atualizar_estatisticas_dashboard();
        break;
    }
  }
  
  // ===== FIM MÉTODOS DE NAVEGAÇÃO =====

  // ===== INÍCIO MÉTODOS DE DASHBOARD =====
  
  /**
   * Atualiza as estatísticas exibidas no dashboard
   */
  atualizar_estatisticas_dashboard() {
    console.log('Atualizando estatísticas do dashboard...');
    
    // Calcular estatísticas de habilidades
    const total_habilidades = this.calcular_total_habilidades();
    const progresso_medio_habilidades = this.calcular_progresso_medio_habilidades();
    
    // Calcular estatísticas de conquistas
    const total_conquistas = this.calcular_total_conquistas();
    const conquistas_desbloqueadas = this.calcular_conquistas_desbloqueadas();
    
    // Atualizar elementos no DOM
    this.atualizar_elemento_estatistica('totalHabilidades', total_habilidades);
    this.atualizar_elemento_estatistica('totalConquistas', total_conquistas);
    this.atualizar_elemento_estatistica('progressoMedio', `${progresso_medio_habilidades}%`);
    
    // Log para debug
    console.log('Estatísticas atualizadas:', {
      total_habilidades,
      total_conquistas,
      progresso_medio_habilidades,
      conquistas_desbloqueadas
    });
  }

  /**
   * Calcula o total de habilidades cadastradas
   * @returns {number} Total de habilidades
   */
  calcular_total_habilidades() {
    if (!this.dados_habilidades_carregadas || !this.dados_habilidades_carregadas.habilidades) {
      return 0;
    }
    return this.dados_habilidades_carregadas.habilidades.length;
  }

  /**
   * Calcula o progresso médio das habilidades
   * @returns {number} Progresso médio (0-100)
   */
  calcular_progresso_medio_habilidades() {
    if (!this.dados_habilidades_carregadas || !this.dados_habilidades_carregadas.estatisticas) {
      return 0;
    }
    return this.dados_habilidades_carregadas.estatisticas.nivel_dominio_medio || 0;
  }

  /**
   * Calcula o total de conquistas cadastradas
   * @returns {number} Total de conquistas
   */
  calcular_total_conquistas() {
    if (!this.dados_conquistas_carregadas) {
      return 0;
    }
    return this.dados_conquistas_carregadas.length;
  }

  /**
   * Calcula quantas conquistas foram desbloqueadas
   * @returns {number} Total de conquistas desbloqueadas
   */
  calcular_conquistas_desbloqueadas() {
    if (!this.dados_conquistas_carregadas) {
      return 0;
    }
    return this.dados_conquistas_carregadas.filter(conquista => conquista.desbloqueada).length;
  }

  /**
   * Atualiza um elemento de estatística no DOM
   * @param {string} id_elemento - ID do elemento
   * @param {string|number} valor - Valor a exibir
   */
  atualizar_elemento_estatistica(id_elemento, valor) {
    const elemento = document.getElementById(id_elemento);
    if (elemento) {
      elemento.textContent = valor;
    }
  }
  
  // ===== FIM MÉTODOS DE DASHBOARD =====

  // ===== INÍCIO MÉTODOS DE HABILIDADES =====
  
  /**
   * Carrega dados específicos da seção de habilidades
   */
  async carregar_dados_secao_habilidades() {
    console.log('Carregando dados da seção de habilidades...');
    
    try {
      this.exibir_indicador_carregamento(true);
      
      // Recarregar dados se necessário
      if (!this.dados_habilidades_carregadas) {
        this.dados_habilidades_carregadas = await this.servico_dados.carregar_dados_habilidades();
      }
      
      // Renderizar tabela de habilidades
      this.renderizar_tabela_habilidades();
      
    } catch (erro_carregamento) {
      console.error('Erro ao carregar dados de habilidades:', erro_carregamento);
      this.exibir_mensagem_erro('Erro ao carregar habilidades', erro_carregamento.message);
    } finally {
      this.exibir_indicador_carregamento(false);
    }
  }

  /**
   * Renderiza a tabela de habilidades
   */
  renderizar_tabela_habilidades() {
    console.log('Renderizando tabela de habilidades...');
    
    const elemento_tabela = document.querySelector('#tabelaHabilidades tbody');
    if (!elemento_tabela) {
      console.error('Elemento da tabela de habilidades não encontrado');
      return;
    }
    
    // Limpar conteúdo existente
    elemento_tabela.innerHTML = '';
    
    if (!this.dados_habilidades_carregadas || !this.dados_habilidades_carregadas.habilidades) {
      elemento_tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma habilidade encontrada</td></tr>';
      return;
    }
    
    // Aplicar filtros se existirem
    const habilidades_filtradas = this.aplicar_filtros_habilidades(this.dados_habilidades_carregadas.habilidades);
    
    // Renderizar cada habilidade
    habilidades_filtradas.forEach(habilidade => {
      const linha_habilidade = this.criar_linha_tabela_habilidade(habilidade);
      elemento_tabela.appendChild(linha_habilidade);
    });
  }

  /**
   * Cria uma linha da tabela para uma habilidade
   * @param {Object} dados_habilidade - Dados da habilidade
   * @returns {HTMLTableRowElement} Linha da tabela
   */
  criar_linha_tabela_habilidade(dados_habilidade) {
    const linha_tabela = document.createElement('tr');
    linha_tabela.setAttribute('data-habilidade-id', dados_habilidade.id);
    
    linha_tabela.innerHTML = `
      <td>${dados_habilidade.id}</td>
      <td>
        <div class="titulo-habilidade">
          <strong>${dados_habilidade.titulo}</strong>
          ${dados_habilidade.descricao ? `<br><small class="text-muted">${dados_habilidade.descricao}</small>` : ''}
        </div>
      </td>
      <td>
        <span class="badge bg-primary">${dados_habilidade.categoria || 'Sem Categoria'}</span>
      </td>
      <td>
        <span class="badge bg-secondary">${dados_habilidade.dominio || 'Sem Domínio'}</span>
      </td>
      <td>
        <div class="barra-progresso">
          <div class="progress">
            <div class="progress-bar" style="width: ${dados_habilidade.nivel_dominio || 0}%"></div>
          </div>
          <small>${dados_habilidade.nivel_dominio || 0}%</small>
        </div>
      </td>
      <td>
        <div class="acoes-habilidade">
          <button class="btn btn-sm btn-outline-primary" onclick="window.aplicacao_admin.editar_habilidade('${dados_habilidade.id}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="window.aplicacao_admin.excluir_habilidade('${dados_habilidade.id}')">
            <i class="bi bi-trash"></i> Excluir
          </button>
        </div>
      </td>
    `;
    
    return linha_tabela;
  }

  /**
   * Aplica filtros às habilidades
   * @param {Array} lista_habilidades - Lista de habilidades
   * @returns {Array} Habilidades filtradas
   */
  aplicar_filtros_habilidades(lista_habilidades) {
    let habilidades_filtradas = [...lista_habilidades];
    
    // Filtro por categoria
    if (this.configuracao_filtros.filtro_categoria_ativo) {
      habilidades_filtradas = habilidades_filtradas.filter(
        h => h.categoria === this.configuracao_filtros.filtro_categoria_ativo
      );
    }
    
    // Filtro por domínio
    if (this.configuracao_filtros.filtro_dominio_ativo) {
      habilidades_filtradas = habilidades_filtradas.filter(
        h => h.dominio === this.configuracao_filtros.filtro_dominio_ativo
      );
    }
    
    // Filtro por texto
    if (this.configuracao_filtros.texto_busca_ativo) {
      const texto_busca = this.configuracao_filtros.texto_busca_ativo.toLowerCase();
      habilidades_filtradas = habilidades_filtradas.filter(
        h => h.titulo.toLowerCase().includes(texto_busca) ||
             (h.descricao && h.descricao.toLowerCase().includes(texto_busca))
      );
    }
    
    return habilidades_filtradas;
  }

  /**
   * Abre formulário para criar nova habilidade
   */
  abrir_formulario_nova_habilidade() {
    console.log('Abrindo formulário para nova habilidade...');
    this.abrir_modal_habilidade(null);
  }

  /**
   * Edita uma habilidade específica
   * @param {string} id_habilidade - ID da habilidade a editar
   */
  editar_habilidade(id_habilidade) {
    console.log(`Editando habilidade: ${id_habilidade}`);
    
    if (!this.dados_habilidades_carregadas || !this.dados_habilidades_carregadas.habilidades) {
      this.exibir_mensagem_erro('Dados de habilidades não carregados');
      return;
    }
    
    const habilidade_encontrada = this.dados_habilidades_carregadas.habilidades.find(
      h => h.id === id_habilidade
    );
    
    if (!habilidade_encontrada) {
      this.exibir_mensagem_erro('Habilidade não encontrada');
      return;
    }
    
    this.abrir_modal_habilidade(habilidade_encontrada);
  }

  /**
   * Exclui uma habilidade específica
   * @param {string} id_habilidade - ID da habilidade a excluir
   */
  async excluir_habilidade(id_habilidade) {
    console.log(`Excluindo habilidade: ${id_habilidade}`);
    
    const confirmacao_exclusao = confirm('Tem certeza que deseja excluir esta habilidade?');
    if (!confirmacao_exclusao) {
      return;
    }
    
    try {
      // TODO: Implementar exclusão no servidor
      console.log('Exclusão de habilidade - implementação pendente');
      
      // Por enquanto, simular exclusão removendo do cache local
      if (this.dados_habilidades_carregadas && this.dados_habilidades_carregadas.habilidades) {
        const indice_habilidade = this.dados_habilidades_carregadas.habilidades.findIndex(
          h => h.id === id_habilidade
        );
        
        if (indice_habilidade !== -1) {
          this.dados_habilidades_carregadas.habilidades.splice(indice_habilidade, 1);
          this.renderizar_tabela_habilidades();
          this.marcar_alteracoes_nao_salvas();
          this.exibir_mensagem_sucesso('Habilidade excluída com sucesso');
        }
      }
      
    } catch (erro_exclusao) {
      console.error('Erro ao excluir habilidade:', erro_exclusao);
      this.exibir_mensagem_erro('Erro ao excluir habilidade', erro_exclusao.message);
    }
  }
  
  // ===== FIM MÉTODOS DE HABILIDADES =====

  // ===== INÍCIO MÉTODOS DE CONQUISTAS =====
  
  /**
   * Carrega dados específicos da seção de conquistas
   */
  async carregar_dados_secao_conquistas() {
    console.log('Carregando dados da seção de conquistas...');
    
    try {
      this.exibir_indicador_carregamento(true);
      
      // Recarregar dados se necessário
      if (!this.dados_conquistas_carregadas) {
        this.dados_conquistas_carregadas = await this.servico_dados.carregar_dados_conquistas();
      }
      
      // Renderizar tabela de conquistas
      this.renderizar_tabela_conquistas();
      
    } catch (erro_carregamento) {
      console.error('Erro ao carregar dados de conquistas:', erro_carregamento);
      this.exibir_mensagem_erro('Erro ao carregar conquistas', erro_carregamento.message);
    } finally {
      this.exibir_indicador_carregamento(false);
    }
  }

  /**
   * Renderiza a tabela de conquistas
   */
  renderizar_tabela_conquistas() {
    console.log('Renderizando tabela de conquistas...');
    
    const elemento_tabela = document.querySelector('#tabelaConquistas tbody');
    if (!elemento_tabela) {
      console.error('Elemento da tabela de conquistas não encontrado');
      return;
    }
    
    // Limpar conteúdo existente
    elemento_tabela.innerHTML = '';
    
    if (!this.dados_conquistas_carregadas) {
      elemento_tabela.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma conquista encontrada</td></tr>';
      return;
    }
    
    // Renderizar cada conquista
    this.dados_conquistas_carregadas.forEach(conquista => {
      const linha_conquista = this.criar_linha_tabela_conquista(conquista);
      elemento_tabela.appendChild(linha_conquista);
    });
  }

  /**
   * Cria uma linha da tabela para uma conquista
   * @param {Object} dados_conquista - Dados da conquista
   * @returns {HTMLTableRowElement} Linha da tabela
   */
  criar_linha_tabela_conquista(dados_conquista) {
    const linha_tabela = document.createElement('tr');
    linha_tabela.setAttribute('data-conquista-id', dados_conquista.id);
    
    linha_tabela.innerHTML = `
      <td>${dados_conquista.id}</td>
      <td>
        <div class="titulo-conquista">
          <strong>${dados_conquista.titulo}</strong>
          ${dados_conquista.descricao ? `<br><small class="text-muted">${dados_conquista.descricao}</small>` : ''}
        </div>
      </td>
      <td>
        <span class="badge bg-info">${dados_conquista.categoria || 'Sem Categoria'}</span>
      </td>
      <td>
        <span class="badge bg-warning">${dados_conquista.dificuldade || 'Não Definida'}</span>
      </td>
      <td>
        <span class="badge ${dados_conquista.desbloqueada ? 'bg-success' : 'bg-secondary'}">
          ${dados_conquista.desbloqueada ? 'Desbloqueada' : 'Bloqueada'}
        </span>
      </td>
      <td>
        <div class="acoes-conquista">
          <button class="btn btn-sm btn-outline-primary" onclick="window.aplicacao_admin.editar_conquista('${dados_conquista.id}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="window.aplicacao_admin.excluir_conquista('${dados_conquista.id}')">
            <i class="bi bi-trash"></i> Excluir
          </button>
        </div>
      </td>
    `;
    
    return linha_tabela;
  }

  /**
   * Abre formulário para criar nova conquista
   */
  abrir_formulario_nova_conquista() {
    console.log('Abrindo formulário para nova conquista...');
    this.abrir_modal_conquista(null);
  }

  /**
   * Edita uma conquista específica
   * @param {string} id_conquista - ID da conquista a editar
   */
  editar_conquista(id_conquista) {
    console.log(`Editando conquista: ${id_conquista}`);
    
    if (!this.dados_conquistas_carregadas) {
      this.exibir_mensagem_erro('Dados de conquistas não carregados');
      return;
    }
    
    const conquista_encontrada = this.dados_conquistas_carregadas.find(
      c => c.id === id_conquista
    );
    
    if (!conquista_encontrada) {
      this.exibir_mensagem_erro('Conquista não encontrada');
      return;
    }
    
    this.abrir_modal_conquista(conquista_encontrada);
  }

  /**
   * Exclui uma conquista específica
   * @param {string} id_conquista - ID da conquista a excluir
   */
  async excluir_conquista(id_conquista) {
    console.log(`Excluindo conquista: ${id_conquista}`);
    
    const confirmacao_exclusao = confirm('Tem certeza que deseja excluir esta conquista?');
    if (!confirmacao_exclusao) {
      return;
    }
    
    try {
      // TODO: Implementar exclusão no servidor
      console.log('Exclusão de conquista - implementação pendente');
      
      // Por enquanto, simular exclusão removendo do cache local
      if (this.dados_conquistas_carregadas) {
        const indice_conquista = this.dados_conquistas_carregadas.findIndex(
          c => c.id === id_conquista
        );
        
        if (indice_conquista !== -1) {
          this.dados_conquistas_carregadas.splice(indice_conquista, 1);
          this.renderizar_tabela_conquistas();
          this.marcar_alteracoes_nao_salvas();
          this.exibir_mensagem_sucesso('Conquista excluída com sucesso');
        }
      }
      
    } catch (erro_exclusao) {
      console.error('Erro ao excluir conquista:', erro_exclusao);
      this.exibir_mensagem_erro('Erro ao excluir conquista', erro_exclusao.message);
    }
  }
  
  // ===== FIM MÉTODOS DE CONQUISTAS =====

  // ===== INÍCIO MÉTODOS DE MODAIS =====
  
  /**
   * Abre modal para edição de habilidade
   * @param {Object|null} dados_habilidade - Dados da habilidade ou null para nova
   */
  abrir_modal_habilidade(dados_habilidade = null) {
    console.log('Abrindo modal de habilidade...');
    
    if (!this.elemento_modal_habilidade) {
      console.error('Modal de habilidade não encontrado');
      return;
    }
    
    // Definir se é edição ou criação
    const modo_edicao = dados_habilidade !== null;
    this.item_sendo_editado = dados_habilidade;
    
    // Atualizar título do modal
    const titulo_modal = document.querySelector('#modalHabilidadeLabel');
    if (titulo_modal) {
      titulo_modal.textContent = modo_edicao ? 'Editar Habilidade' : 'Nova Habilidade';
    }
    
    // Gerar formulário
    this.gerar_formulario_habilidade(dados_habilidade);
    
    // Abrir modal usando Bootstrap
    const modal_bootstrap = new bootstrap.Modal(this.elemento_modal_habilidade);
    modal_bootstrap.show();
  }

  /**
   * Abre modal para edição de conquista
   * @param {Object|null} dados_conquista - Dados da conquista ou null para nova
   */
  abrir_modal_conquista(dados_conquista = null) {
    console.log('Abrindo modal de conquista...');
    
    if (!this.elemento_modal_conquista) {
      console.error('Modal de conquista não encontrado');
      return;
    }
    
    // Definir se é edição ou criação
    const modo_edicao = dados_conquista !== null;
    this.item_sendo_editado = dados_conquista;
    
    // Atualizar título do modal
    const titulo_modal = document.querySelector('#modalConquistaLabel');
    if (titulo_modal) {
      titulo_modal.textContent = modo_edicao ? 'Editar Conquista' : 'Nova Conquista';
    }
    
    // Gerar formulário
    this.gerar_formulario_conquista(dados_conquista);
    
    // Abrir modal usando Bootstrap
    const modal_bootstrap = new bootstrap.Modal(this.elemento_modal_conquista);
    modal_bootstrap.show();
  }

  /**
   * Gera formulário dinâmico para habilidades
   * @param {Object|null} dados_habilidade - Dados da habilidade
   */
  gerar_formulario_habilidade(dados_habilidade) {
    const container_formulario = document.getElementById('formularioHabilidade');
    if (!container_formulario) {
      console.error('Container do formulário de habilidade não encontrado');
      return;
    }
    
    container_formulario.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <label for="tituloHabilidade" class="form-label">Título *</label>
          <input type="text" class="form-control" id="tituloHabilidade" 
                 value="${dados_habilidade?.titulo || ''}" required>
        </div>
        <div class="col-md-6">
          <label for="categoriaHabilidade" class="form-label">Categoria *</label>
          <input type="text" class="form-control" id="categoriaHabilidade" 
                 value="${dados_habilidade?.categoria || ''}" required>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-md-6">
          <label for="dominioHabilidade" class="form-label">Domínio *</label>
          <input type="text" class="form-control" id="dominioHabilidade" 
                 value="${dados_habilidade?.dominio || ''}" required>
        </div>
        <div class="col-md-6">
          <label for="iconeHabilidade" class="form-label">Ícone</label>
          <input type="text" class="form-control" id="iconeHabilidade" 
                 value="${dados_habilidade?.icone || ''}" placeholder="ex: bi-tools">
        </div>
      </div>
      
      <div class="mt-3">
        <label for="descricaoHabilidade" class="form-label">Descrição</label>
        <textarea class="form-control" id="descricaoHabilidade" rows="3">${dados_habilidade?.descricao || ''}</textarea>
      </div>
      
      <div class="mt-3">
        <label for="limiteDesbloqueioHabilidade" class="form-label">Limite de Desbloqueio</label>
        <input type="number" class="form-control" id="limiteDesbloqueioHabilidade" 
               value="${dados_habilidade?.limite_desbloqueio || 0}" min="0" max="100">
      </div>
    `;
  }

  /**
   * Gera formulário dinâmico para conquistas
   * @param {Object|null} dados_conquista - Dados da conquista
   */
  gerar_formulario_conquista(dados_conquista) {
    const container_formulario = document.getElementById('formularioConquista');
    if (!container_formulario) {
      console.error('Container do formulário de conquista não encontrado');
      return;
    }
    
    container_formulario.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <label for="tituloConquista" class="form-label">Título *</label>
          <input type="text" class="form-control" id="tituloConquista" 
                 value="${dados_conquista?.titulo || ''}" required>
        </div>
        <div class="col-md-6">
          <label for="categoriaConquista" class="form-label">Categoria *</label>
          <input type="text" class="form-control" id="categoriaConquista" 
                 value="${dados_conquista?.categoria || ''}" required>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-md-6">
          <label for="dificuldadeConquista" class="form-label">Dificuldade</label>
          <select class="form-control" id="dificuldadeConquista">
            <option value="Fácil" ${dados_conquista?.dificuldade === 'Fácil' ? 'selected' : ''}>Fácil</option>
            <option value="Média" ${dados_conquista?.dificuldade === 'Média' ? 'selected' : ''}>Média</option>
            <option value="Difícil" ${dados_conquista?.dificuldade === 'Difícil' ? 'selected' : ''}>Difícil</option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="imagemConquista" class="form-label">Imagem</label>
          <input type="text" class="form-control" id="imagemConquista" 
                 value="${dados_conquista?.imagem || ''}" placeholder="Caminho da imagem">
        </div>
      </div>
      
      <div class="mt-3">
        <label for="descricaoConquista" class="form-label">Descrição</label>
        <textarea class="form-control" id="descricaoConquista" rows="3">${dados_conquista?.descricao || ''}</textarea>
      </div>
      
      <div class="mt-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="desbloqueadaConquista" 
                 ${dados_conquista?.desbloqueada ? 'checked' : ''}>
          <label class="form-check-label" for="desbloqueadaConquista">
            Conquista Desbloqueada
          </label>
        </div>
      </div>
    `;
  }
  
  // ===== FIM MÉTODOS DE MODAIS =====

  // ===== INÍCIO MÉTODOS DE SALVAMENTO =====
  
  /**
   * Salva habilidade editada no modal
   */
  async salvar_habilidade_editada() {
    console.log('Salvando habilidade editada...');
    
    try {
      // Coletar dados do formulário
      const dados_formulario = this.coletar_dados_formulario_habilidade();
      
      // Validar dados
      if (!this.validar_dados_habilidade(dados_formulario)) {
        return;
      }
      
      // Determinar se é criação ou edição
      const modo_edicao = this.item_sendo_editado !== null;
      
      if (modo_edicao) {
        await this.atualizar_habilidade_existente(dados_formulario);
      } else {
        await this.criar_nova_habilidade(dados_formulario);
      }
      
      // Fechar modal
      const modal_bootstrap = bootstrap.Modal.getInstance(this.elemento_modal_habilidade);
      modal_bootstrap.hide();
      
      // Atualizar interface
      this.renderizar_tabela_habilidades();
      this.marcar_alteracoes_nao_salvas();
      
      this.exibir_mensagem_sucesso('Habilidade salva com sucesso');
      
    } catch (erro_salvamento) {
      console.error('Erro ao salvar habilidade:', erro_salvamento);
      this.exibir_mensagem_erro('Erro ao salvar habilidade', erro_salvamento.message);
    }
  }

  /**
   * Salva conquista editada no modal
   */
  async salvar_conquista_editada() {
    console.log('Salvando conquista editada...');
    
    try {
      // Coletar dados do formulário
      const dados_formulario = this.coletar_dados_formulario_conquista();
      
      // Validar dados
      if (!this.validar_dados_conquista(dados_formulario)) {
        return;
      }
      
      // Determinar se é criação ou edição
      const modo_edicao = this.item_sendo_editado !== null;
      
      if (modo_edicao) {
        await this.atualizar_conquista_existente(dados_formulario);
      } else {
        await this.criar_nova_conquista(dados_formulario);
      }
      
      // Fechar modal
      const modal_bootstrap = bootstrap.Modal.getInstance(this.elemento_modal_conquista);
      modal_bootstrap.hide();
      
      // Atualizar interface
      this.renderizar_tabela_conquistas();
      this.marcar_alteracoes_nao_salvas();
      
      this.exibir_mensagem_sucesso('Conquista salva com sucesso');
      
    } catch (erro_salvamento) {
      console.error('Erro ao salvar conquista:', erro_salvamento);
      this.exibir_mensagem_erro('Erro ao salvar conquista', erro_salvamento.message);
    }
  }

  /**
   * Coleta dados do formulário de habilidade
   * @returns {Object} Dados coletados
   */
  coletar_dados_formulario_habilidade() {
    return {
      id: this.item_sendo_editado?.id || this.gerar_id_unico(),
      titulo: document.getElementById('tituloHabilidade')?.value?.trim() || '',
      categoria: document.getElementById('categoriaHabilidade')?.value?.trim() || '',
      dominio: document.getElementById('dominioHabilidade')?.value?.trim() || '',
      icone: document.getElementById('iconeHabilidade')?.value?.trim() || '',
      descricao: document.getElementById('descricaoHabilidade')?.value?.trim() || '',
      limite_desbloqueio: parseInt(document.getElementById('limiteDesbloqueioHabilidade')?.value) || 0,
      timestamp_atualizacao: Date.now()
    };
  }

  /**
   * Coleta dados do formulário de conquista
   * @returns {Object} Dados coletados
   */
  coletar_dados_formulario_conquista() {
    return {
      id: this.item_sendo_editado?.id || this.gerar_id_unico(),
      titulo: document.getElementById('tituloConquista')?.value?.trim() || '',
      categoria: document.getElementById('categoriaConquista')?.value?.trim() || '',
      dificuldade: document.getElementById('dificuldadeConquista')?.value || '',
      imagem: document.getElementById('imagemConquista')?.value?.trim() || '',
      descricao: document.getElementById('descricaoConquista')?.value?.trim() || '',
      desbloqueada: document.getElementById('desbloqueadaConquista')?.checked || false,
      timestamp_atualizacao: Date.now()
    };
  }

  /**
   * Valida dados de habilidade
   * @param {Object} dados_habilidade - Dados a validar
   * @returns {boolean} True se válido
   */
  validar_dados_habilidade(dados_habilidade) {
    if (!dados_habilidade.titulo) {
      this.exibir_mensagem_erro('Título é obrigatório');
      return false;
    }
    
    if (!dados_habilidade.categoria) {
      this.exibir_mensagem_erro('Categoria é obrigatória');
      return false;
    }
    
    if (!dados_habilidade.dominio) {
      this.exibir_mensagem_erro('Domínio é obrigatório');
      return false;
    }
    
    return true;
  }

  /**
   * Valida dados de conquista
   * @param {Object} dados_conquista - Dados a validar
   * @returns {boolean} True se válido
   */
  validar_dados_conquista(dados_conquista) {
    if (!dados_conquista.titulo) {
      this.exibir_mensagem_erro('Título é obrigatório');
      return false;
    }
    
    if (!dados_conquista.categoria) {
      this.exibir_mensagem_erro('Categoria é obrigatória');
      return false;
    }
    
    return true;
  }

  /**
   * Salva todas as alterações pendentes
   */
  async salvar_todas_alteracoes() {
    console.log('Salvando todas as alterações...');
    
    try {
      this.exibir_indicador_carregamento(true);
      
      // TODO: Implementar salvamento no servidor
      console.log('Salvamento completo - implementação pendente');
      
      // Simular salvamento bem-sucedido
      this.alteracoes_nao_salvas = false;
      this.exibir_mensagem_sucesso('Todas as alterações foram salvas');
      
    } catch (erro_salvamento) {
      console.error('Erro ao salvar alterações:', erro_salvamento);
      this.exibir_mensagem_erro('Erro ao salvar alterações', erro_salvamento.message);
    } finally {
      this.exibir_indicador_carregamento(false);
    }
  }
  
  // ===== FIM MÉTODOS DE SALVAMENTO =====

  // ===== INÍCIO MÉTODOS DE UTILIDADE =====
  
  /**
   * Gera um ID único para novos itens
   * @returns {string} ID único
   */
  gerar_id_unico() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Marca que existem alterações não salvas
   */
  marcar_alteracoes_nao_salvas() {
    this.alteracoes_nao_salvas = true;
  }

  /**
   * Confirma navegação quando há alterações não salvas
   * @returns {boolean} True se deve prosseguir com navegação
   */
  confirmar_navegacao_com_alteracoes() {
    return confirm('Existem alterações não salvas. Deseja continuar?');
  }

  /**
   * Verifica alterações não salvas antes de sair
   * @param {Event} evento - Evento beforeunload
   */
  verificar_alteracoes_nao_salvas(evento) {
    if (this.alteracoes_nao_salvas) {
      evento.preventDefault();
      evento.returnValue = 'Existem alterações não salvas. Tem certeza que deseja sair?';
      return evento.returnValue;
    }
  }

  /**
   * Alterna visibilidade do menu lateral
   */
  alternar_menu_lateral() {
    if (this.elemento_barra_navegacao) {
      this.elemento_barra_navegacao.classList.toggle('aberta');
    }
  }

  /**
   * Configura interface responsiva
   */
  configurar_interface_responsiva() {
    // TODO: Implementar configurações responsivas específicas
    console.log('Configurando interface responsiva...');
  }

  /**
   * Aplica tema da interface
   */
  aplicar_tema_interface() {
    // TODO: Implementar sistema de temas
    console.log('Aplicando tema da interface...');
  }

  /**
   * Exporta dados do sistema
   */
  async exportar_dados_sistema() {
    console.log('Exportando dados do sistema...');
    
    try {
      const dados_exportacao = {
        habilidades: this.dados_habilidades_carregadas,
        conquistas: this.dados_conquistas_carregadas,
        timestamp_exportacao: new Date().toISOString()
      };
      
      const dados_json = JSON.stringify(dados_exportacao, null, 2);
      const blob_dados = new Blob([dados_json], { type: 'application/json' });
      
      // Criar link de download
      const link_download = document.createElement('a');
      link_download.href = URL.createObjectURL(blob_dados);
      link_download.download = `competencias_exportacao_${new Date().toISOString().split('T')[0]}.json`;
      
      // Simular clique para download
      document.body.appendChild(link_download);
      link_download.click();
      document.body.removeChild(link_download);
      
      this.exibir_mensagem_sucesso('Dados exportados com sucesso');
      
    } catch (erro_exportacao) {
      console.error('Erro ao exportar dados:', erro_exportacao);
      this.exibir_mensagem_erro('Erro ao exportar dados', erro_exportacao.message);
    }
  }

  /**
   * Exibe indicador de carregamento
   * @param {boolean} mostrar - Se deve mostrar ou ocultar
   */
  exibir_indicador_carregamento(mostrar) {
    // TODO: Implementar indicador visual de carregamento
    if (mostrar) {
      console.log('Carregando...');
    } else {
      console.log('Carregamento concluído');
    }
  }

  /**
   * Exibe mensagem de sucesso
   * @param {string} mensagem_sucesso - Mensagem a exibir
   */
  exibir_mensagem_sucesso(mensagem_sucesso) {
    console.log('Sucesso:', mensagem_sucesso);
    // TODO: Implementar toast ou notification system
  }

  /**
   * Exibe mensagem de erro
   * @param {string} titulo_erro - Título do erro
   * @param {string} detalhes_erro - Detalhes do erro
   */
  exibir_mensagem_erro(titulo_erro, detalhes_erro = '') {
    console.error(`Erro: ${titulo_erro}`, detalhes_erro);
    // TODO: Implementar toast ou notification system
    alert(`${titulo_erro}${detalhes_erro ? '\n\nDetalhes: ' + detalhes_erro : ''}`);
  }

  /**
   * Processa teclas de atalho
   * @param {KeyboardEvent} evento_teclado - Evento de teclado
   */
  processar_teclas_atalho(evento_teclado) {
    // Ctrl+S para salvar
    if (evento_teclado.ctrlKey && evento_teclado.key === 's') {
      evento_teclado.preventDefault();
      this.salvar_todas_alteracoes();
    }
    
    // Escape para fechar modais
    if (evento_teclado.key === 'Escape') {
      // Bootstrap já cuida disso, mas podemos adicionar lógica extra se necessário
    }
  }

  /**
   * Processa submissão de formulários
   * @param {HTMLFormElement} elemento_formulario - Formulário submetido
   */
  processar_submissao_formulario(elemento_formulario) {
    const id_formulario = elemento_formulario.id;
    
    switch (id_formulario) {
      case 'formularioHabilidade':
        this.salvar_habilidade_editada();
        break;
      case 'formularioConquista':
        this.salvar_conquista_editada();
        break;
      default:
        console.warn(`Formulário não reconhecido: ${id_formulario}`);
    }
  }
  
  // ===== FIM MÉTODOS DE UTILIDADE =====
}

// ===== FIM APLICAÇÃO PAINEL ADMINISTRATIVO - SISTEMA DE MAPEAMENTO DE COMPETÊNCIAS =====

// Inicializar aplicação quando script carregar
if (typeof window !== 'undefined') {
  // Expor classe globalmente
  window.AplicacaoPainelAdministrativo = AplicacaoPainelAdministrativo;
  
  // Criar instância global
  window.aplicacao_admin = new AplicacaoPainelAdministrativo();
}
