declare module "gif-encoder-2" {
  export default class GIFEncoder {
    constructor(width: number, height: number);
    start(): void;
    setRepeat(repeat: number): void;
    setDelay(delay: number): void;
    setQuality(quality: number): void;
    addFrame(data: Buffer | Uint8ClampedArray): void;
    finish(): void;
    out: {
      getData(): Buffer;
    };
  }
}
