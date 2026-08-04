"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TermsContent, PrivacyContent } from "@/components/legal-content";

/** Opens Termos de Uso in a Sheet instead of navigating to /termos. */
export function TermsSheetTrigger({ className, label = "Termos de Uso" }: { className?: string; label?: string }) {
  return (
    <Sheet>
      <SheetTrigger className={className}>{label}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">Termos de Uso</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <TermsContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Opens Política de Privacidade in a Sheet instead of navigating to /privacidade. */
export function PrivacySheetTrigger({
  className,
  label = "Política de Privacidade",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger className={className}>{label}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">Política de Privacidade</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <PrivacyContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
