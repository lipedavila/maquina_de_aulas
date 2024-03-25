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
    titulo.textContent = "Máquina Geradora de Artigos";
    document.body.appendChild(titulo);

    const introducao = document.createElement('p');
    introducao.textContent = "Seja bem vindo. Aqui você tem uma implementação de inteligência artificial dedicada à criação de micro-artigos.";
    document.body.appendChild(introducao);
}

function inicializarPrimeiroCard() {
    limparConteudoAnterior();
    const card = document.createElement('div');
    card.innerHTML = `
        <div style="border-radius: 10px; padding: 20px; margin-top: 20px; background-color: #f0f0f0;">
            <h3><p>Máquina AulaTotal Para Geração de Micro-Artigo</p></h3><br>
 	<p>Digite o tema que deseja abordar em seu micro-artigo no campo abaixo:</p>

           <input type="text" id="disciplinaInput" placeholder="Tema. Ex.: Covid.">
            <button id="avancar1">Avançar</button>
        </div>
    `;
    document.body.appendChild(card);

    document.getElementById('avancar1').addEventListener('click', function() {
        disciplina = document.getElementById('disciplinaInput').value.trim();
        if (disciplina) {
            requisitarTopicos();
        } else {
            alert('Por favor, insira o tema do artigo.');
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
    const states = ['Máquinas AulaTotal Trabalhando!', 'AulaTotal: O seu portal para suas superaulas.', 'As máquinas AulaTotal já vão lhe atender.', 'Obrigado por Estar com AulaTotal.com.br'];
    const interval = setInterval(() => {
        if (!document.getElementById('loadingBar')) {
            clearInterval(interval);
            return;
        }
        loadingBar.textContent = states[state];
        state = (state + 1) % states.length;
    }, 700);
}

function limparConteudoAnterior() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

function requisitarTopicos() {
    mostrarLoading();
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=[você é auxiliar de escritor e divide um assunto principal em títulos que em conjunto cobrirão possivelmente todas as possíveis abordagens que um artigo poderá desejar abordar sobre o assunto][divida%20o%20assunto%20de%20${encodeURIComponent(disciplina)}%20em%2010%20ítens%20que%20permitirão%20completo%20e%20abrangente%20estudo%20total%20do%20assunto.%20responda%20usando%20as%20strings%20de%20inicio%20e%20fim%20assim%20<1>%20texto%20do%20item%201%20</1>%20...%20<10>%20texto%20do%20item%2010%20</10>]`;

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
    card.innerHTML = '<h3>Para nossas máquinas escreverem seu micro-artigo,<br>escolha os tópicos que devem ser abordados:</h3>';
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
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=considere[você mostra os subitens na forma de temas de estudo com títulos referentes à campos de estudo ou pseudodisciplinas acadêmicas]e[os (no máximo) 20 itens devem cobrir todas as possíveis aulas sobre o assunto] e faça {Forneça lista que desmembra especificidades de estudo sério criando subitens para cada item da lista original [${topicosFormatados}] nascidos do tema [${encodeURIComponent(disciplina)}] organizando entre strings o todo dos subitens em lista única de no máximo 20 ítens assim <c1>primeiro subitem</c1> ... <cn> último subitem </cn>} [os itens são tantos quantos (até 20) precisar para cobrir todas as possíveis aulas sobre o assunto] [as strings são 'c1'; 'c2' ... 'cn' onde n é ´número de subitens] [cada subitem deve vir antecedido por <ck> e sucedido por </ck> onde k é o número do item, 'c1'; 'c2' ... 'cn' onde n é ´número de subitens e k=n para o último item] [não esqueça [você mostra os subitens na forma de temas de estudo com títulos referentes à campos de estudo ou pseudodisciplinas acadêmicas]e[os (no máximo) 20 itens devem cobrir todas as possíveis aulas sobre o assunto]]`;

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
    card.innerHTML = '<h3>Para nossas máquinas escreverem seu micro-artigo,<br>escolha agora os subtópicos específicos:</h3>';
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
        <h3>Ajustes Finais do Micro-Artigo</h3>
<br>
        <p>Qual o número de palavras que você precisa em seu micro-artigo?</p>
        <input type="text" id="tempo" placeholder="Obs.: Máximo de 4000 Caracteres(+/-).">
        <p>Inclua particularidades que nossas máquinas precisam levar em consideração no seu micro-artigo.</p>
        <input type="text" id="detalhesAula" placeholder="Detalhes relevantes">
        <button id="finalizarPlano">Forneça o meu artigo.</button>
    `;
    document.body.appendChild(card);

    document.getElementById('finalizarPlano').addEventListener('click', function() {
        tempo = document.getElementById('tempo').value;
        especificidade = document.getElementById('detalhesAula').value;
        if (!tempo) {
            alert("Escolha o número de palavras!");
            return;
        }
        finalizarPlanoDeAula();
    });
}



function finalizarPlanoDeAula() {
    mostrarLoading();
    const topicosFormatados = encodeURIComponent(topicosSelecionados.join(';'));
    const subtopicosFormatados = encodeURIComponent(subtopicosSelecionados.join(';'));
    const urlFinal = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question={Escreva um artigo acadêmico simulado para publicação envolvendo o assunto ${encodeURIComponent(disciplina)} em seus itens {${topicosFormatados}} e subitens{${subtopicosFormatados}} considerando que queremos o número de palavras que é nº=[ ${encodeURIComponent(tempo)} ]  e precisamos conseguir abraçar a especificidade ${encodeURIComponent(especificidade)}}`;

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
            console.error('Erro ao finalizar o micro-artigo: ', error);
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
