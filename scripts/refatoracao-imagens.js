// Script para renomear imagens seguindo o padrão img-${titulo-conquista}.${extensao}

const fs = require('fs');
const path = require('path');

// Função para converter título em nome de arquivo válido
function converterTituloParaNomeArquivo(titulo) {
    return titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplos
        .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

// Mapeamento de conquistas para renomeação
const mapeamentoConquistas = {
    "Go Go Power Bi": "unnamed8-1753302828706-816021792.png",
    "Crash \"Bug\" Coot": "unnamed2-1753302850471-605266798.png",
    "Coda fofo": "unnamed6-1753302860498-532869191.png",
    "Code Souls": "unnamed4-1753302868582-419719872.png",
    "My Back!": "Capturadetela2025-07-23153725-1753302879061-248518808.png",
    "Crise de identidade": "b954c9a2-e19d-4f95-a673-b18e1dc48224-1753302896383-213157819.jpg",
    "Frontman": "unnamed3-1753302915034-460043131.png",
    "Left 4 Test": "unnamed5-1753303051616-605354410.png",
    "CRUD Crédo!": "unnamed7-1753303114248-257433973.png",
    "American Boy": "unnamed3-1753556239398-98019639.png",
    "Mama mia": "unnamed4-1753556412122-7910538.png",
    "Nomad Didital": "unnamed5-1753556720437-405895172.png",
    "Overdose de XP": "unnamed6-1753557067558-886264745.png",
    "Time dos sonhos!": "unnamed7-1753557408493-943558151.png",
    "Ser ou não ser, Eis a minha profissão.": "unnamed8-1753558668533-924519658.png",
    "Garoto de programa": "unnamed9-1753558917894-459662963.png",
    "Ensino Superior": "unnamed10-1753559281835-855041893.png",
    "Gugu dada": "unnamed12-1753560048674-527013440.png",
    "Plenitude": "unnamed13-1753579500863-563950872.png",
    "Sabedoria iminente": "unnamed14-1753579509907-754549008.png"
};

// Gerar comandos de renomeação
function gerarComandosRenomeacao() {
    const comandos = [];
    
    for (const [titulo, nomeAtual] of Object.entries(mapeamentoConquistas)) {
        const nomeNovo = `img-${converterTituloParaNomeArquivo(titulo)}.${path.extname(nomeAtual).substring(1)}`;
        comandos.push(`mv "assets/achievements/${nomeAtual}" "assets/achievements/${nomeNovo}"`);
    }
    
    return comandos;
}

console.log('Comandos para renomear imagens:');
console.log(gerarComandosRenomeacao().join('\n'));
