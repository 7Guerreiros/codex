/**
 * menu_lumina.js — espelho do Menus(10).js, à direita.
 * Ficheiro único, carregado pelo cheat; não incluir no index.
 * Mesmos estilos dos botões e dos modais originais. Sem molduras adicionais.
 * MANUTENÇÃO: editar apenas os destinos/ícones em ENTRADAS.
 * O último botão encerra o menu e os seus modais. Não grava dados.
 */
(function () {
    'use strict';
    var script = document.currentScript;
    var base = script ? script.src : document.baseURI;
    function retirarScript() {
        if (script && script.parentNode) script.parentNode.removeChild(script);
        script = null;
    }
    if (window.MenuLumina) { window.MenuLumina.destacar(); retirarScript(); return; }
    if (!document.body) { retirarScript(); throw new Error('A página ainda não está pronta.'); }

    // 1. Mesmos sete ícones. Os destinos não modificam o HTML dos iframes.
    var ENTRADAS = [
        {icone:'⚙',titulo:'Notas Opus Machina: Lumina',src:''},
        {icone:'◉',titulo:'Galeria de Imagens',src:''},
        {icone:'◎',titulo:'Cérebro',src:'IFRAME_LUMINA_BRAIN.html'},
        {icone:'⌘',titulo:'Olho',src:'IFRAME_LUMINA_CORE.html'},
        {icone:'⛭',titulo:'Coração',src:'IFRAME_LUMINA_COPAS.html'},
        {icone:'⌬',titulo:'Vulva',src:''},
        {icone:'❌',titulo:'Encerrar Lumina',fechar:true}
    ];
    var vivo=true, eventos=[], modais=[], botoes=[], observer=null;
    var anterior=document.activeElement, api;
    var raiz=document.createElement('aside'), esteira=document.createElement('div');
    var pista=document.createElement('div'), style=document.createElement('style');
    raiz.id='ml-menu'; raiz.setAttribute('aria-label','Menu temporário de Lumina');
    esteira.id='ml-esteira'; pista.id='ml-pista'; style.id='ml-estilos';
    style.textContent='            .ml-btn {\n                position: absolute; width: 56px; height: 56px;\n                border-radius: 18px;\n                background: linear-gradient(145deg, #f5f5f5, #e0e0e0);\n                color: #333333;\n                border: 1px solid rgba(0,0,0,0.08);\n                font-size: 22px; cursor: pointer;\n                display: flex; align-items: center; justify-content: center;\n                box-shadow: 0 8px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);\n                transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);\n                will-change: transform, box-shadow;\n                user-select: none;\n                backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);\n                pointer-events: auto;\n                z-index: 12000;\n            }\n\n            .ml-btn:hover {\n                transform: scale(1.08);\n                box-shadow: 0 12px 28px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);\n            }\n            .ml-btn:active {\n                transform: scale(0.95) translateY(1px);\n                box-shadow: 0 4px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8);\n            }\n\n            /* Modal Overlay */\n            .ml-modal-overlay {\n                position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n                z-index: 12002;\n                display: flex; justify-content: center; align-items: center;\n                background-color: var(--modal-bg, rgba(0, 0, 0, 0.8)); /* <- USANDO VAR DO SISTEMA_TEMA */\n                opacity: 0; visibility: hidden;\n                transition: opacity 0.2s ease, visibility 0.2s ease;\n            }\n            .ml-modal-iframe {\n                width: 95%; height: 95%;\n                max-width: 1400px; max-height: 900px;\n                border: none; border-radius: 10px;\n                box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);\n                transform: scale(0.9); transition: transform 0.2s ease;\n            }\n            .ml-modal-active { opacity: 1; visibility: visible; }\n            .ml-modal-active .ml-modal-iframe { transform: scale(1); }\n\n        \n#ml-menu{position:fixed;top:0;right:0;width:120px;z-index:12000;pointer-events:none}\n#ml-esteira{box-sizing:border-box;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;pointer-events:auto;touch-action:pan-y pinch-zoom;overscroll-behavior-y:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch}\n#ml-esteira::-webkit-scrollbar{display:none}\n#ml-pista{box-sizing:border-box;position:relative;width:100%;padding:0;margin:0;border:0}\n#ml-menu .ml-btn{right:20px;left:auto;animation:ml-pulsar 1.8s ease-in-out infinite}\n#ml-menu .ml-btn:hover,#ml-menu .ml-btn:active{animation:none}\n#ml-menu .ml-btn:focus{outline:none}\n#ml-menu .ml-btn:focus-visible{outline:2px solid currentColor;outline-offset:-4px}\n@keyframes ml-pulsar{0%,100%{transform:scale(1)}50%{transform:scale(1.075)}}\n@media(prefers-reduced-motion:reduce){#ml-menu .ml-btn{animation:none}.ml-btn,.ml-modal-overlay,.ml-modal-iframe{transition:none}}\n';

    // 2. Eventos exclusivos: não chegam aos fechamentos do menu normal.
    function escutar(alvo,tipo,fn,opts,lista) {
        alvo.addEventListener(tipo,fn,opts||false);
        (lista||eventos).push(function(){alvo.removeEventListener(tipo,fn,opts||false);});
    }
    function limpar(lista){while(lista.length)lista.pop()();}
    function focar(no){if(no&&no.isConnected&&no.focus){try{no.focus({preventScroll:true});}catch(e){no.focus();}}}
    function altura(){var vv=window.visualViewport;return vv&&vv.height>0?Math.min(window.innerHeight,vv.height):window.innerHeight;}
    function ajustar(){
        if(!vivo)return;
        // Pista SEM min-height, padding ou margem: não cresce 52px além do menu.
        // Mede os mesmos 56px e posições 20 + 70*i do original.
        var fim=0;
        botoes.forEach(function(b,i){fim=Math.max(fim,20+70*i+(b.offsetHeight||56));});
        var conteudo=Math.ceil(fim+32), h=Math.max(1,altura());
        pista.style.height=conteudo+'px';
        raiz.style.height=Math.min(h,conteudo)+'px';
        var vv=window.visualViewport;
        raiz.style.top=(vv?Math.max(0,vv.offsetTop||0):0)+'px';
        raiz.style.right=vv?Math.max(0,window.innerWidth-((vv.offsetLeft||0)+vv.width))+'px':'0px';
    }
    escutar(raiz,'click',function(e){e.stopPropagation();});
    escutar(esteira,'wheel',function(e){
        if(e.ctrlKey||e.defaultPrevented||!e.cancelable||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
        var fim=Math.max(0,esteira.scrollHeight-esteira.clientHeight);
        if(fim<=1)return;
        var unidade=e.deltaMode===1?16:e.deltaMode===2?esteira.clientHeight:1;
        var proximo=Math.max(0,Math.min(fim,esteira.scrollTop+e.deltaY*unidade));
        if(proximo!==esteira.scrollTop){e.preventDefault();esteira.scrollTop=proximo;}
    },{passive:false});
    escutar(window,'resize',ajustar);
    if(window.visualViewport){escutar(window.visualViewport,'resize',ajustar);escutar(window.visualViewport,'scroll',ajustar);}

    // 3. Mesmo modal do original: só overlay e iframe, sem cabeçalho ou X extra.
    function tema(m){
        if(m&&m.frame.contentWindow&&window.location.origin!=='null')m.frame.contentWindow.postMessage({
            type:'SET_THEME',theme:document.documentElement.classList.contains('tema-escuro')?'escuro':'claro'
        },window.location.origin);
    }
    function remover(m,repor){
        limpar(m.eventos);
        if(m.timer)clearTimeout(m.timer);
        if(m.raf)cancelAnimationFrame(m.raf);
        m.frame.src='about:blank';
        if(m.overlay.parentNode)m.overlay.parentNode.removeChild(m.overlay);
        var i=modais.indexOf(m);if(i!==-1)modais.splice(i,1);
        m.botao.setAttribute('aria-expanded','false');
        if(repor)focar(m.botao);
    }
    function fecharModal(m){
        if(!m||m.fechando)return;
        m.fechando=true;m.overlay.dataset.fechando='true';m.overlay.classList.remove('ml-modal-active');
        m.timer=setTimeout(function(){m.timer=null;remover(m,vivo);},200);
    }
    function abrir(entrada,botao){
        if(!vivo||!entrada.src)return;
        if(modais.some(function(m){return m.entrada===entrada;}))return;
        var url=new URL(entrada.src,base);
        if(!/^(https?:|file:)$/.test(url.protocol)||url.origin!==window.location.origin)throw new Error('Destino fora do site.');
        var overlay=document.createElement('div'),frame=document.createElement('iframe');
        overlay.className='ml-modal-overlay';overlay.setAttribute('role','dialog');
        overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',entrada.titulo);
        frame.className='ml-modal-iframe';frame.title=entrada.titulo;
        var m={overlay:overlay,frame:frame,botao:botao,entrada:entrada,eventos:[],timer:null,raf:null,fechando:false};
        escutar(frame,'load',function(){tema(m);},false,m.eventos);
        escutar(overlay,'click',function(e){e.stopPropagation();if(e.target===overlay)fecharModal(m);},false,m.eventos);
        overlay.appendChild(frame);document.body.appendChild(overlay);modais.push(m);botao.setAttribute('aria-expanded','true');
        m.raf=requestAnimationFrame(function(){m.raf=null;if(!vivo||m.fechando||!overlay.isConnected)return;
            frame.src=url.href;overlay.classList.add('ml-modal-active');frame.focus();
        });
    }
    escutar(window,'message',function(e){
        var origem=e.origin===window.location.origin||(window.location.protocol==='file:'&&e.origin==='null');
        if(!origem||!e.data||e.data.type!=='FECHAR_MODAL')return;
        modais.slice().forEach(function(m){if(m.frame.contentWindow===e.source)fecharModal(m);});
    });
    if(window.MutationObserver){observer=new MutationObserver(function(){modais.forEach(tema);});
        observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});}

    // 4. Encerrar elimina apenas o módulo extra. Sem activador permanente.
    function encerrar(){
        if(!vivo)return;vivo=false;
        modais.slice().forEach(function(m){remover(m,false);});
        limpar(eventos);if(observer)observer.disconnect();observer=null;
        if(raiz.parentNode)raiz.parentNode.removeChild(raiz);
        if(style.parentNode)style.parentNode.removeChild(style);
        if(window.MenuLumina===api)delete window.MenuLumina;
        botoes.length=0;focar(anterior);anterior=null;
    }
    escutar(window,'pagehide',encerrar);
    escutar(document,'visibilitychange',function(){botoes.forEach(function(b){b.style.animationPlayState=document.hidden?'paused':'';});});
    try{
        ENTRADAS.forEach(function(entrada,i){
            var b=document.createElement('button');b.type='button';b.id='ml-botao-'+(i+1);b.className='ml-btn';
            b.textContent=entrada.icone;b.title=entrada.titulo;b.setAttribute('aria-label',entrada.titulo);
            b.style.top=(20+i*70)+'px';
            if(entrada.src){b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');}
            else if(!entrada.fechar)b.setAttribute('aria-disabled','true');
            escutar(b,'click',function(e){e.stopPropagation();if(entrada.fechar)encerrar();else abrir(entrada,b);});
            botoes.push(b);pista.appendChild(b);
        });
        esteira.appendChild(pista);raiz.appendChild(esteira);document.head.appendChild(style);document.body.appendChild(raiz);
        ajustar();api={fechar:encerrar,destacar:function(){esteira.scrollTop=0;focar(botoes[0]);}};
        window.MenuLumina=api;
    }catch(erro){encerrar();throw erro;}finally{retirarScript();}
}());
