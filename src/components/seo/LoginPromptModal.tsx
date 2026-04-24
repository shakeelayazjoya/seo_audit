'use client';

import { LogIn, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginPromptModal({ open, onOpenChange }: LoginPromptModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    router.push('/login');
  };

  const handleSignUp = () => {
    onOpenChange(false);
    router.push('/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center border-b">
            <div className="absolute top-4 right-4">
               <Button variant="ghost" size="icon" className="rounded-full size-8" onClick={() => onOpenChange(false)}>
                  <X className="size-4" />
               </Button>
            </div>
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <LogIn className="size-8 text-primary-foreground" />
            </motion.div>
          </div>

          <div className="p-8 pt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Authentication Required</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unlock full access to our SEO suite. Create an account to run audits, track history, and get actionable fix guides.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 group" 
                onClick={handleLogin}
              >
                Sign In to Continue
                <LogIn className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-base font-semibold group" 
                onClick={handleSignUp}
              >
                Create Free Account
                <UserPlus className="ml-2 size-4 transition-transform group-hover:scale-110" />
              </Button>
            </div>

            <p className="text-center mt-6 text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
