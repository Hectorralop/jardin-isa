// --- CONFIGURACIÓN DE APIS ---
const AIRTABLE_API_KEY = 'patfQuYvWIBgZQObG.ee885ffe8950f275cf67e985a15f2cf5a481589c0a7d16b20de0bcbe890af137'; 
const BASE_ID = 'app8CeyMQkqYjFulz';
const TABLA_MENSAJE_DIARIO = 'mensajes'; 
const TABLA_CHAT = 'chat';     
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dg1n8hjqd/video/upload";
const CLOUDINARY_PRESET = "jardin_audios";

let mediaRecorder;
let audioChunks = [];
let timerInterval;
let segundos = 0;

const gardenFondo = document.getElementById('garden-fondo');
const gardenFrente = document.getElementById('garden-frente');
const btnRecord = document.getElementById('btn-record');

const floresInfo = [
    { src: 'flor_central.png', h: 300 }, 
    { src: 'campanulas.png', h: 200 },   
    { src: 'lirios.png', h: 220 },       
    { src: 'amapolas.png', h: 130 }      
];

// 1. INICIO DEL SISTEMA
function iniciarRegalo() {
    const overlay = document.getElementById('overlay');
    const musica = document.getElementById('musica');

    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }

    if (musica) musica.play().catch(e => console.log("Audio bloqueado"));

    setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        crearLuciernagasFondo();
        setInterval(crearPetalo, 600);
        construirRamo();
        setTimeout(() => {
            gardenFrente.style.bottom = '0';
            escribirPoema(); 
        }, 300);
    }, 600);
}

// 2. CONTROL DEL CHAT
function revelarChat() {
    const chatObj = document.querySelector('.chat-container');
    if (!chatObj) return;

    if (chatObj.classList.contains('mostrar')) {
        cerrarChat();
    } else {
        chatObj.style.display = 'block';
        setTimeout(() => {
            chatObj.classList.add('mostrar');
            cargarChat(); 
        }, 50);
    }
}

function cerrarChat() {
    const chatObj = document.querySelector('.chat-container');
    if (chatObj) {
        chatObj.classList.remove('mostrar');
        setTimeout(() => chatObj.style.display = 'none', 800);
    }
}

// 3. LÓGICA DE MENSAJES
async function cargarChat() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const filtro = `IS_SAME({Fecha}, '${hoy}', 'day')`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}?filterByFormula=${encodeURIComponent(filtro)}&sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=asc`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        const data = await response.json();
        
        const historial = document.getElementById('historial-chat');
        historial.innerHTML = '';

        if (data.records.length === 0) {
            historial.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); font-size:0.8rem; margin-top:20px;">Nuestra historia de hoy comienza aquí... ✨</div>';
        } else {
            data.records.forEach(reg => {
                const div = document.createElement('div');
                const esMio = reg.fields.Nombre === "El";
                div.className = `burbuja ${esMio ? "el" : "ella"}`;
                
                if (reg.fields.AudioUrl) {
                    div.innerHTML = `<audio controls src="${reg.fields.AudioUrl}" style="width: 100%; height: 35px;"></audio>`;
                } else {
                    div.innerText = reg.fields.Mensaje;
                }
                historial.appendChild(div);
            });
        }
        historial.scrollTop = historial.scrollHeight;
    } catch (e) { console.log("Error al cargar chat:", e); }
}

async function enviarMensajeFinal(texto, urlAudio = null) {
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLA_CHAT}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: { 
                "Nombre": "El", 
                "Mensaje": texto || "",
                "AudioUrl": urlAudio, 
                "Fecha": new Date().toISOString() 
            }
        })
    });
    cargarChat();
}

function enviarMensaje() {
    const input = document.getElementById('nuevo-mensaje');
    if (!input.value.trim()) return;
    enviarMensajeFinal(input.value);
    input.value = '';
}

// 4. LÓGICA DE AUDIO (CRONÓMETRO E INTERFAZ)
if (btnRecord) {
    btnRecord.addEventListener('mousedown', iniciarGrabacion);
    btnRecord.addEventListener('mouseup', detenerGrabacion);
    btnRecord.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarGrabacion(); });
    btnRecord.addEventListener('touchend', (e) => { e.preventDefault(); detenerGrabacion(); });
}

async function iniciarGrabacion() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        // --- Interfaz de grabación ---
        segundos = 0;
        const timerLabel = document.getElementById('timer-grabacion');
        const inputMsg = document.getElementById('nuevo-mensaje');
        
        if (timerLabel) {
            timerLabel.innerText = "00:00";
            timerLabel.style.display = "inline";
        }
        if (inputMsg) inputMsg.placeholder = "Grabando audio...";
        
        timerInterval = setInterval(() => {
            segundos++;
            let min = Math.floor(segundos / 60).toString().padStart(2, '0');
            let seg = (segundos % 60).toString().padStart(2, '0');
            if (timerLabel) timerLabel.innerText = `${min}:${seg}`;
        }, 1000);
        // ----------------------------

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = subirAudioACloudinary;
        mediaRecorder.start();
        btnRecord.classList.add('grabando');
    } catch (err) { alert("Necesitas dar permiso al micrófono"); }
}

function detenerGrabacion() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // --- CERRAR EL MICRÓFONO REAL ---
        // Accedemos a las pistas del stream y las detenemos una por una
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        btnRecord.classList.remove('grabando');
        
        // --- Limpiar Interfaz ---
        clearInterval(timerInterval);
        const timerLabel = document.getElementById('timer-grabacion');
        const inputMsg = document.getElementById('nuevo-mensaje');
        
        if (timerLabel) timerLabel.style.display = "none";
        if (inputMsg) inputMsg.placeholder = "Escribe algo...";
    }
}

async function subirAudioACloudinary() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    // Feedback visual: Espera
    btnRecord.innerText = "⏳";
    btnRecord.style.opacity = "0.5";

    try {
        const resp = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const data = await resp.json();
        
        if (data.secure_url) {
            await enviarMensajeFinal(null, data.secure_url);
            btnRecord.innerText = "✨";
            setTimeout(() => { 
                btnRecord.innerText = "🎤"; 
                btnRecord.style.opacity = "1";
            }, 1500);
        }
    } catch (err) { 
        console.error("Error Cloudinary:", err);
        btnRecord.innerText = "❌";
        setTimeout(() => { btnRecord.innerText = "🎤"; btnRecord.style.opacity = "1"; }, 1500);
    }
}

// 5. CARTA Y VISUALES
async function escribirPoema() {
    const cont = document.getElementById('texto-poema');
    const cajaCarta = document.querySelector('.poema');
    if (!cont || !cajaCarta) return;
    cajaCarta.classList.add('visible');

    try {
        const hoy = new Date().toISOString().split('T')[0];
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLA_MENSAJE_DIARIO}?filterByFormula=IS_SAME({Fecha},'${hoy}', 'day')`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await response.json();
        const texto = (data.records && data.records.length > 0) ? data.records[0].fields.Contenido : "Eres mi jardín favorito. ✨💘";

        cont.innerHTML = "";
        let i = 0;
        function type() {
            if (i < texto.length) {
                cont.innerHTML += texto[i] === "\n" ? "<br>" : texto[i];
                i++;
                setTimeout(type, 50);
            }
        }
        setTimeout(type, 800);
    } catch (e) { cont.innerHTML = "Eres mi jardín favorito. ✨💘"; }
}

