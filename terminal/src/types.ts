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
    };
    expiresAt: string;
}
