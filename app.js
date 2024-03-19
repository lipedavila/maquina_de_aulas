// Definição das variáveis globais
let disciplina = '';
let topicosSelecionados = [];
let subtopicosSelecionados = [];
let tempo = '';
let especificidade = '';
let tentativa = 1;

// Função principal para iniciar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarTituloEIntroducao();
    setTimeout(inicializarPrimeiroCard, 5000); // Atrasa a inicialização do primeiro card em 5 segundos
}

// Funções para mostrar título e introdução
function mostrarTituloEIntroducao() {
    criarElementoTexto('h1', 'Máquina Geradora de Aula Expositiva', document.body);
    criarElementoTexto('p', 'Seja bem vindo. Aqui você tem uma implementação de inteligência artificial dedicada à criação de planos de aulas expositivas.', document.body);
}

function criarElementoTexto(tipo, texto, pai) {
    const elemento = document.createElement(tipo);
    elemento.textContent = texto;
    pai.appendChild(elemento);
}

// Função para inicializar o primeiro card
function inicializarPrimeiroCard() {
    limparConteudoAnterior();
    criarPrimeiroCard();
}

function criarPrimeiroCard() {
    const cardHTML = `
        <div style="border-radius: 10px; padding: 20px; margin-top: 20px; background-color: #f0f0f0;">
            <p>Digite a disciplina para a qual estaremos gerando o seu plano de aula:</p>
            <input type="text" id="disciplinaInput" placeholder="Disciplina">
            <button id="avancar1">Avançar</button>
        </div>
    `;
    adicionarHTMLAoCorpo(cardHTML);
    document.getElementById('avancar1').addEventListener('click', pegarDisciplina);
}

function pegarDisciplina() {
    disciplina = document.getElementById('disciplinaInput').value.trim();
    if (disciplina) {
        requisitarTopicos();
    } else {
        alert('Por favor, insira uma disciplina.');
    }
}

// Função para mostrar loading e animação da barra de carregamento
function mostrarLoading() {
    limparConteudoAnterior();
    criarLoading();
    animateLoadingBar();
}

function criarLoading() {
    const loadingHTML = 'Carregando... <div id="loadingBar">[ Ativando Máquinas AulaTotal.com.br ]</div>';
    adicionarHTMLAoCorpo(loadingHTML);
}

function animateLoadingBar() {
    let loadingBar = document.getElementById('loadingBar');
    let state = 0;
    const states = ['Aguarde um segundinho.', 'Estamos trabalhando.', 'Nossas máquinas já vão lhe atender.', 'AulaTotal.com.br'];
    const interval = setInterval(() => {
        if (!document.getElementById('loadingBar')) {
            clearInterval(interval);
            return;
        }
        loadingBar.textContent = states[state];
        state = (state + 1) % states.length;
    }, 500);
}

// Utilitários gerais
function limparConteudoAnterior() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

function adicionarHTMLAoCorpo(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
}

// Função para requisitar tópicos baseada na disciplina informada
function requisitarTopicos() {
    mostrarLoading();
    const url = construirUrlTopicos(disciplina);
    fetchRetry(url, 'topico', extrairTopicos, mostrarSegundoCard);
}

//Função para gerar saudação aleatorizada.
function gerarGentileza() {
    let letras = '';
    for (let i = 0; i < 10; i++) {
        letras += String.fromCharCode(Math.floor(Math.random() * 26) + 97); // gera uma letra minúscula aleatória
    }
    return `[SEJA%20GENTIL%20COM%20O%20PROFESSOR%20${letras}]`;
}


function construirUrlTopicos(disciplina) {
	const gentileza = gerarGentileza();
    return `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=${gentileza}[VOC%C3%8A%20%C3%89%20AUXILIAR%20DE%20PREPARA%C3%87%C3%83O%20DE%20AULAS]
    [divida%20A%20DICIPLINA/pseudodisciplina%20DE%20[${encodeURIComponent(disciplina)}]]
    %20EM%20AT%C3%89%2040%20ASSUNTOS
    [para cobrir todas possíveis aulas que um professor pode querer sobre:
    [[${encodeURIComponent(disciplina)}]]]
    [SUA%20RESPOSTA%20DEVE%20VIR%20ASSIM[usando%20as%20strings%20%3C1%3Eitem%201%3C/1%3E...%3C40%3Eitem%2040%3C/40%3E]]`;
}

