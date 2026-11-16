/**
 * SISTEMA_LUMINA_CONQUISTAS_LISTA.js — 1.1
 *
 * Dados organizados por livro, sem alterar os IDs existentes.
 *
 * Cada conquista informa:
 * - capitulo: título do capítulo.
 * - ordem: posição do capítulo no livro.
 * - arquivo: caminho relativo ao index.html.
 *
 * A lista plana e seus aliases continuam disponíveis ao motor
 * e à galeria. Os dados adicionais poderão ser usados pelo Caderno.
 *
 * O livro fictício é um modelo comentado: não entra nas contagens.
 */
(function () {
    'use strict';

    var livros = {
		
		// ============================================================
        // CONTO — ENTRE PÁGINAS E MUNDOS (CODEX_ALPHA)
        // 000.jpg: imagem provisória; substituir pela imagem desejada.
        // ALPHA_NARRATIVA identifica trechos internos do Alpha.
        // Não é necessário criar esses arquivos de capítulos.
        // ============================================================

        'ALPHA': {
            nome: 'Entre páginas e mundos (Conto)',

            conquistas: {
                'ALPHA-01': {
                    capitulo: 'Uma lâmina recebe um nome',
                    ordem: 1,
                    arquivo: 'ALPHA_NARRATIVA/LAMINA.html',

                    nome: 'Uma lâmina recebe um nome',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'ALPHA-02': {
                    capitulo: 'À sombra da pirâmide',
                    ordem: 2,
                    arquivo: 'ALPHA_NARRATIVA/CAVALEIRO.html',

                    nome: 'À sombra da pirâmide',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'ALPHA-03': {
                    capitulo: 'Um desejo diante do silêncio',
                    ordem: 3,
                    arquivo: 'ALPHA_NARRATIVA/DESEJO.html',

                    nome: 'Um desejo diante do silêncio',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'ALPHA-04': {
                    capitulo: 'Entre um mundo e outro',
                    ordem: 4,
                    arquivo: 'ALPHA_NARRATIVA/TRAVESSIA.html',

                    nome: 'Entre um mundo e outro',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'ALPHA-05': {
                    capitulo: 'Onde o silêncio cria raízes',
                    ordem: 5,
                    arquivo: 'ALPHA_NARRATIVA/FLORESTA.html',

                    nome: 'Onde o silêncio cria raízes',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'ALPHA-06': {
                    capitulo: 'Dois nomes entre as engrenagens',
                    ordem: 6,
                    arquivo: 'ALPHA_NARRATIVA/MAQUINAS.html',

                    nome: 'Dois nomes entre as engrenagens',
                    descricao: 'Lumina registrou a leitura deste trecho do conto.',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                }
            }
        },

        // ============================================================
        // LIVRO 1 — NATIVITAS SILVÆ
        // ============================================================

        'REGN-FLO': {
            nome: 'NATIVITAS SILVÆ',

            conquistas: {
                'REGN-FLO-01': {
                    capitulo: 'DIA I: SONITUS DESERTI',
                    ordem: 1,
                    arquivo: 'ORIGINAIS_REGNUM_FLORESTA/DIA1.html',

                    nome: 'Sussurros do Deserto',
                    descricao: 'Esta área tem sido palco de coisas muito estranhas...',

                    imagens_principais: [
                        'https://64.media.tumblr.com/c50923b18b1ddf906ddafa3a6c1470bf/dda7df7c8f89d967-5b/s1280x1920/6f3a8c87eaa3dfc25b43d498602a9b1c987373fe.jpg',
                        'https://64.media.tumblr.com/94c70ba80ad83a902e79dec112874f45/4475507ac390d34b-90/s1280x1920/a456b35c791a473035dc63231a9a8953c129438a.jpg'
                    ],

                    imagens_reservas: ['', '']
                },

                'REGN-FLO-02': {
                    capitulo: 'DIA II: OBSESSIO',
                    ordem: 2,
                    arquivo: 'ORIGINAIS_REGNUM_FLORESTA/DIA2.html',

                    nome: 'Obsessão',
                    descricao: 'Será que eu imaginei ou sonhei com fantasmas?',

                    imagem_principal: '000.jpg',
                    imagem_reserva: ''
                },

                'REGN-FLO-03': {
                    capitulo: 'DIA III: PERTURBATIO ANIMI',
                    ordem: 3,
                    arquivo: 'ORIGINAIS_REGNUM_FLORESTA/DIA3.html',

                    nome: 'Almas Perturbadas ',
                    descricao: '…confesso que ascender uma fogueira é bem mais difícil do que parece...',

                    imagem_principal: 'https://64.media.tumblr.com/252d2feabc2bc699b750e69684f374e9/c5745d9963b7da7f-66/s1280x1920/cf2917da9254425ea69d9a8e0a5e56e4671df8ad.jpg',
                    imagem_reserva: ''
                },

                'REGN-FLO-04': {
                    capitulo: 'DIA IV: IN ALBO',
                    ordem: 4,
                    arquivo: 'ORIGINAIS_REGNUM_FLORESTA/DIA4.html',

                    nome: 'Em branco...',
                    descricao: 'Por que não foi preenchido o registro do quarto dia?',

                    imagem_principal: 'https://64.media.tumblr.com/0e0157082540deb856305af501772492/c5745d9963b7da7f-3d/s1280x1920/39c3fa024b6db71b77562187b835a59a14983e30.jpg',
                    imagem_reserva: ''
                },

                'REGN-FLO-05': {
                    capitulo: 'DIA V: UMBRA ÆTERNA',
                    ordem: 5,
                    arquivo: 'ORIGINAIS_REGNUM_FLORESTA/DIA5.html',

                    nome: 'Umbra Eterna',
                    descricao: 'Eu sou Umbra, umbra quae aperuit crura…',

                    imagens_principais: [
                        'https://64.media.tumblr.com/9c31e11e6f3af76eea9175421deb02d0/c5745d9963b7da7f-11/s1280x1920/d167a69f4affd28553f1c514902386580e367b4d.jpg',
                        'https://64.media.tumblr.com/22171551a577e5b14708fdd8ef5b2824/bacdb5029a9c66b1-15/s2048x3072/4a107e18d65813fe2eca730855e018f075329390.jpg'
                    ],

                    imagens_reservas: ['', '']
                }
            }
        }

        /* ============================================================
           LIVRO FICTÍCIO — MODELO PARA COPIAR
           ============================================================
           Para activar, descomentar e acrescentar uma vírgula
           depois do bloco do livro anterior.

        'LIVRO-EXEMPLO': {
            nome: 'As Portas de Cinza — EXEMPLO',

            conquistas: {
                'EXEMPLO-01': {
                    capitulo: 'CAPÍTULO I: A PORTA',
                    ordem: 1,
                    arquivo: 'EXEMPLO/CAPITULO1.html',

                    nome: 'A primeira chave',
                    descricao: 'Descrição da conquista de exemplo.',

                    imagem_principal: 'IMGS/CONQUISTAS/exemplo.jpg',
                    imagem_reserva: ''
                }
            }
        }
        */

    };

    // ================================================================
    // COMPATIBILIDADE
    // Os consumidores continuam consultando lista[ID].
    // Os nomes dos livros não são repetidos manualmente nas entradas.
    // ================================================================

    var lista = {};

    Object.keys(livros).forEach(function (livroId) {
        var livro = livros[livroId];

        Object.keys(livro.conquistas).forEach(function (id) {
            lista[id] = Object.assign(
                {
                    livro_id: livroId,
                    livro: livro.nome
                },
                livro.conquistas[id]
            );
        });
    });

    window.SistemaLuminaLivros = livros;
    window.CONQUISTAS_LISTA = lista;
    window.SistemaLuminaIlustracoes = lista;
}());