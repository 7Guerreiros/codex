/**
 * CONQUISTAS_SISTEMA.js
 * Versão: 1.0
 *
 * ================================================================
 * PROPÓSITO
 * ================================================================
 * Motor do sistema de conquistas. Responsável por:
 *   1. Salvar o ID de cada conquista desbloqueada em localStorage.
 *   2. Exibir um popup temporário (estilo Steam) na primeira vez
 *      que uma conquista é desbloqueada.
 *   3. Expor uma API simples para outras páginas consultarem quais
 *      conquistas já foram desbloqueadas (usado por
 *      IFRAME_CODEX_MACHINAE.html para montar o grid).
 *
 * DEPENDÊNCIAS:
 *   - CONQUISTAS_LISTA.js deve estar carregado antes de qualquer
 *     chamada a desbloquear() (não precisa carregar antes deste
 *     ficheiro — só antes do primeiro clique do utilizador).
 *   - Variáveis de tema (--bg, --text, --borda) do Sistema_Tema.js,
 *     para o popup respeitar o tema claro/escuro. Se não existirem
 *     (ficheiro aberto isolado), usa os fallbacks definidos aqui.
 *
 * ONDE É CARREGADO:
 *   Apenas nos Codex que usam conquistas (ex.: CODEX_LIVRO.html) e
 *   em IFRAME_CODEX_MACHINAE.html. NÃO é carregado no index.html
 *   nem no CODEX_BLOG.html — Codex sem conquistas não pagam o
 *   custo deste ficheiro.
 *
 * API PÚBLICA (window.ConquistasSistema):
 *   .desbloquear(id)        → regista o ID e mostra o popup (só na
 *                              primeira vez; chamadas repetidas com
 *                              o mesmo ID são ignoradas em silêncio)
 *   .listarDesbloqueadas()  → devolve array de IDs já desbloqueados
 * ================================================================
 */
(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Alterar aqui a posição, duração ou tamanho do popup, sem tocar
    // no resto do ficheiro.
    const CONFIG = {
        storageKey: 'conquistas_desbloqueadas',
        duracaoPopup: 15000,   // 15 segundos, em milissegundos
        animacaoMs: 300,       // duração da transição de entrada/saída
        posicao: { bottom: '24px', right: '24px' },
        largura: '340px'
    };

    // =================================================================================
    // SEÇÃO 2: ESTILOS CSS (INJETADOS)
    // =================================================================================
    function injectPopupStyles() {
        const styleId = 'sys-conquistas-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            #conquista-popup {
                position: fixed;
                bottom: ${CONFIG.posicao.bottom};
                right: ${CONFIG.posicao.right};
                width: ${CONFIG.largura};
                max-width: calc(100% - 48px);
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px;
                background-color: var(--bg, #ffffff);
                color: var(--text, #1a1a1a);
                border: 1px solid var(--borda, #cccccc);
                border-radius: 6px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                font-family: 'Georgia', 'Times New Roman', serif;
                z-index: 1500;
                opacity: 0;
                transform: translateY(16px);
                transition: opacity ${CONFIG.animacaoMs}ms ease, transform ${CONFIG.animacaoMs}ms ease;
                pointer-events: none;
            }
            #conquista-popup.visivel {
                opacity: 1;
                transform: translateY(0);
            }
            #conquista-popup .cp-imagem {
                width: 56px;
                height: 56px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid var(--borda, #cccccc);
                flex-shrink: 0;
            }
            #conquista-popup .cp-texto {
                min-width: 0;
            }
            #conquista-popup .cp-eyebrow {
                font-size: 0.7rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                opacity: 0.6;
                margin: 0 0 2px;
            }
            #conquista-popup .cp-nome {
                font-size: 1rem;
                font-weight: bold;
                margin: 0 0 2px;
            }
            #conquista-popup .cp-descricao {
                font-size: 0.8rem;
                opacity: 0.75;
                margin: 0;
                line-height: 1.4;
            }

            @media (max-width: 480px) {
                #conquista-popup {
                    left: 24px;
                    right: 24px;
                    width: auto;
                }
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // =================================================================================
    // SEÇÃO 3: LEITURA E ESCRITA NO LOCALSTORAGE
    // =================================================================================
    // Formato salvo: um array JSON simples de IDs, ex.: ["REGN-CAP01-01", ...]
    function listarDesbloqueadas() {
        try {
            const dados = JSON.parse(localStorage.getItem(CONFIG.storageKey));
            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            return [];
        }
    }

    /* Devolve true se o ID era novo (primeira vez), false se já existia */
    function salvarDesbloqueada(id) {
        const lista = listarDesbloqueadas();
        if (lista.indexOf(id) !== -1) return false;
        lista.push(id);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(lista));
        return true;
    }

    // =================================================================================
    // SEÇÃO 4: POPUP (ESTILO STEAM) — COM FILA
    // =================================================================================
    // Se duas conquistas forem desbloqueadas quase ao mesmo tempo
    // (ex.: capítulo com múltiplas ilustrações), os popups aparecem
    // em sequência, nunca sobrepostos.
    let filaPopup = [];
    let popupAtivo = false;

    function exibirPopup(dados) {
        filaPopup.push(dados);
        if (!popupAtivo) processarFila();
    }

    function processarFila() {
        if (filaPopup.length === 0) {
            popupAtivo = false;
            return;
        }
        popupAtivo = true;
        const dados = filaPopup.shift();

        const popup = document.createElement('div');
        popup.id = 'conquista-popup';
        popup.innerHTML =
            '<img class="cp-imagem" src="' + (dados.imagens ? dados.imagens[0] : dados.imagem) + '" alt="">' +
            '<div class="cp-texto">' +
                '<p class="cp-eyebrow">Conquista desbloqueada em ♥️</p>' +
                '<p class="cp-nome">' + dados.nome + '</p>' +
                '<p class="cp-descricao">' + dados.descricao + '</p>' +
            '</div>';

        document.body.appendChild(popup);

        requestAnimationFrame(function () {
            popup.classList.add('visivel');
        });

        setTimeout(function () {
            popup.classList.remove('visivel');
            setTimeout(function () {
                popup.remove();
                processarFila();
            }, CONFIG.animacaoMs);
        }, CONFIG.duracaoPopup);
    }

    // =================================================================================
    // SEÇÃO 5: API PÚBLICA
    // =================================================================================
    function desbloquear(id) {
        if (!id) return;

        const eNova = salvarDesbloqueada(id);
        if (!eNova) return; /* já desbloqueada antes — fica em silêncio */

        const lista = window.CONQUISTAS_LISTA || {};
        const dados = lista[id];
        if (!dados) {
            /* ID válido mas sem entrada em CONQUISTAS_LISTA.js — a
               conquista fica salva (o capítulo continua a funcionar
               normalmente), mas nada é exibido. Aviso só no console,
               para ajudar a detectar IDs esquecidos na lista. */
            console.warn('[CONQUISTAS] ID sem dados em CONQUISTAS_LISTA.js:', id);
            return;
        }
        exibirPopup(dados);
    }

    // =================================================================================
    // SEÇÃO 6: INICIALIZAÇÃO
    // =================================================================================
    function initialize() {
        injectPopupStyles();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    window.ConquistasSistema = {
        desbloquear: desbloquear,
        listarDesbloqueadas: listarDesbloqueadas
    };

})();
