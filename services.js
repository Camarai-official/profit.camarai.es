document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const reportContent = document.getElementById('report-content');
    const loadingOverlay = document.getElementById('loading-overlay');
    let barChart;

    function getCurrencyForLocale(locale) {
        const l = (locale || '').toLowerCase();
        if (l.includes('us')) return 'USD';
        if (l.includes('gb') || l.includes('uk')) return 'GBP';
        if (l.includes('jp')) return 'JPY';
        if (l.includes('cn') || l.includes('zh-cn')) return 'CNY';
        if (l.includes('tw') || l.includes('zh-tw')) return 'TWD';
        if (l.includes('br') || l.includes('pt-br')) return 'BRL';
        if (l.includes('mx')) return 'MXN';
        if (l.includes('ar')) return 'ARS';
        if (l.includes('cl')) return 'CLP';
        if (l.includes('co')) return 'COP';
        if (l.includes('pe')) return 'PEN';
        if (l.includes('ca')) return 'CAD';
        if (l.includes('au')) return 'AUD';
        if (l.includes('in')) return 'INR';
        if (l.includes('ch')) return 'CHF';
        if (l.includes('se')) return 'SEK';
        if (l.includes('no')) return 'NOK';
        if (l.includes('dk')) return 'DKK';
        if (l.includes('pl')) return 'PLN';
        if (l.includes('cz')) return 'CZK';
        if (l.includes('hu')) return 'HUF';
        if (l.includes('ru')) return 'RUB';
        if (l.includes('tr')) return 'TRY';
        if (l.includes('il') || l.includes('he')) return 'ILS';
        if (l.includes('kr')) return 'KRW';
        if (l.includes('sa') || l.includes('ae')) return 'SAR';
        return 'EUR';
    }

    function getNumberFormatter() {
        const locale = (navigator.language || 'es-ES');
        const currency = getCurrencyForLocale(locale);
        const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 });
        const numberFormatter = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const suffixCurrencyFormatter = (value) => {
            const nbsp = '\u00A0';
            const safeValue = Number.isFinite(value) ? value : 0;
            const abs = Math.abs(safeValue);
            const sign = safeValue < 0 ? '-' : '';
            try {
                if (typeof currencyFormatter.formatToParts === 'function') {
                    const parts = currencyFormatter.formatToParts(abs);
                    const currencyPart = parts.find(p => p.type === 'currency');
                    const currencySymbol = currencyPart ? currencyPart.value : '';
                    const number = numberFormatter.format(abs);
                    return `${sign}${number}${nbsp}${currencySymbol}`.trim();
                }
            } catch (_) {}
            // Fallback: extrae símbolo y compón sufijo manualmente
            const formatted = currencyFormatter.format(abs);
            const symbol = formatted.replace(/[\d\s.,\u00A0\u202F\u200E\u200F\-+]/g, '');
            const numberOnly = numberFormatter.format(abs);
            return `${sign}${numberOnly}${nbsp}${symbol}`.trim();
        };
        return { locale, currency, currencyFormatter, suffixCurrencyFormatter, numberFormatter };
    }

    function getParamsUrl() {
        let wa = ''
        let email = ''
        let name = ''
        let status_opened_with_params = false

        const raw = (window.location && (window.location.hash || window.location.search)) || ''
        const cleaned = raw.replace(/^#/, '').replace(/^\?/, '')
        const normalized = cleaned.replace(/\?/g, '&')
        const params = new URLSearchParams(normalized)

        wa = params.get('wa') || ''
        email = params.get('email') || ''
        name = params.get('name') || ''

        if (wa || email || name) {
            status_opened_with_params = true
        }

        if (status_opened_with_params)
        {
            fetch('https://bot1.camarai.es/webhook/genreport-opened', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wa, email, name })
        });
        }
    }

    getParamsUrl()


    // --- Función para renderizar gráfico de barras ---
    function renderBarChart(nombreRestaurante, minRevenue, maxRevenue) {
		const ctx = document.getElementById('bar-chart-rentabilidad').getContext('2d');
		if (barChart) barChart.destroy();
		const base = minRevenue ?? 0;
		const mejora = Math.max((maxRevenue ?? 0) - base, 0);
        const { locale, currency, suffixCurrencyFormatter } = getNumberFormatter();
		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
                labels: [nombreRestaurante, nombreRestaurante + ' + Camarai'],
					datasets: [
						{
                            label: 'Ganancia base (' + nombreRestaurante + ')',
							data: [base, 0],
							backgroundColor: '#E74C3C'
						},
						{
                            label: 'Ganancia base (' + nombreRestaurante + ' + Camarai)',
							data: [0, base],
							backgroundColor: '#9D59E7'
						},
						{
                            label: 'Mejora con Camarai',
							data: [0, mejora],
							backgroundColor: '#34D399'
                        }
					]
			},
			options: {
				responsive: true,
				plugins: {
					legend: { display: true, labels: { padding: 16, color: '#E0E0E0' } },
					tooltip: {
						callbacks: {
                            label: context => {
                                const value = context.parsed.y ?? 0;
                                return `${context.dataset.label}: ${suffixCurrencyFormatter(value)}`;
                            }
						}
					}
				},
				layout: { padding: { top: 8 } },
				scales: {
					x: { ticks: { color: '#E0E0E0', font: { weight: 'bold' } } },
					y: { beginAtZero: true, ticks: { color: '#E0E0E0', font: { weight: 'bold' } } }
				}
			}
		});

        // --- Función para mostrar estilo de charts ---
		function setChartPrintStyles(chart, printing) {
			try {
				const color = printing ? '#000000' : '#E0E0E0';
				const weight = printing ? 'bold' : 'bold';
				chart.options.scales.x.ticks.color = color;
				chart.options.scales.x.ticks.font = { ...(chart.options.scales.x.ticks.font||{}), weight };
				chart.options.scales.y.ticks.color = color;
				chart.options.scales.y.ticks.font = { ...(chart.options.scales.y.ticks.font||{}), weight };
				if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
					chart.options.plugins.legend.labels.color = color;
					chart.options.plugins.legend.labels.font = { ...(chart.options.plugins.legend.labels.font||{}), weight };
				}
				chart.update('none');
			} catch (_) {}
		}

		function handleBeforePrint() { setChartPrintStyles(barChart, true); }
		function handleAfterPrint() { setChartPrintStyles(barChart, false); }

		try {
			window.removeEventListener('beforeprint', handleBeforePrint);
			window.removeEventListener('afterprint', handleAfterPrint);
		} catch(_) {}
		window.addEventListener('beforeprint', handleBeforePrint);
		window.addEventListener('afterprint', handleAfterPrint);
	}

    // --- Función para actualizar texto de un elemento por id ---
    function setTextById(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    // --- Obtener datos del formulario (para valores "antes") ---
    function getFormData() {
        const fields = [
            'restaurant-name', 'monthly-revenue', 'employees', 'employee-cost',
            'rent-cost', 'product-cost', 'supply-cost', 'tables', 'daily-orders'
        ];
        let hasError = false;
        fields.forEach(id => {
            const input = document.getElementById(id);
            const bubble = input.nextElementSibling;
            if (input.value.trim() === '') {
                input.classList.add('input-error');
                bubble.classList.remove('hidden');
                input.setAttribute('data-error', 'true');
                hasError = true;
            } else {
                input.classList.remove('input-error');
                bubble.classList.add('hidden');
                input.setAttribute('data-error', 'false');
            }
        });
        if (hasError) return null;
        const values = fields.map(id => document.getElementById(id).value.trim());
        return {
            nombre_restaurante: values[0],
            facturacion_media_mensual: parseFloat(values[1]),
            numero_empleados: parseInt(values[2]),
            coste_trabajadores_mensual: parseFloat(values[3]),
            coste_alquiler_mensual: parseFloat(values[4]),
            coste_productos_mensual: parseFloat(values[5]),
            suministro_mensual: parseFloat(values[6]),
            numero_mesas: parseInt(values[7]),
            numero_comandas_diarias: parseInt(values[8])
        };
    }

    // --- Función principal para enviar los datos y procesar la respuesta de N8N ---
    async function enviarYProcesar(data) {
        try {
            loadingOverlay.classList.remove('hidden');

            const response = await fetch('https://bot1.camarai.es/webhook/gen-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            if (!response.ok) throw new Error('Error al enviar los datos al servidor');

            const processed = await response.json();
            const p = processed[0]?.data;
            if (!p) throw new Error('Datos procesados vacíos');

			// Diferencia de coste de personal (antes - después)
			const staffDelta = (data.coste_trabajadores_mensual ?? 0) - (p.coste_trabajadores_mensual ?? 0);

            // --- Gráfico de barras ---
            renderBarChart(
                p.nombre_restaurante ?? data.nombre_restaurante,
                p.facturacion_mensual_minima ?? data.facturacion_media_mensual,
				((p.facturacion_mensual_maxima ?? data.facturacion_media_mensual) + (staffDelta ?? 0))
            );

            // --- Comparativas punto a punto ---
            setTextById('turnover-without', p.rotacion_mesas_antes);
            setTextById('turnover-with', p.rotacion_mesas_despues);

            const { suffixCurrencyFormatter, numberFormatter } = getNumberFormatter();
            setTextById('staff-cost-without', suffixCurrencyFormatter(data.coste_trabajadores_mensual));
            setTextById('staff-cost-with', suffixCurrencyFormatter(p.coste_trabajadores_mensual));

            setTextById('upsell-without', suffixCurrencyFormatter(0));
            const upsellWith = p.facturacion_mensual_maxima - p.facturacion_mensual_minima;
            setTextById('upsell-with', suffixCurrencyFormatter(upsellWith));

            setTextById('orders-without', numberFormatter.format(data.numero_comandas_diarias));
            setTextById('orders-with', numberFormatter.format(p.numero_comandas_diarias ?? data.numero_comandas_diarias));

            const totalSavings = (upsellWith ?? 0) + (staffDelta ?? 0);
            setTextById('yearly-savings', `+ ${suffixCurrencyFormatter(totalSavings*12)}`);
            const savingsCard = document.getElementById('savings-card');
            if (savingsCard) savingsCard.classList.remove('hidden');

            // Mostrar reporte
            reportContent.classList.remove('hidden');
            reportContent.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            const txt = (window.I18N?.error_processing || 'Hubo un error al procesar los datos: ') + error.message;
            alert(txt);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }

    // --- Event listener del botón ---
    generateBtn.addEventListener('click', async () => {
        const data = getFormData();
        if (!data) return;
        await enviarYProcesar(data);
    });

    // --- Event listeners para los inputs para eliminar el texto de error ---
    const inputs = document.querySelectorAll('.input-form');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                input.classList.remove('input-error');
                input.nextElementSibling.classList.add('hidden');
                input.setAttribute('data-error', 'false');
            }
        });
    });

    // Proteger elementos monetarios frente a auto-traducción/reordenación
    const amountIds = [
        'staff-cost-without', 'staff-cost-with',
        'upsell-without', 'upsell-with',
        'yearly-savings'
    ];
    amountIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            el.setAttribute('translate', 'no');
            el.classList.add('notranslate');
            el.style.direction = 'ltr';
            el.style.unicodeBidi = 'isolate';
            el.style.whiteSpace = 'nowrap';
        } catch (_) {}
    });

    function setupPrintLogoHandler() {
        const logoImg = document.querySelector('#logo-wrap img');
        if (!logoImg) return;

        const originalSrc = logoImg.getAttribute('src');
        const pngSrc = 'resources/logo/camarai logo.png';

        function handleBeforePrintLogo() {
            try { logoImg.setAttribute('src', pngSrc); } catch (e) {}
        }

        function handleAfterPrintLogo() {
            try { logoImg.setAttribute('src', originalSrc); } catch (e) {}
        }

        if (window.matchMedia) {
            try {
                const mediaQueryList = window.matchMedia('print');
                mediaQueryList.addEventListener('change', function (mql) {
                    if (mql.matches) handleBeforePrintLogo();
                    else handleAfterPrintLogo();
                });
            } catch (_) {}
        }

        try { window.addEventListener('beforeprint', handleBeforePrintLogo); } catch (_) {}
        try { window.addEventListener('afterprint', handleAfterPrintLogo); } catch (_) {}

        const printButtons = document.querySelectorAll('button[onclick]');
        printButtons.forEach(btn => {
            const attr = btn.getAttribute('onclick');
            if (!attr) return;
            if (attr.includes('window.print')) {
                btn.addEventListener('click', function() {
                });
            }
        });
    }
    setupPrintLogoHandler();

});
