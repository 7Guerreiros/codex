(function() {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Evita componentes e eventos duplicados numa segunda execução.
    if (window.__menus7GuerreirosIniciado) return;
    window.__menus7GuerreirosIniciado = true;

    const CONFIG = {
        buttonSpacing: 70,
        initialOffset: { top: 20, left: 20 },
        zIndex: {
            scrollWrapper: 990,
            button: 999,
            menuOverlay: 1000,
            modalOverlay: 1002,
            themeButton: 1000
        },
        modalSize: { width: '95%', height: '95%', maxWidth: '1400px', maxHeight: '900px' }
    };

    const MODAL_CONTENTS = {
        'Trebelho-modal': { src: 'IFRAME_CADERNO_LEITOR.html', title: 'CADERNO DO LEITOR (GUARDA PROGESSOS DE LEITURA E ANOTAÇÕES)' },   // ♣️
        'Losango-modal':  { src: 'IFRAME_MAPA.html', title: 'MAPAS DO MÆ' },                     // ♦️
        'Coracao-modal':  { src: 'IFRAME_CODEX_MACHINAE.html', title: 'CODEX MACHENÆ' },    // ♥️
        'Espada-modal':   { src: 'IFRAME_FORUM.html', title: 'FORÚM (ACESSO E SENHA PARA FACEBOOK, POR ENQUANTO)' }, // ♠️
        'Torre-modal':    { src: 'IFRAME_APOIO.html', title: 'APOIE O PROJETO' },          // ♖
        'Gamer-modal':    { src: 'IFRAME_CHEAT_CODES.html', title: 'CHEATS CODES' }          // 🕹️
    };

    // =================================================================================
    // SEÇÃO 2: ESTADO GLOBAL
    // =================================================================================
    const State = {
        buttons: new Map(),
        modals: new Map(),
        closeMainMenu: null, // Fecho reutilizado após a injecção de um Codex.
        // REMOVIDO: State.theme - O Sistema_Tema.js controla isso
        themeButton: null,
        scrollWrapper: null,
        scrollTrack: null,
        areMobileButtonsVisible: false,
        originalDisplays: new Map(),
        breakpoint: 768,
        resizeTimer: null,
        buttonLayouts: new Map()
    };

    // =================================================================================
    // SEÇÃO 3: ESTILOS CSS OTIMIZADOS (INJETADOS)
    // =================================================================================
    function injectGlobalStyles() {
        const styleId = 'sys-menu-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            /* Container de Scroll */
            #buttons-scroll-wrapper {
                position: fixed; top: 0; left: 0; width: 120px; height: 100vh; height: 100dvh;
                z-index: ${CONFIG.zIndex.scrollWrapper};
                overflow-y: auto; overflow-x: hidden;
                /* Toda a faixa recebe toque e rato, inclusive em paisagem
                   acima de 768px. Os intervalos também pertencem à esteira. */
                pointer-events: auto;
                touch-action: pan-y pinch-zoom;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
                overscroll-behavior-y: contain;
            }
            #buttons-scroll-wrapper::-webkit-scrollbar { display: none; }

            /* --- NOVO: Lógica de Esmaecer (CORRIGIDA PARA IGUALAR O BOTÃO AS) --- */
            @media (max-width: 768px) {
                /* Fechada: a faixa invisível não bloqueia a página. */
                #buttons-scroll-wrapper:not(.mobile-active) {
                    pointer-events: none;
                }
                #buttons-scroll-wrapper.mobile-active {
                    width: 100%; /* Ocupa a tela toda */
                    /* CORREÇÃO: Usando exatamente a mesma cor e opacidade (0.3) do Botão As */
                    background: rgba(0,0,0,0.3); 
                    pointer-events: auto; /* Permite clicar no fundo para fechar */
                }
            }

            /* Evita o flash dos botões antes da visibilidade inicial ser aplicada. */
            @media (max-width: 768px) {
                #buttons-scroll-wrapper .sys-btn { display: none; }
            }
            @media (min-width: 769px) {
                #Sete-btn { display: none; }
            }

            /* Classe Base dos Botões */
            .sys-btn {
                position: absolute; width: 56px; height: 56px;
                border-radius: 18px;
                background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
                color: #333333;
                border: 1px solid rgba(0,0,0,0.08);
                font-size: 22px; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 8px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
                transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                will-change: transform, box-shadow;
                user-select: none;
                backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
                pointer-events: auto;
                z-index: ${CONFIG.zIndex.button};
            }

            /* NOVO: Estilo específico para o Botão Topo (Transparente e Metade da Altura) */
            .sys-btn-topo {
                height: 28px !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                font-size: 18px !important;
            }

            /* Efeitos de Interação (Substitui JS Events) */
            .sys-btn:hover {
                transform: scale(1.08);
                box-shadow: 0 12px 28px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
            }
            .sys-btn-topo:hover {
                transform: scale(1.2);
                box-shadow: none !important;
            }
            .sys-btn:active {
                transform: scale(0.95) translateY(1px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
            }

            /* MANUTENÇÃO: suavidade vertical do Gamer; o botão Topo acompanha
               com a mesma curva para preservar o intervalo entre ambos. */
            #Gamer-btn, #Topo-btn {
                transition: top 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                            transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
                            box-shadow 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            }

            .sys-btn:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
            @media (prefers-reduced-motion: reduce) {
                .sys-btn, #Gamer-btn, #Topo-btn, .sys-modal-overlay, .sys-modal-iframe { transition: none; }
            }

            /* Modal Overlay */
            .sys-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: ${CONFIG.zIndex.modalOverlay};
                display: flex; justify-content: center; align-items: center;
                background-color: var(--modal-bg, rgba(0, 0, 0, 0.8)); /* <- USANDO VAR DO SISTEMA_TEMA */
                opacity: 0; visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease;
            }
            .sys-modal-iframe {
                width: ${CONFIG.modalSize.width}; height: ${CONFIG.modalSize.height};
                max-width: ${CONFIG.modalSize.maxWidth}; max-height: ${CONFIG.modalSize.maxHeight};
                border: none; border-radius: 10px;
                box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
                transform: scale(0.9); transition: transform 0.2s ease;
            }
            .sys-modal-active { opacity: 1; visibility: visible; }
            .sys-modal-active .sys-modal-iframe { transform: scale(1); }

        `;

        // A altura dinâmica acompanha as barras do navegador no telemóvel.
        // Mantém-se a esteira vertical e o fundo clicável de largura total.
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // =================================================================================
    // SEÇÃO 4: FUNÇÕES CORE
    // =================================================================================

    // A altura visual exclui a área ocupada pelas barras do navegador.
    // Usa a menor medida para não projectar botões para uma área encoberta.
    function getVisibleHeight() {
        const visual = window.visualViewport;
        return visual && visual.height > 0
            ? Math.min(window.innerHeight, visual.height)
            : window.innerHeight;
    }

    function updateScrollViewport() {
        if (State.scrollWrapper) {
            State.scrollWrapper.style.height = `${getVisibleHeight()}px`;
        }
    }

    // A pista tem altura real no fluxo: o scrollHeight do wrapper inclui
    // sempre o último botão e a margem inferior, também em paisagem.
    function updateScrollEnd() {
        if (!State.scrollTrack) return;
        let end = 0;
        State.buttons.forEach((btn, id) => {
            if (id === 'Sete-btn') return;
            const height = btn.offsetHeight || (id === 'Topo-btn' ? 28 : 58);
            end = Math.max(end, (parseFloat(btn.style.top) || 0) + height);
        });
        State.scrollTrack.style.height = `${Math.ceil(end + 32)}px`;
    }

    // No PC a roda é encaminhada na faixa completa de 120px, incluindo
    // os intervalos. O toque usa a rolagem nativa do mesmo contentor.
    // Fora dessa faixa, com Ctrl/zoom ou com um painel aberto, não interfere.
    function handleDesktopWheel(event) {
        const wrapper = State.scrollWrapper;
        if (!wrapper || window.innerWidth <= State.breakpoint || event.ctrlKey ||
            event.defaultPrevented || State.modals.size ||
            document.getElementById('menu-lateral-overlay')) return;
        const rect = wrapper.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX >= rect.right ||
            event.clientY < rect.top || event.clientY >= rect.bottom) return;
        if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? wrapper.clientHeight : 1;
        const maximum = Math.max(0, wrapper.scrollHeight - wrapper.clientHeight);
        const next = Math.max(0, Math.min(maximum, wrapper.scrollTop + event.deltaY * unit));
        if (next === wrapper.scrollTop) return;
        if (!event.cancelable) return;
        event.preventDefault();
        wrapper.scrollTop = next;
    }

    /**
     * Calcula posição Y baseada no layout
     */
    function calculateButtonTop(id, layout) {
        if (layout.type === 'fixed') return layout.top;
        
        if (layout.type === 'relative') {
            return layout.baseTop + (CONFIG.buttonSpacing * layout.offset);
        }
        
        if (layout.type === 'bottom') {
            if (id === 'Gamer-btn') {
                // Lógica específica do Gamer
                let baseTop;
                const temaBtn = State.themeButton;
                
                if (temaBtn) {
                    const currentTop = parseFloat(temaBtn.style.top);
                    baseTop = currentTop + CONFIG.buttonSpacing;
                } else {
                    const espadaBtn = State.buttons.get('Espada-btn');
                    if (espadaBtn) {
                        const currentTop = parseFloat(espadaBtn.style.top);
                        baseTop = currentTop + (CONFIG.buttonSpacing * 2);
                    } else {
                        baseTop = getVisibleHeight() - layout.offsetFromBottom;
                    }
                }
                const bottomTop = getVisibleHeight() - layout.offsetFromBottom;
                return Math.max(baseTop, bottomTop);
            }
            
            if (id === 'Topo-btn') {
                const gamerBtn = State.buttons.get('Gamer-btn');
                if (gamerBtn) {
                    const gamerTop = parseFloat(gamerBtn.style.top);
                    return gamerTop + 65; // Posiciona-se logo abaixo do Gamer
                }
                return getVisibleHeight() - layout.offsetFromBottom;
            }

            return getVisibleHeight() - layout.offsetFromBottom;
        }
        return 0;
    }

    function createFloatingButton(id, icon, onClickHandler, layout, customZIndex = null) {
        // Limpeza prévia
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const button = document.createElement('button');
        button.id = id;
        button.type = 'button';
        button.innerHTML = icon;
        button.className = 'sys-btn'; // Usa a classe CSS otimizada

        // Configuração de posição
        const isSete = id === 'Sete-btn';
        button.style.position = isSete ? 'fixed' : 'absolute';
        if (customZIndex) button.style.zIndex = customZIndex;

        // Cálculo inicial de posição
        const top = calculateButtonTop(id, layout);
        button.style.top = `${top}px`;
        button.style.left = `${layout.left}px`;

        // Event listener único (sem mouseenter/leave/down/up pesados)
        button.addEventListener('click', onClickHandler);

        // Estado
        State.buttons.set(id, button);
        State.buttonLayouts.set(id, layout);
        State.originalDisplays.set(id, 'flex');

        return button; // Retorna elemento (não anexa ainda, feito em batch)
    }

    // =================================================================================
    // SEÇÃO 5: MODAIS E MENUS - MODIFICAÇÃO PRINCIPAL AQUI
    // =================================================================================

    function createModal(modalId) {
        if (State.modals.has(modalId)) return;

        const config = MODAL_CONTENTS[modalId];
        if (!config) return console.error(`Modal config missing: ${modalId}`);

        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.className = 'sys-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', config.title);
        overlay._returnFocus = document.activeElement;
        
        const iframe = document.createElement('iframe');
        iframe.className = 'sys-modal-iframe';
        iframe.title = config.title;
        iframe.addEventListener('load', () => sincronizarTema(iframe));
        // CORREÇÃO: Agora usa a variável CSS definida pelo Sistema_Tema.js
        // O fundo do iframe será controlado pelo CSS do próprio iframe ou pela página carregada nele.
        // Aqui, apenas o overlay (externo) usa a variável.
        
        // --- ALTERAÇÃO CIRÚRGICA: Botão 'x' removido desta função ---
        
        overlay.appendChild(iframe);
        // Botão closeButton não é mais anexado aqui
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modalId);
        });

        document.body.appendChild(overlay);
        State.modals.set(modalId, overlay);

        // Animação com requestAnimationFrame para performance
        requestAnimationFrame(() => {
            if (overlay.dataset.fechando === 'true' || !overlay.isConnected) return;
            iframe.src = config.src;
            overlay.classList.add('sys-modal-active');
            iframe.focus();
        });
    }

    function closeModal(modalId) {
        const modal = State.modals.get(modalId);
        if (modal && modal.dataset.fechando !== 'true') {
            modal.dataset.fechando = 'true';
            modal.classList.remove('sys-modal-active');
            setTimeout(() => {
                if (modal.parentNode) modal.remove();
                State.modals.delete(modalId);
                if (modal._returnFocus && modal._returnFocus.isConnected) modal._returnFocus.focus();
            }, 200);
        }
    }

    // =================================================================================
    // SEÇÃO 5.1: FECHO DE MODAL SOLICITADO PELO PRÓPRIO IFRAME (adição incremental)
    // =================================================================================
    // O botão "X" dentro de IFRAME_MAPA.html envia postMessage({type:'FECHAR_MODAL'}).
    // Aqui identificamos qual modal enviou o pedido (comparando o iframe.contentWindow
    // com a origem da mensagem) e chamamos closeModal() já existente. Nenhuma outra
    // lógica de Menus.js foi alterada.
    window.addEventListener('message', function (e) {
        // Em file:// o remetente pode ter origem opaca ("null").
        // Esta excepção só existe no modo local. Por HTTP/HTTPS mantém-se
        // a origem exacta; abaixo continua obrigatória a identidade do iframe.
        const origemValida = e.origin === window.location.origin ||
            (window.location.protocol === 'file:' && e.origin === 'null');
        if (!origemValida || !e.data || e.data.type !== 'FECHAR_MODAL') return;
        State.modals.forEach(function (overlay, modalId) {
            var iframe = overlay.querySelector('iframe');
            if (iframe && iframe.contentWindow === e.source) {
                closeModal(modalId);
            }
        });
    });

    // Notifica o iframe após o carregamento, sem mudar o tema nem o armazenamento.
    function sincronizarTema(iframe) {
        if (!iframe.contentWindow || window.location.origin === 'null') return;
        iframe.contentWindow.postMessage({
            type: 'SET_THEME',
            theme: document.documentElement.classList.contains('tema-escuro') ? 'escuro' : 'claro'
        }, window.location.origin);
    }

    function handleMenuClick() {
        if (document.getElementById('menu-lateral-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'menu-lateral-overlay';
        // Estilos mantidos inline aqui por serem muito específicos e dinâmicos
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 300px; max-width: 100%; height: 100vh; height: 100dvh;
            background-color: var(--modal-bg, rgba(0,0,0,0.8)); /* <- USANDO VAR DO SISTEMA_TEMA */
            z-index: ${CONFIG.zIndex.menuOverlay};
            display: flex; opacity: 0; visibility: hidden; transform: translateX(-100%);
            transition: all 0.2s ease;
        `;

        const iframe = document.createElement('iframe');
        iframe.title = 'Menu principal';
        iframe.addEventListener('load', () => sincronizarTema(iframe));
        iframe.style.cssText = `width: 100%; height: 100%; border: none;`; // Removido bg inline
        // O fundo do iframe agora depende da página carregada ou de seu próprio CSS

        const closeMenu = (e) => {
            if ((!e || !overlay.contains(e.target)) && overlay.dataset.fechando !== 'true') {
                overlay.dataset.fechando = 'true';
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                overlay.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.remove();
                    document.removeEventListener('click', closeMenu);
                    if (State.closeMainMenu === closeMenu) State.closeMainMenu = null;
                    manageMobileVisibility();
                }, 200);
            }
        };
        State.closeMainMenu = closeMenu;

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            if (overlay.dataset.fechando === 'true' || !overlay.isConnected) return;
            iframe.src = 'MENU_GERAL.html';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.transform = 'translateX(0)';
        });

        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    }

    // =================================================================================
    // SEÇÃO 5.2: NAVEGAÇÃO ENTRE CODEX — posição e fecho do menu
    // =================================================================================
    // index.html emite este evento APÓS a injecção e reactivação dos scripts.
    // Não observa capítulos/notas. A abertura inicial preserva a restauração.
    // MANUTENÇÃO: 40px é a margem superior do título, como na referência.
    // Sem .banner-nome, utiliza o topo normal; não modifica o Banner.js.
    function setupCodexNavigation() {
        window.addEventListener('site:codex-injetado', function (event) {
            if (!event.detail || event.detail.inicial) return;
            requestAnimationFrame(function () {
                if (State.closeMainMenu) State.closeMainMenu();
                if (State.areMobileButtonsVisible) {
                    State.areMobileButtonsVisible = false;
                    State.scrollWrapper.classList.remove('mobile-active');
                    const sete = State.buttons.get('Sete-btn');
                    if (sete) sete.setAttribute('aria-expanded', 'false');
                    document.removeEventListener('click', hideMobileOutside);
                    manageMobileVisibility();
                }
                const titulo = document.querySelector('.banner-nome');
                const top = titulo
                    ? Math.max(0, window.scrollY + titulo.getBoundingClientRect().top - 40)
                    : 0;
                const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                window.scrollTo({ top: top, behavior: reduzir ? 'instant' : 'smooth' });
            });
        });
    }

    // =================================================================================
    // SEÇÃO 6: TEMA E VISIBILIDADE - OPTIMIZADA
    // =================================================================================

    // Mantido apenas para atualizar os ícones
    function updateThemeButtonIcons() {
        if (!State.themeButton) return;
        const isDark = document.documentElement.classList.contains('tema-escuro');
        
        // Apenas atualiza os ícones - Sistema_Tema.js controla o tema
        State.themeButton.querySelector('.icon-light').style.display = isDark ? 'none' : 'block';
        State.themeButton.querySelector('.icon-dark').style.display = isDark ? 'block' : 'none';
    }

    function repositionAllButtons() {
        updateScrollViewport();
        // Tema participa do mesmo layout relativo dos botões principais.
        // Gamer e Topo continuam calculados por último, como anteriormente.
        State.buttons.forEach((btn, id) => {
            const layout = State.buttonLayouts.get(id);
            if (layout && !['Gamer-btn', 'Topo-btn'].includes(id)) {
                btn.style.top = `${calculateButtonTop(id, layout)}px`;
            }
        });
        ['Gamer-btn', 'Topo-btn'].forEach(id => {
            const btn = State.buttons.get(id);
            const layout = State.buttonLayouts.get(id);
            if (btn && layout) btn.style.top = `${calculateButtonTop(id, layout)}px`;
        });
        updateScrollEnd();
    }

    // Após redimensionar, uma posição de scroll antiga pode deixar o ♟
    // cortado no limite superior. Recupera o início apenas nesse caso.
    // Não é chamada na rolagem manual: a esteira continua livre no telemóvel.
    function restoreTopButtonAfterResize() {
        const wrapper = State.scrollWrapper;
        const firstButton = State.buttons.get('menu-flutuante-btn');
        if (!wrapper || !firstButton || firstButton.style.display === 'none') return;
        const top = parseFloat(firstButton.style.top) || 0;
        if (wrapper.scrollTop > Math.max(0, top - 4)) wrapper.scrollTop = 0;
    }

    function manageMobileVisibility() {
        const isMobile = window.innerWidth <= State.breakpoint;
        requestAnimationFrame(() => {
            // Ao sair do modo móvel, remove o fundo e o estado de abertura.
            if (!isMobile) {
                State.areMobileButtonsVisible = false;
                document.removeEventListener('click', hideMobileOutside);
            }
            State.scrollWrapper.classList.toggle('mobile-active', isMobile && State.areMobileButtonsVisible);
            State.buttons.forEach((btn, id) => {
                if (!btn) return;
                const show = isMobile ? (id === 'Sete-btn' ? !State.areMobileButtonsVisible : State.areMobileButtonsVisible) : (id !== 'Sete-btn');
                btn.style.display = show ? 'flex' : 'none';
            });
            updateScrollEnd();
        });
    }

    function createSeteButton() {
        const btn = createFloatingButton('Sete-btn', '☰', (e) => { 
            e.stopPropagation(); 
            State.areMobileButtonsVisible = true; 
            State.scrollWrapper.classList.add('mobile-active');
            manageMobileVisibility(); 
            btn.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', hideMobileOutside); 
        }, { type: 'fixed', top: CONFIG.initialOffset.top, left: CONFIG.initialOffset.left });
        btn.title = 'Abrir botões do menu';
        btn.setAttribute('aria-label', 'Abrir botões do menu');
        btn.setAttribute('aria-controls', 'buttons-scroll-wrapper');
        btn.setAttribute('aria-expanded', 'false');
        document.body.appendChild(btn);
    }

    const hideMobileOutside = (e) => {
        if (!Array.from(State.buttons.values()).some(b => b?.contains(e.target))) {
            State.areMobileButtonsVisible = false;
            const sete = State.buttons.get('Sete-btn');
            if (sete) sete.setAttribute('aria-expanded', 'false');
            State.scrollWrapper.classList.remove('mobile-active');
            manageMobileVisibility();
            document.removeEventListener('click', hideMobileOutside);
        }
    };

    // =================================================================================
    // SEÇÃO 7: INICIALIZAÇÃO
    // =================================================================================

    function initialize() {
        injectGlobalStyles();
        setupCodexNavigation();

        // Cria Wrapper
        const scrollWrapper = document.createElement('div');
        scrollWrapper.id = 'buttons-scroll-wrapper';
        document.body.appendChild(scrollWrapper);
        State.scrollWrapper = scrollWrapper;
        // Contentor real no fluxo. Não usar aria-hidden: contém os botões.
        const scrollTrack = document.createElement('div');
        scrollTrack.id = 'buttons-scroll-track';
        scrollTrack.style.cssText = 'position:relative;width:100%;min-height:100%;';
        scrollWrapper.appendChild(scrollTrack);
        State.scrollTrack = scrollTrack;
        updateScrollViewport();

        // Fragmento para inserção em lote (Melhor performance de carga)
        const fragment = document.createDocumentFragment();

        // Definição dos botões principais
        const buttonsDef = [
            { id: 'menu-flutuante-btn', title: "Menu Ascético", icon: '♟',   click: handleMenuClick,                          layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 0, left: CONFIG.initialOffset.left }, z: CONFIG.zIndex.button + 1 },
            { id: 'Trebelho-btn',       title: "Notas Alquímicas", icon: '♣️',  click: () => createModal('Trebelho-modal'),       layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 1, left: CONFIG.initialOffset.left } },
            { id: 'Losango-btn',        title: "Mapa Oculto", icon: '♦️',  click: () => createModal('Losango-modal'),        layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 2, left: CONFIG.initialOffset.left } },
            { id: 'Coracao-btn',        title: "CODEX MACHINÆ", icon: '♥️',  click: () => createModal('Coracao-modal'),        layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 3, left: CONFIG.initialOffset.left } },
            { id: 'Espada-btn',         title: "Catálogo", icon: '♠️',  click: () => createModal('Espada-modal'),         layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 4, left: CONFIG.initialOffset.left } },
            { id: 'Torre-btn',          title: "A Torre Negra", icon: '♜',   click: () => createModal('Torre-modal'),          layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 5, left: CONFIG.initialOffset.left } },
            // Tema: mesmo grupo, espaçamento e inserção em lote dos demais.
            { id: 'tema-btn', title: "Alternar tema",
              icon: '<span class="icon-light">♚</span><span class="icon-dark" style="display:none;">♕</span>',
              click: () => {
                  // Sistema_Tema.js continua responsável pela troca do tema.
                  if (typeof window.alternarTemaGlobal === 'function') {
                      window.alternarTemaGlobal();
                  }
              },
              layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 6, left: CONFIG.initialOffset.left },
              z: CONFIG.zIndex.themeButton },
            { id: 'Gamer-btn',          title: "CHEAT CODES", icon: '🕹️', click: () => createModal('Gamer-modal'), layout: { type: 'bottom', offsetFromBottom: 110, left: CONFIG.initialOffset.left } },
            { id: 'Topo-btn',           title: "Topo", icon: '🎲',  click: () => window.scrollTo({ top: 0, behavior: 'smooth' }), layout: { type: 'bottom', offsetFromBottom: 60, left: CONFIG.initialOffset.left } }
        ];

        // Cria e anexa ao fragmento
        buttonsDef.forEach(def => {
            const btn = createFloatingButton(def.id, def.icon, def.click, def.layout, def.z);
			btn.title = def.title;
            btn.setAttribute('aria-label', def.title);
            // Referência e ícone definidos antes de o botão entrar no DOM.
            if (def.id === 'tema-btn') {
                State.themeButton = btn;
                updateThemeButtonIcons();
            }
            if (def.id === 'Topo-btn') btn.classList.add('sys-btn-topo');
            fragment.appendChild(btn);
        });

        // Única inserção no DOM (Reflow único)
        State.scrollTrack.appendChild(fragment);

        // Inicialização secundária, sem atraso que provoque um flash inicial.
        {
            createSeteButton();
            manageMobileVisibility();
            repositionAllButtons();
            // REMOVIDO: Não precisa broadcastThemeToIframes - Sistema_Tema.js cuida disso
        }

        // Listeners Globais Otimizados
        window.addEventListener('resize', () => {
            clearTimeout(State.resizeTimer);
            State.resizeTimer = setTimeout(() => {
                manageMobileVisibility();
                repositionAllButtons();
                // Executa depois de aplicar a visibilidade do novo tamanho.
                requestAnimationFrame(restoreTopButtonAfterResize);
            }, 100); // Debounce aumentado
        });

        // A roda passa a funcionar também nos espaços entre os botões.
        window.addEventListener('wheel', handleDesktopWheel, { passive: false, capture: true });

        // Barras do navegador podem alterar só a área visual. Não repõe o
        // scroll da esteira aqui: preserva a rolagem manual durante esse ajuste.
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                repositionAllButtons();
            });
        }

        // Observer de Tema Global - APENAS para atualizar ícones
        const observer = new MutationObserver((mutations) => {
            for (let m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    // Apenas atualiza os ícones do botão
                    updateThemeButtonIcons();
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // REMOVIDO: Não precisa escutar mensagens de tema - Sistema_Tema.js cuida disso
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();