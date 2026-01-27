# DEBUG_KIRALIK_API

## Requests (2026-01-26)

### 1) `/api/listings?type=kiralik`
- Status: 200
- Content-Type: `application/json`
- Notes: `type` now maps to `status` (kiralik).
- Body preview:
```json
{"success":true,"requestId":"1769470448296-iruxg4j","data":{"listings":[{"id":"85d55092-bc4c-4ff2-bdd6-f157004d1cd3","title":"Sahil Kiralık Daire","slug":"sahil-kiralik-daire-85d55092","status":"kiral
```

### 2) `/api/listings?purpose=rent`
- Status: 200
- Content-Type: `application/json`
- Notes: `purpose=rent` now maps to `status=kiralik`.
- Body preview:
```json
{"success":true,"requestId":"1769470454603-rrm22r7","data":{"listings":[{"id":"85d55092-bc4c-4ff2-bdd6-f157004d1cd3","title":"Sahil Kiralık Daire","slug":"sahil-kiralik-daire-85d55092","status":"kiral
```

### 3) `/api/listings?status=kiralik` (control)
- Status: 200
- Content-Type: `application/json`
- Notes: Baseline filter.
- Body preview:
```json
{"success":true,"requestId":"1769470335802-7sx3jie","data":{"listings":[{"id":"85d55092-bc4c-4ff2-bdd6-f157004d1cd3","title":"Sahil Kiralık Daire","slug":"sahil-kiralik-daire-85d55092","status":"kiral
```
