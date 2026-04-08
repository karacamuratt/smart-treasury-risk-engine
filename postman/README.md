# Postman Setup

This folder contains a ready-to-import Postman collection and environment for local portfolio/demo testing.

Files:
- `Smart Treasury Risk Engine.postman_collection.json`
- `Smart Treasury Risk Engine.postman_environment.json`

Recommended local startup order:

```powershell
cmd /c pnpm docker:up
cmd /c pnpm dev:api
cmd /c pnpm dev:worker
cmd /c pnpm dev:listener
```

Recommended Postman run order:
1. Import the collection and environment.
2. Select `Smart Treasury Risk Engine Local`.
3. Run `1. Health Checks`.
4. Run `2. Seed Demo Wallets`.
5. Run `3. API Demo Flow`.
6. Run `4. Mock Scan Pipeline`.

Demo wallet addresses used by the collection:
- `0x1111111111111111111111111111111111111111`
- `0x2222222222222222222222222222222222222222`
- `0x5555555555555555555555555555555555555555`

Notes:
- The collection is designed for `BLOCKCHAIN_SCAN_MODE=mock`.
- Wallet creation requests intentionally accept `201` or `409` so reruns stay friendly.
- `Trigger Listener Mock Block Scan` lets you test the listener -> queue -> worker -> database path without restarting services.
