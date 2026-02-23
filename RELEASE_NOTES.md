# Release Notes - Staging Build

## v0.0.2 (Hotfix)

- **Critical Fix**: Resolved infinite 404 error loop in `stake-adapter.js` by flagging unavailable backend servers.
- **Manifest**: Updated game version to 13.

## v0.0.1

## Math Verification

- **Hexa Keno**: Verified stable RTP (~95% for Classic/Low/Medium).
- **My First Slot**: Verified 97.31% RTP.
- **Optimization**: Built `optimization_program` (Rust). `keno_balancer.py` updated.

## Frontend Polish

- **Performance**: Optimized particle system (`vfx.js`) with O(1) removal.
- **Visuals**: Enhanced `megaBurst` to support dynamic colors.
- **Bug Fix**: Fixed canvas context double-restore issue.

## Status

- **Build**: Passing
- **Math**: Verified
- **Ready for**: Staging Deployment
