/**
 * SISTEMA_LUMINA_CONQUISTAS.js — 1.3
 * Geração: entrada + 10s visíveis + saída + espera de 10s.
 * Conquista: entrada + desbloqueio + 20s visíveis + saída, por imagem.
 * Mesmo ID, armazenamento, aliases e apresentação final.
 * true = pedido aceito; false = já salvo/em fila; null = erro imediato.
 */
(function () {
    'use strict';

    if (window.SistemaLuminaConquistas) {
        window.ConquistasSistema = window.SistemaLuminaConquistas;
        return;
    }

    try {
        if (window.parent !== window &&
            window.parent.location.origin === window.location.origin &&
            window.parent.SistemaLuminaConquistas) {
            window.SistemaLuminaConquistas =
                window.parent.SistemaLuminaConquistas;
            window.ConquistasSistema = window.SistemaLuminaConquistas;
            return;
        }
    } catch (erro) {
        /* Pai inacessível: instância local. */
    }

    const CONFIG = {
        storageKey: 'conquistas_desbloqueadas',
        geracaoMs: 10000,
        esperaMs: 10000,
        duracaoPopup: 20000,
        animacaoMs: 300,
        posicao: {
            bottom: '24px',
            right: '24px'
        },
        largura: '340px'
    };

    let filaPopup = [];
    let popupActual = null;
    let temporizador = null;
    let quadro = null;
    let emProcessamento = false;
    let ciclo = 0;

    const pendentes = new Set();

    function injectPopupStyles() {
        const styleId = 'sys-conquistas-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            #conquista-popup {
                box-sizing: border-box;
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
                z-index: 10500;
                opacity: 0;
                transform: translateY(16px);
                transition:
                    opacity ${CONFIG.animacaoMs}ms ease,
                    transform ${CONFIG.animacaoMs}ms ease;
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
                overflow-wrap: anywhere;
            }

            #conquista-popup .cp-engrenagem {
                transform-origin: 0px 0px;
                animation: lumina-gerar-giro 2.4s linear infinite;
            }

            @keyframes lumina-gerar-giro {
                to {
                    transform: rotate(360deg);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #conquista-popup .cp-engrenagem {
                    animation: none;
                }

                #conquista-popup {
                    transition: none;
                    transform: none;
                }
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

    // ==================== DADOS E ARMAZENAMENTO ====================

    function listaDados() {
        return window.SistemaLuminaIlustracoes ||
            window.CONQUISTAS_LISTA || {};
    }

    function lerRegistos() {
        const bruto = localStorage.getItem(CONFIG.storageKey);
        if (bruto === null) return [];

        const dados = JSON.parse(bruto);

        if (!Array.isArray(dados)) {
            throw new Error('Formato de armazenamento inválido.');
        }

        return Array.from(new Set(dados.filter(function (id) {
            return typeof id === 'string' && id.length > 0;
        })));
    }

    function listarDesbloqueadas() {
        try {
            return lerRegistos();
        } catch (erro) {
            return [];
        }
    }

    function notificar() {
        window.dispatchEvent(
            new CustomEvent('lumina:ilustracoes-alteradas')
        );
    }

    function limpar() {
        try {
            localStorage.removeItem(CONFIG.storageKey);
        } catch (erro) {
            console.warn(
                '[LUMINA] Não foi possível limpar os registos.',
                erro
            );
            return false;
        }

        cancelarFila();
        notificar();
        return true;
    }

    // Cancela notificações e tarefas sem apagar dados salvos.
    function cancelarFila() {
        ciclo++;
        filaPopup.length = 0;
        pendentes.clear();

        clearTimeout(temporizador);

        if (quadro !== null) {
            cancelAnimationFrame(quadro);
        }

        temporizador = quadro = null;

        if (popupActual) {
            popupActual.remove();
        }

        popupActual = null;
        emProcessamento = false;
    }

    // ==================== ENGRENAGEM LOCAL ====================

    function engrenagemGeracao() {
        let d = '';
        const dentes = 20;
        const raio = 24;

        function furo(x, y, r) {
            return ' M ' + (x - r) + ' ' + y +
                ' a ' + r + ' ' + r +
                ' 0 1 0 ' + (2 * r) + ' 0' +
                ' a ' + r + ' ' + r +
                ' 0 1 0 ' + (-2 * r) + ' 0 Z';
        }

        for (let i = 0; i < dentes; i++) {
            [0, .23, .55, .78].forEach(function (f, j) {
                const a = (i + f) * Math.PI * 2 / dentes;
                const r = j === 1 || j === 2
                    ? raio + 2
                    : raio - 2.2;

                d += (i === 0 && j === 0 ? 'M ' : ' L ') +
                    (Math.cos(a) * r).toFixed(3) + ' ' +
                    (Math.sin(a) * r).toFixed(3);
            });
        }

        d += ' Z' + furo(0, 0, raio * .14);

        for (let i = 0; i < 5; i++) {
            const a = i * Math.PI * 2 / 5;

            d += furo(
                Math.cos(a) * raio * .49,
                Math.sin(a) * raio * .49,
                raio * .14
            );
        }

        return '<svg class="cp-imagem" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'viewBox="0 0 72 72" aria-hidden="true" focusable="false">' +
            '<defs>' +
            '<linearGradient id="lumina-geracao-metal" ' +
            'x1="0" y1="0" x2="1" y2="1">' +
            '<stop stop-color="#f1f4f5"/>' +
            '<stop offset=".35" stop-color="#8f9ba3"/>' +
            '<stop offset=".65" stop-color="#d7dfe3"/>' +
            '<stop offset="1" stop-color="#57636d"/>' +
            '</linearGradient>' +
            '</defs>' +
            '<g transform="translate(36 36)">' +
            '<g class="cp-engrenagem">' +
            '<path d="' + d + '" ' +
            'fill="url(#lumina-geracao-metal)" fill-rule="evenodd" ' +
            'stroke="#56616a" stroke-width=".7"/>' +
            '<circle r="18.48" fill="none" stroke="#f4f7f8" ' +
            'stroke-opacity=".45" stroke-width="1.2"/>' +
            '</g>' +
            '<circle r="3" fill="url(#lumina-geracao-metal)" ' +
            'stroke="#535e67"/>' +
            '</g>' +
            '</svg>';
    }

    // ==================== ETAPAS SEM SOBREPOSIÇÃO ====================

    function tempoAnimacao() {
        return window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches ? 0 : CONFIG.animacaoMs;
    }

    function agendar(acao, demora, token) {
        temporizador = setTimeout(function () {
            temporizador = null;

            if (token === ciclo) {
                acao();
            }
        }, demora);
    }

    function retirarPopup(popup, concluido, token) {
        if (token !== ciclo || popupActual !== popup) return;

        popup.classList.remove('visivel');

        agendar(function () {
            popup.remove();
            popupActual = null;
            concluido();
        }, tempoAnimacao(), token);
    }

    function criarPopup(dados, imagemDados) {
        const popup = document.createElement('div');

        popup.id = 'conquista-popup';
        popup.setAttribute('role', 'status');
        popup.setAttribute('aria-live', 'polite');

        popup.innerHTML =
            (imagemDados
                ? '<img class="cp-imagem" alt="">'
                : engrenagemGeracao()) +
            '<div class="cp-texto">' +
            '<p class="cp-eyebrow"></p>' +
            '<p class="cp-nome"></p>' +
            '<p class="cp-descricao"></p>' +
            '</div>';

        popup.querySelector('.cp-eyebrow').textContent = imagemDados
            ? 'Ilustração criada por Lumina'
            : 'Sistema Lumina';

        popup.querySelector('.cp-nome').textContent = imagemDados
            ? (dados.nome || '')
            : 'Gerando ilustrações…';

        popup.querySelector('.cp-descricao').textContent = imagemDados
            ? 'O Sistema Lumina gerou uma ilustração do capítulo. Veja-a em Opus Machina (♥️).'
            : 'Lumina está gerando as imagens deste capítulo.';

        if (imagemDados) {
            const imagem = popup.querySelector('.cp-imagem');
            let tentouReserva = false;

            imagem.addEventListener('error', function () {
                if (!tentouReserva && imagemDados.reserva) {
                    tentouReserva = true;
                    imagem.src = imagemDados.reserva;
                } else {
                    imagem.style.display = 'none';
                }
            });

            if (imagemDados.principal || imagemDados.reserva) {
                imagem.src =
                    imagemDados.principal || imagemDados.reserva;
                tentouReserva = !imagemDados.principal;
            } else {
                imagem.style.display = 'none';
            }
        }

        return popup;
    }

    function mostrarPopup(
        dados, imagem, duracao, aoVisivel, concluido, token
    ) {
        if (token !== ciclo) return;

        const popup = criarPopup(dados, imagem);

        popupActual = popup;
        document.body.appendChild(popup);

        void popup.offsetWidth;

        quadro = requestAnimationFrame(function () {
            quadro = null;

            if (token !== ciclo || popupActual !== popup) return;

            popup.classList.add('visivel');
            void popup.offsetWidth;

            // A duração visível começa quando a entrada termina.
            agendar(function () {
                const ok = !aoVisivel || aoVisivel();

                if (token !== ciclo || popupActual !== popup) return;

                if (!ok) {
                    retirarPopup(popup, function () {
                        concluido(false);
                    }, token);
                    return;
                }

                agendar(function () {
                    retirarPopup(popup, function () {
                        concluido(true);
                    }, token);
                }, duracao, token);
            }, tempoAnimacao(), token);
        });
    }

    function imagensDaConquista(dados) {
        const principais = Array.isArray(dados.imagens_principais)
            ? dados.imagens_principais
            : [dados.imagem_principal];

        const reservas = Array.isArray(dados.imagens_reservas)
            ? dados.imagens_reservas
            : [dados.imagem_reserva];

        const imagens = principais.map(function (url, i) {
            return {
                principal: typeof url === 'string'
                    ? url.trim()
                    : '',
                reserva: typeof reservas[i] === 'string'
                    ? reservas[i].trim()
                    : ''
            };
        }).filter(function (img) {
            return img.principal || img.reserva;
        });

        // Conquista sem imagem continua mostrando o texto.
        return imagens.length
            ? imagens
            : [{ principal: '', reserva: '' }];
    }

    function gravarConquista(id) {
        try {
            const salvos = lerRegistos();

            if (salvos.indexOf(id) !== -1) return false;

            salvos.push(id);

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(salvos)
            );

            notificar();
            return true;
        } catch (erro) {
            console.warn(
                '[LUMINA] Não foi possível guardar a ilustração.',
                erro
            );
            return false;
        }
    }

    function finalizarPedido(pedido, token) {
        if (token !== ciclo) return;

        pendentes.delete(pedido.id);
        emProcessamento = false;
        processarFila();
    }

    function mostrarImagens(pedido, imagens, indice, token) {
        if (token !== ciclo) return;

        if (indice >= imagens.length) {
            finalizarPedido(pedido, token);
            return;
        }

        mostrarPopup(
            pedido.dados,
            imagens[indice],
            CONFIG.duracaoPopup,

            // No fluxo normal, grava ao exibir a primeira imagem.
            indice === 0 && !pedido.imediato
                ? function () {
                    return gravarConquista(pedido.id);
                }
                : null,

            function (ok) {
                if (!ok) {
                    finalizarPedido(pedido, token);
                } else {
                    mostrarImagens(
                        pedido, imagens, indice + 1, token
                    );
                }
            },

            token
        );
    }

    function processarFila() {
        if (emProcessamento ||
            !filaPopup.length ||
            !document.body) return;

        injectPopupStyles();
        emProcessamento = true;

        const pedido = filaPopup.shift();
        const token = ciclo;

        if (pedido.imediato) {
            mostrarImagens(
                pedido,
                imagensDaConquista(pedido.dados),
                0,
                token
            );
            return;
        }

        mostrarPopup(
            pedido.dados,
            null,
            CONFIG.geracaoMs,
            null,

            function () {
                // A espera começa após a saída do aviso de geração.
                agendar(function () {
                    mostrarImagens(
                        pedido,
                        imagensDaConquista(pedido.dados),
                        0,
                        token
                    );
                }, CONFIG.esperaMs, token);
            },

            token
        );
    }

    // ==================== API DOS CODEX E CHEATS ====================

    function desbloquear(id) {
        if (typeof id !== 'string' || !id) return null;

        const dados = listaDados();

        if (!Object.prototype.hasOwnProperty.call(dados, id)) {
            console.warn(
                '[LUMINA] ID de ilustração não cadastrado:',
                id
            );
            return null;
        }

        let salvos;

        try {
            salvos = lerRegistos();
        } catch (erro) {
            console.warn(
                '[LUMINA] Não foi possível consultar os registos.',
                erro
            );
            return null;
        }

        if (salvos.indexOf(id) !== -1 || pendentes.has(id)) {
            return false;
        }

        pendentes.add(id);
        filaPopup.push({
            id: id,
            dados: dados[id]
        });

        processarFila();
        return true;
    }

    // Exceção para o cheat: liberação imediata em uma escrita.
    // Retorna novos IDs; 0 = já disponíveis; null = falha.
    function desbloquearTodas() {
        const dados = listaDados();
        const ids = Object.keys(dados);

        if (!ids.length) return null;

        let novos;

        try {
            const salvos = lerRegistos();

            novos = ids.filter(function (id) {
                return salvos.indexOf(id) === -1;
            });

            if (!novos.length) return 0;

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(salvos.concat(novos))
            );
        } catch (erro) {
            console.warn(
                '[LUMINA] Não foi possível liberar as ilustrações.',
                erro
            );
            return null;
        }

        // Cancela tarefas antigas após a gravação ter dado certo.
        cancelarFila();

        novos.forEach(function (id) {
            pendentes.add(id);
            filaPopup.push({
                id: id,
                dados: dados[id],
                imediato: true
            });
        });

        notificar();
        processarFila();

        return novos.length;
    }

    const api = {
        desbloquear: desbloquear,
        desbloquearTodas: desbloquearTodas,
        listarDesbloqueadas: listarDesbloqueadas,
        limpar: limpar
    };

    window.SistemaLuminaConquistas = api;
    window.ConquistasSistema = api;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            injectPopupStyles();
            processarFila();
        }, { once: true });
    } else {
        injectPopupStyles();
        processarFila();
    }
}());