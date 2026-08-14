# Golf MVP — Hoyo 1, Atalaya Old Course

Primera versión jugable del hoyo 1 (par 4, 225 yardas): escena 3D con 5
tipos de superficie, física con Cannon-es, control de golpeo por arrastre,
viento dinámico, contador de golpes y hándicap persistido en `localStorage`.

## Stack

React 18 + TypeScript + Vite · Three.js vía `@react-three/fiber` +
`@react-three/drei` · Física con `cannon-es` vía `@react-three/cannon` ·
Estado global con `zustand` · Empaquetado móvil con Capacitor.

> Nota: se usa **Vite** en vez de Create React App (deprecado) para el
> tooling — el resto del stack sigue la especificación tal cual.

## Instalación

```bash
cd golf-mvp
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre la URL que indique Vite (por defecto `http://localhost:5173`).

## Controles

- **Arrastrar hacia arriba**: carga potencia (medidor a la derecha).
- **Arrastrar en horizontal**: apunta (y aplica un spin ligero).
- **Soltar**: ejecuta el golpe.

Funciona igual con ratón y con dedo (táctil).

## Build de producción

```bash
npm run build
npm run preview   # sirve dist/ localmente para probarlo
```

## Empaquetado móvil (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init GolfMVP com.tugolf.app --web-dir=dist   # ya configurado en capacitor.config.ts
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

## Estructura

```
src/
  constants.ts        Datos del hoyo 1 (tee, green, bunkers, superficies)
  types.ts             Tipos compartidos
  store/               Estado global (zustand): bola, golpes, viento, hándicap
  utils/               Point-in-polygon, cálculo de hándicap
  components/
    Scene.tsx          Canvas + mundo físico
    Surfaces.tsx        Terreno (visual + colisión)
    Ball.tsx             Bola: impulso de golpe, viento, fricción/rebote por superficie
    Flag.tsx             Bandera en el green
    CameraRig.tsx       Cámara que sigue a la bola
    WindIndicator.tsx  Flecha 3D de viento
    AimControls.tsx    Captura de arrastre (dirección/potencia/spin)
    HUD.tsx              Marcador, distancia, viento, hándicap, resultado
```

## Decisiones de la v1 (a revisar)

- **Fricción/restitución por superficie**: `@react-three/cannon` no permite
  cambiar el `material` de un cuerpo dinámico en caliente, así que en vez de
  crear un cuerpo físico por polígono se usa un único plano de colisión y,
  cada frame, se detecta la superficie bajo la bola (point-in-polygon) para
  ajustar `linearDamping`/`angularDamping` (fricción al rodar) y reescalar
  la velocidad vertical en el primer rebote (restitución). Se comporta de
  forma distinta en fairway/rough/bunker/green, pero es una aproximación,
  no una simulación de contacto por superficie.
- **Radio de bola**: la especificación indicaba 0.84 yardas de radio, que
  corresponde en realidad al *diámetro* aproximado de una bola real
  (demasiado grande para verse bien a escala de un hoyo de 225 yardas). Se
  usó 0.6 yardas para que la bola sea visible/jugable en esta v1.
- **Ángulo de lanzamiento**: fijo (~16°) para todos los golpes; no hay
  todavía selección de palo.
- **Hándicap**: sigue la fórmula del documento (Course Rating 70.0, Slope
  113, promedio de los mejores diferenciales × 0.96), con la tabla de
  "mejores N de M rondas" aproximada a la rampa oficial hasta llegar a 20
  rondas (10 mejores).
- **Efecto Magnus**: no implementado; el spin lateral solo se aplica como
  rotación visual de la bola (`angularVelocity`), no curva aún la
  trayectoria.

## Pendiente para siguientes iteraciones

- Selección de palo / ángulo de lanzamiento variable.
- Curvatura real por efecto Magnus.
- Pendiente del green afectando el rodaje.
- Sonidos y modelos de palo/bola de mayor detalle.
- Pruebas en dispositivo con Capacitor.
