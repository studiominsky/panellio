function Ui({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 mx-auto w-full px-5 sm:px-7 xl:max-w-[1320px] 2xl:max-w-[1440px] 3xl:max-w-[1860px]">
      {children}
    </div>
  );
}

export default Ui;
