'use client';

import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import {
  Blocks,
  Box,
  Boxes,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Crown,
  Loader,
} from 'lucide-react';
import Footer from '@/components/footer';
import Container from '@/containers/container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import styles from '../../styles/components/Banner.module.css';
import { useAuth } from '@/context/auth-context';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Upgrade() {
  const { user, loading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async (priceId: string) => {
    setIsCheckingOut(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setIsCheckingOut(false);
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId,
          success_url: `${window.location.origin}/${user?.username}`,
          cancel_url: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to create checkout session'
        );
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">Please Sign In</h2>
          <p className="text-foreground/80 mt-2">
            You need to be logged in to manage your subscription.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between mt-10 mb-[120px] gap-5 w-full lg:flex-row md:mt-20">
        <div className="flex flex-col w-full border bg-card border-border rounded-xl p-6 md:p-8 lg:w-1/3">
          <span className="text-4xl font-bold flex items-center gap-2">
            <Box size={30} />
            <span>Core</span>
          </span>
          <p className="text-md mt-3 text-foreground/60">
            The foundational plan for getting started and exploring
            our main features.
          </p>

          <span className="flex items-end gap-3 mt-3">
            <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
              {user.stripeRole === 'core'
                ? 'Your Current Plan'
                : 'Free forever'}
            </span>
          </span>
          <Button variant="outline" disabled className="mt-4">
            {user.stripeRole === 'core' ? 'Active' : 'Downgrade'}
          </Button>
          <span className="my-4 text-foreground/60">
            The Core plan includes:
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Basic functionality
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Access to core features
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Up to 3 directories
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleX size={20} />
            No file storage included
          </span>
        </div>

        <div className="flex flex-col w-full  border bg-card border-[--ui-primary] rounded-xl p-6 md:p-8 lg:w-1/3 lg:mt-[-30px]">
          <span className="text-4xl font-bold flex items-center gap-2">
            <Boxes size={30} />
            <span>Pro</span>
          </span>
          <p className="text-md mt-3 text-foreground/60">
            Ideal for professionals who need more power, storage, and
            unlimited access to features.
          </p>
          <span className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
              1.29€
            </span>
            <span className="text-sm">per month</span>
          </span>
          <Button
            name="Upgrade to Pro"
            className="mt-4"
            onClick={() =>
              handleCheckout('price_1S8QADKVr2xFb4ZKGNnsBUOt')
            }
            disabled={
              isCheckingOut ||
              user.stripeRole === 'pro' ||
              user.stripeRole === 'premium'
            }
          >
            {isCheckingOut && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            {user.stripeRole === 'pro'
              ? 'Your Current Plan'
              : 'Upgrade to Pro'}
          </Button>
          <span className="my-4 text-foreground/60">
            Everything in Core, plus:
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Full functionality
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            All features unlocked
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Unlimited directories
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            100MB of file storage
          </span>
        </div>

        <div className="flex flex-col w-full border bg-card border-border rounded-xl p-6 md:p-8 lg:w-1/3">
          <span className="text-4xl font-bold flex items-center gap-2">
            <Crown size={30} />
            <span>Premium</span>
          </span>
          <p className="text-md mt-3 text-foreground/60">
            For users who want it all, including early access to new
            features and AI capabilities.
          </p>
          <span className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-bold text-[--ui-primary] relative top-[3px]">
              3.29€
            </span>
            <span className="text-sm">per month</span>
          </span>
          <Button
            variant="outline"
            name="Upgrade to Premium"
            className="mt-4"
            onClick={() =>
              handleCheckout('price_1S8QATKVr2xFb4ZKZREF6gxA')
            }
            disabled={isCheckingOut || user.stripeRole === 'premium'}
          >
            {isCheckingOut && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            {user.stripeRole === 'premium'
              ? 'Your Current Plan'
              : 'Upgrade to Premium'}
          </Button>
          <span className="my-4 text-foreground/60">
            Everything in Pro, plus:
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Full functionality
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            All features unlocked
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Unlimited directories
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            500MB of file storage
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Access to experimental features
          </span>
          <span className="flex items-center gap-2 mb-2">
            <CircleCheckBig size={20} />
            Integrated AI assistant
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main>
        <div className={`${styles.banner} ${styles.bannerStory}`}>
          <Container>
            <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
              <Badge
                variant="outline"
                className="mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                Upgrade Your Plan <Blocks className="w-4 h-4 ml-2" />
              </Badge>
              <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
                Unlock More Features
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Choose a plan to expand your capabilities and get the
                most out of Panellio.
              </p>
              <p className="text-center text-foreground/80 mt-4 max-w-[690px] mx-auto">
                Panellio is an open-source application. While we offer
                managed hosting with our paid plans, you always have
                the option to self-host it on your own cloud provider.
                <br />
                Check out our{' '}
                <Link
                  href="https://github.com/studiominsky/panellio"
                  target="_blank"
                  className="text-[--ui-primary] hover:underline"
                >
                  GitHub repository
                </Link>{' '}
                to get started.
              </p>
            </div>
          </Container>
        </div>
        <Container>{renderContent()}</Container>
      </main>
      <Footer />
    </>
  );
}
