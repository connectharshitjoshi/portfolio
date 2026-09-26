// Mobile Navigation Menu Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Copy Email function
function copyEmail() {
    const emailText = document.getElementById('emailText').textContent;
    const copyBtn = document.getElementById('copyBtn');
    
    navigator.clipboard.writeText(emailText).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.color = '#34d399';
        
        setTimeout(() => {
            copyBtn.textContent = 'Copy Email';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Scroll Reveal Animation (Subtle fade-in)
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


/* ==========================================================================
   1. Testimonials Slider Logic
   ========================================================================== */
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.nav-dot');
let testimonialInterval;

function showSlide(index) {
    if (index >= slides.length) { index = 0; }
    if (index < 0) { index = slides.length - 1; }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlideIndex = index;
}

function currentTestimonial(index) {
    showSlide(index);
    resetTestimonialTimer();
}

function startTestimonialTimer() {
    testimonialInterval = setInterval(() => {
        showSlide(currentSlideIndex + 1);
    }, 8000);
}

function resetTestimonialTimer() {
    clearInterval(testimonialInterval);
    startTestimonialTimer();
}

// Start timer on load if testimonials exist
if (slides.length > 0) {
    startTestimonialTimer();
}


/* ==========================================================================
   2. QA Scope & Automation Estimator Logic
   ========================================================================== */
function updateSliderVal(val) {
    document.getElementById('sliderVal').textContent = `${val} ${val == 1 ? 'module' : 'modules'}`;
    calculateQuote();
}

function calculateQuote() {
    const typeSelect = document.getElementById('projectType');
    if (!typeSelect) return; // Prevent errors if loaded on subpages without form

    const type = typeSelect.value;
    const modules = parseInt(document.getElementById('projectPages').value) || 15;
    
    const d1 = document.getElementById('deliv1')?.checked;
    const d2 = document.getElementById('deliv2')?.checked;
    const d3 = document.getElementById('deliv3')?.checked;
    const d4 = document.getElementById('deliv4')?.checked;

    let baseTime = 0;

    // Scope base turnaround (in weeks)
    if (type === 'e2e') {
        baseTime = 2.0;
    } else if (type === 'api') {
        baseTime = 1.5;
    } else { // Full QA Overhaul
        baseTime = 3.0;
    }

    // Deliverables add-on times
    if (d1) { baseTime += 0.4; } // Cross-browser suite
    if (d2) { baseTime += 0.4; } // API test scripts
    if (d3) { baseTime += 0.5; } // CI/CD quality gates
    if (d4) { baseTime += 0.3; } // Allure / HTML reporting

    // Module count adjustment
    if (modules > 15) {
        const extra = modules - 15;
        baseTime += extra * 0.08;
    } else if (modules < 15) {
        const saved = 15 - modules;
        baseTime -= saved * 0.05;
    }

    // Time Range formatting
    const minTime = Math.max(1, Math.floor(baseTime));
    const maxTime = Math.ceil(baseTime + 1);

    // Update outputs
    const resultTimeline = document.getElementById('resultTimeline');
    if (resultTimeline) {
        resultTimeline.textContent = `${minTime} - ${maxTime} weeks`;
    }
}

// Initialize calculator values on run
calculateQuote();


/* ==========================================================================
   3. Direct QA Inquiry Form Handler
   ========================================================================== */
function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Gather estimator values to include them in the email notification
    const typeSelect = document.getElementById('projectType');
    const type = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : 'N/A';
    const modules = document.getElementById('projectPages') ? document.getElementById('projectPages').value : 'N/A';
    
    const d1 = document.getElementById('deliv1')?.checked ? "Yes" : "No";
    const d2 = document.getElementById('deliv2')?.checked ? "Yes" : "No";
    const d3 = document.getElementById('deliv3')?.checked ? "Yes" : "No";
    const d4 = document.getElementById('deliv4')?.checked ? "Yes" : "No";
    
    const timeline = document.getElementById('resultTimeline')?.textContent || 'N/A';

    // Construct request body
    const formData = new FormData(form);
    
    // Append estimator data to form data so it is emailed as fields
    formData.append('Estimator_Testing_Scope', type);
    formData.append('Estimator_Modules_Count', modules);
    formData.append('Estimator_Cross_Browser', d1);
    formData.append('Estimator_API_Scripts', d2);
    formData.append('Estimator_CICD_Gates', d3);
    formData.append('Estimator_Reports', d4);
    formData.append('Estimator_Timeline', timeline);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    })
    .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
            submitBtn.textContent = 'Message Received!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            form.reset();
            if (typeof calculateQuote === 'function') calculateQuote(); // Reset estimator UI too
        } else {
            console.error(json);
            submitBtn.textContent = 'Error sending!';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
    })
    .catch((error) => {
        console.error(error);
        submitBtn.textContent = 'Error sending!';
        submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    })
    .then(() => {
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 4000);
    });
}


