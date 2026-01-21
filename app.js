/* ==================== 1️⃣  DADOS INICIAIS ==================== */
const CATEGORIES = {
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
    previsaoAnual: {},   // valores da previsão
    meses: {}            // dados mensais (receitas, despesas, cartões, investimento)
};

let currentActiveMonthIndex = null; // índice do mês aberto (0‑11)

/* ==================== 2️⃣  LOCAL STORAGE ==================== */
function loadData() {
    const stored = localStorage.getItem('controleFinanceiroData');
    if (stored) {
        appData = JSON.parse(stored);
    } else {
        initializeData();
    }
}
function saveData() {
    localStorage.setItem('controleFinanceiroData', JSON.stringify(appData));
}
function initializeData() {
    // Previsão anual com zeros
    CATEGORIES.RECEITAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.DESPESAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.CARTOES.forEach(c => appData.previsaoAnual[c.id] = []);
    appData.previsaoAnual.investimento = 0;

    // Estrutura dos meses (todos ainda não confirmados)
    MONTHS.forEach((_, i) => {
        const key = `mes_${i}`;
        appData.meses[key] = {
            isInitialized: false, // ainda não tem dados reais confirmados
            receitas: {},
            despesas: {},
            cartoes: {},
            investimento: { valor: 0, confirmado: false },
            totalReceitas: 0,
            totalDespesas: 0,
            saldo: 0,
            saldoFinal: 0
        };
    });
    saveData();
}

/* ==================== 3️⃣  PROPAGAR PREVISÃO ==================== */
function propagatePrevisaoToMonths() {
    MONTHS.forEach((_, i) => {
        const key = `mes_${i}`;
        const month = appData.meses[key];

        // Receitas
        CATEGORIES.RECEITAS.forEach(cat => {
            // Se a categoria não existe no mês ou não está confirmada, usa a previsão
            if (!month.receitas[cat.id] || !month.receitas[cat.id].confirmado) {
                month.receitas[cat.id] = { valor: appData.previsaoAnual[cat.id] || 0, confirmado: false };
            }
        });
        // Despesas
        CATEGORIES.DESPESAS.forEach(cat => {
            // Se a categoria não existe no mês ou não está confirmada, usa a previsão
            if (!month.despesas[cat.id] || !month.despesas[cat.id].confirmado) {
                month.despesas[cat.id] = { valor: appData.previsaoAnual[cat.id] || 0, confirmado: false };
            }
        });
        // Cartões
        CATEGORIES.CARTOES.forEach(card => {
            const previsaoItens = appData.previsaoAnual[card.id] || [];
            // Recria a lista de cartões do mês com base na previsão, mas mantém o 'confirmado' se já existia
            month.cartoes[card.id] = previsaoItens.map(previsaoItem => {
                const existingItem = (month.cartoes[card.id] || []).find(
                    item => item.descricao === previsaoItem.descricao && item.parcelas === previsaoItem.parcelas
                );
                return {
                    ...previsaoItem,
                    confirmado: existingItem ? existingItem.confirmado : false
                };
            });
        });
        // Investimento
        if (!month.investimento || !month.investimento.confirmado) {
            month.investimento = { valor: appData.previsaoAnual.investimento || 0, confirmado: false };
        }

        calculateMonthTotals(`mes_${i}`);
    });
    saveData();
}

