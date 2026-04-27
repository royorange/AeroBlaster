# Douyin Mini Game build template

Files placed here are merged into the Douyin Mini Game build output.

After building from Cocos Creator (`Project > Build > Bytedance Mini Game`):
1. Open the `build/bytedance-mini-game/` directory in Douyin DevTools
2. Set your real AppID
3. Replace placeholder ad unit IDs in `assets/scripts/services/AdService.ts`
4. Note Douyin's stricter ad cooldown rules (see AdService DEFAULT_CONFIG)