/* ==========================================================================
   4. QA Metrics Lab / Dynamic SVG Chart Renderer
   ========================================================================== */
const dashboardData = {
    traffic: { // Automated Test Runs
        7: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [1200, 1450, 1100, 1650, 1900, 1500, 1800],
            kpis: ['10.6K', '1.9K', '0.4%']
        },
        30: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [5200, 6100, 5800, 7400],
            kpis: ['24.5K', '7.4K', '0.3%']
        }
    },
    conversions: { // Pass Rate %
        7: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [98.5, 99.1, 98.4, 99.5, 99.8, 99.2, 99.7],
            kpis: ['99.2%', '99.8%', '99.5%']
        },
        30: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [98.6, 99.0, 99.3, 99.6],
            kpis: ['99.1%', '99.6%', '99.4%']
        }
    },
    revenue: { // Defects Blocked
        7: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [14, 22, 18, 31, 28, 12, 25],
            kpis: ['150', '31', '98.5%']
        },
        30: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [84, 112, 96, 138],
            kpis: ['430', '138', '99.1%']
        }
    }
};

let activeMetric = 'traffic';
let activePeriod = 7;

function switchMetric(metric) {
    activeMetric = metric;
    
    // Toggle active tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (
            (metric === 'traffic' && tab.textContent.includes('Test Runs')) ||
            (metric === 'conversions' && tab.textContent.includes('Pass Rate')) ||
            (metric === 'revenue' && tab.textContent.includes('Defects'))
        ) {
            tab.classList.add('active');
        }
    });

    updateKPIs();
    renderChart();
}

function filterPeriod(period) {
    activePeriod = period;
    
    // Toggle active filters
    const filters = document.querySelectorAll('.dashboard-filter');
    filters.forEach(filter => {
        filter.classList.remove('active');
        if (filter.textContent.includes(period)) {
            filter.classList.add('active');
        }
    });

    updateKPIs();
    renderChart();
}

function updateKPIs() {
    const kpis = dashboardData[activeMetric][activePeriod].kpis;
    
    const kpiTitleMap = {
        traffic: ['Total Tests Run', 'Peak Daily Suites', 'Defect Leakage'],
        conversions: ['Average Pass Rate', 'Peak Pass Rate', 'Regression Stability'],
        revenue: ['Defects Prevented', 'Peak Bugs Caught', 'Pre-Release SLA']
    };

    const changes = {
        traffic: ['↑ 12.4%', '↑ 8.2%', '↓ 0.2%'],
        conversions: ['↑ 0.8%', '↑ 0.5%', '↑ 0.4%'],
        revenue: ['↑ 18.2%', '↑ 12.4%', '↑ 99.5%']
    };

    // Update titles
    document.getElementById('kpiTitle1').textContent = kpiTitleMap[activeMetric][0];
    document.getElementById('kpiTitle2').textContent = kpiTitleMap[activeMetric][1];
    document.getElementById('kpiTitle3').textContent = kpiTitleMap[activeMetric][2];

    // Update values
    document.getElementById('kpiVal1').textContent = kpis[0];
    document.getElementById('kpiVal2').textContent = kpis[1];
    document.getElementById('kpiVal3').textContent = kpis[2];

    // Update changes
    const change1 = document.getElementById('kpiChange1');
    const change2 = document.getElementById('kpiChange2');
    const change3 = document.getElementById('kpiChange3');

    change1.textContent = changes[activeMetric][0];
    change2.textContent = changes[activeMetric][1];
    change3.textContent = changes[activeMetric][2];

    // Align positive/negative change CSS classes
    if (activeMetric === 'traffic') {
        change3.className = 'kpi-change down'; // Defect leakage decrease is good
    } else {
        change3.className = 'kpi-change up';
    }
}

