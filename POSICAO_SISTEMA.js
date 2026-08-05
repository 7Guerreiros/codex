/**
 * POSICAO_SISTEMA.js
 * Versão: 1.0
 *
 * ================================================================
 * PROPÓSITO
 * ================================================================
 * Lembra o último Codex e o último capítulo abertos pelo utilizador
 * e restaura essa posição ao reabrir o site — tudo via localStorage,
 * sem tocar na lógica interna de nenhum Codex.
 *
 * ================================================================
 * COMO SE LIGA AO RESTO DO SITE, SEM ALTERAR MAIS NADA
 * ================================================================
 * 1. "Embrulha" window.injectarCodex por fora (sem editar a sua
 *    definição, em index.html): toda vez que qualquer Codex for
 *    injetado — carregamento inicial ou clique de menu — o nome do
 *    ficheiro é salvo em localStorage.
 * 2. Escuta cliques em QUALQUER .cb-topico-btn por delegação de
 *    eventos, na fase de CAPTURA (antes do próprio Codex processar
 *    o clique) — assim sabe se aquele clique vai abrir ou fechar o
 *    tópico, sem depender do estado da animação/fetch de cada
 *    Codex. Se for abertura, salva o data-arquivo do capítulo.
 * 3. Observa a .area-conteudo com MutationObserver. Na primeira vez
 *    que o conteúdo mudar (ou seja, assim que o Codex inicial for
 *    injetado), procura o capítulo salvo e simula um clique nele —
 *    reaproveitando o próprio motor de accordion de cada Codex, sem
 *    duplicar nenhuma lógica de abrir/carregar.
 *
 * Funciona com QUALQUER Codex presente ou futuro que siga o mesmo
 * padrão (.cb-topico com atributo data-arquivo) — nenhum Codex
 * precisa saber que este sistema existe.
 *
 * ================================================================
 * REMOÇÃO DO SISTEMA
 * ================================================================
 * 1. Apagar este ficheiro e a tag <script src="POSICAO_SISTEMA.js">
 *    em index.html (bloco "INÍCIO/FIM — SISTEMA DE POSIÇÃO").
 * 2. Opcional: repor a linha original em index.html (ver bloco
 *    equivalente junto à chamada de injectarCodex()) — não é
 *    obrigatório, o site volta a funcionar normalmente mesmo sem
 *    esse passo.
 * Nenhum Codex (CODEX_LIVRO.html, CODEX_BLOG.html, etc.) precisa
 * ser tocado em nenhum dos dois casos.
 * ================================================================
 */
(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    var CONFIG = {
        chaveCodex: 'site_ultimo_codex',
        chaveCapitulo: 'site_ultimo_capitulo'
    };

    var jaTentouRestaurar = false;

    // =================================================================================
    // SEÇÃO 2: SALVAR O CODEX ATUAL (embrulhando window.injectarCodex)
    // =================================================================================
    // Não altera a função original — só passa a chamá-la depois de
    // registar o ficheiro em localStorage. Cobre tanto o carregamento
    // inicial quanto qualquer clique de menu, porque ambos passam
    // sempre por window.injectarCodex.
    function envolverInjectarCodex() {
        if (typeof window.injectarCodex !== 'function') {
            console.warn('[POSICAO_SISTEMA] window.injectarCodex ainda não existe — verifique a ordem dos scripts em index.html.');
            return;
        }

        var original = window.injectarCodex;

        window.injectarCodex = function (arquivo) {
            if (arquivo) {
                try {
                    localStorage.setItem(CONFIG.chaveCodex, arquivo);
                } catch (erro) {
                    /* localStorage indisponível (ex.: modo privado) — degrada
                       em silêncio, o site continua a funcionar normalmente,
                       só sem lembrar a posição. */
                }
            }
            return original.apply(this, arguments);
        };
    }

    // =================================================================================
    // SEÇÃO 3: SALVAR O CAPÍTULO ATUAL (delegação de eventos, fase de captura)
    // =================================================================================
    // Fase de CAPTURA: este listener corre ANTES do próprio Codex
    // processar o clique, então lê o estado "expandido" de antes do
    // toggle — isso permite saber com certeza se o clique vai abrir
    // ou fechar o tópico, sem depender de quando o fetch/animação de
    // cada Codex termina.
    function escutarCliquesEmCapitulos() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.cb-topico-btn') : null;
            if (!btn) return;

            var topico = btn.closest('.cb-topico');
            if (!topico) return;

            var arquivo = topico.getAttribute('data-arquivo');
            if (!arquivo) return;

            var estavaAberto = topico.classList.contains('expandido');

            /* Só salva quando o clique vai ABRIR o tópico. Se já estava
               aberto (o clique vai fechá-lo), não sobrescreve — mantém
               a última posição aberta conhecida. */
            if (!estavaAberto) {
                try {
                    localStorage.setItem(CONFIG.chaveCapitulo, arquivo);
                } catch (erro) {
                    /* Mesma degradação silenciosa da Seção 2 */
                }
            }
        }, true); /* true = fase de captura */
    }

    // =================================================================================
    // SEÇÃO 4: RESTAURAR O CAPÍTULO (só na primeira injeção após o carregamento)
    // =================================================================================
    function tentarRestaurarCapitulo() {
        if (jaTentouRestaurar) return;
        jaTentouRestaurar = true; /* só tenta uma vez por carregamento de página */

        var arquivo = null;
        try {
            arquivo = localStorage.getItem(CONFIG.chaveCapitulo);
        } catch (erro) {
            return;
        }
        if (!arquivo) return;

        var seletor = '.cb-topico[data-arquivo="' + CSS.escape(arquivo) + '"] .cb-topico-btn';
        var btn = document.querySelector(seletor);

        /* Se o Codex atualmente injetado não tiver esse capítulo
           (ex.: o utilizador estava noutra página quando fechou o
           site), simplesmente não há nada para restaurar aqui —
           degradação normal, sem erro. */
        if (btn) btn.click();
    }

    function observarInjecaoDeConteudo() {
        var area = document.querySelector('.area-conteudo');
        if (!area) return;

        var observer = new MutationObserver(function () {
            tentarRestaurarCapitulo();
        });

        observer.observe(area, { childList: true });
    }

    // =================================================================================
    // SEÇÃO 5: INICIALIZAÇÃO
    // =================================================================================
    // IMPORTANTE: precisa de correr ANTES do DOMContentLoaded disparar
    // a chamada inicial a injectarCodex() (ver index.html) — por isso
    // este ficheiro é carregado com "defer" (executa após o parsing
    // do HTML, mas sempre antes do DOMContentLoaded).
    function initialize() {
        envolverInjectarCodex();
        escutarCliquesEmCapitulos();
        observarInjecaoDeConteudo();
    }

    initialize();

})();
