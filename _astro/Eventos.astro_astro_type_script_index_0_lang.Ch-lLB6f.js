var e=`https://script.google.com/macros/s/AKfycbzXn1TucLMtqVv1w_oBgX-VaG57VVWdHQ3noXRs_Op4ldDU-J1ESkuiUWl7RNRWcNHl/exec`,t=`6LdT1rYtAAAAAOKYn16m2zQ3zpHegtAmiVqgiIjD`,n=document.getElementById(`eventos-contenido`),r=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function i(e){let[t,n,r]=e.split(`-`).map(Number),i=new Date(t,n-1,r).toLocaleDateString(`es-MX`,{weekday:`long`,day:`numeric`,month:`long`});return i.charAt(0).toUpperCase()+i.slice(1)}function a(e){let[t,n]=e.split(`:`).map(Number);return`${t%12||12}:${String(n).padStart(2,`0`)} ${t<12?`a. m.`:`p. m.`}`}function o(e){let t=`<div class="relative flex h-44 w-full items-center justify-center bg-parchment-deep font-display text-5xl" aria-hidden="true">🎲${e.fotoUrl?`<img src="${r(e.fotoUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" class="absolute inset-0 h-full w-full object-cover" onerror="this.remove()">`:``}</div>`,n=e.concluido?`<p class="mt-4 rounded-lg bg-parchment-deep px-4 py-3 text-center font-display font-bold opacity-70">Evento concluido</p>`:e.lugaresDisponibles===0?`<p class="mt-4 rounded-lg bg-parchment-deep px-4 py-3 text-center font-display font-bold text-fire">Cupo completo</p>`:`<button type="button" data-id="${r(e.id)}" class="btn-registrar mt-4 w-full rounded-lg bg-fire px-6 py-3 font-display font-bold tracking-wide text-parchment-light transition-colors duration-200 hover:bg-amber hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2">Registrarse</button>`,o=e.concluido?``:`<p class="mt-3 text-sm font-bold ${e.lugaresDisponibles===0?`text-fire`:`text-wood`}">`+(e.lugaresDisponibles===0?`Sin lugares disponibles`:`Quedan ${e.lugaresDisponibles} de 6 lugares`)+`</p>`;return`
      <article class="card flex flex-col overflow-hidden rounded-xl bg-parchment">
        ${t}
        <div class="flex grow flex-col p-5">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-widest text-wood">${r(e.evento)}</p>
            <span class="rounded bg-parchment-deep px-2 py-0.5 text-xs font-bold text-wood">${r(e.sistema)}</span>
          </div>
          <h4 class="mt-1 font-display text-lg font-bold text-wood">${r(e.partida)}</h4>
          <p class="mt-1 text-sm font-bold">${r(i(e.fecha))} · ${r(a(e.hora))}</p>
          <p class="mt-2 text-sm">Narrador: <strong>${r(e.narrador)}</strong></p>
          <p class="text-sm">Mazmorra: <strong>${r(e.mazmorra.nombre)}</strong> — <a href="${r(e.mazmorra.mapsUrl)}" target="_blank" rel="noopener" class="underline">cómo llegar</a></p>
          <p class="mt-2 text-sm opacity-90">${r(e.descripcion)}</p>
          <div class="grow"></div>
          ${o}
          ${n}
        </div>
      </article>`}function s(e){if(e.length===0){n.innerHTML=`<p class="text-center opacity-80">Estamos preparando los eventos del mes. Vuelve pronto — y si tienes dudas, escríbenos por <a class="underline" href="https://wa.me/522221890232" target="_blank" rel="noopener">WhatsApp</a>.</p>`;return}n.innerHTML=[...new Set(e.map(e=>e.ciudad))].map(t=>`
      <div class="mt-10 first:mt-0">
        <h3 class="ornament mb-6 text-center font-display text-2xl font-bold text-wood">${r(t)}</h3>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          ${e.filter(e=>e.ciudad===t).map(o).join(``)}
        </div>
      </div>`).join(``)}async function c(){try{let t=await(await fetch(`${e}?t=${Date.now()}`)).json();if(!t.ok)throw Error(`respuesta no ok`);s(t.eventos),document.dispatchEvent(new CustomEvent(`eventos:pintados`,{detail:t.eventos}))}catch{n.innerHTML=`<p class="text-center opacity-80">El tablón no responde por ahora. Intenta de nuevo en un momento o escríbenos por <a class="underline" href="https://wa.me/522221890232" target="_blank" rel="noopener">WhatsApp</a>.</p>`}}window.__recargarEventos=c,c();var l=document.getElementById(`registro-dialog`),u=document.getElementById(`registro-cuerpo`),d=document.getElementById(`registro-titulo`);document.getElementById(`registro-cerrar`).addEventListener(`click`,()=>l.close()),l.addEventListener(`click`,e=>{e.target===l&&l.close()});var f=[];document.addEventListener(`eventos:pintados`,e=>{f=e.detail,document.querySelectorAll(`.btn-registrar`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0,e.textContent=`Consultando cupos…`,await g(e.dataset.id)})})});var p=null;function m(){return p||=new Promise((e,n)=>{let r=document.createElement(`script`),i=!1,a=()=>{i||(i=!0,p=null,r.remove(),n(Error(`No se pudo cargar la verificación de seguridad. Si usas un bloqueador de anuncios, permítelo e intenta de nuevo.`)))},o=setTimeout(a,1e4);r.src=`https://www.google.com/recaptcha/api.js?render=${t}`,r.onload=()=>window.grecaptcha.ready(()=>{i||(i=!0,clearTimeout(o),e())}),r.onerror=()=>{clearTimeout(o),a()},document.head.appendChild(r)}),p}function h(e){return`
      <fieldset class="mt-4 rounded-lg border border-wood/30 p-4">
        <legend class="px-1 font-display text-sm font-bold text-wood">Aventurero ${e+1}</legend>
        <label class="mt-1 block text-sm">Nombre
          <input name="nombre-${e}" required minlength="2" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
        </label>
        <label class="mt-3 block text-sm">Teléfono (10 dígitos)
          <input name="telefono-${e}" type="tel" required pattern="[0-9() +-]{10,}" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
        </label>
        <label class="mt-3 block text-sm">Correo
          <input name="correo-${e}" type="email" required class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
        </label>
      </fieldset>`}async function g(e){await window.__recargarEventos();let t=f.find(t=>String(t.id)===String(e));if(!t||t.concluido||t.lugaresDisponibles===0)return;d.textContent=t.partida;let n=Math.min(t.lugaresDisponibles,6);u.innerHTML=`
      <p class="mt-1 text-sm opacity-90">${r(t.evento)} · ${r(i(t.fecha))} · ${r(a(t.hora))} · ${r(t.mazmorra.nombre)}, ${r(t.ciudad)}</p>
      <form id="registro-form" class="mt-2">
        <label class="mt-3 block text-sm">¿Cuántos lugares?
          <select name="cupos" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
            ${Array.from({length:n},(e,t)=>`<option value="${t+1}">${t+1}</option>`).join(``)}
          </select>
        </label>
        <div id="registro-personas">${h(0)}</div>
        <!-- Honeypot: invisible para humanos; los bots lo llenan -->
        <div style="position:absolute;left:-5000px" aria-hidden="true">
          <input name="apellido2" tabindex="-1" autocomplete="off">
        </div>
        <p id="registro-error" class="mt-3 hidden rounded-lg bg-fire/10 px-3 py-2 text-sm font-bold text-fire" role="alert"></p>
        <button type="submit" class="mt-5 w-full rounded-lg bg-fire px-6 py-3 font-display font-bold tracking-wide text-parchment-light transition-colors hover:bg-amber hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber">Confirmar registro</button>
        <p class="mt-3 text-center text-xs opacity-70">Tus datos solo se usan para gestionar tu registro. <a href="/aviso-de-privacidad/" target="_blank" rel="noopener" class="underline">Aviso de privacidad</a>.</p>
      </form>`;let o=document.getElementById(`registro-form`);o.querySelector(`[name=cupos]`).addEventListener(`change`,e=>{let t=Number(e.target.value);document.getElementById(`registro-personas`).innerHTML=Array.from({length:t},(e,t)=>h(t)).join(``)}),o.addEventListener(`submit`,e=>{e.preventDefault(),_(t,o)}),l.open||l.showModal(),m().catch(()=>{})}async function _(n,r){let i=r.querySelector(`[type=submit]`),a=document.getElementById(`registro-error`);a.classList.add(`hidden`),i.disabled=!0,i.textContent=`Reservando lugares…`;try{let i=new FormData(r),a=Number(i.get(`cupos`)),o=Array.from({length:a},(e,t)=>({nombre:i.get(`nombre-${t}`),telefono:i.get(`telefono-${t}`),correo:i.get(`correo-${t}`)}));await m();let s=window,c=s.grecaptcha?await s.grecaptcha.execute(t,{action:`registro`}):``,l=await fetch(e,{method:`POST`,headers:{"Content-Type":`text/plain;charset=utf-8`},body:JSON.stringify({eventoId:n.id,personas:o,recaptchaToken:c,apellido2:i.get(`apellido2`)})}),d;try{d=await l.json()}catch{throw Error(`El tablón no respondió como esperábamos. Intenta de nuevo en un momento.`)}if(!d.ok)throw Error(d.error||`No pudimos guardar tu registro.`);u.innerHTML=`
        <p class="mt-4 rounded-lg bg-parchment px-4 py-6 text-center">
          <strong class="font-display text-lg text-wood">¡Lugar reservado! 🎲</strong><br>
          <span class="mt-2 block text-sm opacity-90">Te enviamos un correo con todos los detalles del evento (si no lo ves, revisa tu bandeja de spam). Nos vemos en la mesa.</span>
        </p>`,window.__recargarEventos()}catch(e){a.textContent=e.message||`Algo salió mal. Intenta de nuevo.`,a.classList.remove(`hidden`),i.disabled=!1,i.textContent=`Confirmar registro`,window.__recargarEventos()}}