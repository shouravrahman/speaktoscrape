'use client';

import { useUser } from "@/lib/store/userStore";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

const profileFormSchema = z.object({
   company_name: z.string().nullable(),
   role: z.string().nullable(),
   use_case: z.string().nullable(),
   account_type: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
   const { user, userProfile, isLoading } = useUser();
   const [isSubmitting, setIsSubmitting] = useState(false);

   const form = useForm<ProfileFormValues>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
         company_name: userProfile?.company_name || "",
         role: userProfile?.role || "",
         use_case: userProfile?.use_case || "",
         account_type: userProfile?.account_type || "",
      },
      mode: "onChange",
   });

   useEffect(() => {
      if (userProfile) {
         form.reset({
            company_name: userProfile.company_name || "",
            role: userProfile.role || "",
            use_case: userProfile.use_case || "",
            account_type: userProfile.account_type || "",
         });
      }
   }, [userProfile, form]);

   async function onSubmit(data: ProfileFormValues) {
      setIsSubmitting(true);
      try {
         const response = await fetch("/api/user/profile", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update profile");
         }

         toast.success("Profile updated successfully!");
      } catch (error: any) {
         toast.error(error.message || "An unexpected error occurred.");
      } finally {
         setIsSubmitting(false);
      }
   }

   if (isLoading) {
      return (
         <div className="flex justify-center items-center h-full">
            <p>Loading settings...</p>
         </div>
      );
   }

   return (
      <>
         <h1 className="text-3xl font-bold">Settings</h1>
         <Card>
            <CardHeader>
               <CardTitle>Profile Information</CardTitle>
               <CardDescription>
                  Update your account&apos;s profile information.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="email" className="text-right">
                              Email
                           </Label>
                           <Input
                              id="email"
                              defaultValue={user?.email || ""}
                              readOnly
                              className="col-span-3"
                           />
                        </div>
                        <FormField
                           control={form.control}
                           name="company_name"
                           render={({ field }) => (
                              <FormItem className="grid grid-cols-4 items-center gap-4">
                                 <FormLabel htmlFor="company_name" className="text-right">
                                    Company Name
                                 </FormLabel>
                                 <FormControl>
                                    <Input
                                       id="company_name"
                                       placeholder="Your company name"
                                       className="col-span-3"
                                       {...field}
                                       value={field.value || ""}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name="role"
                           render={({ field }) => (
                              <FormItem className="grid grid-cols-4 items-center gap-4">
                                 <FormLabel htmlFor="role" className="text-right">
                                    Role
                                 </FormLabel>
                                 <FormControl>
                                    <Input
                                       id="role"
                                       placeholder="Your role"
                                       className="col-span-3"
                                       {...field}
                                       value={field.value || ""}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name="use_case"
                           render={({ field }) => (
                              <FormItem className="grid grid-cols-4 items-center gap-4">
                                 <FormLabel htmlFor="use_case" className="text-right">
                                    Use Case
                                 </FormLabel>
                                 <FormControl>
                                    <Input
                                       id="use_case"
                                       placeholder="Your primary use case"
                                       className="col-span-3"
                                       {...field}
                                       value={field.value || ""}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name="account_type"
                           render={({ field }) => (
                              <FormItem className="grid grid-cols-4 items-center gap-4">
                                 <FormLabel htmlFor="account_type" className="text-right">
                                    Account Type
                                 </FormLabel>
                                 <FormControl>
                                    <Input
                                       id="account_type"
                                       placeholder="e.g., Personal, Business"
                                       className="col-span-3"
                                       {...field}
                                       value={field.value || ""}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                     </Button>
                  </form>
               </Form>
            </CardContent>
         </Card>
      </>
   );
}
