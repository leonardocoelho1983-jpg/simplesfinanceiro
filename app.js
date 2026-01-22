// ============ DADOS GLOBAIS ============
let CATEGORIES = {
    RECEITAS: [
        { id: 'rendaFamiliar', name: 'Renda Familiar' },
        { id: 'gabiAlimentacao', name: 'Gabi Alimentação' },
        { id: 'leoAlimentacao', name: 'Leo Alimentação' },
        { id: 'leoAuxEscola', name: 'Leo Auxílio Escola' },
    ],
    DESPESAS: [
        { id: 'carroFamilia', name: 'Carro Família' },
        { id: 'motoGabi', name: 'Moto Gabi' },
        { id: 'condominio', name: 'Condomínio' },
        { id: 'prestacaoCasa', name: 'Prestação Casa' },
        { id: 'agua', name: 'Água' },
        { id: 'ceg', name: 'CEG' },
        { id: 'iptuTaquara', name: 'IPTU Taquara' },
        { id: 'escolaJoao', name: 'Escola João' },
        { id: 'escolaMariaClara', name: 'Escola Maria Clara' },
        { id: 'seguroGrandSiena', name: 'Seguro Grand Siena' },
        { id: 'seguroMotoNMAX', name: 'Seguro Moto NMAX' },
        { id: 'cittaInternet', name: 'Citta Internet' },
        { id: 'uniTV', name: 'UniTV' },
        { id: 'combustivel', name: 'Combustível' },
        { id: 'mercado', name: 'Mercado' },
        { id: 'faxineiraAna', name: 'Faxineira Ana' },
        { id: 'futebolJoao', name: 'Futebol João' },
        { id: 'meliMais', name: 'MeliMais' },
        { id: 'planoDeSaude', name: 'Plano de Saúde' },
        { id: 'feiraFrutasLegumes', name: 'Feira Frutas e Legumes' },
        { id: 'remedioAlektos', name: 'Remédio Alektos' },
        { id: 'smartFit', name: 'SmartFit' },
        { id: 'gabiDinheiroLivre', name: 'Gabi Dinheiro Livre' },
        { id: 'emprestimoCAIXA', name: 'Empréstimo CAIXA' },
    ],
    CARTOES: [
        { id: 'bradesco', name: 'Cartão Bradesco' },
        { id: 'nubank', name: 'Cartão Nubank' },
        { id: 'mercadopago', name: 'Cartão MercadoPago' },
        { id: 'santanderLeo', name: 'Cartão Santander Leo' },
        { id: 'carrefour', name: 'Cartão Carrefour' },
    ]
};

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

let appData = {
    previsaoAnual: {},
    meses: {},
    categories: JSON.parse(JSON.stringify(CATEGORIES))
};

// ============ SALVAR/CARREGAR DADOS ============
function saveData() {
    localStorage.setItem('appData', JSON.stringify(appData));
}

function loadDataFromLocalStorage() {
    const data = localStorage.getItem('appData');
    if (data) {
        appData = JSON.parse(data);
    } else {
        // Inicializar dados vazios
        CATEGORIES.RECEITAS.forEach(cat => {
            appData.previsaoAnual[cat.id] = 0;
        });
        CATEGORIES.DESPESAS.forEach(cat => {
            appData.previsaoAnual[cat.id] = 0;
        });
        CATEGORIES.CARTOES.forEach(card => {
            appData.previsaoAnual[card.id] = [];
        });
        appData.previsaoAnual.investimento = 0;
        
        for (let i = 0; i < 12; i++) {
            appData.meses[`mes_${i}`] = { isInitialized: false, receitas: {}, despesas: {}, cartoes: {}, investimento: {} };
        }
        saveData();
    }
}

