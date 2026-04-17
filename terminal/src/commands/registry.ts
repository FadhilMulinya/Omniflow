import { DeviceFlow } from '../auth/device-flow';
import { SessionStore } from '../services/session';
import chalk from 'chalk';

export const CommandHandlers = {
    async handleLogin() {
        const session = SessionStore.load();
        if (session) {
            console.log(chalk.yellow(`You are already logged in as ${session.user.username}.`));
            return;
        }
        await DeviceFlow.startLogin();
    },

    async handleLogout() {
        SessionStore.clear();
        console.log(chalk.green('✔ Logged out successfully. Your local session has been cleared.'));
    },

    async handleWhoami() {
        const session = SessionStore.load();
        if (!session) {
            console.log(chalk.red('Not logged in.'));
        } else {
            console.log(chalk.cyan(`User: ${session.user.username} (${session.user.id})`));
            console.log(chalk.cyan(`Workspace: ${session.workspace.name} (${session.workspace.id})`));
        }
    },

    async handleHelp() {
        console.log(`
${chalk.bold('Available Commands:')}
  ${chalk.green('login')}   - Login to Onhandl via browser
  ${chalk.green('logout')}  - Clear session and logout
  ${chalk.green('whoami')}  - View current active session
  ${chalk.green('help')}    - Show this help message
  ${chalk.green('exit')}    - Exit the terminal
`);
    }
};
