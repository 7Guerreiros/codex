/**
 * CONQUISTAS_LISTA.js
 * Versão: 1.0
 *
 * ================================================================
 * PROPÓSITO
 * ================================================================
 * Lista mestra de todas as conquistas do site. Relaciona o ID de
 * cada conquista (o mesmo ID colocado no atributo data-conquista
 * de cada capítulo em CODEX_LIVRO.html) com o nome, a descrição e
 * a imagem que serão exibidos:
 *   - no popup de desbloqueio (CONQUISTAS_SISTEMA.js)
 *   - no grid de conquistas  (IFRAME_CODEX_MACHINAE.html)
 *
 * Este ficheiro só contém dados — nenhuma lógica. É carregado por
 * qualquer Codex ou página que precise de consultar conquistas.
 *
 * ================================================================
 * PADRÃO DE ID
 * ================================================================
 * LIVRO-CAPXX-NN
 *   LIVRO → nome abreviado do livro (ex.: REGN = Regnum Florestae)
 *   CAPXX → capítulo, com dois dígitos (CAP01, CAP02...)
 *   NN    → número da ilustração dentro do capítulo, dois dígitos
 *
 * Exemplo: "REGN-CAP01-01" → Regnum Florestae, capítulo 1,
 * primeira ilustração daquele capítulo.
 *
 * ================================================================
 * MANUTENÇÃO — COMO ADICIONAR UMA CONQUISTA
 * ================================================================
 * 1. Adicione uma entrada abaixo, usando o mesmo ID que estará no
 *    atributo data-conquista do capítulo correspondente, dentro
 *    do CODEX_LIVRO.html (ou do Codex do livro específico).
 * 2. Preencha:
 *      nome      — título curto exibido no popup e no grid
 *      descricao — 1 frase, exibida no popup e no grid
 *      imagem    — caminho relativo ao index.html da página pai
 *                  (ex.: "IMGS/CONQUISTAS/regn_cap01_01.png")
 *                  Use este campo quando a conquista tiver UMA
 *                  única imagem.
 *      imagens   — (opcional) array de caminhos, no mesmo formato
 *                  de "imagem" acima, para quando a conquista tiver
 *                  MAIS DE UMA imagem/ilustração. Se este campo
 *                  existir, tem prioridade sobre "imagem".
 *                  Ex.: imagens: ["IMGS/CONQUISTAS/a.jpg",
 *                                 "IMGS/CONQUISTAS/b.jpg"]
 * 3. Não é preciso alterar CONQUISTAS_SISTEMA.js nem
 *    IFRAME_CODEX_MACHINAE.html — ambos leem este objeto
 *    dinamicamente.
 * ================================================================
 */
(function () {
    'use strict';

    window.CONQUISTAS_LISTA = {

        /* --------------------------------------------------------
           Exemplo — substituir/apagar ao cadastrar as conquistas
           reais. Corresponde aos data-conquista de exemplo já
           colocados em CODEX_LIVRO.html.
           -------------------------------------------------------- */
        'REGN-FLO-01': {
			nome: 'Sussurros do Deserto',
			descricao: 'Esta área tem sido palco de coisas muito estranhas...',
			imagens: ['https://64.media.tumblr.com/c50923b18b1ddf906ddafa3a6c1470bf/dda7df7c8f89d967-5b/s1280x1920/6f3a8c87eaa3dfc25b43d498602a9b1c987373fe.jpg', 'https://64.media.tumblr.com/94c70ba80ad83a902e79dec112874f45/4475507ac390d34b-90/s1280x1920/a456b35c791a473035dc63231a9a8953c129438a.jpg']
		},
		'REGN-FLO-02': {
            nome: 'Obsessão',
            descricao: 'Será que eu imaginei ou sonhei com fantasmas?',
            imagem: '000.jpg'
        },
		'REGN-FLO-03': {
            nome: 'Almas Perturbadas ',
            descricao: '…confesso que ascender uma fogueira é bem mais difícil do que parece...',
            imagem: 'https://64.media.tumblr.com/252d2feabc2bc699b750e69684f374e9/c5745d9963b7da7f-66/s1280x1920/cf2917da9254425ea69d9a8e0a5e56e4671df8ad.jpg'
        },
		'REGN-FLO-04': {
            nome: 'Em branco...',
            descricao: 'Por que não foi preenchido o registro do quarto dia?',
            imagem: 'https://64.media.tumblr.com/0e0157082540deb856305af501772492/c5745d9963b7da7f-3d/s1280x1920/39c3fa024b6db71b77562187b835a59a14983e30.jpg'
        },
        'REGN-FLO-05': {
            nome: 'Umbra Eterna',
            descricao: 'Eu sou Umbra, umbra quae aperuit crura…',
            imagens: ['https://64.media.tumblr.com/9c31e11e6f3af76eea9175421deb02d0/c5745d9963b7da7f-11/s1280x1920/d167a69f4affd28553f1c514902386580e367b4d.jpg', 'https://64.media.tumblr.com/22171551a577e5b14708fdd8ef5b2824/bacdb5029a9c66b1-15/s2048x3072/4a107e18d65813fe2eca730855e018f075329390.jpg']
        }

    };

})();
