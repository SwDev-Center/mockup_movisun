# Plan: Corregir visibilidad del hero en pantallas de escritorio

## Contexto
Las 4 imágenes flotantes del hero usan `hidden xl:block`, lo que las oculta en pantallas menores a **1280px**. El canvas de previsualización es más angosto que ese umbral, por eso el usuario solo ve la versión "móvil" (solo texto). La solución es bajar el breakpoint a `lg` (1024px+).

## Cambios requeridos

**Archivo:** `src/app/App.tsx`

### 1. Las 4 imágenes flotantes — cambiar `hidden xl:block` → `hidden lg:block`

Afecta exactamente estas 4 líneas (una por imagen):
- Top-left: img2 (Smartwatch)
- Bottom-left: img3 (Diadema)
- Top-right: img4 (Parlante)
- Bottom-right: img5 (Earbuds)

```diff
- className="hidden xl:block absolute"
+ className="hidden lg:block absolute"
```

### 2. Centro del texto — cambiar `xl:max-w-[400px]` → `lg:max-w-[380px]`

El contenedor central usa `w-full xl:max-w-[400px]`. Al bajar las imágenes a `lg`, también hay que restringir el ancho del texto en `lg` para evitar solapamiento a 1024px.

```diff
- className="... w-full xl:max-w-[400px]"
+ className="... w-full lg:max-w-[380px]"
```

## Verificación
- En el canvas de previsualización (ancho < 1280px pero > 1024px): deben aparecer las 4 imágenes flotando a izquierda y derecha del texto centrado.
- En móvil (< 1024px): solo texto, sin imágenes — comportamiento correcto.
