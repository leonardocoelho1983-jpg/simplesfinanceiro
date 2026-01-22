// ==================== VARIÁVEIS GLOBAIS ====================
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

let currentActiveMonthIndex = null;
let isOnline = navigator.onLine;

// ==================== INDICADOR DE CONEXÃO ====================
function updateConnectionStatus() {
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('connection-status-text');
    
    if (!indicator || !statusText) return;
    
    if (isOnline) {
        indicator.style.backgroundColor = '#28a745';
        statusText.textContent = '🟢 Online';
        indicator.title = 'Conectado';
    } else {
        indicator.style.backgroundColor = '#dc3545';
        statusText.textContent = '🔴 Offline';
        indicator.title = 'Sem conexão';
    }
}

window.addEventListener('online', () => {
    isOnline = true;
    updateConnectionStatus();
    console.log('✅ Online');
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateConnectionStatus();
    console.log('❌ Offline');
});

// ==================== LOCAL STORAGE ====================
function loadDataFromLocalStorage() {
    const stored = localStorage.getItem('controleFinanceiroData');
    if (stored) {
        try {
            appData = JSON.parse(stored);
            CATEGORIES = appData.categories || CATEGORIES;
            console.log('✅ Dados carregados do localStorage');
        } catch (e) {
            console.error('Erro ao carregar:', e);
            initializeData();
        }
    } else {
        initializeData();
    }
}

function saveData() {
    appData.categories = CATEGORIES;
    localStorage.setItem('controleFinanceiroData', JSON.stringify(appData));
    console.log('✅ Dados salvos');
}

function initializeData() {
    appData.categories = JSON.parse(JSON.stringify(CATEGORIES));
    CATEGORIES.RECEITAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.DESPESAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.CARTOES.forEach(c => appData.previsaoAnual[c.id] = []);
    appData.previsaoAnual.investimento = 0;

    MONTHS.forEach((_, i) => {
        const key = `mes_${i}`;
        appData.meses[key] = {
            isInitialized: false,
            receitas: {},
            despesas: {},
            cartoes: {},
            investimento: { valor: 0, confirmado: false }
        };
    });
    saveData();
}

// ==================== PROPAGAR PREVISÃO ====================
function propagatePrevisaoToMonths() {
    MONTHS.forEach((_, i) => {
        const key = `mes_${i}`;
        const month = appData.meses[key];

        CATEGORIES.RECEITAS.forEach(cat => {
            if (!month.receitas[cat.id]) {
                month.receitas[cat.id] = { valor: 0, confirmado: false };
            }
            month.receitas[cat.id].valor = appData.previsaoAnual[cat.id] || 0;
        });

        CATEGORIES.DESPESAS.forEach(cat => {
            if (!month.despesas[cat.id]) {
                month.despesas[cat.id] = { valor: 0, confirmado: false };
            }
            month.despesas[cat.id].valor = appData.previsaoAnual[cat.id] || 0;
        });

        CATEGORIES.CARTOES.forEach(card => {
            month.cartoes[card.id] = (appData.previsaoAnual[card.id] || []).map(it => ({
                ...it,
                confirmado: false
            }));
        });

        month.investimento = { valor: appData.previsaoAnual.investimento || 0, confirmado: false };
    });
    saveData();
}

