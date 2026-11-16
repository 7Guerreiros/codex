(function () {
    'use strict';

    // =====================================================================
    // 1. TEXTOS E VARIANTE — carregar apenas uma versão como Rodape.js.
    // MANUTENÇÃO: composição fixa, sem placas nem tractor.
    // =====================================================================
    const CONFIG = {
        linha1: '&copy; scriptor_christianus@outlook.com',
        linha2: 'OPUS MACHINA [SMALLWEB Build \u03B2 - 1.2]',
        larguraMaxima: 800, altura: 120
    };

    // =====================================================================
    // 2. PEÇAS REUTILIZADAS — sem imagens, filtros, fontes ou serviços externos.
    // Passo comum: raio = dentes × 1.2. A duração acompanha os dentes.
    // =====================================================================
    function furo(x, y, r) {
        return ' M' + (x-r) + ',' + y + ' a' + r + ',' + r +
            ' 0 1 0 ' + (2*r) + ',0 a' + r + ',' + r + ' 0 1 0 ' + (-2*r) + ',0Z';
    }
    function rodaModelo(dentes, metal) {
        const r = dentes * 1.2;
        let d = '';
        for (let i = 0; i < dentes; i++) {
            [0, .21, .57, .79].forEach(function (f, j) {
                const a = (i+f)*Math.PI*2/dentes;
                const rr = j === 1 || j === 2 ? r+1.8 : r-2.1;
                d += (i === 0 && j === 0 ? 'M' : 'L') +
                    (Math.cos(a)*rr).toFixed(2) + ',' + (Math.sin(a)*rr).toFixed(2);
            });
        }
        d += 'Z' + furo(0, 0, r*.11);
        for (let i = 0; i < 6; i++) {
            const a = i*Math.PI/3;
            d += furo(Math.cos(a)*r*.48, Math.sin(a)*r*.48, r*.15);
        }
        return '<g id="rp12-roda-'+metal+'-'+dentes+'">' +
            '<path d="'+d+'" transform="translate(0 2)" fill="#3c2c1b" fill-rule="evenodd"/>' +
            '<path d="'+d+'" fill="url(#rp12-'+metal+')" fill-rule="evenodd" stroke="#665037" stroke-width=".7"/>' +
            '<circle r="'+r*.81+'" fill="none" stroke="#dfca94" stroke-opacity=".4" stroke-width=".8"/>' +
            '<circle r="'+r*.73+'" fill="none" stroke="#705334" stroke-opacity=".65" stroke-width=".5"/>' +
            '<circle r="'+r*.23+'" fill="url(#rp12-aco)" stroke="#705334" stroke-width=".8"/>' +
            '<circle r="'+r*.12+'" fill="#3c3020"/></g>';
    }
    function parafuso(x, y, r) {
        return '<g transform="translate('+x+' '+y+')">' +
            '<circle cy="1" r="'+(r+1)+'" fill="#171b18" opacity=".6"/>' +
            '<circle r="'+r+'" fill="url(#rp12-aco)" stroke="#52554d" stroke-width=".6"/>' +
            '<path d="M'+(-r*.53)+','+(r*.28)+'L'+(r*.53)+','+(-r*.28)+'" stroke="#353c37" stroke-width="1.2"/></g>';
    }
    function roda(x, y, dentes, sentido, fase, metal) {
        return '<g transform="translate('+x+' '+y+')">' +
            '<g class="rodape-rotor" style="animation-duration:'+(dentes*1.7)+'s;animation-direction:'+sentido+'">' +
            '<g transform="rotate('+fase+')"><use xlink:href="#rp12-roda-'+metal+'-'+dentes+'"/></g></g>' +
            parafuso(0, 0, Math.max(2, dentes*.15)) + '</g>';
    }
    function definicoes() {
        let defs = '<defs>' +
            '<linearGradient id="rp12-bronze" x1="0" y1="0" x2="1" y2="1">' +
            '<stop stop-color="#b69e73"/><stop offset=".35" stop-color="#6c563b"/>' +
            '<stop offset=".65" stop-color="#9f8055"/><stop offset="1" stop-color="#463e31"/></linearGradient>' +
            '<linearGradient id="rp12-aco" x1="0" y1="0" x2="1" y2="1">' +
            '<stop stop-color="#e1e2d9"/><stop offset=".3" stop-color="#929a92"/>' +
            '<stop offset=".55" stop-color="#d0d4ca"/><stop offset="1" stop-color="#626e66"/></linearGradient>';
        defs += '<linearGradient id="rp12-ouro" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d2bb80"/><stop offset=".35" stop-color="#967447"/><stop offset=".65" stop-color="#bda163"/><stop offset="1" stop-color="#665037"/></linearGradient>' +
            '<linearGradient id="rp12-prata" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1f4f5"/><stop offset=".35" stop-color="#8f9ba3"/><stop offset=".65" stop-color="#d7dfe3"/><stop offset="1" stop-color="#57636d"/></linearGradient>';
        // Só define os pares tamanho/metal usados por esta composição fixa.
        const usados = {};
        COMPOSICAO.forEach(function (roda) {
            const chave = roda.metal+'-'+roda.n;
            if (!usados[chave]) { defs += rodaModelo(roda.n, roda.metal); usados[chave] = true; }
        });
        return defs + '</defs>';
    }

    // =====================================================================
    // 3. COMPOSIÇÃO FIXA — 15 rodas inferiores e apenas duas superiores, colocadas uma a uma, sem repetição modular.
    // MANUTENÇÃO: x/y são posições; n são dentes; metal = ouro/prata/bronze.
    // vib marca o grupo direito que conserva o tremor de motor.
    // O recorte inferior é intencional; margem lateral inclui dentes,
    // contorno e vibração: nenhuma roda toca as bordas esquerda/direita.
    // =====================================================================
    const COMPOSICAO = [{"x":50,"y":174,"n":32,"metal":"ouro","fase":0,"sentido":"normal","vib":false},{"x":112.4,"y":174.0,"n":20,"metal":"prata","fase":156.96,"sentido":"reverse","vib":false},{"x":153.2,"y":174.0,"n":14,"metal":"bronze","fase":-77.14286,"sentido":"normal","vib":false},{"x":213.2,"y":174.0,"n":36,"metal":"ouro","fase":197.2,"sentido":"reverse","vib":false},{"x":278.0,"y":174.0,"n":18,"metal":"prata","fase":-240.0,"sentido":"normal","vib":false},{"x":330.8,"y":174.0,"n":26,"metal":"bronze","fase":328.43077,"sentido":"reverse","vib":false},{"x":376.4,"y":174.0,"n":12,"metal":"prata","fase":-570.0,"sentido":"normal","vib":false},{"x":426.8,"y":174.0,"n":30,"metal":"ouro","fase":392.64,"sentido":"reverse","vib":false},{"x":489.2,"y":174.0,"n":22,"metal":"prata","fase":-376.36364,"sentido":"normal","vib":false},{"x":534.8,"y":174.0,"n":16,"metal":"bronze","fase":668.7,"sentido":"reverse","vib":false},{"x":602.0,"y":174.0,"n":40,"metal":"ouro","fase":-99.0,"sentido":"normal","vib":true},{"x":666.8,"y":174.0,"n":14,"metal":"prata","fase":429.94286,"sentido":"reverse","vib":true},{"x":712.4,"y":174.0,"n":24,"metal":"bronze","fase":-90.0,"sentido":"normal","vib":true},{"x":762.8,"y":174.0,"n":18,"metal":"prata","fase":274.4,"sentido":"reverse","vib":true},{"x":818.0,"y":174.0,"n":28,"metal":"ouro","fase":-12.85714,"sentido":"normal","vib":true},{"x":213.2,"y":111.60000000000001,"n":16,"metal":"prata","fase":-585.0,"sentido":"normal","vib":false},{"x":602.0,"y":102.0,"n":20,"metal":"ouro","fase":84.96,"sentido":"reverse","vib":true}];
    function desenho() {
        let normais='', vibrantes='';
        COMPOSICAO.forEach(function (p) {
            const forma=roda(p.x,p.y,p.n,p.sentido,p.fase,p.metal);
            if (p.vib) vibrantes+=forma; else normais+=forma;
        });
        return '<svg class="rodape-engrenagens" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 60 864 120" width="864" height="120" aria-hidden="true" focusable="false">' +
            definicoes()+normais+'<g class="rodape-vibracao">'+vibrantes+'</g></svg>';
    }

    // =====================================================================
    // 4. ESTILOS LOCAIS — textos centrados; faixa numa linha própria na base.
    // Mantém fontes, cores do tema, parágrafos e bordas fornecidos pelo site.
    // Não usa filtros, will-change nem ciclos JavaScript para animar peças.
    // =====================================================================
    function estilos() {
        if (document.getElementById('rodape-teste-estilos')) return;
        const style=document.createElement('style');
        style.id='rodape-teste-estilos';
        style.textContent=`
            #site-footer.rodape-teste { position: relative; display: grid; grid-template-columns: minmax(0,1fr); align-items: center; column-gap: 16px; row-gap: 0; }
            #site-footer.rodape-teste .rodape-textos { grid-column: 1; min-width: 0; overflow-wrap: break-word; text-align: center; }
            #site-footer.rodape-teste .rodape-maquinaria { grid-column: 1; width: 100%; max-width: ${CONFIG.larguraMaxima}px; margin: -4px auto -1rem; line-height: 0; overflow: hidden; pointer-events: none; }
            #site-footer.rodape-teste .rodape-engrenagens { display: block; width: 100%; height: auto; opacity: .92; overflow: hidden; }
            #site-footer.rodape-teste .rodape-textos p:last-child { margin-bottom: 0; }
            @media (max-width: 600px) { #site-footer.rodape-teste .rodape-maquinaria { margin-top: 0; } }
            #site-footer.rodape-teste .rodape-rotor { transform-origin: 0 0; animation: rodape12-girar 40s linear infinite; }
            #site-footer.rodape-teste .rodape-vibracao { animation: rodape12-vibrar .22s linear infinite; }
            #site-footer.rodape-teste.rodape-pausado .rodape-rotor,
            #site-footer.rodape-teste.rodape-pausado .rodape-vibracao { animation-play-state: paused; }
            @keyframes rodape12-girar { to { transform: rotate(360deg); } }
            @keyframes rodape12-vibrar { 0%,100% { transform: translate(0,0); } 25% { transform: translate(.4px,-.4px); } 50% { transform: translate(-.35px,.25px); } 75% { transform: translate(.3px,.15px); } }
            @media (prefers-reduced-motion: reduce) {
                #site-footer.rodape-teste .rodape-rotor,
                #site-footer.rodape-teste .rodape-vibracao { animation: none; }
            }
        `;
        document.head.appendChild(style);
    }

    // =====================================================================
    // 5. INICIALIZAÇÃO — mantém protecção contra rodapé duplicado.
    // Ajusta só a largura CSS, sem redesenhar nem reiniciar as rodas. Pausa fora de vista/aba oculta.
    // LIGAÇÃO: <script src="Rodape.js" defer></script> (apenas uma versão).
    // =====================================================================
    function initialize() {
        if (document.getElementById('site-footer')) return;
        estilos();
        const footer=document.createElement('footer');
        footer.id='site-footer';footer.className='rodape-teste';
        footer.innerHTML='<div class="rodape-textos"><p>'+CONFIG.linha1+'</p><p>'+CONFIG.linha2+'</p></div>' +
            '<div class="rodape-maquinaria">'+desenho()+'</div>';
        document.body.appendChild(footer);
        const faixa=footer.querySelector('.rodape-maquinaria');
        let ultimaLargura=null, pendente=0, visivel=true;
        const area=document.querySelector('.area-conteudo');
        function redimensionar() {
            pendente=0;
            let largura=CONFIG.larguraMaxima;
            if (area) {
                const estilo=window.getComputedStyle(area);
                largura=area.getBoundingClientRect().width-
                    (parseFloat(estilo.paddingLeft)||0)-(parseFloat(estilo.paddingRight)||0)-
                    (parseFloat(estilo.borderLeftWidth)||0)-(parseFloat(estilo.borderRightWidth)||0);
            }
            largura=Math.max(0,largura);
            if (largura===ultimaLargura) return;
            ultimaLargura=largura;faixa.style.maxWidth=largura+'px';
        }
        function agendar() { if (!pendente) pendente=requestAnimationFrame(redimensionar); }
        function pausa() { footer.classList.toggle('rodape-pausado',document.hidden||!visivel); }
        if (window.ResizeObserver) { const observer=new ResizeObserver(agendar);observer.observe(area || footer); }
        else window.addEventListener('resize',agendar);
        if (window.IntersectionObserver) {
            const observer=new IntersectionObserver(function (entradas) { visivel=entradas[0].isIntersecting;pausa(); });
            observer.observe(footer);
        }
        document.addEventListener('visibilitychange',pausa);
        redimensionar();pausa();
    }
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',initialize);
    else initialize();
})();
