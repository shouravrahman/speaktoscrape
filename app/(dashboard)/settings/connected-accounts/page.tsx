'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

interface ConnectedAccount {
  id: string;
  domain: string;
  created_at: string;
}

// --- API Functions ---

const fetchConnectedAccounts = async (): Promise<ConnectedAccount[]> => {
  const response = await fetch('/api/connected-accounts');
  if (!response.ok) {
    throw new Error('Failed to fetch connected accounts');
  }
  const data = await response.json();
  return data.connectedAccounts;
};

const addConnectedAccount = async (newData: { domain: string; cookies: object }) => {
  const response = await fetch('/api/connected-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add account');
  }
  return response.json();
};

const deleteConnectedAccount = async (accountId: string) => {
  const response = await fetch(`/api/connected-accounts/${accountId}`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete account');
  }
  return response.json();
};

export default function ConnectedAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState('');
  const [newCookies, setNewCookies] = useState('');

  const { data: accounts, isLoading, isError } = useQuery({
    queryKey: ['connectedAccounts'],
    queryFn: fetchConnectedAccounts,
  });

  const addAccountMutation = useMutation({
    mutationFn: addConnectedAccount,
    onSuccess: () => {
      toast.success('Account connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['connectedAccounts'] });
      setNewDomain('');
      setNewCookies('');

      const resumeTaskToken = searchParams.get('resume_task_token');
      if (resumeTaskToken) {
        router.push(`/chat?resume_task=${resumeTaskToken}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteConnectedAccount,
    onSuccess: () => {
      toast.success('Account deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['connectedAccounts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newCookies) {
      toast.error('Please fill out both fields.');
      return;
    }
    try {
      const parsedCookies = JSON.parse(newCookies);
      addAccountMutation.mutate({ domain: newDomain, cookies: parsedCookies });
    } catch (error) {
      toast.error('Invalid JSON format for cookies.');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your connected accounts for scraping sites that require login.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</div>}
          {isError && <p className="text-red-500">Failed to load accounts.</p>}
          <div className="space-y-4">
            {accounts?.map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-semibold">{acc.domain}</p>
                  <p className="text-sm text-muted-foreground">Connected on {new Date(acc.created_at).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteAccountMutation.mutate(acc.id)}
                  disabled={deleteAccountMutation.isPending && deleteAccountMutation.variables === acc.id}
                >
                  {deleteAccountMutation.isPending && deleteAccountMutation.variables === acc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Account</CardTitle>
          <CardDescription>Provide the domain and session cookies to connect a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" placeholder="e.g., linkedin.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookies">Session Cookies (JSON)</Label>
              <Input id="cookies" placeholder='Paste your cookies here as a JSON string' value={newCookies} onChange={e => setNewCookies(e.target.value)} />
            </div>
            <Button type="submit" disabled={addAccountMutation.isPending}>
              {addAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
