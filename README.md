# Portal de Productos con Autenticación y Chat

## Descripción del proyecto

Este proyecto implementa un portal de productos con las siguientes funcionalidades principales:

* CRUD de productos (solo para administradores)
* Autenticación y roles (usuario / administrador) mediante JWT
* Chat en tiempo real entre usuarios autenticados usando Socket.IO
* Persistencia de datos en MongoDB

El objetivo es integrar los conceptos trabajados en las sesiones anteriores, incluyendo autenticación, roles, gestión de productos y chat en tiempo real.

## Tecnologías utilizadas

* **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
* **Backend**: Node.js con Express
* **Base de datos**: MongoDB (con Mongoose)
* **Autenticación**: JWT (JSON Web Tokens)
* **Chat en tiempo real**: Socket.IO

## Estructura del proyecto
```
/src
├── /public
│   ├── index.html       # Página principal con login, registro e inicio
│   ├── products.html    # Página de productos
│   └── chat.html        # Chat en tiempo real
├── /routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── chatRoutes.js
├── /models
│   ├── User.js
│   └── Product.js
├── /middleware
│   └── authenticateJWT.js
├── server.js
└── config.js
```

## Cómo ejecutar la aplicación

### 1. Clonar el repositorio
```bash
git clone https://github.com/paulaqing/Practica1-ProgramacionWeb.git
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar servidor
```bash
npm start o node src/server.js
```

Acceder a la aplicación: `http://localhost:3000`

## Cómo probar la aplicación

### 1. Registro e inicio de sesión

* Abrir la página principal (`index.html`)
* Registrar un usuario y un administrador (user, user || admin, admin)
* Iniciar sesión con cada cuenta para comprobar roles y permisos

### 2. Funcionalidad de productos

* Como usuario, acceder a la sección de productos: solo puede ver productos
* Como administrador, se pueden crear, editar y eliminar productos

### 3. Chat en tiempo real

* Abrir dos ventanas o navegadores diferentes con usuarios distintos
* Comprobar que los mensajes se envían y reciben en tiempo real
* Cada mensaje muestra nombre de usuario y hora

### 4. Comprobación en MongoDB

* Colección `users` guarda usuarios con contraseñas hasheadas y roles
* Colección `products` guarda productos con nombre, descripción y precio

## Decisiones tomadas durante el desarrollo

1. **Almacenamiento de tokens**: se usa `sessionStorage` para mantener la sesión por ventana, permitiendo que dos usuarios distintos se conecten desde el mismo navegador.

2. **Protección de rutas**: middleware `authenticateJWT` y `authorizeRole` asegura que solo usuarios autenticados y con el rol adecuado accedan a determinadas rutas.

3. **Chat integrado con JWT**: Socket.IO valida el token antes de permitir la conexión, asegurando que solo usuarios autenticados puedan enviar o recibir mensajes.

4. **Separación de roles en el frontend**: el botón de productos se muestra a todos los usuarios, pero la funcionalidad CRUD solo está disponible para administradores.

5. **Estilo coherente**: se unifica el diseño de autenticación, inicio, chat y productos para mantener consistencia visual.

## Observaciones finales

* El historial de chat está en memoria; puede ampliarse para persistencia en MongoDB.
* Se mantiene seguridad básica con JWT y hashing de contraseñas (bcrypt).
* La aplicación está lista para ejecutar localmente y probar todas las funcionalidades requeridas por la práctica.