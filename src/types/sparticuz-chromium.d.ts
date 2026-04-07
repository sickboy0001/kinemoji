declare module "@sparticuz/chromium" {
  const chromium: {
    args: string[];
    defaultViewport: {
      deviceScaleFactor: number;
      hasTouch: boolean;
      isLandscape: boolean;
      isMobile: boolean;
      width: number;
      height: number;
    };
    executablePath(path?: string): Promise<string>;
    headless: boolean | "new";
  };
  export default chromium;
}
