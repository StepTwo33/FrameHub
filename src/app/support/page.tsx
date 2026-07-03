"use client";

import Image from "next/image";
import { PageShell, PageMain, PageHero, ContentPanel } from "@/components/page-shell";
import { Heart } from "lucide-react";

export default function SupportPage() {
  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero
          icon={Heart}
          accent="rose"
          title="Support"
          highlight="Frame Hub"
          description="Frame Hub is free and open source. If you find it useful, you can chip in — any amount helps."
        />

        <ContentPanel className="p-6 sm:p-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            There is no paywall, subscription, or premium tier. Donations are entirely optional and go toward
            keeping the site online. Scan the QR code below with your phone to send whatever you feel is fair via PayPal.
          </p>

          <div className="mx-auto mt-8 max-w-xs">
            <Image
              src="/images/support/paypal-donate-qr.png"
              alt="PayPal donation QR code — scan to send a tip"
              width={320}
              height={320}
              className="mx-auto rounded-xl border border-border bg-white p-3 shadow-sm"
              priority
            />
          </div>

          <p className="mt-6 text-xs text-muted-foreground/80">
            Donations are voluntary gifts, not purchases. They do not unlock features or confer any special status on the site.
            See our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
            for more detail.
          </p>
        </ContentPanel>
      </PageMain>
    </PageShell>
  );
}
