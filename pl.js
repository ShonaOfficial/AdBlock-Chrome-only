/* ============================================
   PL.JS — Chrome-only + AdBlock (gabungan)
   Config dibaca dari: window.PL_CFG (di XML)
   ============================================ */
(function(){
var C=window.PL_CFG||{};
var d=document,ua=navigator.userAgent||"";
if(/bot|crawl|spider|slurp|mediapartners|adsbot|lighthouse|pagespeed|facebookexternalhit|whatsapp|telegrambot|twitterbot/i.test(ua))return;

/* ===== HELPER (dipakai Chrome-only & AdBlock) ===== */
function ready(f){d.readyState==="loading"?d.addEventListener("DOMContentLoaded",f):f();}
function host(lock){
  var h=d.getElementById("plCenter");
  if(!h){h=d.createElement("div");h.id="plCenter";h.className="plCenter";d.body.appendChild(h);}
  if(lock)h.className="plCenter lock";
  return h;
}
function note(o){
  if(d.getElementById(o.id))return;
  var c=d.createElement("div");c.id=o.id;c.className="plN";
  var t=d.createElement("div");t.className="plH";t.textContent=o.title;c.appendChild(t);
  var p=d.createElement("div");p.className="plD";p.textContent=o.text;c.appendChild(p);
  var a=d.createElement("div");a.className="plAct";
  o.actions.forEach(function(b){
    var e=d.createElement("a");e.textContent=b.label;e.href=b.href||"#";
    if(b.primary)e.className="pri";
    if(b.blank){e.target="_blank";e.rel="noopener";}
    if(b.fn)e.onclick=function(ev){ev.preventDefault();b.fn(e);};
    a.appendChild(e);
  });
  c.appendChild(a);
  host(o.lock).appendChild(c);
}
function drop(id){
  var n=d.getElementById(id);if(n)n.remove();
  var h=d.getElementById("plCenter");
  if(h&&!h.children.length)h.remove();
}
function copy(e){
  var u=location.href,ok=function(){e.textContent="Link disalin";};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,function(){window.prompt("Salin link ini:",u);});}
  else{window.prompt("Salin link ini:",u);}
}

/* ============================================
   BLOK 1: CHROME-ONLY
   Aktif/mati: PL_CFG.CHROME_ONLY
   ============================================ */
(function(){
  if(!C.CHROME_ONLY)return;
  var android=/Android/i.test(ua),ios=/iPhone|iPad|iPod/i.test(ua);
  var brands=(navigator.userAgentData&&navigator.userAgentData.brands)||[];
  var brandOk=!brands.length||brands.some(function(b){return /Google Chrome/i.test(b.brand);});
  var isChrome=brandOk&&/(Chrome|CriOS)\//.test(ua)
    &&!/Quetta|Edg|EdgA|EdgiOS|OPR|OPiOS|SamsungBrowser|UCBrowser|Vivaldi|YaBrowser|DuckDuckGo|Firefox|FxiOS|MiuiBrowser|HuaweiBrowser|Whale|; wv\)|FBAN|FBAV|Instagram|Line\//i.test(ua)
    &&!navigator.brave;
  if(isChrome)return;
  var bare=location.href.split("#")[0].replace(/^https?:\/\//,"");
  var link="https://www.google.com/chrome/",label="Unduh Chrome";
  if(android){
    link="intent://"+bare+"#Intent;scheme="+location.protocol.replace(":","")+";package=com.android.chrome;S.browser_fallback_url="+encodeURIComponent("https://play.google.com/store/apps/details?id=com.android.chrome")+";end";
    label="Buka di Chrome";
  }else if(ios){link="googlechromes://"+bare;label="Buka di Chrome";}
  function show(){
    note({id:"plChrome",title:"Gunakan Google Chrome",
      text:"Blog ini hanya mendukung Google Chrome. Buka lewat Chrome untuk pengalaman terbaik.",
      actions:[{label:label,href:link,primary:true,blank:!(android||ios)},{label:"Salin Link",fn:copy}],
      lock:!!C.CHROME_KUNCI_LAYAR});
  }
  ready(function(){show();setInterval(function(){if(!d.getElementById("plChrome"))show();},1500);});
})();

/* ============================================
   BLOK 2: ADBLOCK
   Aktif/mati: PL_CFG.ADBLOCK_AKTIF
   ============================================ */
(function(){
  if(!C.ADBLOCK_AKTIF)return;
  function show(){
    note({id:"plAds",title:"AdBlock terdeteksi",
      text:"Iklan membiayai website ini. Nonaktifkan AdBlock atau DNS pemblokir iklan untuk situs ini, lalu muat ulang.",
      actions:[{label:"Muat ulang",primary:true,fn:function(){location.reload();}}],
      lock:!!C.ADBLOCK_KUNCI_LAYAR});
  }
  function bait(){
    return new Promise(function(res){
      var b=d.createElement("div");
      b.className="adsbox ad-banner ad-placement pub_300x250 textads banner-ads";
      b.style.cssText="position:absolute;left:-999px;top:-999px;width:10px;height:10px";
      b.innerHTML="&nbsp;";d.body.appendChild(b);
      setTimeout(function(){
        var cs=getComputedStyle(b);
        var hit=b.offsetHeight===0||cs.display==="none"||cs.visibility==="hidden";
        if(b.parentNode)b.parentNode.removeChild(b);
        res(hit);
      },150);
    });
  }
  function net(){
    if(!navigator.onLine)return Promise.resolve(false);
    return Promise.all(["https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js","https://securepubads.g.doubleclick.net/tag/js/gpt.js"].map(function(u){
      return fetch(u,{method:"HEAD",mode:"no-cors",cache:"no-store"}).then(function(){return false;},function(){return true;});
    })).then(function(r){return r.some(Boolean);});
  }
  function cycle(){
    Promise.all([bait(),net()]).then(function(r){
      if(r[0]||r[1])show();else drop("plAds");
    });
  }
  ready(function(){cycle();setInterval(cycle,6000);});
})();

})();