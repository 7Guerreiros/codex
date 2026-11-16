/**
 * Versão: 2.1
 */
(function() {
    'use strict';

    const CONFIG = {
        KEY: 'tema',
        CLASS: 'tema-escuro',
        // Definição das variáveis CSS globais
        VARS: `
            :root { --bg: #ffffff; --text: #000000; --borda: #dddddd; --modal-bg: rgba(0,0,0,0.8); }
            html.tema-escuro { --bg: #1a1a1a; --text: #f0f0f0; --borda: #333333; --modal-bg: rgba(0,0,0,0.9); }
            body { background-color: var(--bg); color: var(--text); transition: background 0.2s ease, color 0.2s ease; }
        `
    };

    const isTop = window.self === window.top;

    // MANUTENÇÃO: apenas escolhas manuais são persistidas. Se o armazenamento
    // estiver bloqueado, a escolha continua válida durante esta página.
    let preferencia = null;
    const mediaTema = window.matchMedia('(prefers-color-scheme: dark)');

    function temaValido(valor) {
        return valor === 'escuro' || valor === 'claro';
    }

    function lerPreferencia() {
        try {
            const valor = localStorage.getItem(CONFIG.KEY);
            return temaValido(valor) ? valor : null;
        } catch (erro) {
            return preferencia;
        }
    }

    function temaAutomatico() {
        return mediaTema.matches ? 'escuro' : 'claro';
    }

    const SistemaTema = {
        init: function() {
            // 1. Aplicação Imediata (Anti-Flicker)
            preferencia = lerPreferencia();
            const temaFinal = preferencia || temaAutomatico();

            document.documentElement.classList.toggle(
                CONFIG.CLASS,
                temaFinal === 'escuro'
            );
            this.injectStyles();

            // 2. Lógica de Contexto
            if (isTop) {
                this.setupMaster();
            } else {
                this.setupSlave();
            }

            window.alternarTemaGlobal = () => this.toggle();
        },

        injectStyles: function() {
            const style = document.createElement('style');
            style.textContent = CONFIG.VARS;
            document.head.appendChild(style);
        },

        setupMaster: function() {
            // Escuta mudanças de sistema
            const acompanharSistema = e => {
                preferencia = lerPreferencia();
                if (!preferencia) {
                    this.apply(e.matches ? 'escuro' : 'claro', false);
                }
            };

            if (mediaTema.addEventListener) {
                mediaTema.addEventListener('change', acompanharSistema);
            } else if (mediaTema.addListener) {
                mediaTema.addListener(acompanharSistema);
            }

            // Sincronização entre abas
            window.addEventListener('storage', e => {
                if (e.key !== CONFIG.KEY && e.key !== null) return;

                try {
                    if (e.storageArea && e.storageArea !== localStorage) return;
                } catch (erro) {
                    /* Armazenamento indisponível: mantém o evento. */
                }

                preferencia = temaValido(e.newValue) ? e.newValue : null;
                this.apply(preferencia || temaAutomatico(), false);
            });
        },

        setupSlave: function() {
            // Iframes apenas escutam a página mãe
            window.addEventListener('message', e => {
                // Aceita apenas mensagens válidas da página mãe, da mesma origem.
                if (
                    e.source !== window.parent ||
                    e.origin !== window.location.origin
                ) return;

                if (
                    e.data &&
                    e.data.type === 'SET_THEME' &&
                    temaValido(e.data.theme)
                ) {
                    document.documentElement.classList.toggle(
                        CONFIG.CLASS,
                        e.data.theme === 'escuro'
                    );
                }
            });
        },

        apply: function(tema, salvar = true) {
            if (!temaValido(tema)) tema = temaAutomatico();

            const isEscuro = tema === 'escuro';
            document.documentElement.classList.toggle(CONFIG.CLASS, isEscuro);

            if (salvar) {
                preferencia = tema;

                try {
                    localStorage.setItem(CONFIG.KEY, tema);
                } catch (erro) {
                    /* Mantém a escolha em memória nesta página. */
                }
            }

            // Notifica Iframes
            if (isTop) {
                document.querySelectorAll('iframe').forEach(frame => {
                    frame.contentWindow.postMessage(
                        { type: 'SET_THEME', theme: tema },
                        window.location.origin
                    );
                });
            }
        },

        toggle: function() {
            const novo = document.documentElement.classList.contains(
                CONFIG.CLASS
            ) ? 'claro' : 'escuro';

            this.apply(novo);
            return novo;
        }
    };

    SistemaTema.init();
})();