const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqmzCyl1ScBsPr6d4wtq3tADya58_T9DVkhcUSDgmbwNwyZoc4tPrOMUrt8kB7UJH6tiHr_KVxfS2W/pub?output=csv";

let dadosGerais = [];
let pathSelecionado = null;

async function carregarDados() {
    try {
        const resposta = await fetch(LINK_PLANILHA);
        const texto = await resposta.text();
        const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");
        dadosGerais = linhas.slice(1).map(linha => {
            const col = linha.split(/[,;]/); // Suporta vírgula ou ponto-e-vírgula
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
    } catch (e) { console.error("Erro planilha:", e); }
}

function configurarTrocaDeMapas() {
    const container = document.getElementById("mapa-area-container");
    const titulo = document.getElementById("nome-regiao");

    document.querySelectorAll(".caixa-mapa").forEach(caixa => {
        caixa.onclick = (e) => {
            // Só troca se clicar na caixa que está pequena
            if (caixa.classList.contains("caixa-minimizada")) {
                const maximizadaAtual = document.querySelector(".caixa-maximizada");

                // Troca as classes
                caixa.classList.replace("caixa-minimizada", "caixa-maximizada");
                maximizadaAtual.classList.replace("caixa-maximizada", "caixa-minimizada");

                // Move FISICAMENTE no HTML
                // 1. Garante o título no topo
                container.appendChild(titulo);
                // 2. Coloca a caixa clicada (agora grande) logo abaixo do título
                container.insertBefore(caixa, maximizadaAtual);
                
                // Limpa seleções anteriores
                limparSelecao();
            }
        };
    });
}

function limparSelecao() {
    document.querySelectorAll("path").forEach(p => {
        p.classList.remove("ativo");
    });
    document.getElementById("btRes-container").innerHTML = "";
    document.getElementById("titulo-dinamico").textContent = "";
    document.getElementById("residencial-info").innerHTML = "";
    pathSelecionado = null;
}

function configurarCliquesNosCaminhos() {
    document.querySelectorAll("path").forEach(path => {
        path.onclick = (e) => {
            // Se o mapa estiver minimizado, não deixa clicar nos residenciais
            if (path.closest(".caixa-minimizada")) return;
            if (!path.classList.contains("com-mrv")) return;
            
            e.stopPropagation(); // Impede que o clique no path dispare o clique na caixa

            if (pathSelecionado) pathSelecionado.classList.remove("ativo");
            pathSelecionado = path;
            path.classList.add("ativo");

            gerarBotoes(path.id);
        };
    });
}

function gerarBotoes(pathId) {
    const container = document.getElementById("btRes-container");
    const filtrados = dadosGerais.filter(d => d.idCidade === pathId);
    
    container.innerHTML = "";
    document.getElementById("titulo-dinamico").textContent = `MRV em ${pathId.toUpperCase()}`;

    filtrados.forEach(res => {
        const btn = document.createElement("button");
        btn.className = "btRes";
        
        let est = parseInt(res.estoque) || 0;
        let corEstoque = est <= 5 ? "red" : "black";
        
        btn.innerHTML = `<strong>${res.btNome}</strong> - <span style="color:${corEstoque}">${est} un.</span>`;
        
        btn.onclick = () => {
            document.querySelectorAll(".btRes").forEach(b => b.classList.remove("btRes-ativo"));
            btn.classList.add("btRes-ativo");
            document.getElementById("residencial-info").innerHTML = `
                <h3>${res.btNome}</h3>
                <p>📍 ${res.endereco} - ${res.bairro}</p>
                <p>💰 Valor: ${res.valor}</p>
                <p>🔑 Entrega: ${res.previsao}</p>
            `;
        };
        container.appendChild(btn);
    });
}

window.onload = async () => {
    await carregarDados();
    configurarTrocaDeMapas();
    configurarCliquesNosCaminhos();
};
