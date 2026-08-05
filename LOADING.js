/**
 * LOADING.js
 * Versão: 1.0
 *
 * ================================================================
 * PROPÓSITO
 * ================================================================
 * Exibe um pequeno popup de "loading" retro (peça de xadrez a girar
 * + palavra LOADING) no canto inferior direito, por 3 segundos,
 * sempre que uma troca de Codex acontece (nível index.html).
 *
 * NÃO altera nenhum ficheiro existente. Funciona "por fora",
 * envolvendo (wrapping) a função window.injectarCodex já exposta
 * pelo <script> inline de index.html — ver SEÇÃO 4.
 *
 * ================================================================
 * COMO LIGAR AO SITE
 * ================================================================
 * Basta adicionar UMA linha em index.html, junto aos outros scripts
 * (Banner.js, Rodape.js, Menus.js), com o atributo defer:
 *
 *     <script src="LOADING.js" defer></script>
 *
 * A posição exacta entre os outros <script defer> não importa: por
 * serem todos "defer", só executam depois do <script> inline que
 * define window.injectarCodex (esse é síncrono e corre antes,
 * durante o parsing). Nenhuma outra alteração é necessária.
 *
 * ================================================================
 * O QUE ACONTECE SE O SCRIPT NÃO FOR LINKADO
 * ================================================================
 * Nada — o site continua a funcionar exactamente como antes. Este
 * ficheiro é 100% opcional e aditivo.
 * ================================================================
 */
(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Alterar aqui para trocar a peça, o texto ou a duração, sem
    // tocar no resto do ficheiro.
    const CONFIG = {
        peca: '&#9820;',       // ♜ torre preta — trocar por qualquer glifo de xadrez
        texto: 'LOADING',
        duracaoMs: 3000,       // tempo total visível do popup
        tamanho: {
            peca: '1.8rem',
            texto: '0.75rem'
        }
    };

    // =================================================================================
    // SEÇÃO 2: ESTILOS CSS (INJETADOS)
    // =================================================================================
    function injectLoadingStyles() {
        const styleId = 'sys-loading-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            #sys-loading-popup {
                position: fixed;
                right: 16px;
                bottom: 16px;
                z-index: 2000;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 16px;
                background-color: var(--bg, #ffffff);
                color: var(--text, #1a1a1a);
                border: 1px solid var(--borda, #cccccc);
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.25);
                font-family: 'Georgia', 'Times New Roman', serif;
                pointer-events: none;
                opacity: 0;
                transform: translateY(12px);
            }

            #sys-loading-popup.sys-loading-visivel {
                animation: sys-loading-popup-anim ${CONFIG.duracaoMs}ms ease forwards;
            }

            @keyframes sys-loading-popup-anim {
                0%   { opacity: 0; transform: translateY(12px); }
                10%  { opacity: 1; transform: translateY(0); }
                85%  { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(12px); }
            }

            #sys-loading-peca {
                font-size: ${CONFIG.tamanho.peca};
                line-height: 1;
                display: inline-block;
                animation: sys-loading-girar 1s linear infinite;
            }

            @keyframes sys-loading-girar {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }

            #sys-loading-texto {
                font-size: ${CONFIG.tamanho.texto};
                letter-spacing: 0.12em;
                font-weight: bold;
            }

            /* Respeita utilizadores que pedem menos animação ao sistema */
            @media (prefers-reduced-motion: reduce) {
                #sys-loading-peca {
                    animation: none;
                }
                #sys-loading-popup.sys-loading-visivel {
                    animation-duration: 0.01ms;
                    animation-iteration-count: 1;
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // =================================================================================
    // SEÇÃO 3: CONSTRUÇÃO DO DOM DO POPUP
    // =================================================================================
    // Cria o popup UMA vez, escondido, e reutiliza-o em cada chamada
    // (ver mostrarLoading), em vez de recriar elementos a cada troca
    // de Codex.
    let popupEl = null;

    function construirPopup() {
        if (popupEl) return popupEl;

        popupEl = document.createElement('div');
        popupEl.id = 'sys-loading-popup';
        popupEl.setAttribute('aria-hidden', 'true');
        popupEl.innerHTML =
            '<span id="sys-loading-peca">' + CONFIG.peca + '</span>' +
            '<span id="sys-loading-texto">' + CONFIG.texto + '</span>';

        document.body.appendChild(popupEl);
        return popupEl;
    }

    // =================================================================================
    // SEÇÃO 4: MOSTRAR/ESCONDER + ENGATE EM window.injectarCodex
    // =================================================================================
    // FUNCIONAMENTO:
    //   mostrarLoading() reinicia a animação do popup (removendo e
    //   reaplicando a classe, para permitir re-disparar mesmo que
    //   já esteja visível — ex.: cliques rápidos e sucessivos no
    //   menu). O popup fica visível por exactamente CONFIG.duracaoMs,
    //   independentemente do tempo real do fetch().
    //
    // MANUTENÇÃO:
    //   • Duração          : CONFIG.duracaoMs
    //   • Desactivar        : remover a linha <script src="LOADING.js">
    //     do index.html — nenhuma outra alteração é necessária.
    let escondendoTimeoutId = null;

    function mostrarLoading() {
        const popup = construirPopup();

        popup.classList.remove('sys-loading-visivel');
        // Força reflow para permitir reiniciar a animação CSS mesmo
        // que o popup já estivesse a meio de uma exibição anterior.
        void popup.offsetWidth;
        popup.classList.add('sys-loading-visivel');

        if (escondendoTimeoutId) clearTimeout(escondendoTimeoutId);
        escondendoTimeoutId = setTimeout(function () {
            popup.classList.remove('sys-loading-visivel');
        }, CONFIG.duracaoMs);
    }

    // Envolve window.injectarCodex (definido no <script> inline de
    // index.html) para mostrar o popup sempre que uma troca de Codex
    // for pedida — sem alterar o ficheiro original.
    function engatarEmInjectarCodex() {
        if (typeof window.injectarCodex !== 'function') return false;
        if (window.injectarCodex.__semLoadingOriginal) return true; // já engatado

        const injectarCodexOriginal = window.injectarCodex;

        function injectarCodexComLoading(arquivo) {
            mostrarLoading();
            return injectarCodexOriginal(arquivo);
        }
        injectarCodexComLoading.__semLoadingOriginal = injectarCodexOriginal;

        window.injectarCodex = injectarCodexComLoading;
        return true;
    }

    // =================================================================================
    // SEÇÃO 5: INICIALIZAÇÃO
    // =================================================================================
    // window.injectarCodex é definido de forma síncrona pelo <script>
    // inline de index.html, que corre antes deste ficheiro (por este
    // estar marcado como defer). Mesmo assim, um pequeno mecanismo de
    // espera é mantido aqui por segurança, caso a ordem dos scripts
    // seja alterada no futuro.
    function initialize() {
        injectLoadingStyles();
        construirPopup();

        if (engatarEmInjectarCodex()) return;

        let tentativas = 0;
        const intervaloId = setInterval(function () {
            tentativas++;
            if (engatarEmInjectarCodex() || tentativas > 20) {
                clearInterval(intervaloId);
            }
        }, 50);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
