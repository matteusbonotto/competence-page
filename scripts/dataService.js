// ===== INÍCIO SERVIÇO DE DADOS - SISTEMA DE MAPEAMENTO DE COMPETÊNCIAS =====

/**
 * Classe responsável por gerenciar o carregamento, cache e manipulação de dados
 * de habilidades e conquistas do sistema de mapeamento de competências.
 */
class ServicoDeServico {
  constructor() {
    console.log('Inicializando Serviço de Dados...');
    
    // ===== INÍCIO PROPRIEDADES DE ESTADO =====
    this.cache_dados_habilidades = null;
    this.cache_dados_conquistas = null;
    this.carregamento_em_progresso = false;
    this.timestamp_ultimo_carregamento = null;
    this.duracao_cache_em_milissegundos = 5 * 60 * 1000; // 5 minutos
    // ===== FIM PROPRIEDADES DE ESTADO =====
    
    // ===== INÍCIO CONFIGURAÇÕES DE ENDPOINTS =====
    this.endpoint_base_api = window.location.origin;
    this.caminho_dados_habilidades = '/data/habilidades.json';
    this.caminho_dados_conquistas = '/data/conquistas.json';
    this.endpoint_upload_imagem = '/upload';
    // ===== FIM CONFIGURAÇÕES DE ENDPOINTS =====
    
    // ===== INÍCIO CONFIGURAÇÕES DE REQUISIÇÃO =====
    this.timeout_requisicao_milissegundos = 10000; // 10 segundos
    this.numero_tentativas_maximas = 3;
    this.delay_entre_tentativas_milissegundos = 1000; // 1 segundo
    // ===== FIM CONFIGURAÇÕES DE REQUISIÇÃO =====
  }

  // ===== INÍCIO MÉTODOS DE CARREGAMENTO DE DADOS =====
  
  /**
   * Carrega dados de habilidades do servidor ou cache
   * @returns {Promise<Array>} Array com dados das habilidades
   */
  async carregar_dados_habilidades() {
    console.log('Carregando dados de habilidades...');
    
    if (this.dados_cache_valido() && this.cache_dados_habilidades) {
      console.log('Usando dados de habilidades do cache');
      return this.cache_dados_habilidades;
    }
    
    try {
      const resposta = await this.fazer_requisicao_com_retry(this.caminho_dados_habilidades);
      
      if (!resposta.ok) {
        throw new Error(`Erro ao carregar habilidades: ${resposta.status} - ${resposta.statusText}`);
      }
      
      const dados_json = await resposta.json();
      
      // Validar estrutura dos dados
      if (!this.validar_estrutura_habilidades(dados_json)) {
        throw new Error('Estrutura de dados de habilidades inválida');
      }
      
      // Processar e formatar dados
      const dados_processados = this.processar_dados_habilidades(dados_json);
      
      // Atualizar cache
      this.cache_dados_habilidades = dados_processados;
      this.timestamp_ultimo_carregamento = Date.now();
      
      console.log(`Carregadas ${dados_processados.habilidades?.length || 0} habilidades`);
      return dados_processados;
      
    } catch (erro_carregamento) {
      console.error('Erro ao carregar dados de habilidades:', erro_carregamento);
      
      // Tentar usar cache antigo se disponível
      if (this.cache_dados_habilidades) {
        console.warn('Usando cache antigo de habilidades devido ao erro');
        return this.cache_dados_habilidades;
      }
      
      throw erro_carregamento;
    }
  }

