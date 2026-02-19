// 1. LINK DA SUA PLANILHA PUBLICADA (CSV)
const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqmzCyl1ScBsPr6d4wtq3tADya58_T9DVkhcUSDgmbwNwyZoc4tPrOMUrt8kB7UJH6tiHr_KVxfS2W/pub?output=csv";

let dadosGerais = [];
let pathSelecionado = null;
const corVerde = "rgb(6, 94, 3)";
const corLaranja = "rgb(255, 153, 0)";

const mapPathToName = {
    ipiranga: "Ipiranga", saomateus: "São Mateus", guarulhos: "Guarulhos",
    vilaprudente: "Vila Prudente", ermelimdomatarazzo: "Ermelino Matarazzo",
    itaquera: "Itaquera", itaim: "Itaim", pirituba: "Pirituba", lapa: "Lapa",
    vilamaria: "Vila Maria", cidadeademar: "Cidade Ademar", osasco: "Osasco",
    vargemgrande: "Vargem Grande Paulista", mogidascruzes: "Mogi das Cruzes",
    socorro: "Socorro", suzano: "Suzano", itaquaquecetuba: "Itaquaquecetuba",
    taubate: "Taubaté", saojosedoscampos: "São José dos Campos"
};

function parseCSVLine(line, separator) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === separator && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else cur += char;
    }
    result.push(cur.trim());
    return result;
}

async function carregarDados() {
    try {
        const resposta = await fetch(LINK_PLANILHA, { mode: 'cors' });
        const texto = await resposta.text();
        const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");
        
        const separador = linhas[0].includes(';') ? ';' : ',';

        dadosGerais = linhas.slice(1).map(linha => {
            const col = parseCSVLine(linha, separador);
            const limpar = (t) => t ? t.replace(/^["']|["']$/g, '').trim() : '';
            const idFormatado = col[0] ? col[0].toLowerCase().trim() : '';

            return {
                idCidade:     idFormatado,
                regiaoNome:   limpar(col[1]),
                btNome:       limpar(col[2]),
                estoque:      limpar(col[3]),
                endereco:     limpar(col[4]),
                bairro:       limpar(col[5]),
                cidade:       limpar(col[6]),
                previsao:     limpar(col[7]),
                // RECALIBRADO:
                valor:        limpar(col[9]),   // O valor está na coluna J (9)
                plantas:      `de ${limpar(col[10])} até ${limpar(col[11])}`, // Metragens na K(10) e L(11)
                obraStatus:   limpar(col[12]),  // % Obra na M(12)
                localizacao:  limpar(col[13]),  // Localização na N(13)
                mobilidade:   limpar(col[14]),  
                cultura:      limpar(col[15]),  
                comercio:     limpar(col[16]),  
                saude:        limpar(col[17])   
            };
        }).filter(item => item.idCidade !== "");
    } catch (e) { console.error("Erro:", e); }
}

function gerarBotoes(pathId) {
    const container = document.getElementById("btRes-container");
    const infoBox = document.getElementById("residencial-info");
    const tituloDinamico = document.getElementById("titulo-dinamico");

    container.innerHTML = "";
    infoBox.innerHTML = "<em>Clique em um residencial para ver detalhes.</em>";

    const filtrados = dadosGerais.filter(d => d.idCidade === pathId);

    if (filtrados.length > 0) {
        tituloDinamico.textContent = `MRV em ${filtrados[0].regiaoNome}`;
    } else {
        tituloDinamico.textContent = `MRV em ${mapPathToName[pathId] || pathId}`;
        container.innerHTML = "<p>Nenhum residencial cadastrado.</p>";
        return;
    }

    filtrados.forEach(res => {
        const btn = document.createElement("button");
        btn.className = "btRes";
        let status = (res.estoque === "0" || res.estoque?.toLowerCase() === "vendido") ? "VENDIDO" : `${res.estoque} un.`;
        btn.innerHTML = `<strong>${res.btNome}</strong> - ${status}`;
        
        btn.onclick = () => {
            document.querySelectorAll(".btRes").forEach(b => b.classList.remove("btRes-ativo"));
            btn.classList.add("btRes-ativo");
            infoBox.innerHTML = `
                <h3 style="color: rgb(6, 94, 3); margin-bottom: 5px;">${res.btNome}</h3>
                <p style="font-size: 0.85em; color: #666; margin-bottom: 12px;">📍 ${res.endereco} - ${res.bairro}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; font-size: 0.9em;">
                    <div><strong>🔑 Entrega:</strong><br>${res.previsao}</div>
                    <div><strong>💰 Valor:</strong><br>${res.valor}</div>
                    <div><strong>📐 Plantas:</strong><br>${res.plantas}</div>
                    <div><strong>🏗️ Evolução da obra:</strong><br>${res.obraStatus}</div>
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 10px; font-size: 0.82em; line-height: 1.4;">
                    <p style="margin: 4px 0;">📍 <strong>Localização:</strong> ${res.localizacao || 'Consultar'}</p>
                    <p style="margin: 4px 0;">🚲 <strong>Mobilidade:</strong> ${res.mobilidade || 'Consultar'}</p>
                    <p style="margin: 4px 0;">🎭 <strong>Cultura e Lazer:</strong> ${res.cultura || 'Consultar'}</p>
                    <p style="margin: 4px 0;">🛒 <strong>Comércio Local:</strong> ${res.comercio || 'Consultar'}</p>
                    <p style="margin: 4px 0;">🏥 <strong>Saúde e Educação:</strong> ${res.saude || 'Consultar'}</p>
                </div>
            `;
        };
        container.appendChild(btn);
    });
}

function configurarEventos() {
    const displayTexto = document.getElementById("nome-regiao");
    document.querySelectorAll("path").forEach(path => {
        path.addEventListener("mouseenter", () => {
            if (!path.closest(".caixa-minimizada")) {
                displayTexto.textContent = mapPathToName[path.id] || path.id;
                if (path.classList.contains("com-mrv") && path !== pathSelecionado) path.style.fill = corLaranja;
            }
        });
        path.addEventListener("mouseleave", () => {
            if (!path.closest(".caixa-minimizada")) {
                displayTexto.textContent = "Passe o mouse sobre uma região";
                if (path.classList.contains("com-mrv") && path !== pathSelecionado) path.style.fill = corVerde;
            }
        });
        path.addEventListener("click", (e) => {
            if (path.closest(".caixa-minimizada") || !path.classList.contains("com-mrv")) return;
            e.stopPropagation();
            if (pathSelecionado) {
                pathSelecionado.classList.remove("ativo");
                pathSelecionado.style.fill = corVerde;
            }
            pathSelecionado = path;
            path.classList.add("ativo");
            path.style.fill = corLaranja;
            gerarBotoes(path.id);
        });
    });

    document.querySelectorAll(".caixa-mapa").forEach(caixa => {
        caixa.onclick = () => {
            if (caixa.classList.contains("caixa-minimizada")) {
                const outra = document.querySelector(".caixa-maximizada");
                caixa.classList.replace("caixa-minimizada", "caixa-maximizada");
                outra.classList.replace("caixa-maximizada", "caixa-minimizada");
                pathSelecionado = null;
                document.getElementById("titulo-dinamico").textContent = "";
                document.getElementById("btRes-container").innerHTML = "";
                document.getElementById("residencial-info").innerHTML = "";
                document.querySelectorAll("path").forEach(p => p.style.fill = "");
            }
        };
    });
}

window.onload = async () => {
    await carregarDados();
    configurarEventos();
};


