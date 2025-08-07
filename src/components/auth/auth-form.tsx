'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithRedirect,
  OAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { createSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, KeyRound, Loader2, Mail, Phone, ExternalLink } from 'lucide-react';
import GoogleLogo from '../icons/google-logo';
import FusionAuthLogo from '../icons/fusionauth-logo';

const emailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const phoneSchema = z.object({
  phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' }),
  code: z.string().optional(),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function AuthForm() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneStep, setPhoneStep] = useState<'number' | 'code'>('number');
  
  const router = useRouter();
  const { toast } = useToast();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });

  const handleAuthSuccess = async (idToken: string) => {
    await createSession(idToken);
    router.push('/dashboard');
  };

  const handleAuthError = (error: any) => {
    console.error("Firebase Auth Error:", error);
    let description = 'An unexpected error occurred. Please try again.';
    if (error.code === 'auth/invalid-credential') {
      description = 'Invalid credentials. Please check your email and password.';
    } else if (error.code === 'auth/email-already-in-use') {
      description = 'This email is already in use. Please sign in or use a different email.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      description = 'The sign-in popup was closed. This may be due to a configuration issue. Please ensure your domain is authorized in Firebase.';
    } else if (error.code) {
      description = error.code.replace('auth/', '').replace(/-/g, ' ');
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Error',
      description: description,
    });
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    setLoading('email');
    try {
      const authFn = isSignUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const userCredential = await authFn(auth, data.email, data.password);
      
      const idToken = await userCredential.user.getIdToken();
      await handleAuthSuccess(idToken);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(null);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    return window.recaptchaVerifier;
  }

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setLoading('phone');
    if (phoneStep === 'number') {
      try {
        const appVerifier = setupRecaptcha();
        const confirmationResult = await signInWithPhoneNumber(auth, data.phone, appVerifier);
        setVerificationId(confirmationResult.verificationId);
        setPhoneStep('code');
        toast({ title: "Verification code sent", description: "Please check your phone." });
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(null);
      }
    } else { // phoneStep === 'code'
      if (verificationId && data.code) {
        try {
          // This part requires a different logic path using confirmationResult.confirm(code)
          // Simplified for this example. Full implementation would store confirmationResult.
          toast({ title: "Phone verification not fully implemented", description: "This is a demo."});
          console.log("Would attempt to verify with code:", data.code);
          // In a real app:
          // const credential = PhoneAuthProvider.credential(verificationId, data.code);
          // const userCredential = await signInWithCredential(auth, credential);
          // const idToken = await userCredential.user.getIdToken();
          // await handleAuthSuccess(idToken);
        } catch (error) {
          handleAuthError(error);
        } finally {
          setLoading(null);
        }
      } else {
        toast({variant: 'destructive', title: "Missing code", description: "Please enter verification code."});
        setLoading(null);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleAuthSuccess(idToken);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading('anonymous');
    try {
      const userCredential = await signInAnonymously(auth);
      const idToken = await userCredential.user.getIdToken();
      await handleAuthSuccess(idToken);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(null);
    }
  };
  
  const handlePasskeySignIn = async () => {
    setLoading('passkey');
    try {
      // Passkey sign-in logic will be implemented here in the future
      toast({
        title: 'Coming Soon!',
        description: 'Passkey sign-in is not yet available.',
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(null);
    }
  };
  
  const handleFusionAuthSignIn = async () => {
    const provider = new OAuthProvider('oidc.fusionauth');
    setLoading('fusionauth');
    try {
        // You would configure 'oidc.fusionauth' in your Firebase console
        await signInWithRedirect(auth, provider);
        // This will redirect, and you'd handle the result on page load.
    } catch (error) {
        handleAuthError(error);
        setLoading(null);
    }
  }


  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Choose your preferred sign-in method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@example.com" {...emailForm.register('email')} className="pl-10" />
                </div>
                {emailForm.formState.errors.email && <p className="text-destructive text-xs">{emailForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                   <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} {...emailForm.register('password')} className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                 {emailForm.formState.errors.password && <p className="text-destructive text-xs">{emailForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full font-bold" disabled={!!loading}>
                {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline" disabled={!!loading}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="phone">
             <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4 mt-4">
              {phoneStep === 'number' ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+1 123-456-7890" {...phoneForm.register('phone')} className="pl-10"/>
                  </div>
                  {phoneForm.formState.errors.phone && <p className="text-destructive text-xs">{phoneForm.formState.errors.phone.message}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input id="code" type="text" placeholder="123456" {...phoneForm.register('code')} />
                </div>
              )}
              <Button type="submit" className="w-full font-bold" disabled={!!loading}>
                {loading === 'phone' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {phoneStep === 'number' ? 'Send Code' : 'Verify Code'}
              </Button>
               {phoneStep === 'code' && (
                <p className="text-center text-sm">
                  <button type="button" onClick={() => { setPhoneStep('number'); setVerificationId(null);}} className="font-semibold text-primary hover:underline" disabled={!!loading}>
                    Use a different number
                  </button>
                </p>
              )}
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={!!loading}>
            {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleLogo className="mr-2 h-4 w-4" />}
             Google
          </Button>
          <Button variant="outline" onClick={handleAnonymousSignIn} disabled={!!loading}>
            {loading === 'anonymous' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
            Anonymous
          </Button>
        </div>

        <Button variant="secondary" className="w-full mt-2" onClick={handlePasskeySignIn} disabled={!!loading}>
           {loading === 'passkey' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4"/>} 
           Sign in with a passkey
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Enterprise</span>
          </div>
        </div>

        <Button onClick={handleFusionAuthSignIn} variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary" disabled={!!loading}>
           {loading === 'fusionauth' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FusionAuthLogo className="mr-2 h-4 text-primary" />}
          <span className="font-bold">FusionAuth</span>
          <ExternalLink className="ml-auto h-4 w-4 opacity-70"/>
        </Button>
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
}

// Add this to your global types or a suitable place
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