  /**
   * Carrega dados de conquistas do servidor ou cache
   * @returns {Promise<Array>} Array com dados das conquistas
   */
  async carregar_dados_conquistas() {
    console.log('Carregando dados de conquistas...');
    
    if (this.dados_cache_valido() && this.cache_dados_conquistas) {
      console.log('Usando dados de conquistas do cache');
      return this.cache_dados_conquistas;
    }
    
    try {
      const resposta = await this.fazer_requisicao_com_retry(this.caminho_dados_conquistas);
      
      if (!resposta.ok) {
        throw new Error(`Erro ao carregar conquistas: ${resposta.status} - ${resposta.statusText}`);
      }
      
      const dados_json = await resposta.json();
      
      // Validar estrutura dos dados
      if (!this.validar_estrutura_conquistas(dados_json)) {
        throw new Error('Estrutura de dados de conquistas inválida');
      }
      
      // Processar e formatar dados
      const dados_processados = this.processar_dados_conquistas(dados_json);
      
      // Atualizar cache
      this.cache_dados_conquistas = dados_processados;
      this.timestamp_ultimo_carregamento = Date.now();
      
      console.log(`Carregadas ${dados_processados.length || 0} conquistas`);
      return dados_processados;
      
    } catch (erro_carregamento) {
      console.error('Erro ao carregar dados de conquistas:', erro_carregamento);
      
      // Tentar usar cache antigo se disponível
      if (this.cache_dados_conquistas) {
        console.warn('Usando cache antigo de conquistas devido ao erro');
        return this.cache_dados_conquistas;
      }
      
      throw erro_carregamento;
    }
  }

  /**
   * Carrega todos os dados necessários para a aplicação
   * @returns {Promise<Object>} Objeto com habilidades e conquistas
   */
  async carregar_todos_dados() {
    console.log('Carregando todos os dados da aplicação...');
    
    try {
      this.carregamento_em_progresso = true;
      
      const [dados_habilidades, dados_conquistas] = await Promise.all([
        this.carregar_dados_habilidades(),
        this.carregar_dados_conquistas()
      ]);
      
      const resultado_completo = {
        habilidades: dados_habilidades,
        conquistas: dados_conquistas,
        timestamp_carregamento: Date.now()
      };
      
      console.log('Todos os dados carregados com sucesso');
      return resultado_completo;
      
    } catch (erro_carregamento_completo) {
      console.error('Erro ao carregar todos os dados:', erro_carregamento_completo);
      throw erro_carregamento_completo;
    } finally {
      this.carregamento_em_progresso = false;
    }
  }
  
  // ===== FIM MÉTODOS DE CARREGAMENTO DE DADOS =====

  // ===== INÍCIO MÉTODOS DE VALIDAÇÃO =====
  
