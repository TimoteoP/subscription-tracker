'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface ExportButtonProps {
  className?: string;
}

export default function ExportButton() {  // <- Rimossa props className
  const { user } = useUser();

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!user) return;
    
    try {
      const url = `/api/export?format=${format}&userId=${user.id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `subscriptions.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to generate export. Please try again.');
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={() => handleExport('pdf')}>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button variant="outline" onClick={() => handleExport('csv')}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}