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

// --- 2. INICIO Y CONTROL DE INTERFAZ ---
function iniciarRegalo() {
    const overlay = document.getElementById('overlay');
    const musica = document.getElementById('musica');

    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => overlay.style.display = 'none', 800);
    }

    if (musica) musica.play().catch(() => console.log("Clic para audio necesario"));

    crearLuciernagasFondo();
    construirRamo();
    
    setInterval(() => { if (!document.hidden) crearPetalo(); }, 1200);

    setTimeout(() => {
        escribirPoema(); 
    }, 500);
}

// --- 3. CONSTRUCCIÓN DEL JARDÍN (PERSPECTIVA Y TAMAÑOS CORREGIDOS) ---
function construirRamo() {
    const cont = document.getElementById('garden-frente');
    if (!cont) return;

    const elementosPrevios = cont.querySelectorAll('.flower-img, .enjambre-wrapper');
    elementosPrevios.forEach(el => el.remove());

    const fragmento = document.createDocumentFragment();
    
    // CAPA 1: FONDO (Campanulas y Lirios)
    crearFlorImagen(fragmento, floresInfo[1], 15, 30, 0.5, -12, 5, '3vh');  
    crearFlorImagen(fragmento, floresInfo[2], 85, 40, 0.8, 12, 5, '3vh');   
    
    // CAPA 2: CORAZÓN
    crearEnjambreCorazon(fragmento);

    // CAPA 3: CENTRAL (Flores Amarillas)
    crearFlorImagen(fragmento, floresInfo[0], 35, -20, 0.4, -8, 10, '5vh'); 
    crearFlorImagen(fragmento, floresInfo[0], 70, 10, 0.7, 8, 10, '5vh');    
    crearFlorImagen(fragmento, floresInfo[0], 50, 140, 0, 0, 15, '6vh'); // LA REINA (Alta)

    // CAPA 4: FRENTE (Amapolas Rojas - Recuperan tamaño y visibilidad)
    const configAmapolas = [
        {pos: 12, alt: -25, ang: -8},
        {pos: 32, alt: -35, ang: 4},
        {pos: 50, alt: -20, ang: 0},
        {pos: 68, alt: -30, ang: -4},
        {pos: 88, alt: -25, ang: 8}
    ];

    configAmapolas.forEach((amapola, i) => {
        // baseBottom en 4vh para que no queden "enterradas"
        crearFlorImagen(fragmento, floresInfo[3], amapola.pos, amapola.alt, i * 0.1, amapola.ang, 25, '4vh');
    });

    cont.appendChild(fragmento);
}

function crearFlorImagen(cont, info, x, hAdj, delay, ang, z, baseBottom) {
    const img = document.createElement('img');
    img.src = info.src;
    img.className = 'flower-img';
    
    const esMovil = window.innerWidth < 600;
    const factorEscala = esMovil ? 0.75 : 1.0; // Ajustado de 0.65 a 0.75 para que no se vean tan pequeñas
    const alturaFinal = (info.h + hAdj) * factorEscala;
    
    img.style.cssText = `
        left: ${x}%; 
        bottom: ${baseBottom}; 
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
    
    // El posicionamiento vertical (55vh) se hereda del CSS que configuramos
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

// --- 5. MENSAJES AIRTABLE ---
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
                div.appendChild(audio);
            } else {
                div.innerText = reg.fields.Mensaje;
            }
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

// --- 6. AUDIO ---
async function iniciarGrabacion() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = subirAudio;
    mediaRecorder.start();
    btnRecord.classList.add('grabando');
}

function detenerGrabacion() {
    if (mediaRecorder?.state === 'recording') {
        mediaRecorder.stop();
        btnRecord.classList.remove('grabando');
    }
}

async function subirAudio() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    const resp = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const data = await resp.json();
    
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { "Nombre": "El", "AudioUrl": data.secure_url, "Fecha": new Date().toISOString() } })
    });
    cargarChat();
}

if (btnRecord) {
    btnRecord.onmousedown = iniciarGrabacion;
    btnRecord.onmouseup = detenerGrabacion;
    btnRecord.ontouchstart = e => { e.preventDefault(); iniciarGrabacion(); };
    btnRecord.ontouchend = e => { e.preventDefault(); detenerGrabacion(); };
}