  /**
   * Valida se a estrutura dos dados de habilidades está correta
   * @param {Object} dados_habilidades - Dados a serem validados
   * @returns {boolean} True se válido, false caso contrário
   */
  validar_estrutura_habilidades(dados_habilidades) {
    if (!dados_habilidades || typeof dados_habilidades !== 'object') {
      console.error('Dados de habilidades não são um objeto válido');
      return false;
    }
    
    if (!Array.isArray(dados_habilidades.habilidades)) {
      console.error('Campo "habilidades" deve ser um array');
      return false;
    }
    
    // Validar campos obrigatórios de cada habilidade
    const campos_obrigatorios_habilidade = ['id', 'titulo', 'categoria', 'dominio'];
    
    for (const habilidade of dados_habilidades.habilidades) {
      if (!this.validar_campos_obrigatorios(habilidade, campos_obrigatorios_habilidade)) {
        console.error(`Habilidade inválida:`, habilidade);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Valida se a estrutura dos dados de conquistas está correta
   * @param {Array} dados_conquistas - Dados a serem validados
   * @returns {boolean} True se válido, false caso contrário
   */
  validar_estrutura_conquistas(dados_conquistas) {
    if (!Array.isArray(dados_conquistas)) {
      console.error('Dados de conquistas devem ser um array');
      return false;
    }
    
    // Validar campos obrigatórios de cada conquista
    const campos_obrigatorios_conquista = ['id', 'titulo', 'categoria'];
    
    for (const conquista of dados_conquistas) {
      if (!this.validar_campos_obrigatorios(conquista, campos_obrigatorios_conquista)) {
        console.error(`Conquista inválida:`, conquista);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Valida se um objeto possui todos os campos obrigatórios
   * @param {Object} objeto - Objeto a ser validado
   * @param {Array} campos_obrigatorios - Lista de campos obrigatórios
   * @returns {boolean} True se válido, false caso contrário
   */
  validar_campos_obrigatorios(objeto, campos_obrigatorios) {
    return campos_obrigatorios.every(campo => {
      const possui_campo = objeto.hasOwnProperty(campo) && objeto[campo] !== null && objeto[campo] !== undefined;
      if (!possui_campo) {
        console.error(`Campo obrigatório "${campo}" ausente ou inválido`);
      }
      return possui_campo;
    });
  }
  
  // ===== FIM MÉTODOS DE VALIDAÇÃO =====

  // ===== INÍCIO MÉTODOS DE PROCESSAMENTO =====
  
  /**
   * Processa e enriquece dados de habilidades
   * @param {Object} dados_brutos - Dados brutos das habilidades
   * @returns {Object} Dados processados
   */
  processar_dados_habilidades(dados_brutos) {
    console.log('Processando dados de habilidades...');
    
    const dados_processados = { ...dados_brutos };
    
    // Processar cada habilidade individualmente
    dados_processados.habilidades = dados_brutos.habilidades.map(habilidade => {
      return this.processar_habilidade_individual(habilidade);
    });
    
    // Calcular estatísticas gerais
    dados_processados.estatisticas = this.calcular_estatisticas_habilidades(dados_processados.habilidades);
    
    // Criar índices para busca rápida
    dados_processados.indices = this.criar_indices_habilidades(dados_processados.habilidades);
    
    return dados_processados;
  }

  /**
   * Processa uma habilidade individual
   * @param {Object} habilidade - Dados da habilidade
   * @returns {Object} Habilidade processada
   */
  processar_habilidade_individual(habilidade) {
    const habilidade_processada = { ...habilidade };
    
    // Garantir que pontuacoes seja um objeto
    if (!habilidade_processada.pontuacoes || typeof habilidade_processada.pontuacoes !== 'object') {
      habilidade_processada.pontuacoes = {};
    }
    
    // Calcular nível de domínio
    habilidade_processada.nivel_dominio = this.calcular_nivel_dominio(habilidade_processada.pontuacoes);
    
    // Adicionar timestamp de última atualização se não existir
    if (!habilidade_processada.timestamp_atualizacao) {
      habilidade_processada.timestamp_atualizacao = Date.now();
    }
    
    // Processar filhos se existirem
    if (Array.isArray(habilidade_processada.filhos)) {
      habilidade_processada.filhos = habilidade_processada.filhos.map(filho => 
        this.processar_habilidade_individual(filho)
      );
    }
    
    return habilidade_processada;
  }

  /**
   * Processa e enriquece dados de conquistas
   * @param {Array} dados_brutos - Dados brutos das conquistas
   * @returns {Array} Dados processados
   */
  processar_dados_conquistas(dados_brutos) {
    console.log('Processando dados de conquistas...');
    
    return dados_brutos.map(conquista => {
      const conquista_processada = { ...conquista };
      
      // Garantir que data de criação existe
      if (!conquista_processada.data_criacao) {
        conquista_processada.data_criacao = new Date().toISOString();
      }
      
      // Calcular status de desbloqueio baseado em critérios
      conquista_processada.desbloqueada = this.verificar_conquista_desbloqueada(conquista_processada);
      
      // Normalizar caminhos de imagem
      if (conquista_processada.imagem && !conquista_processada.imagem.startsWith('http')) {
        conquista_processada.imagem = `assets/achievements/${conquista_processada.imagem}`;
      }
      
      return conquista_processada;
    });
  }
  
  // ===== FIM MÉTODOS DE PROCESSAMENTO =====

  // ===== INÍCIO MÉTODOS DE CÁLCULO E ESTATÍSTICAS =====
  
  /**
   * Calcula o nível de domínio baseado nas pontuações
   * @param {Object} pontuacoes - Objeto com pontuações da habilidade
   * @returns {number} Nível de domínio (0-100)
   */
  calcular_nivel_dominio(pontuacoes) {
    if (!pontuacoes || typeof pontuacoes !== 'object') {
      return 0;
    }
    
    const valores_pontuacao = Object.values(pontuacoes);
    if (valores_pontuacao.length === 0) {
      return 0;
    }
    
    const soma_pontuacoes = valores_pontuacao.reduce((total, valor) => total + (Number(valor) || 0), 0);
    const media_pontuacao = soma_pontuacoes / valores_pontuacao.length;
    
    // Normalizar para escala 0-100
    return Math.min(100, Math.max(0, Math.round(media_pontuacao)));
  }

  /**
   * Calcula estatísticas gerais das habilidades
   * @param {Array} lista_habilidades - Lista de habilidades
   * @returns {Object} Estatísticas calculadas
   */
  calcular_estatisticas_habilidades(lista_habilidades) {
    const total_habilidades = lista_habilidades.length;
    const niveis_dominio = lista_habilidades.map(h => h.nivel_dominio || 0);
    
    const nivel_medio = niveis_dominio.length > 0 
      ? niveis_dominio.reduce((soma, nivel) => soma + nivel, 0) / niveis_dominio.length 
      : 0;
    
    const distribuicao_por_categoria = {};
    lista_habilidades.forEach(habilidade => {
      const categoria = habilidade.categoria || 'Sem Categoria';
      distribuicao_por_categoria[categoria] = (distribuicao_por_categoria[categoria] || 0) + 1;
    });
    
    return {
      total_habilidades,
      nivel_dominio_medio: Math.round(nivel_medio),
      nivel_dominio_maximo: Math.max(...niveis_dominio, 0),
      nivel_dominio_minimo: Math.min(...niveis_dominio, 100),
      distribuicao_por_categoria,
      timestamp_calculo: Date.now()
    };
  }

  /**
   * Verifica se uma conquista foi desbloqueada
   * @param {Object} conquista - Dados da conquista
   * @returns {boolean} True se desbloqueada, false caso contrário
   */
  verificar_conquista_desbloqueada(conquista) {
    // Implementação básica - pode ser expandida conforme critérios específicos
    if (conquista.criterios_desbloqueio) {
      // TODO: Implementar lógica de verificação de critérios
      return false;
    }
    
    // Por padrão, considerar não desbloqueada
    return false;
  }
  
  // ===== FIM MÉTODOS DE CÁLCULO E ESTATÍSTICAS =====

  // ===== INÍCIO MÉTODOS DE CACHE E PERFORMANCE =====
  
  /**
   * Verifica se os dados em cache ainda são válidos
   * @returns {boolean} True se válido, false caso contrário
   */
  dados_cache_valido() {
    if (!this.timestamp_ultimo_carregamento) {
      return false;
    }
    
    const tempo_decorrido = Date.now() - this.timestamp_ultimo_carregamento;
    return tempo_decorrido < this.duracao_cache_em_milissegundos;
  }

  /**
   * Limpa todo o cache de dados
   */
  limpar_cache() {
    console.log('Limpando cache de dados...');
    this.cache_dados_habilidades = null;
    this.cache_dados_conquistas = null;
    this.timestamp_ultimo_carregamento = null;
  }

  /**
   * Força recarregamento de todos os dados
   * @returns {Promise<Object>} Dados recarregados
   */
  async forcar_recarregamento() {
    console.log('Forçando recarregamento de dados...');
    this.limpar_cache();
    return await this.carregar_todos_dados();
  }
  
  // ===== FIM MÉTODOS DE CACHE E PERFORMANCE =====

  // ===== INÍCIO MÉTODOS DE REQUISIÇÃO HTTP =====
  
  /**
   * Faz uma requisição HTTP com retry automático
   * @param {string} caminho_endpoint - Caminho do endpoint
   * @param {Object} opcoes_requisicao - Opções da requisição
   * @returns {Promise<Response>} Resposta da requisição
   */
  async fazer_requisicao_com_retry(caminho_endpoint, opcoes_requisicao = {}) {
    const url_completa = `${this.endpoint_base_api}${caminho_endpoint}`;
    
    const opcoes_padrao = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...opcoes_requisicao
    };
    
    let ultima_tentativa_erro = null;
    
    for (let numero_tentativa = 1; numero_tentativa <= this.numero_tentativas_maximas; numero_tentativa++) {
      try {
        console.log(`Tentativa ${numero_tentativa}/${this.numero_tentativas_maximas} para ${caminho_endpoint}`);
        
        const controller_timeout = new AbortController();
        const timeout_id = setTimeout(() => controller_timeout.abort(), this.timeout_requisicao_milissegundos);
        
        const resposta = await fetch(url_completa, {
          ...opcoes_padrao,
          signal: controller_timeout.signal
        });
        
        clearTimeout(timeout_id);
        return resposta;
        
      } catch (erro_requisicao) {
        ultima_tentativa_erro = erro_requisicao;
        console.warn(`Tentativa ${numero_tentativa} falhou:`, erro_requisicao.message);
        
        // Se não é a última tentativa, aguardar antes da próxima
        if (numero_tentativa < this.numero_tentativas_maximas) {
          await this.aguardar_delay(this.delay_entre_tentativas_milissegundos * numero_tentativa);
        }
      }
    }
    
    throw new Error(`Falha após ${this.numero_tentativas_maximas} tentativas: ${ultima_tentativa_erro.message}`);
  }

  /**
   * Aguarda um delay especificado
   * @param {number} milissegundos - Tempo a aguardar
   * @returns {Promise<void>}
   */
  async aguardar_delay(milissegundos) {
    return new Promise(resolver => setTimeout(resolver, milissegundos));
  }
  
  // ===== FIM MÉTODOS DE REQUISIÇÃO HTTP =====

  // ===== INÍCIO MÉTODOS DE BUSCA E FILTROS =====
  
  /**
   * Cria índices para busca rápida de habilidades
   * @param {Array} lista_habilidades - Lista de habilidades
   * @returns {Object} Índices criados
   */
  criar_indices_habilidades(lista_habilidades) {
    const indices = {
      por_id: {},
      por_categoria: {},
      por_dominio: {},
      por_titulo: {}
    };
    
    lista_habilidades.forEach(habilidade => {
      // Índice por ID
      indices.por_id[habilidade.id] = habilidade;
      
      // Índice por categoria
      const categoria = habilidade.categoria || 'Sem Categoria';
      if (!indices.por_categoria[categoria]) {
        indices.por_categoria[categoria] = [];
      }
      indices.por_categoria[categoria].push(habilidade);
      
      // Índice por domínio
      const dominio = habilidade.dominio || 'Sem Domínio';
      if (!indices.por_dominio[dominio]) {
        indices.por_dominio[dominio] = [];
      }
      indices.por_dominio[dominio].push(habilidade);
      
      // Índice por título (para busca textual)
      const titulo_normalizado = habilidade.titulo.toLowerCase();
      indices.por_titulo[titulo_normalizado] = habilidade;
    });
    
    return indices;
  }

  /**
   * Busca habilidades por critérios específicos
   * @param {Object} criterios_busca - Critérios de busca
   * @returns {Array} Habilidades encontradas
   */
  buscar_habilidades(criterios_busca = {}) {
    if (!this.cache_dados_habilidades || !this.cache_dados_habilidades.indices) {
      console.warn('Cache de habilidades ou índices não disponíveis para busca');
      return [];
    }
    
    const { categoria, dominio, texto_titulo, nivel_minimo } = criterios_busca;
    let resultados = this.cache_dados_habilidades.habilidades;
    
    // Filtrar por categoria
    if (categoria) {
      resultados = this.cache_dados_habilidades.indices.por_categoria[categoria] || [];
    }
    
    // Filtrar por domínio
    if (dominio) {
      resultados = resultados.filter(h => h.dominio === dominio);
    }
    
    // Filtrar por texto no título
    if (texto_titulo) {
      const texto_normalizado = texto_titulo.toLowerCase();
      resultados = resultados.filter(h => 
        h.titulo.toLowerCase().includes(texto_normalizado)
      );
    }
    
    // Filtrar por nível mínimo de domínio
    if (nivel_minimo !== undefined) {
      resultados = resultados.filter(h => (h.nivel_dominio || 0) >= nivel_minimo);
    }
    
    return resultados;
  }
  
  // ===== FIM MÉTODOS DE BUSCA E FILTROS =====

  // ===== INÍCIO MÉTODOS DE UPLOAD =====
  
  /**
   * Faz upload de uma imagem para o servidor
   * @param {File} arquivo_imagem - Arquivo de imagem
   * @param {string} nome_personalizado - Nome personalizado para o arquivo
   * @returns {Promise<Object>} Resultado do upload
   */
  async fazer_upload_imagem(arquivo_imagem, nome_personalizado = null) {
    console.log('Iniciando upload de imagem...');
    
    if (!arquivo_imagem || !arquivo_imagem.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem válida');
    }
    
    const dados_formulario = new FormData();
    dados_formulario.append('achievement', arquivo_imagem);
    
    if (nome_personalizado) {
      dados_formulario.append('customName', nome_personalizado);
    }
    
    try {
      const resposta = await this.fazer_requisicao_com_retry(this.endpoint_upload_imagem, {
        method: 'POST',
        body: dados_formulario,
        headers: {} // Deixar o browser definir Content-Type para FormData
      });
      
      if (!resposta.ok) {
        throw new Error(`Erro no upload: ${resposta.status} - ${resposta.statusText}`);
      }
      
      const resultado_upload = await resposta.json();
      console.log('Upload concluído com sucesso:', resultado_upload);
      
      return resultado_upload;
      
    } catch (erro_upload) {
      console.error('Erro no upload de imagem:', erro_upload);
      throw erro_upload;
    }
  }
  
  // ===== FIM MÉTODOS DE UPLOAD =====

  // ===== INÍCIO MÉTODOS DE UTILIDADE =====
  
  /**
   * Obtém informações sobre o estado atual do serviço
   * @returns {Object} Estado do serviço
   */
  obter_estado_servico() {
    return {
      cache_habilidades_disponivel: !!this.cache_dados_habilidades,
      cache_conquistas_disponivel: !!this.cache_dados_conquistas,
      carregamento_em_progresso: this.carregamento_em_progresso,
      timestamp_ultimo_carregamento: this.timestamp_ultimo_carregamento,
      cache_valido: this.dados_cache_valido(),
      tempo_ate_expiracao_cache: this.timestamp_ultimo_carregamento 
        ? Math.max(0, (this.timestamp_ultimo_carregamento + this.duracao_cache_em_milissegundos) - Date.now())
        : 0
    };
  }

  /**
   * Registra listener para eventos de mudança de dados
   * @param {Function} callback_listener - Função a ser chamada quando dados mudarem
   */
  registrar_listener_mudanca_dados(callback_listener) {
    if (typeof callback_listener !== 'function') {
      throw new Error('Listener deve ser uma função');
    }
    
    // TODO: Implementar sistema de eventos para notificar mudanças
    console.log('Listener de mudança de dados registrado');
  }
  
  // ===== FIM MÉTODOS DE UTILIDADE =====
}

// ===== FIM SERVIÇO DE DADOS - SISTEMA DE MAPEAMENTO DE COMPETÊNCIAS =====

// Expor classe globalmente se não estiver em ambiente de módulos
if (typeof module === 'undefined') {
  window.ServicoDeServico = ServicoDeServico;
}
