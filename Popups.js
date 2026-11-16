/**
 * Popups.js — 2.2 · Controlador independente de mensagens de Lumina.
 * Arquivo único: configurações, mensagens, aparência e funcionamento.
 * Não altera o motor, a fila ou os dados de conquistas.
 * Gerais: até 1 obrigatório + 1 rede/aviso + 1 dica por carregamento.
 * Dica: sorteio único de 25%. Conteúdo: 1 aviso por ID por carregamento.
 * Edite tempos e textos no bloco 1. Não requer catálogo externo.
 */
(function () {
    'use strict';
    if (window.__luminaPopupsIniciado) return;
    window.__luminaPopupsIniciado = true;
    // ==================== 1. CONFIGURAÇÕES E MENSAGENS ====================
    // Edite tempos e textos abaixo. Preserve IDs para manter os registros.
    // activo: false exclui uma mensagem do sorteio sem apagar seu cadastro.
    var catalogo = {
        configuracao: {
            boasVindasMs: 10000,
            intervaloMs: 60000,
            limiteFechamentos: 7,
            chanceDica: 0.25,
            // Este ID já pertence ao Instagram no catálogo original.
            instagramPrimeiro: 'threads-1'
        },
        obrigatorios: [
            {
                id: 'privacidade', activo: true,
                titulo: 'Bem-vindo a 7Guerreiros',
                texto: 'Sou Lumina, a guardiã deste arquivo. Suas preferências, anotações e progresso ficam guardados neste navegador. O site usa armazenamento local para esses recursos; imagens e links externos podem se conectar a outros serviços.',
                botao: 'ENTENDO'
            },
            {
                id: 'dados-neste-dispositivo', activo: true,
                titulo: 'Um lembrete sobre suas anotações',
                texto: 'Seu Caderno e seus registros acompanham este navegador. Limpar os dados do site pode apagá-los. Use a opção TXT do Caderno para guardar uma cópia das anotações.',
                botao: 'ENTENDI, LUMINA'
            }
        ],
        // Dados e IDs anteriores preservados. As cores agora vêm do tema.
        redes: [

        /* ── GRUPO: PRIMARIO ── */
        {
            id:       'instagram-1',
            grupo:    'instagram',
            nome:     'THREADS',
            activo:   true,
            icone:    '♣️',
            user:     '@ScriptorChristianus',
            url:      'https://www.threads.com/@ScriptorChristianus',
            corBotao: '#000000',
            corTexto: '#fff'
        },
        {
            id:       'instagram-2',
            grupo:    'instagram',
            nome:     'FACEBOOK',
            activo:   true,
            icone:    '♣️',
            user:     '@ScriptorOficial',
            url:      'https://www.facebook.com/ScriptorOficial/',
            corBotao: '#0088cc',
            corTexto: '#fff'
        },

        /* ── GRUPO: SECUDARIO ── */
        {
            id:       'facebook-1',
            grupo:    'facebook',
            nome:     'INKSPIRED',
            activo:   true,
            icone:    '♠️',
            user:     '@7guerreiro',
            url:      'https://getinkspired.com/pt/u/7guerreiros/',
            corBotao: '#1A3B41',
            corTexto: '#fff'
        },
        {
            id:       'facebook-2',
            grupo:    'facebook',
            nome:     'MASTODON',
            activo:   true,
            icone:    '♠️',
            user:     '@7Guerreiros',
            url:      'https://mastodon.social/@7Guerreiros',
            corBotao: '#6364FF',
            corTexto: '#fff'
        },

        /* ── GRUPO: FINAL ── */
        {
            id:       'threads-1',
            grupo:    'outras',
            nome:     'INSTAGRAM',
            activo:   true,
            icone:    '♥️',
            user:     '@7guerreirosoficial',
            url:      'https://www.instagram.com/7guerreirosoficial/',
            corBotao: '#c0392b',
            corTexto: '#fff'
        },
        {
            id:       'threads-2',
            grupo:    'outras',
            nome:     'FACEBOOK',
            activo:   true,
            icone:    '♣️',
            user:     '@7Guerreiros',
            url:      'https://www.facebook.com/7guerreiros/',
            corBotao: '#0088cc',
            corTexto: '#fff'
        },
        {
            id:       'mastodon-1',
            grupo:    'outras',
            nome:     'THREADS',
            activo:   true,
            icone:    '♥️',
            user:     '@7guerreirosoficial',
            url:      'https://www.threads.com/@7guerreirosoficial',
            corBotao: '#000000',
            corTexto: '#fff'
        }
        ],
        avisos: [
            // Modelo: altere o texto e ative quando precisar de um anúncio.
            { id: 'aviso-exemplo', activo: false, titulo: 'Uma novidade no arquivo',
              texto: 'Aqui Lumina apresentará um anúncio do site.', botao: 'ENTENDI' }
        ],
        dicas: [
            { id: 'dica-caderno', activo: true, titulo: 'Guarde suas impressões',
              texto: 'Uma frase chamou sua atenção? Seu Caderno do Leitor pode guardar uma anotação. Você também pode baixá-la em TXT.' },
            { id: 'dica-retorno', activo: true, titulo: 'Volte às suas histórias',
              texto: 'Continue usando o mesmo navegador e preserve os dados do site para manter seus registros de leitura.' },
            { id: 'dica-tema', activo: true, titulo: 'Escolha sua luz',
              texto: 'Experimente o tema claro ou escuro do site e escolha o que deixa sua leitura mais confortável.' }
        ],
        conteudos: [
            // Uma vez por carregamento da página, ao abrir este Codex.
            { id: 'teologia-ficcional', activo: true, codex: 'CODEX_TEOLOGIA.html',
              titulo: 'Antes de explorar esta teologia',
              texto: 'Este conteúdo inclui elementos fictícios do universo 7Guerreiros. Leia-o como parte da construção desse universo, distinguindo a ficção das referências reais.',
              botao: 'ENTENDI, LUMINA' }
        ]
    };
    // Alias mantido para compatibilidade; o catálogo pertence a este arquivo.
    window.LuminaPopupsLista = catalogo;

    // ==================== 2. ARMAZENAMENTO E FILA ====================
    var CHAVES = {
        privacidade: 'popup_privacidade_aceite',
        seguida: 'popup_rede_seguida_',
        fechada: 'popup_rede_fechada_',
        confirmados: 'popup_lumina_confirmados_v1',
        silencioso: 'popup_lumina_silencioso',
        ultimaDica: 'popup_lumina_ultima_dica'
    };
    var memoria = new Map();
    function ler(chave) {
        if (memoria.has(chave)) return memoria.get(chave);
        try { return localStorage.getItem(chave); } catch (erro) { return null; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, valor); memoria.delete(chave); return true; }
        catch (erro) { memoria.set(chave, valor); return false; }
    }
    function confirmados() {
        try {
            var ids = JSON.parse(ler(CHAVES.confirmados) || '[]');
            return Array.isArray(ids) ? ids.filter(function (id) { return typeof id === 'string'; }) : [];
        } catch (erro) { return []; }
    }
    function confirmado(item) {
        if (item.tipo === 'rede') return ler(CHAVES.seguida + item.dados.id) === '1';
        if (item.tipo === 'obrigatorio' && item.dados.id === 'privacidade') return ler(CHAVES.privacidade) === '1';
        return confirmados().indexOf(item.tipo + ':' + item.dados.id) !== -1;
    }
    function confirmar(item) {
        if (item.tipo === 'rede') { gravar(CHAVES.seguida + item.dados.id, '1'); return; }
        if (item.tipo === 'obrigatorio' && item.dados.id === 'privacidade') {
            gravar(CHAVES.privacidade, '1'); return;
        }
        var ids = confirmados();
        var id = item.tipo + ':' + item.dados.id;
        if (ids.indexOf(id) === -1) { ids.push(id); gravar(CHAVES.confirmados, JSON.stringify(ids)); }
    }
    function nomeArquivo(caminho) {
        try { return new URL(caminho, document.baseURI).pathname.split('/').pop().toLowerCase(); }
        catch (erro) { return ''; }
    }
    function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
    var config, iniciado = false;
    var actual = null, fila = [], quadro = null;
    var timerInicial = null, timerGeral = null, timerSaida = null;
    var inicialConcluido = false, silencioso = ler(CHAVES.silencioso) === '1';
    var etapa = 'aguardando', dicaSorteada = false, dicaExibida = false;
    var conteudosExibidos = new Set(), codexActual = '';
    function promocional(item) { return item.tipo === 'rede' || item.tipo === 'aviso' || item.tipo === 'dica'; }
    function valido(item) {
        if (promocional(item) && silencioso) return false;
        if (item.tipo === 'conteudo') return item.codex === codexActual && !conteudosExibidos.has(item.dados.id);
        return item.tipo === 'dica' || !confirmado(item);
    }
    function restaurarFoco(item) {
        if (item.el && item.el.contains(document.activeElement) && item.foco && item.foco.isConnected) {
            item.foco.focus({ preventScroll: true });
        }
    }
    function retirarActual() {
        if (!actual) return;
        restaurarFoco(actual);
        if (quadro !== null) cancelAnimationFrame(quadro);
        quadro = null;
        clearTimeout(timerSaida); timerSaida = null;
        actual.el.remove(); actual.el = null;
        actual = null;
    }
    // ==================== 3. APARÊNCIA ====================
    function injectarEstilosGlobais() {
        if (document.getElementById('popups-estilos')) return;
        var tag = document.createElement('style');
        tag.id = 'popups-estilos';
        tag.textContent = `
            .popup-rede, #popup-privacidade {
                box-sizing: border-box; position: fixed; bottom: 24px; right: 24px;
                width: 340px; max-width: calc(100% - 48px);
                max-height: calc(100vh - 48px); max-height: calc(100dvh - 48px);
                overflow: auto; padding: 14px;
                background: var(--bg, #fff); color: var(--text, #1a1a1a);
                border: 1px solid var(--borda, #ccc); border-radius: 6px;
                box-shadow: 0 8px 24px rgba(0,0,0,.25);
                font-family: Georgia, 'Times New Roman', serif;
                z-index: 10001; opacity: 0; transform: translateY(16px);
                transition: opacity .3s ease, transform .3s ease;
            }
            .popup-rede[hidden], #popup-privacidade[hidden] { display: none !important; }
            .popup-rede.popup-visivel, #popup-privacidade.popup-visivel {
                opacity: 1; transform: translateY(0);
            }
            .popup-rede *, #popup-privacidade * { box-sizing: border-box; }
            :is(.popup-rede, #popup-privacidade) .popup-lumina-assinatura, #popup-privacidade .popup-lumina-assinatura {
                margin: 0 28px 8px 0; font-size: .7rem;
                letter-spacing: .08em; text-transform: uppercase; opacity: .6;
            }
            :is(.popup-rede, #popup-privacidade) .popup-cabecalho { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
            :is(.popup-rede, #popup-privacidade) .popup-icone {
                display: grid; place-items: center; flex-shrink: 0;
                width: 56px; height: 56px; border: 1px solid var(--borda, #ccc);
                border-radius: 4px; font-size: 1.5rem; filter: grayscale(1);
            }
            :is(.popup-rede, #popup-privacidade) .popup-identidade { min-width: 0; }
            :is(.popup-rede, #popup-privacidade) .popup-rede-nome { margin: 0 0 2px; font-size: .7rem; opacity: .6; }
            :is(.popup-rede, #popup-privacidade) .popup-usuario { margin: 0; font-size: 1rem; font-weight: bold; overflow-wrap: anywhere; }
            :is(.popup-rede, #popup-privacidade) .popup-fechar, #popup-privacidade .priv-fechar {
                position: absolute; top: 8px; right: 8px; width: 32px; height: 32px;
                padding: 0; border: 0; background: transparent; color: inherit;
                font: 1.4rem/1 Georgia, serif; cursor: pointer; opacity: .6;
            }
            :is(.popup-rede, #popup-privacidade) .popup-fechar:hover, #popup-privacidade .priv-fechar:hover { opacity: 1; }
            :is(.popup-rede, #popup-privacidade) .popup-btn-seguir, #popup-privacidade .priv-btn-aceitar {
                display: block; width: 100%; min-height: 40px; padding: 9px 12px;
                border: 1px solid var(--text, #111); border-radius: 4px;
                background: var(--text, #111); color: var(--bg, #fff);
                font: bold .78rem/1.5 Georgia, serif; letter-spacing: .06em;
                text-align: center; text-decoration: none; cursor: pointer;
            }
            .popup-rede a:hover, #popup-privacidade .priv-btn-aceitar:hover { opacity: .85; }
            #popup-privacidade .priv-titulo { margin: 0 0 6px; font-size: 1rem; font-weight: bold; }
            #popup-privacidade .priv-texto { margin: 0 0 12px; font-size: .8rem; line-height: 1.4; opacity: .75; }
            .popup-rede :focus-visible, #popup-privacidade :focus-visible {
                outline: 2px solid var(--text, #111); outline-offset: 2px;
            }
            @media (max-width: 480px) {
                .popup-rede, #popup-privacidade { left: 24px; right: 24px; width: auto; }
            }
            @media (prefers-reduced-motion: reduce) {
                .popup-rede, #popup-privacidade { transition: none; transform: none; }
            }
            :is(.popup-rede, #popup-privacidade) .lumina-texto { margin: 0 0 12px; font-size: .8rem; line-height: 1.4; opacity: .75; overflow-wrap: anywhere; }

            /* Visual compacto: mesmas medidas-base dos popups de conquistas.
               O conteúdo mantém altura natural, sem cortar texto ou botões. */
            .popup-rede, #popup-privacidade {
                display: grid; grid-template-columns: 56px minmax(0, 1fr);
                column-gap: 14px; align-items: center;
            }
            :is(.popup-rede, #popup-privacidade) .popup-lumina-assinatura {
                grid-column: 2; margin: 0 22px 2px 0;
            }
            :is(.popup-rede, #popup-privacidade) .popup-cabecalho { display: contents; }
            :is(.popup-rede, #popup-privacidade) .popup-icone {
                grid-column: 1; grid-row: 1 / span 4;
                border: 0; border-radius: 0; background: transparent; filter: none;
            }
            :is(.popup-rede, #popup-privacidade) .popup-identidade { grid-column: 2; }
            :is(.popup-rede, #popup-privacidade) .popup-rede-nome { display: none; }
            :is(.popup-rede, #popup-privacidade) .popup-usuario { line-height: 1.25; margin-bottom: 2px; }
            :is(.popup-rede, #popup-privacidade) .lumina-texto { grid-column: 2; margin: 0; }
            :is(.popup-rede, #popup-privacidade) .popup-btn-seguir {
                grid-column: 2; justify-self: start; width: auto; min-height: 26px;
                margin-top: 6px; padding: 3px 10px; font-size: .74rem;
                line-height: 1.4; letter-spacing: .02em;
            }
            .lumina-popup-svg { display: block; width: 56px; height: 56px; }
            .lumina-popup-rotor { transform-origin: 0px 0px; animation: lumina-popup-giro 20s linear infinite; }
            .lumina-popup-rotor-menor { animation-duration: 13s; animation-direction: reverse; }
            @keyframes lumina-popup-giro { to { transform: rotate(360deg); } }
            :is(.popup-rede, #popup-privacidade)[hidden] .lumina-popup-rotor { animation-play-state: paused; }
            @media (prefers-reduced-motion: reduce) {
                .lumina-popup-rotor { animation: none; }
            }
        `;
        document.head.appendChild(tag);
    }


    // ==================== 4. EXIBIÇÃO E INTERAÇÕES ====================
    // Presença visual externa: não depende da API de conquistas.
    function cantoOcupado() { return !!document.getElementById('conquista-popup'); }
    function sincronizar() {
        if (!iniciado) return;
        if (actual) {
            if (cantoOcupado()) {
                restaurarFoco(actual); actual.el.hidden = true;
                actual.el.classList.remove('popup-visivel');
            } else if (!actual.fechando && actual.el.hidden) {
                revelarActual();
            }
            return;
        }
        if (!inicialConcluido || cantoOcupado()) return;
        while (fila.length) {
            var item = fila.shift();
            if (!valido(item)) { if (item.finalizar) item.finalizar(); continue; }
            exibir(item); break;
        }
    }
    function revelarActual() {
        var item = actual;
        item.el.hidden = false;
        void item.el.offsetWidth;
        item.el.classList.add('popup-visivel');
        if (!item.exibido) {
            item.exibido = true;
            if (item.tipo === 'conteudo') conteudosExibidos.add(item.dados.id);
            if (item.tipo === 'dica') {
                dicaExibida = true;
                gravar(CHAVES.ultimaDica, item.dados.id);
            }
        }
    }
    function enfileirar(item) {
        fila.push(item);
        fila.sort(function (a, b) { return a.prioridade - b.prioridade; });
        // Avisos de conteúdo interrompem apenas mensagens promocionais.
        if (item.tipo === 'conteudo' && actual && promocional(actual) && !actual.fechando) {
            var suspenso = actual;
            retirarActual();
            fila.push(suspenso);
            fila.sort(function (a, b) { return a.prioridade - b.prioridade; });
        }
        sincronizar();
    }
    // SVG local com dentes, recortes e relevo metálico, sem moldura.
    // Usado apenas na apresentação; independente do motor de conquistas.
    function engrenagensPopup() {
        function roda(dentes, raio) {
            var d = '';
            function furo(x, y, r) {
                return ' M ' + (x-r) + ' ' + y + ' a ' + r + ' ' + r +
                    ' 0 1 0 ' + (2*r) + ' 0 a ' + r + ' ' + r +
                    ' 0 1 0 ' + (-2*r) + ' 0 Z';
            }
            for (var i = 0; i < dentes; i++) {
                [0, .23, .55, .78].forEach(function (f, j) {
                    var a = (i+f)*Math.PI*2/dentes;
                    var r = j === 1 || j === 2 ? raio : raio*.84;
                    d += (i === 0 && j === 0 ? 'M ' : ' L ') +
                        (Math.cos(a)*r).toFixed(3) + ' ' + (Math.sin(a)*r).toFixed(3);
                });
            }
            d += ' Z' + furo(0, 0, raio*.13);
            for (var j = 0; j < 5; j++) {
                var a = j*Math.PI*2/5;
                d += furo(Math.cos(a)*raio*.46, Math.sin(a)*raio*.46, raio*.13);
            }
            return '<path d="'+d+'" fill="url(#lumina-popup-metal)" fill-rule="evenodd" stroke="#555" stroke-width=".7"/>' +
                '<circle r="'+(raio*.71)+'" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>';
        }
        return '<svg class="lumina-popup-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 80" aria-hidden="true" focusable="false">' +
            '<defs><linearGradient id="lumina-popup-metal" x1="0" y1="0" x2="1" y2="1">' +
            '<stop stop-color="#f4f4f4"/><stop offset=".32" stop-color="#999"/>' +
            '<stop offset=".6" stop-color="#e1e1e1"/><stop offset="1" stop-color="#565656"/>' +
            '</linearGradient></defs>' +
            '<g transform="translate(29 40)"><g class="lumina-popup-rotor">'+roda(20, 26)+'</g>' +
            '<circle r="3" fill="url(#lumina-popup-metal)" stroke="#555"/></g>' +
            '<g transform="translate(72 40)"><g class="lumina-popup-rotor lumina-popup-rotor-menor">'+roda(13, 17)+'</g>' +
            '<circle r="2" fill="url(#lumina-popup-metal)" stroke="#555"/></g></svg>';
    }
    function criar(item) {
        var dados = item.dados, rede = item.tipo === 'rede';
        var el = document.createElement('div');
        if (item.tipo === 'obrigatorio' && dados.id === 'privacidade') el.id = 'popup-privacidade';
        else el.className = 'popup-rede';
        el.hidden = true;
        el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false');
        el.setAttribute('aria-label', rede ? 'Lumina · ' + dados.nome : dados.titulo);
        el.innerHTML = '<p class="popup-lumina-assinatura">Sistema Lumina</p>' +
            '<button type="button" class="popup-fechar" aria-label="Fechar aviso">×</button>' +
            '<div class="popup-cabecalho"><div class="popup-icone" aria-hidden="true"></div>' +
            '<div class="popup-identidade"><p class="popup-rede-nome"></p><p class="popup-usuario"></p></div></div>' +
            '<p class="lumina-texto"></p>';
        el.querySelector('.popup-icone').innerHTML = engrenagensPopup();
        el.querySelector('.popup-rede-nome').textContent = rede ? 'UM CONVITE DE LUMINA' :
            (item.tipo === 'dica' ? 'DICA DE LEITURA' : 'UMA MENSAGEM PARA VOCÊ');
        el.querySelector('.popup-usuario').textContent = rede ? dados.user : dados.titulo;
        el.querySelector('.lumina-texto').textContent = rede
            ? 'Vamos continuar nossa conversa? Encontre-me no ' + dados.nome + '.' : dados.texto;
        var acao = document.createElement(rede ? 'a' : 'button');
        acao.className = 'popup-btn-seguir';
        if (rede) {
            acao.style.backgroundColor = dados.corBotao;
            acao.style.borderColor = dados.corBotao;
            acao.style.color = dados.corTexto;
        }
        if (rede) { acao.href = dados.url; acao.target = '_blank'; acao.rel = 'noopener noreferrer'; }
        else acao.type = 'button';
        acao.textContent = rede ? 'SEGUIR' : (dados.botao || 'ENTENDI, LUMINA');
        el.appendChild(acao);
        acao.addEventListener('click', function (evento) {
            if (!actual || actual !== item || item.fechando || el.hidden) { evento.preventDefault(); return; }
            resolver(item, true);
        });
        el.querySelector('.popup-fechar').addEventListener('click', function () { resolver(item, false); });
        el.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape') { evento.preventDefault(); resolver(item, false); }
        });
        return el;
    }
    function exibir(item) {
        actual = item; item.fechando = false; item.foco = document.activeElement;
        item.el = criar(item); document.body.appendChild(item.el);
        revelarActual(); // Nunca desloca o foco do visitante.
    }
    function resolver(item, aceitou) {
        if (actual !== item || item.fechando || item.el.hidden || !item.exibido) return;
        item.fechando = true;
        if (item.tipo === 'rede') {
            if (aceitou) confirmar(item);
            else {
                var vezes = parseInt(ler(CHAVES.fechada + item.dados.id), 10);
                vezes = Number.isFinite(vezes) && vezes > 0 ? vezes : 0;
                vezes++;
                gravar(CHAVES.fechada + item.dados.id, String(vezes));
                if (vezes >= config.limiteFechamentos) confirmar(item);
            }
        } else if (item.tipo === 'obrigatorio' || item.tipo === 'aviso') confirmar(item);
        restaurarFoco(item);
        item.el.inert = true;
        item.el.classList.remove('popup-visivel');
        timerSaida = setTimeout(function () {
            timerSaida = null;
            if (actual !== item) return;
            retirarActual();
            if (item.finalizar) item.finalizar();
            sincronizar();
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300);
    }
    function disponiveis(tipo) {
        return (catalogo[tipo] || []).filter(function (dados) {
            return dados.activo && !confirmado({ tipo: tipo === 'redes' ? 'rede' :
                (tipo === 'avisos' ? 'aviso' : 'obrigatorio'), dados: dados });
        });
    }
    function escolherSocial() {
        var redes = disponiveis('redes'), avisos = disponiveis('avisos');
        var primeiro = redes.find(function (r) { return r.id === config.instagramPrimeiro; });
        if (primeiro) return { tipo: 'rede', dados: primeiro };
        var todos = redes.map(function (r) { return { tipo: 'rede', dados: r }; })
            .concat(avisos.map(function (r) { return { tipo: 'aviso', dados: r }; }));
        return todos.length ? sortear(todos) : null;
    }
    function agendarEtapa() {
        if (silencioso || timerGeral !== null || etapa === 'aguardando' || etapa === 'fim') return;
        if (etapa === 'social' && !disponiveis('redes').length && !disponiveis('avisos').length) etapa = 'dica';
        if (etapa === 'dica' && (!dicaSorteada || dicaExibida)) { etapa = 'fim'; return; }
        timerGeral = setTimeout(function () {
            timerGeral = null;
            if (silencioso) return;
            if (etapa === 'social') {
                var item = escolherSocial();
                if (!item) { etapa = 'dica'; agendarEtapa(); return; }
                item.prioridade = 2;
                item.finalizar = function () { etapa = 'dica'; agendarEtapa(); };
                enfileirar(item);
            } else if (etapa === 'dica') {
                var dicas = catalogo.dicas.filter(function (d) { return d.activo; });
                if (dicas.length > 1) dicas = dicas.filter(function (d) { return d.id !== ler(CHAVES.ultimaDica); });
                etapa = 'fim';
                if (dicas.length) enfileirar({ tipo: 'dica', dados: sortear(dicas), prioridade: 3 });
            }
        }, config.intervaloMs);
    }
    function avisarCodex(arquivo) {
        codexActual = nomeArquivo(arquivo);
        if (!iniciado) return;
        fila = fila.filter(function (item) { return item.tipo !== 'conteudo' || item.codex === codexActual; });
        if (actual && actual.tipo === 'conteudo' && actual.codex !== codexActual) retirarActual();
        catalogo.conteudos.forEach(function (dados) {
            if (!dados.activo || nomeArquivo(dados.codex) !== codexActual || conteudosExibidos.has(dados.id)) return;
            if ((actual && actual.tipo === 'conteudo' && actual.dados.id === dados.id) ||
                fila.some(function (item) { return item.tipo === 'conteudo' && item.dados.id === dados.id; })) return;
            enfileirar({ tipo: 'conteudo', dados: dados, codex: codexActual, prioridade: 1 });
        });
        sincronizar();
    }
    window.addEventListener('site:codex-injetado', function (evento) {
        if (evento.detail && typeof evento.detail.arquivo === 'string') avisarCodex(evento.detail.arquivo);
    });
    function definirSilencioso(valor) {
        // O cheat só anuncia sucesso quando a preferência persistente foi salva.
        try { localStorage.setItem(CHAVES.silencioso, valor ? '1' : '0'); }
        catch (erro) { return false; }
        memoria.delete(CHAVES.silencioso);
        aplicarSilencio(valor);
        return true;
    }
    function aplicarSilencio(valor) {
        silencioso = !!valor;
        if (silencioso) {
            clearTimeout(timerGeral); timerGeral = null;
            fila = fila.filter(function (item) { return !promocional(item); });
            if (actual && promocional(actual)) {
                var concluido = actual.fechando ? actual.finalizar : null;
                retirarActual();
                if (concluido) concluido();
            }
            sincronizar();
        } else if (iniciado && !fila.some(promocional) && !(actual && promocional(actual))) agendarEtapa();
    }
    window.SistemaLuminaPopups = {
        desativar: function () { return definirSilencioso(true); },
        ativar: function () { return definirSilencioso(false); },
        avisarCodex: avisarCodex
    };
    window.addEventListener('storage', function (evento) {
        if (evento.key === CHAVES.silencioso || evento.key === null) aplicarSilencio(ler(CHAVES.silencioso) === '1');
    });
    function iniciar() {
        if (iniciado) return;
        iniciado = true;
        config = catalogo.configuracao;
        injectarEstilosGlobais();
        dicaSorteada = Math.random() < config.chanceDica;
        var observer = new MutationObserver(sincronizar);
        observer.observe(document.body, { childList: true });
        var pendentes = disponiveis('obrigatorios');
        var primeiro = pendentes.find(function (d) { return d.id === 'privacidade'; }) ||
            (pendentes.length ? sortear(pendentes) : null);
        if (primeiro) {
            timerInicial = setTimeout(function () {
                timerInicial = null; inicialConcluido = true;
                enfileirar({ tipo: 'obrigatorio', dados: primeiro, prioridade: 0,
                    finalizar: function () { etapa = 'social'; agendarEtapa(); } });
            }, config.boasVindasMs);
        } else { inicialConcluido = true; etapa = 'social'; agendarEtapa(); }
        if (codexActual) avisarCodex(codexActual);
        sincronizar();
    }
    // ==================== 5. ARRANQUE ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar, { once: true });
    } else iniciar();
}());