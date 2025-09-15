'use client';

import { useRef, useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useAuth } from '@/context/auth-context';
import ThemeSelector from '@/components/theme-selector';
import { ColorThemeSelector } from '@/components/color-theme-selector';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Full from '@/containers/full';
import Wide from '@/containers/wide';
import { Button } from '@/components/ui/button';
import {
  Angry,
  ChevronRight,
  Frown,
  Loader,
  Meh,
  MessageSquare,
  Settings,
  Smile,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useColorTheme } from '@/hooks/use-color-theme';
import { Input } from '@/components/ui/input';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import headerStyles from '../styles/components/Header.module.css';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import {
  useTimeFormat,
  TimeFormat,
} from '@/context/time-format-context';
import Logo from './logo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] =
    useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorTheme, setColorTheme] = useColorTheme();
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user, logout, setUser, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [hasUnsavedThemeChanges, setHasUnsavedThemeChanges] =
    useState(false);
  const { timeFormat, setTimeFormat } = useTimeFormat();

  const [localSettings, setLocalSettings] = useState<{
    displayName: string;
    username: string;
    theme: string;
    colorTheme: string;
    timeFormat: TimeFormat;
    location: string;
  }>({
    displayName: user?.displayName || '',
    username: user?.username || '',
    theme: user?.theme || 'system',
    colorTheme: user?.colorTheme || colorTheme,
    timeFormat: timeFormat,
    location: user?.location || '',
  });

  useEffect(() => {
    if (user) {
      setTheme(user.theme || 'system');
    }
  }, [user]);

  useEffect(() => {
    setLocalSettings((prev) => ({
      ...prev,
      timeFormat: timeFormat,
    }));
  }, [timeFormat]);

  const handleTimeFormatChange = (value: TimeFormat) => {
    setLocalSettings((prev) => ({
      ...prev,
      timeFormat: value,
    }));
  };

  const [usernameValidationState, setUsernameValidationState] =
    useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const validateUsernameRef =
    useRef<(usernameToValidate: string) => void>();

  const [selectedColorTheme, setSelectedColorTheme] =
    useState(colorTheme);

  useEffect(() => {
    if (user?.colorTheme) {
      setSelectedColorTheme(user.colorTheme);
    }
  }, [user]);

  const hasUnsavedChanges = () => {
    if (!user) return false;
    return (
      localSettings.displayName !== (user.displayName || '') ||
      localSettings.username !== (user.username || '') ||
      localSettings.theme !== (user.theme || 'system') ||
      localSettings.colorTheme !== colorTheme ||
      localSettings.timeFormat !== timeFormat ||
      localSettings.location !== (user.location || '')
    );
  };

  const hasFeedbackChanges = () => {
    return message.trim() !== '' || emoji !== '';
  };

  useEffect(() => {
    const debouncedValidate = debounce(
      async (usernameToValidate: string) => {
        if (user && usernameToValidate === user.username) {
          setUsernameValidationState('valid');
          return;
        }

        if (!usernameToValidate.trim()) {
          setUsernameValidationState('invalid');
          toast({
            title: 'Invalid Username',
            description: 'Username cannot be empty.',
            variant: 'destructive',
          });
          return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(usernameToValidate)) {
          setUsernameValidationState('invalid');
          toast({
            title: 'Invalid Username',
            description:
              'Usernames can only contain letters, numbers, and underscores.',
            variant: 'destructive',
          });
          return;
        }

        setIsCheckingUsername(true);
        try {
          const functions = getFunctions(undefined, 'europe-west3');
          const validateUsernameFn = httpsCallable<
            { username: string },
            { available: boolean }
          >(functions, 'validateUsername');
          const result = await validateUsernameFn({
            username: usernameToValidate,
          });

          setIsCheckingUsername(false);

          if (result.data.available) {
            setUsernameValidationState('valid');
          } else {
            setUsernameValidationState('invalid');
            toast({
              title: 'Username Taken',
              description: 'Please choose a different username.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error validating username:', error);
          setIsCheckingUsername(false);
          setUsernameValidationState('invalid');
          toast({
            title: 'Error',
            description:
              'Failed to validate username. Try again later.',
            variant: 'destructive',
          });
        }
      },
      500
    );

    validateUsernameRef.current = debouncedValidate;

    return () => {
      debouncedValidate.cancel();
    };
  }, [user]);

  const handleInputUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newUsername = e.target.value;
    setLocalSettings((prev) => ({ ...prev, username: newUsername }));
    setUsernameValidationState('idle');
    validateUsernameRef.current?.(newUsername);
  };

  const handleInputUserNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDisplayName = e.target.value;
    setLocalSettings((prev) => ({
      ...prev,
      displayName: newDisplayName,
    }));
  };

  const handleThemeChange = (value: string) => {
    setLocalSettings((prev) => ({ ...prev, theme: value }));
    setTheme(value);
    setHasUnsavedThemeChanges(true);
  };

  const handleColorThemeChange = (color: string) => {
    setLocalSettings((prev) => ({ ...prev, colorTheme: color }));
    setSelectedColorTheme(color);
  };

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLocation = e.target.value;
    setLocalSettings((prev) => ({ ...prev, location: newLocation }));
  };

  useEffect(() => {
    if (user) {
      setLocalSettings({
        displayName: user.displayName || '',
        username: user.username || '',
        theme: user.theme || 'system',
        colorTheme: user.colorTheme || colorTheme,
        timeFormat: (user.timeFormat as TimeFormat) || '24h',
        location: user.location || '',
      });
    }
  }, [user, colorTheme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOverlayVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleOverlay = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOverlayVisible((prev) => !prev);
  };

  const handleUpdateSettings = async () => {
    if (!hasUnsavedChanges()) {
      toast({
        title: 'No Changes',
        description: 'No changes have been made to save.',
      });
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingSave(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: localSettings.displayName,
        username: localSettings.username,
        theme: localSettings.theme,
        colorTheme: localSettings.colorTheme,
        timeFormat: localSettings.timeFormat,
        location: localSettings.location,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: localSettings.displayName,
              username: localSettings.username,
              theme: localSettings.theme,
              colorTheme: localSettings.colorTheme,
              timeFormat: localSettings.timeFormat,
              location: localSettings.location,
            }
          : prev
      );

      toast({
        title: 'Settings Updated',
        description: 'Your settings have been successfully updated.',
      });

      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const usernameInputClassName = (() => {
    if (
      usernameValidationState === 'valid' &&
      localSettings.username !== user?.username
    ) {
      return 'border-green-500';
    } else if (usernameValidationState === 'invalid') {
      return 'border-red-500';
    } else {
      return '0';
    }
  })();

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await attemptReauthentication(currentUser);
      const userDocRef = doc(db, 'users', currentUser.uid);

      setDeleteDialogOpen(false);
      setIsSettingsDialogOpen(false);

      await deleteDoc(userDocRef);
      await deleteUser(currentUser);

      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted.',
      });

      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);

      let errorMessage = 'Failed to delete account.';
      if ((error as any).code === 'auth/requires-recent-login') {
        errorMessage =
          'Please re-authenticate to delete your account.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setIsSettingsDialogOpen(false);

    if (hasUnsavedThemeChanges) {
      setLocalSettings((prev) => ({
        ...prev,
        theme: user?.theme || 'system',
      }));
      setTheme(user?.theme || 'system');
    }

    setHasUnsavedThemeChanges(false);
  };

  useEffect(() => {
    setLocalSettings((prev) => ({
      ...prev,
      theme: theme || 'system',
    }));
  }, [theme]);

  const attemptReauthentication = async (user: any) => {
    const auth = getAuth();

    const providerId = user.providerData[0].providerId;

    if (providerId === 'google.com') {
      const googleProvider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, googleProvider);
    } else if (providerId === 'github.com') {
      const githubProvider = new GithubAuthProvider();
      await reauthenticateWithPopup(user, githubProvider);
    } else if (providerId === 'password') {
      const email = user.email;
      const password = prompt(
        'Please enter your password to confirm deletion:'
      );
      if (!password)
        throw new Error('Password required for re-authentication.');
      const credential = EmailAuthProvider.credential(
        email!,
        password
      );
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error('Unknown authentication provider.');
    }
  };

  const onSubmitFeedback = async () => {
    if (!message && !emoji) {
      toast({
        title: 'Error',
        description: 'Please provide a message or select an emoji.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingSend(true);

    try {
      const payload = {
        name: isAnonymous ? null : user?.displayName,
        email: isAnonymous ? null : user?.email,
        message,
        emoji,
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Feedback Sent',
          description: 'Thank you for your feedback!',
        });
        setMessage('');
        setEmoji('');
        setIsFeedbackDialogOpen(false);
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'Failed to send feedback. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSend(false);
      setIsFeedbackDialogOpen(false);
    }
  };

  const handleSubmitFeedback = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmitFeedback();
  };

  const emojiOptions = [
    { emoji: <Smile className="w-5 h-5" />, value: 'smile' },
    { emoji: <Meh className="w-5 h-5" />, value: 'meh' },
    { emoji: <Frown className="w-5 h-5" />, value: 'frown' },
    { emoji: <Angry className="w-5 h-5" />, value: 'angry' },
  ];

  const currentUsername = user?.username || '';

  const headerContent = (
    <div className="py-1 w-full flex items-center justify-between">
      <div className="flex gap-6 items-center min-h-[40px]">
        <Link
          href={user ? `/${currentUsername}` : '/'}
          scroll={false}
        >
          <span className="flex items-center">
            <Logo />
          </span>
        </Link>

        {!user && !loading && (
          <nav className="hidden md:flex">
            <ul className="flex md:gap-3 lg:gap-10 items-center">
              {['/story', '/resources', '/pricing', '/support'].map(
                (link, index) => (
                  <li key={index}>
                    <Link
                      href={link}
                      scroll={false}
                      className={`text-sm text-foreground/60 hover:text-inverted ${
                        (pathname === link ||
                          pathname.startsWith(`${link}/`)) &&
                        `text-inverted bg-bottom-border border-b-[1px] border-foreground/100`
                      }`}
                    >
                      {link.replace('/', '').charAt(0).toUpperCase() +
                        link.slice(2)}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
        )}

        {user &&
          user.displayName &&
          !(
            pathname === `/${currentUsername}` ||
            pathname.startsWith(`/${currentUsername}/`)
          ) && (
            <Link
              href={`/${currentUsername}`}
              scroll={false}
              className={`items-center gap-2 hidden sm:flex`}
            >
              <div className="w-2 h-2 bg-[--ui-primary] rounded-full" />
              <span
                className={`flex text-sm text-foreground/60 hover:text-inverted duration-300 transition-all ${
                  (pathname === `/${currentUsername}/` ||
                    pathname.startsWith(`/${currentUsername}/`)) &&
                  `text-foreground/100 font-bold`
                }`}
              >
                {user.displayName}&apos;s directories
              </span>
            </Link>
          )}

        {user &&
          user.displayName &&
          (pathname === `/${currentUsername}` ||
            pathname.startsWith(`/${currentUsername}/`)) && (
            <div className="relative items-center gap-2 hidden sm:flex">
              <Link
                href={`/${currentUsername}`}
                scroll={false}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-[--ui-primary] rounded-full" />
                <span
                  className={`flex text-sm text-foreground/60 hover:text-inverted duration-300 transition-all ${
                    pathname === `/${currentUsername}` &&
                    `text-inverted`
                  }`}
                >
                  {user.displayName}&apos;s directories
                </span>
              </Link>
            </div>
          )}
      </div>
      <div className="hidden gap-3 md:flex md:items-center">
        {user && (
          <>
            <Dialog
              open={isFeedbackDialogOpen}
              onOpenChange={setIsFeedbackDialogOpen}
            >
              <DialogTrigger
                onClick={() => setIsFeedbackDialogOpen(true)}
                className="inline-flex items-center justify-center duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50 h-10 px-4 py-2"
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Feedback
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Feedback</DialogTitle>
                  <DialogDescription>
                    Send us your feedback or report an issue.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="mt-4">
                    <Textarea
                      className="mt-2"
                      placeholder="Enter your feedback"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <div>
                    <ColorThemeProvider>
                      <div className="flex gap-4">
                        {emojiOptions.map((option) => (
                          <Button
                            variant="emoji"
                            key={option.value}
                            onClick={() =>
                              setEmoji((prev) =>
                                prev === option.value
                                  ? ''
                                  : option.value
                              )
                            }
                            className={`p-2 rounded-full border hover:bg-transparent ${
                              emoji === option.value
                                ? 'border-[--ui-primary]'
                                : ''
                            } hover:border-[--ui-primary]`}
                          >
                            {option.emoji}
                          </Button>
                        ))}
                      </div>
                    </ColorThemeProvider>
                  </div>

                  <DialogFooter>
                    <div className="flex justify-between w-full items-center mt-4">
                      <Label className="flex items-center gap-3 text-sm cursor-pointer">
                        <Switch
                          id="anonymous-mode"
                          checked={isAnonymous}
                          onCheckedChange={(checked) =>
                            setIsAnonymous(checked)
                          }
                        />
                        Send anonymously
                      </Label>

                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={
                          !hasFeedbackChanges() || loadingSend
                        }
                      >
                        {loadingSend ? (
                          <div className="flex items-center gap-2">
                            <Loader
                              className="animate-spin"
                              size={16}
                            />
                            Sending...
                          </div>
                        ) : (
                          'Send Feedback'
                        )}
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isSettingsDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleDialogClose();
                } else {
                  setIsSettingsDialogOpen(true);
                }
              }}
            >
              <DialogTrigger
                onClick={() => {
                  setIsSettingsDialogOpen(true);
                  setSelectedColorTheme(colorTheme);
                }}
                className="inline-flex items-center justify-center duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50 h-10 px-4 py-2"
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Update your user information and preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <Input
                      type="text"
                      value={localSettings.displayName}
                      onChange={handleInputUserNameChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 mt-4 font-medium text-muted-foreground">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={localSettings.username}
                      onChange={handleInputUsernameChange}
                      className={usernameInputClassName}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 mt-4 font-medium text-muted-foreground">
                      Location
                    </label>
                    <Input
                      type="text"
                      value={localSettings.location}
                      onChange={handleLocationChange}
                      placeholder="Enter your location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 mt-4 font-medium text-muted-foreground">
                      Time Format
                    </label>
                    <Select
                      value={localSettings.timeFormat}
                      onValueChange={(value) =>
                        handleTimeFormatChange(value as TimeFormat)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Time Format" />
                      </SelectTrigger>
                      <SelectContent className="border-border shadow-none">
                        <SelectItem value="24h">24-Hour</SelectItem>
                        <SelectItem value="12h">
                          12-Hour (AM/PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mt-4 mb-2 text-sm font-medium text-muted-foreground">
                      Theme
                    </label>
                    <Select
                      value={localSettings.theme}
                      onValueChange={(value) =>
                        handleThemeChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border shadow-none">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 items-center justify-between">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Accent Color
                    </label>
                    <ColorThemeSelector
                      selectedColor={localSettings.colorTheme}
                      onSelectColor={(color) =>
                        handleColorThemeChange(color)
                      }
                    />
                  </div>

                  <div className="flex gap-3 items-center justify-between">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <span className="text-sm text-foreground/80">
                      {user.email}
                    </span>
                  </div>

                  <div className="border-[0.5px] border-border"></div>

                  <Button
                    variant="destructiveLink"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="mt-4 p-0"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>

                  <Button
                    onClick={handleUpdateSettings}
                    className="w-full"
                    disabled={
                      !hasUnsavedChanges() || isCheckingUsername
                    }
                  >
                    {loadingSave ? (
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin" size={16} />
                        Saving...
                      </div>
                    ) : (
                      'Save changes'
                    )}
                  </Button>

                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Confirm Account Deletion
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your
                          account? This action is irreversible, and
                          all of your data will be lost.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4">
                        <Button
                          variant="primary"
                          onClick={() => setDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => {
                logout();
                toast({
                  title: 'Logged out',
                  description:
                    'You have been logged out. See you soon.',
                });
              }}
            >
              Log Out
            </Button>
          </>
        )}

        {!loading && !user && (
          <>
            <div ref={themeSelectorRef}>
              <ThemeSelector />
            </div>
            <Button variant="outline" asChild>
              <Link href="/login" scroll={false}>
                Log In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup" scroll={false}>
                Sign Up <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <header
        className={`sticky top-0 transition duration-300 z-10 pt-4 ${
          isScrolled ? 'border-b' : ''
        } ${
          user &&
          currentUsername &&
          (pathname === `/${currentUsername}` ||
            pathname.startsWith(`/${currentUsername}/`))
            ? 'bg-card'
            : 'bg-background'
        }`}
      >
        {user &&
        currentUsername &&
        (pathname === `/${currentUsername}` ||
          pathname.startsWith(`/${currentUsername}/`)) ? (
          <Full>{headerContent}</Full>
        ) : (
          <Wide>{headerContent}</Wide>
        )}
      </header>

      <button
        ref={buttonRef}
        onClick={toggleOverlay}
        className={headerStyles.menuButton}
        aria-label="Menu"
      >
        {isOverlayVisible ? (
          <svg
            className={headerStyles.menuSvg}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            className={headerStyles.menuSvg}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {isOverlayVisible && (
        <div
          ref={menuRef}
          className={`flex flex-col bg-card border-border border-l gap-10 ${
            headerStyles.overlay
          } ${isOverlayVisible ? headerStyles.active : ''}`}
        >
          <nav className={headerStyles.mobileNav}>
            <ul className={headerStyles.mobileUl}>
              <li
                className={`${headerStyles.mobileLi} ${
                  pathname === '/story' ? headerStyles.activeLink : ''
                }`}
              >
                <Link href="/story" scroll={false}>
                  Story
                </Link>
              </li>
              <li
                className={`${headerStyles.mobileLi} ${
                  pathname.startsWith('/resources')
                    ? headerStyles.activeLink
                    : ''
                }`}
              >
                <Link href="/resources" scroll={false}>
                  Resources
                </Link>
              </li>
              <li
                className={`${headerStyles.mobileLi} ${
                  pathname === '/pricing'
                    ? headerStyles.activeLink
                    : ''
                }`}
              >
                <Link href="/pricing" scroll={false}>
                  Pricing
                </Link>
              </li>
              <li
                className={`${headerStyles.mobileLi} ${
                  pathname === '/support'
                    ? headerStyles.activeLink
                    : ''
                }`}
              >
                <Link href="/support" scroll={false}>
                  Support
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col items-center gap-4">
            {!user && (
              <>
                <Button
                  variant="outline"
                  asChild
                  name="Sign Up"
                  className="w-full"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button asChild name="Log in" className="w-full">
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
            {user && (
              <Button
                asChild
                name="Go to your directories"
                className="w-full"
              >
                <Link href={`/${user.username}`}>
                  Go to Panellio{' '}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
