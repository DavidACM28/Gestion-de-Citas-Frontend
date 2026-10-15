# Gestión de Citas - Frontend

Aplicación web desarrollada con Angular para consumir la API del sistema de gestión de citas médicas.

## Requisitos

- Node.js compatible con Angular 21.
- npm.
- API de Gestión de Citas ejecutándose localmente.

## Servidor de desarrollo

Instala las dependencias:

```bash
npm install
```

Inicia la aplicación:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

Durante el desarrollo, las solicitudes a `/api` se redirigen mediante `proxy.conf.json` a `https://localhost:7088`.

## Estructura

- `core`: modelos, constantes y servicios globales.
- `shared`: componentes y módulos reutilizables.
- `layout`: estructura visual de la aplicación autenticada.
- `features`: funcionalidades organizadas por dominio.

## Compilación

```bash
npm run build
```

Los archivos generados se almacenan en `dist/`.

## Pruebas

```bash
npm test
```
