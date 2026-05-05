// --- 1. CONFIGURACIÓN ---
const AIRTABLE_API_KEY = 'patfQuYvWIBgZQObG.ee885ffe8950f275cf67e985a15f2cf5a481589c0a7d16b20de0bcbe890af137'; 
const BASE_ID = 'app8CeyMQkqYjFulz';
const TABLA_MENSAJE_DIARIO = 'mensajes'; 
const TABLA_CHAT = 'chat';      
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dg1n8hjqd/video/upload";
const CLOUDINARY_PRESET = "jardin_audios";

let mediaRecorder, audioChunks = [], timerInterval, segundos = 0;
let currentStream = null; 

const gardenFondo = document.getElementById('garden-fondo');
const gardenFrente = document.getElementById('garden-frente');
const btnRecord = document.getElementById('btn-record');
const timerDisplay = document.getElementById('timer-grabacion');

const floresInfo = [
    { src: 'flor_central.png', h: 300 }, 
    { src: 'campanulas.png', h: 230 },   
    { src: 'lirios.png', h: 250 },         
    { src: 'amapolas.png', h: 160 }      
];

// --- 2. INICIO Y CONTROL DE INTERFAZ ---
function iniciarRegalo() {
    const overlay = document.getElementById('overlay');
    const musica = document.getElementById('musica');

    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => overlay.style.display = 'none', 800);
    }

    if (musica) musica.play().catch(() => console.log("Permiso de audio requerido"));

    crearLuciernagasFondo();
    construirRamo();
    
    setInterval(() => { if (!document.hidden) crearPetalo(); }, 1200);

    setTimeout(() => { escribirPoema(); }, 500);
}

// --- 3. CONSTRUCCIÓN DEL JARDÍN ---
function construirRamo() {
    const cont = document.getElementById('garden-frente');
    if (!cont) return;

    const elementosPrevios = cont.querySelectorAll('.flower-img, .enjambre-wrapper');
    elementosPrevios.forEach(el => el.remove());

    const fragmento = document.createDocumentFragment();
    
    crearFlorImagen(fragmento, floresInfo[1], 12, 75, 0.5, -12, 5, '2vh');  
    crearFlorImagen(fragmento, floresInfo[2], 88, 85, 0.8, 12, 5, '2vh');   
    crearEnjambreCorazon(fragmento);
    crearFlorImagen(fragmento, floresInfo[0], 32, 55, 0.4, -8, 10, '5vh'); 
    crearFlorImagen(fragmento, floresInfo[0], 68, 70, 0.7, 8, 10, '5vh');    
    crearFlorImagen(fragmento, floresInfo[0], 50, 85, 0, 0, 15, '6vh'); 

    const configAmapolas = [
        {pos: 15, alt: 15, ang: -5},
        {pos: 35, alt: 30, ang: 3},
        {pos: 50, alt: 20, ang: 0},
        {pos: 65, alt: 25, ang: -2},
        {pos: 85, alt: 18, ang: 5}
    ];

    configAmapolas.forEach((amapola, i) => {
        crearFlorImagen(fragmento, floresInfo[3], amapola.pos, amapola.alt, i * 0.1, amapola.ang, 25, '5vh');
    });

    cont.appendChild(fragmento);
}

