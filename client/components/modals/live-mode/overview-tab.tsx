import React from 'react';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface OverviewTabProps {
    telegramNodes: any[];
    walletNodes: any[];
    tradeNodes: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
    telegramNodes,
    walletNodes,
    tradeNodes,
}) => {
    return (
        <div className="space-y-4">
            <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    Live Mode Warning
                </h3>
                <p className="text-xs mt-1 text-yellow-700">
                    Enabling live mode will connect your bot to real services and execute real
                    transactions. Make sure you have thoroughly tested your flow in simulation mode
                    before enabling live mode.
                </p>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Flow Summary</h3>
                <ul className="text-xs space-y-1">
                    <li>• {telegramNodes.length} Telegram nodes</li>
                    <li>• {walletNodes.length} Wallet nodes</li>
                    <li>• {tradeNodes.length} Trading nodes</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Live Mode Requirements</h3>
                <ul className="text-xs space-y-1">
                    <li
                        className={`flex items-center gap-1 ${telegramNodes.length > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {telegramNodes.length > 0 ? (
                            <CheckCircle2 className="h-3 w-3" />
                        ) : (
                            <AlertCircle className="h-3 w-3" />
                        )}
                        At least one Telegram node
                    </li>
                    <li
                        className={`flex items-center gap-1 ${walletNodes.some((node) =>
                            node.data.inputs?.some(
                                (input: any) => input.key === 'walletAddress' && input.value
                            )
                        )
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}
                    >
                        {walletNodes.some((node) =>
                            node.data.inputs?.some(
                                (input: any) => input.key === 'walletAddress' && input.value
                            )
                        ) ? (
                            <CheckCircle2 className="h-3 w-3" />
                        ) : (
                            <AlertCircle className="h-3 w-3" />
                        )}
                        At least one configured wallet
                    </li>
                </ul>
            </div>
        </div>
    );
};