// ==================== EDITAR CATEGORIAS ====================
function renderEditCategoriesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'editCategoriesModal';
    modal.setAttribute('tabindex', '-1');
    
    let html = `<div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Editar Categorias</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body" style="max-height: 70vh; overflow-y: auto;">`;

    html += `<h6 class="text-success mb-3">Receitas</h6>`;
    CATEGORIES.RECEITAS.forEach((cat, idx) => {
        html += `<div class="input-group mb-2"><input type="text" class="form-control edit-category-input" data-type="RECEITAS" data-index="${idx}" value="${cat.name}"><button class="btn btn-danger btn-sm remove-category-btn" data-type="RECEITAS" data-index="${idx}">Remover</button></div>`;
    });
    html += `<button class="btn btn-sm btn-success mb-3 add-category-btn" data-type="RECEITAS">+ Adicionar Receita</button>`;

    html += `<h6 class="text-danger mb-3">Despesas</h6>`;
    CATEGORIES.DESPESAS.forEach((cat, idx) => {
        html += `<div class="input-group mb-2"><input type="text" class="form-control edit-category-input" data-type="DESPESAS" data-index="${idx}" value="${cat.name}"><button class="btn btn-danger btn-sm remove-category-btn" data-type="DESPESAS" data-index="${idx}">Remover</button></div>`;
    });
    html += `<button class="btn btn-sm btn-danger mb-3 add-category-btn" data-type="DESPESAS">+ Adicionar Despesa</button>`;

    html += `<h6 class="text-primary mb-3">Cartões</h6>`;
    CATEGORIES.CARTOES.forEach((cat, idx) => {
        html += `<div class="input-group mb-2"><input type="text" class="form-control edit-category-input" data-type="CARTOES" data-index="${idx}" value="${cat.name}"><button class="btn btn-danger btn-sm remove-category-btn" data-type="CARTOES" data-index="${idx}">Remover</button></div>`;
    });
    html += `<button class="btn btn-sm btn-primary add-category-btn" data-type="CARTOES">+ Adicionar Cartão</button>`;

    html += `</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button type="button" class="btn btn-primary save-categories-btn">Salvar</button></div></div></div>`;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    modal.querySelectorAll('.edit-category-input').forEach(inp => {
        inp.addEventListener('change', e => {
            const type = e.target.dataset.type;
            const idx = parseInt(e.target.dataset.index);
            CATEGORIES[type][idx].name = e.target.value;
        });
    });

    modal.querySelectorAll('.remove-category-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const type = e.target.dataset.type;
            const idx = parseInt(e.target.dataset.index);
            CATEGORIES[type].splice(idx, 1);
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            setTimeout(() => {
                document.getElementById('editCategoriesModal').remove();
                renderEditCategoriesModal();
                new bootstrap.Modal(document.getElementById('editCategoriesModal')).show();
            }, 300);
        });
    });

    modal.querySelectorAll('.add-category-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const type = e.target.dataset.type;
            const newId = `custom_${Date.now()}`;
            const newName = `Nova ${type.slice(0, -1)}`;
            CATEGORIES[type].push({ id: newId, name: newName });
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            setTimeout(() => {
                document.getElementById('editCategoriesModal').remove();
                renderEditCategoriesModal();
                new bootstrap.Modal(document.getElementById('editCategoriesModal')).show();
            }, 300);
        });
    });

    modal.querySelector('.save-categories-btn').addEventListener('click', () => {
        saveData();
        propagatePrevisaoToMonths();
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        renderPrevisao();
        alert('✅ Categorias atualizadas!');
    });

    return modal;
}

