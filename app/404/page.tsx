import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex flex-col h-full">
        <main className="flex-1 text-center mt-20 max-w-3xl m-auto">
          <h1 className="text-7xl font-bold">404</h1>
          <p className="text-lg mt-4 max-w-[620px] m-auto w-full">
            The page you&apos;re looking for either doesn&apos;t
            exist, or you don&apos;t have permission to view it.
          </p>
          <Button
            variant="link"
            name="Log into Panellio"
            className="w-[300px] mx-auto mt-3"
          >
            <Link
              href="/"
              className="flex gap-2 items-center justify-center mt-5"
            >
              <MoveLeft className="h-4 w-4" />
              Go back to homepage
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    </>
  );
}
