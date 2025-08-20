function Wide({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-7">
      {children}
    </div>
  );
}

export default Wide;
