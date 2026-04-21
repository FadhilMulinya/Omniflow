import fs from 'fs';
import path from 'path';
import os from 'os';

import { TerminalSession } from '../types.js';

const getConfigDir = () => {
    const homedir = os.homedir();
    if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'onhandl');
    }
    if (process.platform === 'darwin') {
        return path.join(homedir, 'Library', 'Application Support', 'onhandl');
    }
    return path.join(process.env.XDG_CONFIG_HOME || path.join(homedir, '.config'), 'onhandl');
};

const getSessionFilePath = () => path.join(getConfigDir(), 'session.json');
const getDetailsFilePath = () => path.join(getConfigDir(), '.details.json');

export const SessionStore = {
    save(session: TerminalSession): void {
        const dir = getConfigDir();
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(getSessionFilePath(), JSON.stringify(session, null, 2), { mode: 0o600 });
    },

    load(): TerminalSession | null {
        try {
            const filePath = getSessionFilePath();
            if (!fs.existsSync(filePath)) return null;

            const data = fs.readFileSync(filePath, 'utf8');
            if (!data) return null;

            const session = JSON.parse(data) as TerminalSession;

            if (new Date() > new Date(session.expiresAt)) {
                this.clear();
                return null;
            }
            return session;
        } catch (e: any) {
            console.error(`[SessionStore] Failed to load session: ${e.message}`);
            return null;
        }
    },

    saveDetails(details: any): void {
        const dir = getConfigDir();
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(getDetailsFilePath(), JSON.stringify(details, null, 2), { mode: 0o600 });
    },

    loadDetails(): any | null {
        try {
            const filePath = getDetailsFilePath();
            if (!fs.existsSync(filePath)) return null;
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    clear(): void {
        try {
            const filePath = getSessionFilePath();
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            // Ignore if we can't delete
        }
    }
};
