import Image from "next/image";
import Link from "next/link";

/** Two-column onboarding shell (photo panel + content) shared by every onboarding screen, per the Figma reference frames. */
export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-white lg:h-[813px] lg:min-h-0 lg:flex-row">
      <div className="relative hidden w-[573px] shrink-0 overflow-hidden bg-black lg:block">
        <Image
          src="/onboarding-photo.png"
          alt=""
          width={572}
          height={813}
          priority
          className="h-auto w-full"
        />
        <Link href="/" className="absolute left-10 top-10">
          <Image
            src="/logo-onboarding-desktop.svg"
            alt="CareerTwin"
            width={186}
            height={45}
            style={{ width: "186px", height: "45px" }}
          />
        </Link>
      </div>
      <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10 sm:px-10">
        <div className="flex w-full max-w-[565px] flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}
