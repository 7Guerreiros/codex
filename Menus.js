(function() {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
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
        'Peao-modal': { src: 'ANOTACOES.html', title: 'Notas' },
        'Paus-modal': { src: 'CODEX_HOMINE.html', title: '4 Reinos' },
        'Ouro-modal': { src: 'CODEX_MACHINA.html', title: 'Linha do Tempo' },
        'Copas-modal': { src: 'MAPA.html', title: 'Copas' },
        'Espada-modal': { src: 'FORUM.html', title: 'Imagens Aleatórias' }
    };

    // =================================================================================
    // SEÇÃO 2: ESTADO GLOBAL
    // =================================================================================
    const State = {
        buttons: new Map(),
        modals: new Map(),
        // REMOVIDO: State.theme - O Sistema_Tema.js controla isso
        themeButton: null,
        scrollWrapper: null,
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
                position: fixed; top: 0; left: 0; width: 120px; height: 100vh;
                z-index: ${CONFIG.zIndex.scrollWrapper};
                overflow-y: auto; overflow-x: hidden;
                pointer-events: none;
                scrollbar-width: none;
            }
            #buttons-scroll-wrapper::-webkit-scrollbar { display: none; }

            /* --- NOVO: Lógica de Esmaecer (CORRIGIDA PARA IGUALAR O BOTÃO AS) --- */
            @media (max-width: 768px) {
                #buttons-scroll-wrapper.mobile-active {
                    width: 100%; /* Ocupa a tela toda */
                    /* CORREÇÃO: Usando exatamente a mesma cor e opacidade (0.3) do Botão As */
                    background: rgba(0,0,0,0.3); 
                    pointer-events: auto; /* Permite clicar no fundo para fechar */
                }
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
                max-width: ${CONFIG.modalSize.maxWidth}; maxHeight: ${CONFIG.modalSize.maxHeight};
                border: none; border-radius: 10px;
                box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
                transform: scale(0.9); transition: transform 0.2s ease;
            }
            .sys-modal-active { opacity: 1; visibility: visible; }
            .sys-modal-active .sys-modal-iframe { transform: scale(1); }

            /* ================================================= */
            /* NOVO: Botão de Fechar (×) para Modais - LEVE E OTIMIZADO */
            /* ================================================= */
            .sys-modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                color: white;
                font-size: 28px;
                cursor: pointer;
                z-index: 1003;
                line-height: 1;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            .sys-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: scale(1.1);
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // =================================================================================
    // SEÇÃO 4: FUNÇÕES CORE
    // =================================================================================

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
                        baseTop = window.innerHeight - layout.offsetFromBottom;
                    }
                }
                const bottomTop = window.innerHeight - layout.offsetFromBottom;
                return Math.max(baseTop, bottomTop);
            }
            
            // NOVO: Lógica de posicionamento para o botão de Topo (abaixo do Gamer)
            if (id === 'Topo-btn') {
                const gamerBtn = State.buttons.get('Gamer-btn');
                if (gamerBtn) {
                    const gamerTop = parseFloat(gamerBtn.style.top);
                    return gamerTop + 65; // Posiciona-se logo abaixo do Gamer
                }
            }

            return window.innerHeight - layout.offsetFromBottom;
        }
        return 0;
    }

    function createFloatingButton(id, icon, onClickHandler, layout, customZIndex = null) {
        // Limpeza prévia
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const button = document.createElement('button');
        button.id = id;
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
        
        const iframe = document.createElement('iframe');
        iframe.className = 'sys-modal-iframe';
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
            iframe.src = config.src;
            overlay.classList.add('sys-modal-active');
        });
    }

    function closeModal(modalId) {
        const modal = State.modals.get(modalId);
        if (modal) {
            modal.classList.remove('sys-modal-active');
            setTimeout(() => {
                if (modal.parentNode) modal.remove();
                State.modals.delete(modalId);
            }, 200);
        }
    }

    function handleMenuClick() {
        if (document.getElementById('menu-lateral-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'menu-lateral-overlay';
        // Estilos mantidos inline aqui por serem muito específicos e dinâmicos
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 300px; height: 100vh;
            background-color: var(--modal-bg, rgba(0,0,0,0.8)); /* <- USANDO VAR DO SISTEMA_TEMA */
            z-index: ${CONFIG.zIndex.menuOverlay};
            display: flex; opacity: 0; visibility: hidden; transform: translateX(-100%);
            transition: all 0.2s ease;
        `;

        const iframe = document.createElement('iframe');
        iframe.style.cssText = `width: 100%; height: 100%; border: none;`; // Removido bg inline
        // O fundo do iframe agora depende da página carregada ou de seu próprio CSS

        const closeMenu = (e) => {
            if (!overlay.contains(e.target)) {
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                overlay.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.remove();
                    document.removeEventListener('click', closeMenu);
                    manageMobileVisibility();
                }, 200);
            }
        };

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            iframe.src = 'MENU_SANDUICHE.html';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.transform = 'translateX(0)';
        });

        setTimeout(() => document.addEventListener('click', closeMenu), 10);
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
        State.buttons.forEach((btn, id) => {
            const layout = State.buttonLayouts.get(id);
            if (id === 'tema-btn') {
                const espada = State.buttons.get('Espada-btn');
                if (espada) btn.style.top = `${parseFloat(espada.style.top) + CONFIG.buttonSpacing}px`;
            } else if (layout && btn) {
                btn.style.top = `${calculateButtonTop(id, layout)}px`;
            }
        });
    }

    function manageMobileVisibility() {
        const isMobile = window.innerWidth <= State.breakpoint;
        requestAnimationFrame(() => {
            State.buttons.forEach((btn, id) => {
                if (!btn) return;
                const show = isMobile ? (id === 'Sete-btn' ? !State.areMobileButtonsVisible : State.areMobileButtonsVisible) : (id !== 'Sete-btn');
                btn.style.display = show ? 'flex' : 'none';
            });
        });
    }

    function createThemeButton() {
        const btn = createFloatingButton('tema-btn', 
            '<span class="icon-light">♔</span><span class="icon-dark" style="display:none;">♛️</span>', 
            () => {
                // Apenas chama a função global - Sistema_Tema.js faz todo o trabalho
                if (typeof window.alternarTemaGlobal === 'function') {
                    window.alternarTemaGlobal();
                }
                // REMOVIDO: Não chama broadcastThemeToIframes - Sistema_Tema.js cuida disso
            },
            { type: 'fixed', top: 0, left: CONFIG.initialOffset.left }, 
            CONFIG.zIndex.themeButton
        );
        State.themeButton = btn;
        State.scrollWrapper.appendChild(btn);
        updateThemeButtonIcons(); // Atualiza ícones com base no tema atual
        repositionAllButtons(); // Garante o alinhamento imediato
    }

    function createSeteButton() {
        const btn = createFloatingButton('Sete-btn', '𝟕️', (e) => { 
            e.stopPropagation(); 
            State.areMobileButtonsVisible = true; 
            State.scrollWrapper.classList.add('mobile-active');
            manageMobileVisibility(); 
            document.addEventListener('click', hideMobileOutside); 
        }, { type: 'fixed', top: CONFIG.initialOffset.top, left: CONFIG.initialOffset.left });
        document.body.appendChild(btn);
    }

    const hideMobileOutside = (e) => {
        if (!Array.from(State.buttons.values()).some(b => b?.contains(e.target))) {
            State.areMobileButtonsVisible = false;
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

        // Cria Wrapper
        const scrollWrapper = document.createElement('div');
        scrollWrapper.id = 'buttons-scroll-wrapper';
        document.body.appendChild(scrollWrapper);
        State.scrollWrapper = scrollWrapper;

        // Fragmento para inserção em lote (Melhor performance de carga)
        const fragment = document.createDocumentFragment();

        // Definição dos botões principais
        const buttonsDef = [
            { id: 'menu-flutuante-btn', icon: '☰', click: handleMenuClick, layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 0, left: CONFIG.initialOffset.left }, z: CONFIG.zIndex.button + 1 },
            { id: 'Peao-btn', icon: '♙', click: () => createModal('Peao-modal'), layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 1, left: CONFIG.initialOffset.left } },
            { id: 'Paus-btn', icon: '♣️', click: () => createModal('Paus-modal'), layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 2, left: CONFIG.initialOffset.left } },
            { id: 'Ouro-btn', icon: '♦️', click: () => createModal('Ouro-modal'), layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 3, left: CONFIG.initialOffset.left } },
            { id: 'Copas-btn', icon: '♥️', click: () => createModal('Copas-modal'), layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 4, left: CONFIG.initialOffset.left } },
            { id: 'Espada-btn', icon: '♠️', click: () => createModal('Espada-modal'), layout: { type: 'relative', baseTop: CONFIG.initialOffset.top, offset: 5, left: CONFIG.initialOffset.left } },
            { id: 'Gamer-btn', icon: '🕹️', click: () => window.location.href = 'Menu_Gamer.html', layout: { type: 'bottom', offsetFromBottom: 110, left: CONFIG.initialOffset.left } },
            { id: 'Topo-btn', icon: '🎲', click: () => window.scrollTo({ top: 0, behavior: 'smooth' }), layout: { type: 'bottom', offsetFromBottom: 40, left: CONFIG.initialOffset.left } }
        ];

        // Cria e anexa ao fragmento
        buttonsDef.forEach(def => {
            const btn = createFloatingButton(def.id, def.icon, def.click, def.layout, def.z);
            if (def.id === 'Topo-btn') btn.classList.add('sys-btn-topo');
            fragment.appendChild(btn);
        });

        // Única inserção no DOM (Reflow único)
        scrollWrapper.appendChild(fragment);

        // Inicialização secundária
        setTimeout(() => {
            createThemeButton();
            createSeteButton();
            manageMobileVisibility();
            repositionAllButtons();
            // REMOVIDO: Não precisa broadcastThemeToIframes - Sistema_Tema.js cuida disso
        }, 50);

        // Listeners Globais Otimizados
        window.addEventListener('resize', () => {
            clearTimeout(State.resizeTimer);
            State.resizeTimer = setTimeout(() => {
                manageMobileVisibility();
                repositionAllButtons();
            }, 100); // Debounce aumentado
        });

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