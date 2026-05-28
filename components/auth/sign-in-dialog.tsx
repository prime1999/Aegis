"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        statement: "I accept the Terms of Service at http://localhost:3000",
      });

      if (error) {
        setError(error.message || "Failed to sign in with Web3.");
        return;
      }

      if (data) {
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black text-white">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Continue with Web3 authentication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white mb-1">
            Username
          </label>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your username"
            className="focus:outline-none mt-2"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>

        <DialogFooter className="flex flex-col">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-2 py-2 rounded-md bg-white/90 text-black cursor-pointer duration-500 hover:bg-white/80"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full bg-red-500 py-2 rounded-md cursor-pointer duration-500 hover:bg-red-600"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
