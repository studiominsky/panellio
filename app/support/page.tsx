import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Scroll } from 'lucide-react';
import Footer from '@/components/footer';
import Container from '@/containers/container';

import styles from '../../styles/components/Banner.module.css';

export default function Support() {
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
                The big picture <Scroll className="w-4 h-4 ml-2" />
              </Badge>
              <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
                Support
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Accusantium facilis fugit nobis quae voluptatibus,
                exercitationem soluta repellat unde mollitia vitae
                deserunt dolor harum?
              </p>
            </div>
          </Container>
        </div>
        <Container>123</Container>
      </main>
      <Footer />
    </>
  );
}