function construirRamo() {
    const cont = gardenFrente;
    cont.innerHTML = ''; 
    crearFlorImagen(cont, floresInfo[1], 15, 20, 0.5, -20, 5);
    crearFlorImagen(cont, floresInfo[2], 85, 30, 0.8, 20, 5);
    crearEnjambreCorazon(cont);
    crearFlorImagen(cont, floresInfo[0], 40, 15, 0.4, -8, 10);
    crearFlorImagen(cont, floresInfo[0], 60, 15, 0.7, 8, 10);
    crearFlorImagen(cont, floresInfo[0], 50, 60, 0, 0, 15);
    [15, 32, 50, 68, 85].forEach((pos, i) => {
        crearFlorImagen(cont, floresInfo[3], pos, 10, i * 0.1, 0, 20);
    });
}

function crearFlorImagen(cont, info, x, hAdj, delay, ang, z) {
    const img = document.createElement('img');
    img.src = info.src;
    img.className = 'flower-img';
    img.style.left = x + '%';
    img.style.height = (info.h + hAdj) + 'px';
    img.style.zIndex = z;
    img.style.transform = `translateX(-50%) rotate(${ang}deg)`;
    img.style.animationDelay = delay + 's';
    img.onload = () => { img.style.opacity = '1'; };
    cont.appendChild(img);
}

function crearEnjambreCorazon(contenedor) {
    const wrapper = document.createElement('div');
    wrapper.className = 'enjambre-wrapper';
    contenedor.appendChild(wrapper);
    for (let i = 0; i < 80; i++) {
        const p = document.createElement('div');
        p.className = 'firefly-heart';
        const t = (i / 80) * (2 * Math.PI);
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        p.style.left = (x * 7) + 'px';
        p.style.top = (y * 7) + 'px';
        p.style.animationDelay = (Math.random() * 3) + 's';
        wrapper.appendChild(p);
    }
}

function crearLuciernagasFondo() {
    for (let i = 0; i < 20; i++) {
        const f = document.createElement('div');
        f.className = 'firefly';
        f.style.left = Math.random() * 100 + 'vw';
        f.style.top = Math.random() * 100 + 'vh';
        f.style.animationDuration = (Math.random() * 4 + 4) + 's';
        gardenFondo.appendChild(f);
    }
}

function crearPetalo() {
    const p = document.createElement('div');
    p.className = 'fall';
    p.style.left = Math.random() * 100 + 'vw';
    const colores = ['#ffb6c1', '#ffd1dc', '#fff176'];
    p.style.background = colores[Math.floor(Math.random() * colores.length)];
    const duracion = Math.random() * 3 + 5;
    p.style.animationDuration = duracion + 's';
    gardenFondo.appendChild(p);
    setTimeout(() => p.remove(), duracion * 1000);
}