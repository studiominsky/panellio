import Header from '@/components/header';
import Banner from '@/components/home/banner';
import Cards from '@/components/home/cards';
import Features from '@/components/home/features';
import Intro from '@/components/home/intro';
import Pricing from '@/components/home/pricing';
import Blog from '@/components/home/blog';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Banner />
        <Intro />
        <Cards />
        <Features />
        <Pricing />
        <Blog />
      </main>
      <Footer />
    </>
  );
}
