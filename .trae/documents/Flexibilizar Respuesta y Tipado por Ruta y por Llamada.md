## Objetivos

* Eliminar la rigidez del `ResponseWrapper` para permitir respuestas flexibles.

* Hacer que cada función tipada devuelva por defecto el tipo de respuesta declarado en la ruta (`Product`, etc.).

* Permitir override por llamada: `api.products.list<Response>(query)`.

* Mantener compatibilidad con proyectos que usan envolturas (wrapper) sin forzar el tipo.

## Cambios en Tipos

1. Remover `ResponseWrapper<TData>` de `src/types/index.ts` y su uso en firmas.
2. Extender `RouteDef` con un nuevo parámetro genérico `TResponse` que represente el tipo de respuesta por defecto de esa ruta:

   * `export interface RouteDef<Path, Method, TBody, TQuery, HasQuery, TResponse = unknown> { ... __response: TResponse }`
3. Ajustar los tipos de función generados:

   * Las funciones deben ser genéricas en el retorno: `(<TReturn = R['__response']>(...args) => Promise<TReturn>)`.

   * Mantener el mapeo actual de parámetros según método y bindings (`HasBindings`/`HasQuery`).
4. Actualizar `MethodToFunction` y helpers `FuncForGet`/`FuncForBody` para retornar `Promise<TReturn>` en vez de `ResponseWrapper`.

## Cambios en Helpers de Rutas

1. Actualizar helpers (`get`, `post`, `put`, `del`, `patch`) para soportar `TResponse` como primer genérico opcional y no requerir repetir el path:

   * `get<TResponse = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<..., TResponse>`

   * `post<TResponse = unknown, TBody = unknown, TQuery = never, TPath extends string = string>(path: TPath): RouteDef<..., TResponse>`
2. Mantener la inferencia del `path` y cálculo de bindings a partir del argumento.

## Cambios en AxiosManager

1. Retornar por defecto `response.data` (modo "raw").
2. Hacer que el envoltorio actual sea opcional vía configuración:

   * `AxiosManagerConfig: { responseMode?: 'raw' | 'enveloped', responseWrapper?: { ...keys } }`

   * En `raw`: retornar `response.data` tipado como `TReturn`.

   * En `enveloped`: mantener la transformación (para retrocompatibilidad), pero sin forzar el tipo en los tipos de retorno.
3. Las funciones generadas deben ser genéricas: `<TReturn = Default>(...args): Promise<TReturn>`; `Default` proviene de `RouteDef.__response`.

## Actualización de README

1. Mostrar cómo declarar el tipo de respuesta por ruta:

   * `list: get<Product>('/products')`.
2. Mostrar override por llamada:

   * `await api.products.list<ApiListResponse<Product>>(query)`.
3. Documentar orden de argumentos y cómo se mapean a `axios` (`params`, `data`, reemplazo en `url`).
4. Explicar `responseMode` para quienes usan envolturas.

## Tests y Verificación

1. Actualizar/añadir tests:

   * Verificar que `list: get<Product>` devuelve `Product` por defecto (usando generics en la llamada del test).

   * Override por llamada: `list<ApiListResponse<Product>>` retorna el tipo sobreescrito.

   * Verificar métodos HTTP y configuración (`method`, `url`, `params`, `data`) siguen correctos.

   * Verificar bindings se reemplazan correctamente con y sin `query`.

   * Añadir test de modo `enveloped` para compatibilidad (opcional).
2. Ejecutar `vitest` con cobertura y validar que cambios no reducen cobertura global.

## Migración

* Proyectos que dependen de `ResponseWrapper` pueden optar por `responseMode: 'enveloped'` mientras migran.

* Proyectos nuevos usarán `raw` por defecto y tiparán por ruta y/o por llamada.

## Fases

* Fase 1: Refactor de `types` (añadir `TResponse`, remover `ResponseWrapper` en firmas).

* Fase 2: Actualizar helpers (`get/post/...`) con nuevos genéricos y `HasQuery` por inferencia.

* Fase 3: Refactor `AxiosManager` para `raw` y `enveloped` opcional.

* Fase 4: Actualizar tests (tipos de retorno, overrides, compatibilidad), ejecutar cobertura.

* Fase 5: Actualizar README con ejemplos y notas de migración.

## Resultado Esperado

* Rutas devuelven por defecto su tipo de respuesta (`Product`).

* Overrides por llamada funcionan sin casts extra.

* Configurable modo de respuesta, conservando flexibilidad para distintos backends.

