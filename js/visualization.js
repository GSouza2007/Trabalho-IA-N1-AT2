/**
 * ============================================================
 * visualization.js — Renderização do Grafo com Cytoscape.js
 * ============================================================
 *
 * Responsável por:
 *   - Inicializar a instância Cytoscape com o grafo definido
 *   - Aplicar estilos visuais diferenciados por tipo de nó
 *   - Animar expansões, visitas e descoberta de caminhos
 *   - Exibir h(n) como label nos nós
 *   - Destacar o caminho final encontrado
 */

let cy = null; // Instância global do Cytoscape

/**
 * Inicializa o Cytoscape.js no container especificado.
 * @param {string} containerId - ID do elemento HTML container
 * @param {Object} heuristics - Mapa { estado: h(n) } ativo
 */
function initCytoscape(containerId, heuristics) {
  const container = document.getElementById(containerId);

  // Montar nós
  const nodes = getAllEstados().map(estado => ({
    data: {
      id: estado,
      label: `${estado}\nh=${heuristics[estado]}`,
      h: heuristics[estado],
      isInicio: estado === ESTADO_INICIAL,
      isObjetivo: estado === ESTADO_OBJETIVO,
      isBeco: isBecoSemSaida(estado),
    },
    position: getPosition(estado),
  }));

  // Montar arestas
  const edges = getAllEdges().map(([src, tgt], i) => ({
    data: {
      id: `e${i}-${src}-${tgt}`,
      source: src,
      target: tgt,
    },
  }));

  // Destruir instância anterior se existir
  if (cy) {
    cy.destroy();
  }

  cy = cytoscape({
    container: container,
    elements: { nodes, edges },
    
    // Layout preset (posições manuais definidas)
    layout: { name: 'preset' },

    // Interação
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,

    // Estilos dos elementos
    style: [
      // ── Estilo base dos nós ──
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-family': '"Inter", sans-serif',
          'font-size': '11px',
          'font-weight': '600',
          'color': '#e2e8f0',
          'text-outline-color': 'rgba(0,0,0,0.6)',
          'text-outline-width': '2px',
          'width': '70px',
          'height': '70px',
          'background-color': '#334155',
          'border-width': '2px',
          'border-color': '#64748b',
          'shape': 'round-rectangle',
          'corner-radius': '12px',
          'transition-property': 'background-color, border-color, border-width, width, height',
          'transition-duration': '0.3s',
        },
      },

      // ── Estado inicial (Base) ──
      {
        selector: 'node[?isInicio]',
        style: {
          'background-color': '#1e40af',
          'border-color': '#60a5fa',
          'border-width': '3px',
          'color': '#bfdbfe',
        },
      },

      // ── Estado objetivo (Hospital) ──
      {
        selector: 'node[?isObjetivo]',
        style: {
          'background-color': '#065f46',
          'border-color': '#34d399',
          'border-width': '3px',
          'color': '#a7f3d0',
          'shape': 'round-rectangle',
        },
      },

      // ── Beco sem saída (Aeroporto) ──
      {
        selector: 'node[?isBeco]',
        style: {
          'background-color': '#7f1d1d',
          'border-color': '#f87171',
          'border-width': '2px',
          'color': '#fca5a5',
        },
      },

      // ── Estado sendo expandido atualmente ──
      {
        selector: 'node.expanding',
        style: {
          'background-color': '#7c3aed',
          'border-color': '#a78bfa',
          'border-width': '4px',
          'width': '82px',
          'height': '82px',
        },
      },

      // ── Estado visitado (já processado) ──
      {
        selector: 'node.visited',
        style: {
          'background-color': '#475569',
          'border-color': '#94a3b8',
          'border-width': '2px',
          'opacity': 0.7,
        },
      },

      // ── Estado na lista de abertos (disponível) ──
      {
        selector: 'node.open',
        style: {
          'background-color': '#92400e',
          'border-color': '#fbbf24',
          'border-width': '3px',
          'color': '#fef3c7',
        },
      },

      // ── Novo estado descoberto (flash) ──
      {
        selector: 'node.discovered',
        style: {
          'background-color': '#059669',
          'border-color': '#6ee7b7',
          'border-width': '4px',
          'width': '78px',
          'height': '78px',
        },
      },

      // ── Nó no caminho final ──
      {
        selector: 'node.path',
        style: {
          'background-color': '#059669',
          'border-color': '#34d399',
          'border-width': '4px',
          'color': '#ecfdf5',
          'width': '80px',
          'height': '80px',
          'opacity': 1,
        },
      },

      // ── Estilo base das arestas ──
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#475569',
          'target-arrow-color': '#475569',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 1.2,
          'transition-property': 'line-color, target-arrow-color, width',
          'transition-duration': '0.3s',
        },
      },

      // ── Aresta sendo explorada ──
      {
        selector: 'edge.exploring',
        style: {
          'width': 3,
          'line-color': '#a78bfa',
          'target-arrow-color': '#a78bfa',
        },
      },

      // ── Aresta no caminho final ──
      {
        selector: 'edge.path',
        style: {
          'width': 4,
          'line-color': '#34d399',
          'target-arrow-color': '#34d399',
          'arrow-scale': 1.5,
        },
      },
    ],
  });

  // Ajustar visualização
  cy.fit(undefined, 40);
}