function renderChart() {
    const chartSvg = document.getElementById('chartSvg');
    if (!chartSvg) return; // Prevent issues if DOM not loaded

    const dataSet = dashboardData[activeMetric][activePeriod];
    const values = dataSet.values;
    const labels = dataSet.labels;

    const width = 800;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 50;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate scaling
    const maxValue = Math.max(...values) * 1.15;
    const minValue = 0; // Baseline at 0

    // Coordinate mapping functions
    const getX = (index) => paddingLeft + (index / (values.length - 1)) * chartWidth;
    const getY = (val) => height - paddingBottom - ((val - minValue) / (maxValue - minValue)) * chartHeight;

    // Generate Path points
    let points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));

    // Create cubic curve string for smooth visual lines
    let dLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cpY1 = points[i].y;
        const cpX2 = points[i].x + 2 * (points[i + 1].x - points[i].x) / 3;
        const cpY2 = points[i + 1].y;
        dLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    // Set paths
    document.getElementById('chartLine').setAttribute('d', dLine);

    // Gradient fill area path
    let dArea = `${dLine} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    document.getElementById('chartArea').setAttribute('d', dArea);

    // Render points and tooltips
    const pointsGroup = document.getElementById('chartPoints');
    pointsGroup.innerHTML = ''; // Reset point items

    const tooltip = document.getElementById('chartTooltip');

    values.forEach((val, idx) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', points[idx].x);
        circle.setAttribute('cy', points[idx].y);
        circle.setAttribute('class', 'chart-point');

        // Add tooltips event listeners
        circle.addEventListener('mouseover', (e) => {
            const rect = chartSvg.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Format output label
            let displayVal = val.toLocaleString();
            if (activeMetric === 'revenue') displayVal = `$${displayVal}`;
            
            tooltip.innerHTML = `<strong>${labels[idx]}</strong>: ${displayVal}`;
            tooltip.style.opacity = 1;
            tooltip.style.left = `${points[idx].x + rect.left + scrollLeft - 50}px`;
            tooltip.style.top = `${points[idx].y + rect.top + scrollTop - 60}px`;
        });

        circle.addEventListener('mouseout', () => {
            tooltip.style.opacity = 0;
        });

        pointsGroup.appendChild(circle);
    });

    // Render X Labels
    const labelsXGroup = document.getElementById('chartLabelsX');
    labelsXGroup.innerHTML = '';
    labels.forEach((label, idx) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', points[idx].x);
        text.setAttribute('y', height - 15);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = label;
        labelsXGroup.appendChild(text);
    });

    // Render Y Labels
    const labelsYGroup = document.getElementById('chartLabelsY');
    labelsYGroup.innerHTML = '';
    const ySegments = 4;
    for (let i = 0; i <= ySegments; i++) {
        const val = minValue + (i / ySegments) * (maxValue - minValue);
        const y = height - paddingBottom - (i / ySegments) * chartHeight;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', paddingLeft - 15);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        
        let labelText = Math.round(val).toLocaleString();
        if (activeMetric === 'revenue') labelText = `$${labelText}`;
        text.textContent = labelText;
        
        labelsYGroup.appendChild(text);
    }
}

// Initial draw on script run
if (document.getElementById('chartSvg')) {
    renderChart();
    window.addEventListener('resize', renderChart);
}
