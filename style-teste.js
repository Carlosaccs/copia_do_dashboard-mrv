alert("O JavaScript carregou com sucesso!");
// TESTE DE CARREGAMENTO
console.log("Script iniciado!");

const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqmzCyl1ScBsPr6d4wtq3tADya58_T9DVkhcUSDgmbwNwyZoc4tPrOMUrt8kB7UJH6tiHr_KVxfS2W/pub?output=csv";
let dadosGerais = [];

// Função de carregamento
async function carregarPlanilha() {
    try {
        const r = await fetch(LINK_PLANILHA);
        const t = await r.text();
        const linhas = t.split(/\r?\n/).filter(l => l.trim() !== "");
        dadosGerais = linhas.slice(1).map(l => {
            const c = l.split(/[,;]/);
            return {
                id: c[0]?.toLowerCase().trim(),
                nome: c[2]?.trim(),
                est: parseInt(c[3]) || 0,
                end: c[4]?.trim(),
                bai: c[5]?.trim(),
                prev: c[7]?.trim(),
                val: c[9]?.trim()
            };
        });
        console.log("Dados prontos!");
    } catch (e) { console.error("Erro na carga:", e); }
}

// Função para aplicar os cliques
function aplicarEventos() {
    const container = document.getElementById("mapa-area-container");
    const tituloSup = document.getElementById("nome-regiao");

    // CLIQUE NAS CAIXAS (Troca de lugar)
    document.querySelectorAll(".caixa-mapa").forEach(caixa => {
        caixa.addEventListener("click", function() {
            if (this.classList.contains("caixa-minimizada")) {
                const atualGrande = document.querySelector(".caixa-maximizada");
                
                // Troca física
                this.classList.replace("caixa-minimizada", "caixa-maximizada");
                atualGrande.classList.replace("caixa-maximizada", "caixa-minimizada");
                
                container.insertBefore(this, atualGrande);
                container.insertBefore(tituloSup, this);
            }
        });
    });

    // CLIQUE NOS PATHS (Cidades)
    document.querySelectorAll("path").forEach(p => {
        p.addEventListener("click", function(e) {
            if (this.closest(".caixa-minimizada")) return;
            if (!this.classList.contains("com-mrv")) return;

            e.stopPropagation(); // Não deixa a caixa trocar de lugar
            
            // Destaque visual
            document.querySelectorAll("path").forEach(x => x.classList.remove("ativo"));
            this.classList.add("ativo");

            // Mostrar botões
            mostrarResidenciais(this.id);
        });
    });
}

function mostrarResidenciais(cidadeId) {
    const lista = document.getElementById("btRes-container");
    const filtrados = dadosGerais.filter(d => d.id === cidadeId);
    
    lista.innerHTML = "";
    document.getElementById("titulo-dinamico").textContent = "MRV em " + cidadeId.toUpperCase();

    filtrados.forEach(res => {
        const cor = (res.est > 0 && res.est <= 5) ? "red" : "black";
        const btn = document.createElement("button");
        btn.className = "btRes";
        btn.innerHTML = `<strong>${res.nome}</strong> - <span style="color:${cor}">restam ${res.est} un.</span>`;
        
        btn.onclick = () => {
            document.getElementById("residencial-info").innerHTML = `
                <h3>${res.nome}</h3>
                <p>📍 ${res.end} - ${res.bai}</p>
                <p>💰 Valor: ${res.val}</p>
                <p>🔑 Entrega: ${res.prev}</p>
            `;
        };
        lista.appendChild(btn);
    });
}

// Iniciar tudo
carregarPlanilha().then(() => aplicarEventos());
