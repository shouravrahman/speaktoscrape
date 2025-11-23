import { Suspense } from 'react';
import ConnectedAccountsView from './ConnectedAccountsView';
import { Loader2 } from 'lucide-react';

export default function ConnectedAccountsPage() {
  return (
    <Suspense fallback={<div className="flex items-center p-8"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading page...</div>}>
      <ConnectedAccountsView />
    </Suspense>
  );
}
