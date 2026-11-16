/**
 * ULTIMO_CODEX.js — 2.0
 *
 * ================================================================
 * POSIÇÃO DE LEITURA
 * ================================================================
 * Salva o Codex e o capítulo juntos, após confirmar o carregamento.
 *
 * Chave principal:
 *   site_posicao_leitura
 *
 * Chaves antigas, mantidas para compatibilidade:
 *   site_ultimo_codex
 *   site_ultimo_capitulo
 *
 * Sem registro válido, a entrada será CODEX_ALPHA.html.
 *
 * Se o armazenamento estiver bloqueado, o site continua funcionando,
 * mas não poderá preservar a posição entre recarregamentos.
 *
 * ================================================================
 * INTEGRAÇÃO DOS CODEX
 * ================================================================
 * O Alpha corrigido:
 * - oferece btn.abrirCapitulo(), que retorna uma Promise;
 * - emite site:capitulo-aberto após carregar com sucesso;
 * - envia detail: { arquivo, topico }.
 *
 * Codex antigos têm adaptação por observação do painel.
 * Sua integração definitiva será conferida quando forem enviados.
 */

(function () {
    'use strict';

    if (window.SistemaPosicao) return;

    var CHAVE = 'site_posicao_leitura';
    var estado = null;

    // ============================================================
    // 1. VALIDAÇÃO DOS CAMINHOS SALVOS
    // ============================================================

    function caminhoValido(valor) {
        if (
            typeof valor !== 'string' ||
            !valor.trim()
        ) {
            return false;
        }

        try {
            var url = new URL(valor, document.baseURI);

            return (
                url.origin === location.origin &&
                /\.html$/i.test(url.pathname) &&
                !url.search &&
                !url.hash
            );
        } catch (erro) {
            return false;
        }
    }

    // ============================================================
    // 2. LEITURA E MIGRAÇÃO DO REGISTRO
    // ============================================================

    try {
        var registro = localStorage.getItem(CHAVE);

        if (registro !== null) {
            var dados = JSON.parse(registro);

            if (
                dados &&
                dados.versao === 1 &&
                caminhoValido(dados.codex) &&
                (
                    dados.capitulo === null ||
                    caminhoValido(dados.capitulo)
                )
            ) {
                estado = dados;
            }
        } else {
            var codex = localStorage.getItem(
                'site_ultimo_codex'
            );

            var capitulo = localStorage.getItem(
                'site_ultimo_capitulo'
            );

            if (caminhoValido(codex)) {
                estado = {
                    versao: 1,
                    codex: codex,
                    capitulo: caminhoValido(capitulo)
                        ? capitulo
                        : null
                };
            }
        }
    } catch (erro) {
        /*
         * JSON inválido ou armazenamento bloqueado:
         * estado permanece null e a entrada será pelo Alpha.
         */
    }

    // ============================================================
    // 3. GRAVAÇÃO DO PAR CODEX/CAPÍTULO
    // ============================================================

    function salvar(codex, capitulo) {
        if (!caminhoValido(codex)) return;

        estado = {
            versao: 1,
            codex: codex,
            capitulo: capitulo || null
        };

        try {
            /*
             * O registro principal guarda o par em uma única escrita.
             * As chaves antigas são apenas espelhos de compatibilidade.
             */
            localStorage.setItem(
                CHAVE,
                JSON.stringify(estado)
            );

            localStorage.setItem(
                'site_ultimo_codex',
                codex
            );

            if (capitulo) {
                localStorage.setItem(
                    'site_ultimo_capitulo',
                    capitulo
                );
            } else {
                localStorage.removeItem(
                    'site_ultimo_capitulo'
                );
            }
        } catch (erro) {
            /*
             * Sem armazenamento, a posição permanece
             * somente na memória desta visita.
             */
        }
    }

    // ============================================================
    // 4. COMPATIBILIDADE COM CODEX ANTIGOS
    // ============================================================

    function aguardarLegado(topico, abrir) {
        return new Promise(function (resolve, reject) {
            var painel = topico.querySelector(
                '.cb-topico-conteudo'
            );

            if (!painel) {
                return reject(
                    new Error('Painel de capítulo ausente')
                );
            }

            var timer;
            var observer = new MutationObserver(verificar);

            function terminar(erro) {
                observer.disconnect();
                clearTimeout(timer);

                if (erro) {
                    reject(erro);
                } else {
                    resolve();
                }
            }

            function verificar() {
                if (!topico.isConnected) {
                    return terminar(
                        new Error('Codex substituído')
                    );
                }

                if (painel.dataset.carregado !== 'true') {
                    return;
                }

                if (
                    /conteúdo não disponível/i.test(
                        painel.textContent
                    )
                ) {
                    return terminar(
                        new Error('Capítulo indisponível')
                    );
                }

                terminar();
            }

            observer.observe(painel, {
                childList: true,
                subtree: true,
                attributes: true
            });

            timer = setTimeout(function () {
                terminar(
                    new Error('Capítulo não confirmado')
                );
            }, 15000);

            if (abrir) abrir();

            verificar();
        });
    }

    // ============================================================
    // 5. INTERFACE UTILIZADA PELO INDEX
    // ============================================================

    window.SistemaPosicao = {
        codexInicial: function () {
            return estado
                ? estado.codex
                : 'CODEX_ALPHA.html';
        },

        restaurar: async function (area, codex) {
            if (
                !estado ||
                estado.codex !== codex ||
                !estado.capitulo
            ) {
                return;
            }

            var arquivo = estado.capitulo;

            /*
             * A comparação direta dispensa montar um seletor
             * CSS a partir dos dados armazenados.
             */
            var topico = Array.from(
                area.querySelectorAll('.cb-topico')
            ).find(function (t) {
                return (
                    t.getAttribute('data-arquivo') === arquivo
                );
            });

            var btn = topico && topico.querySelector(
                '.cb-topico-btn'
            );

            if (!btn) {
                throw new Error(
                    'Capítulo salvo não existe neste Codex'
                );
            }

            if (
                typeof btn.abrirCapitulo === 'function'
            ) {
                await btn.abrirCapitulo();
            } else {
                await aguardarLegado(
                    topico,
                    function () {
                        if (
                            !topico.classList.contains(
                                'expandido'
                            )
                        ) {
                            btn.click();
                        }
                    }
                );
            }
        }
    };

    // ============================================================
    // 6. CODEX CONFIRMADO PELO INJECTOR
    // ============================================================

    window.addEventListener(
        'site:codex-injetado',
        function (e) {
            if (
                !e.detail ||
                !caminhoValido(e.detail.arquivo)
            ) {
                return;
            }

            var capitulo = (
                estado &&
                estado.codex === e.detail.arquivo
            )
                ? estado.capitulo
                : null;

            var area = document.querySelector(
                '.area-conteudo'
            );

            var confirmado = area && area.querySelector(
                '.cb-topico.expandido ' +
                '.cb-topico-conteudo[data-carregado="true"]'
            );

            /*
             * Uma recuperação do Alpha sem capítulo deve
             * eliminar a associação que causou a falha.
             */
            if (!confirmado) capitulo = null;

            salvar(
                e.detail.arquivo,
                capitulo
            );
        }
    );

    // ============================================================
    // 7. CAPÍTULO CONFIRMADO PELO ALPHA CORRIGIDO
    // ============================================================

    window.addEventListener(
        'site:capitulo-aberto',
        function (e) {
            var d = e.detail;

            var area = document.querySelector(
                '.area-conteudo'
            );

            if (
                !d ||
                !area ||
                !d.topico ||
                !area.contains(d.topico) ||
                !d.topico.classList.contains('expandido') ||
                !caminhoValido(d.arquivo)
            ) {
                return;
            }

            salvar(
                area.dataset.codexArquivo,
                d.arquivo
            );
        }
    );

    // ============================================================
    // 8. CAPÍTULOS DE CODEX AINDA NÃO MIGRADOS
    // ============================================================

    document.addEventListener(
        'click',
        function (e) {
            var btn = e.target.closest
                ? e.target.closest('.cb-topico-btn')
                : null;

            if (
                !btn ||
                typeof btn.abrirCapitulo === 'function'
            ) {
                return;
            }

            var topico = btn.closest('.cb-topico');

            var area = document.querySelector(
                '.area-conteudo'
            );

            if (
                !topico ||
                !area ||
                !area.contains(topico) ||
                topico.classList.contains('expandido')
            ) {
                return;
            }

            aguardarLegado(topico)
                .then(function () {
                    if (
                        !area.contains(topico) ||
                        !topico.classList.contains('expandido')
                    ) {
                        return;
                    }

                    salvar(
                        area.dataset.codexArquivo,
                        topico.getAttribute('data-arquivo')
                    );
                })
                .catch(function () {
                    /*
                     * Uma falha não substitui
                     * a última leitura válida.
                     */
                });
        },
        true
    );
}());