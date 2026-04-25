import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';
import { MessageCircle, Settings2, BellRing, Phone, Send } from 'lucide-react';
import TelegramConfigModal from '@/components/telegram-config-modal';
import WhatsAppConfigModal from '@/components/whatsapp-config-modal';

interface NotifState { telegram: boolean; whatsapp: boolean; dailySummaries: boolean; email: boolean }

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${value ? 'bg-primary' : 'bg-muted'}`}
            role="switch"
            aria-checked={value}
        >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
        </button>
    );
}

export function NotificationsCard() {
    const [notif, setNotif] = useState<NotifState>({ telegram: false, whatsapp: false, dailySummaries: false, email: true });
    const [saving, setSaving] = useState(false);
    const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        apiFetch('/auth/notifications').then(setNotif).catch(() => {});
        apiFetch('/auth/me').then(setProfile).catch(() => {});
    }, []);

    const update = async (patch: Partial<NotifState>) => {
        const next = { ...notif, ...patch };
        setNotif(next);
        setSaving(true);
        try {
            await apiFetch('/auth/notifications', { method: 'PUT', body: JSON.stringify(patch) });
        } catch {
            toast({ title: 'Failed to save notification settings', variant: 'destructive' });
            setNotif(notif); // revert
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async (field: string, value: string) => {
        try {
            await apiFetch('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ [field]: value })
            });
            setProfile((p: any) => ({ ...p, [field]: value }));
        } catch (err: any) {
            throw err;
        }
    };

    const ITEMS = [
        { key: 'telegram' as const, label: 'Telegram Alerts', desc: 'Real-time execution alerts via Telegram.', icon: Send, onConfig: () => setIsTelegramModalOpen(true) },
        { key: 'whatsapp' as const, label: 'WhatsApp Alerts', desc: 'Secure trade notifications on WhatsApp.', icon: Phone, onConfig: () => setIsWhatsAppModalOpen(true) },
        { key: 'dailySummaries' as const, label: 'Daily Summaries', desc: 'Performance reports delivered daily.', icon: BellRing },
        { key: 'email' as const, label: 'Email Notifications', desc: 'Major updates and security alerts.', icon: MessageCircle },
    ];

    return (
        <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden rounded-[1.5rem]">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2.5 text-lg font-black uppercase tracking-tight">
                            <BellRing className="h-5 w-5 text-primary" />
                            Channels {saving && <span className="text-[10px] text-primary animate-pulse font-black uppercase ml-2 tracking-widest">Syncing…</span>}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-1">Control your signal stream</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-6 px-6 pb-6">
                {ITEMS.map(({ key, label, desc, icon: Icon, onConfig }) => (
                    <div key={key} className="group flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                <Icon size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-bold text-foreground text-sm flex items-center gap-2">
                                    {label}
                                    {onConfig && (
                                        <button 
                                            onClick={onConfig}
                                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Settings2 size={12} /> Config
                                        </button>
                                    )}
                                </p>
                                <p className="text-[11px] font-medium text-muted-foreground/80">{desc}</p>
                            </div>
                        </div>
                        <Toggle value={notif[key]} onChange={(v) => update({ [key]: v })} />
                    </div>
                ))}

                <TelegramConfigModal 
                    isOpen={isTelegramModalOpen}
                    onClose={() => setIsTelegramModalOpen(false)}
                    currentUsername={profile?.telegramUsername}
                    onSave={(u) => handleSaveProfile('telegramUsername', u)}
                />

                {isWhatsAppModalOpen && (
                    <WhatsAppConfigModal 
                        onClose={() => setIsWhatsAppModalOpen(false)}
                        onSave={(cfg) => {
                            // This would normally save to a more complex object, 
                            // but for this simplified flow we'll just enable the toggle
                             update({ whatsapp: true });
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
