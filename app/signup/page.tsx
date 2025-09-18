'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Container from '@/containers/container';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Signup() {
  const router = useRouter();
  const {
    user,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
  } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [validationState, setValidationState] = useState({
    checkingUsername: false,
    checkingEmail: false,
    isUsernameValid: null as boolean | null,
    isEmailValid: null as boolean | null,
    isPasswordValid: null as boolean | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.username) {
        router.push(`/${user.username}`);
      }
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (): boolean => {
    const password = form.password;
    const minLength = 8;
    const isValid = password.length >= minLength;
    setValidationState((prev) => ({
      ...prev,
      isPasswordValid: isValid,
    }));
    return isValid;
  };

  const validateUsername = async (): Promise<boolean> => {
    const username = form.username.trim();
    if (
      !username ||
      !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username) ||
      /__/.test(username) ||
      /^_|_$/.test(username)
    ) {
      setValidationState((prev) => ({
        ...prev,
        isUsernameValid: false,
      }));
      return false;
    }
    setValidationState((prev) => ({
      ...prev,
      checkingUsername: true,
    }));
    try {
      const functions = getFunctions(undefined, 'europe-west3');
      const validateUsernameFn = httpsCallable<
        { username: string },
        { available: boolean }
      >(functions, 'validateUsername');
      const result = await validateUsernameFn({ username });
      setValidationState((prev) => ({
        ...prev,
        checkingUsername: false,
        isUsernameValid: result.data.available,
      }));
      return result.data.available;
    } catch (error) {
      console.error('Error validating username:', error);
      toast({
        title: 'Validation Error',
        description: 'Unable to validate username.',
        variant: 'destructive',
      });
      setValidationState((prev) => ({
        ...prev,
        checkingUsername: false,
        isUsernameValid: false,
      }));
      return false;
    }
  };

  const validateEmail = async (): Promise<boolean> => {
    const email = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setValidationState((prev) => ({
        ...prev,
        isEmailValid: false,
      }));
      return false;
    }
    setValidationState((prev) => ({ ...prev, checkingEmail: true }));
    try {
      const functions = getFunctions(undefined, 'europe-west3');
      const validateEmailFn = httpsCallable<
        { email: string },
        { available: boolean }
      >(functions, 'validateEmail');
      const result = await validateEmailFn({ email });
      setValidationState((prev) => ({
        ...prev,
        checkingEmail: false,
        isEmailValid: result.data.available,
      }));
      return result.data.available;
    } catch (error) {
      console.error('Error validating email:', error);
      toast({
        title: 'Validation Error',
        description: 'Unable to validate email.',
        variant: 'destructive',
      });
      setValidationState((prev) => ({
        ...prev,
        checkingEmail: false,
        isEmailValid: false,
      }));
      return false;
    }
  };

  const handleSignup = async () => {
    setIsSubmitting(true);
    const { displayName, username, email, password } = form;

    if (
      !displayName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const [isUsernameValid, isEmailValid, isPasswordValid] =
      await Promise.all([
        validateUsername(),
        validateEmail(),
        validatePassword(),
      ]);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors before proceeding.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await signUpWithEmail(email, password, displayName, username);
      toast({
        title: 'Signup Successful',
        description: `Welcome, ${displayName}.`,
      });
    } catch (error) {
      console.error('Signup Error:', error);
      toast({
        title: 'Signup Failed',
        description: 'An error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = async (
    provider: 'google' | 'github'
  ) => {
    setIsLoading(true);
    try {
      const socialUser =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithGitHub();
      toast({
        title: `${provider === 'google' ? 'Google' : 'GitHub'} Signup Successful`,
        description: `Welcome, ${socialUser.displayName || 'there'}.`,
      });
    } catch (error) {
      console.error('Social Signup Error:', error);
      toast({
        title: `${provider === 'google' ? 'Google' : 'GitHub'} Signup Failed`,
        description:
          'An error occurred during signup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header />
      <main className="min-h-[80vh]">
        <Container>
          <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
            <h1 className="text-3xl font-semibold leading-1 mx-auto leading-tight md:leading-[1]">
              Create an account
            </h1>
            <div className="mt-10">
              <h2 className="text-lg font-medium mb-2">
                Sign up with Email
              </h2>
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Display Name"
                  value={form.displayName}
                  onChange={(e) =>
                    updateForm('displayName', e.target.value)
                  }
                  className="text-sm w-[300px] border-border mx-auto p-2 border rounded dark:bg-background"
                />
                <div className="flex flex-col items-center">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                      updateForm('username', e.target.value)
                    }
                    onBlur={validateUsername}
                    disabled={validationState.checkingUsername}
                    className={`text-sm w-[300px] border mx-auto p-2 rounded dark:bg-background`}
                  />
                  {form.username.trim() !== '' &&
                    validationState.isUsernameValid !== null && (
                      <span
                        className={`text-sm mt-2 m-auto text-end w-[300px] block ${
                          validationState.checkingUsername
                            ? 'text-blue-500'
                            : validationState.isUsernameValid === true
                              ? 'text-green-500'
                              : 'text-red-500'
                        }`}
                      >
                        {validationState.checkingUsername
                          ? 'Checking...'
                          : validationState.isUsernameValid
                            ? 'Username is available'
                            : 'Invalid or taken username'}
                      </span>
                    )}
                </div>
                <div className="flex flex-col items-center">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      updateForm('email', e.target.value)
                    }
                    onBlur={validateEmail}
                    disabled={validationState.checkingEmail}
                    className={`text-sm w-[300px] border mx-auto p-2 rounded dark:bg-background`}
                  />
                  {form.email.trim() !== '' &&
                    validationState.isEmailValid !== null && (
                      <span
                        className={`text-sm mt-2 m-auto text-end w-[300px] block ${
                          validationState.checkingEmail
                            ? 'text-yellow-500'
                            : validationState.isEmailValid
                              ? 'text-green-500'
                              : 'text-red-500'
                        }`}
                      >
                        {validationState.checkingEmail
                          ? 'Checking...'
                          : validationState.isEmailValid
                            ? 'Email is available'
                            : 'Invalid or taken email'}
                      </span>
                    )}
                </div>
                <div className="flex flex-col items-center">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => {
                      updateForm('password', e.target.value);
                      validatePassword();
                    }}
                    onBlur={validatePassword}
                    className="text-sm w-[300px] border-border mx-auto p-2 border rounded dark:bg-background"
                  />
                  {form.password.trim() !== '' &&
                    validationState.isPasswordValid !== null && (
                      <span
                        className={`text-sm mt-2 m-auto text-end w-[300px] block ${
                          validationState.isPasswordValid
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {validationState.isPasswordValid
                          ? 'Password is valid'
                          : `Password must be at least 8 characters long`}
                      </span>
                    )}
                </div>
                <Button
                  variant="action"
                  className="w-[300px] mx-auto"
                  onClick={handleSignup}
                  disabled={isSubmitting}
                >
                  <span className="flex gap-2 items-center">
                    <Mail height={17} width={17} />
                    <span>
                      {isSubmitting
                        ? 'Creating Account...'
                        : 'Create Account'}
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
                  onClick={() => handleSocialSignup('google')}
                >
                  <span className="flex gap-2 items-center">
                    <Image
                      src="/icons/google.svg"
                      className="h-full"
                      width={17}
                      height={17}
                      alt="Google Logo"
                    />
                    <span>Sign Up with Google</span>
                  </span>
                </Button>
                <Button
                  variant="dark"
                  className="w-[300px] mx-auto mt-3"
                  onClick={() => handleSocialSignup('github')}
                >
                  <span className="flex gap-2 items-center">
                    <Image
                      src="/icons/github.svg"
                      className="h-full"
                      width={17}
                      height={17}
                      alt="GitHub Logo"
                    />
                    <span>Sign Up with GitHub</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
