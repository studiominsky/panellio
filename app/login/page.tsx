'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Container from '@/containers/container';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { doc, getDoc } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Login() {
  const router = useRouter();
  const { loginWithEmail, signInWithGoogle, signInWithGitHub } =
    useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const redirectToUserPage = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.username) {
          router.push(`/${userData.username}`);
        } else {
          toast({
            title: 'Error',
            description:
              'Username not found. Redirecting to dashboard.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to redirect. Redirecting to dashboard.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await loginWithEmail(email, password);
      if (currentUser) {
        toast({
          title: 'Login Successful',
          description: `Welcome, ${
            currentUser.displayName || currentUser.email
          }.`,
        });
        await redirectToUserPage(currentUser.uid);
      }
    } catch (err) {
      toast({
        title: 'Login Failed',
        description:
          'Please check your email and password and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const currentUser = await signInWithGoogle();
      if (currentUser) {
        toast({
          title: 'Google Login Successful',
          description: `Welcome, ${
            currentUser.displayName || currentUser.email
          }.`,
        });
        await redirectToUserPage(currentUser.uid);
      }
    } catch (err) {
      toast({
        title: 'Google Login Failed',
        description: 'An error occurred during login with Google.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const currentUser = await signInWithGitHub();
      if (currentUser) {
        toast({
          title: 'GitHub Login Successful',
          description: `Welcome back, ${
            currentUser.displayName || currentUser.email
          }.`,
        });
        await redirectToUserPage(currentUser.uid);
      }
    } catch (err) {
      toast({
        title: 'GitHub Login Failed',
        description: 'An error occurred during login with GitHub.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header />
      <main className="min-h-[80vh]">
        <Container>
          <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
            <h1 className="text-3xl font-semibold leading-1 mx-auto leading-tight md:leading-[1]">
              Log in to your account
            </h1>
            <div className="mt-10">
              <h2 className="text-lg font-medium mb-2">
                Log in with Email
              </h2>
              <div className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm w-[300px] border-border mx-auto p-2 border rounded dark:bg-background"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm w-[300px] border-border mx-auto p-2 border rounded dark:bg-background"
                />
                <Button
                  variant="action"
                  className="w-[300px] mx-auto"
                  onClick={handleEmailLogin}
                  disabled={isLoading}
                >
                  <span className="flex gap-2 items-center">
                    <Mail height={17} width={17} />
                    <span>
                      {isLoading
                        ? 'Logging In...'
                        : 'Log In with Email'}
                    </span>
                  </span>
                </Button>
              </div>
              <h2 className="text-lg font-medium mt-12 mb-2">
                Or using your service provider
              </h2>
              <div className="flex flex-col gap-1">
                <Button
                  variant="light"
                  className="w-[300px] mx-auto mt-3"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <span className="flex gap-2 items-center">
                    <Image
                      src="/icons/google.svg"
                      width={17}
                      height={17}
                      alt="Google Logo"
                    />
                    <span>Log In with Google</span>
                  </span>
                </Button>
                <Button
                  variant="dark"
                  className="w-[300px] mx-auto mt-3"
                  onClick={handleGitHubLogin}
                  disabled={isLoading}
                >
                  <span className="flex gap-2 items-center">
                    <Image
                      src="/icons/github.svg"
                      width={17}
                      height={17}
                      alt="GitHub Logo"
                    />
                    <span>Log In with GitHub</span>
                  </span>
                </Button>
              </div>
            </div>
            <Button variant="link" className="w-[300px] mx-auto mt-5">
              <Link href="/signup">
                Don&apos;t have an account? Sign Up
              </Link>
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
