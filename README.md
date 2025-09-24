GenReport – Generador de Rentabilidad (Camarai)

Descripción
Aplicación web estática para estimar y visualizar la rentabilidad mensual de un restaurante y el impacto potencial de Camarai. Incluye formulario de entrada, comparativas, gráfico de barras con Chart.js y opción de descarga/imprimir del informe.

Características

- Formulario con validación visual de campos requeridos
- Gráfico de barras (Chart.js) comparando situación actual vs. con Camarai
- Métricas de comparativa (rotación de mesas, costes de personal, upselling, comandas)
- Cálculo y visualización de ahorro anual estimado
- Interfaz oscura moderna (Tailwind vía CDN)

Requisitos

- Node.js ≥ 16 (recomendado 18+)
- npm

Instalación y ejecución local

1. Instalar dependencias

```bash
npm install
```

2. Arrancar servidor de desarrollo (live-server)

```bash
npm run start
```

3. Abrir en el navegador

```
http://localhost:8000
```

Estructura del proyecto

```
genreport/
├─ index.html              # UI principal y enlace a services.js
├─ services.example.js     # Lógica de cliente: validación, fetch al backend y gráficos
├─ package.json            # Scripts (live-server)
├─ package-lock.json
└─ README.md
```

Configuración del endpoint (IMPORTANTE)
El archivo `index.html` carga `services.js`, pero el repositorio incluye `services.example.js` como plantilla. Antes de ejecutar en producción o conectar con tu backend:

1. Copia el archivo de ejemplo y renómbralo a `services.js` en la misma carpeta raíz del proyecto.

```bash
cp services.example.js services.js
```

2. Edita la URL del endpoint en `services.js` (búsqueda de `https://url-del-servidor/endpoint`) para apuntar a tu servicio real (por ejemplo, un webhook de n8n):

```js
const response = await fetch("https://url-del-servidor/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data }),
});
```

Uso

1. Completa los campos del formulario (nombre, facturación, empleados, costes, mesas, comandas, etc.).
2. Pulsa «Generar Informe». Se mostrará:
   - Gráfico de barras con facturación mínima/máxima
   - Comparativas «sin» y «con» Camarai
   - Ahorro anual estimado
3. Opcional: pulsa «Descargar informe» para imprimir/guardar en PDF.

Personalización rápida

- Estilos: la paleta está en `index.html` (clases y CSS inline). Puedes ajustar colores (por ejemplo, `#9D59E7`).
- Texto/UI: modifica títulos y etiquetas directamente en `index.html`.
- Lógica de negocio: ajusta cálculos y mapeos de respuesta en `services.js`.

Despliegue
Es una app estática. Opciones:

- Servir el directorio con cualquier servidor estático (Nginx, Apache, S3+CloudFront, Vercel/Netlify, GitHub Pages).
- Asegúrate de desplegar ambos archivos: `index.html` y `services.js` (no `services.example.js`).

Solución de problemas

- Botón no hace nada: revisa la consola del navegador por errores de JavaScript.
- Error al procesar datos: verifica que el endpoint en `services.js` es accesible (CORS, URL correcta, método POST).
- Gráfico vacío: confirma que la respuesta del backend devuelve los campos esperados (`facturacion_mensual_minima`, `facturacion_mensual_maxima`, etc.).
- 404 en `services.js`: asegúrate de haber creado `services.js` a partir de `services.example.js` y que está en la raíz junto a `index.html`.
