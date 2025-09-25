document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const reportContent = document.getElementById('report-content');
    const loadingOverlay = document.getElementById('loading-overlay');
    let barChart;

    //-- Función para enviar los parametros de la URL que visita el dueño del restaurante
    function getParamsUrl() {
        let wa = ''
        let email = ''
        let status_opened_with_params = false

        const raw = (window.location && (window.location.hash || window.location.search)) || ''
        const cleaned = raw.replace(/^#/, '').replace(/^\?/, '')
        const normalized = cleaned.replace(/\?/g, '&')
        const params = new URLSearchParams(normalized)

        wa = params.get('wa') || ''
        email = params.get('email') || ''

        if (wa || email) {
            status_opened_with_params = true
        }
        
        if (status_opened_with_params)
        {
            fetch('https://bot1.camarai.es/webhook/genreport-opened', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wa, email })
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
		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: [nombreRestaurante, nombreRestaurante + ' + Camarai'],
					datasets: [
						{
							label: 'Ganancia base (Takos)',
							data: [base, 0],
							backgroundColor: '#E74C3C'
						},
						{
							label: 'Ganancia base (Takos + Camarai)',
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
					legend: { display: true },
					tooltip: {
						callbacks: {
							label: context => {
								const value = context.parsed.y ?? 0;
								return `${context.dataset.label}: €${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
							}
						}
					}
				},
				scales: {
					x: { ticks: { color: '#E0E0E0', font: { weight: 'bold' } } },
					y: { beginAtZero: true, ticks: { color: '#E0E0E0' } }
				}
			}
		});
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

            setTextById('staff-cost-without', `${data.coste_trabajadores_mensual.toLocaleString('es-ES')} €`);
            setTextById('staff-cost-with', `${p.coste_trabajadores_mensual.toLocaleString('es-ES')} €`);

            setTextById('upsell-without', '0 €');
            const upsellWith = p.facturacion_mensual_maxima - p.facturacion_mensual_minima;
            setTextById('upsell-with', `${upsellWith.toLocaleString('es-ES')} €`);

            setTextById('orders-without', data.numero_comandas_diarias);
            setTextById('orders-with', p.numero_comandas_diarias ?? data.numero_comandas_diarias);

            const totalSavings = (upsellWith ?? 0) + (staffDelta ?? 0);
            setTextById('yearly-savings', `+ ${(totalSavings*12).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`);
            const savingsCard = document.getElementById('savings-card');
            if (savingsCard) savingsCard.classList.remove('hidden');

            // Mostrar reporte
            reportContent.classList.remove('hidden');
            reportContent.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert('Hubo un error al procesar los datos: ' + error.message);
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
});
