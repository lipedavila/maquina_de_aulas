from browser import document, alert, html, timer
from javascript import fetch
import urllib.parse

disciplina = ''
topicosSelecionados = []
subtopicosSelecionados = []
tempo = ''
especificidade = ''
tentativa = 1

def iniciarApp():
    mostrarTituloEIntroducao()
    inicializarPrimeiroCard()

def mostrarTituloEIntroducao():
    titulo = html.H1("Máquina Geradora de Aula Expositiva")
    document <= titulo

    introducao = html.P("Seja bem vindo. Aqui você tem uma implementação de inteligência artificial dedicada à criação de planos de aulas expositivas que levarão em consideração disciplinas, tópicos e subtópicos, e ainda tempo disponível, materiais, ou objetivos deixando ainda margem para qualquer especificidade que o usuário desejar usar para incrementar sua prática pedagógica.")
    document <= introducao

def inicializarPrimeiroCard():
    limparConteudoAnterior()
    card = html.DIV(style={"border-radius": "10px", "padding": "20px", "margin-top": "20px", "background-color": "#f0f0f0"})
    card <= html.P("Digite a disciplina para a qual estaremos gerando o seu plano de aula:")
    card <= html.INPUT(id="disciplinaInput", placeholder="Disciplina")
    card <= html.BUTTON("Avançar", id="avancar1")
    document <= card

    document["avancar1"].bind("click", lambda ev: avancar1())

def avancar1():
    global disciplina
    disciplina = document["disciplinaInput"].value.strip()
    if disciplina:
        requisitarTopicos()
    else:
        alert('Por favor, insira uma disciplina.')

def mostrarLoading():
    limparConteudoAnterior()
    loading = html.DIV('Carregando... ', html.DIV("[ Ativando Máquinas AulaTotal.com.br ]", id="loadingBar"))
    document <= loading
    animateLoadingBar()

def animateLoadingBar():
    loadingBar = document["loadingBar"]
    if not loadingBar:
        return
    state = 0
    states = ['Aguarde um segundinho.', 'Estamos trabalhando.', 'Nossas máquinas já vão lhe atender.', 'AulaTotal.com.br']
    interval = timer.set_interval(lambda: updateLoadingBar(loadingBar, states, state), 500)

def updateLoadingBar(loadingBar, states, state):
    if not document["loadingBar"]:
        timer.clear_interval(interval)
        return
    loadingBar.textContent = states[state]
    state = (state + 1) % len(states)

def limparConteudoAnterior():
    while document.body.firstChild:
        document.body.removeChild(document.body.firstChild)

def requisitarTopicos():
    mostrarLoading()
    url = f"https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=[divida%20a%20disciplina%20de%20{urllib.parse.quote(disciplina)}%20em%2010%20itens%20usando%20as%20strings%20%3C1%3Eitem%201%3C/1%3E...%3C10%3Eitem%2010%3C/10%3E]"
    fetchRetry(url, 'topico', extrairTopicos, mostrarSegundoCard)

def fetchRetry(url, tipo, extrairFn, sucessoFn, tentativas=1):
    def on_response(response):
        if not response.ok:
            raise Exception('Resposta da API não foi OK')
        return response.json()

    def on_data(data):
        itens = extrairFn(data)
        if len(itens) > 0:
            sucessoFn(itens)
        else:
            raise Exception('Nenhum item encontrado')

    def on_error(error):
        print(f"Erro ao buscar dados ({tipo}):", error)
        if tentativas < 10:
            timer.set_timeout(lambda: fetchRetry(url, tipo, extrairFn, sucessoFn, tentativas + 1), 1000)
        else:
            mostrarMensagemErro()

    fetch(url).then(on_response).then(on_data).catch(on_error)

def extrairTopicos(data):
    import re
    regex = re.compile(r"<(\d+)>(.*?)<\/\1>")
    topicos = []
    for match in regex.finditer(data["reply"]):
        topicos.append(match.group(2))
    return topicos

def mostrarSegundoCard(topicos):
    limparConteudoAnterior()
    card = html.DIV()
    card <= html.H3("Escolha os tópicos dentro de sua disciplina:")
    for index, topico in enumerate(topicos):
        card <= html.DIV(html.INPUT(type="checkbox", id=f"topico-{index}", value=topico), topico)
    card <= html.BUTTON("Avançar", id="avancar2")
    document <= card

    document["avancar2"].bind("click", lambda ev: avancar2())

