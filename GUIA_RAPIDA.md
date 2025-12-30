# Guía Rápida de Despliegue en Vercel

## Problema Resuelto
El error 404 en Vercel ocurría porque el proyecto tiene un backend Node.js/Express con MySQL que no estaba configurado como funciones serverless de Vercel.

## Cambios Realizados

### 1. Configuración de Vercel (`vercel.json`)
- Configurado el enrutamiento para que las páginas estáticas funcionen
- Las funciones API ahora están en `/api` como serverless functions

### 2. Funciones Serverless en `/api`
- `api/visitas.js` - Contador de visitas (GET)
- `api/negocios.js` - CRUD de negocios (GET/POST)
- `api/db.js` - Conexión a MySQL con pool

### 3. URLs Actualizadas
Todas las llamadas API ahora usan rutas relativas:
- ❌ Antes: `https://comunidaddigitaltexcoco.onrender.com/api/visitas`
- ✅ Ahora: `/api/visitas`

## Pasos para Desplegar

### 1. Configurar Variables de Entorno en Vercel
En el dashboard de Vercel (Settings > Environment Variables):

```
DB_HOST=tu-servidor-mysql.com
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=nombre-base-datos
```

**IMPORTANTE:** Todas las variables deben estar configuradas antes del deploy.

### 2. Desplegar
- Conecta tu repositorio de GitHub a Vercel
- Vercel detectará automáticamente la configuración
- Haz click en "Deploy"

### 3. Verificar
Una vez desplegado, prueba estos endpoints:
- `https://tu-proyecto.vercel.app/pcdtinicio.html` - Página principal con MySQL
- `https://tu-proyecto.vercel.app/api/visitas` - API de visitas
- `https://tu-proyecto.vercel.app/api/negocios` - API de negocios
- `https://tu-proyecto.vercel.app/api-test.html` - Página de pruebas

## ⚠️ Limitación Importante: Carga de Imágenes

**ESTADO ACTUAL:** El formulario de registro de negocios intenta subir archivos usando FormData, pero esto NO funcionará en Vercel sin modificaciones adicionales.

Las imágenes NO se pueden subir directamente en Vercel porque las funciones serverless:
- Son sin estado (no guardan archivos)
- Tienen sistema de archivos de solo lectura

**Por ahora:**
- ✅ El contador de visitas funciona
- ✅ Ver negocios existentes funciona
- ❌ Registrar nuevos negocios con imágenes NO funcionará hasta que implementes una de las soluciones siguientes

### Solución Recomendada: Vercel Blob Storage

1. **Instalar el paquete:**
```bash
npm install @vercel/blob
```

2. **Crear un endpoint para subir imágenes** (`api/upload.js`):
```javascript
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  
  const blob = await put(filename, request.body, {
    access: 'public',
  });
  
  return response.json(blob);
}
```

3. **Actualizar el frontend** para usar Vercel Blob en lugar de FormData

### Alternativa: Cloudinary (Más Fácil)
1. Crear cuenta gratuita en cloudinary.com
2. Usar su widget de upload en el frontend:
```html
<script src="https://widget.cloudinary.com/v2.0/global/all.js" type="text/javascript"></script>
<script>
  cloudinary.createUploadWidget({
    cloudName: 'tu-cloud-name',
    uploadPreset: 'tu-preset'
  }, (error, result) => {
    if (!error && result && result.event === "success") {
      console.log('URL de imagen:', result.info.secure_url);
      // Guardar result.info.secure_url en tu base de datos
    }
  }).open();
</script>
```

## Base de Datos MySQL

### Opciones Recomendadas:
1. **PlanetScale** (Recomendado - MySQL sin servidor)
   - Free tier generoso
   - Compatible con Vercel
   - No requiere configuración de IPs
   - https://planetscale.com

2. **Railway**
   - MySQL tradicional
   - $5/mes
   - Fácil configuración
   - https://railway.app

3. **Amazon RDS**
   - Para producción empresarial
   - Requiere configuración de seguridad

### Configuración de Conexión
Asegúrate de que tu base de datos:
- Acepte conexiones desde cualquier IP (0.0.0.0/0) o
- Tenga whitelisted los IPs de Vercel

## Solución de Problemas

### Error 404
- ✅ Verifica que las variables de entorno estén configuradas
- ✅ Revisa los logs en Vercel Dashboard > Deployments > Ver logs
- ✅ Prueba los endpoints API directamente

### Error de Conexión a Base de Datos
- ✅ Verifica las credenciales en Vercel
- ✅ Asegúrate de que la base de datos acepta conexiones remotas
- ✅ Verifica que las tablas existan (negociostbl, contador)

### Las Imágenes No Cargan
- ✅ Esto es esperado - necesitas implementar Vercel Blob o Cloudinary
- ✅ Por ahora, puedes probar con URLs de imágenes externas

## Comandos Útiles

```bash
# Desarrollo local (usa el backend original)
cd backend
npm install
npm start

# Deploy desde CLI
npm i -g vercel
vercel --prod
```

## Estructura del Proyecto
```
/
├── api/              # Funciones serverless (✅ NUEVO)
│   ├── db.js
│   ├── negocios.js
│   └── visitas.js
├── frontend/         # Archivos estáticos
│   ├── index.html
│   ├── pcdtinicio.html
│   └── api-test.html  # ✅ NUEVO - para probar APIs
├── backend/          # Servidor Express (solo para desarrollo local)
├── vercel.json       # ✅ NUEVO - configuración de Vercel
└── .vercelignore     # ✅ NUEVO - archivos a excluir
```

## Próximos Pasos Recomendados

1. ✅ Desplegar en Vercel con las variables de entorno
2. ⏳ Implementar Vercel Blob o Cloudinary para imágenes
3. ⏳ Configurar dominio personalizado en Vercel
4. ⏳ Agregar SSL/HTTPS (automático en Vercel)
5. ⏳ Monitorear uso y performance en Vercel Analytics

## Soporte
- Documentación completa: Ver `DEPLOYMENT.md`
- Issues: Crear issue en GitHub
- Logs: Vercel Dashboard > Functions > Logs
