/**
 * CHEAT_CODES.js
 * Versão: 2.0
 *
 * ================================================================
 * PROPÓSITO
 * ================================================================
 * Ficheiro único e autossuficiente do sistema de cheats: contém os
 * dados (códigos + scripts) E toda a lógica de comparação/execução.
 *
 * IFRAME_CHEAT_CODES.html é APENAS interface — caixa de texto,
 * feedback visual e histórico. Ele não sabe nada sobre como os
 * códigos são comparados nem o que cada um faz; só chama
 * window.CheatCodes.verificar(texto) e mostra o resultado.
 *
 * ================================================================
 * ESTRUTURA: BLOCOS DE [CÓDIGOS] + SCRIPT
 * ================================================================
 * LISTA_CHEATS é um array de blocos. Cada bloco tem:
 *   codigos → array com todas as senhas que disparam este cheat
 *             (pode ser uma só, ou várias apontando para o mesmo)
 *   nome    → texto curto mostrado como confirmação ao ativar
 *   script  → function() { ... } com o que deve acontecer
 *
 * ================================================================
 * COMPARAÇÃO NÃO É CASE SENSITIVE
 * ================================================================
 * verificarCodigo() converte sempre o texto digitado para
 * minúsculas antes de comparar. Por isso, TODOS os códigos dentro
 * de "codigos" devem ser escritos em minúsculas — um código com
 * letra maiúscula aqui nunca vai corresponder a nada digitado.
 *
 * ================================================================
 * CONTEXTO DE EXECUÇÃO DO SCRIPT
 * ================================================================
 * Cada "script" corre dentro da janela da página que carregou este
 * ficheiro (hoje, o iframe de IFRAME_CHEAT_CODES.html). Se um
 * cheat precisar afetar o site por trás do iframe (ex.: mudar algo
 * em index.html), use window.parent dentro da própria função:
 *     window.parent.document.body.style.filter = 'invert(1)';
 *
 * ================================================================
 * MANUTENÇÃO — COMO ADICIONAR UM NOVO CHEAT
 * ================================================================
 * Adicione um novo bloco { codigos, nome, script } dentro de
 * LISTA_CHEATS, seguindo o padrão do cheat já existente abaixo.
 * Não é preciso alterar mais nada — nem este ficheiro em outro
 * ponto, nem IFRAME_CHEAT_CODES.html.
 * ================================================================
 */
