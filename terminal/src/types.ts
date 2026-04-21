export interface TerminalSession {
    accessToken: string;
    deviceName?: string;
    workspace: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        username: string;
        email?: string;
        plan?: string;
        tokens?: number;
    };
    expiresAt: string;
}
