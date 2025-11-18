// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeIcon.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
});

// Navigation
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageId) {
            btn.classList.add('active');
        }
    });
    // Hide header and tabs for walmart-analysis and about-compfinance pages
    const appHeader = document.querySelector('.app-header');
    const tabs = document.querySelector('.tabs');
    if (pageId === 'walmart-analysis' || pageId === 'about-compfinance') {
        if (appHeader) appHeader.style.display = '';
        if (tabs) tabs.style.display = 'none';
    } else {
        if (appHeader) appHeader.style.display = '';
        if (tabs) tabs.style.display = '';
    }
    // Always unlock industry-benchmark tab if navigating to it
    if (pageId === 'industry-benchmark') {
        unlockPage('industry-benchmark');
        // Autofill company name and industry in the benchmark subtitle
        const companyName = document.getElementById('companyName').value || '[Company Name]';
        const industrySelect = document.getElementById('industry');
        const industryValue = industrySelect.value;
        let industryText = '[Industry]';
        if (industryValue) {
            const selectedOption = industrySelect.options[industrySelect.selectedIndex];
            industryText = selectedOption.text;
        }
        const companyNameSpan = document.getElementById('benchmarkCompanyName');
        const industrySpan = document.getElementById('benchmarkIndustry');
        if (companyNameSpan) companyNameSpan.textContent = companyName;
        if (industrySpan) industrySpan.textContent = industryText;
    }
}

// Track user progress for tab navigation
let unlockedPages = ['overview'];

function resetAllData() {
    // Reset forms
    document.getElementById('companyForm').reset();
    document.getElementById('financialForm').reset();
    // Reset ratios display
    [
        'netProfitMargin','roe','roa','currentRatio','quickRatio','assetTurnover','inventoryTurnover','debtToEquity',
        'netProfitMarginStatus','roeStatus','roaStatus','currentRatioStatus','quickRatioStatus','assetTurnoverStatus','inventoryTurnoverStatus','debtToEquityStatus'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '-';
    });
    // Reset benchmark table/chart
    const tableBody = document.getElementById('benchmarkTableBody');
    if (tableBody) tableBody.innerHTML = '';
    const chartContainer = document.getElementById('benchmarkChart');
    if (chartContainer) chartContainer.innerHTML = '';
    // Reset progress
    unlockedPages = ['overview'];
    // Reset tab states
    updateTabStates();
}

// Attach to Start Over button
const startOverBtn = document.querySelector('.restart-btn');
if (startOverBtn) {
    startOverBtn.addEventListener('click', resetAllData);
}

// Update tab states (disable/enable based on progress)
function updateTabStates() {
    const tabOrder = ['overview','company-info','financial-input','financial-ratios','industry-benchmark'];
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const page = btn.dataset.page;
        if (page === 'company-info') {
            btn.disabled = false;
            btn.classList.remove('tab-disabled');
            return;
        }
        if (unlockedPages.includes(page)) {
            btn.disabled = false;
            btn.classList.remove('tab-disabled');
        } else {
            btn.disabled = true;
            btn.classList.add('tab-disabled');
        }
    });
}

// Unlock next page on successful continue
function unlockPage(pageId) {
    if (!unlockedPages.includes(pageId)) {
        unlockedPages.push(pageId);
        updateTabStates();
    }
}

// Tab Navigation (with lock check)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (!btn.disabled) {
            navigateTo(page);
        }
    });
});

// Continue button logic (except financial input page)
const continueBtns = document.querySelectorAll('.continue-btn');
continueBtns.forEach(btn => {
    if (btn.closest('#financial-input')) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentPage = document.querySelector('.page.active');
        const formId = currentPage.querySelector('form')?.id;
        if (formId && !validateForm(formId)) {
            alert('Please fill in all required fields');
            return;
        }
        // Navigation logic for Company Info page
        if (currentPage.id === 'company-info') {
            unlockPage('financial-input');
            navigateTo('financial-input');
        } else if (currentPage.id === 'overview') {
            unlockPage('company-info');
            navigateTo('company-info');
        } else if (currentPage.id === 'financial-ratios') {
            unlockPage('industry-benchmark');
            navigateTo('industry-benchmark');
        }
    });
});

