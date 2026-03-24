'use client';

interface TradeInfoSectionProps {
    outputData: any;
}

export function TradeInfoSection({ outputData }: TradeInfoSectionProps) {
    if (!outputData?.status) return null;

    const { status, details, transactionId } = outputData;

    return (
        <div className="space-y-4">
            <h4 className="font-medium">Trade Information</h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span
                            className={`text-sm px-3 py-1 rounded-full font-medium ${status === 'completed'
                                ? 'bg-primary/10 text-primary'
                                : status === 'pending'
                                    ? 'bg-accent/10 text-accent-foreground'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>

                    {details && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Action:</span>
                                <span className="text-sm">{details.action}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Token:</span>
                                <span className="text-sm">{details.token}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Amount:</span>
                                <span className="text-sm">{details.amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Price:</span>
                                <span className="text-sm">${details.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Total:</span>
                                <span className="text-sm">
                                    ${details.total.toFixed(2)}
                                </span>
                            </div>
                        </>
                    )}

                    {transactionId && (
                        <div className="text-xs mt-2 font-mono break-all">
                            <span className="font-medium">TX ID:</span> {transactionId}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
