/**
 * SISTEMA_LUMINA_CHEATS.js — 2.2
 *
 * Arquivo único com códigos e lógica de execução.
 * A interface permanece em IFRAME_CHEAT_CODES.html.
 *
 * MANUTENÇÃO:
 * Cada bloco de LISTA_CHEATS contém:
 * - codigos: senhas em letras minúsculas;
 * - nome: confirmação exibida no terminal;
 * - script: ação executada.
 *
 * verificar() retorna o nome, null ou uma Promise.
 */
(function () {
    'use strict';

    // ==================== 1. INTEGRAÇÃO COM CONQUISTAS ====================

    var carregamentoLista = null;

    function prepararConquistas() {
        var sistema = window.SistemaLuminaConquistas ||
            window.ConquistasSistema;

        if (!sistema) {
            return Promise.reject(new Error(
                'O sistema de ilustrações não está disponível.'
            ));
        }

        if (typeof sistema.desbloquearTodas !== 'function') {
            return Promise.reject(new Error(
                'Recarregue o site para actualizar o sistema de conquistas.'
            ));
        }

        var alvo = window;

        try {
            if (window.parent !== window &&
                (window.parent.SistemaLuminaConquistas === sistema ||
                 window.parent.ConquistasSistema === sistema)) {
                alvo = window.parent;
            }
        } catch (erro) {
            /* Instância local do iframe. */
        }

        var lista = alvo.SistemaLuminaIlustracoes ||
            alvo.CONQUISTAS_LISTA;

        if (lista && Object.keys(lista).length) {
            return Promise.resolve(sistema);
        }

        if (!carregamentoLista) {
            carregamentoLista = new Promise(function (resolve, reject) {
                var script = alvo.document.createElement('script');

                script.src = new URL(
                    'SISTEMA_LUMINA_CONQUISTAS_LISTA.js',
                    alvo.document.baseURI
                ).href;

                var timer = setTimeout(function () {
                    terminar(new Error(
                        'A lista de ilustrações não respondeu.'
                    ));
                }, 10000);

                function terminar(erro) {
                    clearTimeout(timer);
                    script.onload = script.onerror = null;

                    if (erro) {
                        script.remove();
                        carregamentoLista = null;
                        reject(erro);
                    } else {
                        resolve();
                    }
                }

                script.onload = function () {
                    var dados = alvo.SistemaLuminaIlustracoes ||
                        alvo.CONQUISTAS_LISTA;

                    terminar(
                        dados && Object.keys(dados).length
                            ? null
                            : new Error(
                                'A lista de ilustrações está vazia.'
                            )
                    );
                };

                script.onerror = function () {
                    terminar(new Error(
                        'Não foi possível carregar a lista de ilustrações.'
                    ));
                };

                alvo.document.head.appendChild(script);
            });
        }

        return carregamentoLista.then(function () {
            return sistema;
        });
    }

    // ==================== 2. LISTA DE CHEATS ====================

    var LISTA_CHEATS = [
        {
            codigos: ['silencio', 'silenciarpopups'],
            nome: 'Convites e dicas de Lumina desativados',

            // Preserva os avisos obrigatórios e os de conteúdo.
            script: function () {
                var sistema = window.parent.SistemaLuminaPopups ||
                    window.SistemaLuminaPopups;

                if (!sistema || !sistema.desativar()) {
                    throw new Error(
                        'Não foi possível salvar a desativação dos popups.'
                    );
                }
            }
        },

        {
            codigos: ['ativarpopups', 'ouvirlumina'],
            nome: 'Convites e dicas de Lumina reativados',

            script: function () {
                var sistema = window.parent.SistemaLuminaPopups ||
                    window.SistemaLuminaPopups;

                if (!sistema || !sistema.ativar()) {
                    throw new Error(
                        'Não foi possível salvar a reativação dos popups.'
                    );
                }
            }
        },

        {
            codigos: [
                'konami',
                'auntmay',
                'everthin',
                'imagens',
                'aezakmi'
            ],

            nome: 'Ilustrações criadas por Lumina disponíveis',

            // Exceção à temporização normal: salva todos os IDs agora.
            script: function () {
                return prepararConquistas().then(function (sistema) {
                    if (sistema.desbloquearTodas() === null) {
                        throw new Error(
                            'Não foi possível guardar todas as ilustrações.'
                        );
                    }
                });
            }
        },

        {
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

            // Fecha o terminal após confirmar o carregamento do Codex.
            script: function () {
                var pai = window.parent;

                if (!pai || typeof pai.injectarCodex !== 'function') {
                    throw new Error(
                        'O carregamento de Codex não está disponível.'
                    );
                }

                var carregou = false;

                function confirmar(evento) {
                    if (evento.detail &&
                        evento.detail.arquivo ===
                            'CODEX_ASSINANTES.html') {
                        carregou = true;
                    }
                }

                pai.addEventListener(
                    'site:codex-injetado',
                    confirmar
                );

                var pedido;

                try {
                    pedido = pai.injectarCodex(
                        'CODEX_ASSINANTES.html'
                    );
                } catch (erro) {
                    pai.removeEventListener(
                        'site:codex-injetado',
                        confirmar
                    );
                    throw erro;
                }

                return Promise.resolve(pedido).then(function () {
                    pai.removeEventListener(
                        'site:codex-injetado',
                        confirmar
                    );

                    if (!carregou) {
                        throw new Error(
                            'Não foi possível carregar o Codex de assinantes.'
                        );
                    }

                    pai.postMessage(
                        { type: 'FECHAR_MODAL' },
                        window.location.origin
                    );
                }, function (erro) {
                    pai.removeEventListener(
                        'site:codex-injetado',
                        confirmar
                    );
                    throw erro;
                });
            }
        },

        {
            codigos: [
                'facebook',
                'face',
                'panzer',
                'nocoprespect'
            ],

            nome: 'Facebook Aberto em Nova Guia',

            // Chamada direta para preservar o gesto do usuário.
            script: function () {
                window.open(
                    'https://www.facebook.com/Blog7Guerreiros/',
                    '_blank',
                    'noopener,noreferrer'
                );
            }
        },

        {
            codigos: [
                'deletar',
                'delet',
                'apagar',
                'apaga',
                'limpar',
                'limpa',
                'clean',
                'clear',
                'excluir',
                'exclui',
                'remove',
                'remover'
            ],

            nome: 'Registos de ilustrações de Lumina apagados',

            // Limpa somente os registros controlados pelo motor.
            script: function () {
                var sistema = window.SistemaLuminaConquistas ||
                    window.ConquistasSistema;

                if (!sistema ||
                    !sistema.limpar ||
                    !sistema.limpar()) {
                    throw new Error(
                        'Não foi possível apagar os registos de ilustrações.'
                    );
                }
            }
        },

        {
            codigos: [
                'adm',
                'admin',
                'adimin',
                'admim',
                'adimin',
                'log',
                'login',
                'logim',
                'logar',
                'loga',
                'entra',
                'entrar',
                'scriptor',
                'scritor',
                'scripto',
                'scritp',
                'escritor',
                'escrito',
                'acesso',
                'assesso',
                'aseso',
                'vaniel',
                'vanu',
                'lumina',
                'lumin'
            ],

            nome: 'Acesso Lumina Ativado',

            // Acesso temporário, sem fechar o terminal.
            // menu_lumina.js deve estar na mesma pasta do index.
            script: function () {
                var pai = window.parent;
                var doc = pai.document;

                if (pai.MenuLumina) {
                    pai.MenuLumina.destacar();
                    return;
                }

                return new Promise(function (resolve, reject) {
                    var id = 'lumina-menu-carregamento';
                    var script = doc.getElementById(id);
                    var novo = !script;

                    if (novo) {
                        script = doc.createElement('script');
                        script.id = id;

                        script.src = new URL(
                            'menu_lumina.js',
                            doc.baseURI
                        ).href;

                        script.async = true;
                    }

                    function limpar() {
                        script.removeEventListener(
                            'load',
                            carregado
                        );

                        script.removeEventListener(
                            'error',
                            falhou
                        );
                    }

                    function carregado() {
                        limpar();

                        if (pai.MenuLumina) {
                            resolve();
                        } else {
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }

                            reject(new Error(
                                'O menu de Lumina não pôde ser iniciado.'
                            ));
                        }
                    }

                    function falhou() {
                        limpar();

                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }

                        reject(new Error(
                            'Não foi possível carregar menu_lumina.js.'
                        ));
                    }

                    script.addEventListener(
                        'load',
                        carregado
                    );

                    script.addEventListener(
                        'error',
                        falhou
                    );

                    if (novo) {
                        try {
                            doc.head.appendChild(script);
                        } catch (erro) {
                            limpar();

                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }

                            reject(erro);
                        }
                    }
                });
            }
        },

        {
            codigos: [
                'sair',
                'sai',
                'fechar',
                'fecha',
                'of',
                'off',
                'offline',
                'logof',
                'exit'
            ],

            nome: 'Acesso Administrativo Desativado',

            script: function () {
                try {
                    localStorage.removeItem('ACESSO_ADM_ON');
                } catch (erro) {
                    throw new Error(
                        'Não foi possível remover o acesso administrativo.'
                    );
                }
            }
        }

        // Adicione novos blocos de cheats aqui.
    ];

    // ==================== 3. COMPARAÇÃO E EXECUÇÃO ====================

    function verificarCodigo(textoDigitado) {
        var chave = (textoDigitado || '').trim().toLowerCase();

        if (!chave) return null;

        for (var i = 0; i < LISTA_CHEATS.length; i++) {
            var cheat = LISTA_CHEATS[i];

            if (cheat.codigos.indexOf(chave) !== -1) {
                var resultado = cheat.script();

                if (resultado &&
                    typeof resultado.then === 'function') {
                    return resultado.then(function (valor) {
                        if (valor === false) {
                            throw new Error(
                                'O código não pôde ser executado.'
                            );
                        }

                        return cheat.nome;
                    });
                }

                if (resultado === false) {
                    throw new Error(
                        'O código não pôde ser executado.'
                    );
                }

                return cheat.nome;
            }
        }

        return null;
    }

    // ==================== 4. API PÚBLICA ====================

    window.SistemaLuminaCheats = window.CheatCodes = {
        verificar: verificarCodigo
    };
})();