// Financial Input page continue button
const financialInputContinueBtn = document.querySelector('#financial-input .continue-btn');
if (financialInputContinueBtn) {
    financialInputContinueBtn.addEventListener('click', function(e) {
        const inputs = document.querySelectorAll('#financialForm input[required]');
        let allFilled = true;
        inputs.forEach(input => {
            if (!input.value) {
                allFilled = false;
                input.style.borderColor = '#dc2626';
            } else {
                input.style.borderColor = '';
            }
        });
        if (!allFilled) {
            e.preventDefault();
            alert('Please fill in all financial fields before continuing.');
        } else {
            unlockPage('financial-ratios');
            navigateTo('financial-ratios');
        }
    });
}

// Call updateTabStates on load
updateTabStates();

// Financial Calculations
function calculateRatios() {
    // Get input values
    const grossRevenue = parseFloat(document.getElementById('grossRevenue').value) || 0;
    const netIncome = parseFloat(document.getElementById('netIncome').value) || 0;
    const sales = parseFloat(document.getElementById('sales').value) || 0;
    const currentAssets = parseFloat(document.getElementById('currentAssets').value) || 0;
    const currentLiabilities = parseFloat(document.getElementById('currentLiabilities').value) || 0;
    const shareholdersEquity = parseFloat(document.getElementById('shareholdersEquity').value) || 0;
    const inventory = parseFloat(document.getElementById('inventory').value) || 0;
    const cogs = parseFloat(document.getElementById('cogs').value) || 0;

    // Calculate ratios
    const netProfitMargin = (netIncome / grossRevenue) * 100;
    const roe = (netIncome / shareholdersEquity) * 100;
    const roa = (netIncome / currentAssets) * 100;
    const currentRatio = currentAssets / currentLiabilities;
    const quickRatio = (currentAssets - inventory) / currentLiabilities;
    const assetTurnover = sales / currentAssets;
    const inventoryTurnover = cogs / inventory;
    const debtToEquity = currentLiabilities / shareholdersEquity;

    // Update ratio displays
    document.getElementById('netProfitMargin').textContent = `${netProfitMargin.toFixed(2)}%`;
    document.getElementById('roe').textContent = `${roe.toFixed(2)}%`;
    document.getElementById('roa').textContent = `${roa.toFixed(2)}%`;
    document.getElementById('currentRatio').textContent = currentRatio.toFixed(2);
    document.getElementById('quickRatio').textContent = quickRatio.toFixed(2);
    document.getElementById('assetTurnover').textContent = assetTurnover.toFixed(2);
    document.getElementById('inventoryTurnover').textContent = inventoryTurnover.toFixed(2);
    document.getElementById('debtToEquity').textContent = debtToEquity.toFixed(2);

    // Set status for each ratio (thresholds are illustrative, can be adjusted)
    setRatioStatus('netProfitMarginStatus', netProfitMargin, {poor: 2, average: 4, good: 8}, 'Net Profit Margin', true);
    setRatioStatus('roeStatus', roe, {poor: 5, average: 12, good: 20}, 'Return on Equity', true);
    setRatioStatus('roaStatus', roa, {poor: 2, average: 6, good: 12}, 'Return on Assets', true);
    setRatioStatus('currentRatioStatus', currentRatio, {poor: 1, average: 1.5, good: 2}, 'Current Ratio');
    setRatioStatus('quickRatioStatus', quickRatio, {poor: 0.5, average: 1, good: 1.5}, 'Quick Ratio');
    setRatioStatus('assetTurnoverStatus', assetTurnover, {poor: 0.5, average: 1, good: 2}, 'Asset Turnover');
    setRatioStatus('inventoryTurnoverStatus', inventoryTurnover, {poor: 2, average: 5, good: 8}, 'Inventory Turnover');
    setRatioStatus('debtToEquityStatus', debtToEquity, {poor: 2, average: 1.5, good: 1}, 'Debt to Equity');
    // Store ratios for benchmark comparison
    window.companyRatios = {
        netProfitMargin,
        roe,
        roa,
        currentRatio,
        quickRatio,
        assetTurnover,
        inventoryTurnover,
        debtToEquity
    };

    // Update benchmark comparison
    updateBenchmarkComparison();
}

