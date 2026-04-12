# TocadApp — Estrategia de Producto y Monetización

> Análisis actualizado. Marzo 2026.

---

## Para quién es TocadApp

Un usuario que toca en tres bandas, a veces le salen chambas sueltas, y al final del mes no sabe exactamente cuánto ganó ni si el sábado que viene ya tiene compromiso o no.

Ese es el usuario. No el encargado de una orquesta de 40 músicos. No el manager de una discográfica. El músico que toca regularmente, que vive en parte de eso, y que necesita organización sin burocracia.

---

## Lo que resuelve de verdad

### Problema 1: No saber cuánto gané
Los músicos cobran por evento, en efectivo, a veces con semanas de diferencia. Llevan la cuenta en la cabeza o en una hoja de Excel que nunca actualizan. TocadApp les da un estado de cuenta real: qué ganaron, en qué banda, en qué mes, y cómo va el año.

### Problema 2: No saber si hay cruce
Dos bandas le avisan el mismo viernes. El músico tiene que revisar su chat de WhatsApp, sus notas, y rezar para no confundirse. TocadApp detecta el conflicto automáticamente y lo marca en rojo.

### Problema 3: No saber qué viene
¿Cuánto dinero entra este mes? ¿El próximo? La sección "Por cobrar" da una proyección real basada en gigs ya confirmados, incluyendo los que le mandó el encargado de su banda.

### Problema 4: La agenda desorganizada de la banda
El encargado avisa por WhatsApp, algunos leen, otros no. TocadApp da una agenda compartida donde el músico ve los gigs de su banda automáticamente, sin depender de que alguien le avise.

---

## Modelo de negocio: cobra al músico

Esta decisión importa. La duda original era: ¿le cobro al músico o al encargado?

**Le cobras al músico.** Aquí está el razonamiento real:

1. **Hay órdenes de magnitud más músicos que encargados.** En México hay decenas de miles de músicos activos en bandas de eventos, jazz, rock, etc. Los encargados son un subconjunto pequeño.

2. **El músico tiene un incentivo financiero directo.** La app le muestra cuánto ganó, le ayuda a organizarse, y le ahorra el caos de WhatsApp. Es un beneficio tangible en su economía.

3. **El encargado es más escéptico.** Ya tiene su sistema (WhatsApp, un Excel, su memoria). Convencerlo de pagar por una herramienta nueva es más difícil porque su dolor es menos agudo que el del músico.

4. **El músico que paga hoy puede ser el encargado de mañana.** Si alguien usa TocadApp como músico y luego forma su propia banda, va a usar TocadApp para eso también. Crecen contigo.

5. **Las funciones de banda benefician al músico, no solo al encargado.** Ahora que el músico puede ver la agenda de su banda Y registrar cuánto ganó en cada gig de banda, la app es tan útil para el músico como para el líder. No necesitas cobrarle diferente.

---

## Precio

### Mi criterio

**$79 MXN/mes.**

No es un número basado en lo que cobran otros. Es el resultado de pensar cuánto vale la app para el usuario y qué precio genera el mínimo fricción posible.

Un músico que toca regularmente en México gana entre $500 y $3,000 por evento. $79 al mes es menos del 10% de su gig más modesto. Es tan pequeño en su economía que no requiere una decisión seria. No va a comparar precios, no va a pedir descuento, no va a cancelar por dinero.

Al mismo tiempo, $79 no es gratis. La gente no valora lo que no cuesta. Un precio real genera compromiso real. Si algo te cuesta dinero, lo usas; si es gratis, puede que no.

### Lo que NO hacer

- **No $149.** Es demasiado para empezar. Cuando tengas 500 usuarios activos y datos que demuestren retención, sube el precio. Hoy no.
- **No cobrar por integrantes de banda.** Eso frena el crecimiento viral. Si el encargado tiene que pagar más por invitar músicos, no va a invitarlos.
- **No planes complicados.** Dos planes máximo al inicio. Más opciones paralizan la decisión.

### Estructura de planes

#### Gratis — siempre
- Hasta 5 tocadas registradas por mes
- Sin bandas
- Dashboard básico

#### Pro — $79 MXN/mes
- Tocadas ilimitadas
- Bandas ilimitadas (crear y unirse)
- Agenda compartida
- Finanzas completas (ganancias por banda incluidas)
- Detección de conflictos
- Historial completo

No hay plan "Encargado" separado. El Pro incluye todo. Si en el futuro hay funciones específicas para encargados grandes (múltiples bandas, reportes exportables, métricas de la banda), se agrega un plan adicional. Hoy no.

---

## ¿Cuánto necesitas vender?

| Usuarios Pro | Ingreso mensual |
|---|---|
| 100 | $7,900 MXN |
| 250 | $19,750 MXN |
| 500 | $39,500 MXN |
| 1,000 | $79,000 MXN |

500 músicos pagando $79 al mes es alcanzable en 12-18 meses si el producto funciona y hay distribución consistente. En México el mercado de músicos activos es de decenas de miles; llegar al 1% de ese mercado ya es rentable.

---

## Cómo llegar a los primeros usuarios

### Canal 1: boca a boca entre músicos
Si un encargado invita a su banda a TocadApp, 4-8 músicos conocen el producto. Si esos músicos están en otras bandas, cada uno es un vector de distribución. El invite code no es solo una feature técnica, es el mecanismo de crecimiento.

### Canal 2: redes sociales musicales
El mundillo musical en México es muy activo en Instagram. Un video de 30 segundos mostrando el "¿cuánto te tocó?" de un gig de banda puede conectar emocionalmente con cualquier músico que haya vivido ese caos.

### Canal 3: grupos de Facebook y WhatsApp de músicos
Existen miles de grupos donde músicos buscan y ofrecen trabajo. No para spam, sino para estar presente y que alguien lo mencione orgánicamente.

### Canal 4: músicos en tu red
Los primeros 20-30 usuarios deberían ser músicos que conoces personalmente. Son los que van a darte feedback real, los que van a referirte a otros, y los que van a validar si el producto funciona.

---

## Cuándo empezar a cobrar

No hoy. El producto tiene funciones que funcionan, pero todavía faltan las migraciones de DB (003 y 004) para que el sistema multiusuario esté activo. Un usuario que se registra hoy vería los datos de otro usuario.

Secuencia:
1. Correr las migraciones en producción
2. Conseguir 10-20 usuarios beta que usen el producto de verdad durante 2-3 semanas
3. Recoger feedback, iterar
4. Cuando tengas al menos 5 usuarios que digan "esto me ayuda todos los días", activa el pago
5. Ofrece 1 mes gratis a los beta testers como recompensa

El objetivo del beta no es validar si la app funciona técnicamente. Es validar si el músico la usa sin que tú se lo pidas.

---

## Opinión directa

Tienes un producto real. No es un proyecto de fin de semana: tiene backend propio, auth, múltiples páginas, finanzas, detección de conflictos, agenda compartida. Eso es mucho más de lo que la mayoría llega a construir.

El riesgo ahora no es técnico. Es de distribución: que nadie se entere. Un buen producto que nadie conoce no existe. Dedica tanto tiempo a conseguir los primeros 20 usuarios como a escribir código.

La decisión de cobrarle al músico es la correcta. No cambies eso. $79 MXN/mes es un precio justo que no espanta y que sí genera ingresos reales. No lo bajes pensando que más gente va a pagar; el precio bajo no convierte más, solo te hace ganar menos.
