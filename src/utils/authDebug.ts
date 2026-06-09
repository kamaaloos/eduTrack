/** Release-build-safe traces — grep logcat for "eduTrack". */
const PREFIX = "[eduTrack]";

export function authLog(
  step: string,
  detail?: Record<string, unknown>,
): void {
  if (detail) {
    console.log(`${PREFIX} ${step}`, JSON.stringify(detail));
  } else {
    console.log(`${PREFIX} ${step}`);
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms,
      );
    }),
  ]);
}
