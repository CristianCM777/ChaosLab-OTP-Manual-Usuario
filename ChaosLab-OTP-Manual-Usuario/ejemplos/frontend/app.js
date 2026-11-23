/* EJEMPLO DIDACTICO, NO COPIA DEL FRONTEND ORIGINAL */
const $ = (sel) => document.querySelector(sel);
const API = ''; // si se sirve desde Cowboy, usar rutas relativas
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function json(ruta, opciones) {
  const respuesta = await fetch(API + ruta, opciones);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} en ${ruta}`);
  return respuesta.json();
}
function mostrarError(err) { $('#contenido').innerHTML = `<p class="error">No se pudo consultar la API: ${esc(err.message)}. Abre esta página desde el servidor Cowboy.</p>`; }
const estrategias = ['one_for_one','rest_for_one','one_for_all'];
async function cargar() {
 const p = document.body.dataset.pantalla;
 try {
  if (p === 'dashboard') {
   const x = await json('/api/estadisticas');
   $('#contenido').innerHTML = `<div class="cards">${[['Experimentos',x.total],['Recuperaciones exitosas',x.exitosos],['Recuperaciones fallidas',x.fallidos],['Tiempo promedio (ms)',x.tiempo_promedio_ms],['Tiempo mínimo (ms)',x.tiempo_minimo_ms],['Tiempo máximo (ms)',x.tiempo_maximo_ms]].map(([n,v])=>`<article><small>${esc(n)}</small><strong>${esc(v)}</strong></article>`).join('')}</div>`;
  } else if (p === 'arbol') {
   const x = await json('/api/arbol');
   $('#contenido').innerHTML = `<h2>Supervisor raíz: ${esc(x.raiz?.nombre)}</h2><div class="cards">${(x.supervisores||[]).map(s => `<article><h3>${esc(s.nombre)}</h3><small>PID ${esc(s.pid)}</small>${(s.procesos||[]).map(pr=>`<p>${esc(pr.nombre)} — ${esc(pr.estado)} — ${esc(pr.pid)}</p>`).join('')}</article>`).join('')}</div>`;
  } else if (p === 'experimentos') {
   $('#contenido').innerHTML = `<form id="formulario"><label>Estrategia <select id="estrategia">${estrategias.map(e=>`<option value="${e}">${e}</option>`).join('')}</select></label><label>Repeticiones (1-100) <input type="number" id="cantidad" min="1" max="100" value="1"></label><button type="submit">Ejecutar experimento controlado</button></form><pre id="resultado">Sin ejecutar</pre>`;
   $('#formulario').addEventListener('submit',async ev=> {ev.preventDefault();const estrategia=$('#estrategia').value;const cantidad=Number($('#cantidad').value);if(!Number.isInteger(cantidad)||cantidad<1||cantidad>100){alert('Cantidad inválida');return;}if(!confirm(`Se provocará ${cantidad} caída(s) controlada(s) con ${estrategia}. ¿Continuar?`))return;$('#resultado').textContent='Ejecutando...';try{let x=await json('/api/experimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({estrategia,cantidad})});$('#resultado').textContent=JSON.stringify(x,null,2);}catch(e){$('#resultado').textContent='Error: '+e.message;}});
  } else if (p === 'historial') {
   const x = await json('/api/historial');
   $('#contenido').innerHTML=`<h2>Registros: ${esc(x.total)}</h2><div class="tabla"><table><thead><tr><th>Fecha UTC</th><th>Supervisor</th><th>Proceso</th><th>Tiempo (ms)</th><th>Recuperación</th></tr></thead><tbody>${(x.experimentos||[]).map(i=>`<tr><td>${esc(i.fecha_utc)}</td><td>${esc(i.supervisor)}</td><td>${esc(i.proceso_fallado)}</td><td>${esc(i.tiempo_ms)}</td><td>${i.exitoso?'Exitosa':'Fallida'}</td></tr>`).join('')}</tbody></table></div>`;
  } else if (p === 'estadisticas') {
   const x = await json('/api/estadisticas/estrategias');
   $('#contenido').innerHTML=`<div class="cards">${estrategias.map(e=>{let s=x[e]||{};return `<article><h3>${esc(e)}</h3><p>Experimentos: ${esc(s.total??'N/D')}</p><p>Recuperaciones: ${esc(s.exitosos??'N/D')}</p><p>Tiempo promedio (ms): ${esc(s.tiempo_promedio_ms??'N/D')}</p></article>`}).join('')}</div>`;
  }
 }catch(e){mostrarError(e);}
}
document.addEventListener('DOMContentLoaded',cargar);