// ==================== RENDERIZAR PREVISÃO ====================
function renderPrevisao() {
    const container = document.getElementById('previsao-content');
    if (!container) return;
    container.innerHTML = '';

    let html = `<div class="row"><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-success">Receitas Anuais</h3>`;
    CATEGORIES.RECEITAS.forEach(cat => {
        const val = appData.previsaoAnual[cat.id] || 0;
        html += `<div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label><input type="number" id="previsao-${cat.id}" data-id="${cat.id}" value="${val.toFixed(2)}" step="0.01" class="form-control w-auto text-end previsao-input"></div>`;
    });
    html += `</div></div></div><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-danger">Despesas Anuais</h3>`;
    CATEGORIES.DESPESAS.forEach(cat => {
        const val = appData.previsaoAnual[cat.id] || 0;
        html += `<div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label><input type="number" id="previsao-${cat.id}" data-id="${cat.id}" value="${val.toFixed(2)}" step="0.01" class="form-control w-auto text-end previsao-input"></div>`;
    });
    html += `</div></div></div></div>`;

    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card"><div class="card-body"><h3 class="card-title text-primary">Cartões</h3>`;
    CATEGORIES.CARTOES.forEach(card => {
        const items = appData.previsaoAnual[card.id] || [];
        html += `<h5 class="mt-3">${card.name}</h5>`;
        items.forEach((item, idx) => {
            html += `<div class="card-item mb-2 p-2 border rounded" style="background: #f9f9f9;"><div class="row g-2"><div class="col-md-4"><input type="text" class="form-control form-control-sm" id="previsao-${card.id}-${idx}-descricao" placeholder="Descrição" value="${item.descricao || ''}"></div><div class="col-md-2"><input type="text" class="form-control form-control-sm" id="previsao-${card.id}-${idx}-parcelas" placeholder="Parcelas" value="${item.parcelas || ''}"></div><div class="col-md-3"><input type="number" class="form-control form-control-sm" id="previsao-${card.id}-${idx}-valor" placeholder="Valor" value="${(item.valor || 0).toFixed(2)}" step="0.01"></div><div class="col-md-3"><button class="btn btn-sm btn-danger remove-card-item-btn" data-card-id="${card.id}" data-item-index="${idx}">Remover</button></div></div></div>`;
        });
        html += `<button class="btn btn-sm btn-outline-primary add-card-item-btn mb-3" data-card-id="${card.id}">+ Item</button>`;
    });
    html += `</div></div></div></div>`;

    const inv = appData.previsaoAnual.investimento || 0;
    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card"><div class="card-body"><h3 class="card-title text-success">Investimento Anual</h3><div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="previsao-investimento" class="form-label mb-0">Valor</label><input type="number" id="previsao-investimento" data-id="investimento" value="${inv.toFixed(2)}" step="0.01" class="form-control w-auto text-end previsao-input"></div></div></div></div></div>`;

    html += `<div class="row mt-3"><div class="col-12"><button id="save-previsao" class="btn btn-success w-100 mb-2">Salvar Previsão</button><button id="edit-categories-btn" class="btn btn-info w-100 mb-2">✏️ Editar Categorias</button><button id="clear-previsao" class="btn btn-danger w-100">Limpar</button></div></div>`;

    container.innerHTML = html;

    container.querySelectorAll('.previsao-input').forEach(inp => {
        inp.addEventListener('change', e => {
            const id = e.target.dataset.id;
            appData.previsaoAnual[id] = parseFloat(e.target.value) || 0;
            saveData();
        });
    });

    container.querySelectorAll('.add-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            appData.previsaoAnual[cardId].push({ descricao: '', parcelas: '', valor: 0, confirmado: false });
            saveData();
            renderPrevisao();
        });
    });

    container.querySelectorAll('.remove-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            const idx = parseInt(e.target.dataset.itemIndex);
            appData.previsaoAnual[cardId].splice(idx, 1);
            saveData();
            renderPrevisao();
        });
    });

    container.querySelectorAll('.card-item input').forEach(inp => {
        inp.addEventListener('change', e => {
            const parts = e.target.id.split('-');
            const cardId = parts[1];
            const idx = parseInt(parts[2]);
            const field = parts[3];
            const item = appData.previsaoAnual[cardId][idx];
            if (field === 'descricao') item.descricao = e.target.value;
            else if (field === 'parcelas') item.parcelas = e.target.value;
            else item[field] = parseFloat(e.target.value) || 0;
            saveData();
        });
    });

    document.getElementById('save-previsao').addEventListener('click', () => {
        propagatePrevisaoToMonths();
        alert('✅ Previsão salva!');
    });

    document.getElementById('edit-categories-btn').addEventListener('click', () => {
        const modal = renderEditCategoriesModal();
        new bootstrap.Modal(modal).show();
    });

    document.getElementById('clear-previsao').addEventListener('click', () => {
        if (confirm('Limpar tudo?')) {
            CATEGORIES.RECEITAS.forEach(c => appData.previsaoAnual[c.id] = 0);
            CATEGORIES.DESPESAS.forEach(c => appData.previsaoAnual[c.id] = 0);
            CATEGORIES.CARTOES.forEach(c => appData.previsaoAnual[c.id] = []);
            appData.previsaoAnual.investimento = 0;
            saveData();
            renderPrevisao();
        }
    });
}

// ==================== CALCULAR SOMATÓRIOS ====================
function calculateYearlyTotal() {
    let totalDespesas = 0;
    MONTHS.forEach((_, i) => {
        const key = `mes_${i}`;
        const month = appData.meses[key];
        CATEGORIES.DESPESAS.forEach(cat => {
            const entry = month.despesas[cat.id];
            if (entry && entry.confirmado) {
                totalDespesas += entry.valor;
            }
        });
        CATEGORIES.CARTOES.forEach(card => {
            const items = month.cartoes[card.id] || [];
            items.forEach(item => {
                if (item.confirmado) {
                    totalDespesas += item.valor;
                }
            });
        });
    });
    return totalDespesas;
}

