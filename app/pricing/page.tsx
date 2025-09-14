import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Scroll } from 'lucide-react';
import Footer from '@/components/footer';
import Container from '@/containers/container';
import {
  Box,
  Boxes,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import styles from '../../styles/components/Banner.module.css';

export default function Pricing() {
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
                Pricing models <Scroll className="w-4 h-4 ml-2" />
              </Badge>
              <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
                Choose Your Plan
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Whether you're just starting out or need advanced
                features, we have a plan that's right for you.
              </p>
            </div>
          </Container>
        </div>
        <Container>
          <div className="flex flex-col justify-between mt-10 mb-[320px] gap-5 w-full lg:flex-row md:mt-20">
            <div className="flex flex-col w-full border bg-card border-border rounded-xl p-6 md:p-8 lg:w-1/3">
              <span className="text-4xl font-bold flex items-center gap-2">
                <Box size={30} />
                <span>Core</span>
              </span>
              <p className="text-md mt-3 text-foreground/60">
                Perfect for getting started and exploring our main
                features without any commitment.
              </p>
              <span className="flex items-end gap-3 mt-3">
                <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
                  Free forever
                </span>
              </span>
              <Button
                variant="outline"
                asChild
                name="Sign Up"
                className="mt-4"
              >
                <Link href="/signup">
                  Start for Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
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
                Ideal for professionals who need more power, storage,
                and unlimited access to features.
              </p>
              <span className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
                  1.29€
                </span>
                <span className="text-sm">per month</span>
              </span>
              <Button asChild name="Sign Up" className="mt-4">
                <Link href="/signup">
                  Go Pro
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
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
                For users who want it all, including early access to
                new features and AI capabilities.
              </p>
              <span className="flex items-baseline gap-3 mt-3">
                <span className="text-4xl font-bold text-[--ui-primary] relative top-[3px]">
                  3.29€
                </span>
                <span className="text-sm">per month</span>
              </span>
              <Button
                variant="outline"
                asChild
                name="Sign Up"
                className="mt-4"
              >
                <Link href="/signup">
                  Go Premium
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
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
        </Container>
      </main>
      <Footer />
    </>
  );
}
