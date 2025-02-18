'use client'

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Loader2, X } from 'lucide-react';
import { Message } from '@/model/User';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { ApiResponse } from '@/types/ApiResponse';
import { toast } from 'sonner';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!message._id) {
      toast.error('Message ID is missing');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
      toast.success(response.data.message);
      onMessageDelete(message._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="relative cursor-text border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='p-0 bg-transparent text-gray-700 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-transparent absolute right-3 top-0'>
                {isDeleting ? (
                  <Loader2 className='animate-spin w-3 h-3 p-0 bg-transparent text-gray-700 dark:text-gray-500' />
                ) : (
                  <X className="w-4 h-4 hover:scale-110" />
                )}
              </Button>
            </AlertDialogTrigger>

            {/* Added missing confirmation popup */}
            <AlertDialogContent>
              <p>Are you sure you want to delete this message?</p>
              <AlertDialogAction onClick={handleDeleteConfirm}>Confirm</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-xs">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>
    </Card>
  );
}