(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: LISTA DE CHEATS — [códigos] + script, um bloco por cheat
    // =================================================================================
    var LISTA_CHEATS = [

        {
            /* Cinco códigos diferentes, todos disparando o mesmo script.
               "aezakmi" é uma referência ao cheat-mito do GTA San
               Andreas que supostamente "desbloqueia tudo" no jogo —
               nunca existiu de verdade, mas o nome combina perfeitamente
               com o que este cheat realmente faz aqui. */
            codigos: ['konami', 'auntmay', 'everthin', 'imagens', 'aezakmi'],
            nome: 'Todas as Conquistas Desbloqueadas',

            /* Percorre CONQUISTAS_LISTA.js e chama
               ConquistasSistema.desbloquear(id) para cada ID cadastrado
               — exatamente a mesma chamada que abrir cada capítulo
               manualmente faria. Conquistas ainda não desbloqueadas
               salvam em localStorage e disparam o popup normalmente;
               as que já estavam desbloqueadas são ignoradas em
               silêncio (mesma regra de sempre em desbloquear()).

               DEPENDÊNCIA: para este cheat funcionar, a página que
               carrega CHEAT_CODES.js precisa também carregar
               CONQUISTAS_LISTA.js e CONQUISTAS_SISTEMA.js antes
               (ver IFRAME_CHEAT_CODES.html). */
            script: function () {
                var lista   = window.CONQUISTAS_LISTA || {};
                var sistema = window.ConquistasSistema;

                if (!sistema) {
                    console.warn('[CHEAT_CODES] ConquistasSistema não está carregado nesta página — inclua CONQUISTAS_SISTEMA.js e CONQUISTAS_LISTA.js junto de CHEAT_CODES.js.');
                    return;
                }

                Object.keys(lista).forEach(function (id) {
                    sistema.desbloquear(id);
                });
            }
        },

        {
            /* Nove códigos diferentes, todos disparando o mesmo script.
               "hesoyam", "officialvcfaq", "giveallcashvehicle",
               "dncashman" e "robin hood" são referências a cheats
               clássicos de dinheiro/recompensa da série GTA;
               "assinante", "apoiador", "apoia.se" e "show me the
               money" reforçam directamente o tema do cheat: dar
               acesso ao conteúdo de assinantes/apoiadores. */
            codigos: [
                'assinante',
                'apoiador',
                'giveallcashvehicle',
                'hesoyam',
                'officialvcfaq',
                'apoia.se',
                'dncashman',
                'robin hood',
                'show me the money'
            ],
            nome: 'Acesso de Assinante Desbloqueado',

            /* Injeta CODEX_ASSINANTES.html na página principal usando o
               mesmo injectarCodex já exposto por index.html — daí o uso
               de window.parent (ver nota "CONTEXTO DE EXECUÇÃO DO
               SCRIPT" no topo do ficheiro), pois este script corre
               dentro do iframe de IFRAME_CHEAT_CODES.html.

               Depois de injectar, fecha o modal (mesmo postMessage que
               o botão "Fechar" do IFRAME_CHEAT_CODES.html já usa), para
               que o conteúdo desbloqueado fique visível de imediato.

               DEPENDÊNCIA: exige que CODEX_ASSINANTES.html exista na
               raiz do site, no mesmo padrão dos demais Codex (elemento
               raiz único, CSS escopado). */
            script: function () {
                if (window.parent && typeof window.parent.injectarCodex === 'function') {
                    window.parent.injectarCodex('CODEX_ASSINANTES.html');
                    window.parent.postMessage({ type: 'FECHAR_MODAL' }, '*');
                } else {
                    console.warn('[CHEAT_CODES] injectarCodex não está disponível em window.parent — verifique se este iframe está dentro do index.html.');
                }
            }
        },
		
		{
            /* Códigos alusivos à rede social. "panzer" e "nocoprespect"
               não têm relação directa com Facebook, mas foram incluídos
               a pedido como sinónimos adicionais do mesmo cheat. */
            codigos: ['facebook', 'face', 'panzer', 'nocoprespect'],
            nome: 'Facebook Aberto em Nova Guia',

            /* Abre o Facebook numa nova guia. noopener+noreferrer evita
               que a nova guia tenha acesso a window.opener (boa prática
               de segurança ao abrir links externos via script). Não
               depende de window.parent, pois não afeta o site por
               trás do iframe — só abre uma guia nova do browser. */
            script: function () {
                window.open('https://www.facebook.com/Blog7Guerreiros/', '_blank', 'noopener,noreferrer');
            }
        },
		
		{
            /* Termos diretos para "apagar as conquistas salvas",
               em português e inglês, cobrindo variações comuns de
               grafia (com/sem acento, com/sem plural/conjugação). */
            codigos: ['deletar', 'delet', 'apagar', 'apaga', 'limpar', 'limpa', 'clean', 'clear', 'excluir', 'exclui', 'remove', 'remover'],
            nome: 'Conquistas Apagadas',

            /* Remove do localStorage a chave onde CONQUISTAS_SISTEMA.js
               guarda TODAS as conquistas desbloqueadas. */
			   
            script: function () {
                var CHAVE_CONQUISTAS = 'conquistas_desbloqueadas';

                var existiaAlgo = window.localStorage.getItem(CHAVE_CONQUISTAS) !== null;
                window.localStorage.removeItem(CHAVE_CONQUISTAS);

                console.info('[CHEAT_CODES] Conquistas ' + (existiaAlgo ? 'apagadas' : '(já não havia nenhuma salva)') + '.');
            }
        },

        /* Próximo cheat aqui — copiar o bloco acima como modelo */

    ];

    // =================================================================================
    // SEÇÃO 2: MOTOR DE COMPARAÇÃO E EXECUÇÃO
    // =================================================================================
    // Recebe o texto digitado pelo utilizador, normaliza, procura em
    // todos os blocos de LISTA_CHEATS e, se encontrar, executa o
    // script correspondente.
    //
    // DEVOLVE:
    //   string com o "nome" do cheat, se um código correspondeu
    //   null, se nenhum código correspondeu
    function verificarCodigo(textoDigitado) {
        var chave = (textoDigitado || '').trim().toLowerCase();
        if (!chave) return null;

        for (var i = 0; i < LISTA_CHEATS.length; i++) {
            var cheat = LISTA_CHEATS[i];

            if (cheat.codigos.indexOf(chave) !== -1) {
                /* Isolado em try/catch para que um erro dentro de um
                   cheat não quebre a caixa de digitação. */
                try {
                    cheat.script();
                } catch (erro) {
                    console.error('[CHEAT_CODES] Erro ao executar cheat "' + chave + '":', erro);
                }
                return cheat.nome;
            }
        }

        return null;
    }

    // =================================================================================
    // SEÇÃO 3: API PÚBLICA
    // =================================================================================
    window.CheatCodes = {
        verificar: verificarCodigo
    };

})();
