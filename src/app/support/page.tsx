"use client";

import Image from "next/image";
import { PageShell, PageMain, PageHero, ContentPanel } from "@/components/page-shell";
import { Heart } from "lucide-react";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/StepTwo";

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
            keeping the site online. Scan a QR code below or use the link — send whatever you feel is fair.
          </p>

          <div className="mx-auto mt-8 grid max-w-lg gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Buy Me a Coffee</h2>
              <a
                href={BUY_ME_A_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-90"
              >
                <Image
                  src="/images/support/buymeacoffee-qr.png"
                  alt="Buy Me a Coffee QR code — scan to tip StepTwo"
                  width={240}
                  height={240}
                  className="mx-auto rounded-xl border border-border bg-white p-3 shadow-sm"
                  priority
                />
              </a>
              <a
                href={BUY_ME_A_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-primary hover:underline"
              >
                buymeacoffee.com/StepTwo
              </a>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Cash App</h2>
              <Image
                src="/images/support/cashapp-qr.png"
                alt="Cash App QR code — scan to send a tip"
                width={240}
                height={240}
                className="mx-auto rounded-xl border border-border bg-white p-3 shadow-sm"
              />
              <p className="mt-3 text-xs text-muted-foreground">Scan with the Cash App</p>
            </div>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/80">
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
