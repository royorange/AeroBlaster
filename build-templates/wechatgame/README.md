# WeChat Mini Game build template

Files placed here are merged into the WeChat Mini Game build output.

Common overrides:
- `project.config.json` — appid and project meta
- custom `game.js` patches (only if you need to inject SDKs)

After building from Cocos Creator (`Project > Build > WeChat Mini Game`):
1. Open the `build/wechatgame/` directory in WeChat DevTools
2. Set your real AppID (test AppID works for local debug)
3. Replace placeholder ad unit IDs in `assets/scripts/services/AdService.ts`
   with the real ones from MP backend