/**
 * Reseta todos os estilos visuais dos nós e arestas.
 */
function resetVisualization() {
  if (!cy) return;
  cy.nodes().removeClass('expanding visited open discovered path');
  cy.edges().removeClass('exploring path');
  cy.nodes().style('opacity', 1);
}

/**
 * Atualiza os labels dos nós com novos valores heurísticos.
 * @param {Object} heuristics - Mapa { estado: h(n) }
 */
function updateHeuristicLabels(heuristics) {
  if (!cy) return;
  cy.nodes().forEach(node => {
    const estado = node.id();
    node.data('label', `${estado}\nh=${heuristics[estado]}`);
    node.data('h', heuristics[estado]);
  });
}

/**
 * Anima um passo da busca no grafo.
 * @param {Object} passo - Detalhes do passo (retornado por search.step())
 * @param {number} delay - Delay da animação em ms
 * @returns {Promise} Resolve quando a animação terminar
 */
function animateStep(passo, delay = 600) {
  return new Promise(resolve => {
    if (!cy || !passo) {
      resolve();
      return;
    }

    // Limpar classe 'expanding' e 'discovered' anteriores
    cy.nodes().removeClass('expanding discovered');

    // Marcar todos os visitados
    for (const v of passo.visitados) {
      const node = cy.getElementById(v);
      if (node && !node.data('isObjetivo') && !node.data('isInicio')) {
        node.addClass('visited');
      }
    }

    // Marcar estado expandido
    if (passo.estadoExpandido) {
      const expandNode = cy.getElementById(passo.estadoExpandido);
      if (expandNode) {
        expandNode.removeClass('visited open');
        expandNode.addClass('expanding');
      }
    }

    // Animar arestas exploradas e novos estados
    setTimeout(() => {
      if (passo.novosEstados) {
        for (const novo of passo.novosEstados) {
          // Marcar aresta
          const edgeId = cy.edges().filter(e =>
            e.data('source') === passo.estadoExpandido &&
            e.data('target') === novo.estado
          );
          edgeId.addClass('exploring');

          // Marcar novo nó
          const node = cy.getElementById(novo.estado);
          if (node) {
            node.addClass('discovered');
          }
        }
      }

      // Marcar todos os abertos
      setTimeout(() => {
        cy.nodes().removeClass('discovered');
        if (passo.abertosAtuais) {
          for (const aberto of passo.abertosAtuais) {
            const node = cy.getElementById(aberto.estado);
            if (node && !node.hasClass('expanding')) {
              node.removeClass('visited');
              node.addClass('open');
            }
          }
        }
        resolve();
      }, delay / 2);
    }, delay / 2);
  });
}

/**
 * Anima o caminho final encontrado.
 * @param {string[]} caminho - Lista de estados do caminho
 * @param {number} delay - Delay entre cada nó
 * @returns {Promise}
 */
function animatePath(caminho, delay = 400) {
  return new Promise(async resolve => {
    if (!cy || !caminho || caminho.length === 0) {
      resolve();
      return;
    }

    // Limpar estados anteriores
    cy.nodes().removeClass('expanding open discovered');

    // Animar nó por nó
    for (let i = 0; i < caminho.length; i++) {
      const node = cy.getElementById(caminho[i]);
      if (node) {
        node.removeClass('visited');
        node.addClass('path');
      }

      // Animar aresta entre nós consecutivos
      if (i > 0) {
        const edge = cy.edges().filter(e =>
          e.data('source') === caminho[i - 1] &&
          e.data('target') === caminho[i]
        );
        edge.addClass('path');
      }

      await new Promise(r => setTimeout(r, delay));
    }

    resolve();
  });
}
