/**
 * SISTEMA SOBERANO DE TEMAS - ULTRA-LIGHT & HÍBRIDO
 * Versão: 2.0 (Refinada para Performance e Zero Flicker)
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

    const SistemaTema = {
        init: function() {
            // 1. Aplicação Imediata (Anti-Flicker)
            const salvo = localStorage.getItem(CONFIG.KEY);
            const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const temaFinal = salvo || (prefereEscuro ? 'escuro' : 'claro');
            
            document.documentElement.classList.toggle(CONFIG.CLASS, temaFinal === 'escuro');
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
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem(CONFIG.KEY)) this.apply(e.matches ? 'escuro' : 'claro');
            });

            // Sincronização entre abas
            window.addEventListener('storage', e => {
                if (e.key === CONFIG.KEY) this.apply(e.newValue, false);
            });
        },

        setupSlave: function() {
            // Iframes apenas escutam a página mãe
            window.addEventListener('message', e => {
                if (e.data.type === 'SET_THEME') {
                    document.documentElement.classList.toggle(CONFIG.CLASS, e.data.theme === 'escuro');
                }
            });
        },

        apply: function(tema, salvar = true) {
            const isEscuro = tema === 'escuro';
            document.documentElement.classList.toggle(CONFIG.CLASS, isEscuro);
            if (salvar) localStorage.setItem(CONFIG.KEY, tema);

            // Notifica Iframes
            if (isTop) {
                document.querySelectorAll('iframe').forEach(frame => {
                    frame.contentWindow.postMessage({ type: 'SET_THEME', theme: tema }, '*');
                });
            }
        },

        toggle: function() {
            const novo = document.documentElement.classList.contains(CONFIG.CLASS) ? 'claro' : 'escuro';
            this.apply(novo);
            return novo;
        }
    };

    SistemaTema.init();
})();