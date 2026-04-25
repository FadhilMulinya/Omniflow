'use client';

import { useState } from 'react';
import { 
    IconSend, 
    IconX, 
    IconCheck, 
    IconLoader2, 
    IconBrandTelegram,
    IconInfoCircle,
    IconCopy
} from '@tabler/icons-react';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { useToast } from '@/components/ui/notifications/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface TelegramConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername?: string;
    onSave: (username: string) => Promise<void>;
}

export default function TelegramConfigModal({ isOpen, onClose, currentUsername, onSave }: TelegramConfigModalProps) {
    const [username, setUsername] = useState(currentUsername || '');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!username.trim()) {
            toast({ title: 'Username required', description: 'Please enter your Telegram username.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            await onSave(username.replace('@', ''));
            toast({ title: 'Telegram Linked', description: 'Your username has been updated successfully.' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-card border border-border/40 shadow-2xl rounded-[2rem] overflow-hidden"
            >
                <div className="h-1.5 w-full bg-gradient-to-r from-[#24A1DE] to-[#0088cc]" />
                
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#24A1DE]/10 border border-[#24A1DE]/20 flex items-center justify-center">
                                <IconBrandTelegram className="h-6 w-6 text-[#24A1DE]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight uppercase">Telegram Link</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Notification Channel</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            <IconX size={18} className="text-muted-foreground" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Telegram Username</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</div>
                                <Input
                                    placeholder="your_handle"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12 pl-10 rounded-2xl bg-muted/30 border-border/40 focus:ring-[#24A1DE]/20 font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#24A1DE]/5 border border-[#24A1DE]/10 space-y-3">
                            <div className="flex items-center gap-2 text-[#24A1DE]">
                                <IconInfoCircle size={16} />
                                <span className="text-xs font-black uppercase tracking-wider">Setup Instructions</span>
                            </div>
                            <ol className="space-y-2 text-[11px] font-medium text-foreground/80 list-decimal list-inside">
                                <li>Search for <span className="font-bold text-[#24A1DE]">@OnhandlBot</span> on Telegram.</li>
                                <li>Send the command <code className="bg-[#24A1DE]/10 px-1.5 py-0.5 rounded text-xs font-bold font-mono">/start</code> to initialize.</li>
                                <li>Enter your username here to link the accounts.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="h-12 rounded-2xl bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#24A1DE]/20 group"
                        >
                            {isLoading ? (
                                <IconLoader2 className="animate-spin" size={18} />
                            ) : (
                                <span className="flex items-center gap-2">
                                    VERIFY & SAVE <IconSend size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
