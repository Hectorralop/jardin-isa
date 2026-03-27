// --- 1. CONFIGURACIÓN ---
const AIRTABLE_API_KEY = 'patfQuYvWIBgZQObG.ee885ffe8950f275cf67e985a15f2cf5a481589c0a7d16b20de0bcbe890af137'; 
const BASE_ID = 'app8CeyMQkqYjFulz';
const TABLA_MENSAJE_DIARIO = 'mensajes'; 
const TABLA_CHAT = 'chat';     
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dg1n8hjqd/video/upload";
const CLOUDINARY_PRESET = "jardin_audios";

let mediaRecorder, audioChunks = [], timerInterval, segundos = 0;
const gardenFondo = document.getElementById('garden-fondo');
const gardenFrente = document.getElementById('garden-frente');
const btnRecord = document.getElementById('btn-record');

const floresInfo = [
    { src: 'flor_central.png', h: 300 }, 
    { src: 'campanulas.png', h: 200 },   
    { src: 'lirios.png', h: 220 },       
    { src: 'amapolas.png', h: 130 }      
];

// --- 2. INICIO ---
function iniciarRegalo() {
    const overlay = document.getElementById('overlay');
    const musica = document.getElementById('musica');

    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => overlay.style.display = 'none', 800);
    }

    if (musica) musica.play().catch(() => console.log("Clic necesario"));

    crearLuciernagasFondo();
    construirRamo();
    
    setInterval(() => { if (!document.hidden) crearPetalo(); }, 1200);

    setTimeout(() => {
        if(gardenFrente) gardenFrente.classList.add('activo'); 
        escribirPoema(); 
    }, 500);
}

// --- 3. EL RAMO PERFECTO (ALTURAS Y APERTURA) ---
function construirRamo() {
    const cont = document.getElementById('garden-frente');
    if (!cont) return;
    cont.innerHTML = ''; 

    const fragmento = document.createDocumentFragment();
    
    // CAPA 1: MARCO EXTERIOR (Muy abiertas en las esquinas)
    crearFlorImagen(fragmento, floresInfo[1], 5, 60, 0.8, -25, 5);  // Izquierda extrema
    crearFlorImagen(fragmento, floresInfo[2], 95, 75, 1.0, 25, 5);  // Derecha extrema
    
    crearEnjambreCorazon(fragmento);

    // CAPA 2: CUERPO DEL RAMO (Escalera visual)
    crearFlorImagen(fragmento, floresInfo[0], 25, -55, 0.5, -15, 10); // Baja izq
    crearFlorImagen(fragmento, floresInfo[0], 75, 15, 0.7, 15, 10);   // Media der
    crearFlorImagen(fragmento, floresInfo[0], 50, 140, 0, 0, 15);    // REINA ALTA (Centro)

    // CAPA 3: BASE (Amapolas como relleno inferior)
    const posicionesAmapolas = [18, 34, 50, 66, 82];
    posicionesAmapolas.forEach((pos, i) => {
        crearFlorImagen(fragmento, floresInfo[3], pos, -80, i * 0.15, 0, 20);
    });

    cont.appendChild(fragmento);
}

function crearFlorImagen(cont, info, x, hAdj, delay, ang, z) {
    const img = document.createElement('img');
    img.src = info.src;
    img.className = 'flower-img';
    
    const esMovil = window.innerWidth < 600;
    const factorEscala = esMovil ? 0.6 : 1.0; 
    
    const alturaFinal = (info.h * factorEscala) + hAdj;
    
    img.style.cssText = `
        left: ${x}%; 
        height: ${alturaFinal}px; 
        z-index: ${z}; 
        transform: translateX(-50%) rotate(${ang}deg); 
        animation-delay: ${delay}s;
    `;
    
    img.onload = () => img.style.opacity = '1';
    cont.appendChild(img);
}

function crearEnjambreCorazon(contenedor) {
    const wrapper = document.createElement('div');
    wrapper.className = 'enjambre-wrapper';
    const cant = window.innerWidth < 600 ? 40 : 70; 
    
    for (let i = 0; i < cant; i++) {
        const p = document.createElement('div');
        p.className = 'firefly-heart';
        const t = (i / cant) * (2 * Math.PI);
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        const escala = window.innerWidth < 600 ? 5.5 : 6.5;
        p.style.left = (x * escala) + 'px';
        p.style.top = (y * escala) + 'px';
        p.style.animationDelay = (Math.random() * 3) + 's';
        wrapper.appendChild(p);
    }
    contenedor.appendChild(wrapper);
}

// --- 4. AMBIENTE ---
function crearLuciernagasFondo() {
    if (!gardenFondo) return;
    for (let i = 0; i < 12; i++) {
        const f = document.createElement('div');
        f.className = 'firefly';
        f.style.left = Math.random() * 100 + 'vw';
        f.style.top = Math.random() * 100 + 'vh';
        f.style.animationDuration = (Math.random() * 4 + 5) + 's';
        gardenFondo.appendChild(f);
    }
}

function crearPetalo() {
    if (!gardenFondo) return;
    const p = document.createElement('div');
    p.className = 'fall';
    p.style.left = Math.random() * 100 + 'vw';
    const colores = ['#ffb6c1', '#ffd1dc', '#fff176', '#ffffff'];
    p.style.background = colores[Math.floor(Math.random() * colores.length)];
    const dur = Math.random() * 4 + 6;
    p.style.animationDuration = dur + 's';
    gardenFondo.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000);
}

