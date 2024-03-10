let tentativas = 0;

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function reenviarRequisicao(url, extrator, callback) {
    if (tentativas >= 10) {
        alert('Não foi possível obter dados mesmo após 10 tentativas. Tente novamente mais tarde.');
        return;
    }

    const novaUrl = url.replace('question=', 'question=()');
    fetch(novaUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta da API não foi OK ao reenviar');
            }
            return response.json();
        })
        .then(data => {
            const resultado = extrator(data);
            if (resultado && resultado.length > 0) {
                callback(resultado);
            } else {
                tentativas++;
                reenviarRequisicao(url, extrator, callback);
            }
        })
        .catch(error => {
            console.error('Erro ao reenviar a solicitação para a API:', error);
        });
}

let disciplina = '';
let topicosSelecionados = [];
let subtopicosSelecionados = [];
let tempo = '';
let especificidade = '';

function iniciarApp() {
    mostrarTituloEIntroducao();
    inicializarPrimeiroCard();
}

function mostrarTituloEIntroducao() {
    const titulo = document.createElement('h1');
    titulo.textContent = "Máquina Geradora de Aula Expositiva";
    document.body.appendChild(titulo);

    const introducao = document.createElement('p');
    introducao.textContent = "Seja bem vindo. Aqui você tem uma implementação de inteligência artificial dedicada à criação de planos de aulas expositivas.";
    document.body.appendChild(introducao);
}

function inicializarPrimeiroCard() {
    limparConteudoAnterior();
    const card = document.createElement('div');
    card.innerHTML = `
        <div style="border-radius: 10px; padding: 20px; margin-top: 20px;">
            <p>Digite a disciplina e o nível de ensino (ensino médio, graduação, mestrado, etc) <br> para a qual estaremos gerando o seu plano de aula:</p>
            <input type="text" id="disciplinaInput" placeholder="Disciplina">
            <button id="avancar1">Avançar</button>
        </div>
    `;
    document.body.appendChild(card);

    document.getElementById('avancar1').addEventListener('click', function() {
        disciplina = document.getElementById('disciplinaInput').value;
        if (disciplina) {
            requisitarTopicos();
        } else {
            alert('Por favor, insira uma disciplina.');
        }
    });
}

function requisitarTopicos() {
    mostrarLoading();
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=[desmembre a Disciplina de ${encodeURIComponent(disciplina)} em até 30 itens não interseccionados (que abranjam toda a disciplina) usando as strings <1>item 1</1><2>item 2</2><3>item 3</3><4>item 4</4><5>item 5</5><6>item 6</6><7>item 7</7><8>item 8</8><9>item 9</9><10>item 10</10>] mantendo-se no vível do ensino informado(ou suponha primeiro semestre de graduação ou último ano do ensino médio)`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta da API não foi OK');
            }
            return response.json();
        })
        .then(data => {
            const topicos = extrairTopicos(data);
            if (topicos && topicos.length > 0) {
                mostrarSegundoCard(topicos);
            } else {
                throw new Error('Nenhum tópico encontrado');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
}

function mostrarLoading() {
    limparConteudoAnterior();
    const loading = document.createElement('p');
    loading.textContent = 'Carregando...';
    document.body.appendChild(loading);
}

function mostrarSegundoCard(topicos) {
    limparConteudoAnterior();
    const card = document.createElement('div');
    let topicosHTML = `<h3>Escolha os tópicos dentro de sua disciplina:</h3>`;
    topicos.forEach((topico, index) => {
        topicosHTML += `<div><input type="checkbox" id="topico-${index}" value="${topico}"> ${topico}</div>`;
    });
    topicosHTML += `<button id="avancar2">Avançar</button>`;

    card.innerHTML = topicosHTML;
    document.body.appendChild(card);

    document.getElementById('avancar2').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('[id^="topico-"]:checked');
        if (checkboxes.length === 0) {
            alert('Por favor, selecione pelo menos um tópico.');
            return;
        }

        topicosSelecionados = Array.from(checkboxes).map(cb => cb.value);
        requisitarSubtopicos();
    });
}

function extrairTopicos(data) {
    // Ajuste de acordo com a estrutura da resposta da sua API
    const regex = /<(\d+)>(.*?)<\/\1>/g;
    let match;
    const topicos = [];
    while ((match = regex.exec(data.reply)) !== null) {
        topicos.push(match[2]);
    }
    return topicos;
}

function requisitarSubtopicos() {
    mostrarLoading();
    const topicosFormatados = topicosSelecionados.join(';');
    const url = `https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question={Forneça lista de 10 subitens para cada item da lista [${encodeURIComponent(topicosFormatados)}] organizando entre strings cada subitem assim <c1>primeiro subitem</c1> ... <cn> último subitem </cn>}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const subtopicos = extrairSubtopicos(data);
            if (subtopicos && subtopicos.length > 0) {
                mostrarCardSubtopicos(subtopicos);
            } else {
                throw new Error('Nenhum subtópico encontrado');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
}

function extrairSubtopicos(data) {
    // Ajuste de acordo com a estrutura da resposta da sua API
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
    let subtopicosHTML = `<h3>Escolha os subtópicos dentro dos tópicos selecionados:</h3>`;
    subtopicos.forEach((subtopico, index) => {
        subtopicosHTML += `<div><input type="checkbox" id="subtopico-${index}" value="${subtopico}"> ${subtopico}</div>`;
    });
    subtopicosHTML += `<button id="avancarSubtopicos">Avançar</button>`;

    card.innerHTML = subtopicosHTML;
    document.body.appendChild(card);

    document.getElementById('avancarSubtopicos').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('[id^="subtopico-"]:checked');
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

function limparConteudoAnterior() {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}