// Função para extrair tópicos da resposta da API
function extrairTopicos(data) {
    const regex = /<(\d+)>(.*?)<\/\1>/g;
    let match;
    const topicos = [];
    while ((match = regex.exec(data.reply)) !== null) {
        topicos.push(match[2]);
    }
    return topicos;
}

// Função para mostrar o segundo card com os tópicos disponíveis
function mostrarSegundoCard(topicos) {
    limparConteudoAnterior();
    criarSegundoCard(topicos);
}

function criarSegundoCard(topicos) {
    let cardHTML = '<h3>Escolha os tópicos dentro de sua disciplina:</h3>';
    topicos.forEach((topico, index) => {
        cardHTML += `<div><input type="checkbox" id="topico-${index}" value="${topico}"> ${topico}</div>`;
    });
    cardHTML += '<button id="avancar2">Avançar</button>';
    adicionarHTMLAoCorpo(cardHTML);
    document.getElementById('avancar2').addEventListener('click', () => selecionarTopicos(topicos));
}

function selecionarTopicos(topicos) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos um tópico.');
        return;
    }
    topicosSelecionados = Array.from(checkboxes).map(cb => cb.value);
    requisitarSubtopicos();
}

// Funções para requisitar, extrair e mostrar sub-tópicos
function requisitarSubtopicos() {
    mostrarLoading();
    const url = construirUrlSubtopicos(topicosSelecionados);
    fetchRetry(url, 'subtopico', extrairSubtopicos, mostrarCardSubtopicos);
}

function construirUrlSubtopicos(topicos) {
	const gentileza = gerarGentileza();
    const topicosFormatados = encodeURIComponent(topicos.join(';'));
    return `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=${gentileza}[VOC%C3%8A%20%C3%89%20AUXILIAR%20DE%20PREPARA%C3%87%C3%83O%20DE%20AULAS]
    [
    DIVIDA%20OS%20TEMAS
    [[${topicosFormatados}]]
    %20DA%20DICIPLINA/PSEUDODISCIPLINA%20DE%20
    [${encodeURIComponent(disciplina)}]
    ]
    %20EM%20AT%C3%89%2040%20ASSUNTOS%20QUE%20ABRANGEM%20TUDO%20%20QUE%20UM%20PROFESSOR%20PODERIA%20PRECISAR%20ENSINAR%20EM%20RELAÇÃO%20A
    [VOCÊ%20DEVE%20COBRIR%20a%20totalidade%20de[[${topicosFormatados}]]%20DA%20DICIPLINA%20DE%20[${encodeURIComponent(disciplina)}]]
    [SUA%20RESPOSTA%20DEVE%20VIR%20ASSIM[usando%20as%20strings%20%3Cc1%3Eitem%201%3C/c1%3E...%3Cc40%3Eitem%2040%3C/c40%3E]]`;
}

function extrairSubtopicos(data) {
    const regex = /<c(\d+)>(.*?)<\/c\1>/g;
    let match;
    const subtopicos = [];
    while ((match = regex.exec(data.reply)) !== null) {
        subtopicos.push(match[2]);
    }
    return subtopicos;
}

function mostrarCardSubtopicos(subtopicos) {
    limparConteudoAnterior();
    criarCardSubtopicos(subtopicos);
}

function criarCardSubtopicos(subtopicos) {
    let cardHTML = '<h3>Escolha os subtópicos dentro dos tópicos selecionados:</h3>';
    subtopicos.forEach((subtopico, index) => {
        cardHTML += `<div><input type="checkbox" id="subtopico-${index}" value="${subtopico}"> ${subtopico}</div>`;
    });
    cardHTML += '<button id="avancarSubtopicos">Avançar</button>';
    adicionarHTMLAoCorpo(cardHTML);
    document.getElementById('avancarSubtopicos').addEventListener('click', () => selecionarSubtopicos());
}

function selecionarSubtopicos() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos um subtópico.');
        return;
    }
    subtopicosSelecionados = Array.from(checkboxes).map(cb => cb.value);
    mostrarCardAjustesFinais();
}

// Função para ajustes finais e submissão do plano de aula
function mostrarCardAjustesFinais() {
    limparConteudoAnterior();
    criarCardAjustesFinais();
}

