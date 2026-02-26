// Minimal logger implementation for the demo
export function createLogger(name: string) {
  return {
    info: (message: string, data?: unknown) => {
      console.log(`[${name}]`, message, ...(data !== undefined ? [data] : []));
    },
    error: (message: string, data?: unknown) => {
      console.error(`[${name}]`, message, ...(data !== undefined ? [data] : []));
    },
    warn: (message: string, data?: unknown) => {
      console.warn(`[${name}]`, message, ...(data !== undefined ? [data] : []));
    },
    debug: (message: string, data?: unknown) => {
      console.debug(`[${name}]`, message, ...(data !== undefined ? [data] : []));
    }
  };
}