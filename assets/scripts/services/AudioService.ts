import { AudioClip, AudioSource, director, resources } from 'cc';
import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';

const TAG = 'AudioService';

export class AudioService extends Singleton<AudioService> {
  private bgm?: AudioSource;
  private sfx?: AudioSource;
  private bgmVolume = 0.5;
  private sfxVolume = 0.8;
  private muted = false;
  private clipCache = new Map<string, AudioClip>();

  init(): void {
    const node = director.getScene()?.getChildByName('AudioRoot');
    if (!node) {
      Logger.warn(TAG, 'no AudioRoot node — call AudioService.attach(node) once');
      return;
    }
    this.attach(node as unknown as { getComponent: (c: typeof AudioSource) => AudioSource | null });
  }

  attach(host: { getComponent: (c: typeof AudioSource) => AudioSource | null }): void {
    this.bgm = host.getComponent(AudioSource) ?? undefined;
    this.sfx = this.bgm;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.bgm) this.bgm.volume = m ? 0 : this.bgmVolume;
  }

  setBgmVolume(v: number): void {
    this.bgmVolume = v;
    if (this.bgm && !this.muted) this.bgm.volume = v;
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = v;
  }

  async playBgm(path: string, loop = true): Promise<void> {
    if (!this.bgm) return;
    const clip = await this.loadClip(path);
    if (!clip) return;
    this.bgm.clip = clip;
    this.bgm.loop = loop;
    this.bgm.volume = this.muted ? 0 : this.bgmVolume;
    this.bgm.play();
  }

  stopBgm(): void {
    this.bgm?.stop();
  }

  async playSfx(path: string): Promise<void> {
    if (!this.sfx || this.muted) return;
    const clip = await this.loadClip(path);
    if (clip) this.sfx.playOneShot(clip, this.sfxVolume);
  }

  private loadClip(path: string): Promise<AudioClip | null> {
    const cached = this.clipCache.get(path);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve) => {
      resources.load(path, AudioClip, (err, clip) => {
        if (err) {
          Logger.warn(TAG, `load clip failed: ${path}`, err);
          resolve(null);
          return;
        }
        this.clipCache.set(path, clip);
        resolve(clip);
      });
    });
  }
}