// --- 5. TEXTO DINÁMICO ---
async function escribirPoema() {
    const cont = document.getElementById('texto-poema');
    const cajaCarta = document.querySelector('.poema');
    if (!cont || !cajaCarta) return;
    cajaCarta.classList.add('visible');
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_MENSAJE_DIARIO}?filterByFormula=IS_SAME({Fecha},'${hoy}','day')`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await resp.json();
        const texto = (data.records && data.records.length > 0) ? data.records[0].fields.Contenido : "Eres mi jardín favorito. ✨💘";
        cont.innerHTML = ""; 
        let i = 0;
        function type() {
            if (i < texto.length) {
                cont.innerHTML += (texto[i] === "\n" || texto[i] === "\r") ? "<br>" : texto[i];
                i++;
                cajaCarta.scrollTop = cajaCarta.scrollHeight;
                setTimeout(type, 55);
            }
        }
        type();
    } catch (e) { cont.innerHTML = "Eres mi jardín favorito. ✨💘"; }
}

// --- 6. CHAT ---
async function cargarChat() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const filtro = `IS_SAME({Fecha}, '${hoy}', 'day')`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}?filterByFormula=${encodeURIComponent(filtro)}&sort[0][field]=Fecha&sort[0][direction]=asc`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await resp.json();
        const historial = document.getElementById('historial-chat');
        const musica = document.getElementById('musica'); 
        if (!historial) return;
        historial.innerHTML = '';
        if (data.records) {
            data.records.forEach(reg => {
                const div = document.createElement('div');
                div.className = `burbuja ${reg.fields.Nombre === "El" ? "el" : "ella"}`;
                if (reg.fields.AudioUrl) {
                    const aud = document.createElement('audio');
                    aud.src = reg.fields.AudioUrl; aud.controls = true;
                    aud.onplay = () => { if (musica) suavizarVolumen(musica, 0.1); };
                    aud.onpause = () => { if (musica) suavizarVolumen(musica, 1.0); };
                    div.appendChild(aud);
                } else { div.innerText = reg.fields.Mensaje; }
                historial.appendChild(div);
            });
        }
        setTimeout(() => { historial.scrollTo({ top: historial.scrollHeight, behavior: 'smooth' }); }, 200);
    } catch (e) { console.error(e); }
}

function revelarChat() {
    const c = document.querySelector('.chat-container');
    if (!c) return;
    if (c.classList.contains('mostrar')) {
        c.classList.remove('mostrar');
        setTimeout(() => c.style.display = 'none', 500);
    } else {
        c.style.display = 'block';
        setTimeout(() => { c.classList.add('mostrar'); cargarChat(); }, 50);
    }
}

async function enviarMensajeFinal(t, u = null) {
    try {
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: { "Nombre": "El", "Mensaje": t || "", "AudioUrl": u, "Fecha": new Date().toISOString() } })
        });
        cargarChat();
    } catch (e) { console.error(e); }
}

function enviarMensaje() {
    const input = document.getElementById('nuevo-mensaje');
    if (!input || !input.value.trim()) return;
    enviarMensajeFinal(input.value); input.value = '';
}

// --- 7. AUDIO ---
if (btnRecord) {
    btnRecord.addEventListener('mousedown', iniciarGrabacion);
    btnRecord.addEventListener('mouseup', detenerGrabacion);
    btnRecord.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarGrabacion(); }, {passive: false});
    btnRecord.addEventListener('touchend', (e) => { e.preventDefault(); detenerGrabacion(); }, {passive: false});
}

async function iniciarGrabacion() {
    try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(s);
        audioChunks = []; segundos = 0;
        const lbl = document.getElementById('timer-grabacion');
        if (lbl) { lbl.innerText = "00:00"; lbl.style.display = "inline"; }
        timerInterval = setInterval(() => {
            segundos++;
            let m = Math.floor(segundos / 60).toString().padStart(2, '0');
            let sec = (segundos % 60).toString().padStart(2, '0');
            if (lbl) lbl.innerText = `${m}:${sec}`;
        }, 1000);
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = subirAudioACloudinary;
        mediaRecorder.start();
        btnRecord.classList.add('grabando');
    } catch (err) { alert("Micrófono no disponible."); }
}

function detenerGrabacion() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        btnRecord.classList.remove('grabando');
        clearInterval(timerInterval);
        const lbl = document.getElementById('timer-grabacion');
        if (lbl) lbl.style.display = "none";
    }
}

async function subirAudioACloudinary() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const fd = new FormData();
    fd.append('file', blob);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    const original = btnRecord.innerHTML; btnRecord.innerHTML = "⏳";
    try {
        const r = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const d = await r.json();
        if (d.secure_url) await enviarMensajeFinal(null, d.secure_url);
        btnRecord.innerHTML = original;
    } catch (err) { btnRecord.innerHTML = "❌"; setTimeout(() => btnRecord.innerHTML = original, 2000); }
}

function suavizarVolumen(a, v) {
    const p = 0.05; 
    let f = setInterval(() => {
        if (a.volume < v) a.volume = Math.min(a.volume + p, v);
        else a.volume = Math.max(a.volume - p, v);
        if (Math.abs(a.volume - v) < 0.01) { a.volume = v; clearInterval(f); }
    }, 50);
}
