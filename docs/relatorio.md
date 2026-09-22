# Relatório do Projeto — Busca Heurística: Rota de Emergência Urbana

**Disciplina:** Inteligência Artificial — AT2  
**Objetivo:** Implementar uma Busca Heurística para encontrar uma rota entre a Base de Atendimento e o Hospital Central em uma cidade fictícia.

---

## 1. Descrição do Problema

Uma equipe de emergência precisa se deslocar de uma **Base de Atendimento** até um **Hospital Central** utilizando uma rede de vias urbanas. Cada ponto importante da cidade é representado por um **estado** e cada via entre dois pontos é representada por uma **conexão** no grafo.

O algoritmo utiliza uma **função heurística h(n)** para orientar a escolha do próximo estado a ser explorado, buscando sempre o estado que parece mais próximo do objetivo.

---

## 2. Representação do Grafo

### 2.1 Estados (Nós)

O grafo possui **12 estados**, todos com nomes relacionados ao contexto urbano:

| # | Estado | Descrição |
|---|--------|-----------|
| 1 | **Base** | Origem — Base de Atendimento da equipe de emergência |
| 2 | **Centro** | Zona central da cidade |
| 3 | **Rodoviária** | Terminal rodoviário, região norte |
| 4 | **Parque** | Parque municipal, zona central-sul |
| 5 | **Aeroporto** | **Beco sem saída** — sem conexões de saída |
| 6 | **Shopping** | Centro comercial, zona leste |
| 7 | **Terminal** | Terminal de transporte, zona leste |
| 8 | **Universidade** | Campus universitário |
| 9 | **Estádio** | Estádio esportivo, zona sul-oeste |
| 10 | **Praça** | Praça central, próxima à Ponte |
| 11 | **Ponte** | Ponte sobre o rio, vizinha do Hospital |
| 12 | **Hospital** | **Destino** — Hospital Central |

### 2.2 Conexões (Arestas)

O grafo possui **16 conexões direcionadas**:

| Origem | Destino |
|--------|---------|
| Base | Centro |
| Base | Rodoviária |
| Base | Parque |
| Centro | Aeroporto |
| Centro | Shopping |
| Rodoviária | Parque |
| Parque | Universidade |
| Parque | Estádio |
| Shopping | Terminal |
| Terminal | Praça |
| Universidade | Ponte |
| Estádio | Praça |
| Praça | Ponte |
| Ponte | Hospital |
| Aeroporto | *(sem saída)* |
| Hospital | *(objetivo)* |

### 2.3 Requisitos Atendidos

| Requisito | Status | Detalhes |
|-----------|--------|----------|
| Mínimo 10 estados | ✅ | 12 estados |
| Mínimo 14 conexões | ✅ | 16 conexões |
| ≥ 3 caminhos distintos | ✅ | Caminho 1: Base→Parque→Universidade→Ponte→Hospital; Caminho 2: Base→Parque→Estádio→Praça→Ponte→Hospital; Caminho 3: Base→Centro→Shopping→Terminal→Praça→Ponte→Hospital |
| Estado sem saída | ✅ | Aeroporto (sem conexões de saída) |
| Caminho enganoso | ✅ | Centro→Shopping→Terminal parece promissor (h=9), mas gera caminho mais longo |
| h(n)=0 no objetivo | ✅ | Hospital = 0 |
| Nomes urbanos | ✅ | Todos os nomes são contextualizados |

---

## 3. Definição da Heurística

### 3.1 Critério Escolhido

**Distância Euclidiana Estimada em Blocos Urbanos.**

Cada valor h(n) representa a **distância em linha reta aproximada** entre o estado e o Hospital Central, medida em "blocos urbanos" na planta fictícia da cidade.

### 3.2 Justificativa

A distância em linha reta é uma heurística clássica e admissível para problemas de busca em grafos geográficos. Estados mais próximos geograficamente do Hospital recebem valores menores, orientando a busca na direção correta.

### 3.3 Tabela de Valores h(n)

| Estado | h(n) | Justificativa |
|--------|------|---------------|
| Base | 18 | Ponto mais distante, na periferia norte da cidade |
| Rodoviária | 15 | Região norte, consideravelmente distante do hospital |
| Aeroporto | 14 | Beco sem saída, zona norte-leste distante |
| Centro | 13 | Zona central, ainda relativamente longe |
| Estádio | 12 | Zona sul-oeste, fora do eixo direto ao hospital |
| Terminal | 11 | Zona leste, não está no caminho mais direto |
| Parque | 10 | Zona central-sul, mais próximo do eixo principal |
| Shopping | 9 | Zona leste, aparenta proximidade mas engana |
| Universidade | 7 | Relativamente próximo da Ponte |
| Praça | 6 | Próximo da Ponte, caminho alternativo |
| Ponte | 4 | Vizinho direto do Hospital |
| Hospital | 0 | **Objetivo** — distância zero |

