function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 mx-auto w-full max-w-screen-lg md:px-7">
      {children}
    </div>
  );
}

export default Container;
