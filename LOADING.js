/**
 * LOADING.js — 2.1
 * Engrenagens maciças em SVG local, sem imagens, GIFs, fontes ou bibliotecas.
 * Mantém o popup no canto inferior direito durante 3 segundos por troca
 * de Codex, independentemente da duração real do carregamento.
 * LIGAÇÃO: <script src="LOADING.js" defer></script>
 */
(function () {
    'use strict';

    // =====================================================================
    // 1. CONFIGURAÇÃO
    // MANUTENÇÃO: duração em milissegundos; escala em píxeis CSS.
    // =====================================================================
    const CONFIG = { duracaoMs: 3000, largura: 124, altura: 95 };
    let popupEl = null;
    let escondendoTimeoutId = null;

    // =====================================================================
    // 2. DESENHO — três rodas, sem motor, fios, base ou moldura.
    // MANUTENÇÃO: os padrões abaixo definem posição, dentes e metal.
    // Raio primitivo = dentes × 1.25; a distância entre eixos é a soma
    // dos raios. Fases e sentidos são calculados para rodas engrenadas.
    // A duração mantém a relação original: dentes × 0.12 segundos.
    // =====================================================================
    function circuloVazado(x, y, r) {
        return ' M ' + (x - r) + ' ' + y +
            ' a ' + r + ' ' + r + ' 0 1 0 ' + (r * 2) + ' 0' +
            ' a ' + r + ' ' + r + ' 0 1 0 ' + (-r * 2) + ' 0 Z';
    }

    const METAIS = {
        prata: {
            cores: ['#f1f4f5', '#8f9bA3', '#d7dfe3', '#57636d'],
            borda: '#56616a',
            luz: '#f4f7f8',
            eixo: '#535e67'
        },
        ouro: {
            cores: ['#d2bb80', '#967447', '#bda163', '#665037'],
            borda: '#665037',
            luz: '#dfca94',
            eixo: '#705334'
        }
    };

    // A primeira roda é a motriz. "liga" indica o índice da roda anterior
    // que move a peça; "angulo" posiciona o contacto, em graus.
    const PADROES = [
        {
            nome: 'prateado',
            rodas: [
                { x: 35, y: 65, dentes: 20, metal: 'prata' },
                { liga: 0, angulo: 0, dentes: 14, metal: 'prata' },
                { liga: 1, angulo: -45, dentes: 12, metal: 'prata' }
            ]
        },
        {
            nome: 'dourado',
            rodas: [
                { x: 43, y: 35, dentes: 24, metal: 'ouro' },
                { liga: 0, angulo: 0, dentes: 12, metal: 'ouro' },
                { liga: 1, angulo: 90, dentes: 18, metal: 'ouro' }
            ]
        },
        {
            nome: 'misto',
            rodas: [
                { x: 76, y: 65, dentes: 24, metal: 'prata' },
                { liga: 0, angulo: -155, dentes: 14, metal: 'ouro' },
                { liga: 0, angulo: -25, dentes: 12, metal: 'prata' }
            ]
        }
    ];

    function prepararRodas(padrao) {
        return padrao.rodas.reduce(function (rodas, definicao) {
            const roda = Object.assign({}, definicao);
            roda.raio = roda.dentes * 1.25;

            if (typeof roda.liga === 'number') {
                const anterior = rodas[roda.liga];
                const angulo = roda.angulo * Math.PI / 180;
                const distancia = anterior.raio + roda.raio;

                roda.x = anterior.x + Math.cos(angulo) * distancia;
                roda.y = anterior.y + Math.sin(angulo) * distancia;

                roda.sentido = anterior.sentido === 'normal'
                    ? 'reverse'
                    : 'normal';

                // Centro do dente de uma roda encontra o vão da outra.
                const fraccao =
                    (roda.angulo - anterior.fase) /
                    (360 / anterior.dentes);

                roda.fase =
                    roda.angulo + 180 -
                    (360 / roda.dentes) * (1.28 - fraccao);
            } else {
                roda.sentido = 'normal';
                roda.fase = 0;
            }

            rodas.push(roda);
            return rodas;
        }, []);
    }

    function engrenagem(roda) {
        let contorno = '';
        const raio = roda.raio;
        const passo = Math.PI * 2 / roda.dentes;
        const metal = METAIS[roda.metal];

        for (let i = 0; i < roda.dentes; i++) {
            [0, 0.23, 0.55, 0.78].forEach(function (f, j) {
                const a =
                    (i + f) * passo +
                    roda.fase * Math.PI / 180;

                const r = (j === 1 || j === 2)
                    ? raio + 2
                    : raio - 2.2;

                contorno += (i === 0 && j === 0 ? 'M ' : ' L ') +
                    (Math.cos(a) * r).toFixed(3) + ' ' +
                    (Math.sin(a) * r).toFixed(3);
            });
        }

        contorno += ' Z' + circuloVazado(0, 0, raio * 0.14);

        for (let i = 0; i < 5; i++) {
            const a = i * Math.PI * 2 / 5;

            contorno += circuloVazado(
                Math.cos(a) * raio * 0.49,
                Math.sin(a) * raio * 0.49,
                raio * 0.14
            );
        }

        return '<g transform="translate(' + roda.x + ' ' + roda.y + ')">' +
            '<g class="sys-loading-rotor" style="animation-duration:' +
            (roda.dentes * 0.12) + 's;animation-direction:' + roda.sentido + '">' +
            '<path d="' + contorno + '" fill-rule="evenodd" fill="url(#sys-loading-' + roda.metal + ')" ' +
            'stroke="' + metal.borda + '" stroke-width="0.7" stroke-linejoin="round"/>' +
            '<circle r="' + raio * 0.77 + '" fill="none" stroke="' + metal.luz + '" stroke-opacity=".45" stroke-width="1.2"/>' +
            '<circle r="' + raio * 0.23 + '" fill="none" stroke="' + metal.eixo + '" stroke-width="1.4"/>' +
            '</g></g>';
    }

    function desenho() {
        const padrao = PADROES[
            Math.floor(Math.random() * PADROES.length)
        ];

        let gradientes = '';

        Object.keys(METAIS).forEach(function (nome) {
            const cores = METAIS[nome].cores;

            gradientes += '<linearGradient id="sys-loading-' + nome + '" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0" stop-color="' + cores[0] + '"/><stop offset=".35" stop-color="' + cores[1] + '"/>' +
                '<stop offset=".65" stop-color="' + cores[2] + '"/><stop offset="1" stop-color="' + cores[3] + '"/></linearGradient>';
        });

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 146 112" ' +
            'width="124" height="95" aria-hidden="true" focusable="false" data-padrao="' + padrao.nome + '">' +
            '<defs>' + gradientes + '</defs>' +
            prepararRodas(padrao).map(engrenagem).join('') +
            '</svg>';
    }

    // =====================================================================
    // 3. ESTILOS — animações CSS; sem palavra visível ou dependência externa.
    // Só anima enquanto o popup está activo. Movimento reduzido: peças paradas.
    // =====================================================================
    function injectLoadingStyles() {
        if (document.getElementById('sys-loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'sys-loading-styles';

        style.textContent = `
            #sys-loading-popup {
                position: fixed; right: 24px; bottom: 24px; z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                padding: 0;
                background: transparent;
                color: var(--text, #1a1a1a);
                border: none;
                border-radius: 0;
                box-shadow: none;
                pointer-events: none; opacity: 0;
                visibility: hidden; transform: translateY(12px);
            }
            #sys-loading-popup svg {
                display: block; width: ${CONFIG.largura}px;
                height: auto; max-width: calc(100vw - 76px);
            }
            #sys-loading-popup .sys-loading-rotor {
                transform-origin: 0px 0px;
                animation: sys-loading-girar 4.8s linear infinite;
                animation-play-state: paused;
            }
            #sys-loading-popup.sys-loading-visivel {
                visibility: visible;
                animation: sys-loading-popup-anim ${CONFIG.duracaoMs}ms ease forwards;
            }
            #sys-loading-popup.sys-loading-visivel .sys-loading-rotor {
                animation-play-state: running;
            }
            @keyframes sys-loading-popup-anim {
                0% { opacity: 0; transform: translateY(12px); }
                10%, 85% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(12px); }
            }
            @keyframes sys-loading-girar {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                #sys-loading-popup .sys-loading-rotor { animation: none; }
                #sys-loading-popup.sys-loading-visivel {
                    animation: none; opacity: 1; transform: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =====================================================================
    // 4. POPUP REUTILIZÁVEL
    // =====================================================================
    function construirPopup() {
        if (popupEl) return popupEl;

        popupEl = document.getElementById('sys-loading-popup');
        if (popupEl) return popupEl;

        popupEl = document.createElement('div');
        popupEl.id = 'sys-loading-popup';
        popupEl.setAttribute('aria-hidden', 'true');

        // O desenho é sorteado apenas quando o popup vai aparecer.
        document.body.appendChild(popupEl);

        return popupEl;
    }

    function mostrarLoading() {
        const popup = construirPopup();

        popup.innerHTML = desenho();
        popup.classList.remove('sys-loading-visivel');

        void popup.offsetWidth;

        popup.classList.add('sys-loading-visivel');

        if (escondendoTimeoutId) {
            clearTimeout(escondendoTimeoutId);
        }

        escondendoTimeoutId = setTimeout(function () {
            popup.classList.remove('sys-loading-visivel');
        }, CONFIG.duracaoMs);
    }

    // =====================================================================
    // 5. INTEGRAÇÃO
    // Preserva argumentos, contexto e retorno do injector.
    //
    // O segundo argumento true identifica a abertura inicial:
    // nesse caso, carrega o Codex sem mostrar as engrenagens.
    //
    // Nas trocas, o argumento é omitido ou false.
    // A duração permanece fixa, independentemente do fetch.
    // =====================================================================
    function engatarEmInjectarCodex() {
        if (typeof window.injectarCodex !== 'function') return false;
        if (window.injectarCodex.__semLoadingOriginal) return true;

        const original = window.injectarCodex;

        function comLoading() {
            if (arguments[1] !== true) mostrarLoading();

            return original.apply(this, arguments);
        }

        comLoading.__semLoadingOriginal = original;
        window.injectarCodex = comLoading;

        return true;
    }

    function initialize() {
        injectLoadingStyles();
        construirPopup();

        if (engatarEmInjectarCodex()) return;

        let tentativas = 0;

        const intervaloId = setInterval(function () {
            tentativas++;

            if (
                engatarEmInjectarCodex() ||
                tentativas > 20
            ) {
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