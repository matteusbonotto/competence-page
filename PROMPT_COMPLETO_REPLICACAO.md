# 🎯 PROMPT COMPLETO - SISTEMA DE MAPEAMENTO DE COMPETÊNCIAS RPG

## 📋 VISÃO GERAL
Crie uma aplicação web completa de **Sistema de Mapeamento de Competências RPG** com interface moderna, sistema de árvore de habilidades interativo, sistema de conquistas/achievements e layout totalmente responsivo.

## 🏗️ ESTRUTURA DE ARQUIVOS

```
projeto/
├── index.html
├── README.md
├── assets/
├── data/
│   ├── skills.json
│   └── achievements.json
├── scripts/
│   ├── main.js
│   ├── dataService.js
│   └── tree.js
└── styles/
    ├── styles.css (estilos globais)
    ├── mobile.css (estilos mobile)
    ├── desktop.css (estilos desktop)
    └── tree.css (árvore de habilidades)
```

## 🎨 DESIGN E INTERFACE

### **Tema Visual:**
- **Paleta de cores dark**: Base #0f172a, Secundário #1e293b, Terciário #334155
- **Cores de destaque**: Azul #3498db, Laranja #e67e22, Verde #27ae60, Vermelho #e74c3c
- **Typography**: Segoe UI com hierarquia clara
- **Estilo**: Futurístico/Cyberpunk com gradientes e sombras

### **Layout Responsivo:**
- **Desktop**: Drawer lateral para detalhes, layout em grid
- **Mobile**: Drawer bottom-up, cards simplificados, gestos touch

## 📱 SEÇÕES PRINCIPAIS

### 1. **HERO BANNER**
- Gradiente diagonal com padrão de circuito SVG
- Título: "MAPEAMENTO DE COMPETÊNCIAS"
- Subtítulo: "Sistema de progresso profissional RPG"
- Altura: 40vh mínimo 300px

### 2. **SEÇÃO DE RESUMO (4 Cards)**
- **Card 1**: Nível de Domínio Médio (percentual animado)
- **Card 2**: Conquistas (desbloqueadas/bloqueadas)
- **Card 3**: Top Skill (habilidade com maior progresso + barra animada)
- **Card 4**: Progresso Geral (estatísticas gerais)
- Grid responsivo com hover effects e shimmer animation

### 3. **FILTROS DE CATEGORIA**
- 5 botões: ALL, QA, DEV, UX, DATA
- Com ícones Bootstrap Icons
- Estado ativo com glow effect
- Scroll horizontal no mobile

### 4. **ÁRVORE DE HABILIDADES**
- **Nós circulares** com conexões genealógicas CSS
- **4 categorias de cores**: QA (azul), DEV (vermelho), UX (roxo), DATA (laranja)
- **Estados**: Desbloqueado, Bloqueado, Parcialmente desbloqueado
- **Expansão/Colapso** com botões + (verde) e - (vermelho)
- **Alinhamento horizontal** dos filhos
- **Hover effects** com escala e glow

### 5. **SEÇÃO DE CONQUISTAS**
- **Layout Desktop**: Grid 3 colunas (imagem + conteúdo + status)
- **Layout Mobile**: Lista compacta (imagem + título + botão "Ver")
- **Status visual**: Desbloqueado (verde), Bloqueado (cinza + grayscale)
- **Drawer de detalhes** no mobile com swipe gestures

## 🗂️ ESTRUTURA DE DADOS

### **skills.json**
```json
{
  "categories": [
    {"id": "qa", "name": "Quality Assurance", "color": "#3498db", "rootSkillId": "qa-root"},
    {"id": "dev", "name": "Development", "color": "#e74c3c", "rootSkillId": "dev-root"},
    {"id": "ux", "name": "User Experience", "color": "#9b59b6", "rootSkillId": "ux-root"},
    {"id": "data", "name": "Data Science", "color": "#f39c12", "rootSkillId": "data-root"}
  ],
  "skills": [
    {
      "id": "qa-root",
      "title": "QUALITY ASSURANCE",
      "description": "Garantia de qualidade de software...",
      "category": "qa",
      "icon": "bi-shield-check",
      "domain": 5,
      "unlock_threshold": 0,
      "scores": {
        "theoretical": 5,
        "technical": 4,
        "problem_solving": 5,
        "knowledge_transfer": 4,
        "trends": 3
      },
      "children": ["qa-testing", "qa-automation", "qa-performance"],
      "relatedAchievements": ["istqb-cert", "agile-cert"]
    }
    // ... mais habilidades por categoria
  ]
}
```

### **achievements.json**
```json
[
  {
    "id": "istqb-cert",
    "title": "ISTQB Foundation",
    "description": "Certificação internacional...",
    "image": "assets/istqb.png",
    "status": "unlocked",
    "evidence": "https://example.com/certificates/istqb-foundation.pdf",
    "relatedSkills": ["qa-root", "qa-testing"],
    "subcategories": {
      "Fundamentos": "Conceitos básicos...",
      "Técnicas": "Técnicas de design...",
      // ... mais subcategorias
    }
  }
  // ... mais conquistas
]
```

## 💻 FUNCIONALIDADES TÉCNICAS

### **JavaScript ES6+ Modular:**
- **SkillMappingApp**: Classe principal da aplicação
- **DataService**: Gerenciamento de dados e estatísticas
- **SkillTree**: Renderização e controle da árvore

### **Sistema de Estatísticas:**
- Cálculo automático de progresso médio
- Contagem de conquistas desbloqueadas/bloqueadas
- Identificação da top skill
- Atualização dinâmica de estatísticas

