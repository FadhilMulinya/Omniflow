import { apiClient } from '../services/api.js';
import { SessionStore } from '../services/session.js';
import open from 'open';
import chalk from 'chalk';

export const DeviceFlow = {
    async startLogin() {
        console.log(chalk.cyan('Initiating secure login...'));
        try {
            const { data } = await apiClient.post('/terminal/auth/start');

            console.log(chalk.green(`\nSuccess! Please approve the login request in your browser.`));
            console.log(`If your browser does not open automatically, visit:\n${chalk.underline.blue(data.loginUrl)}`);
            console.log(`Your terminal code is: ${chalk.bold.yellow(data.userCode)}\n`);

            await open(data.loginUrl);

            await this.poll(data.deviceCode, data.pollInterval);
        } catch (error: any) {
            console.log(chalk.red(`Login failed: ${error.message}`));
        }
    },

    async poll(deviceCode: string, intervalSeconds: number) {
        return new Promise<void>((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const { data } = await apiClient.post('/terminal/auth/poll', { deviceCode });

                    if (data.status === 'approved') {
                        clearInterval(interval);

                        // Default expiry or get from server (say 7 days)
                        // It's just for local check to prevent sending token if known to be expired
                        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                        SessionStore.save({
                            accessToken: data.accessToken,
                            user: {
                                id: data.userId || '',
                                username: 'Authenticated User'
                            },
                            workspace: {
                                id: data.workspaceId || '',
                                name: 'Default Workspace'
                            },
                            expiresAt
                        });

                        console.log(chalk.green('✔ Login successful. Session stored securely.\n'));
                        resolve();
                    } else if (data.status === 'denied' || data.status === 'expired') {
                        clearInterval(interval);
                        console.log(chalk.red(`\nLogin ${data.status}. Please try again.`));
                        reject(new Error(`Login ${data.status}`));
                    }
                    // if pending, do nothing and continue
                } catch (error) {
                    // network error, maybe continue polling?
                    // for now, we just swallow and keep polling to be fault tolerant
                }
            }, intervalSeconds * 1000);
        });
    }
};
