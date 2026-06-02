import { AppScreenBackground } from "../AppScreenBackground";

type RoleAppFrameProps = {
  children: React.ReactNode;
  /** Extra space above copyright (e.g. floating tab bar). */
  copyrightBottomOffset?: number;
  showCopyright?: boolean;
};

/**
 * Role route wrapper — same login gradient backdrop as auth screens.
 */
export function RoleAppFrame({
  children,
  copyrightBottomOffset = 8,
  showCopyright = true,
}: RoleAppFrameProps) {
  return (
    <AppScreenBackground
      showCopyright={showCopyright}
      copyrightBottomOffset={copyrightBottomOffset}
    >
      {children}
    </AppScreenBackground>
  );
}
