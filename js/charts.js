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
    height: null,
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
    height: '#10b981',
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
    renderHeightChart(data.weightBmi);
    renderBMIChart(data.weightBmi);
    renderBloodPressureChart(data.bloodPressure);
    renderSpO2Chart(data.o2);
    renderBloodSugarChart(data.sugar);

    // Update statistics summary
    updateStatsSummary(data);

    // Generate health recommendations
    generateHealthRecommendations(data);
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

    if (parts.length === 1) {
        // Yearly view: YYYY
        return 'พ.ศ. ' + (parseInt(parts[0]) + 543);
    } else if (parts.length === 2) {
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

// ====================================================
// HEIGHT CHART
// ====================================================

/**
 * Render กราฟส่วนสูง
 * @param {Array} data 
 */
function renderHeightChart(data) {
    const ctx = document.getElementById('heightChart');
    const emptyEl = document.getElementById('heightEmpty');

    // Destroy existing chart
    if (chartInstances.height) {
        chartInstances.height.destroy();
    }

    // Check if data exists
    if (!data || data.length === 0 || !data.some(d => d.height > 0)) {
        ctx.style.display = 'none';
        emptyEl.classList.remove('d-none');
        return;
    }

    ctx.style.display = 'block';
    emptyEl.classList.add('d-none');

    chartInstances.height = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'ส่วนสูง (cm)',
                data: data.map(d => d.height),
                borderColor: chartColors.height,
                backgroundColor: hexToRgba(chartColors.height, 0.1),
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
                        text: 'cm'
                    }
                }
            }
        }
    });
}

// ====================================================
// STATISTICS SUMMARY
// ====================================================

/**
 * อัปเดต statistics summary cards
 * @param {Object} data - ข้อมูลจาก API
 */
