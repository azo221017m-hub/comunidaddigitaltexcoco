# Guía de Deployment en Vercel

## 📋 Resumen del Proyecto

Este proyecto está configurado para desplegarse en Vercel con:
- ✅ Frontend estático HTML (sin build, sin React, sin Vite)
- ✅ Funciones serverless en `/api`
- ✅ MySQL2 para conexión a base de datos

## 🚀 Pasos para Desplegar

### 1. Preparación en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New Project"
3. Importa este repositorio desde GitHub
4. Vercel detectará automáticamente el `vercel.json`

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:

```
DB_HOST=tu-host-de-base-de-datos
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=tu-base-de-datos
```

**Importante:** Estas variables son necesarias para que las funciones serverless puedan conectarse a la base de datos.

### 3. Deploy

- Click en "Deploy"
- Vercel **NO** ejecutará ningún build command (configurado como `null`)
- Tu sitio estará disponible en `https://tu-proyecto.vercel.app`

## 📁 Estructura del Proyecto

```
/
├── api/                    # Funciones serverless
│   ├── db.js              # Módulo de conexión MySQL2
│   ├── visitas.js         # GET /api/visitas
│   ├── negocios.js        # GET/POST /api/negocios
│   └── package.json       # Dependencias (solo mysql2)
├── frontend/              # HTML estático (sin build)
│   ├── index.html
│   ├── pcdtinicio.html
│   ├── css/
│   ├── js/
│   └── ...
├── backend/               # Express para desarrollo local (NO usado en Vercel)
│   └── server.js
└── vercel.json            # Configuración de Vercel
```

## ⚙️ Configuración de Vercel

### vercel.json

```json
{
  "version": 2,
  "buildCommand": null,  // ← NO build
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

**¿Por qué `buildCommand: null`?**
- El frontend es HTML estático, no necesita compilación
- NO usamos React, Vite, ni react-scripts
- Evita errores de build innecesarios

## 🗄️ Uso de MySQL2 en Vercel

### Conexión por Request (Recomendado para Serverless)

**❌ NO hacer:** Connection pooling persistente
```javascript
// Esto NO funciona bien en serverless
const pool = mysql.createPool({ ... });
module.exports = pool;
```

**✅ Hacer:** Conexión por request
```javascript
// api/db.js
const mysql = require('mysql2/promise');

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
  });
  return connection;
}

module.exports = { getConnection };
```

### Ejemplo de Función Serverless

```javascript
// api/visitas.js
const { getConnection } = require('./db');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let connection;
  try {
    // 1. Crear conexión
    connection = await getConnection();
    
    // 2. Ejecutar query
    const [results] = await connection.execute(
      'SELECT visitas FROM contador WHERE id = 1'
    );
    
    // 3. Responder
    res.status(200).json({ visitas: results[0].visitas });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // 4. SIEMPRE cerrar la conexión
    if (connection) await connection.end();
  }
};
```

## ⚠️ Limitaciones Importantes

### 1. No hay app.listen()

Las funciones serverless **NO** usan `app.listen()`:

```javascript
// ❌ NO hacer esto en /api
app.listen(3000, () => console.log('servidor corriendo'));

// ✅ Hacer esto
module.exports = async (req, res) => {
  // Tu lógica aquí
};
```

### 2. Subida de Archivos

El backend Express local usa `multer` para subir imágenes, pero **esto NO funciona en Vercel**.

**Soluciones:**
- **Vercel Blob:** https://vercel.com/docs/storage/vercel-blob
- **Cloudinary:** https://cloudinary.com (free tier)
- **AWS S3:** Presigned URLs desde el frontend

### 3. Base de Datos Accesible

Tu MySQL debe ser accesible desde internet. Opciones recomendadas:
- **PlanetScale** (MySQL serverless, free tier)
- **Railway** (fácil setup)
- **AWS RDS**
- **DigitalOcean Managed Databases**

## 🧪 Desarrollo Local

Para desarrollo local, usa el backend Express:

```bash
cd backend
npm install
node server.js
```

El servidor Express sirve en `http://localhost:3000`

## 🔧 Troubleshooting

### Error: "Cannot find module 'mysql'"
**Solución:** Asegúrate de que solo `mysql2` está en `/api/package.json`

### Error de conexión a DB
**Solución:** 
- Verifica las variables de entorno en Vercel
- Asegúrate de que tu DB acepta conexiones externas
- Considera añadir `ssl: { rejectUnauthorized: false }` si es necesario

### 404 en las rutas
**Solución:** Revisa que `vercel.json` esté en la raíz del proyecto

### CORS errors
**Solución:** Los headers CORS ya están configurados en cada función serverless

## 📚 Referencias

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## ✅ Checklist de Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos MySQL accesible desde internet
- [ ] `vercel.json` en la raíz del proyecto
- [ ] Solo `mysql2` en `/api/package.json`
- [ ] No hay `app.listen()` en las funciones de `/api`
- [ ] Frontend en `/frontend` es estático (HTML, CSS, JS)

¡Listo para deploy! 🎉
