const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqmzCyl1ScBsPr6d4wtq3tADya58_T9DVkhcUSDgmbwNwyZoc4tPrOMUrt8kB7UJH6tiHr_KVxfS2W/pub?output=csv";

let dadosGerais = [];
let pathSelecionado = null;

async function carregarDados() {
    console.log("Tentando carregar planilha...");
    try {
        const resposta = await fetch(LINK_PLANILHA);
        const texto = await resposta.text();
        const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");
        dadosGerais = linhas.slice(1).map(linha => {
            const col = linha.split(/[,;]/); 
            return {
                idCidade: col[0]?.toLowerCase().trim(),
                regiaoNome: col[1]?.trim(),
                btNome: col[2]?.trim(),
                estoque: col[3]?.trim(),
                endereco: col[4]?.trim(),
                bairro: col[5]?.trim(),
                previsao: col[7]?.trim(),
                valor: col[9]?.trim()
            };
        }).filter(item => item.idCidade);
        console.log("Dados carregados com sucesso:", dadosGerais.length, "itens.");
    } catch (e) { console.error("Erro na planilha:", e); }
}

function iniciarDashboard() {
    console.log("Iniciando eventos de clique...");
    const container = document.getElementById("mapa-area-container");
    const tituloSuperior = document.getElementById("nome-regiao");

    // 1. EVENTO DE TROCA DE MAPAS (CLIQUE NA CAIXA)
    document.querySelectorAll(".caixa-mapa").forEach(caixa => {
        caixa.style.cursor = "pointer"; // Garante que o mouse mostre que é clicável
        caixa.onclick = function() {
            if (this.classList.contains("caixa-minimizada")) {
                console.log("Trocando mapas...");
                const maximizadaAtual = document.querySelector(".caixa-maximizada");
                
                this.classList.replace("caixa-minimizada", "caixa-maximizada");
                maximizadaAtual.classList.replace("caixa-maximizada", "caixa-minimizada");

                // Reordena no HTML
                container.insertBefore(this, maximizadaAtual);
                container.insertBefore(tituloSuperior, this);
                
                limparSelecao();
            }
        };
    });

    // 2. EVENTO DE CLIQUE NOS MUNICÍPIOS (PATHS)
    document.querySelectorAll("path").forEach(path => {
        path.onclick = function(e) {
            // Se o mapa estiver pequeno, não faz nada com o path
            if (this.closest(".caixa-minimizada")) return;
            
            // Só age se tiver a classe com-mrv
            if (!this.classList.contains("com-mrv")) {
                console.log("Clique em região sem MRV:", this.id);
                return;
            }

            e.stopPropagation(); // Impede de disparar o clique na caixa pai
            console.log("Cidade selecionada:", this.id);

            if (pathSelecionado) pathSelecionado.classList.remove("ativo");
            pathSelecionado = this;
            this.classList.add("ativo");
            
            // Atualiza o texto do mouse (opcional)
            tituloSuperior.textContent = (this.id).toUpperCase();
            
            gerarBotoes(this.id);
        };
    });
}

function limparSelecao() {
    document.querySelectorAll("path").forEach(p => p.classList.remove("ativo"));
    document.getElementById("btRes-container").innerHTML = "";
    document.getElementById("titulo-dinamico").textContent = "";
    document.getElementById("residencial-info").innerHTML = "";
    pathSelecionado = null;
}

function gerarBotoes(pathId) {
    const container = document.getElementById("btRes-container");
    const filtrados = dadosGerais.filter(d => d.idCidade === pathId);
    
    container.innerHTML = "";
    document.getElementById("titulo-dinamico").textContent = `MRV em ${pathId.toUpperCase()}`;

    if(filtrados.length === 0) {
        container.innerHTML = "<p>Nenhum dado encontrado para esta ID no CSV.</p>";
        return;
    }

    filtrados.forEach(res => {
        const btn = document.createElement("button");
        btn.className = "btRes";
        let estNum = parseInt(res.estoque) || 0;
        let corEst = estNum <= 5 ? "red" : "black";
        
        btn.innerHTML = `<strong>${res.btNome}</strong> - <span style="color:${corEst}">${res.estoque} un.</span>`;
        
        btn.onclick = () => {
            document.querySelectorAll(".btRes").forEach(b => b.classList.remove("btRes-ativo"));
            btn.classList.add("btRes-ativo");
            document.getElementById("residencial-info").innerHTML = `
                <h3 style="color:rgb(6,94,3)">${res.btNome}</h3>
                <p>📍 ${res.endereco} - ${res.bairro}</p>
                <p>💰 Valor: ${res.valor}</p>
                <p>🔑 Entrega: ${res.previsao}</p>
            `;
        };
        container.appendChild(btn);
    });
}

// EXECUÇÃO INICIAL
window.onload = async () => {
    await carregarDados();
    iniciarDashboard();
};