function setRatioStatus(id, value, thresholds, ratioName, isPercent = false) {
    const el = document.getElementById(id);
    let status = '';
    let className = '';
    let icon = '';
    if (isNaN(value) || !isFinite(value)) {
        status = '';
        className = '';
        icon = '';
    } else if (id === 'debtToEquityStatus') {
        // For debt to equity, lower is better
        if (value > thresholds.poor) {
            status = `Poor ${ratioName}`;
            className = 'poor';
            icon = '<span style="color:var(--danger-color);font-weight:bold;margin-right:6px;">&#10006;</span>';
        } else if (value > thresholds.average) {
            status = `Average ${ratioName}`;
            className = 'average';
            icon = '<span style="color:var(--warning-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        } else if (value > thresholds.good) {
            status = `Good ${ratioName}`;
            className = 'good';
            icon = '<span style="color:var(--success-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        } else {
            status = `Excellent ${ratioName}`;
            className = 'excellent';
            icon = '<span style="color:var(--info-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        }
    } else {
        if (value < thresholds.poor) {
            status = `Poor ${ratioName}`;
            className = 'poor';
            icon = '<span style="color:var(--danger-color);font-weight:bold;margin-right:6px;">&#10006;</span>';
        } else if (value < thresholds.average) {
            status = `Average ${ratioName}`;
            className = 'average';
            icon = '<span style="color:var(--warning-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        } else if (value < thresholds.good) {
            status = `Good ${ratioName}`;
            className = 'good';
            icon = '<span style="color:var(--success-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        } else {
            status = `Excellent ${ratioName}`;
            className = 'excellent';
            icon = '<span style="color:var(--info-color);font-weight:bold;margin-right:6px;">&#9650;</span>';
        }
    }
    el.innerHTML = status ? icon + status : '';
    el.className = `ratio-status${className ? ' ' + className : ''}`;
}

// Industry Benchmark Data (Example data - in a real application, this would come from a database)
const industryBenchmarks = {
    agriculture: {
        netProfitMargin: -154.2, roe: -71.3, roa: -26.1, currentRatio: 2.24, quickRatio: 1.25, assetTurnover: 3678, inventoryTurnover: 190, debtToEquity: 21.79
    },
    mining: {
        netProfitMargin: -63202.1, roe: 5.2, roa: -79.6, currentRatio: 3.41, quickRatio: 2.05, assetTurnover: 442519, inventoryTurnover: 707, debtToEquity: 3.91
    },
    construction: {
        netProfitMargin: -848.9, roe: 11.2, roa: 2.1, currentRatio: 4.10, quickRatio: 2.05, assetTurnover: 1652, inventoryTurnover: 21, debtToEquity: 1.85
    },
    manufacturing: {
        netProfitMargin: -9026.3, roe: -70.4, roa: -125.9, currentRatio: 4.08, quickRatio: 3.17, assetTurnover: 36442, inventoryTurnover: 808, debtToEquity: 2.59
    },
    transportation: {
        netProfitMargin: -5168.9, roe: 77.1, roa: -46.2, currentRatio: 93.42, quickRatio: 1.11, assetTurnover: 21607, inventoryTurnover: 825, debtToEquity: 36.03
    },
    wholesale: {
        netProfitMargin: -1577.7, roe: -52.7, roa: -50.5, currentRatio: 2.29, quickRatio: 0.63, assetTurnover: 939, inventoryTurnover: 532, debtToEquity: 3.17
    },
    retail: {
        netProfitMargin: -11839.5, roe: -71.3, roa: 47.4, currentRatio: 1.46, quickRatio: 0.48, assetTurnover: 11209, inventoryTurnover: 9096, debtToEquity: 19.93
    },
    finance: {
        netProfitMargin: 4694.6, roe: -12.1, roa: -3.8, currentRatio: 103.07, quickRatio: 96.74, assetTurnover: 589791, inventoryTurnover: 1856, debtToEquity: 7.84
    },
    services: {
        netProfitMargin: -11807.1, roe: -64.9, roa: -178.2, currentRatio: 2.22, quickRatio: 1.65, assetTurnover: 29068, inventoryTurnover: 863, debtToEquity: 3.75
    }
};

function updateBenchmarkComparison() {
    const industry = document.getElementById('industry').value;
    if (!industry || !window.companyRatios) return;

    const benchmarks = industryBenchmarks[industry] || {};
    const tableBody = document.getElementById('benchmarkTableBody');
    tableBody.innerHTML = '';

    // Create comparison rows
    const ratios = [
        { name: 'Net Profit Margin', company: window.companyRatios.netProfitMargin, industry: benchmarks.netProfitMargin, unit: '%', higherIsBetter: true },
        { name: 'Return on Equity', company: window.companyRatios.roe, industry: benchmarks.roe, unit: '%', higherIsBetter: true },
        { name: 'Return on Assets', company: window.companyRatios.roa, industry: benchmarks.roa, unit: '%', higherIsBetter: true },
        { name: 'Current Ratio', company: window.companyRatios.currentRatio, industry: benchmarks.currentRatio, higherIsBetter: true },
        { name: 'Quick Ratio', company: window.companyRatios.quickRatio, industry: benchmarks.quickRatio, higherIsBetter: true },
        { name: 'Asset Turnover', company: window.companyRatios.assetTurnover, industry: benchmarks.assetTurnover, higherIsBetter: true },
        { name: 'Inventory Turnover', company: window.companyRatios.inventoryTurnover, industry: benchmarks.inventoryTurnover, higherIsBetter: true },
        { name: 'Debt to Equity', company: window.companyRatios.debtToEquity, industry: benchmarks.debtToEquity, higherIsBetter: false }
    ];

    // Add table header with new column
    tableBody.parentElement.querySelector('thead tr').innerHTML = `
        <th>Ratio</th>
        <th>Your Company</th>
        <th>Industry Average</th>
        <th></th>
    `;

    ratios.forEach(ratio => {
        let comparison = '';
        let comparisonClass = '';
        let diff = null;
        let diffText = '';
        let companyClass = 'benchmark-company';
        if (ratio.industry !== undefined && ratio.industry !== null && !isNaN(ratio.industry)) {
            diff = ratio.company - ratio.industry;
            let absDiff = Math.abs(diff).toFixed(2);
            let unit = ratio.unit || '';
            if (ratio.higherIsBetter) {
                if (ratio.company > ratio.industry) {
                    comparison = 'better';
                    comparisonClass = 'benchmark-higher';
                    diffText = ` by ${absDiff}${unit}`;
                } else if (ratio.company < ratio.industry) {
                    comparison = 'worse';
                    comparisonClass = 'benchmark-lower';
                    diffText = ` by ${absDiff}${unit}`;
                    companyClass += ' benchmark-lower';
                }
            } else { // lower is better
                if (ratio.company < ratio.industry) {
                    comparison = 'better';
                    comparisonClass = 'benchmark-higher';
                    diffText = ` by ${absDiff}${unit}`;
                } else if (ratio.company > ratio.industry) {
                    comparison = 'worse';
                    comparisonClass = 'benchmark-lower';
                    diffText = ` by ${absDiff}${unit}`;
                    companyClass += ' benchmark-lower';
                }
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ratio.name}</td>
            <td class="${companyClass} benchmark-company-center">${ratio.company.toFixed(2)}${ratio.unit || ''}</td>
            <td class="benchmark-industry">${ratio.industry ? ratio.industry.toFixed(2) + (ratio.unit || '') : 'N/A'}</td>
            <td class="${comparisonClass}">${comparison ? comparison + diffText : ''}</td>
        `;
        tableBody.appendChild(row);
    });

    // Create simple bar chart using ASCII art (since we're not using any external libraries)
    const chartContainer = document.getElementById('benchmarkChart');
    chartContainer.innerHTML = '<pre>' + createAsciiChart(ratios) + '</pre>';
}

function createAsciiChart(ratios) {
    // Helper to check if a ratio is a percentage
    function isPercentRatio(name) {
        return [
            'Net Profit Margin',
            'Return on Equity',
            'Return on Assets'
        ].includes(name);
    }

    // Find the longest ratio name for alignment
    const maxNameLength = Math.max(...ratios.map(r => r.name.length));
    let chart = '';
    ratios.forEach(ratio => {
        let company = ratio.company;
        let industry = ratio.industry;
        let companyBar = '', industryBar = '';
        let companyLabel = '', industryLabel = '';
        let scale = 40; // max bar length
        // Handle percent ratios with special logic
        if (isPercentRatio(ratio.name)) {
            // Company bar
            if (typeof company === 'number') {
                if (company > 100) {
                    companyBar = `<span class='ascii-bar-company'>${'█'.repeat(scale)}</span>`;
                    companyLabel = `<span class='benchmark-company'>${company.toFixed(2)}${ratio.unit || ''}</span>`;
                } else if (company < 0) {
                    let barLen = Math.min(Math.abs(company), 100) / 100 * scale;
                    companyBar = `<span class='ascii-bar-company'>${'█'.repeat(Math.round(barLen))}</span>`;
                    companyLabel = `<span class='benchmark-company'>${company.toFixed(2)}${ratio.unit || ''}</span> `;
                    companyBar = companyLabel + companyBar; // negative: label left, bar right
                    companyLabel = '';
                } else {
                    let barLen = company / 100 * scale;
                    companyBar = `<span class='ascii-bar-company'>${'█'.repeat(Math.round(barLen))}</span>`;
                    companyLabel = `<span class='benchmark-company'>${company.toFixed(2)}${ratio.unit || ''}</span>`;
                }
            } else {
                companyLabel = `<span class='benchmark-company'>N/A</span>`;
            }
            // Industry bar
            if (typeof industry === 'number') {
                if (industry > 100) {
                    industryBar = `<span class='ascii-bar-industry'>${'█'.repeat(scale)}</span>`;
                    industryLabel = `<span class='benchmark-industry'>${industry.toFixed(2)}${ratio.unit || ''}</span>`;
                } else if (industry < 0) {
                    let barLen = Math.min(Math.abs(industry), 100) / 100 * scale;
                    industryBar = `<span class='ascii-bar-industry'>${'█'.repeat(Math.round(barLen))}</span>`;
                    industryLabel = `<span class='benchmark-industry'>${industry.toFixed(2)}${ratio.unit || ''}</span> `;
                    industryBar = industryLabel + industryBar; // negative: label left, bar right
                    industryLabel = '';
                } else {
                    let barLen = industry / 100 * scale;
                    industryBar = `<span class='ascii-bar-industry'>${'█'.repeat(Math.round(barLen))}</span>`;
                    industryLabel = `<span class='benchmark-industry'>${industry.toFixed(2)}${ratio.unit || ''}</span>`;
                }
            } else {
                industryLabel = `<span class='benchmark-industry'>N/A</span>`;
            }
        } else {
            // Non-percentage ratios: use old logic
            let maxValue = Math.max(
                typeof company === 'number' ? company : 0,
                typeof industry === 'number' ? industry : 0,
                1
            );
            let localScale = scale / maxValue;
            // Company
            if (typeof company === 'number' && company > 0) {
                let barLen = Math.round(company * localScale);
                companyBar = `<span class='ascii-bar-company'>${'█'.repeat(barLen)}</span>`;
                companyLabel = `<span class='benchmark-company'>${company.toFixed(2)}${ratio.unit || ''}</span>`;
            } else {
                companyLabel = `<span class='benchmark-company'>${company ? company.toFixed(2) : 'N/A'}${ratio.unit || ''}</span>`;
            }
            // Industry
            if (typeof industry === 'number' && industry > 0) {
                let barLen = Math.round(industry * localScale);
                industryBar = `<span class='ascii-bar-industry'>${'█'.repeat(barLen)}</span>`;
                industryLabel = `<span class='benchmark-industry'>${industry.toFixed(2)}${ratio.unit || ''}</span>`;
            } else {
                industryLabel = `<span class='benchmark-industry'>${industry ? industry.toFixed(2) : 'N/A'}${ratio.unit || ''}</span>`;
            }
        }
        // Pad the ratio name so bars always start at the same spot
        const paddedName = ratio.name.padEnd(maxNameLength, ' ');
        chart += `${paddedName}  Company  : ${companyBar || companyLabel}&nbsp;${companyBar && !companyBar.startsWith(companyLabel) ? companyLabel : ''}\n`;
        chart += `${' '.repeat(maxNameLength)}  Industry : ${industryBar || industryLabel}&nbsp;${industryBar && !industryBar.startsWith(industryLabel) ? industryLabel : ''}\n\n`;
    });
    return chart;
}

// Event Listeners
document.getElementById('financialForm').addEventListener('input', calculateRatios);
document.getElementById('industry').addEventListener('change', updateBenchmarkComparison);

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (
            (input.tagName === 'SELECT' && (!input.value || input.value === '')) ||
            (input.tagName === 'INPUT' && (!input.value || input.value.trim() === ''))
        ) {
            isValid = false;
            input.style.borderColor = '#dc2626';
        } else {
            input.style.borderColor = '';
        }
    });

    return isValid;
}

// Info button navigation
const moreInfoBtn = document.getElementById('moreInfoBtn');
if (moreInfoBtn) {
    moreInfoBtn.addEventListener('click', () => {
        unlockPage('ratio-info');
        navigateTo('ratio-info');
    });
}
const backToRatiosBtn = document.getElementById('backToRatiosBtn');
if (backToRatiosBtn) {
    backToRatiosBtn.addEventListener('click', () => {
        navigateTo('financial-ratios');
    });
} 