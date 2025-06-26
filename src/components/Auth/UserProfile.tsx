"use client";

import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const { user, signOut, isLoading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Reindirizza alla home dopo il logout
  };

  if (isLoading) {
    // Mostra uno scheletro mentre carica, per evitare sfarfallii
    return <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>;
  }

  if (!user) {
    // Se non c'è l'utente, non mostrare nulla o un pulsante di login
    return null; 
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <UserIcon className="h-5 w-5 text-gray-600" />
        <span className="font-medium">{user.email}</span>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}