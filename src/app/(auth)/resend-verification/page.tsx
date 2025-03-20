"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/ApiResponse";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { bricolage_grotesque } from "@/lib/fonts";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResendVerification() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyCodeSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        `/api/resend-verify-code`,
        {
          username: data.username,
          email: data.email,
        }
      );

      toast.success(response.data.message);
      router.push(`/verify/${encodeURIComponent(data.username)}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ??
          "An error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${bricolage_grotesque}`}
    >
      <div className="w-full max-w-xl p-8 space-y-8 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Resend Verification Code
          </h1>
          <p className="mb-4 text-sm">
            Enter your username and email to receive a new verification code
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} type="email" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full dark:bg-white dark:hover:bg-gray-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
