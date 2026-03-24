'use client';

import { Label } from '@/components/ui';

interface WalletInfoSectionProps {
    outputData: any;
}

export function WalletInfoSection({ outputData }: WalletInfoSectionProps) {
    if (!outputData?.connected) return null;

    return (
        <div className="space-y-4">
            <h4 className="font-medium">Wallet Information</h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Connected
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Network:</span>
                        <span className="text-sm">
                            {outputData.walletInfo?.network || 'Ethereum'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Address:</span>
                        <span className="text-xs font-mono mt-1 break-all">
                            {outputData.walletInfo?.address || 'Not connected'}
                        </span>
                    </div>
                    {outputData.balance && (
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Balance:</span>
                            <span className="text-sm">
                                {outputData.balance}{' '}
                                {outputData.walletInfo?.currency || 'ETH'}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Connection Type:</span>
                        <span className="text-sm">
                            {outputData.walletInfo?.connectionType || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