// ============ RENDERIZAR PREVISÃO ANUAL ============
function renderPrevisao() {
    const container = document.getElementById('previsao-content');
    container.innerHTML = '';

    let html = `<div class="row">
        <div class="col-md-6"><div class="category-section card">
            <div class="card-body">
                <h3 class="card-title text-success">Receitas Anuais</h3>`;

    CATEGORIES.RECEITAS.forEach(cat => {
        const value = appData.previsaoAnual[cat.id] || 0;
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="previsao-${cat.id}"
                       data-id="${cat.id}"
                       value="${parseFloat(value).toFixed(2)}" step="0.01" class="form-control w-auto text-end">
            </div>`;
    });

    html += `</div></div></div>`;

    html += `<div class="col-md-6"><div class="category-section card">
            <div class="card-body">
                <h3 class="card-title text-danger">Despesas Anuais</h3>`;

    CATEGORIES.DESPESAS.forEach(cat => {
        const value = appData.previsaoAnual[cat.id] || 0;
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="previsao-${cat.id}"
                       data-id="${cat.id}"
                       value="${parseFloat(value).toFixed(2)}" step="0.01" class="form-control w-auto text-end">
            </div>`;
    });

    html += `</div></div></div></div>`;

    // Cartões
    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card">
                <div class="card-body">
                    <h3 class="card-title text-primary">Cartões de Crédito</h3>`;

    CATEGORIES.CARTOES.forEach(card => {
        const items = appData.previsaoAnual[card.id] || [];
        html += `<h5 class="mt-3">${card.name}</h5>`;
        items.forEach((item, idx) => {
            html += `
            <div class="card-item mb-2 p-2 border rounded" style="background: #f9f9f9;">
                <div class="row g-2 align-items-center">
                    <div class="col-md-4">
                        <small>${item.descricao || 'Item'}</small>
                    </div>
                    <div class="col-md-2">
                        <small>${item.parcelas || 'À vista'}</small>
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control form-control-sm" 
                               id="previsao-${card.id}-${idx}-valor"
                               value="${(item.valor || 0).toFixed(2)}" step="0.01">
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-sm btn-danger" onclick="removeCardItem('${card.id}', ${idx}, 'previsao')">Remover</button>
                    </div>
                </div>
            </div>`;
        });
        html += `<button class="btn btn-sm btn-primary mt-2" onclick="addCardItem('${card.id}', 'previsao')">+ Item</button>`;
    });

    html += `</div></div></div></div>`;

    // Investimento
    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card">
                <div class="card-body">
                    <h3 class="card-title">Investimento Anual</h3>
                    <div class="item-row d-flex justify-content-between align-items-center">
                        <label for="previsao-investimento" class="form-label mb-0">Valor</label>
                        <input type="number" id="previsao-investimento"
                               value="${(appData.previsaoAnual.investimento || 0).toFixed(2)}" step="0.01" class="form-control w-auto text-end">
                    </div>
                </div>
            </div></div></div>`;

    // Total Anual
    const totalDespesas = CATEGORIES.DESPESAS.reduce((sum, cat) => sum + (appData.previsaoAnual[cat.id] || 0), 0);
    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card">
                <div class="card-body">
                    <h3 class="card-title text-info">Total Anual (Confirmados)</h3>
                    <div class="item-row d-flex justify-content-between mb-2">
                        <span>Total de Despesas do Ano:</span>
                        <strong style="font-size: 1.3em; color: #dc3545;">R$ ${totalDespesas.toFixed(2)}</strong>
                    </div>
                </div>
            </div></div></div>`;

    // Botões
    html += `<div class="row mt-3">
                <div class="col-12">
                    <button id="save-previsao" class="btn btn-success w-100">Salvar Previsão</button>
                </div>
            </div>`;

    container.innerHTML = html;

    // Listeners
    container.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('change', e => {
            const id = e.target.id;
            const catId = e.target.dataset.id;
            
            if (id.includes('investimento')) {
                appData.previsaoAnual.investimento = parseFloat(e.target.value) || 0;
            } else if (id.includes('valor')) {
                const parts = id.split('-');
                const cardId = parts[1];
                const idx = parseInt(parts[2]);
                appData.previsaoAnual[cardId][idx].valor = parseFloat(e.target.value) || 0;
            } else if (catId) {
                appData.previsaoAnual[catId] = parseFloat(e.target.value) || 0;
            }
        });
    });

    document.getElementById('save-previsao').addEventListener('click', () => {
        saveData();
        alert('✅ Previsão salva com sucesso!');
    });
}

function addCardItem(cardId, type) {
    const newItem = { descricao: '', parcelas: '', valor: 0, confirmado: false };
    if (type === 'previsao') {
        appData.previsaoAnual[cardId].push(newItem);
    }
    saveData();
    renderPrevisao();
}

function removeCardItem(cardId, idx, type) {
    if (type === 'previsao') {
        appData.previsaoAnual[cardId].splice(idx, 1);
    }
    saveData();
    renderPrevisao();
}

// ============ INICIALIZAR ============
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    renderPrevisao();

    document.getElementById('btn-previsao').addEventListener('click', () => {
        renderPrevisao();
    });

    MONTHS.forEach((month, idx) => {
        const monthNames = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        const btn = document.getElementById(`btn-${monthNames[idx]}`);
        if (btn) {
            btn.addEventListener('click', () => {
                alert('Funcionalidade de meses em desenvolvimento');
            });
        }
    });
});