### **Sistema de Árvore Interativa:**
- Renderização baseada em categoria selecionada
- Expansão/colapso de nós com animações
- Conexões visuais entre nós pais e filhos
- Estados visuais baseados em thresholds

### **Responsividade Avançada:**
- Detecção automática mobile/desktop
- Layouts diferentes por resolução
- Drawer mobile com gestos touch (swipe down)
- Rerender automático em mudança de resolução

## 🎯 FUNCIONALIDADES ESPECÍFICAS

### **Mobile Experience:**
1. **Cards de conquista simplificados**: Apenas imagem + título + botão "Ver"
2. **Status badge pequeno**: Canto superior esquerdo (OK/LOCK)
3. **Drawer bottom-up**: Detalhes completos com gestos
4. **Touch gestures**: Swipe down para fechar drawer
5. **Scroll horizontal**: Para filtros e summary cards

### **Desktop Experience:**
1. **Hover effects**: Transformações e glows em cards
2. **Drawer lateral**: Para detalhes de habilidades
3. **Layout em grid**: Otimizado para telas grandes
4. **Animações suaves**: Transições em todos os elementos

### **Animações e Efeitos:**
- **Shimmer effect**: Em barras de progresso
- **Fade-in**: Para novos elementos
- **Scale hover**: Em nós da árvore
- **Glow effects**: Em elementos ativos
- **Gradients animados**: Em backgrounds

## 🔧 ESPECIFICAÇÕES TÉCNICAS

### **CSS Organização:**
- **styles.css**: Variáveis CSS, reset, componentes globais
- **mobile.css**: `@import styles.css` + media queries mobile
- **desktop.css**: `@import styles.css` + media queries desktop  
- **tree.css**: Estilos específicos da árvore de habilidades

### **Variáveis CSS:**
```css
:root {
  --color-dark-base: #0f172a;
  --color-primary: #3498db;
  --spacing-md: 1rem;
  --mobile-max: 768px;
  // ... todas as variáveis necessárias
}
```

### **JavaScript Modular:**
- Event delegation para performance
- Lazy loading de componentes
- Debounced resize handlers
- Memory management para eventos

## 📋 CONTEÚDO ESPECÍFICO

### **4 Categorias de Habilidades:**
1. **QA (Azul)**: Testing Manual, Automation, Performance, Security
2. **DEV (Vermelho)**: Frontend, Backend, DevOps, Architecture
3. **UX (Roxo)**: Research, Design, Prototyping, Testing
4. **DATA (Laranja)**: Excel, Power BI, SQL com sub-skills

### **Sistema de Conquistas:**
- 15+ conquistas por categoria
- Certificações técnicas (ISTQB, Selenium, etc.)
- Projetos e experiências profissionais
- Skills soft (liderança, mentoria, etc.)

### **Estados e Interações:**
- **Locked**: Cinza, grayscale, overlay de cadeado
- **Unlocked**: Cores vibrantes, animações
- **Partially unlocked**: Estado intermediário
- **Evidence links**: Botões para certificados/portfólio

## 🚀 IMPLEMENTAÇÃO

### **Ordem de Desenvolvimento:**
1. **Estrutura HTML** semântica completa
2. **CSS Global** com variáveis e reset
3. **Layout responsivo** mobile-first
4. **JavaScript modular** com classes ES6+
5. **Sistema de dados** JSON estruturado
6. **Interações avançadas** e animações
7. **Otimizações** de performance

### **Tecnologias:**
- **HTML5** semântico
- **CSS3** moderno (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript ES6+** (sem frameworks)
- **Bootstrap Icons** CDN
- **JSON** para dados estruturados

### **Compatibilidade:**
- Chrome, Firefox, Safari, Edge (últimas versões)
- Responsive: 320px - 2560px
- Touch devices: iOS Safari, Chrome Mobile
- Progressive enhancement

## ✅ CRITÉRIOS DE SUCESSO

### **Funcionalidade:**
- [ ] Árvore de habilidades totalmente interativa
- [ ] Sistema de conquistas completo
- [ ] Layout responsivo perfeito
- [ ] Drawer mobile com gestos
- [ ] Estatísticas dinâmicas atualizadas
- [ ] Navegação por teclado (ESC, números)

### **Visual:**
- [ ] Design moderno e profissional
- [ ] Animações suaves e consistentes
- [ ] Cores e tipografia harmoniosas
- [ ] Estados visuais claros
- [ ] Feedback visual em todas interações

### **Performance:**
- [ ] Carregamento rápido (<2s)
- [ ] Animações a 60fps
- [ ] Sem memory leaks
- [ ] Otimizado para mobile

### **UX:**
- [ ] Navegação intuitiva
- [ ] Feedback visual imediato
- [ ] Acessibilidade básica
- [ ] Experiência consistente cross-device

## 🎨 REFERÊNCIAS VISUAIS

**Inspiração de Design:**
- Jogos RPG modernos (skill trees)
- Dashboards administrativos dark theme
- Portfolios de desenvolvedores
- Aplicações de certificação técnica

**Paleta de Cores Específica:**
- Background: #0f172a (slate-900)
- Cards: #334155 (slate-700)  
- Primary: #3498db (blue)
- Success: #27ae60 (green)
- Warning: #f39c12 (orange)
- Danger: #e74c3c (red)

---

## 🔥 RESULTADO ESPERADO

Uma aplicação web completa, profissional e moderna que demonstre competências técnicas através de um sistema gamificado visual e interativo, com experiência de usuário excepcional tanto em desktop quanto mobile, código limpo e organizado, e performance otimizada.

**O projeto deve ser 100% funcional, visualmente impressionante e tecnicamente sólido.**