function criarCardAjustesFinais() {
    const cardHTML = `
        <h3>Ajustes Finais</h3>
<p>Quanto tempo você precisará que tenha a sua aula?</p>
<input type="text" id="tempoAula" placeholder="Ex: 90 minutos">
<p>Tem algum detalhe que julga relevante levar em consideração nesse plano de aula?</p>
<div style="font-size: 0.8em; color: #333;">
  <h4 style="font-size: 1.2em; margin-bottom: 0.5em;">Detalhes Possíveis:</h4>
  <ul style="margin-left: 0;">
    <li>
      <strong>Tópico:</strong> <span style="color: #555;">O tópico exato para sua aula;</span>
    </li>
    <li>
      <strong>Série/Grau:</strong> <span style="color: #555;">A série ou grau dos alunos;</span>
    </li>
    <li>
      <strong>Atividades:</strong> <span style="color: #555;">Atividades obrigatórias;</span>
    </li>
    <li>
      <strong>Extras:</strong> <span style="color: #555;">Qualquer detalhe extra.</span><br>
    </li>
  </ul>
</div>
<input type="text" id="detalhesAula" placeholder="Detalhes relevantes">
<button id="finalizarPlano">Finalizar Plano de Aula</button>

    `;
    adicionarHTMLAoCorpo(cardHTML);
    document.getElementById('finalizarPlano').addEventListener('click', finalizarPlanoDeAula);
}

function finalizarPlanoDeAula() {
    tempo = document.getElementById('tempoAula').value;
    especificidade = document.getElementById('detalhesAula').value;
    if (!tempo) {
        alert("Escolha o tempo de aula!");
        return;
    }
    submeterPlanoDeAula();
}

function submeterPlanoDeAula() {
    mostrarLoading();
    const urlFinal = construirUrlFinal();
    fetch(urlFinal)
        .then(response => response.json())
        .then(apresentarResultadoFinal)
        .catch(erroAoFinalizarPlano);
}

function construirUrlFinal() {
	const gentileza = gerarGentileza();
    const topicosFormatados = encodeURIComponent(topicosSelecionados.join(';'));
    const subtopicosFormatados = encodeURIComponent(subtopicosSelecionados.join(';'));
    return `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=${gentileza}[com 4000 palavras[nem menos nem mais, por favor.]][Desenvolva um plano de aula expositiva altamente detalhado para a disciplina ${disciplina}, abordando os tópicos: ${topicosFormatados} e subitens: ${subtopicosFormatados}. A aula terá duração de ${tempo} e deve atender à especificidade ${especificidade}. Certifique-se de que o plano inclua:
  - Objetivos de aprendizagem claros, diferenciáveis entre si, realísticos e engajadores.
  - Estratégias didáticas interativas com métodos de ensino inovadores[explique em detalhes toda estratégia que propuser].
  - Gestão eficaz do tempo de aula, com atividades bem distribuídas[delimite com afinco os tempos de cada parte da aula].
  - Mostre que tipo de avaliação de feedback instantâneo pode estar sendo implementado no contexto da aula que planejou.
  - Ofereça estratégia que permite flexibilidades para ajustes e improvisos conforme necessário.
  observação: Organize o plano de forma lógica e sequencial, garantindo que cada atividade esteja alinhada com os objetivos e promova uma aprendizagem significativa e engajadora. Não esqueça de ensinar ao professor todas as atividades que propuser e de estabelecer o modus operandi factível realista e útil.]`;
}

// Funções para apresentar o resultado final ou erro
function apresentarResultadoFinal(data) {
    limparConteudoAnterior();
    criarElementoTexto('p', data.reply, document.body);
}

function erroAoFinalizarPlano(error) {
    console.error('Erro ao finalizar plano de aula:', error);
    mostrarMensagemErro();
}

function mostrarMensagemErro() {
    limparConteudoAnterior();
    criarElementoTexto('p', "Lamentamos informar que nossas máquinas não conseguiram processar esse pedido.", document.body);
}

// Função fetchRetry refatorada para tentativas de busca
function fetchRetry(url, tipo, extrairFn, sucessoFn, tentativas = 1) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Resposta da API não foi OK');
            return response.json();
        })
        .then(data => {
            const itens = extrairFn(data);
            if (itens.length > 0) {
                sucessoFn(itens);
            } else {
                throw new Error('Nenhum item encontrado');
            }
        })
        .catch(error => {
            console.error(`Erro ao buscar dados (${tipo}):`, error);
            if (tentativas < 10) {
                setTimeout(() => {
                    fetchRetry(url, tipo, extrairFn, sucessoFn, tentativas + 1);
                }, 1000);
            } else {
                mostrarMensagemErro();
            }
        });
}
