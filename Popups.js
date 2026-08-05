/* ============================================================
   POPUPS.JS — Sistema de popups: Privacidade + Redes Sociais
   ============================================================

   MÓDULOS:
     1. AVISO DE PRIVACIDADE
        — Aparece 30 s após carregamento
        — Aceito ou × : grava localStorage → nunca mais aparece

     2. REDES SOCIAIS (em 3 grupos: instagram, facebook, outras)
        — No máximo 2 popups por CARREGAMENTO DE PÁGINA (não persiste
          entre visitas — cada nova visita pode mostrar até 2 de novo,
          continuando de onde as contas ainda não seguidas indicarem)
        — Primeiro popup aparece DELAY_REDES_MS após o aviso de
          privacidade ser fechado; o segundo (se houver) aparece
          DELAY_REDES_MS depois do primeiro ser resolvido (fechado
          ou seguido) — nunca dois popups ao mesmo tempo.
        — Alterna entre um grupo "primário" e um "secundário":
            primário   = primeiro grupo (na ordem instagram → facebook
                         → outras) que ainda tiver alguma rede não
                         seguida
            secundário = o grupo seguinte a esse, nas mesmas condições
          Dentro do grupo escolhido, a rede exibida é sorteada entre
          as ainda não seguidas desse grupo.
          Exemplo prático: enquanto houver rede de instagram por
          seguir, ele é sempre o primário (aparece em todo popup de
          "número ímpar" do ciclo) e facebook é o secundário. Assim
          que as 2 páginas do instagram forem seguidas, facebook vira
          o primário e "outras" vira o secundário — e assim por diante.
        — × : conta como "fechado" para aquela rede (ver contador
          abaixo); volta a aparecer depois do próximo intervalo
        — Seguir : grava localStorage → essa rede nunca mais aparece
        — Contador de fechamentos: se a MESMA rede for fechada (×)
          7 vezes ao todo (mesmo em visitas diferentes), ela passa a
          ser tratada como se tivesse sido seguida — nunca mais
          aparece, sem precisar de clique em "Seguir"
        — Todas seguidas/fechadas 7x (ou todas inactivas) : não
          exibe mais nenhum popup de rede

   CONFIGURAÇÃO (editar apenas esta secção):
     REDES                — dados, grupo e activação de cada rede
     GRUPOS_ORDEM         — ordem de prioridade dos 3 grupos
     DELAY_PRIVACIDADE_MS — atraso do aviso de privacidade (ms)
     DELAY_REDES_MS       — atraso ENTRE cada popup de rede social (ms)
     LIMITE_FECHAMENTOS   — quantos × equivalem a "seguida"

   MANUTENÇÃO:
     • Trocar URLs/nomes     : editar o objecto REDES abaixo
     • Adicionar/mudar grupo : campo "grupo" de cada rede em REDES
     • Desactivar uma rede   : activo: false no objecto da rede
     • Trocar atrasos        : editar os DELAY_*_MS
     • Trocar limite de ×    : editar LIMITE_FECHAMENTOS
     • Resetar privacidade   : localStorage.removeItem('popup_privacidade_aceite')
     • Resetar rede X        : localStorage.removeItem('popup_rede_seguida_X')
     • Resetar contador de X : localStorage.removeItem('popup_rede_fechada_X')
     • Desactivar tudo       : comentar iniciarPrivacidade() e iniciarRedes() na Secção 7

   DEPENDÊNCIAS: nenhuma — ficheiro completamente auto-suficiente
   ============================================================ */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════
       SECÇÃO 1 — CONFIGURAÇÃO
       ══════════════════════════════════════════════════════════ */

    var DELAY_PRIVACIDADE_MS = 10000;   /* 30 segundos */
    var DELAY_REDES_MS       = 60000;   /* 60 segundos — entre CADA popup de rede, não só o primeiro */
    var LIMITE_FECHAMENTOS   = 7;       /* × acumulados para uma rede equivaler a "seguida" */

    /* Chaves do localStorage */
    var STORAGE_KEY_PRIVACIDADE   = 'popup_privacidade_aceite';
    var STORAGE_KEY_PREFIX_REDE   = 'popup_rede_seguida_';    /* + id da rede */
    var STORAGE_KEY_PREFIX_FECHOU = 'popup_rede_fechada_';    /* + id da rede — contador de × */

    /* Ordem de prioridade dos grupos: o primeiro desta lista que ainda
       tiver alguma rede não seguida é sempre o grupo "primário" (ver
       gruposAtivos() na Secção 2 e mostrarProximoPopupDeRede() na
       Secção 6). Reordenar aqui muda a prioridade sem tocar em mais
       nada. */
    var GRUPOS_ORDEM = ['instagram', 'facebook', 'outras'];

    /* ── Dados de cada rede social ────────────────────────────
       id            → único por CONTA (não por rede) — usado nas
                        chaves de localStorage; ex.: duas contas de
                        Instagram precisam de dois id diferentes
       grupo         → 'instagram' | 'facebook' | 'outras'
       nome          → nome de exibição no botão ("Me siga no <nome>")
       activo: true  → conta participa no sorteio do seu grupo
       activo: false → conta ignorada sem apagar o código
       icone         → naipe de baralho (símbolo Unicode local)
       ──────────────────────────────────────────────────────── */
    var REDES = [

        /* ── GRUPO: INSTAGRAM ── */
        {
            id:       'instagram-1',
            grupo:    'instagram',
            nome:     'INSTAGRAM',
            activo:   true,
            icone:    '♥️',
            user:     '@scriptorchristianus',
            url:      'https://www.instagram.com/scriptorchristianus/',
            corBotao: '#c0392b',
            corTexto: '#fff'
        },
        {
            id:       'instagram-2',
            grupo:    'instagram',
            nome:     'INSTAGRAM',
            activo:   true,
            icone:    '♥️',
            user:     '@revista7guerreiros',
            url:      'https://www.instagram.com/revista7guerreiros/',
            corBotao: '#c0392b',
            corTexto: '#fff'
        },

        /* ── GRUPO: FACEBOOK ── */
        {
            id:       'facebook-1',
            grupo:    'facebook',
            nome:     'FACEBOOK',
            activo:   true,
            icone:    '♠️',
            user:     '@ScriptorOficial',
            url:      'https://www.facebook.com/ScriptorOficial/',
            corBotao: '#0088cc',
            corTexto: '#fff'
        },
        {
            id:       'facebook-2',
            grupo:    'facebook',
            nome:     'FACEBOOK',
            activo:   true,
            icone:    '♠️',
            user:     '@Blog7Guerreiros',
            url:      'https://www.facebook.com/Blog7Guerreiros',
            corBotao: '#0088cc',
            corTexto: '#fff'
        },

        /* ── GRUPO: OUTRAS ── */
        {
            id:       'threads-1',
            grupo:    'outras',
            nome:     'THREADS',
            activo:   true,
            icone:    '♦️',
            user:     '@revista7guerreiros',
            url:      'https://www.threads.com/@revista7guerreiros',
            corBotao: '#000000',
            corTexto: '#fff'
        },
        {
            id:       'threads-2',
            grupo:    'outras',
            nome:     'THREADS',
            activo:   true,
            icone:    '♦️',
            user:     '@blog7guerreiros',
            url:      'https://www.threads.com/@blog7guerreiros',
            corBotao: '#000000',
            corTexto: '#fff'
        },
        {
            id:       'mastodon-1',
            grupo:    'outras',
            nome:     'MASTODON',
            activo:   true,
            icone:    '♣️',
            user:     '@7Guerreiros@mastodon.social',
            url:      'https://mastodon.social/@7Guerreiros',
            corBotao: '#6364FF',
            corTexto: '#fff'
        }
    ];


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 2 — UTILITÁRIOS LOCALSTORAGE
       ══════════════════════════════════════════════════════════ */

    function lsGet(chave) {
        try { return localStorage.getItem(chave); } catch (e) { return null; }
    }

    function lsSet(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch (e) { /* silencioso */ }
    }

    function privacidadeAceite() {
        return lsGet(STORAGE_KEY_PRIVACIDADE) === '1';
    }

    function redeSeguida(id) {
        return lsGet(STORAGE_KEY_PREFIX_REDE + id) === '1';
    }

    function marcarRedeSeguida(id) {
        lsSet(STORAGE_KEY_PREFIX_REDE + id, '1');
    }

    function marcarPrivacidadeAceite() {
        lsSet(STORAGE_KEY_PRIVACIDADE, '1');
    }

    /* Devolve todas as redes activas de um grupo (seguidas ou não) */
    function redesDoGrupo(grupo) {
        return REDES.filter(function (r) {
            return r.grupo === grupo && r.activo;
        });
    }

    /* Devolve só as redes activas e ainda não seguidas de um grupo */
    function redesDisponiveisDoGrupo(grupo) {
        return redesDoGrupo(grupo).filter(function (r) {
            return !redeSeguida(r.id);
        });
    }

    /* Devolve, na ordem de GRUPOS_ORDEM, só os grupos que ainda têm
       pelo menos uma rede não seguida — usado para decidir quem é
       "primário" (ativos[0]) e "secundário" (ativos[1]) a cada popup */
    function gruposAtivos() {
        return GRUPOS_ORDEM.filter(function (grupo) {
            return redesDisponiveisDoGrupo(grupo).length > 0;
        });
    }

    /* Conta mais um fechamento (×) para esta rede e devolve o total
       acumulado — usado para aplicar LIMITE_FECHAMENTOS */
    function contarFechamento(id) {
        var atual = parseInt(lsGet(STORAGE_KEY_PREFIX_FECHOU + id), 10);
        if (isNaN(atual)) atual = 0;
        atual += 1;
        lsSet(STORAGE_KEY_PREFIX_FECHOU + id, String(atual));
        return atual;
    }

    /* Selecciona um item aleatório de um array */
    function aleatorio(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 3 — ESTILOS GLOBAIS (injectados uma única vez)
       ══════════════════════════════════════════════════════════ */

    function injectarEstilosGlobais() {
        if (document.getElementById('popups-estilos')) return;

        var css = [

            /* ── BASE COMUM A TODOS OS POPUPS ── */

            /* Largura e forma partilhadas — 260 px para todos */
            '.popup-rede, #popup-privacidade {',
            '  position: fixed;',
            '  bottom: 28px;',
            '  right: 24px;',
            '  left: auto;',
            '  width: 260px;',
            '  background: #ffffff;',
            '  border: 1px solid #e2e2e2;',
            '  border-radius: 12px;',
            '  padding: 0;',
            '  font-family: inherit;',
            '  box-sizing: border-box;',
            '  overflow: hidden;',
            '  box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);',
            '  opacity: 0;',
            '  transform: translateY(20px);',
            '  transition: opacity 0.4s cubic-bezier(.22,.68,0,1.2), transform 0.4s cubic-bezier(.22,.68,0,1.2);',
            '}',

            /* Redes ficam acima do aviso de privacidade */
            '.popup-rede   { z-index: 10001; }',
            '#popup-privacidade { z-index: 10000; }',

            '.popup-rede.popup-visivel,',
            '#popup-privacidade.popup-visivel {',
            '  opacity: 1;',
            '  transform: translateY(0);',
            '}',

            /* ── POPUPS DE REDE SOCIAL ── */

            '.popup-rede .popup-corpo {',
            '  padding: 14px 14px 16px;',
            '}',

            '.popup-rede .popup-cabecalho {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  margin-bottom: 12px;',
            '}',

            /* Ícone: quadrado com naipe de baralho — cor/fundo definidos inline */
            '.popup-rede .popup-icone {',
            '  flex-shrink: 0;',
            '  margin-right: 10px;',
            '  font-size: 1.3rem;',
            '  line-height: 1;',
            '  user-select: none;',
            '}',

            '.popup-rede .popup-rede-nome {',
            '  font-size: 0.7rem;',
            '  color: #666;',
            '  margin: 0 0 2px;',
            '  line-height: 1.2;',
            '}',

            '.popup-rede .popup-usuario {',
            '  font-size: 0.9rem;',
            '  font-weight: 700;',
            '  color: #111;',
            '  margin: 0;',
            '  line-height: 1.2;',
            '}',

            '.popup-rede .popup-fechar {',
            '  background: none;',
            '  border: none;',
            '  cursor: pointer;',
            '  font-size: 0.85rem;',
            '  color: #bbb;',
            '  padding: 2px 4px;',
            '  line-height: 1;',
            '  flex-shrink: 0;',
            '  margin-left: 6px;',
            '  border-radius: 4px;',
            '  transition: color 0.15s, background 0.15s;',
            '}',
            '.popup-rede .popup-fechar:hover { color: #333; background: #f0f0f0; }',

            '.popup-rede .popup-btn-seguir {',
            '  display: block;',
            '  width: 100%;',
            '  padding: 8px 0;',
            '  color: #fff;',
            '  border: none;',
            '  border-radius: 6px;',
            '  font-size: 0.78rem;',
            '  font-weight: 700;',
            '  letter-spacing: 0.06em;',
            '  cursor: pointer;',
            '  text-align: center;',
            '  text-decoration: none;',
            '  transition: filter 0.2s, transform 0.15s;',
            '  box-sizing: border-box;',
            '}',
            '.popup-rede .popup-btn-seguir:hover  { filter: brightness(1.1); transform: translateY(-1px); }',
            '.popup-rede .popup-btn-seguir:active { transform: translateY(0); filter: brightness(0.96); }',

            /* ── AVISO DE PRIVACIDADE ── */

            '#popup-privacidade .priv-topo {',
            '  height: 3px;',
            '  background: #222;',
            '}',

            '#popup-privacidade .priv-corpo {',
            '  padding: 12px 14px 14px;',   /* compacto */
            '}',

            '#popup-privacidade .priv-cabecalho {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  margin-bottom: 8px;',
            '}',

            '#popup-privacidade .priv-titulo {',
            '  font-size: 0.8rem;',
            '  font-weight: 700;',
            '  color: #111;',
            '  margin: 0;',
            '  letter-spacing: 0.02em;',
            '}',

            '#popup-privacidade .priv-fechar {',
            '  background: none;',
            '  border: none;',
            '  cursor: pointer;',
            '  font-size: 0.85rem;',
            '  color: #bbb;',
            '  padding: 2px 4px;',
            '  line-height: 1;',
            '  border-radius: 4px;',
            '  transition: color 0.15s, background 0.15s;',
            '}',
            '#popup-privacidade .priv-fechar:hover { color: #333; background: #f0f0f0; }',

            '#popup-privacidade .priv-texto {',
            '  font-size: 0.72rem;',
            '  color: #666;',
            '  line-height: 1.5;',
            '  margin: 0 0 12px;',
            '}',

            '#popup-privacidade .priv-btn-aceitar {',
            '  display: block;',
            '  width: 100%;',
            '  padding: 7px 0;',
            '  background: #111;',
            '  color: #fff;',
            '  border: none;',
            '  border-radius: 6px;',
            '  font-size: 0.78rem;',
            '  font-weight: 700;',
            '  letter-spacing: 0.06em;',
            '  cursor: pointer;',
            '  text-align: center;',
            '  transition: background 0.2s, transform 0.15s;',
            '}',
            '#popup-privacidade .priv-btn-aceitar:hover  { background: #333; transform: translateY(-1px); }',
            '#popup-privacidade .priv-btn-aceitar:active { transform: translateY(0); }'

        ].join('\n');

        var tag = document.createElement('style');
        tag.id  = 'popups-estilos';
        tag.textContent = css;
        document.head.appendChild(tag);
    }


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 4 — UTILITÁRIO DE ANIMAÇÃO (comum a todos)
       ══════════════════════════════════════════════════════════ */

    function mostrarPopup(el) {
        void el.offsetWidth; /* força reflow para a transição funcionar */
        el.classList.add('popup-visivel');
        var btnFechar = el.querySelector('.popup-fechar, .priv-fechar');
        if (btnFechar) btnFechar.focus();
    }

    function fecharPopup(el, callback) {
        el.classList.remove('popup-visivel');
        setTimeout(function () {
            if (el && el.parentNode) el.parentNode.removeChild(el);
            if (callback) callback();
        }, 420);
    }


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 5 — MÓDULO: AVISO DE PRIVACIDADE
       ══════════════════════════════════════════════════════════
       MANUTENÇÃO:
         • Editar o texto em priv-texto para alterar o aviso
         • DELAY_PRIVACIDADE_MS controla o tempo de espera
         • Resetar: localStorage.removeItem('popup_privacidade_aceite')
         • Desactivar: comentar iniciarPrivacidade() na Secção 7
       ══════════════════════════════════════════════════════════ */

    function criarPopupPrivacidade() {
        var el = document.createElement('div');
        el.id = 'popup-privacidade';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Aviso de privacidade');
        el.setAttribute('aria-modal', 'false');

        el.innerHTML = [
            '<div class="priv-topo"></div>',
            '<div class="priv-corpo">',
            '  <div class="priv-cabecalho">',
            '    <p class="priv-titulo">AVISO DE PRIVACIDADE:</p>',
            '    <button class="priv-fechar" aria-label="Fechar aviso">&#x2715;</button>',
            '  </div>',
            '  <p class="priv-texto">',
            '    Este site usa apenas o armazenamento local para recordar as suas',
            '    preferências. Nenhum dado pessoal é recolhido ou partilhado.',
            '  </p>',
            '  <button class="priv-btn-aceitar">ENTENDO</button>',
            '</div>'
        ].join('');

        return el;
    }

    function iniciarPrivacidade(callbackAposFechado) {
        /* Já aceitou anteriormente — não exibir; iniciar redes imediatamente */
        if (privacidadeAceite()) {
            if (callbackAposFechado) callbackAposFechado();
            return;
        }

        var el = criarPopupPrivacidade();
        document.body.appendChild(el);

        setTimeout(function () {
            mostrarPopup(el);
        }, DELAY_PRIVACIDADE_MS);

        /* × e Aceito têm o mesmo efeito: gravar, fechar e disparar callback */
        function aceitar() {
            marcarPrivacidadeAceite();
            fecharPopup(el, callbackAposFechado);
        }

        el.querySelector('.priv-fechar').addEventListener('click', aceitar);
        el.querySelector('.priv-btn-aceitar').addEventListener('click', aceitar);
    }


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 6 — MÓDULO: POPUP DE REDE SOCIAL
       ══════════════════════════════════════════════════════════
       MANUTENÇÃO:
         • Adicionar rede    : inserir novo objecto em REDES (Secção 1),
                                com um id único e o campo "grupo" certo
         • Desactivar rede   : activo: false no objecto da rede
         • Resetar rede X    : localStorage.removeItem('popup_rede_seguida_X')
         • Resetar contador de × de X : localStorage.removeItem('popup_rede_fechada_X')
         • Desactivar tudo   : comentar iniciarRedes() na Secção 7
       ══════════════════════════════════════════════════════════ */

    function criarPopupRede(rede) {
        var el = document.createElement('div');
        el.className = 'popup-rede';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Seguir em ' + rede.id);
        el.setAttribute('aria-modal', 'false');

        el.innerHTML = [
            '<div class="popup-corpo">',
            '  <div class="popup-cabecalho">',
            '    <div style="display:flex;align-items:center;flex:1;min-width:0;">',
            '      <div class="popup-icone" aria-hidden="true">',
            '        ' + rede.icone,
            '      </div>',
            '      <div>',
            '        <p class="popup-rede-nome">ME SIGA NO ' + rede.nome + '</p>',
            '        <p class="popup-usuario">' + rede.user + '</p>',
            '      </div>',
            '    </div>',
            '    <button class="popup-fechar" aria-label="Fechar popup">&#x2715;</button>',
            '  </div>',
            '  <a class="popup-btn-seguir"',
            '     href="' + rede.url + '"',
            '     target="_blank"',
            '     rel="noopener noreferrer"',
            '     role="button"',
            '     style="background:' + rede.corBotao + ';color:' + rede.corTexto + '">',
            '    SEGUIR',
            '  </a>',
            '</div>'
        ].join('');

        return el;
    }

    /* Controla qual "slot" (primário ou secundário) o próximo popup
       vai ocupar. Alterna a cada popup mostrado — ver
       mostrarProximoPopupDeRede(). Reiniciado em cada carregamento
       de página por iniciarRedes(). */
    var proximoSlot = 'primario';

    /* Quantos popups de rede já foram mostrados NESTE carregamento
       de página (não persiste — é só memória, reinicia sozinho a
       cada visita/recarregamento). Ao atingir LIMITE_POPUPS_SESSAO,
       nenhum outro popup é agendado até a próxima visita — nessa
       próxima visita, o ciclo primário/secundário continua de onde
       as contas ainda não seguidas indicarem (não repete do zero as
       que já foram seguidas ou fechadas 7×). */
    var LIMITE_POPUPS_SESSAO = 2;
    var popupsExibidosNestaSessao = 0;

    /* Agenda o próximo popup para daqui a DELAY_REDES_MS. Chamada:
         • por iniciarRedes(), para o primeiro popup da visita
         • depois de CADA popup ser resolvido (× ou Seguir), para
           encadear o próximo — ver exibirPopupRede()
       Não agenda nada se não houver mais nenhum grupo activo, OU se
       o limite de popups desta sessão já tiver sido atingido. */
    function agendarProximoPopup() {
        if (popupsExibidosNestaSessao >= LIMITE_POPUPS_SESSAO) return;
        if (gruposAtivos().length === 0) return;

        setTimeout(function () {
            mostrarProximoPopupDeRede();
        }, DELAY_REDES_MS);
    }

    /* Decide o grupo do próximo popup (primário ou secundário,
       conforme proximoSlot), sorteia uma rede não seguida dentro
       desse grupo, e exibe. Os grupos activos são recalculados a
       cada chamada — por isso a troca de "quem é o primário" (ex.:
       instagram → facebook, assim que o instagram acabar) acontece
       sozinha, sem nenhum estado extra para gerir. */
    function mostrarProximoPopupDeRede() {
        if (popupsExibidosNestaSessao >= LIMITE_POPUPS_SESSAO) return;

        var ativos = gruposAtivos();
        if (ativos.length === 0) return;

        var grupoPrimario   = ativos[0];
        var grupoSecundario = ativos[1] || ativos[0]; /* só 1 grupo activo: usa-o nos dois slots */

        var grupoEscolhido = (proximoSlot === 'primario') ? grupoPrimario : grupoSecundario;
        proximoSlot = (proximoSlot === 'primario') ? 'secundario' : 'primario';

        var disponiveis = redesDisponiveisDoGrupo(grupoEscolhido);
        if (disponiveis.length === 0) {
            /* Segurança: não deveria acontecer (gruposAtivos() já
               filtra por isto), mas evita travar o ciclo se acontecer. */
            agendarProximoPopup();
            return;
        }

        exibirPopupRede(aleatorio(disponiveis));
    }

    function exibirPopupRede(rede) {
        popupsExibidosNestaSessao += 1;

        var el = criarPopupRede(rede);
        document.body.appendChild(el);
        mostrarPopup(el);

        /* × : conta o fechamento; ao atingir LIMITE_FECHAMENTOS, trata
           esta rede como seguida (nunca mais aparece). De qualquer
           forma, fecha e agenda o próximo popup. */
        el.querySelector('.popup-fechar').addEventListener('click', function () {
            if (contarFechamento(rede.id) >= LIMITE_FECHAMENTOS) {
                marcarRedeSeguida(rede.id);
            }
            fecharPopup(el, agendarProximoPopup);
        });

        /* Seguir : grava e fecha — esta rede nunca mais aparece;
           agenda o próximo popup normalmente. */
        el.querySelector('.popup-btn-seguir').addEventListener('click', function () {
            marcarRedeSeguida(rede.id);
            fecharPopup(el, agendarProximoPopup);
        });
    }

    function iniciarRedes() {
        /* DELAY_REDES_MS conta a partir do momento em que esta função é
           chamada, ou seja: após o popup de privacidade ser fechado (ou
           imediatamente se já tiver sido aceite em visita anterior) —
           ver Secção 7. O mesmo DELAY_REDES_MS é reaproveitado entre
           todos os popups seguintes (ver agendarProximoPopup()). */
        proximoSlot = 'primario';
        popupsExibidosNestaSessao = 0;
        agendarProximoPopup();
    }


    /* ══════════════════════════════════════════════════════════
       SECÇÃO 7 — ARRANQUE
       ══════════════════════════════════════════════════════════
       Para desactivar um módulo inteiro, comentar a sua linha:
         • iniciarPrivacidade() — desactiva o aviso de privacidade
         • iniciarRedes()       — desactiva todos os popups de redes
       ══════════════════════════════════════════════════════════ */

    function iniciar() {
        injectarEstilosGlobais();
        /* Redes só arrancam após o aviso de privacidade ser fechado (ou
           imediatamente, se já tiver sido aceite em visita anterior) */
        iniciarPrivacidade(iniciarRedes);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

}());
