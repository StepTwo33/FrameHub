"use client";

import { PageShell, PageMain, PageHero, ProsePanel } from "@/components/page-shell";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero icon={FileText} accent="primary" title="Terms of Service" description="Last updated: July 2, 2026" />
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
                You may optionally create an account via Google OAuth or email and password. You are responsible
                for maintaining the security of your account credentials. You agree not to share your account
                or use another person&apos;s account without permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. User Content</h2>
              <p>
                Builds, profile bios, and other content you publish are your responsibility. By saving builds to the cloud
                or making them public, you grant Frame Hub a non-exclusive license to store, display, and serve that content
                as part of the Service. You retain ownership of your content.
              </p>
              <p className="mt-2">
                Public builds and public profile pages may be visible to other users. Your email address is not shown on
                public profile pages; it is used only for account access and, when applicable, service-related email.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Post offensive, harassing, sexually explicit, or otherwise inappropriate content in public builds, bios, or descriptions</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
                <li>Scrape or harvest data from the Service in bulk for commercial purposes</li>
                <li>Impersonate other users or misrepresent your identity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Moderation and Enforcement</h2>
              <p>
                We may review public content and take action when we believe it violates these Terms or harms the community.
                Actions may include removing public visibility from builds, restricting account features, or banning accounts.
                Banned users may lose access to the Service and their public content may be hidden.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Donations</h2>
              <p>
                Frame Hub may offer an optional way to send voluntary donations (for example via PayPal). Donations are gifts,
                not payment for goods or services, and do not unlock features, status, or support entitlements on the site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Intellectual Property</h2>
              <p>
                Warframe, its logo, and all related game assets are the property of Digital Extremes Ltd.
                Frame Hub uses game data for informational and fan-community purposes under fair use.
                The Frame Hub application code and design are the property of their respective authors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                express or implied. We do not guarantee the accuracy of game data, stat calculations,
                or simulation results. Game data may become outdated after Warframe patches.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Limitation of Liability</h2>
              <p>
                In no event shall Frame Hub or its contributors be liable for any indirect, incidental,
                special, or consequential damages arising from the use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">11. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Service
                after changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">12. Termination</h2>
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
