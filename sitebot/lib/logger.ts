import fs from 'fs'
import path from 'path'

export function logError(context: string, error: any) {
    try {
        const logDir = path.join(process.cwd(), 'public')
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

        const logFile = path.join(logDir, 'debug.log')
        const timestamp = new Date().toISOString()
        const message = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error)
        const line = `[${timestamp}] [${context}] ERROR: ${message}\n`

        fs.appendFileSync(logFile, line)
    } catch (e) {
        // Fail silently
        console.error("Logger failed", e)
    }
}

export function logInfo(context: string, message: string) {
    try {
        const logDir = path.join(process.cwd(), 'public')
        const logFile = path.join(logDir, 'debug.log')
        const timestamp = new Date().toISOString()
        const line = `[${timestamp}] [${context}] INFO: ${message}\n`

        fs.appendFileSync(logFile, line)
    } catch (e) {
        console.error("Logger failed", e)
    }
}
