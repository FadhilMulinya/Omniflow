import { agentTemplates } from '../../infrastructure/messaging/templates';

export const AgentTemplateService = {
    listTemplates() {
        return agentTemplates;
    },

    getTemplateById(id: string) {
        return agentTemplates.find((t: any) => t.id === id) ?? null;
    },
};
