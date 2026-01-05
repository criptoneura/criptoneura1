// terminal.js - VERSIÓN CORREGIDA (ORO, PLATA Y ALERTAS)
const term = document.getElementById('terminal');
const simbolosTerminal = ["PAXGUSDT","BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","TRXUSDT","LINKUSDT","AVAXUSDT","DOTUSDT","LTCUSDT","BCHUSDT","SHIBUSDT","NEARUSDT","UNIUSDT","STXUSDT","RENDERUSDT","TAOUSDT"];

let ultimaAlertaIndex = -1;

// 1. FORMATO DE NÚMEROS
function nFormat(num) {
    if(!num || isNaN(num)) return "0.00";
    if(num >= 1e9) return (num/1e9).toFixed(2) + "B";
    if(num >= 1e6) return (num/1e6).toFixed(2) + "M";
    return parseFloat(num).toLocaleString();
}

// 2. GENERADOR DE ALERTAS (Sin repeticiones)
function generarAlertaSistema() {
    if(window.datosCriptoneura && window.datosCriptoneura.eventosPosibles) {
        const eventos = window.datosCriptoneura.eventosPosibles;
        let nuevoIndex;
        
        // No repite la misma alerta consecutivamente
        do {
            nuevoIndex = Math.floor(Math.random() * eventos.length);
        } while (nuevoIndex === ultimaAlertaIndex && eventos.length > 1);
        
        ultimaAlertaIndex = nuevoIndex;
        const e = eventos[nuevoIndex];
        
        const line = document.createElement('div');
        line.className = "terminal-line";
        line.innerHTML = `> <span style="color:var(--terminal-green)">[LIVE]</span> ${e.resumen}`;
        line.onclick = () => {
            document.getElementById('popup-text').innerText = e.detalle;
            document.getElementById('alert-popup').style.display = 'block';
        };
        
        if(term) {
            term.appendChild(line);
            if(term.childNodes.length > 50) term.removeChild(term.firstChild); 
            term.scrollTop = term.scrollHeight;
        }
    }
}

// 3. MOTOR DE DATOS (ORO, PLATA Y MERCADOS)
async function updateBinanceTerminal() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await res.json();
        
        const list = document.getElementById('top-list');
        const tickerEl = document.getElementById('ticker-api');
        
        if(tickerEl) tickerEl.innerText = `CRIPTONEURA v2.0 • CONEXIÓN ESTABLECIDA CON LOS NODOS • MODO REAL`;

        let htmlContent = "";
        let btcChange = 0;

        // --- LÓGICA CORREGIDA PARA ORO Y PLATA ---
        const paxgData = data.find(item => item.symbol === "PAXGUSDT");
        if(paxgData) {
            const precioOro = parseFloat(paxgData.lastPrice);
            // Actualiza ORO (SPOT)
            if(document.getElementById('val-oro')) document.getElementById('val-oro').innerText = "$" + precioOro.toLocaleString();
            // Calcula y actualiza PLATA (XAG) basándose en ratio de mercado (~84)
            if(document.getElementById('val-plata')) document.getElementById('val-plata').innerText = "$" + (precioOro / 84).toFixed(2);
        }

        simbolosTerminal.forEach(s => {
            const c = data.find(item => item.symbol === s);
            if(c) {
                let nombre = s.replace('USDT','');
                const precio = parseFloat(c.lastPrice);
                const pct = parseFloat(c.priceChangePercent).toFixed(2);
                const color = pct >= 0 ? 'var(--terminal-green)' : 'var(--danger)';
                
                if(s === "BTCUSDT") btcChange = parseFloat(pct);

                // Corrección nombre PAXG en tarjeta
                let nombreMostrado = (s === "PAXGUSDT") ? "ORO (PAXG)" : nombre;

                htmlContent += `
                    <div class="market-item" style="${s==='PAXGUSDT' ? 'border:1px solid #ffcc00' : ''}">
                        <div style="display:flex; justify-content:space-between;">
                            <span class="coin-symbol" style="${s==='PAXGUSDT'?'color:#ffcc00':''}">${nombreMostrado}</span>
                            <span style="color:${color}; font-weight:bold;">${pct}%</span>
                        </div>
                        <span class="coin-price">$${precio.toLocaleString()}</span>
                        <div style="font-size:0.8rem; color:#666; margin-top:10px;">
                            CLASE: ${s==='PAXGUSDT'?'METAL PRECIOSO':'ACTIVO CRIPTO'} <br>
                            VOL 24H: $${nFormat(c.quoteVolume)}
                        </div>
                    </div>`;
            }
        });
        
        if(list) list.innerHTML = htmlContent;

        // Actualizar datos macro desde noticias.js
        if(window.datosCriptoneura) {
            document.getElementById('val-dom').innerText = window.datosCriptoneura.dominanciaBTC;
            document.getElementById('val-hash').innerText = window.datosCriptoneura.hashrate;
            document.getElementById('val-dxy').innerText = window.datosCriptoneura.dxy;
            document.getElementById('manual-titulo').innerText = window.datosCriptoneura.tituloInforme;
            document.getElementById('manual-texto').innerText = window.datosCriptoneura.textoInforme;
        }

        // Riesgo y Luces
        let riesgo = Math.min(Math.max(Math.round(50 - (btcChange * 5)), 10), 99);
        document.getElementById('risk-fill').style.width = riesgo + "%";
        document.getElementById('risk-label').innerText = `RIESGO SISTÉMICO: ${riesgo}/100`;

        const dots = document.querySelectorAll('.dot');
        dots.forEach(d => d.className = 'dot');
        if(riesgo > 66) document.getElementById('dot-red').className = 'dot active-red';
        else if(riesgo > 33) document.getElementById('dot-yellow').className = 'dot active-yellow';
        else document.getElementById('dot-green').className = 'dot active-green';

    } catch(e) { console.log("Reintentando conexión..."); }
}

function updateClocks() {
    const opt = { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false };
    document.getElementById('ny').innerText = new Date().toLocaleTimeString('en-US', {timeZone:'America/New_York', ...opt});
    document.getElementById('ldn').innerText = new Date().toLocaleTimeString('en-GB', {timeZone:'Europe/London', ...opt});
    document.getElementById('hk').innerText = new Date().toLocaleTimeString('zh-HK', {timeZone:'Asia/Hong_Kong', ...opt});
}

window.onload = () => {
    updateClocks();
    updateBinanceTerminal();
    setInterval(updateClocks, 1000);
    setInterval(updateBinanceTerminal, 10000); 
    setInterval(generarAlertaSistema, 15000); 
};