# Relatório Técnico: Busca Heurística em uma Rota de Emergência

**Disciplina:** Inteligência Artificial<br>
**Atividade:** AT2<br>
**Projeto:** Rota de Emergência Urbana<br>
**Repositório:** [GSouza2007/Trabalho-IA-N1-AT2](https://github.com/GSouza2007/Trabalho-IA-N1-AT2)

## Resumo

Este trabalho apresenta uma aplicação web para demonstrar a influência de uma função heurística em um problema de busca em grafos. O cenário representa uma equipe de emergência que precisa sair da **Base** e alcançar o **Hospital** em uma cidade fictícia. A solução utiliza a **Greedy Best-First Search**, ou Busca Gulosa por Melhor Primeiro, e exibe o processo em um grafo animado.

Foram executados dois experimentos: um com a heurística original, construída como uma estimativa de distância ao destino, e outro com valores modificados para atrair a busca para um caminho menos eficiente. O primeiro experimento encontrou uma rota com 5 estados visitados e 4 expansões; o segundo visitou 7 estados e realizou 6 expansões. O resultado evidencia que a busca gulosa é sensível à qualidade da estimativa usada para ordenar os candidatos.

**Palavras-chave:** busca heurística, Greedy Best-First Search, grafos, função heurística, visualização interativa.

## 1. Introdução

Algoritmos de busca são usados para encontrar soluções em espaços formados por estados e transições. Em um grafo de rotas, os estados podem representar locais e as arestas podem representar deslocamentos possíveis. Quando existem muitos caminhos, uma heurística ajuda a priorizar os estados que parecem mais próximos do objetivo.

O projeto transforma esse conceito em uma experiência visual. A interface permite observar a lista de estados disponíveis, a ordem em que os nós são visitados, os vizinhos adicionados ao conjunto de candidatos e o caminho reconstruído ao final. Dessa forma, o usuário pode relacionar a definição matemática do algoritmo com o seu comportamento concreto.

## 2. Objetivos

### 2.1 Objetivo geral

Implementar e visualizar uma busca heurística capaz de encontrar uma rota entre dois pontos de um grafo urbano direcionado.

### 2.2 Objetivos específicos

- modelar uma cidade fictícia como um grafo direcionado;
- utilizar uma função $h(n)$ para priorizar estados;
- implementar execução automática e passo a passo;
- registrar estados abertos, visitados e expandidos;
- reconstruir o caminho por meio de predecessores;
- comparar uma heurística coerente com uma heurística deliberadamente distorcida;
- discutir o impacto da heurística na eficiência e na qualidade da rota.

## 3. Modelagem do problema

O grafo é representado por uma lista de adjacência. Cada chave corresponde a um estado e seu valor lista os estados alcançáveis diretamente. As conexões são direcionadas: uma ligação de A para B não implica necessariamente uma ligação de B para A.

### 3.1 Estados

| Estado | Papel no cenário |
|---|---|
| Base | ponto de partida da equipe |
| Centro | região central da cidade |
| Rodoviária | terminal rodoviário |
| Parque | área municipal no eixo principal |
| Aeroporto | estado sem saída |
| Shopping | centro comercial da região leste |
| Terminal | terminal de transporte |
| Universidade | campus universitário |
| Estádio | área esportiva |
| Praça | ponto de ligação próximo à Ponte |
| Ponte | acesso direto ao Hospital |
| Hospital | objetivo da busca |

O modelo possui 12 estados e atende ao requisito de um estado sem saída: o **Aeroporto**. O **Hospital** também não possui sucessores, mas é tratado como objetivo e não como beco sem saída.

### 3.2 Arestas direcionadas

| Origem | Destinos |
|---|---|
| Base | Centro, Rodoviária, Parque |
| Centro | Aeroporto, Shopping |
| Rodoviária | Parque |
| Parque | Universidade, Estádio |
| Aeroporto | nenhum |
| Shopping | Terminal |
| Terminal | Praça |
| Universidade | Ponte |
| Estádio | Praça |
| Praça | Ponte |
| Ponte | Hospital |
| Hospital | nenhum |

Essa lista totaliza 16 arestas e permite três rotas completas entre Base e Hospital:

1. Base → Parque → Universidade → Ponte → Hospital;
2. Base → Parque → Estádio → Praça → Ponte → Hospital;
3. Base → Centro → Shopping → Terminal → Praça → Ponte → Hospital.

## 4. Função heurística

A função heurística estima o esforço restante até o objetivo. Neste projeto, cada valor representa uma distância aproximada em blocos urbanos. Os valores não são calculados em tempo de execução; eles estão definidos em `graph.js` para permitir um experimento controlado.

### 4.1 Heurística original

| Estado | $h(n)$ |
|---|---:|
| Base | 18 |
| Rodoviária | 15 |
| Aeroporto | 14 |
| Centro | 13 |
| Estádio | 12 |
| Terminal | 11 |
| Parque | 10 |
| Shopping | 9 |
| Universidade | 7 |
| Praça | 6 |
| Ponte | 4 |
| Hospital | 0 |

O valor do Hospital é zero porque ele é o objetivo. Em termos conceituais, valores menores indicam estados mais promissores.

### 4.2 Heurística modificada

Para medir a influência da heurística, três valores são alterados:

| Estado | Original | Modificada | Efeito esperado |
|---|---:|---:|---|
| Centro | 13 | 4 | torna o Centro artificialmente atrativo |
| Shopping | 9 | 3 | favorece a continuação pelo caminho leste |
| Parque | 10 | 16 | desprioriza o caminho mais curto |

Essa versão não representa uma estimativa melhor. Ela funciona como um experimento de sensibilidade: ao distorcer a percepção de proximidade, a ordem de exploração muda.

## 5. Algoritmo

### 5.1 Estratégia

A Greedy Best-First Search mantém uma lista de estados abertos. A cada passo, ordena essa lista pelo menor $h(n)$ e remove o primeiro elemento. O estado removido é marcado como visitado; se não for o objetivo, seus vizinhos ainda não conhecidos são adicionados à lista.

O algoritmo implementado usa:

- conjunto de visitados para evitar reprocessamento;
- predecessores para reconstruir a rota;
- lista aberta global, e não apenas os vizinhos do último estado;
- desempate alfabético quando os valores heurísticos são iguais;
- histórico detalhado para alimentar a visualização e o log.

### 5.2 Pseudocódigo

```text
abertos <- [inicio]
visitados <- conjunto vazio
predecessores <- mapa vazio

enquanto abertos não estiver vazio:
    ordenar abertos por h(n) crescente e nome alfabético
    atual <- remover primeiro elemento
    adicionar atual a visitados

    se atual for o objetivo:
        reconstruir caminho usando predecessores
        retornar sucesso

    para cada vizinho de atual:
        se vizinho não estiver em visitados nem em abertos:
            predecessores[vizinho] <- atual
            adicionar vizinho a abertos

retornar falha
```

### 5.3 Critério de desempate

O método `sortAbertos` compara primeiro os valores heurísticos. Quando há empate, compara os nomes dos estados com `localeCompare`. Esse critério torna a execução determinística e facilita a conferência dos resultados.

## 6. Implementação da aplicação

A aplicação foi dividida em módulos com responsabilidades específicas:

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | estrutura semântica e controles da página |
| `css/style.css` | layout, cores, responsividade e estados visuais |
| `js/graph.js` | estados, posições, arestas e heurísticas |
| `js/search.js` | estado interno e operações da busca |
| `js/visualization.js` | criação do grafo e animações |
| `js/app.js` | eventos, execução, log e resultados |

O Cytoscape.js desenha o grafo e permite aplicar classes visuais aos estados em execução. O usuário consegue diferenciar origem, objetivo, estados abertos, visitados, em expansão e pertencentes ao caminho final.

## 7. Experimentos e resultados

Os resultados abaixo correspondem à execução do algoritmo com origem `Base` e objetivo `Hospital`.

### 7.1 Experimento A: heurística original

| Etapa | Estado selecionado | Estados adicionados | Próxima escolha |
|---:|---|---|---|
| 1 | Base ($h=18$) | Centro (13), Rodoviária (15), Parque (10) | Parque |
| 2 | Parque ($h=10$) | Universidade (7), Estádio (12) | Universidade |
| 3 | Universidade ($h=7$) | Ponte (4) | Ponte |
| 4 | Ponte ($h=4$) | Hospital (0) | Hospital |
| 5 | Hospital ($h=0$) | nenhum | objetivo encontrado |

**Caminho:** Base → Parque → Universidade → Ponte → Hospital<br>
**Estados visitados:** 5<br>
**Estados expandidos:** 4<br>
**Arestas percorridas:** 4

### 7.2 Experimento B: heurística modificada

| Etapa | Estado selecionado | Estados adicionados | Próxima escolha |
|---:|---|---|---|
| 1 | Base ($h=18$) | Centro (4), Rodoviária (15), Parque (16) | Centro |
| 2 | Centro ($h=4$) | Aeroporto (14), Shopping (3) | Shopping |
| 3 | Shopping ($h=3$) | Terminal (11) | Terminal |
| 4 | Terminal ($h=11$) | Praça (6) | Praça |
| 5 | Praça ($h=6$) | Ponte (4) | Ponte |
| 6 | Ponte ($h=4$) | Hospital (0) | Hospital |
| 7 | Hospital ($h=0$) | nenhum | objetivo encontrado |

**Caminho:** Base → Centro → Shopping → Terminal → Praça → Ponte → Hospital<br>
**Estados visitados:** 7<br>
**Estados expandidos:** 6<br>
**Arestas percorridas:** 6

## 8. Comparação e discussão

| Métrica | Original | Modificada | Variação |
|---|---:|---:|---:|
| Estados no caminho | 5 | 7 | +2 |
| Arestas percorridas | 4 | 6 | +2 |
| Estados visitados | 5 | 7 | +2 |
| Estados expandidos | 4 | 6 | +2 |

A heurística original prioriza Parque, Universidade e Ponte, que formam a rota mais curta neste grafo. Já a heurística modificada reduz artificialmente os valores de Centro e Shopping e aumenta o de Parque. Como consequência, a busca percorre a região leste antes de chegar à Ponte.

O experimento confirma duas propriedades importantes:

1. a busca gulosa escolhe o menor valor heurístico disponível, mesmo que essa escolha não leve ao caminho globalmente mais curto;
2. uma heurística distorcida pode aumentar a quantidade de expansões e o tamanho da solução encontrada.

É importante não confundir esse resultado com uma prova de que a primeira heurística é sempre ótima. A Greedy Best-First Search não acumula o custo do caminho percorrido. Em um grafo diferente, uma estimativa aparentemente boa também poderia levar a uma solução subótima.

## 9. Avaliação dos requisitos

| Requisito do cenário | Resultado |
|---|---|
| Pelo menos 10 estados | atendido: 12 estados |
| Pelo menos 14 conexões | atendido: 16 arestas direcionadas |
| Pelo menos 3 caminhos | atendido: 3 rotas completas |
| Estado sem saída | atendido: Aeroporto |
| Caminho enganoso | atendido: Centro → Shopping → Terminal |
| Heurística nula no objetivo | atendido: Hospital = 0 |
| Visualização do processo | atendido: grafo, animação e log |
| Comparação de heurísticas | atendido: modo de comparação da interface |

## 10. Tecnologias e execução

O projeto utiliza HTML5, CSS3 e JavaScript ES6+, sem um servidor de aplicação ou etapa de compilação. Cytoscape.js é responsável pela visualização do grafo e Lucide fornece os ícones da interface. As bibliotecas são carregadas por CDN.

Para executar, basta abrir `index.html` ou iniciar um servidor estático no diretório do projeto:

```bash
python -m http.server 8080
```

Em seguida, a aplicação fica disponível em `http://localhost:8080`.

## 11. Limitações e melhorias futuras

O grafo é fixo e os valores heurísticos são definidos manualmente. A aplicação também não atribui pesos às arestas, portanto mede o caminho em quantidade de conexões e não em tempo, distância ou custo real.

Como extensões, seria possível permitir a criação de estados pela interface, editar valores de $h(n)$ em tempo real, adicionar pesos às arestas e comparar a busca gulosa com o algoritmo A*. Também seria interessante incluir testes automatizados para validar a contagem de caminhos, o critério de desempate e os resultados esperados de cada heurística.

## 12. Conclusão

O projeto alcançou o objetivo de tornar visível o funcionamento de uma busca heurística em um grafo direcionado. A execução original encontrou uma rota menor porque seus valores orientaram a busca pelo eixo mais favorável. Ao modificar três estimativas, o experimento produziu uma rota mais longa e exigiu mais expansões.

Mais do que exibir uma rota, a aplicação mostra por que ela foi escolhida. Essa característica torna o projeto útil para estudar a relação entre representação do problema, função heurística, ordem de exploração e qualidade da solução.
