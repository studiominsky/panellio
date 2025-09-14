import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Mail } from 'lucide-react';
import Footer from '@/components/footer';
import Container from '@/containers/container';

import styles from '../../styles/components/Banner.module.css';
import { SupportForm } from '@/components/support-form';

export default function Support() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className={`${styles.banner} ${styles.bannerStory}`}>
          <Container>
            <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
              <Badge
                variant="outline"
                className="mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                Here to Help <LifeBuoy className="w-4 h-4 ml-2" />
              </Badge>
              <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
                Support
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Have questions or feedback? We're here to assist you.
                Reach out to us, and we'll get back to you as soon as
                possible.
              </p>
            </div>
          </Container>
        </div>
        <Container>
          <div className="my-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Contact Us
            </h2>
            <p className="text-foreground/80 mb-8">
              For direct inquiries, you can also email us at:
              <a
                href="mailto:panellio@proton.me"
                className="font-medium text-[--ui-primary] flex items-center justify-center gap-2 mt-2"
              >
                <Mail className="w-4 h-4" /> panellio@proton.me
              </a>
            </p>
          </div>
          <div className="mt-8 mb-16">
            <SupportForm />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
