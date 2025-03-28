# VectoraApp - Sistema de Gestión Financiera

VectoraApp es una aplicación web desarrollada con Angular 19 que permite gestionar cuentas bancarias, transacciones y transferencias de forma eficiente y segura.

## Características principales

- **Gestión de cuentas**: Crear, editar y visualizar cuentas bancarias
- **Historial de transacciones**: Seguimiento detallado de movimientos con filtrado
- **Transferencias**: Realizar transferencias entre cuentas
- **Panel de control**: Visualización de resumen financiero
- **Autenticación**: Sistema seguro de login/logout

## Usuarios de prueba

Para acceder a la aplicación, puedes utilizar cualquiera de estos usuarios:

| Email | Contraseña |
|-------|------------|
| juan@example.com | password |
| maria@example.com | password |

## Requisitos previos

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Angular CLI (versión 19.2.4)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/yourusername/VectoraApp.git
cd VectoraApp
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo y la API:
```bash
# En una terminal, inicia el servidor de desarrollo
npm run start

# En otra terminal, inicia el servidor JSON para la API
npm run server
```

4. Abre tu navegador en http://localhost:4200/

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Inicia el servidor de desarrollo de Angular |
| `npm run build` | Genera la versión de producción en la carpeta `dist/` |
| `npm run server` | Inicia el servidor JSON que actúa como backend |
| `npm run test` | Ejecuta los tests unitarios |
| `npm run lint` | Ejecuta el linter para verificar la calidad del código |

## Estructura del proyecto

```
VectoraApp/
├── src/
│   ├── app/
│   │   ├── core/            # Servicios, interceptores y guards
│   │   ├── feature/         # Componentes por funcionalidad
│   │   ├── shared/          # Componentes, interfaces y stores compartidos
│   │   └── ...
│   ├── assets/              # Recursos estáticos
│   └── ...
├── db.json                  # Base de datos para JSON Server
└── ...
```

## Características técnicas

- **Arquitectura**: Componentes standalone con patrón Signal Store
- **Autenticación**: Interceptores HTTP para manejo de tokens
- **UI**: Diseño responsive con Tailwind CSS
- **Reactiva**: Uso de Signals para estado reactivo
- **Formularios**: Implementación de formularios reactivos
- **Routing**: Navegación optimizada con guards de autenticación


## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
