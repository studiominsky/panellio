import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Scroll } from 'lucide-react';
import Footer from '@/components/footer';
import Container from '@/containers/container';

import styles from '../../styles/components/Banner.module.css';

export default function Story() {
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
                Story behind the project
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Hey, can I have your attention for a second? I know, I
                know — easier said than done, right? It feels like
                everyone and everything is constantly competing for
                our attention these days. It’s no wonder the world
                feels so overwhelming.
              </p>
            </div>
          </Container>
        </div>
        <Container>
          <div className="py-5 mb-20 max-w-[720px] mx-auto">
            <p className="text-foreground/80 text-lg leading-relaxed mt-1">
              Every moment, it’s like our time is being sliced up and
              sold off, and we never get it back. No surprise we’re
              all feeling so worn out.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              I get it. I’ve been there. I’ve found myself endlessly
              scrolling, getting pulled in a million different
              directions, and ending the day wondering where all my
              time went. It’s frustrating, and honestly, a little
              demoralizing. That’s when I realized something needed to
              change. I needed something to help me regain control, to
              cut through the noise, and to focus on what actually
              matters.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              That’s why I started working on Panellio.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              This isn’t just another app to help you manage your
              to-do list. It’s something I built because, like you, I
              was tired of feeling overwhelmed by all the
              distractions. Panellio is about taking back your time,
              your focus, and your peace of mind. It’s like a toolkit
              for managing your online life in a way that feels
              deliberate and meaningful, not chaotic and stressful.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              We all deserve a little breathing room in this busy
              world. Panellio is my way of helping you—and me—find
              that.
            </p>
            <h3 className="text-foreground font-semibold text-xl leading-relaxed mt-6">
              How Panellio tries to achieve this
            </h3>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Panellio is designed to help you build a more
              intentional digital life—one where your time and
              attention are spent on what truly matters, rather than
              being scattered across countless distractions. It tries
              to achieve this by focusing on three key areas: setting
              directories, adding features, and monitoring your
              progress.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Here’s how it works:
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Think of directories as the foundation of your digital
              life. They’re containers that allow you to organize
              everything into clear, distinct categories. Whether it’s
              work, personal projects, health, or hobbies, directories
              help you separate your life into manageable segments.
              This way, you can focus on one area at a time without
              getting overwhelmed by everything else.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Within each directory, you can add files and features
              that act as the building blocks of your organized life.
              Features can be anything you need—a task list to keep
              you on track, a challenge tracker to motivate you, or
              even a journal to reflect on your progress. Files can
              include important documents, notes, or resources that
              belong in that category. It’s all about having
              everything you need in one place, neatly organized and
              easy to access.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Panellio isn’t just about organizing your life; it’s
              about moving forward with purpose. As you complete tasks
              or challenges, you can monitor your progress and get a
              clear view of how you’re doing in each area of your
              life. This isn’t about hustling harder; it’s about
              seeing your growth and making sure you’re on the path
              that feels right for you.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