### 3.4 Como os valores foram obtidos

Os valores foram calculados considerando as posições dos estados na planta da cidade fictícia (coordenadas x, y definidas no código). A distância em linha reta de cada estado ao Hospital foi estimada e arredondada para valores inteiros, representando "blocos urbanos".

---

## 4. Critério de Desempate

**Ordem Alfabética.**

Quando dois ou mais estados possuem o mesmo valor heurístico h(n), o estado escolhido é aquele que vem **primeiro na ordem alfabética** (comparação lexicográfica dos nomes).

Implementação no código (`search.js`, método `sortAbertos`):
```javascript
sortAbertos() {
  this.abertos.sort((a, b) => {
    if (a.h !== b.h) return a.h - b.h;       // menor h(n) primeiro
    return a.estado.localeCompare(b.estado);   // desempate alfabético
  });
}
```

---

## 5. Algoritmo Implementado

### 5.1 Greedy Best-First Search

O algoritmo implementado é a **Busca Gulosa por Melhor Primeiro** (Greedy Best-First Search), que seleciona sempre o estado com menor valor heurístico h(n) entre todos os estados disponíveis.

### 5.2 Pseudocódigo

```
FUNÇÃO BuscaHeurística(início, objetivo):
  abertos ← [início]
  visitados ← {}
  predecessores ← {}

  ENQUANTO abertos NÃO está vazio:
    Ordenar abertos por h(n) crescente (desempate: alfabético)
    atual ← remover primeiro de abertos
    Adicionar atual a visitados
    
    SE atual == objetivo:
      Reconstruir caminho via predecessores
      RETORNAR sucesso
    
    PARA CADA vizinho de atual:
      SE vizinho NÃO está em visitados E NÃO está em abertos:
        predecessores[vizinho] ← atual
        Adicionar vizinho a abertos
  
  RETORNAR falha (sem caminho)
```

### 5.3 Características Importantes

1. **Decisões dinâmicas:** O algoritmo NÃO segue rota fixa. As decisões são tomadas durante a execução.
2. **Estados disponíveis globais:** A seleção considera TODOS os estados abertos, não apenas os vizinhos do último expandido.
3. **Controle de ciclos:** Estados visitados não são revisitados.
4. **Reconstrução do caminho:** Via mapa de predecessores (backtracking).

---

## 6. Primeira Execução — Heurística Original

### 6.1 Execução Passo a Passo

**Passo 1:**
- Estado expandido: **Base** (h=18)
- Novos estados: Centro (h=13), Rodoviária (h=15), Parque (h=10)
- Disponíveis: Parque h=10, Centro h=13, Rodoviária h=15
- Próximo escolhido: **Parque** (menor h)

**Passo 2:**
- Estado expandido: **Parque** (h=10)
- Novos estados: Universidade (h=7), Estádio (h=12)
- Disponíveis: Universidade h=7, Estádio h=12, Centro h=13, Rodoviária h=15
- Próximo escolhido: **Universidade** (menor h)

**Passo 3:**
- Estado expandido: **Universidade** (h=7)
- Novos estados: Ponte (h=4)
- Disponíveis: Ponte h=4, Estádio h=12, Centro h=13, Rodoviária h=15
- Próximo escolhido: **Ponte** (menor h)

**Passo 4:**
- Estado expandido: **Ponte** (h=4)
- Novos estados: Hospital (h=0)
- Disponíveis: Hospital h=0, Estádio h=12, Centro h=13, Rodoviária h=15
- Próximo escolhido: **Hospital** (menor h)

**Passo 5:**
- 🎯 **Objetivo encontrado: Hospital**

### 6.2 Resultados

| Critério | Valor |
|----------|-------|
| Origem | Base |
| Destino | Hospital |
| Caminho encontrado | Base → Parque → Universidade → Ponte → Hospital |
| Ordem de visita | Base → Parque → Universidade → Ponte → Hospital |
| Ordem de expansão | Base → Parque → Universidade → Ponte |
| Qtd. estados visitados | 5 |
| Qtd. estados expandidos | 4 |

---

## 7. Segunda Execução — Heurística Modificada

### 7.1 Modificações Realizadas

| Estado | h(n) Original | h(n) Modificada | Motivo |
|--------|--------------|-----------------|--------|
| Centro | 13 | **4** | Tornar Centro muito atrativo, direcionando a busca para lá |
| Parque | 10 | **16** | Afastar a busca do caminho direto |
| Shopping | 9 | **3** | Reforçar o caminho enganoso via Shopping |

### 7.2 Execução Passo a Passo

**Passo 1:**
- Estado expandido: **Base** (h=18)
- Novos estados: Centro (h=4), Rodoviária (h=15), Parque (h=16)
- Disponíveis: Centro h=4, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Centro** (menor h)

**Passo 2:**
- Estado expandido: **Centro** (h=4)
- Novos estados: Aeroporto (h=14), Shopping (h=3)
- Disponíveis: Shopping h=3, Aeroporto h=14, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Shopping** (menor h)