// ==================== RENDERIZAR MÊS ====================
function renderMonth(monthIdx) {
    const key = `mes_${monthIdx}`;
    const month = appData.meses[key];
    currentActiveMonthIndex = monthIdx;

    document.getElementById('current-month-title').textContent = `Acompanhamento Mensal - ${MONTHS[monthIdx]}`;

    const container = document.getElementById('month-content');
    if (!container) return;
    container.innerHTML = '';

    if (!month.isInitialized) {
        CATEGORIES.RECEITAS.forEach(cat => {
            month.receitas[cat.id] = { valor: appData.previsaoAnual[cat.id] || 0, confirmado: false };
        });
        CATEGORIES.DESPESAS.forEach(cat => {
            month.despesas[cat.id] = { valor: appData.previsaoAnual[cat.id] || 0, confirmado: false };
        });
        CATEGORIES.CARTOES.forEach(card => {
            month.cartoes[card.id] = (appData.previsaoAnual[card.id] || []).map(it => ({
                ...it,
                confirmado: false
            }));
        });
        month.investimento = { valor: appData.previsaoAnual.investimento || 0, confirmado: false };
    }

    let html = `<div class="row"><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-success">Receitas</h3>`;
    CATEGORIES.RECEITAS.forEach(cat => {
        const entry = month.receitas[cat.id];
        html += `<div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="mes-${key}-${cat.id}" class="form-label mb-0">${cat.name}</label><input type="number" id="mes-${key}-${cat.id}" data-id="${cat.id}" value="${entry.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end mes-input"><div class="form-check ms-2"><input type="checkbox" class="form-check-input confirm-checkbox" id="confirm-mes-${key}-${cat.id}" data-id="${cat.id}" ${entry.confirmado ? 'checked' : ''}><label class="form-check-label" for="confirm-mes-${key}-${cat.id}">PAGO</label></div></div>`;
    });
    html += `</div></div></div><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-danger">Despesas</h3>`;
    CATEGORIES.DESPESAS.forEach(cat => {
        const entry = month.despesas[cat.id];
        html += `<div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="mes-${key}-${cat.id}" class="form-label mb-0">${cat.name}</label><input type="number" id="mes-${key}-${cat.id}" data-id="${cat.id}" value="${entry.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end mes-input"><div class="form-check ms-2"><input type="checkbox" class="form-check-input confirm-checkbox" id="confirm-mes-${key}-${cat.id}" data-id="${cat.id}" ${entry.confirmado ? 'checked' : ''}><label class="form-check-label" for="confirm-mes-${key}-${cat.id}">PAGO</label></div></div>`;
    });
    html += `</div></div></div></div>`;

    html += `<div class="row mt-3"><div class="col-12"><div class="category-section card"><div class="card-body"><h3 class="card-title text-primary">Cartões</h3>`;
    CATEGORIES.CARTOES.forEach(card => {
        const items = month.cartoes[card.id] || [];
        html += `<h5 class="mt-3">${card.name}</h5>`;
        items.forEach((item, idx) => {
            html += `<div class="card-item mb-2 p-2 border rounded" style="background: #f9f9f9;"><div class="row g-2 align-items-center"><div class="col-md-4"><small>${item.descricao || 'Item'}</small></div><div class="col-md-2"><small>${item.parcelas || 'À vista'}</small></div><div class="col-md-3"><input type="number" class="form-control form-control-sm mes-card-input" id="mes-${key}-${card.id}-${idx}-valor" data-card-id="${card.id}" data-item-index="${idx}" value="${(item.valor || 0).toFixed(2)}" step="0.01"></div><div class="col-md-3"><div class="form-check"><input type="checkbox" class="form-check-input confirm-card-checkbox" id="confirm-mes-${key}-${card.id}-${idx}" data-card-id="${card.id}" data-item-index="${idx}" ${item.confirmado ? 'checked' : ''}><label class="form-check-label" for="confirm-mes-${key}-${card.id}-${idx}">PAGO</label></div></div></div></div>`;
        });
    });
    html += `</div></div></div></div>`;

    html += `<div class="row mt-3"><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-success">Investimento</h3><div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed"><label for="mes-${key}-investimento" class="form-label mb-0">Valor</label><input type="number" id="mes-${key}-investimento" data-id="investimento" value="${month.investimento.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end mes-input"><div class="form-check ms-2"><input type="checkbox" class="form-check-input confirm-checkbox" id="confirm-mes-${key}-investimento" data-id="investimento" ${month.investimento.confirmado ? 'checked' : ''}><label class="form-check-label" for="confirm-mes-${key}-investimento">PAGO</label></div></div></div></div></div>`;

    const yearlyTotal = calculateYearlyTotal();
    html += `<div class="row mt-3"><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-warning">Resumo do Mês</h3><div class="item-row d-flex justify-content-between mb-2"><span>Saldo:</span><strong>R$ ${(calculateMonthBalance(monthIdx)).toFixed(2)}</strong></div><div class="item-row d-flex justify-content-between mb-2"><span>Saldo Final:</span><strong>R$ ${(calculateMonthBalance(monthIdx) - month.investimento.valor).toFixed(2)}</strong></div></div></div></div><div class="col-md-6"><div class="category-section card"><div class="card-body"><h3 class="card-title text-info">Total Anual (Pago)</h3><div class="item-row d-flex justify-content-between mb-2"><span>Despesas:</span><strong style="font-size: 1.3em; color: #dc3545;">R$ ${yearlyTotal.toFixed(2)}</strong></div></div></div></div></div>`;

    html += `<div class="row mt-3"><div class="col-12"><button id="save-month" class="btn btn-success w-100">Salvar Mês</button></div></div>`;

    container.innerHTML = html;

    container.querySelectorAll('.mes-input').forEach(inp => {
        inp.addEventListener('change', e => {
            const id = e.target.dataset.id;
            const isReceita = CATEGORIES.RECEITAS.some(c => c.id === id);
            const isDespesa = CATEGORIES.DESPESAS.some(c => c.id === id);
            const valor = parseFloat(e.target.value) || 0;
            
            if (id === 'investimento') {
                month.investimento.valor = valor;
            } else if (isReceita) {
                month.receitas[id].valor = valor;
            } else if (isDespesa) {
                month.despesas[id].valor = valor;
            }
            saveData();
        });
    });

    container.querySelectorAll('.mes-card-input').forEach(inp => {
        inp.addEventListener('change', e => {
            const cardId = e.target.dataset.cardId;
            const idx = parseInt(e.target.dataset.itemIndex);
            const valor = parseFloat(e.target.value) || 0;
            month.cartoes[cardId][idx].valor = valor;
            saveData();
        });
    });

    container.querySelectorAll('.confirm-checkbox').forEach(chk => {
        chk.addEventListener('change', e => {
            const catId = e.target.dataset.id;
            const isReceita = CATEGORIES.RECEITAS.some(c => c.id === catId);
            const isDespesa = CATEGORIES.DESPESAS.some(c => c.id === catId);
            
            if (catId === 'investimento') {
                month.investimento.confirmado = e.target.checked;
            } else if (isReceita) {
                month.receitas[catId].confirmado = e.target.checked;
            } else if (isDespesa) {
                month.despesas[catId].confirmado = e.target.checked;
            }
            saveData();
            renderMonth(monthIdx);
        });
    });

    container.querySelectorAll('.confirm-card-checkbox').forEach(chk => {
        chk.addEventListener('change', e => {
            const cardId = e.target.dataset.cardId;
            const idx = parseInt(e.target.dataset.itemIndex);
            month.cartoes[cardId][idx].confirmado = e.target.checked;
            saveData();
            renderMonth(monthIdx);
        });
    });

    document.getElementById('save-month').addEventListener('click', () => {
        month.isInitialized = true;
        saveData();
        alert('✅ Mês salvo!');
    });
}

