const timestamp = new Date().toISOString();

const logger = {
    error: (message: string) => console.error(`[${timestamp}] ${message}`),
    warn: (message: string) => console.warn(`[${timestamp}] ${message}`),
    info: (message: string) => console.info(`[${timestamp}] ${message}`),
    debug: (message: string) => console.debug(`[${timestamp}] ${message}`)
}

export default logger;