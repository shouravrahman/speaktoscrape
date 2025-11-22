'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
   Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
   feedback_type: z.enum(['bug', 'feature', 'contact'], { required_error: 'Please select a type.' }),
   message: z.string().min(10, 'Message must be at least 10 characters.').max(5000),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

async function submitFeedback(data: FeedbackFormValues) {
   const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
   });

   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit feedback.');
   }

   return response.json();
}

interface FeedbackDialogProps {
   isOpen: boolean;
   onOpenChange: (isOpen: boolean) => void;
}

export function FeedbackDialog({ isOpen, onOpenChange }: FeedbackDialogProps) {
   const form = useForm<FeedbackFormValues>({
      resolver: zodResolver(feedbackSchema),
      defaultValues: {
         message: '',
      },
   });

   const mutation = useMutation({
      mutationFn: submitFeedback,
      onSuccess: () => {
         toast.success('Thank you for your feedback!');
         form.reset();
         onOpenChange(false);
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });

   const onSubmit = (data: FeedbackFormValues) => {
      mutation.mutate(data);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Submit Feedback</DialogTitle>
               <DialogDescription>
                  Have a bug to report, a feature to request, or a question? Let us know.
               </DialogDescription>
            </DialogHeader>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                     control={form.control}
                     name="feedback_type"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Type of Feedback</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select a type..." />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="bug">Bug Report</SelectItem>
                                 <SelectItem value="feature">Feature Request</SelectItem>
                                 <SelectItem value="contact">General Question</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="message"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Message</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Please describe the issue or your idea in detail..."
                                 rows={6}
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <DialogFooter>
                     <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
