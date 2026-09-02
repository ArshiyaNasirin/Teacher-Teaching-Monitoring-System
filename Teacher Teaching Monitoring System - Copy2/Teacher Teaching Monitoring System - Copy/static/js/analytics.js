// Dashboard Analytics and Metric Animations for Aegis System

function initializeMetricAnimations(stats) {
    if (!stats) return;

    const bars = [
        { id: 'fill-1', w: stats.attendance + '%' },
        { id: 'fill-2', w: stats.lessons + '%' },
        { id: 'fill-3', w: stats.security + '%' },
        { id: 'fill-4', w: stats.performance + '%' }
    ];

    setTimeout(() => {
        bars.forEach(bar => {
            const el = document.getElementById(bar.id);
            if (el) {
                el.style.transition = 'width 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.width = bar.w;
            }
        });
    }, 500);
}

// Any other dashboard-specific logic can go here (e.g., real-time feed updates)

// Initialize on Load (stats will be passed via global object or from template)
// For now, we assume stats are available in a global variable if we want to avoid inline scripts entirely.
// However, since we are using Jinja2 to pass stats, we might need a small helper.

// Alternative: We can use data attributes on the progress bar containers.
function initializeMetricsFromData() {
    const bars = [
        { id: 'fill-1', dataAttr: 'data-value' },
        { id: 'fill-2', dataAttr: 'data-value' },
        { id: 'fill-3', dataAttr: 'data-value' },
        { id: 'fill-4', dataAttr: 'data-value' }
    ];

    setTimeout(() => {
        bars.forEach(bar => {
            const el = document.getElementById(bar.id);
            if (el) {
                const val = el.getAttribute('data-value');
                if (val) {
                    el.style.transition = 'width 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    el.style.width = val + '%';
                }
            }
        });
    }, 500);
}

window.addEventListener('DOMContentLoaded', () => {
    initializeMetricsFromData();
});