function calculateMonthBalance(monthIdx) {
    const key = `mes_${monthIdx}`;
    const month = appData.meses[key];
    let totalReceitas = 0;
    let totalDespesas = 0;

    CATEGORIES.RECEITAS.forEach(cat => {
        if (month.receitas[cat.id]) {
            totalReceitas += month.receitas[cat.id].valor;
        }
    });

    CATEGORIES.DESPESAS.forEach(cat => {
        if (month.despesas[cat.id]) {
            totalDespesas += month.despesas[cat.id].valor;
        }
    });

    CATEGORIES.CARTOES.forEach(card => {
        const items = month.cartoes[card.id] || [];
        items.forEach(item => {
            totalDespesas += item.valor;
        });
    });

    return totalReceitas - totalDespesas;
}

// ==================== INICIALIZAR ====================
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    loadDataFromLocalStorage();
    updateConnectionStatus();
    renderPrevisao();

    // Botão Previsão
    document.getElementById('btn-previsao')?.addEventListener('click', () => {
        document.getElementById('previsao-content').style.display = 'block';
        document.getElementById('month-content').style.display = 'none';
        document.getElementById('current-month-title').textContent = 'Previsão Anual';
        renderPrevisao();
    });

    // Botões Meses
    MONTHS.forEach((month, idx) => {
        const monthNames = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        const btn = document.getElementById(`btn-${monthNames[idx]}`);
        if (btn) {
            btn.addEventListener('click', () => {
                document.getElementById('previsao-content').style.display = 'none';
                document.getElementById('month-content').style.display = 'block';
                renderMonth(idx);
            });
        }
    });
});
