'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from './FeedbackDialog';
import { MessageSquarePlus } from 'lucide-react';

export function FeedbackButton() {
   const [isDialogOpen, setIsDialogOpen] = useState(false);

   return (
      <>
         <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsDialogOpen(true)}
         >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Submit Feedback
         </Button>
         <FeedbackDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </>
   );
}
