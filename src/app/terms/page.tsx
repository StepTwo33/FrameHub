"use client";

import { PageShell, PageMain, PageHero, ProsePanel } from "@/components/page-shell";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero icon={FileText} accent="primary" title="Terms of Service" description="Last updated: February 15, 2026" />
        <ProsePanel>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Frame Hub (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
              <p>
                Frame Hub is a free, fan-made build planning tool for the video game Warframe by Digital Extremes Ltd.
                The Service provides build calculators, stat simulations, and community tools. Frame Hub is not
                affiliated with, endorsed by, or sponsored by Digital Extremes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
              <p>
                You may optionally create an account via third-party authentication (Google). You are responsible
                for maintaining the security of your account credentials. You agree not to share your account
                or use another person&apos;s account without permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. User Content</h2>
              <p>
                Builds and configurations you save are your own content. By saving builds to the cloud service,
                you grant Frame Hub a non-exclusive license to store and serve that data back to you.
                You retain all ownership of your builds.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
                <li>Scrape or harvest data from the Service in bulk for commercial purposes</li>
                <li>Impersonate other users or misrepresent your identity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Intellectual Property</h2>
              <p>
                Warframe, its logo, and all related game assets are the property of Digital Extremes Ltd.
                Frame Hub uses game data for informational and fan-community purposes under fair use.
                The Frame Hub application code and design are the property of their respective authors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                express or implied. We do not guarantee the accuracy of game data, stat calculations,
                or simulation results. Game data may become outdated after Warframe patches.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
              <p>
                In no event shall Frame Hub or its contributors be liable for any indirect, incidental,
                special, or consequential damages arising from the use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Service
                after changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Termination</h2>
              <p>
                We may terminate or suspend access to the Service at any time, without prior notice,
                for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>
          </div>
        </ProsePanel>
      </PageMain>
    </PageShell>
  );
}
