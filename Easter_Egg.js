/* Easter_Egg.js — 1.0
 * Apenas o index principal escuta as setas. Nenhum evento de iframe
 * é encaminhado. Sem timers, armazenamento ou dependências externas.
 */
(function () {
    'use strict';

    // 1. CONFIGURAÇÃO — preencha os caminhos locais das imagens.
    var PAINEIS = {
        ArrowLeft: {
            lado: 'esquerda', titulo: 'Jesus Cristo',
            imagem: '', // Exemplo: 'IMGS/JESUS.jpg'
            alternativa: 'Quadro de Jesus Cristo',
            descricao: 'Jesus Cristo, figura central da fé cristã. Espaço reservado para uma breve apresentação escolhida pelo autor.'
        },
        ArrowRight: {
            lado: 'direita',
            // Para adicionar outra pessoa, copie um dos objetos da lista.
            pessoas: [
                {
                    titulo: 'William Branham',
                    imagem: '', // Exemplo: 'IMGS/WILLIAM_BRANHAM.jpg'
                    alternativa: 'Fotografia de William Branham',
                    descricao: 'William Branham (1909–1965), pregador cristão norte-americano. Espaço reservado para uma breve apresentação escolhida pelo autor.'
                },
                {
                    titulo: 'Ellen G. White',
                    imagem: '', // Exemplo: 'IMGS/ELLEN_G_WHITE.jpg'
                    alternativa: 'Fotografia de Ellen G. White',
                    descricao: 'Ellen G. White (1827–1915), escritora cristã norte-americana. Espaço reservado para uma breve apresentação escolhida pelo autor.'
                }
            ]
        }
    };

    // 2. ESCOPO — sem inicialização em iframes ou outras páginas.
    if (window.self !== window.top || window.__easterEgg7G) return;
    if (!/(?:\/index\.html|\/)$/i.test(location.pathname)) return;
    window.__easterEgg7G = true;
    var painel = null, quadro = null, fecharBotao = null;
    var teclaActual = null, focoAnterior = null;

    function escapar(texto) {
        return String(texto).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // 3. IFRAME — acompanha o tema, preservando a apresentação clara.
    // srcdoc mantém o protótipo num único arquivo JS, sem HTML extras.
    function documento(dados) {
        var imagem = dados.imagem
            ? '<img src="' + escapar(dados.imagem) + '" alt="' + escapar(dados.alternativa) + '">'
            : '<div class="foto">Imagem reservada<br>' + escapar(dados.alternativa) + '</div>';
        return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>' + escapar(dados.titulo) + '</title><style>' +
            '*{box-sizing:border-box}body{margin:0;padding:54px 16px 24px;' +
            'background:#f8f8f8;color:#333;font:16px/1.6 Georgia,serif;overflow-wrap:break-word}' +
            'img{display:block;width:100%;height:auto;border:1px solid #ddd}' +
            '.foto{display:grid;place-content:center;text-align:center;aspect-ratio:3/4;' +
            'border:1px solid #ddd;background:#eee;color:#666;font:13px/1.6 system-ui,sans-serif}' +
            'h1{margin:20px 0 12px;padding-bottom:8px;border-bottom:1px solid #ddd;font-size:1.25rem}' +
            'p{margin:0}html.tema-escuro body{background:#1a1a1a;color:#f0f0f0}' +
            'html.tema-escuro img,html.tema-escuro .foto,html.tema-escuro h1{border-color:#333}' +
            'html.tema-escuro .foto{background:#242424;color:#b5b5b5}' +
            '</style></head><body>' + imagem + '<h1>' + escapar(dados.titulo) +
            '</h1><p>' + escapar(dados.descricao) + '</p></body></html>';
    }

    // 4. PAINEL — camada 1200, acima das camadas do Menus.js.
    function preparar() {
        if (painel) return;
        var estilo = document.createElement('style');
        estilo.textContent = '#easter-egg-painel{position:fixed;top:0;width:300px;max-width:100%;' +
            'height:100vh;height:100dvh;z-index:1200;background:#f8f8f8;' +
            'box-shadow:0 0 24px #0003}#easter-egg-painel[hidden]{display:none}' +
            '#easter-egg-painel iframe{display:block;width:100%;height:100%;border:0}' +
            'html.tema-escuro #easter-egg-painel{background:var(--bg,#1a1a1a)}' +
            'html.tema-escuro #easter-egg-fechar{color:var(--text,#f0f0f0)}' +
            'html.tema-escuro #easter-egg-fechar:focus-visible{outline-color:var(--text,#f0f0f0)}' +
            '#easter-egg-fechar{position:absolute;top:10px;right:12px;width:32px;height:32px;' +
            'min-height:0;padding:0;border:0;border-radius:0;background:transparent;color:#1a1a1a;' +
            'font:1.4rem/1 Arial,sans-serif;cursor:pointer;opacity:.6;z-index:1201}' +
            '#easter-egg-fechar:hover,#easter-egg-fechar:focus-visible{opacity:1}' +
            '#easter-egg-fechar:focus-visible{outline:2px solid #333;outline-offset:2px}';
        document.head.appendChild(estilo);
        painel = document.createElement('aside');
        painel.id = 'easter-egg-painel';
        painel.hidden = true;
        quadro = document.createElement('iframe');
        // O pai pode aplicar o tema; scripts internos continuam bloqueados.
        quadro.setAttribute('sandbox', 'allow-same-origin');
        quadro.tabIndex = -1;
        fecharBotao = document.createElement('button');
        fecharBotao.id = 'easter-egg-fechar';
        fecharBotao.type = 'button';
        fecharBotao.textContent = '×';
        fecharBotao.setAttribute('aria-label', 'Fechar painel');
        fecharBotao.addEventListener('click', fechar);
        painel.append(quadro, fecharBotao);
        document.body.appendChild(painel);
        new MutationObserver(sincronizarTema).observe(document.documentElement, {
            attributes: true, attributeFilter: ['class']
        });
    }

    // Espelha a classe do Sistema_Tema sem salvar preferências ou recarregar.
    function sincronizarTema() {
        if (!quadro || !quadro.contentDocument) return;
        quadro.contentDocument.documentElement.classList.toggle('tema-escuro',
            document.documentElement.classList.contains('tema-escuro'));
    }

    function fechar() {
        if (!teclaActual) return;
        painel.hidden = true;
        teclaActual = null;
        if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus({ preventScroll: true });
        focoAnterior = null;
    }

    function alternar(tecla) {
        preparar();
        if (teclaActual === tecla) { fechar(); return; }
        if (!teclaActual) focoAnterior = document.activeElement;
        var dados = PAINEIS[tecla];
        if (dados.pessoas) {
            dados = Object.assign({ lado: dados.lado },
                dados.pessoas[Math.floor(Math.random() * dados.pessoas.length)]);
        }
        painel.style.left = dados.lado === 'esquerda' ? '0' : 'auto';
        painel.style.right = dados.lado === 'direita' ? '0' : 'auto';
        painel.setAttribute('aria-label', dados.titulo);
        quadro.title = dados.titulo;
        teclaActual = tecla;
        var conteudo = documento(dados);
        if (quadro.srcdoc !== conteudo) {
            // Mantém o layout ativo, mas só revela o novo conteúdo pronto.
            painel.style.visibility = 'hidden';
            quadro.onload = function () {
                quadro.onload = null;
                sincronizarTema();
                painel.style.visibility = '';
                if (!painel.hidden) fecharBotao.focus({ preventScroll: true });
            };
            painel.hidden = false;
            // Confirma o layout visível antes de atualizar o iframe.
            void quadro.offsetWidth;
            quadro.srcdoc = conteudo;
        } else {
            sincronizarTema();
            painel.hidden = false;
        }
        fecharBotao.focus({ preventScroll: true });
    }

    // 5. TECLADO — escuta somente o documento principal, sem polling.
    document.addEventListener('keydown', function (evento) {
        if (!evento.isTrusted || evento.defaultPrevented || evento.repeat || evento.isComposing ||
            evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
        if (evento.key === 'Escape' && teclaActual) {
            evento.preventDefault(); fechar(); return;
        }
        if (!Object.prototype.hasOwnProperty.call(PAINEIS, evento.key)) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        var alvo = evento.target;
        if (alvo.closest && alvo.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),' +
            '[role="textbox"],[role="slider"],[role="grid"],[role="tree"],[role="listbox"]')) return;
        if (window.getSelection && !window.getSelection().isCollapsed) return;
        if (document.querySelector('#menu-lateral-overlay,.sys-modal-active,dialog[open],' +
            '[role="dialog"][aria-modal="true"]')) return;
        evento.preventDefault();
        alternar(evento.key);
    });

    // 6. CLIQUE EXTERNO — fecha sem bloquear a ação ou mudar seu foco.
    document.addEventListener('click', function (evento) {
        if (teclaActual && !painel.contains(evento.target)) {
            focoAnterior = null;
            fechar();
        }
    });
}());