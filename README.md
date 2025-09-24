# 🤖 GenReport – Analizador de Rentabilidad para Restaurantes (CamarAI)

¡Bienvenido! Esta es una aplicación web estática diseñada para estimar y visualizar la rentabilidad mensual de un restaurante y el impacto potencial de CamarAI.

El objetivo es simplificar el análisis: introduces unos datos clave de tu negocio y la herramienta genera un informe visual con comparativas y un gráfico para entender, de un vistazo, dónde puede mejorar tu rentabilidad.

### ✨ ¿Cómo funciona?

La app utiliza los datos que introduces en el formulario para calcular y mostrar:

- **Gráfico de barras**: Comparación entre la situación actual y la propuesta «con CamarAI».
- **Comparativas clave**: Rotación de mesas, costes de personal, upselling, número de comandas.
- **Ahorro anual estimado**: Suma del impacto en ventas y reducción de costes.

### 🚀 Cómo usarlo

Rellena los siguientes campos en el formulario de `index.html`:

- **Nombre del restaurante**
- **Facturación media mensual (€)**
- **Número de trabajadores**
- **Coste de los trabajadores mensual (€)**
- **Coste de alquiler mensual (€)**
- **Coste de productos mensual (€)**
- **Coste de suministros mensual (€)**
- **Número de mesas**
- **Número de comandas diarias**

Después, pulsa «Generar Informe». Verás:

- El gráfico de barras con la comparación de ganancias mensuales.
- Las métricas «sin» y «con» CamarAI en cada punto.
- El ahorro anual estimado. Puedes imprimir/guardar en PDF con «Descargar informe».

### 📋 Ejemplo práctico

Puedes probar con estos valores de referencia:

```
Nombre del Restaurante: La Cantina Feliz
Facturación Media Mensual (€): 30000
Número de Trabajadores: 5
Coste de los Trabajadores Mensual (€): 10000
Coste de Alquiler Mensual (€): 3000
Coste de Productos Mensual (€): 8000
Coste de Suministros Mensual (€): 2000
Número de Mesas: 15
Número de Comandas Diarias: 100
```

### 🛠️ Cómo probarlo en local

1. Instalar dependencias

```bash
npm install
```

2. Arrancar el servidor de desarrollo (live-server)

```bash
npm run start
```

3. Abrir en el navegador

```
http://localhost:8000
```

### 🔌 Conexión con tu backend (webhook n8n) – IMPORTANTE

El archivo `index.html` carga `services.js`, pero el repo incluye `services.example.js` como plantilla. Antes de conectar con tu backend o desplegar:

1. Copia el archivo de ejemplo y renómbralo a `services.js` en la raíz del proyecto:

```bash
cp services.example.js services.js
```

2. Edita la URL del endpoint en `services.js` (busca `https://url-servidor/api`) para apuntar a tu webhook de n8n privado:

```js
const response = await fetch("https://TU_URL_DE_N8N_WEBHOOK", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data }),
});
```

3. Asegúrate de que tu flujo en n8n devuelva los campos esperados por la UI. Por defecto, el cliente mapea estos atributos de la respuesta:

- `nombre_restaurante`
- `facturacion_mensual_minima`
- `facturacion_mensual_maxima`
- `rotacion_mesas_antes` y `rotacion_mesas_despues`
- `coste_trabajadores_mensual`
- `numero_comandas_diarias`

### 🧱 Estructura del proyecto

```
genreport/
├─ index.html              # UI principal (Tailwind + Chart.js) y carga de services.js
├─ services.example.js     # Lógica cliente: validación, fetch al backend y gráficos
├─ package.json            # Scripts (live-server)
├─ package-lock.json
└─ README.md
```

### 🎨 Personalización rápida

- **Estilos**: ajusta colores/clases en `index.html` (por ejemplo, el color `#9D59E7`).
- **Textos/UI**: edita títulos y etiquetas en `index.html`.
- **Lógica**: adapta cálculos y mapeos de respuesta en `services.js`.

### 🚀 Despliegue

La app es estática. Puedes servir el directorio con Nginx, Apache, S3+CloudFront, Vercel/Netlify o GitHub Pages. Recuerda desplegar `index.html` y `services.js` (no `services.example.js`).

### 🧩 Solución de problemas

- **El botón no hace nada**: revisa la consola del navegador (errores de JavaScript).
- **Error al procesar datos**: verifica la URL del endpoint en `services.js` y CORS.
- **Gráfico vacío**: confirma que el backend devuelve los campos esperados.
- **404 en services.js**: crea `services.js` a partir de `services.example.js` en la raíz.

### ✨ Copyright 2025 CamarAI

Todos los derechos reservados.
Este software es propietario y no se concede ningún permiso para usarlo, copiarlo, modificarlo ni distribuirlo, salvo a usuarios expresamente autorizados por el titular.
