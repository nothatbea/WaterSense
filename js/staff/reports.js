// ============================
// TIME RANGE BUTTONS
// ============================
const timeRangeBtns = document.querySelectorAll('.time-range-btn');

timeRangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        timeRangeBtns.forEach(b => {
            b.classList.remove('active', 'bg-primary', 'text-white');
            b.classList.add('text-text-secondary');
        });

        btn.classList.add('active', 'bg-primary', 'text-white');
        btn.classList.remove('text-text-secondary');

        console.log('Time range:', btn.dataset.range);
    });
});

// ============================
// LOCATION SELECTOR
// ============================
document.getElementById('locationSelector')
    ?.addEventListener('change', e => {
        console.log('Location:', e.target.value);
    });

// ============================
// REPORT TYPE SELECTION
// ============================
const reportTypeCards = document.querySelectorAll('.report-type-card');
const customReportForm = document.getElementById('customReportForm');

reportTypeCards.forEach(card => {
    card.addEventListener('click', () => {
        reportTypeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        customReportForm.classList.toggle(
            'active',
            card.dataset.type === 'custom'
        );
    });
});

// ============================
// FORMAT SELECTION
// ============================
const formatBtns = document.querySelectorAll('.format-btn');

formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        console.log('Format:', btn.dataset.format);
    });
});

// ============================
// GENERATE REPORT
// ============================
document.getElementById('generateReport')
    ?.addEventListener('click', () => {

        const type = document.querySelector('.report-type-card.active')?.dataset.type;
        const format = document.querySelector('.format-btn.active')?.dataset.format;

        if (!type || !format) return alert('Select report type and format');

        alert(`Generating ${type} report in ${format.toUpperCase()} format`);
    });

// ============================
// BULK ACTIONS
// ============================
const bulkActions = document.getElementById('bulkActions');
const reportCheckboxes = document.querySelectorAll('.report-select');

function updateBulkActions() {
    const selected = document.querySelectorAll('.report-select:checked');
    bulkActions.style.display = selected.length ? 'flex' : 'none';
}

reportCheckboxes.forEach(cb =>
    cb.addEventListener('change', updateBulkActions)
);

// ============================
// TIMESTAMP & AUTO REFRESH
// ============================
function updateTimestamp() {
    document.getElementById('lastUpdate').textContent =
        new Date().toLocaleString();
}

updateTimestamp();
setInterval(updateTimestamp, 300000);
