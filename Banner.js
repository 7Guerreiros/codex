(function () {
    'use strict';

    // =================================================================================
    // SEÇÃO 1: CONFIGURAÇÕES E CONSTANTES
    // =================================================================================
    // Alterar aqui para trocar imagens, textos ou medidas do banner, sem tocar
    // no resto do ficheiro.
    const CONFIG = {
        imagens: {
            banner: ['IMAGENS/BANNER1.png', 'IMAGENS/BANNER2.png'],
            bannerRaro: 'IMAGENS/BANNER0.png',
            chanceBannerRaro: 0.01, // 1%; os outros dividem igualmente os 99% restantes.
            perfil: 'IMAGENS/PERFIL.jpg'
        },
        textos: {
            nomes: ['SCRIPTOR CHRISTIANUS', '7 GUERREIROS', 'BLOG 7 GUERREIROS'],
            slogans: [
                'Litteræ Videogamis 空手道 et Fides Christiana',
                'Mais vale o imperfeito realizado que o perfeito idealizado',
				'Litteris et armis, præstantibusque ingeniis'
            ]
        },
        medidas: {
            bannerAltura:    '320px',
            perfilTamanho:   '110px',
            slideVelocidade: '0.35s' // Reservada para uso futuro.
        },
        parallax: {
            // Deslocamento adicional:
            // 0 = scroll normal; 0.5 = aproximadamente 1,5 vezes o scroll.
            factor: 0.5
        }
    };

    // =================================================================================
    // SEÇÃO 2: ESTILOS CSS (INJETADOS)
    // =================================================================================
    // Os estilos do banner permanecem neste ficheiro.
    // A altura fica disponível também para o espaçador, que é irmão do header.
    function injectBannerStyles() {
        const styleId = 'sys-banner-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            :root {
                --perfil-tamanho: ${CONFIG.medidas.perfilTamanho};
                --banner-altura: ${CONFIG.medidas.bannerAltura};
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
                width: var(--perfil-tamanho);
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

            /* MECANISMO DECORATIVO: atrás da imagem, acompanhando o header.
               MANUTENÇÃO: exposição máxima 62px no motor amortecido.
               Trilhos e parafusos usam as mesmas coordenadas em redesenhar(). */
            #site-header .banner-imagem { position: relative; z-index: 1; }
            #site-header .banner-motor {
                position: absolute; left: 0; right: 0;
                top: calc(var(--banner-altura) - 160px);
                width: 100%; height: 160px; z-index: 0;
                pointer-events: none; opacity: 0; transform: translateY(0);
            }
            #site-header .banner-motor svg { display: block; width: 100%; height: 100%; }
            #site-header .banner-motor-rotor { transform-origin: 0 0; }
            #site-header .banner-fixadores { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
            #site-header .banner-fixadores svg { display: block; width: 100%; height: 100%; }
            @media (prefers-reduced-motion: reduce) {
                #site-header .banner-motor { display: none; }
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
    // Estrutura:
    // #site-header (imagem + foto de perfil) → #banner-espacador → .banner-texto
    function construirBanner() {
        // Evita duplicar a estrutura se o ficheiro voltar a ser executado.
        if (document.getElementById('site-header')) return;

        const header = document.createElement('header');
        header.id = 'site-header';

        const bannerImagem = document.createElement('div');
        bannerImagem.className = 'banner-imagem';

        const imgBanner = document.createElement('img');
        const bannerSorteado = Math.random() < CONFIG.imagens.chanceBannerRaro
            ? CONFIG.imagens.bannerRaro
            : CONFIG.imagens.banner[Math.floor(Math.random() * CONFIG.imagens.banner.length)];
        // Reserva o lugar e revela somente a imagem sorteada, pronta para pintar.
        imgBanner.style.visibility = 'hidden';
        imgBanner.onload = function () {
            imgBanner.onload = null;
            const revelar = function () {
                if (imgBanner.complete && imgBanner.naturalWidth > 0) imgBanner.style.visibility = '';
            };
            if (typeof imgBanner.decode === 'function') imgBanner.decode().then(revelar, revelar);
            else revelar();
        };
        imgBanner.src = bannerSorteado;
        imgBanner.alt = 'Banner 7Guerreiros';
        imgBanner.width = 1500;
        imgBanner.height = 320;
        bannerImagem.appendChild(imgBanner);

        const bannerPerfil = document.createElement('div');
        bannerPerfil.className = 'banner-perfil';

        const imgPerfil = document.createElement('img');
        imgPerfil.src = CONFIG.imagens.perfil;
        imgPerfil.alt = 'Foto de perfil';
        imgPerfil.title = 'Scriptor Christianus';
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
        // O menu usa .banner-nome para posicionar o Codex no título.
        const nome = CONFIG.textos.nomes[Math.floor(Math.random() * CONFIG.textos.nomes.length)];
        const slogan = CONFIG.textos.slogans[Math.floor(Math.random() * CONFIG.textos.slogans.length)];
        bannerTexto.innerHTML =
            '<h1 class="banner-nome">' + nome + '</h1>' +
            '<p class="banner-slogan">' + slogan + '</p>';

        // Insere no início do body, mantendo a ordem original.
        // A navegação, o conteúdo principal e o rodapé continuam a seguir.
        const primeiro = document.body.firstChild;
        document.body.insertBefore(bannerTexto, primeiro);
        document.body.insertBefore(espacador, bannerTexto);
        document.body.insertBefore(header, espacador);
    }

    // =================================================================================
    // SEÇÃO 4: SCROLL — MOVIMENTO PROPORCIONAL À ROLAGEM
    // =================================================================================
    // FUNCIONAMENTO:
    // O header é position:absolute e já acompanha a rolagem normal.
    // A transformação acrescenta movimento para cima: factor 0.5 produz
    // aproximadamente 1,5 vezes a rolagem. Preserva-se o efeito original.
    // A preferência por movimento reduzido desactiva o efeito adicional.
    //
    // MANUTENÇÃO:
    // • Factor: CONFIG.parallax.factor.
    // • Desactivar: comentar a chamada a activarParallax() na inicialização.
    function activarParallax() {
        // A guarda no elemento sobrevive a uma segunda execução deste script.
        const header = document.getElementById('site-header');
        if (!header || header.dataset.parallaxIniciado === 'true') return;

        header.dataset.parallaxIniciado = 'true';

        const movimentoReduzido = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

        let ticking = false;

        function actualizar() {
            header.style.transform = movimentoReduzido.matches
                ? ''
                : 'translateY(' +
                  (-window.scrollY * CONFIG.parallax.factor) +
                  'px)';

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!movimentoReduzido.matches && !ticking) {
                ticking = true;
                window.requestAnimationFrame(actualizar);
            }
        }, { passive: true });

        // Acompanha alterações da preferência durante a visita.
        if (movimentoReduzido.addEventListener) {
            movimentoReduzido.addEventListener('change', actualizar);
        } else if (movimentoReduzido.addListener) {
            movimentoReduzido.addListener(actualizar);
        }

        actualizar();
    }

    // =================================================================================
    // SEÇÃO 4.1: TRANSMISSÃO, TRILHOS E PARAFUSOS — CAMADAS DECORATIVAS
    // =================================================================================
    // MANUTENÇÃO: todos os identificadores SVG começam por bn4-.
    // A rotação é calculada pelo deslocamento: não há animação autónoma.
    // Os parafusos ficam à frente da imagem; o mecanismo fica por trás.
    function furoMotor(x,y,r) {
        return ' M'+(x-r)+' '+y+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z';
    }
    function rodaMotor(x,y,dentes,metal,sentido,fase) {
        const raio=dentes*1.5;
        let d='';
        for(let i=0;i<dentes;i++) [0,.21,.57,.79].forEach(function(f,j){
            const a=(i+f)*Math.PI*2/dentes, r=j===1||j===2?raio+1.8:raio-2.1;
            d+=(i===0&&j===0?'M':'L')+(Math.cos(a)*r).toFixed(2)+' '+(Math.sin(a)*r).toFixed(2);
        });
        d+='Z'+furoMotor(0,0,raio*.12);
        for(let i=0;i<6;i++){
            const a=i*Math.PI/3;d+=furoMotor(Math.cos(a)*raio*.48,Math.sin(a)*raio*.48,raio*.15);
        }
        return '<g transform="translate('+x+' '+y+')"><g class="banner-motor-rotor" data-dentes="'+dentes+'" data-sentido="'+sentido+'"><g transform="rotate('+fase+')">'+
            '<path d="'+d+'" transform="translate(0 2)" fill="#282a24" fill-rule="evenodd"/>'+
            '<path d="'+d+'" fill="url(#bn4-'+metal+')" fill-rule="evenodd" stroke="#535a50" stroke-width=".8"/>'+
            '<circle r="'+raio*.79+'" fill="none" stroke="#e5dec5" stroke-opacity=".5"/>'+
            '<circle r="'+raio*.24+'" fill="url(#bn4-aco)" stroke="#505c53"/></g></g>'+
            '<circle r="3" fill="url(#bn4-aco)" stroke="#4a544d"/><path d="M-1.7 1L1.7-1" stroke="#39463f"/></g>';
    }
    function trilhoMotor(x) {
        let svg='<g transform="translate('+x+' 0)"><path d="M-13 0H13V160H-13Z" fill="url(#bn4-aco)" stroke="#455149"/>'+
            '<path d="M-5 0H5V160H-5Z" fill="#2d3833"/><path d="M-9 0V160M9 0V160" stroke="#e0e5dd" stroke-opacity=".55"/>';
        for(let y=8;y<160;y+=18)svg+='<path d="M-3 '+y+'H3v6H-3Z" fill="#99a598" stroke="#414e45" stroke-width=".6"/>';
        return svg+'</g>';
    }
    function desenharMotor(largura) {
        const recuo=Math.min(24,Math.max(14,largura*.02));
        const escala=Math.min(1,Math.max(.32,(largura-70)/620));
        const conjuntos=[{x:recuo+64*escala,espelho:1},{x:largura-recuo-64*escala,espelho:-1}];
        let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+largura+' 160" aria-hidden="true" focusable="false"><defs>'+
            '<linearGradient id="bn4-bronze" x2="1" y2="1"><stop stop-color="#d2bb80"/><stop offset=".35" stop-color="#967447"/><stop offset=".65" stop-color="#bda163"/><stop offset="1" stop-color="#665037"/></linearGradient>'+
            '<linearGradient id="bn4-aco" x2="1" y2="1"><stop stop-color="#edf0e8"/><stop offset=".3" stop-color="#8b998f"/><stop offset=".6" stop-color="#d0d9d0"/><stop offset="1" stop-color="#536257"/></linearGradient></defs>'+
            trilhoMotor(recuo)+trilhoMotor(largura-recuo);
        conjuntos.forEach(function(c){
            svg+='<g transform="translate('+c.x+' '+(160-158*escala)+') scale('+(c.espelho*escala)+' '+escala+')">'+
                rodaMotor(0,110,24,'bronze',1,0)+
                rodaMotor(57,110,14,'aco',-1,147.09)+
                rodaMotor(57,65,16,'bronze',1,0)+
                rodaMotor(-51,110,10,'aco',-1,133.92)+
                rodaMotor(0,50,16,'aco',-1,161.16)+
                rodaMotor(-34,143,8,'bronze',-1,0)+'</g>';
        });
        return svg+'</svg>';
    }
    function desenharFixadores(largura,altura) {
        const recuo=Math.min(24,Math.max(14,largura*.02));
        let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+largura+' '+altura+'" aria-hidden="true" focusable="false"><defs>'+
            '<linearGradient id="bn4-fixador" x2="1" y2="1"><stop stop-color="#f1f4ed"/><stop offset=".4" stop-color="#7b8980"/><stop offset=".7" stop-color="#bbc6bd"/><stop offset="1" stop-color="#48584d"/></linearGradient></defs>';
        [recuo,largura-recuo].forEach(function(x){
            [.14,.5,.86].forEach(function(pos){
                svg+='<g transform="translate('+x+' '+(altura*pos)+')"><circle cy="1.5" r="7" fill="#18221c" opacity=".6"/>'+
                    '<circle r="5.8" fill="url(#bn4-fixador)" stroke="#3e4e44" stroke-width=".8"/>'+
                    '<path d="M-2-1.2L0-2.4L2-1.2V1.2L0 2.4L-2 1.2Z" fill="#46574c" stroke="#27372d" stroke-width=".5"/></g>';
            });
        });
        return svg+'</svg>';
    }

    // O scroll fornece um pequeno impulso relativo; uma mola amortecida
    // recolhe o motor suavemente, mesmo quando o visitante pára de rolar.
    // O banner continua a usar exactamente o seu parallax original.
    // Após uma inversão, a mola termina o ciclo antes de aceitar novo impulso.
    function activarMotor() {
        const header = document.getElementById('site-header');
        if (!header || header.querySelector('.banner-motor')) return;
        const motor = document.createElement('div');
        motor.className = 'banner-motor';
        motor.setAttribute('aria-hidden', 'true');

        header.insertBefore(motor, header.firstChild);
        const imagem=header.querySelector('.banner-imagem');
        const fixadores=document.createElement('div');
        fixadores.className='banner-fixadores';fixadores.setAttribute('aria-hidden','true');
        imagem.appendChild(fixadores);
        let rotores=[];
        function redesenhar(){
            const largura=Math.max(180,header.getBoundingClientRect().width);
            motor.innerHTML=desenharMotor(largura);
            fixadores.innerHTML=desenharFixadores(largura,imagem.getBoundingClientRect().height||320);
            rotores=motor.querySelectorAll('.banner-motor-rotor');
        }
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
        let anterior = Math.max(0, window.scrollY);
        let atraso = 0, velocidade = 0, quadro = null, instante = null;
        let emRecolhimento = false;
        let posicaoMotor = anterior;

        function visivel() {
            return !document.hidden && !reduzido.matches && window.scrollY > 0 &&
                window.scrollY * (1 + CONFIG.parallax.factor) < header.offsetHeight + 62;
        }
        function pintar() {
            motor.style.transform = 'translateY(' + atraso.toFixed(2) + 'px)';
            motor.style.opacity = Math.min(1, atraso / 12);
            // Na inversão, conserva a última posição de subida como
            // referência para a rotação até a mola assentar.
            const deslocamento = posicaoMotor * (1 + CONFIG.parallax.factor) - atraso;
            for(let i=0;i<rotores.length;i++){
                const roda=rotores[i];
                const angulo=deslocamento*.9*24/Number(roda.getAttribute('data-dentes'))*Number(roda.getAttribute('data-sentido'));
                roda.style.transform='rotate('+angulo.toFixed(3)+'deg)';
            }
        }
        function repousar() {
            if (quadro !== null) window.cancelAnimationFrame(quadro);
            quadro = null;
            instante = null;
            atraso = 0;
            velocidade = 0;
            emRecolhimento = false;
            pintar();
        }
        function animar(agora) {
            quadro = null;
            const dt = instante === null ? 1 / 60 : Math.min(0.032, (agora - instante) / 1000);
            instante = agora;
            // Amortecimento sem oscilações: o motor é puxado, sem saltar.
            velocidade += (-20 * atraso - 9 * velocidade) * dt;
            atraso = Math.max(0, Math.min(62, atraso + velocidade * dt));
            pintar();
            if (atraso < 0.15 && Math.abs(velocidade) < 0.5) {
                repousar();
            } else {
                quadro = window.requestAnimationFrame(animar);
            }
        }
        window.addEventListener('scroll', function () {
            const actual = Math.max(0, window.scrollY);
            const delta = actual - anterior;
            anterior = actual;
            // O delta negativo faz o banner descer. Se já houver um ciclo,
            // deixa a mola recolher sem aceitar impulsos de outra subida.
            if (quadro !== null && delta < 0) emRecolhimento = true;
            if (emRecolhimento || delta <= 0 || !visivel()) return;

            // Preserva os impulsos sucessivos de uma mesma subida.
            posicaoMotor = actual;
            atraso = Math.min(62, atraso + Math.min(36, delta * 0.8));
            velocidade *= 0.5;
            if (quadro === null && atraso > 0) {
                instante = null;
                quadro = window.requestAnimationFrame(animar);
            }
        }, { passive: true });
        window.addEventListener('resize', function () {
            anterior = Math.max(0, window.scrollY);
            redesenhar();pintar();
        });
        if (reduzido.addEventListener) reduzido.addEventListener('change', repousar);
        else if (reduzido.addListener) reduzido.addListener(repousar);
        redesenhar();pintar();
    }

    // =================================================================================
    // SEÇÃO 5: INICIALIZAÇÃO
    // =================================================================================
    function initialize() {
        injectBannerStyles();
        construirBanner();
        activarParallax();
        activarMotor();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();