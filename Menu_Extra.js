// =====================================================================================
// Menu_Extra_Otimizado.js - Botões flutuantes (Performance & Scroll Nativo)
// Adaptado para integração com Sistema_Tema.js (mantendo tema local dos botões)
// =====================================================================================
(function() {
    'use strict';

    // ============================================
    // 1. CONFIGURAÇÃO & LINKS
    // ============================================
    const CONFIG = {
        links: {
            PEÃO: 'notas.html',
            TORRE: '4REINOS.html',
            CAVALO: 'LINHADOTEMPO.html',
            RAINHA: 'Copas.html',
            REI: 'IMG_XXX_ALEATOREA.html',
            SEIS: 'notas.html',
            SETIMO: 'notas.html'
        },
        layout: {
            gap: '14px',        // Espaço entre botões (70px total - 56px altura = 14px gap)
            paddingTop: '20px', // Offset do topo
            paddingRight: '20px'// Offset da direita
        },
        zIndex: {
            wrapper: 800,
            modal: 1001
        },
        mobileBreakpoint: 768
    };

    // Estado interno simplificado
    const State = {
        wrapper: null,
        toggleBtn: null,
        modals: new Map(),
        isMobileMenuOpen: false,
        // REMOVIDO: observer local de tema
    };

    // ============================================
    // 2. INJEÇÃO DE CSS (Core da Otimização)
    // ============================================
    // Variáveis CSS para o tema local dos botões
    function injectStyles() {
        const css = `
            :root {
                --me-btn-bg-light: linear-gradient(145deg, #f5f5f5, #e0e0e0);
                --me-btn-bg-dark: linear-gradient(145deg, #232323, #121212);
                --me-btn-text-light: #333;
                --me-btn-text-dark: #f0f0f0;
                --me-btn-border-light: rgba(0,0,0,0.08);
                --me-btn-border-dark: rgba(255,255,255,0.1);
                --me-btn-shadow-light: 0 8px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
                --me-btn-shadow-dark: 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
                --me-btn-shadow-hover-light: 0 12px 28px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8);
                --me-btn-shadow-hover-dark: 0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
            }

            /* Container de Scroll Inteligente */
            #menu-extra-wrapper {
                position: fixed;
                top: 0;
                right: 0;
                height: 100vh;
                width: 100px; /* Largura segura para área de toque */
                padding-top: ${CONFIG.layout.paddingTop};
                padding-right: ${CONFIG.layout.paddingRight};
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: flex-end; /* Alinha à direita */
                gap: ${CONFIG.layout.gap};
                z-index: ${CONFIG.zIndex.wrapper};
                overflow-y: auto;
                overflow-x: hidden;
                pointer-events: none; /* Permite clicar no site através dos espaços */
                scrollbar-width: none; /* Firefox */
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            #menu-extra-wrapper::-webkit-scrollbar { display: none; }

            /* Botões */
            .me-btn {
                width: 56px;
                height: 56px;
                border-radius: 18px;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                flex-shrink: 0; /* Impede achatamento no scroll */
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.25s ease;
                pointer-events: auto; /* Botões são clicáveis */
                will-change: transform;
                
                /* Tema Local (Definido por variáveis CSS injetadas acima) */
                background: var(--me-btn-bg-light);
                color: var(--me-btn-text-light);
                border: 1px solid var(--me-btn-border-light);
                box-shadow: var(--me-btn-shadow-light);
            }

            /* Tema Escuro Local para Botões */
            html.tema-escuro .me-btn {
                background: var(--me-btn-bg-dark);
                color: var(--me-btn-text-dark);
                border: 1px solid var(--me-btn-border-dark);
                box-shadow: var(--me-btn-shadow-dark);
            }

            /* Interações */
            .me-btn:hover { transform: scale(1.08); }
            .me-btn:active { transform: scale(0.95) translateY(1px); }
            
            html.tema-escuro .me-btn:hover { box-shadow: var(--me-btn-shadow-hover-dark); }
            html:not(.tema-escuro) .me-btn:hover { box-shadow: var(--me-btn-shadow-hover-light); }

            /* Botão Toggle (As) - Fica fora do wrapper para controle independente */
            #me-toggle-btn {
                position: fixed;
                top: ${CONFIG.layout.paddingTop};
                right: ${CONFIG.layout.paddingRight};
                z-index: ${CONFIG.zIndex.wrapper + 1};
                display: none; /* Escondido em Desktop */
            }

            /* Modal Overlay - Usa variável do Sistema_Tema.js */
            .me-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: var(--modal-bg, rgba(0, 0, 0, 0.8)); /* Usa variável do Sistema_Tema.js */
                display: flex; justify-content: center; align-items: center;
                opacity: 0; visibility: hidden;
                transition: opacity 0.2s, visibility 0.2s;
                z-index: ${CONFIG.zIndex.modal};
            }
            .me-modal-active { opacity: 1; visibility: visible; }
            
            .me-iframe {
                width: 95%; height: 95%; max-width: 1400px; max-height: 900px;
                border: none; border-radius: 10px;
                transform: scale(0.9); transition: transform 0.2s;
                /* O fundo do iframe agora depende da página carregada */
            }
            .me-modal-active .me-iframe { transform: scale(1); }

            /* ================= RESPONSIVIDADE ================= */
            @media (max-width: ${CONFIG.mobileBreakpoint}px) {
                /* Em mobile, o wrapper principal começa escondido */
                #menu-extra-wrapper {
                    display: none; 
                    background: var(--modal-bg, rgba(0,0,0,0.3)); /* Usa variável do Sistema_Tema.js */
                    width: 100%; /* Largura total para capturar toque fora e fechar */
                    pointer-events: auto; /* Habilita scroll e clique fora */
                    padding-right: ${CONFIG.layout.paddingRight}; /* Mantém alinhamento */
                }

                /* Quando o menu está ABERTO em mobile */
                #menu-extra-wrapper.is-open {
                    display: flex;
                    /* Recuo no rodapé igual ao recuo do topo */
                    padding-bottom: ${CONFIG.layout.paddingTop};
                }

                /* O Botão Toggle (As) aparece em mobile */
                #me-toggle-btn {
                    display: flex;
                }
                
                /* Se o menu estiver aberto, esconde o botão Toggle */
                body.menu-extra-open #me-toggle-btn {
                    display: none;
                }
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    // ============================================
    // 3. CRIAÇÃO DO DOM
    // ============================================
    function createElements() {
        // 1. Wrapper Lateral (Scrollável)
        const wrapper = document.createElement('div');
        wrapper.id = 'menu-extra-wrapper';
        
        // Definição dos botões de conteúdo
        const buttonsData = [
            { id: 'Um-btn', icon: '𝕀', link: CONFIG.links.PEÃO, modalId: 'Um-modal' },
            { id: 'Dois-btn', icon: '𝕀𝕀️', link: CONFIG.links.TORRE, modalId: 'Dois-modal' },
            { id: 'Tres-btn', icon: '𝕀𝕀𝕀', link: CONFIG.links.CAVALO, modalId: 'Tres-modal' },
            { id: 'Quatro-btn', icon: '𝕀𝕍', link: CONFIG.links.RAINHA, modalId: 'Quatro-modal' },
            { id: 'Cinco-btn', icon: '𝕍️', link: CONFIG.links.REI, modalId: 'Cinco-modal' },
            { id: 'Seis-btn', icon: '𝕍𝕀', link: CONFIG.links.SEIS, modalId: 'Seis-modal' },
            { id: 'Setimo-btn', icon: '𝕍𝕀𝕀', link: CONFIG.links.SETIMO, modalId: 'Setimo-modal' }
        ];

        // Criação em Batch (Fragment)
        const fragment = document.createDocumentFragment();
        
        buttonsData.forEach(btn => {
            const button = document.createElement('div');
            button.className = 'me-btn';
            button.id = btn.id; // Mantendo IDs se necessário, mas classes são melhores
            button.textContent = btn.icon;
            button.onclick = (e) => {
                e.stopPropagation(); // Impede fechar o menu ao clicar no botão
                openModal(btn.link, btn.modalId);
            };
            fragment.appendChild(button);
        });

        wrapper.appendChild(fragment);
        
        // NOTA: O botão "topo" foi removido conforme solicitado
        // O código que criava o botão "topo" foi completamente excluído
        
        document.body.appendChild(wrapper);
        State.wrapper = wrapper;

        // 2. Botão Toggle (As) - Separado
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'me-toggle-btn';
        toggleBtn.className = 'me-btn';
        toggleBtn.textContent = '𝔄';
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        };
        document.body.appendChild(toggleBtn);
        State.toggleBtn = toggleBtn;

        // Listener para fechar ao clicar fora (no wrapper mobile)
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper) {
                closeMobileMenu();
            }
        });
    }

    // ============================================
    // 4. LÓGICA DE MODAL
    // ============================================
    function openModal(url, modalId) {
        if (State.modals.has(modalId)) {
            State.modals.get(modalId).classList.add('me-modal-active');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'me-modal-overlay me-modal-active';
        
        const iframe = document.createElement('iframe');
        iframe.className = 'me-iframe';
        iframe.src = url;

        overlay.appendChild(iframe);
        
        // Fechar ao clicar fora
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('me-modal-active');
                setTimeout(() => {
                    overlay.remove();
                    State.modals.delete(modalId);
                }, 200); // Espera transição CSS
            }
        };

        document.body.appendChild(overlay);
        State.modals.set(modalId, overlay);
        
        // REMOVIDO: iframe.onload = () => sendThemeToIframe(iframe);
        // O Sistema_Tema.js cuida de sincronizar o iframe quando ele é criado.
    }

    // ============================================
    // 5. LÓGICA MOBILE & TEMA
    // ============================================

    // REMOVEDO: sendThemeToIframe, broadcastTheme, themeObserver - Sistema_Tema.js faz isso

    function toggleMobileMenu() {
        State.isMobileMenuOpen = !State.isMobileMenuOpen;
        updateMobileState();
    }

    function closeMobileMenu() {
        State.isMobileMenuOpen = false;
        updateMobileState();
    }

    function updateMobileState() {
        if (State.isMobileMenuOpen) {
            State.wrapper.classList.add('is-open');
            document.body.classList.add('menu-extra-open');
        } else {
            State.wrapper.classList.remove('is-open');
            document.body.classList.remove('menu-extra-open');
        }
    }

    // Listener de redimensionamento para resetar estado
    window.addEventListener('resize', () => {
        if (window.innerWidth > CONFIG.mobileBreakpoint && State.isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, { passive: true });

    // ============================================
    // 6. INICIALIZAÇÃO
    // ============================================
    function init() {
        // Remover elementos antigos se existirem (hot reload safe)
        const oldWrapper = document.getElementById('menu-extra-wrapper');
        const oldBtn = document.getElementById('me-toggle-btn');
        if (oldWrapper) oldWrapper.remove();
        if (oldBtn) oldBtn.remove();

        injectStyles();
        createElements();
        
        // REMOVIDO: Observador de tema local
        // REMOVIDO: Escuta de mensagem REQUEST_THEME - Sistema_Tema.js escuta globalmente
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();