/**
 * ====================================================
 * Charts Module - Health Tracker
 * ====================================================
 * สร้างและจัดการกราฟด้วย Chart.js
 */

// ====================================================
// CHART INSTANCES
// ====================================================

let chartInstances = {
    weight: null,
    bmi: null,
    bp: null,
    spo2: null,
    sugar: null
};

// ====================================================
// CHART CONFIGURATION
// ====================================================

const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    // Custom colors
    weight: '#667eea',
    bmi: '#764ba2',
    sys: '#dc3545',
    dia: '#007bff',
    spo2: '#20c997',
    sugar: '#fd7e14'
};

const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                maxRotation: 45,
                minRotation: 45
            }
        },
        y: {
            beginAtZero: false,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            }
        }
    },
    elements: {
        line: {
            tension: 0.4,
            borderWidth: 3
        },
        point: {
            radius: 4,
            hoverRadius: 6,
            hitRadius: 10
        }
    }
};

// ====================================================
// RENDER ALL CHARTS
// ====================================================

/**
 * Render ทุกกราฟ
 * @param {Object} data - ข้อมูลจาก API
 */
function renderAllCharts(data) {
    renderWeightChart(data.weightBmi);
    renderBMIChart(data.weightBmi);
    renderBloodPressureChart(data.bloodPressure);
    renderSpO2Chart(data.o2);
    renderBloodSugarChart(data.sugar);
}

// ====================================================
// WEIGHT CHART
// ====================================================

/**
 * Render กราฟน้ำหนัก
 * @param {Array} data 
 */
function renderWeightChart(data) {
    const ctx = document.getElementById('weightChart');
    const emptyEl = document.getElementById('weightEmpty');

    // Destroy existing chart
    if (chartInstances.weight) {
        chartInstances.weight.destroy();
    }

    // Check if data exists
    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.weight = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'น้ำหนัก (kg)',
                data: data.map(d => d.weight),
                borderColor: chartColors.weight,
                backgroundColor: hexToRgba(chartColors.weight, 0.1),
                fill: true
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                ...defaultChartOptions.scales,
                y: {
                    ...defaultChartOptions.scales.y,
                    title: {
                        display: true,
                        text: 'kg'
                    }
                }
            }
        }
    });
}

// ====================================================
// BMI CHART
// ====================================================

/**
 * Render กราฟ BMI
 * @param {Array} data 
 */
function renderBMIChart(data) {
    const ctx = document.getElementById('bmiChart');
    const emptyEl = document.getElementById('bmiEmpty');

    if (chartInstances.bmi) {
        chartInstances.bmi.destroy();
    }

    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.bmi = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'BMI',
                data: data.map(d => d.bmi),
                borderColor: chartColors.bmi,
                backgroundColor: hexToRgba(chartColors.bmi, 0.1),
                fill: true
            }]
        },
        options: {
            ...defaultChartOptions,
            plugins: {
                ...defaultChartOptions.plugins,
                annotation: {
                    annotations: {
                        normalZone: {
                            type: 'box',
                            yMin: 18.5,
                            yMax: 24.9,
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            borderColor: 'transparent'
                        }
                    }
                }
            },
            scales: {
                ...defaultChartOptions.scales,
                y: {
                    ...defaultChartOptions.scales.y,
                    title: {
                        display: true,
                        text: 'BMI'
                    }
                }
            }
        }
    });
}

// ====================================================
// BLOOD PRESSURE CHART
// ====================================================

/**
 * Render กราฟความดันโลหิต (SYS/DIA)
 * @param {Array} data 
 */
function renderBloodPressureChart(data) {
    const ctx = document.getElementById('bpChart');
    const emptyEl = document.getElementById('bpEmpty');

    if (chartInstances.bp) {
        chartInstances.bp.destroy();
    }

    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.bp = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [
                {
                    label: 'SYS (ตัวบน)',
                    data: data.map(d => d.sys),
                    borderColor: chartColors.sys,
                    backgroundColor: hexToRgba(chartColors.sys, 0.1),
                    fill: false
                },
                {
                    label: 'DIA (ตัวล่าง)',
                    data: data.map(d => d.dia),
                    borderColor: chartColors.dia,
                    backgroundColor: hexToRgba(chartColors.dia, 0.1),
                    fill: false
                }
            ]
        },
        options: {
            ...defaultChartOptions,
            plugins: {
                ...defaultChartOptions.plugins,
                legend: {
                    display: false // ใช้ custom legend ใน HTML
                }
            },
            scales: {
                ...defaultChartOptions.scales,
                y: {
                    ...defaultChartOptions.scales.y,
                    title: {
                        display: true,
                        text: 'mmHg'
                    }
                }
            }
        }
    });
}

// ====================================================
// SPO2 CHART
// ====================================================

/**
 * Render กราฟ SpO2
 * @param {Array} data 
 */
function renderSpO2Chart(data) {
    const ctx = document.getElementById('spo2Chart');
    const emptyEl = document.getElementById('spo2Empty');

    if (chartInstances.spo2) {
        chartInstances.spo2.destroy();
    }

    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.spo2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'SpO2 (%)',
                data: data.map(d => d.spo2),
                borderColor: chartColors.spo2,
                backgroundColor: hexToRgba(chartColors.spo2, 0.1),
                fill: true
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                ...defaultChartOptions.scales,
                y: {
                    ...defaultChartOptions.scales.y,
                    min: 90,
                    max: 100,
                    title: {
                        display: true,
                        text: '%'
                    }
                }
            }
        }
    });
}

// ====================================================
// BLOOD SUGAR CHART
// ====================================================

/**
 * Render กราฟน้ำตาลในเลือด
 * @param {Array} data 
 */
function renderBloodSugarChart(data) {
    const ctx = document.getElementById('sugarChart');
    const emptyEl = document.getElementById('sugarEmpty');

    if (chartInstances.sugar) {
        chartInstances.sugar.destroy();
    }

    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.sugar = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'น้ำตาล (mg/dL)',
                data: data.map(d => d.sugar),
                borderColor: chartColors.sugar,
                backgroundColor: hexToRgba(chartColors.sugar, 0.1),
                fill: true
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                ...defaultChartOptions.scales,
                y: {
                    ...defaultChartOptions.scales.y,
                    title: {
                        display: true,
                        text: 'mg/dL'
                    }
                }
            }
        }
    });
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

/**
 * Format date label for charts
 * @param {string} dateStr - YYYY-MM-DD or YYYY-MM
 */
function formatDateLabel(dateStr) {
    if (!dateStr) return '';

    const parts = dateStr.split('-');

    if (parts.length === 2) {
        // Monthly view: YYYY-MM
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const monthIndex = parseInt(parts[1]) - 1;
        return `${months[monthIndex]} ${parts[0]}`;
    } else if (parts.length === 3) {
        // Daily view: YYYY-MM-DD
        return `${parseInt(parts[2])}/${parseInt(parts[1])}`;
    }

    return dateStr;
}

/**
 * Convert hex color to rgba
 * @param {string} hex 
 * @param {number} alpha 
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
