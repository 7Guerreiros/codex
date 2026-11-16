/**
 * SISTEMA_LUMINA_LEITOR.js — 0.2
 *
 * Registra capítulos abertos com sucesso e oferece listar() ao Caderno.
 * Usa os IDs das conquistas, sem depender de conquistas desbloqueadas.
 * Não altera notas nem a posição do ULTIMO_CODEX.
 *
 * Chave preservada:
 * 7guerreiros_lumina_leituras_v1
 *
 * O registro indica abertura, não conclusão da leitura.
 */
(function () {
    'use strict';

    var CHAVE = '7guerreiros_lumina_leituras_v1';

    function listar() {
        var dados = JSON.parse(
            localStorage.getItem(CHAVE) || '[]'
        );

        if (!Array.isArray(dados)) {
            throw new Error('Histórico inválido');
        }

        return dados;
    }

    // O iframe usa esta interface para consultar o histórico.
    window.SistemaLuminaLeitor = {
        chave: CHAVE,
        listar: listar
    };

    if (window.__luminaLeitorIniciado) return;
    window.__luminaLeitorIniciado = true;

    window.addEventListener(
        'site:lumina-leitura',
        function (evento) {
            var dados = evento.detail;
            var raiz = dados && dados.raiz;

            if (
                !raiz ||
                !raiz.isConnected ||
                raiz.ownerDocument !== document ||
                raiz.dataset.leitor !== '1'
            ) {
                return;
            }

            if (
                typeof dados.arquivo !== 'string' ||
                !dados.arquivo
            ) {
                return;
            }

            var id = dados.id || dados.arquivo;

            try {
                var leituras = listar();

                var registrado = leituras.some(function (item) {
                    return item && item.id === id;
                });

                if (registrado) return;

                leituras.push({
                    id: id,
                    arquivo: dados.arquivo,
                    titulo: typeof dados.titulo === 'string'
                        ? dados.titulo
                        : '',
                    abertoEm: new Date().toISOString()
                });

                localStorage.setItem(
                    CHAVE,
                    JSON.stringify(leituras)
                );
            } catch (erro) {
                console.warn(
                    '[LUMINA LEITOR] Histórico não registrado:',
                    erro
                );
            }
        }
    );
}());