function crearFlorImagen(cont, info, x, hAdj, delay, ang, z, baseBottom) {
    const img = document.createElement('img');
    img.src = info.src;
    img.className = 'flower-img';
    const esMovil = window.innerWidth < 600;
    const factorEscala = esMovil ? 0.82 : 1.0; 
    const alturaFinal = (info.h + hAdj) * factorEscala;
    img.style.cssText = `left: ${x}%; bottom: ${baseBottom}; height: ${alturaFinal}px; z-index: ${z}; transform: translateX(-50%) rotate(${ang}deg); animation-delay: ${delay}s;`;
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
        const escalaCorazon = window.innerWidth < 600 ? 5.5 : 6.5;
        p.style.left = (x * escalaCorazon) + 'px';
        p.style.top = (y * escalaCorazon) + 'px';
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

// --- 5. MENSAJES Y CHAT ---
async function escribirPoema() {
    const cont = document.getElementById('texto-poema');
    const cajaCarta = document.querySelector('.poema');
    if (!cont || !cajaCarta) return;
    cajaCarta.classList.add('visible');
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_MENSAJE_DIARIO}?filterByFormula=IS_SAME({Fecha},'${hoy}','day')`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await response.json();
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

async function cargarChat() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const filtro = `IS_SAME({Fecha}, '${hoy}', 'day')`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}?filterByFormula=${encodeURIComponent(filtro)}&sort[0][field]=Fecha&sort[0][direction]=asc`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await response.json();
        const historial = document.getElementById('historial-chat');
        if (!historial) return;
        historial.innerHTML = '';
        data.records?.forEach(reg => {
            const div = document.createElement('div');
            div.className = `burbuja ${reg.fields.Nombre === "El" ? "el" : "ella"}`;
            if (reg.fields.AudioUrl) {
                const audio = document.createElement('audio');
                audio.src = reg.fields.AudioUrl; 
                audio.controls = true;
                // Cambio solicitado: Quitar menú de descarga y limpiar controles
                audio.controlsList = "nodownload"; 
                div.appendChild(audio);
            } else { div.innerText = reg.fields.Mensaje; }
            historial.appendChild(div);
        });
        historial.scrollTop = historial.scrollHeight;
    } catch (e) { console.error(e); }
}

function revelarChat() {
    const chat = document.querySelector('.chat-container');
    if (!chat) return;
    const isVisible = chat.classList.toggle('mostrar');
    chat.style.display = isVisible ? 'block' : 'none';
    if (isVisible) cargarChat();
}

function cerrarChat() {
    const chat = document.querySelector('.chat-container');
    if (chat) { chat.classList.remove('mostrar'); chat.style.display = 'none'; }
}

async function enviarMensaje() {
    const input = document.getElementById('nuevo-mensaje');
    if (!input || !input.value.trim()) return;
    const texto = input.value;
    input.value = '';
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { "Nombre": "El", "Mensaje": texto, "Fecha": new Date().toISOString() } })
    });
    cargarChat();
}

// --- 6. LÓGICA DE GRABACIÓN ---

function iniciarContador() {
    segundos = 0;
    if (timerDisplay) { timerDisplay.innerText = "00:00"; timerDisplay.style.display = 'inline'; }
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        segundos++;
        const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
        const secs = (segundos % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
    }, 1000);
}

async function iniciarGrabacion() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true } 
        });
        mediaRecorder = new MediaRecorder(currentStream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = subirAudio;
        iniciarContador();
        mediaRecorder.start();
        btnRecord.classList.add('grabando');
    } catch (err) { console.error("Error micro:", err); }
}

function detenerGrabacion() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop(); 
            track.enabled = false; 
        });
        currentStream = null;
    }
    btnRecord.classList.remove('grabando');
    clearInterval(timerInterval);
    if (timerDisplay) timerDisplay.style.display = 'none';
}

async function subirAudio() {
    if (audioChunks.length === 0) return;
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    try {
        const resp = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const data = await resp.json();
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: { "Nombre": "El", "AudioUrl": data.secure_url, "Fecha": new Date().toISOString() } })
        });
        cargarChat();
    } catch (e) { console.error("Error subida:", e); }
}

// EVENTOS MÓVIL Y PC
if (btnRecord) {
    btnRecord.addEventListener('mousedown', (e) => { e.preventDefault(); iniciarGrabacion(); });
    btnRecord.addEventListener('mouseup', detenerGrabacion);
    btnRecord.addEventListener('mouseleave', detenerGrabacion);
    btnRecord.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarGrabacion(); }, { passive: false });
    btnRecord.addEventListener('touchend', (e) => { e.preventDefault(); detenerGrabacion(); }, { passive: false });
    btnRecord.addEventListener('touchcancel', detenerGrabacion);
}