function updateStatsSummary(data) {
    // Calculate averages
    const weightBmi = data.weightBmi || [];
    const bloodPressure = data.bloodPressure || [];
    const o2 = data.o2 || [];
    const sugar = data.sugar || [];

    // Weight average
    const weightValues = weightBmi.map(d => d.weight).filter(v => v > 0);
    const avgWeight = weightValues.length > 0
        ? (weightValues.reduce((a, b) => a + b, 0) / weightValues.length).toFixed(1)
        : '-';
    document.getElementById('avgWeight').textContent = avgWeight;

    // Height average
    const heightValues = weightBmi.map(d => d.height).filter(v => v > 0);
    const avgHeight = heightValues.length > 0
        ? (heightValues.reduce((a, b) => a + b, 0) / heightValues.length).toFixed(1)
        : '-';
    document.getElementById('avgHeight').textContent = avgHeight;

    // BMI average
    const bmiValues = weightBmi.map(d => d.bmi).filter(v => v > 0);
    const avgBmi = bmiValues.length > 0
        ? (bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length).toFixed(1)
        : '-';
    document.getElementById('avgBmi').textContent = avgBmi;

    // Blood Pressure averages
    const sysValues = bloodPressure.map(d => d.sys).filter(v => v > 0);
    const diaValues = bloodPressure.map(d => d.dia).filter(v => v > 0);
    const avgSys = sysValues.length > 0
        ? Math.round(sysValues.reduce((a, b) => a + b, 0) / sysValues.length)
        : '-';
    const avgDia = diaValues.length > 0
        ? Math.round(diaValues.reduce((a, b) => a + b, 0) / diaValues.length)
        : '-';
    document.getElementById('avgBp').textContent = avgSys !== '-' ? `${avgSys}/${avgDia}` : '-';

    // SpO2 average
    const spo2Values = o2.map(d => d.spo2).filter(v => v > 0);
    const avgSpo2 = spo2Values.length > 0
        ? (spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(1)
        : '-';
    document.getElementById('avgSpo2').textContent = avgSpo2;

    // Sugar average
    const sugarValues = sugar.map(d => d.sugar).filter(v => v > 0);
    const avgSugar = sugarValues.length > 0
        ? Math.round(sugarValues.reduce((a, b) => a + b, 0) / sugarValues.length)
        : '-';
    document.getElementById('avgSugar').textContent = avgSugar;

    // Update quality badges
    updateQualityBadges({
        weight: avgWeight,
        height: avgHeight,
        bmi: parseFloat(avgBmi),
        sys: parseFloat(avgSys),
        dia: parseFloat(avgDia),
        spo2: parseFloat(avgSpo2),
        sugar: parseInt(avgSugar)
    });
}

/**
 * อัปเดต quality badges ตามเกณฑ์
 */
function updateQualityBadges(averages) {
    // BMI quality
    const bmiQuality = getQualityCriteria('bmi', averages.bmi);
    updateBadge('qualityBmi', bmiQuality);

    // Blood Pressure quality (using sys)
    const bpQuality = getQualityCriteria('bp', { sys: averages.sys, dia: averages.dia });
    updateBadge('qualityBp', bpQuality);

    // SpO2 quality
    const spo2Quality = getQualityCriteria('spo2', averages.spo2);
    updateBadge('qualitySpo2', spo2Quality);

    // Sugar quality
    const sugarQuality = getQualityCriteria('sugar', averages.sugar);
    updateBadge('qualitySugar', sugarQuality);

    // Weight and Height - no specific criteria, just show neutral
    updateBadge('qualityWeight', { status: 'neutral', label: '-' });
    updateBadge('qualityHeight', { status: 'neutral', label: '-' });
}

/**
 * อัปเดต badge element
 */
function updateBadge(elementId, quality) {
    const badge = document.getElementById(elementId);
    if (!badge) return;

    badge.textContent = quality.label;
    badge.className = 'quality-badge ' + quality.status;
}

/**
 * ประเมินเกณฑ์คุณภาพ
 * @param {string} type - ประเภทค่า
 * @param {number|object} value - ค่าที่จะประเมิน
 * @returns {object} - { status: 'good'|'warning'|'danger'|'neutral', label: string }
 */
function getQualityCriteria(type, value) {
    if (value === null || value === undefined || isNaN(value) || (typeof value === 'object' && (isNaN(value.sys) || isNaN(value.dia)))) {
        return { status: 'neutral', label: '-' };
    }

    switch (type) {
        case 'bmi':
            if (value >= 18.5 && value <= 24.9) {
                return { status: 'good', label: 'ปกติ' };
            } else if ((value >= 25 && value <= 29.9) || (value < 18.5 && value > 0)) {
                return { status: 'warning', label: 'เฝ้าระวัง' };
            } else if (value >= 30) {
                return { status: 'danger', label: 'สูง' };
            }
            break;

        case 'bp':
            const sys = value.sys;
            const dia = value.dia;
            if (sys < 120 && dia < 80) {
                return { status: 'good', label: 'ปกติ' };
            } else if ((sys >= 120 && sys <= 139) || (dia >= 80 && dia <= 89)) {
                return { status: 'warning', label: 'เฝ้าระวัง' };
            } else if (sys >= 140 || dia >= 90) {
                return { status: 'danger', label: 'สูง' };
            }
            break;

        case 'spo2':
            if (value >= 95) {
                return { status: 'good', label: 'ปกติ' };
            } else if (value >= 90 && value < 95) {
                return { status: 'warning', label: 'ต่ำเล็กน้อย' };
            } else if (value < 90 && value > 0) {
                return { status: 'danger', label: 'ต่ำ' };
            }
            break;

        case 'sugar':
            if (value < 100) {
                return { status: 'good', label: 'ปกติ' };
            } else if (value >= 100 && value <= 125) {
                return { status: 'warning', label: 'เฝ้าระวัง' };
            } else if (value >= 126) {
                return { status: 'danger', label: 'สูง' };
            }
            break;
    }

    return { status: 'neutral', label: '-' };
}

// ====================================================
// HEALTH RECOMMENDATIONS
// ====================================================

/**
 * สร้างคำแนะนำสุขภาพ
 * @param {Object} data - ข้อมูลจาก API
 */
function generateHealthRecommendations(data) {
    const recommendations = [];
    const weightBmi = data.weightBmi || [];
    const bloodPressure = data.bloodPressure || [];
    const o2 = data.o2 || [];
    const sugar = data.sugar || [];

    // Calculate averages for evaluation
    const bmiValues = weightBmi.map(d => d.bmi).filter(v => v > 0);
    const avgBmi = bmiValues.length > 0
        ? bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length
        : null;

    const sysValues = bloodPressure.map(d => d.sys).filter(v => v > 0);
    const diaValues = bloodPressure.map(d => d.dia).filter(v => v > 0);
    const avgSys = sysValues.length > 0 ? sysValues.reduce((a, b) => a + b, 0) / sysValues.length : null;
    const avgDia = diaValues.length > 0 ? diaValues.reduce((a, b) => a + b, 0) / diaValues.length : null;

    const spo2Values = o2.map(d => d.spo2).filter(v => v > 0);
    const avgSpo2 = spo2Values.length > 0
        ? spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length
        : null;

    const sugarValues = sugar.map(d => d.sugar).filter(v => v > 0);
    const avgSugar = sugarValues.length > 0
        ? sugarValues.reduce((a, b) => a + b, 0) / sugarValues.length
        : null;

    // BMI recommendations
    if (avgBmi !== null) {
        if (avgBmi >= 25 && avgBmi < 30) {
            recommendations.push({
                icon: 'bi-person-walking',
                title: 'น้ำหนักเกินเกณฑ์เล็กน้อย',
                text: 'แนะนำให้ออกกำลังกายสม่ำเสมออย่างน้อย 30 นาทีต่อวัน และควบคุมอาหารที่มีไขมันสูง',
                type: 'warning'
            });
        } else if (avgBmi >= 30) {
            recommendations.push({
                icon: 'bi-exclamation-triangle',
                title: 'BMI อยู่ในเกณฑ์อ้วน',
                text: 'ควรปรึกษาแพทย์เพื่อวางแผนลดน้ำหนักอย่างเหมาะสม และหลีกเลี่ยงอาหารที่มีน้ำตาลและไขมันสูง',
                type: 'danger'
            });
        } else if (avgBmi < 18.5) {
            recommendations.push({
                icon: 'bi-cup-hot',
                title: 'น้ำหนักต่ำกว่าเกณฑ์',
                text: 'ควรรับประทานอาหารให้ครบ 5 หมู่ และเพิ่มโปรตีนในมื้ออาหาร',
                type: 'warning'
            });
        } else {
            recommendations.push({
                icon: 'bi-check-circle',
                title: 'BMI อยู่ในเกณฑ์ปกติ',
                text: 'รักษาน้ำหนักและดูแลสุขภาพต่อเนื่อง ออกกำลังกายสม่ำเสมอ',
                type: 'good'
            });
        }
    }

    // Blood Pressure recommendations
    if (avgSys !== null && avgDia !== null) {
        if (avgSys >= 140 || avgDia >= 90) {
            recommendations.push({
                icon: 'bi-heart-pulse',
                title: 'ความดันโลหิตสูง',
                text: 'ควรลดการบริโภคเกลือ หลีกเลี่ยงความเครียด และปรึกษาแพทย์เพื่อติดตามอาการ',
                type: 'danger'
            });
        } else if (avgSys >= 120 || avgDia >= 80) {
            recommendations.push({
                icon: 'bi-heart',
                title: 'ความดันโลหิตค่อนข้างสูง',
                text: 'ควรลดอาหารเค็ม พักผ่อนให้เพียงพอ และตรวจวัดความดันเป็นประจำ',
                type: 'warning'
            });
        }
    }

    // SpO2 recommendations
    if (avgSpo2 !== null) {
        if (avgSpo2 < 90) {
            recommendations.push({
                icon: 'bi-lungs',
                title: 'ออกซิเจนในเลือดต่ำ',
                text: 'ควรพบแพทย์โดยเร็ว อาจมีปัญหาเกี่ยวกับระบบทางเดินหายใจ',
                type: 'danger'
            });
        } else if (avgSpo2 >= 90 && avgSpo2 < 95) {
            recommendations.push({
                icon: 'bi-wind',
                title: 'ออกซิเจนต่ำกว่าปกติเล็กน้อย',
                text: 'ควรหายใจลึกๆ อยู่ในที่อากาศถ่ายเท และติดตามค่า SpO2 อย่างใกล้ชิด',
                type: 'warning'
            });
        }
    }

    // Blood Sugar recommendations
    if (avgSugar !== null) {
        if (avgSugar >= 126) {
            recommendations.push({
                icon: 'bi-droplet-fill',
                title: 'น้ำตาลในเลือดสูง',
                text: 'ควรพบแพทย์เพื่อตรวจเพิ่มเติม ลดการบริโภคน้ำตาลและแป้ง',
                type: 'danger'
            });
        } else if (avgSugar >= 100 && avgSugar < 126) {
            recommendations.push({
                icon: 'bi-droplet-half',
                title: 'น้ำตาลเริ่มสูง (Pre-diabetes)',
                text: 'ควรควบคุมอาหาร ลดน้ำตาลและแป้งขัดสี ออกกำลังกายสม่ำเสมอ',
                type: 'warning'
            });
        }
    }

    // If no data
    if (recommendations.length === 0) {
        recommendations.push({
            icon: 'bi-info-circle',
            title: 'ยังไม่มีข้อมูลเพียงพอ',
            text: 'กรุณาบันทึกข้อมูลสุขภาพอย่างต่อเนื่องเพื่อรับคำแนะนำที่เหมาะสม',
            type: 'neutral'
        });
    }

    // Render recommendations
    renderRecommendations(recommendations);
}

/**
 * Render คำแนะนำใน HTML
 */
function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendationsList');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item recommendation-${rec.type}">
            <div class="recommendation-icon">
                <i class="bi ${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            </div>
        </div>
    `).join('');
}

