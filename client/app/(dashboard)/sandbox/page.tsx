import FlowBuilder from '@/components/flow-builder';
import { FlowProvider } from '@/contexts';
import { SimulationProvider } from '@/contexts';
import { Providers } from './providers';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Providers>
        <FlowProvider>
          <SimulationProvider>
            <FlowBuilder />
          </SimulationProvider>
        </FlowProvider>
      </Providers>
    </main>
  );
}