def avancar2():
    global topicosSelecionados
    checkboxes = document.select('input[type="checkbox"]:checked')
    if len(checkboxes) == 0:
        alert('Por favor, selecione pelo menos um tópico.')
        return

    topicosSelecionados = [cb.value for cb in checkboxes]
    requisitarSubtopicos()

def requisitarSubtopicos():
    mostrarLoading()
    topicosFormatados = urllib.parse.quote(";".join(topicosSelecionados))
    url = f"https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question={Forneça lista de 10 subitens para cada item da lista [{topicosFormatados}] organizando entre strings cada subitem assim <c1>primeiro subitem</c1> ... <cn> último subitem </cn>}"
    fetchRetry(url, 'subtopico', extrairSubtopicos, mostrarCardSubtopicos)

def extrairSubtopicos(data):
    import re
    regex = re.compile(r"<c(\d+)>(.*?)<\/c\1>")
    subtopicos = []
    for match in regex.finditer(data["reply"]):
        subtopicos.append(match.group(2))
    return subtopicos

def mostrarCardSubtopicos(subtopicos):
    limparConteudoAnterior()
    card = html.DIV()
    card <= html.H3("Escolha os subtópicos dentro dos tópicos selecionados:")
    for index, subtopico in enumerate(subtopicos):
        card <= html.DIV(html.INPUT(type="checkbox", id=f"subtopico-{index}", value=subtopico), subtopico)
    card <= html.BUTTON("Avançar", id="avancarSubtopicos")
    document.body <= card

    document["avancarSubtopicos"].bind("click", lambda ev: avancarSubtopicos())

def avancarSubtopicos():
    global subtopicosSelecionados
    checkboxes = document.select('input[type="checkbox"]:checked')
    if len(checkboxes) == 0:
        alert('Por favor, selecione pelo menos um subtópico.')
        return

    subtopicosSelecionados = [cb.value for cb in checkboxes]
    mostrarCardAjustesFinais()

def mostrarCardAjustesFinais():
    limparConteudoAnterior()
    card = html.DIV()
    card <= html.H3("Ajustes Finais")
    card <= html.P("Quanto tempo você precisará que tenha a sua aula?")
    card <= html.INPUT(Id="tempoAula", placeholder="Ex: 90 minutos")
    card <= html.P("Tem algum detalhe que julga relevante levar em consideração nesse plano de aula?")
    card <= html.INPUT(Id="detalhesAula", placeholder="Detalhes relevantes")
    card <= html.BUTTON("Finalizar Plano de Aula", Id="finalizarPlano")
    document <= card

    document["finalizarPlano"].bind("click", finalizarPlano)

def finalizarPlano(ev):
    global tempo, especificidade
    tempo = document["tempoAula"].value
    especificidade = document["detalhesAula"].value
    if not tempo:
        alert("Por favor, defina o tempo da aula.")
        return
    mostrarLoading()
    prepararFinalizacao()

def prepararFinalizacao():
    topicosFormatados = urllib.parse.quote(';'.join(topicosSelecionados))
    subtopicosFormatados = urllib.parse.quote(';'.join(subtopicosSelecionados))
    especificidadeEncoded = urllib.parse.quote(especificidade)
    tempoEncoded = urllib.parse.quote(tempo)
    urlFinal = f"https://corsproxy.io/?https://hercai.onrender.com/v3/hercai?question=Planeje uma aula expositiva em mínimos detalhes considerando a disciplina {disciplina} em seus itens {topicosFormatados} e subitens {subtopicosFormatados} considerando que a aula terá o tempo {tempoEncoded} e precisamos conseguir abraçar a especificidade {especificidadeEncoded}"
    
    fetchRetry(urlFinal, 'final', lambda data: data.json(), apresentarResultadoFinal)

def apresentarResultadoFinal(data):
    limparConteudoAnterior()
    if 'plano' in data:
        document <= html.P(data['plano'])
    else:
        document <= html.P("Houve um erro ao gerar o plano de aula. Por favor, tente novamente.")

def mostrarMensagemErro():
    limparConteudoAnterior()
    erroMsg = html.P("Lamentamos informar que nossas máquinas não conseguiram processar esse pedido.")
    document <= erroMsg

# Iniciando a aplicação
document.addEventListener('DOMContentLoaded', iniciarApp)