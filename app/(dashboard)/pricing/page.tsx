'use client';
import { PRICING_TIERS } from '@/lib/constants/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store/userStore';

export default function DashboardPricingPage() {
   const { user, isLoading: isUserLoading, subscription } = useUser();
   const router = useRouter();

   const currentUserPlanId = subscription?.current_plan_id || 'free';

   const handleCheckout = async (variantId: string | null, tierId: string) => {
      if (!user) {
         toast.error('Please log in to manage your subscription.');
         router.push('/login'); // Redirect to login page
         return;
      }

      if (tierId === 'free') {
         toast.info('You are already on the Free plan.');
         return;
      }

      if (!variantId) {
         toast.error('Invalid plan selected.');
         return;
      }

      try {
         const response = await fetch('/api/lemonsqueezy/checkout', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               variantId,
               userEmail: user.email, // Assuming user object has email
               userId: user.id, // Assuming user object has id
            }),
         });

         const data = await response.json();

         if (response.ok && data.checkoutUrl) {
            window.location.href = data.checkoutUrl; // Redirect to Lemon Squeezy checkout
         } else {
            console.error('Failed to get checkout URL:', data.error);
            toast.error('Failed to initiate checkout. Please try again.');
         }
      } catch (error) {
         console.error('Error initiating checkout:', error);
         toast.error('An unexpected error occurred. Please try again.');
      }
   };

   return (
      <>
         <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Manage Your Subscription</h1>
            <p className="mt-4 text-lg text-muted-foreground">
               Upgrade or downgrade your plan to fit your needs.
            </p>
         </div>

         <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
               <Card key={tier.id} className="flex flex-col">
                  <CardHeader>
                     <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                     <CardDescription className="mt-2 text-muted-foreground">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <div className="text-4xl font-bold mt-4">
                        {tier.price}
                        {tier.interval && <span className="text-lg font-normal text-muted-foreground">/{tier.interval}</span>}
                     </div>
                     <ul className="mt-6 space-y-3 text-sm">
                        {tier.features.map((feature, index) => (
                           <li key={index} className="flex items-center">
                              <CheckIcon className="h-4 w-4 text-primary mr-2" />
                              {feature}
                           </li>
                        ))}
                     </ul>
                  </CardContent>
                  <CardFooter>
                     {isUserLoading ? (
                        <Button className="w-full" size="lg" disabled>
                           Loading...
                        </Button>
                     ) : currentUserPlanId === tier.id ? (
                        <Button className="w-full" size="lg" disabled variant="secondary">
                           Current Plan
                        </Button>
                     ) : (
                        <Button
                           className="w-full"
                           size="lg"
                           onClick={() => handleCheckout(tier.variantId, tier.id)}
                        >
                           {tier.buttonText}
                        </Button>
                     )}
                  </CardFooter>
               </Card>
            ))}
         </div>

         {/* Optional: Link to Lemon Squeezy customer portal for managing existing subscriptions */}
         {currentUserPlanId !== 'free' && (
            <div className="text-center mt-8">
               <p className="text-sm text-muted-foreground">
                  Need to update your payment method or cancel your subscription?
               </p>
               <Button variant="link" className="mt-2" onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}>
                  Go to Lemon Squeezy Customer Portal
               </Button>
            </div>
         )}
      </>
   );
}