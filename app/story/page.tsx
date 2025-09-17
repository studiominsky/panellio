import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { BookText } from 'lucide-react';
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
                Our Mission <BookText className="w-4 h-4 ml-2" />
              </Badge>
              <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
                Story Behind The Project
              </h1>
              <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
                Modern life is a constant competition for our
                attention. The resulting digital clutter and lack of
                focus makes meaningful progress feel overwhelming.
                This project was started to fix that.
              </p>
            </div>
          </Container>
        </div>
        <Container>
          <div className="py-5 mb-20 max-w-[720px] mx-auto">
            <p className="text-foreground/80 text-lg leading-relaxed mt-1">
              Endless scrolling, fragmented tasks, and a constant
              barrage of notifications lead to a common result: ending
              the day with a sense of lost time and little progress.
              This isn't a personal failure; it's the result of using
              tools that aren't designed for focused, intentional
              work.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Panellio was built out of necessity. It’s an attempt to
              move beyond simple to-do lists and create a robust
              framework for managing a digital life. The goal is to
              provide a system that helps you regain control over your
              time and attention, making your online experience more
              deliberate and less chaotic.
            </p>
            <h3 className="text-foreground font-semibold text-xl leading-relaxed mt-12">
              How It Works
            </h3>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Panellio is built on the idea that structure creates
              freedom. It provides a system based on three core
              principles: compartmentalization, modular tools, and
              progress monitoring.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              1. Directories: The foundation of the system is
              directories. These act as high-level containers that let
              you separate different areas of your life—work, personal
              projects, health, or hobbies. By isolating contexts, you
              can engage with one area at a time without being
              distracted by the others.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              2. Features: Within each directory, you add features.
              These are the functional building blocks of your system:
              task lists, habit trackers, notes, and more. You choose
              the tools you need for the context you're in, creating a
              customized dashboard for each area of your life.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              3. Monitoring: The system tracks your activity as you
              complete tasks and build habits. This provides a clear,
              data-driven view of your progress. It’s not about
              enforcing productivity, but about providing the feedback
              needed to understand what’s working and refine your
              approach over time.
            </p>
            <h3 className="text-foreground font-semibold text-xl leading-relaxed mt-12">
              The Role of AI
            </h3>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              A good system provides structure, but an intelligent one
              helps you adapt. Panellio integrates an AI assistant to
              act as a practical layer of analysis and support. It's
              not here to automate your life, but to help you make
              more informed decisions.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              The AI can assist by analyzing your progress data to
              find patterns, breaking down large goals into actionable
              steps for your task lists, and offering objective
              suggestions based on the objectives you've set. It’s a
              tool designed to augment your own efforts, helping you
              navigate your system more effectively while ensuring you
              always remain in control.
            </p>
            <h3 className="text-foreground font-semibold text-xl leading-relaxed mt-12">
              Behind the Project
            </h3>
            <p className="text-foreground/80 text-lg leading-relaxed mt-6">
              Panellio is an open-source and experimental project,
              initially created for personal use but now open to the
              public. It is developed by{' '}
              <a
                href="https://www.studiominsky.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--ui-primary] hover:underline"
              >
                Studio Minsky
              </a>
              , a one-person studio that creates web applications,
              websites, and other digital products. The source code is
              available on{' '}
              <a
                href="https://github.com/studiominsky/panellio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--ui-primary] hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
