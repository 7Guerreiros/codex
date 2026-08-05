(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Alterar aqui para trocar imagens, textos ou medidas do banner, sem tocar
    // no resto do ficheiro.
    const CONFIG = {
        imagens: {
            banner: 'IMGS/BANNER.png',
            perfil: 'IMGS/PERFIL.jpg'
        },
        textos: {
            nome:   'BLOG&#9814;7GUERREIROS',
            slogan: 'Litteræ Videogamis 空手道 et Fides Christiana'
        },
        medidas: {
            bannerAltura:    '320px',   // altura da faixa do banner
            perfilTamanho:   '110px',   // diâmetro da foto circular
            slideVelocidade: '0.35s'    // velocidade-base de animação (reservada para uso futuro)
        },
        parallax: {
            factor: 0.5   // 0 = header fixo, 1 = acompanha o scroll normal
        }
    };

    // =================================================================================
    // SEÇÃO 2: ESTILOS CSS (INJETADOS)
    // =================================================================================
    // Réplica exacta dos dois blocos <style> que antes viviam embutidos no
    // index.html. Nenhuma regra foi alterada — apenas centralizada aqui.
    function injectBannerStyles() {
        const styleId = 'sys-banner-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            :root {
                --perfil-tamanho: ${CONFIG.medidas.perfilTamanho};
            }

            #site-header {
                --banner-altura:    ${CONFIG.medidas.bannerAltura};
                --slide-velocidade: ${CONFIG.medidas.slideVelocidade};
            }

            #site-header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 0;
                margin: 0;
                padding: 0;
                border: none;
                background: transparent;
                will-change: transform;
            }

            #banner-espacador {
                display: block;
                height: calc(var(--banner-altura, 320px) + var(--perfil-tamanho) / 2);
            }

            #site-nav, main, footer {
                position: relative;
                z-index: 1;
            }

            .banner-imagem {
                width: 100%;
                height: var(--banner-altura);
                overflow: hidden;
                margin: 0;
                padding: 0;
                display: block;
                line-height: 0;
            }
            .banner-imagem img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center center;
                display: block;
            }

            .banner-perfil {
                display: flex;
                justify-content: center;
                margin-top: calc(var(--perfil-tamanho) / -2);
                margin-bottom: 0;
                padding: 0;
                position: relative;
                z-index: 10;
                line-height: 0;
            }
            .banner-perfil img {
                width:  var(--perfil-tamanho);
                height: var(--perfil-tamanho);
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #fff;
                display: block;
            }

            .banner-texto {
                text-align: center;
                padding: calc(var(--perfil-tamanho) / 2 + 2px) 0 12px;
                margin: 0;
            }
            .banner-nome {
                margin: 0;
                font-size: 1.75rem;
                font-weight: bold;
                letter-spacing: 0.08em;
            }
            .banner-slogan {
                margin: 4px 0 0;
                font-size: 0.85rem;
                font-style: italic;
                opacity: 0.7;
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // =================================================================================
    // SEÇÃO 3: CONSTRUÇÃO DO DOM DO BANNER
    // =================================================================================
    // Monta a mesma estrutura HTML que antes estava fixa no index.html:
    //   #site-header (imagem + foto de perfil) → #banner-espacador → .banner-texto
    function construirBanner() {
        const header = document.createElement('header');
        header.id = 'site-header';

        const bannerImagem = document.createElement('div');
        bannerImagem.className = 'banner-imagem';
        const imgBanner = document.createElement('img');
        imgBanner.src = CONFIG.imagens.banner;
        imgBanner.alt = 'Banner 7Guerreiros';
        imgBanner.width = 1500;
        imgBanner.height = 320;
        bannerImagem.appendChild(imgBanner);

        const bannerPerfil = document.createElement('div');
        bannerPerfil.className = 'banner-perfil';
        const imgPerfil = document.createElement('img');
        imgPerfil.src = CONFIG.imagens.perfil;
        imgPerfil.alt = 'Foto de perfil';
        imgPerfil.width = 110;
        imgPerfil.height = 110;
        bannerPerfil.appendChild(imgPerfil);

        header.appendChild(bannerImagem);
        header.appendChild(bannerPerfil);

        const espacador = document.createElement('div');
        espacador.id = 'banner-espacador';
        espacador.setAttribute('aria-hidden', 'true');

        const bannerTexto = document.createElement('div');
        bannerTexto.className = 'banner-texto';
        bannerTexto.innerHTML =
            '<h1 class="banner-nome">' + CONFIG.textos.nome + '</h1>' +
            '<p class="banner-slogan">' + CONFIG.textos.slogan + '</p>';

        // Insere no início do <body>, na mesma ordem de sempre: header, espaçador, texto.
        // Isto garante que #site-nav, main e footer continuam a segui-los no fluxo do documento.
        const primeiro = document.body.firstChild;
        document.body.insertBefore(bannerTexto, primeiro);
        document.body.insertBefore(espacador, bannerTexto);
        document.body.insertBefore(header, espacador);
    }

    // =================================================================================
    // SEÇÃO 4: SCROLL — PARALLAX SUAVE PROPORCIONAL À ROLAGEM
    // =================================================================================
    // FUNCIONAMENTO:
    //   O #site-header é position:absolute e desliza para cima a uma fracção
    //   da velocidade do scroll (CONFIG.parallax.factor), criando um efeito
    //   parallax suave. O conteúdo (nav, main, footer) tem z-index:1 e nunca
    //   é sobreposto pelo banner.
    //
    // MANUTENÇÃO:
    //   • Factor de parallax : CONFIG.parallax.factor (0 = fixo, 1 = scroll normal)
    //   • Desactivar         : comentar a chamada a activarParallax() abaixo
    function activarParallax() {
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const header = document.getElementById('site-header');
                    if (header) {
                        header.style.transform = 'translateY(' + (-window.scrollY * CONFIG.parallax.factor) + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // =================================================================================
    // SEÇÃO 5: INICIALIZAÇÃO
    // =================================================================================
    function initialize() {
        injectBannerStyles();
        construirBanner();
        activarParallax();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
