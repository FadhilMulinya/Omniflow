'use client';

import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea } from '@/components/ui';

interface FieldRendererProps {
    input: any;
    handleInputChange: (key: string, value: any) => void;
}

export function FieldRenderer({ input, handleInputChange }: FieldRendererProps) {
    switch (input.type) {
        case 'string':
            return (
                <Input
                    id={input.key}
                    value={input.value || ''}
                    placeholder={input.placeholder || ''}
                    onChange={(e) => handleInputChange(input.key, e.target.value)}
                />
            );
        case 'number':
            return (
                <Input
                    id={input.key}
                    type="number"
                    value={input.value || ''}
                    placeholder={input.placeholder || ''}
                    onChange={(e) => handleInputChange(input.key, Number.parseFloat(e.target.value))}
                />
            );
        case 'boolean':
            return (
                <Switch
                    id={input.key}
                    checked={input.value || false}
                    onCheckedChange={(checked) => handleInputChange(input.key, checked)}
                />
            );
        case 'select':
            return (
                <Select
                    value={input.value || ''}
                    onValueChange={(value) => handleInputChange(input.key, value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={input.placeholder || 'Select an option'} />
                    </SelectTrigger>
                    <SelectContent>
                        {input.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'object':
            return (
                <Textarea
                    id={input.key}
                    value={
                        typeof input.value === 'object'
                            ? JSON.stringify(input.value, null, 2)
                            : input.value || ''
                    }
                    placeholder={input.placeholder || ''}
                    onChange={(e) => {
                        try {
                            const value = JSON.parse(e.target.value);
                            handleInputChange(input.key, value);
                        } catch {
                            handleInputChange(input.key, e.target.value);
                        }
                    }}
                    className="min-h-[100px]"
                />
            );
        default:
            return (
                <Input
                    id={input.key}
                    value={input.value || ''}
                    placeholder={input.placeholder || ''}
                    onChange={(e) => handleInputChange(input.key, e.target.value)}
                />
            );
    }
}