/* ==================== 4️⃣  RENDERIZAÇÃO ==================== */
function renderPrevisaoAnual() {
    const container = document.getElementById('previsao-content');
    container.innerHTML = '';

    // ---- RECEITAS ----
    let html = `<div class="col-md-6"><div class="category-section card">
                    <div class="card-body">
                        <h3 class="card-title text-success">Receitas Anuais</h3>`;
    CATEGORIES.RECEITAS.forEach(cat => {
        const v = appData.previsaoAnual[cat.id] || 0;
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="previsao-${cat.id}"
                       data-category-type="receita"
                       data-id="${cat.id}"
                       value="${v.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
            </div>`;
    });
    html += `</div></div></div>`;
    container.innerHTML += html;

    // ---- DESPESAS ----
    html = `<div class="col-md-6"><div class="category-section card">
                <div class="card-body">
                    <h3 class="card-title text-success">Despesas Anuais</h3>`;
    CATEGORIES.DESPESAS.forEach(cat => {
        const v = appData.previsaoAnual[cat.id] || 0;
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="previsao-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="previsao-${cat.id}"
                       data-category-type="despesa"
                       data-id="${cat.id}"
                       value="${v.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
            </div>`;
    });
    html += `</div></div></div>`;
    container.innerHTML += html;

    // ---- CARTÕES ----
    html = `<div class="col-12"><div class="category-section card card-details-section">
                <div class="card-body">
                    <h3 class="card-title text-success">Cartões de Crédito (Previsão Anual)</h3>`;
    CATEGORIES.CARTOES.forEach(card => {
        html += `<h4 class="text-primary mt-3">${card.name}</h4>`;
        html += `<div id="previsao-card-${card.id}-items" class="card-items-container mb-3">`;
        const itens = appData.previsaoAnual[card.id] || [];
        itens.forEach((it, idx) => {
            html += renderCardItem(it, `previsao-${card.id}-${idx}`, true);
        });
        html += `</div>`;
        html += `<button type="button" class="add-card-item-btn btn btn-primary btn-sm"
                       data-card-id="${card.id}" data-target="previsao">Adicionar Item</button>`;
    });
    html += `</div></div></div>`;
    container.innerHTML += html;

    // ---- INVESTIMENTO ----
    const inv = appData.previsaoAnual.investimento || 0;
    container.innerHTML += `
        <div class="col-md-6"><div class="category-section card">
            <div class="card-body">
                <h3 class="card-title text-success">Investimento Anual</h3>
                <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                    <label for="previsao-investimento" class="form-label mb-0">Valor Previsto</label>
                    <input type="number" id="previsao-investimento"
                           data-category-type="investimento"
                           value="${inv.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
                </div>
            </div>
        </div></div>`;

    // ---- LISTENERS ----
    container.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('change', e => {
            const id = e.target.dataset.id || e.target.id.replace('previsao-', '');
            appData.previsaoAnual[id] = parseFloat(e.target.value) || 0;
            saveData();
        });
    });
    // botões de adicionar/remover cartões
    container.querySelectorAll('.add-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            addCardItem(cardId, 'previsao');
        });
    });
    container.querySelectorAll('.remove-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            const idx = parseInt(e.target.dataset.itemIndex);
            removeCardItem(cardId, idx, 'previsao');
        });
    });
    // listeners dos campos de cartão (para salvar imediatamente)
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
}

