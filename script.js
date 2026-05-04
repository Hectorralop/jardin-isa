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
        if(gardenFrente) gardenFrente.style.bottom = '6vh';
        escribirPoema(); 
    }, 500);
}

// --- 3. CONSTRUCCIÓN DEL JARDÍN ---
function construirRamo() {
    const cont = document.getElementById('garden-frente');
    if (!cont) return;

    const elementosPrevios = cont.querySelectorAll('.flower-img, .enjambre-wrapper');
    elementosPrevios.forEach(el => el.remove());

    const fragmento = document.createDocumentFragment();
    
    crearFlorImagen(fragmento, floresInfo[1], 15, 20, 0.5, -20, 5);
    crearFlorImagen(fragmento, floresInfo[2], 85, 30, 0.8, 20, 5);
    crearEnjambreCorazon(fragmento);
    crearFlorImagen(fragmento, floresInfo[0], 40, 15, 0.4, -8, 10);
    crearFlorImagen(fragmento, floresInfo[0], 60, 15, 0.7, 8, 10);
    crearFlorImagen(fragmento, floresInfo[0], 50, 60, 0, 0, 15);
    
    [15, 32, 50, 68, 85].forEach((pos, i) => {
        crearFlorImagen(fragmento, floresInfo[3], pos, 10, i * 0.1, 0, 20);
    });

    cont.appendChild(fragmento);
}

function crearFlorImagen(cont, info, x, hAdj, delay, ang, z) {
    const img = document.createElement('img');
    img.src = info.src;
    img.className = 'flower-img';
    img.style.cssText = `left:${x}%; height:${info.h + hAdj}px; z-index:${z}; transform: translateX(-50%) rotate(${ang}deg); animation-delay:${delay}s;`;
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
        p.style.left = (x * 6.5) + 'px';
        p.style.top = (y * 6.5) + 'px';
        p.style.animationDelay = (Math.random() * 3) + 's';
        wrapper.appendChild(p);
    }
    contenedor.appendChild(wrapper);
}

// --- 4. EFECTOS AMBIENTALES ---
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

// --- 5. CARTA DIARIA (CORREGIDO CON SCROLL AUTOMÁTICO) ---
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
                // Insertamos letra o salto de línea
                cont.innerHTML += (texto[i] === "\n" || texto[i] === "\r") ? "<br>" : texto[i];
                i++;

                // Lógica de Scroll Automático:
                // Movemos el scroll del contenedor (.poema) al máximo de su altura actual
                cajaCarta.scrollTop = cajaCarta.scrollHeight;

                setTimeout(type, 55);
            }
        }
        type();
    } catch (e) { cont.innerHTML = "Eres mi jardín favorito. ✨💘"; }
}

