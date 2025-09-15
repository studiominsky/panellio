import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useDirectory } from '@/context/dir-context';
import Full from '@/containers/full';
import { usePathname } from 'next/navigation';

export default function DirectoryList() {
  const { user } = useAuth();
  const { directories, fetchDirectories } = useDirectory();
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    const loadDirectories = async () => {
      if (user && directories.length === 0) {
        setLoading(true);
        await fetchDirectories();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadDirectories();
  }, [user, directories.length, fetchDirectories]);

  const sortedDirectories = [...directories].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  return (
    <div className="z-10 bg-card sticky top-0 w-full border-border border-b">
      <Full>
        <div className="flex justify-between items-center">
          {loading ? (
            <p className="pb-3 text-sm text-foreground/70">
              Loading directories...
            </p>
          ) : sortedDirectories.length > 0 ? (
            <ul className="text-left flex flex-wrap gap-0 lg:gap-7 min-h-[20px]">
              {sortedDirectories.map((directory) => {
                const userPath = user?.username
                  ? `/${user.username}/${directory.slug}`
                  : `/i/${directory.slug}`;
                const isActive = pathname === userPath;

                return (
                  <li
                    key={directory.id}
                    className="text-sm py-2 mr-4 lg:mr-0 lg:py-4 relative"
                  >
                    <Link
                      href={userPath}
                      className={`font-medium block py-[1px] hover:text-foreground/100 ${
                        isActive
                          ? 'text-foreground/100'
                          : 'text-foreground/40'
                      }`}
                    >
                      {directory.name}
                      {isActive && (
                        <span className="block bg-[--ui-primary] w-full absolute bottom-0 h-[2px]"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <span className="pb-3 text-sm text-foreground/70">
              {''}
            </span>
          )}
        </div>
      </Full>
    </div>
  );
}