/* ---- RENDERIZA MÊS ---- */
function renderMonth(monthIdx) {
    const key = `mes_${monthIdx}`;
    const month = appData.meses[key];
    currentActiveMonthIndex = monthIdx;

    document.getElementById('current-month-title').textContent =
        `Acompanhamento Mensal - ${MONTHS[monthIdx]}`;

    const container = document.getElementById('month-content');
    container.innerHTML = '';

    // Se ainda não houver dados reais, preenche com a previsão (sem marcar como confirmado)
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

    /* ---------- RECEITAS ---------- */
    let html = `<div class="col-md-6"><div class="category-section card">
                    <div class="card-body">
                        <h3 class="card-title text-success">Receitas</h3>`;
    CATEGORIES.RECEITAS.forEach(cat => {
        const entry = month.receitas[cat.id];
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="mes-${key}-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="mes-${key}-${cat.id}"
                       data-category-type="receita"
                       data-id="${cat.id}"
                       value="${entry.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
                <div class="form-check ms-2">
                    <input type="checkbox" class="form-check-input confirm-checkbox"
                           id="confirm-mes-${key}-${cat.id}"
                           data-category-type="receita"
                           data-id="${cat.id}"
                           ${entry.confirmado ? 'checked' : ''}>
                    <label class="form-check-label" for="confirm-mes-${key}-${cat.id}"></label>
                </div>
            </div>`;
    });
    html += `<div class="total-row d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-2">
                <span>Total Receitas:</span> <span id="total-receitas-${key}">R$ ${month.totalReceitas.toFixed(2)}</span>
            </div>`;
    html += `</div></div></div>`;
    container.innerHTML += html;

    /* ---------- DESPESAS ---------- */
    html = `<div class="col-md-6"><div class="category-section card">
                <div class="card-body">
                    <h3 class="card-title text-success">Despesas</h3>`;
    CATEGORIES.DESPESAS.forEach(cat => {
        const entry = month.despesas[cat.id];
        html += `
            <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                <label for="mes-${key}-${cat.id}" class="form-label mb-0">${cat.name}</label>
                <input type="number" id="mes-${key}-${cat.id}"
                       data-category-type="despesa"
                       data-id="${cat.id}"
                       value="${entry.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
                <div class="form-check ms-2">
                    <input type="checkbox" class="form-check-input confirm-checkbox"
                           id="confirm-mes-${key}-${cat.id}"
                           data-category-type="despesa"
                           data-id="${cat.id}"
                           ${entry.confirmado ? 'checked' : ''}>
                    <label class="form-check-label" for="confirm-mes-${key}-${cat.id}"></label>
                </div>
            </div>`;
    });
    html += `<div class="total-row d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-2">
                <span>Total Despesas:</span> <span id="total-despesas-${key}">R$ ${month.totalDespesas.toFixed(2)}</span>
            </div>`;
    html += `</div></div></div>`;
    container.innerHTML += html;

    /* ---------- CARTÕES ---------- */
    html = `<div class="col-12"><div class="category-section card card-details-section">
                <div class="card-body">
                    <h3 class="card-title text-success">Cartões de Crédito</h3>`;
    CATEGORIES.CARTOES.forEach(card => {
        html += `<h4 class="text-primary mt-3">${card.name}</h4>`;
        html += `<div id="mes-${key}-card-${card.id}-items" class="card-items-container mb-3">`;
        const itens = month.cartoes[card.id] || [];
        itens.forEach((it, idx) => {
            html += renderCardItem(it, `mes-${key}-${card.id}-${idx}`, false);
        });
        html += `</div>`;
        html += `<button type="button" class="add-card-item-btn btn btn-primary btn-sm"
                       data-card-id="${card.id}" data-target="mes"
                       data-month-key="${key}">Adicionar Item</button>`;
    });
    html += `</div></div></div>`;
    container.innerHTML += html;

    /* ---------- INVESTIMENTO ---------- */
    const inv = month.investimento;
    container.innerHTML += `
        <div class="col-md-6"><div class="category-section card">
            <div class="card-body">
                <h3 class="card-title text-success">Investimento</h3>
                <div class="item-row d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dashed">
                    <label for="mes-${key}-investimento" class="form-label mb-0">Valor Real</label>
                    <input type="number" id="mes-${key}-investimento"
                           data-category-type="investimento"
                           value="${inv.valor.toFixed(2)}" step="0.01" class="form-control w-auto text-end">
                    <div class="form-check ms-2">
                        <input type="checkbox" class="form-check-input confirm-checkbox"
                               id="confirm-mes-${key}-investimento"
                               data-category-type="investimento"
                               ${inv.confirmado ? 'checked' : ''}>
                        <label class="form-check-label" for="confirm-mes-${key}-investimento"></label>
                    </div>
                </div>
            </div>
        </div></div>`;

    /* ---------- RESUMO ---------- */
    const saldoCls = month.saldoFinal >= 0 ? 'saldo' : 'saldo-negative';
    container.innerHTML += `
        <div class="col-md-6"><div class="category-section card">
            <div class="card-body">
                <h3 class="card-title text-success">Resumo do Mês</h3>
                <div class="total-row d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-2">
                    <span>Saldo (Receitas - Despesas):</span> <span id="saldo-mes-${key}">R$ ${month.saldo.toFixed(2)}</span>
                </div>
                <div class="total-row ${saldoCls} d-flex justify-content-between align-items-center pt-2">
                    <span>Saldo Final (Após Investimento):</span> <span id="saldo-final-mes-${key}">R$ ${month.saldoFinal.toFixed(2)}</span>
                </div>
            </div>
        </div></div>`;

    /* ---------- LISTENERS ---------- */
    // inputs numéricos - FIX: usar getAttribute em vez de dataset.category-type
    container.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('change', e => {
            const type = e.target.getAttribute('data-category-type');
            const id = e.target.dataset.id || e.target.id.replace(`mes-${key}-`, '');
            const val = parseFloat(e.target.value) || 0;

            if (type === 'receita') month.receitas[id].valor = val;
            else if (type === 'despesa') month.despesas[id].valor = val;
            else if (type === 'investimento') month.investimento.valor = val;

            month.isInitialized = true; // marca que o usuário editou algo
            calculateMonthTotals(key);
            updateMonthTotalsDisplay(key);
            saveData();
        });
    });

    // checkboxes de confirmação - FIX: usar getAttribute em vez de dataset.category-type
    container.querySelectorAll('.confirm-checkbox').forEach(cb => {
        cb.addEventListener('change', e => {
            const type = e.target.getAttribute('data-category-type');
            const id = e.target.dataset.id;
            if (type === 'receita') month.receitas[id].confirmado = e.target.checked;
            else if (type === 'despesa') month.despesas[id].confirmado = e.target.checked;
            else if (type === 'investimento') month.investimento.confirmado = e.target.checked;
            saveData();
        });
    });

    // botões de adicionar/remover cartões
    container.querySelectorAll('.add-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            const monthKey = e.target.dataset.monthKey;
            addCardItem(cardId, 'mes', monthKey);
        });
    });
    container.querySelectorAll('.remove-card-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cardId = e.target.dataset.cardId;
            const idx = parseInt(e.target.dataset.itemIndex);
            const monthKey = e.target.dataset.monthKey;
            removeCardItem(cardId, idx, 'mes', monthKey);
        });
    });

    // inputs dos cartões (mensal/falta/etc.)
    container.querySelectorAll('.card-item input').forEach(inp => {
        inp.addEventListener('change', e => {
            const parts = e.target.id.split('-');
            const cardId = parts[3];
            const idx = parseInt(parts[4]);
            const field = parts[5];
            const item = month.cartoes[cardId][idx];
            if (field === 'descricao') item.descricao = e.target.value;
            else if (field === 'parcelas') item.parcelas = e.target.value;
            else item[field] = parseFloat(e.target.value) || 0;
            month.isInitialized = true;
            calculateMonthTotals(key);
            updateMonthTotalsDisplay(key);
            saveData();
        });
    });

    calculateMonthTotals(key);
    updateMonthTotalsDisplay(key);
}

/* ---- CARD ITEM TEMPLATE ---- */
function renderCardItem(item, baseId, isPrevisao) {
    const removeBtn = isPrevisao ?
        `<button type="button" class="remove-card-item-btn btn btn-danger btn-sm"
                data-card-id="${baseId.split('-')[1]}"
                data-item-index="${baseId.split('-')[2]}"
                data-target="previsao">X</button>` :
        `<button type="button" class="remove-card-item-btn btn btn-danger btn-sm"
                data-card-id="${baseId.split('-')[2]}"
                data-item-index="${baseId.split('-')[3]}"
                data-target="mes"
                data-month-key="${baseId.split('-')[1]}">X</button>`;

    const confirmCheckbox = isPrevisao ? '' : `
        <div class="form-check ms-2">
            <input type="checkbox" class="form-check-input confirm-checkbox"
                   id="confirm-${baseId}"
                   data-card-id="${baseId.split('-')[2]}"
                   data-item-index="${baseId.split('-')[3]}"
                   ${item.confirmado ? 'checked' : ''}>
            <label class="form-check-label" for="confirm-${baseId}"></label>
        </div>`;

    return `
        <div class="card-item d-grid gap-2 align-items-center p-3 mb-2 bg-light rounded shadow-sm" id="card-item-${baseId}">
            <input type="text" id="${baseId}-descricao" class="form-control card-description"
                   value="${item.descricao || ''}" placeholder="Descrição">
            <input type="text" id="${baseId}-parcelas" class="form-control card-parcelas text-center"
                   value="${item.parcelas || ''}" placeholder="Parcelas">
            <input type="number" id="${baseId}-mensal" class="form-control card-mensal text-end"
                   value="${(item.mensal || 0).toFixed(2)}" step="0.01" placeholder="Mensal">
            <input type="number" id="${baseId}-falta" class="form-control card-falta text-end"
                   value="${(item.falta || 0).toFixed(2)}" step="0.01" placeholder="Falta">
            ${confirmCheckbox}
            ${removeBtn}
        </div>`;
}

/* ---- ADICIONAR / REMOVER ITEM DE CARTÃO ---- */
function addCardItem(cardId, target, monthKey = null) {
    const newItem = { descricao: '', parcelas: '', mensal: 0, falta: 0, confirmado: false };
    let arr, parentId;

    if (target === 'previsao') {
        if (!appData.previsaoAnual[cardId]) appData.previsaoAnual[cardId] = [];
        arr = appData.previsaoAnual[cardId];
        parentId = `previsao-card-${cardId}-items`;
    } else {
        if (!appData.meses[monthKey].cartoes[cardId]) appData.meses[monthKey].cartoes[cardId] = [];
        arr = appData.meses[monthKey].cartoes[cardId];
        parentId = `mes-${monthKey}-card-${cardId}-items`;
    }

    arr.push(newItem);
    const idx = arr.length - 1;
    const baseId = target === 'previsao' ? `previsao-${cardId}-${idx}` : `mes-${monthKey}-${cardId}-${idx}`;

    const parent = document.getElementById(parentId);
    const temp = document.createElement('div');
    temp.innerHTML = renderCardItem(newItem, baseId, target === 'previsao');
    const elem = temp.firstElementChild;
    parent.appendChild(elem);

    // listeners dos novos inputs
    elem.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', e => {
            const parts = e.target.id.split('-');
            const cId = parts[target === 'previsao' ? 1 : 2];
            const iIdx = parseInt(parts[target === 'previsao' ? 2 : 3]);
            const field = parts[target === 'previsao' ? 3 : 4];
            const targetArr = target === 'previsao' ? appData.previsaoAnual[cId] : appData.meses[monthKey].cartoes[cId];
            const it = targetArr[iIdx];
            if (field === 'descricao') it.descricao = e.target.value;
            else if (field === 'parcelas') it.parcelas = e.target.value;
            else it[field] = parseFloat(e.target.value) || 0;
            if (target === 'mes') {
                appData.meses[monthKey].isInitialized = true;
                calculateMonthTotals(monthKey);
                updateMonthTotalsDisplay(monthKey);
            }
            saveData();
        });
    });

    // listener do botão remover
    elem.querySelector('.remove-card-item-btn').addEventListener('click', e => {
        const cId = e.target.dataset.cardId;
        const iIdx = parseInt(e.target.dataset.itemIndex);
        const tgt = e.target.dataset.target;
        const mKey = e.target.dataset.monthKey;
        removeCardItem(cId, iIdx, tgt, mKey);
    });

    // listener do checkbox de confirmação (se existir)
    const confirmCb = elem.querySelector('.confirm-checkbox');
    if (confirmCb) {
        confirmCb.addEventListener('change', e => {
            const cId = e.target.dataset.cardId;
            const iIdx = parseInt(e.target.dataset.itemIndex);
            const it = appData.meses[monthKey].cartoes[cId][iIdx];
            it.confirmado = e.target.checked;
            saveData();
        });
    }

    saveData();
}

function removeCardItem(cardId, idx, target, monthKey = null) {
    let arr, parentId;
    if (target === 'previsao') {
        arr = appData.previsaoAnual[cardId];
        parentId = `previsao-card-${cardId}-items`;
    } else {
        arr = appData.meses[monthKey].cartoes[cardId];
        parentId = `mes-${monthKey}-card-${cardId}-items`;
    }

    if (arr && arr.length > idx) {
        arr.splice(idx, 1);
        // Re-renderiza a lista inteira para garantir índices corretos
        if (target === 'previsao') {
            renderPrevisaoAnual();
            showPage('previsao-anual');
        } else {
            renderMonth(parseInt(monthKey.replace('mes_', '')));
            showPage('acompanhamento-mensal');
        }
    }
    saveData();
}

/* ---- CÁLCULOS ---- */
function calculateMonthTotals(monthKey) {
    const m = appData.meses[monthKey];
    let totalRec = 0, totalDesp = 0;

    CATEGORIES.RECEITAS.forEach(cat => totalRec += m.receitas[cat.id].valor);
    CATEGORIES.DESPESAS.forEach(cat => totalDesp += m.despesas[cat.id].valor);
    CATEGORIES.CARTOES.forEach(card => {
        (m.cartoes[card.id] || []).forEach(it => totalDesp += it.mensal || 0);
    });

    m.totalReceitas = totalRec;
    m.totalDespesas = totalDesp;
    m.saldo = totalRec - totalDesp;
    m.saldoFinal = m.saldo - (m.investimento.valor || 0);
}
function updateMonthTotalsDisplay(monthKey) {
    const m = appData.meses[monthKey];
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set(`total-receitas-${monthKey}`, `R$ ${m.totalReceitas.toFixed(2)}`);
    set(`total-despesas-${monthKey}`, `R$ ${m.totalDespesas.toFixed(2)}`);
    set(`saldo-mes-${monthKey}`, `R$ ${m.saldo.toFixed(2)}`);
    const saldoFinalEl = document.getElementById(`saldo-final-mes-${monthKey}`);
    if (saldoFinalEl) {
        saldoFinalEl.textContent = `R$ ${m.saldoFinal.toFixed(2)}`;
        saldoFinalEl.parentElement.classList.remove('saldo', 'saldo-negative');
        saldoFinalEl.parentElement.classList.add(m.saldoFinal >= 0 ? 'saldo' : 'saldo-negative');
    }
}

/* ---- NAVEGAÇÃO ---- */
let currentPage = 'previsao-anual';
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
    if (pageId === 'previsao-anual') {
        document.getElementById('btn-previsao').classList.add('active');
        renderPrevisaoAnual();
    }
}
function handleMonthNavClick(e) {
    const idx = parseInt(e.target.dataset.month);
    if (!isNaN(idx)) {
        showPage('acompanhamento-mensal');
        document.querySelectorAll('.month-nav .btn').forEach(b => b.classList.remove('active', 'btn-success'));
        e.target.classList.add('active', 'btn-success'); // Ativa o botão do mês com estilo Bootstrap
        renderMonth(idx);

        // Scroll suave para o topo da página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* ---- LIMPAR PREVISÃO ---- */
function clearPrevisao() {
    if (!confirm('Tem certeza que deseja limpar TODA a previsão anual? Isso também zerará os meses que ainda não foram confirmados.')) {
        return; // Cancela se o usuário não confirmar
    }

    CATEGORIES.RECEITAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.DESPESAS.forEach(c => appData.previsaoAnual[c.id] = 0);
    CATEGORIES.CARTOES.forEach(c => appData.previsaoAnual[c.id] = []);
    appData.previsaoAnual.investimento = 0;

    propagatePrevisaoToMonths(); // zera os meses não confirmados
    renderPrevisaoAnual();
    saveData();
    alert('Previsão anual limpa e meses não confirmados foram zerados.');
}

/* ---- SERVICE WORKER ------------------- */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(r => console.log('Service Worker registrado com sucesso:', r))
                .catch(err => console.error('Falha ao registrar o Service Worker:', err));
        });
    }
}

/* ==== INICIALIZAÇÃO ==== */
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    propagatePrevisaoToMonths(); // garante que a previsão esteja nos meses ainda não confirmados
    renderPrevisaoAnual();
    showPage('previsao-anual');

    // navegação
    document.getElementById('btn-previsao').addEventListener('click', () => showPage('previsao-anual'));
    document.querySelectorAll('.month-nav .btn').forEach(b => b.addEventListener('click', handleMonthNavClick));

    // botões de salvar
    document.getElementById('save-previsao').addEventListener('click', () => {
        saveData();
        propagatePrevisaoToMonths();
        alert('Previsão salva e propagada para os meses não confirmados.');
    });
    document.getElementById('save-month-data').addEventListener('click', () => {
        if (currentActiveMonthIndex !== null) {
            const key = `mes_${currentActiveMonthIndex}`;
            appData.meses[key].isInitialized = true; // Marca o mês como totalmente inicializado/confirmado
            calculateMonthTotals(key);
            updateMonthTotalsDisplay(key);
        }
        saveData();
        alert('Dados do mês salvos.');
    });

    // botão limpar previsão
    document.getElementById('clear-previsao').addEventListener('click', clearPrevisao);

    registerServiceWorker();
});