// --- 6. CHAT Y MENSAJES ---
async function cargarChat() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const filtro = `IS_SAME({Fecha}, '${hoy}', 'day')`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}?filterByFormula=${encodeURIComponent(filtro)}&sort[0][field]=Fecha&sort[0][direction]=asc`;

        const response = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await response.json();
        const historial = document.getElementById('historial-chat');
        const musicaFondo = document.getElementById('musica'); 
        
        if (!historial) return;
        historial.innerHTML = '';

        if (!data.records || data.records.length === 0) {
            historial.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.3); font-size:0.8rem; margin-top:20px;">Escribe algo especial... ✨</div>';
        } else {
            data.records.forEach(reg => {
                const div = document.createElement('div');
                div.className = `burbuja ${reg.fields.Nombre === "El" ? "el" : "ella"}`;
                
                if (reg.fields.AudioUrl) {
                    const audioEle = document.createElement('audio');
                    audioEle.src = reg.fields.AudioUrl;
                    audioEle.controls = true;
                    audioEle.preload = "metadata";
                    audioEle.style.width = "100%";
                    audioEle.style.display = "block";

                    audioEle.onplay = () => { if (musicaFondo) suavizarVolumen(musicaFondo, 0.1); };
                    audioEle.onpause = () => { if (musicaFondo) suavizarVolumen(musicaFondo, 1.0); };
                    audioEle.onended = () => { if (musicaFondo) suavizarVolumen(musicaFondo, 1.0); };

                    div.appendChild(audioEle);
                } else {
                    div.innerText = reg.fields.Mensaje;
                }
                historial.appendChild(div);
            });
        }
        setTimeout(() => {
            historial.scrollTo({ top: historial.scrollHeight, behavior: 'smooth' });
        }, 200);
    } catch (e) { console.error("Error chat:", e); }
}

function revelarChat() {
    const chatObj = document.querySelector('.chat-container');
    if (!chatObj) return;
    
    if (chatObj.classList.contains('mostrar')) {
        chatObj.classList.remove('mostrar');
        setTimeout(() => chatObj.style.display = 'none', 500);
    } else {
        chatObj.style.display = 'block';
        setTimeout(() => { chatObj.classList.add('mostrar'); cargarChat(); }, 50);
    }
}

async function enviarMensajeFinal(texto, urlAudio = null) {
    try {
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: { "Nombre": "El", "Mensaje": texto || "", "AudioUrl": urlAudio, "Fecha": new Date().toISOString() }
            })
        });
        cargarChat();
    } catch (e) { console.error("Error envío:", e); }
}

function enviarMensaje() {
    const input = document.getElementById('nuevo-mensaje');
    if (!input || !input.value.trim()) return;
    enviarMensajeFinal(input.value);
    input.value = '';
}

// --- 7. AUDIO Y GRABACIÓN ---
if (btnRecord) {
    btnRecord.addEventListener('mousedown', iniciarGrabacion);
    btnRecord.addEventListener('mouseup', detenerGrabacion);
    btnRecord.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarGrabacion(); }, {passive: false});
    btnRecord.addEventListener('touchend', (e) => { e.preventDefault(); detenerGrabacion(); }, {passive: false});
}

async function iniciarGrabacion() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        segundos = 0;
        
        const timerLabel = document.getElementById('timer-grabacion');
        if (timerLabel) { timerLabel.innerText = "00:00"; timerLabel.style.display = "inline"; }
        
        timerInterval = setInterval(() => {
            segundos++;
            let min = Math.floor(segundos / 60).toString().padStart(2, '0');
            let seg = (segundos % 60).toString().padStart(2, '0');
            if (timerLabel) timerLabel.innerText = `${min}:${seg}`;
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
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        btnRecord.classList.remove('grabando');
        clearInterval(timerInterval);
        const timerLabel = document.getElementById('timer-grabacion');
        if (timerLabel) timerLabel.style.display = "none";
    }
}

async function subirAudioACloudinary() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    
    const iconOriginal = btnRecord.innerHTML;
    btnRecord.innerHTML = "⏳";

    try {
        const resp = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const data = await resp.json();
        if (data.secure_url) await enviarMensajeFinal(null, data.secure_url);
        btnRecord.innerHTML = iconOriginal;
    } catch (err) { 
        btnRecord.innerHTML = "❌"; 
        setTimeout(() => btnRecord.innerHTML = iconOriginal, 2000); 
    }
}

// --- 8. FUNCIONES AUXILIARES ---
function suavizarVolumen(elementoAudio, volumenObjetivo) {
    const paso = 0.05; 
    const intervalo = 50; 

    let fade = setInterval(() => {
        if (elementoAudio.volume < volumenObjetivo) {
            elementoAudio.volume = Math.min(elementoAudio.volume + paso, volumenObjetivo);
        } else {
            elementoAudio.volume = Math.max(elementoAudio.volume - paso, volumenObjetivo);
        }

        if (Math.abs(elementoAudio.volume - volumenObjetivo) < 0.01) {
            elementoAudio.volume = volumenObjetivo;
            clearInterval(fade);
        }
    }, intervalo);
}
