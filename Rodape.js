(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Alterar aqui o texto do rodapé, sem tocar no resto do ficheiro.
    const CONFIG = {
        linha1: '&copy; Litteræ Videogamis 空手道 et Fides Christiana',
        linha2: 'OPUS HOMINIS [SMALLWEB Build \u03b1 - 4.0]'
    };

    // =================================================================================
    // SEÇÃO 2: CONSTRUÇÃO DO DOM DO RODAPÉ
    // =================================================================================
    // Monta o mesmo <footer> que antes estava fixo no index.html, com o
    // mesmo texto, mesmos caracteres especiais e mesma estrutura de parágrafos.
    function construirRodape() {
        const footer = document.createElement('footer');
        footer.innerHTML =
            '<p>' + CONFIG.linha1 + '</p>' +
            '<p>' + CONFIG.linha2 + '</p>';

        // Insere no final do <body>, na mesma posição de sempre:
        // depois de <main>, antes dos <script> finais.
        document.body.appendChild(footer);
    }

    // =================================================================================
    // SEÇÃO 3: INICIALIZAÇÃO
    // =================================================================================
    // Nota de manutenção: o estilo do <footer> (position: relative; z-index: 1)
    // continua a viver na regra partilhada "#site-nav, main, footer" dentro de
    // Banner.js — não foi duplicado aqui para evitar duas fontes de verdade
    // para a mesma regra. O selector genérico "footer" continua a apanhar
    // este elemento normalmente, mesmo sendo recriado via JS.
    function initialize() {
        construirRodape();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
