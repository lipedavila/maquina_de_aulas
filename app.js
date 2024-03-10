document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

let disciplina = '';
let topicosSelecionados = [];
let subtopicosSelecionados = [];
let tempo = '';
let especificidade = '';
let tentativa = 1;

function iniciarApp() {
    mostrarTituloEIntroducao();
    inicializarPrimeiroCard();
}

function mostrarTituloEIntroducao() {
    const titulo = document.createElement('h1');
    titulo.textContent = "Máquina Geradora de Aula Expositiva";
    document.body.appendChild(titulo);

    const introducao = document.createElement('p');
    introducao.textContent = "Seja bem vindo. Aqui você tem uma implementação de inteligência artificial dedicada à criação de planos de aulas expositivas...";
    document.body.appendChild(introducao);
}

function inicializarPrimeiroCard() {
    limparConteudoAnterior();
    const card = document.createElement('div');
    card.innerHTML = `
        <div style="border-radius: 10px; padding: 20px; margin-top: 20px; background-color: #f0f0f0;">
            <p>Digite a disciplina para a qual estaremos gerando o seu plano de aula:</p>
            <input type="text" id="disciplinaInput" placeholder="Disciplina">
            <button id="avancar1">Avançar</button>
        </div>
    `;
    document.body.appendChild(card);

    document.getElementById('avancar1').addEventListener('click', function() {
        disciplina = document.getElementById('disciplinaInput').value.trim();
        if (disciplina) {
            requisitarTopicos();
        } else {
            alert('Por favor, insira uma disciplina.');
        }
    });
}

function mostrarLoading() {
    limparConteudoAnterior();
    const loading = document.createElement('div');
    loading.innerHTML = 'Carregando... <div id="loadingBar">[ Ativando Máquinas AulaTotal.com.br ]</div>';
    document.body.appendChild(loading);
    animateLoadingBar();
}

function animateLoadingBar() {
    let loadingBar = document.getElementById('loadingBar');
    if (!loadingBar) return;
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

function limparConteudoAnterior() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

function requisitarTopicos() {
    mostrarLoading();
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=[divida%20a%20disciplina%20de%20${encodeURIComponent(disciplina)}%20em%2010%20itens%20usando%20as%20strings%20%3C1%3Eitem%201%3C/1%3E...%3C10%3Eitem%2010%3C/10%3E]`;

    fetchRetry(url, 'topico', extrairTopicos, mostrarSegundoCard);
}

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

function extrairTopicos(data) {
    const regex = /<(\d+)>(.*?)<\/\1>/g;
    let match;
    const topicos = [];
    while ((match = regex.exec(data.reply)) !== null) {
        topicos.push(match[2]);
    }
    return topicos;
}

function mostrarSegundoCard(topicos) {
    limparConteudoAnterior();
    const card = document.createElement('div');
    card.innerHTML = '<h3>Escolha os tópicos dentro de sua disciplina:</h3>';
    topicos.forEach((topico, index) => {
        card.innerHTML += `<div><input type="checkbox" id="topico-${index}" value="${topico}"> ${topico}</div>`;
    });
    card.innerHTML += '<button id="avancar2">Avançar</button>';
    document.body.appendChild(card);

    document.getElementById('avancar2').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert('Por favor, selecione pelo menos um tópico.');
            return;
        }

        topicosSelecionados = Array.from(checkboxes).map(cb => cb.value);
        requisitarSubtopicos();
    });
}

function requisitarSubtopicos() {
    mostrarLoading();
    const topicosFormatados = encodeURIComponent(topicosSelecionados.join(';'));
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question={Forneça lista de 10 subitens para cada item da lista [${topicosFormatados}] organizando entre strings cada subitem assim <c1>primeiro subitem</c1> ... <cn> último subitem </cn>}`;

    fetchRetry(url, 'subtopico', extrairSubtopicos, mostrarCardSubtopicos);
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
    const card = document.createElement('div');
    card.innerHTML = '<h3>Escolha os subtópicos dentro dos tópicos selecionados:</h3>';
    subtopicos.forEach((subtopico, index) => {
        card.innerHTML += `<div><input type="checkbox" id="subtopico-${index}" value="${subtopico}"> ${subtopico}</div>`;
    });
    card.innerHTML += '<button id="avancarSubtopicos">Avançar</button>';
    document.body.appendChild(card);

    document.getElementById('avancarSubtopicos').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert('Por favor, selecione pelo menos um subtópico.');
            return;
        }

        subtopicosSelecionados = Array.from(checkboxes).map(cb => cb.value);
        mostrarCardAjustesFinais();
    });
}

function mostrarCardAjustesFinais() {
    limparConteudoAnterior();
    const card = document.createElement('div');
    card.innerHTML = `
        <h3>Ajustes Finais</h3>
        <p>Quanto tempo você precisará que tenha a sua aula?</p>
        <input type="text" id="tempoAula" placeholder="Ex: 90 minutos">
        <p>Tem algum detalhe que julga relevante levar em consideração nesse plano de aula?</p>
        <input type="text" id="detalhesAula" placeholder="Detalhes relevantes">
        <button id="finalizarPlano">Finalizar Plano de Aula</button>
    `;
    document.body.appendChild(card);

    document.getElementById('finalizarPlano').addEventListener('click', function() {
        tempo = document.getElementById('tempoAula').value;
        especificidade = document.getElementById('detalhesAula').value;
        if (!tempo) {
            alert("Escolha o tempo de aula!");
            return;
        }
        finalizarPlanoDeAula();
    });
}



function finalizarPlanoDeAula() {
    mostrarLoading();
    const topicosFormatados = encodeURIComponent(topicosSelecionados.join(';'));
    const subtopicosFormatados = encodeURIComponent(subtopicosSelecionados.join(';'));
    const urlFinal = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question={Planeje uma aula expositiva em mínimos detalhes considerando a disciplina ${encodeURIComponent(disciplina)} em seus itens {${topicosFormatados}} e subitens{${subtopicosFormatados}} considerando que a aula terá o tempo ${encodeURIComponent(tempo)} e precisamos conseguir abraçar a especificidade ${encodeURIComponent(especificidade)}}`;

    fetch(urlFinal)
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta da API não foi OK');
            }
            return response.json();
        })
        .then(data => {
            apresentarResultadoFinal(data);
        })
        .catch(error => {
            console.error('Erro ao finalizar plano de aula:', error);
        });
}

function apresentarResultadoFinal(data) {
    limparConteudoAnterior();
    const resultado = document.createElement('p');
    resultado.textContent = data.reply;
    document.body.appendChild(resultado);
}


function mostrarMensagemErro() {
    limparConteudoAnterior();
    const erroMsg = document.createElement('p');
    erroMsg.textContent = "Lamentamos informar que nossas máquinas não conseguiram processar esse pedido.";
    document.body.appendChild(erroMsg);
}
