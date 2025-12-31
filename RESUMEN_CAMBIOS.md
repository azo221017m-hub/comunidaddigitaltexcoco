# Resumen de Configuración - Vercel Deployment

## ✅ Cambios Realizados

### 1. `vercel.json` - Configuración Completa

**Cambios:**
- ✅ Añadido `"buildCommand": null` - **NO se ejecutará npm run build**
- ✅ Rutas configuradas para:
  - API serverless: `/api/*` → `/api/*`
  - Archivos estáticos: `/*` → `/frontend/*`
- ✅ Headers CORS configurados globalmente para `/api/*`

**Antes:**
```json
{
  "version": 2,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

**Después:**
```json
{
  "version": 2,
  "buildCommand": null,
  "routes": [...],
  "headers": [...]
}
```

### 2. `api/db.js` - Conexión MySQL2 Serverless

**Cambios:**
- ❌ Eliminado: Connection pooling persistente con `mysql`
- ✅ Añadido: Función `getConnection()` con `mysql2/promise`
- ✅ Conexión por request (serverless-friendly)

**Antes:**
```javascript
const mysql = require('mysql');
const pool = mysql.createPool({...});
module.exports = pool;
```

**Después:**
```javascript
const mysql = require('mysql2/promise');
async function getConnection() {
  const connection = await mysql.createConnection({...});
  return connection;
}
module.exports = { getConnection };
```

### 3. `api/visitas.js` - Función Serverless con Promises

**Cambios:**
- ✅ Convertido a `async function`
- ✅ Uso de `await` en lugar de callbacks
- ✅ Cierre de conexión en `finally`
- ✅ Manejo de errores con try/catch

**Patrón usado:**
```javascript
module.exports = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(sql);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.end();
  }
};
```

### 4. `api/negocios.js` - Actualizado igual que visitas.js

**Cambios:**
- ✅ Mismo patrón async/await
- ✅ Maneja tanto GET como POST
- ✅ Cierre de conexión garantizado

### 5. `api/package.json` - Solo MySQL2

**Cambios:**
- ❌ Eliminado: `"mysql": "^2.18.1"`
- ✅ Mantenido: `"mysql2": "^3.14.4"`

---

## 📋 Ejemplo Completo: Función Serverless Válida

```javascript
// api/ejemplo.js
const { getConnection } = require('./db');

module.exports = async (req, res) => {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  // 2. Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Database logic
  let connection;
  try {
    // Create connection
    connection = await getConnection();
    
    // Execute query
    const [rows] = await connection.execute(
      'SELECT * FROM tabla WHERE id = ?',
      [req.query.id]
    );
    
    // Send response
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // ALWAYS close connection
    if (connection) await connection.end();
  }
};
```

---

## 🚀 Cómo Desplegar

### Paso 1: Variables de Entorno en Vercel

En tu proyecto de Vercel, ve a **Settings → Environment Variables** y añade:

```
DB_HOST=tu-host.ejemplo.com
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_db
```

### Paso 2: Deploy

```bash
# Opción 1: Deploy desde Vercel Dashboard
# - Importa el repo
# - Vercel detecta automáticamente vercel.json
# - Click "Deploy"

# Opción 2: Deploy desde CLI
npm i -g vercel
vercel
```

### Paso 3: Verificar

```bash
# Probar API
curl https://tu-proyecto.vercel.app/api/visitas

# Ver frontend
open https://tu-proyecto.vercel.app
```

---

## ❌ Errores Comunes y Soluciones

### Error: "Cannot find module 'mysql'"

**Causa:** Todavía hay código usando `require('mysql')` en lugar de `require('mysql2/promise')`

**Solución:** 
```javascript
// ❌ NO
const mysql = require('mysql');

// ✅ SÍ
const mysql = require('mysql2/promise');
```

### Error: "Connection timeout"

**Causa:** Base de datos no accesible o credenciales incorrectas

**Solución:**
1. Verifica las variables de entorno en Vercel
2. Asegúrate de que tu DB acepta conexiones externas
3. Si usa SSL, añade en `api/db.js`:
   ```javascript
   ssl: { rejectUnauthorized: false }
   ```

### Error: "Too many connections"

**Causa:** Las conexiones no se están cerrando correctamente

**Solución:** Siempre usa `finally` para cerrar:
```javascript
finally {
  if (connection) await connection.end();
}
```

### Frontend devuelve 404

**Causa:** Archivos no están en `/frontend` o rutas mal configuradas

**Solución:** Verifica que todos los HTML están en `/frontend/`

---

## ✅ Checklist de Verificación

Antes de hacer deploy, verifica:

- [ ] `vercel.json` tiene `"buildCommand": null`
- [ ] `api/package.json` solo tiene `mysql2` (no `mysql`)
- [ ] Todas las funciones en `/api` son `async` y usan `await`
- [ ] Todas las funciones cierran la conexión con `await connection.end()`
- [ ] No hay `app.listen()` en ningún archivo de `/api`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Archivos HTML están en `/frontend`

---

## 📚 Documentación Adicional

- **Guía completa:** `VERCEL_DEPLOYMENT.md`
- **Funciones serverless:** https://vercel.com/docs/functions
- **mysql2:** https://github.com/sidorares/node-mysql2

---

## 🎯 Resumen Final

**Lo que FUNCIONA ahora:**
- ✅ Frontend estático servido desde `/frontend`
- ✅ API serverless en `/api` con mysql2
- ✅ No se ejecuta ningún build
- ✅ Conexiones de BD por request (serverless-friendly)
- ✅ CORS configurado globalmente

**Lo que NO se necesita:**
- ❌ `npm run build`
- ❌ React, Vite, webpack
- ❌ Connection pooling persistente
- ❌ `app.listen()`

**Listo para deploy en Vercel** 🚀