**Passo 3:**
- Estado expandido: **Shopping** (h=3)
- Novos estados: Terminal (h=11)
- Disponíveis: Terminal h=11, Aeroporto h=14, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Terminal** (menor h)

**Passo 4:**
- Estado expandido: **Terminal** (h=11)
- Novos estados: Praça (h=6)
- Disponíveis: Praça h=6, Aeroporto h=14, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Praça** (menor h)

**Passo 5:**
- Estado expandido: **Praça** (h=6)
- Novos estados: Ponte (h=4)
- Disponíveis: Ponte h=4, Aeroporto h=14, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Ponte** (menor h)

**Passo 6:**
- Estado expandido: **Ponte** (h=4)
- Novos estados: Hospital (h=0)
- Disponíveis: Hospital h=0, Aeroporto h=14, Rodoviária h=15, Parque h=16
- Próximo escolhido: **Hospital** (menor h)

**Passo 7:**
- 🎯 **Objetivo encontrado: Hospital**

### 7.3 Resultados

| Critério | Valor |
|----------|-------|
| Origem | Base |
| Destino | Hospital |
| Caminho encontrado | Base → Centro → Shopping → Terminal → Praça → Ponte → Hospital |
| Ordem de visita | Base → Centro → Shopping → Terminal → Praça → Ponte → Hospital |
| Ordem de expansão | Base → Centro → Shopping → Terminal → Praça → Ponte |
| Qtd. estados visitados | 7 |
| Qtd. estados expandidos | 6 |

---

## 8. Comparação dos Resultados

### 8.1 Tabela Comparativa

| Critério | Heurística Original | Heurística Modificada |
|----------|--------------------|-----------------------|
| Caminho encontrado | Base → Parque → Universidade → Ponte → Hospital | Base → Centro → Shopping → Terminal → Praça → Ponte → Hospital |
| Qtd. estados visitados | 5 | 7 |
| Qtd. estados expandidos | 4 | 6 |
| Ordem de visita | Base, Parque, Universidade, Ponte, Hospital | Base, Centro, Shopping, Terminal, Praça, Ponte, Hospital |

### 8.2 Análise

**A ordem de visita mudou?**
Sim. A heurística original levou a busca por Base→Parque→Universidade→Ponte→Hospital, enquanto a modificada direcionou para Base→Centro→Shopping→Terminal→Praça→Ponte→Hospital. A sequência de exploração mudou completamente.

**O caminho encontrado mudou?**
Sim. O caminho original tem 5 estados (4 arestas), enquanto o modificado tem 7 estados (6 arestas). A heurística modificada encontrou um caminho mais longo.

**A quantidade de estados visitados/expandidos mudou?**
Sim. A heurística original visitou 5 estados e expandiu 4, enquanto a modificada visitou 7 e expandiu 6. A heurística modificada foi menos eficiente.

**A heurística modificada direcionou a busca para uma região diferente?**
Sim. Ao reduzir o h(n) do Centro (13→4) e do Shopping (9→3), e aumentar o h(n) do Parque (10→16), a busca foi atraída para a região leste do grafo (Centro→Shopping→Terminal), que é justamente o caminho enganoso. A busca evitou o Parque, que na heurística original era o caminho mais direto.

**Qual heurística apresentou melhor comportamento?**
A **heurística original** apresentou melhor comportamento. Ela encontrou o caminho mais curto (5 estados vs 7) com menos estados visitados (5 vs 7) e expandidos (4 vs 6). Isso ocorre porque os valores originais são mais fiéis à distância real dos estados ao Hospital, orientando a busca de forma mais eficiente. A heurística modificada, por ter valores distorcidos, induziu o algoritmo a explorar o caminho enganoso antes de encontrar o objetivo.

---

## 9. Tecnologias Utilizadas

- **HTML5** — Estrutura semântica da página
- **CSS3** — Design system com dark theme, glassmorphism e animações
- **JavaScript (ES6+)** — Implementação do algoritmo e interface
- **Cytoscape.js** — Biblioteca para visualização interativa de grafos
- **Google Fonts (Inter)** — Tipografia

---

## 10. Repositório

Link do repositório: https://github.com/fe4ugusto/AT2-IA

---

## 11. Conclusão

O projeto demonstrou com sucesso como a função heurística h(n) influencia diretamente o comportamento da Busca Heurística. A visualização interativa permite acompanhar cada decisão do algoritmo, evidenciando os estados candidatos, os valores heurísticos analisados e as escolhas realizadas.

A comparação entre as duas heurísticas confirmou que valores mais precisos (mais próximos da distância real) conduzem a buscas mais eficientes, enquanto valores distorcidos podem levar o algoritmo a explorar regiões desnecessárias do grafo, aumentando o custo da busca mesmo que o objetivo seja eventualmente encontrado.
