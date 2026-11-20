# ORIS para empresas

App local (Next.js) para trabajar folios de la hoja **RESUMEN**: sincronizar desde Google Sheet, asignar **IDC** y **coordinadores**, y ver estadísticas por IDC, coordinador y mes.

## Cómo correr

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:3847](http://127.0.0.1:3847).

Scripts útiles:

- `npm run build` — build de producción
- `npm start` — sirve el build (puerto 3847)

## Datos

- Sheet: `1APH7yi9IFOZ0vT37KJXmHlQoPr8zBy2eIZvDYv6_KsI`, pestaña **RESUMEN** (`gid=1101700716`)
- Export CSV: `https://docs.google.com/spreadsheets/d/1APH7yi9IFOZ0vT37KJXmHlQoPr8zBy2eIZvDYv6_KsI/export?format=csv&gid=1101700716`
- Si el Sheet no responde, la app usa **muestra local** y permite subir CSV en **Importar**.

### Columnas mapeadas de RESUMEN

| Sheet | Campo app |
| --- | --- |
| FOLIO | `folio` / `id` |
| PROYECTO, SUBPROYECTO | `proyecto`, `subproyecto` |
| CR | `cr` |
| SUCURSAL, ESTADO, DELEGACIÓN/MUNICIPIO | `sucursal`, `estado`, `municipio` |
| ACTIVIDAD, ESTATUS | `actividad`, `estatus` |
| COORDINADOR | `coordinadorSheet` (editable localmente) |
| IDC | `idcSheet` (editable localmente) |
| MES | `mes` (normalizado) |
| SLA, SLA DOCUMENTACIÓN | `sla`, `slaDocumentacion` |
| LINK DRIVE FACTURACIÓN | `linkDrive` |
| FECHA PROGRAMADA / FECHA REAL | `fechaProgramada`, `fechaReal` |

### Persistencia (estilo Apps Script local)

- Base de folios + meta de sync → `data/folios.json`, `data/meta.json`
- Asignaciones → `data/assignments.json` y espejo en `localStorage` (`oris.assignments.v1`)
- Stubs de presupuesto en cada asignación: `costoFolio`, `costoIdc`, `notasPresupuesto`

**Migración a DB:** crear tablas `folios` y `assignments` con los mismos campos JSON; sustituir `src/lib/store.ts` por un adaptador SQL sin cambiar la UI ni las rutas `/api/*`.

## Pantallas

1. **/** — portada ORIS  
2. **/folios** — listado, filtros y asignación  
3. **/dashboard** — estadísticas  
4. **/importar** — sync Sheet / CSV / mock  
