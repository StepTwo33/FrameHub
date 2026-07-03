"use client";

import { PageShell, PageMain, PageHero, ProsePanel } from "@/components/page-shell";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero
          icon={Shield}
          accent="primary"
          title="Privacy Policy"
          description="Last updated: July 2, 2026"
        />
        <ProsePanel>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">1. Information We Collect</h2>
              <p>Frame Hub collects minimal data necessary to operate the Service:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>Account Data:</strong> If you sign in via Google OAuth or email/password, we store your name, email address, and profile picture (when provided). Passwords are stored as one-way hashes, not plain text.</li>
                <li><strong>Build Data:</strong> Weapon, warframe, and companion builds you save to the cloud are stored in our database, linked to your account.</li>
                <li><strong>Public Profile Data:</strong> If you set a username, bio, or publish builds, that information may be visible to other users. Your email address is not displayed on public profile pages.</li>
                <li><strong>Local Storage:</strong> If you use Frame Hub without signing in, builds are stored in your browser&apos;s local storage. We do not have access to this data.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
              <ul className="list-inside list-disc space-y-1">
                <li>To authenticate your identity and provide account features</li>
                <li>To store and retrieve your saved builds</li>
                <li>To display your profile information (name, avatar, username, bio) within the app and on public profile pages where applicable</li>
                <li>To enforce community standards, including moderation actions such as hiding public content or banning accounts that violate our Terms</li>
              </ul>
              <p className="mt-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">3. Cookies and Local Storage</h2>
              <p>
                Frame Hub uses session cookies for authentication and browser local storage for saving builds offline.
                We do not use tracking cookies or third-party analytics services.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">4. Data Retention</h2>
              <p>
                Your account and build data are retained as long as your account is active.
                You can delete individual builds from your profile page at any time.
                If you wish to delete your entire account, please contact us via the Report Issue page.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">5. Data Security</h2>
              <p>
                We use industry-standard security measures including encrypted connections (HTTPS)
                and secure authentication via OAuth 2.0. However, no method of electronic transmission
                or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">6. Third-Party Services</h2>
              <p>
                Frame Hub uses Google OAuth and optional email/password authentication. Google sign-in is subject to
                Google&apos;s Privacy Policy and Terms of Service. We only receive the profile information
                you authorize Google to share with us. Optional donations through Buy Me a Coffee are handled by
                Buy Me a Coffee under their own terms and privacy policies; we do not receive your payment credentials.
                If your donation email matches your verified Frame Hub account, we may display a cosmetic Supporter
                badge on your profile.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">7. Children&apos;s Privacy</h2>
              <p>
                Frame Hub is not directed at children under the age of 13. We do not knowingly collect
                personal information from children under 13. If you believe a child has provided us
                with personal information, please contact us so we can delete it.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of significant
                changes by updating the &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">9. Contact</h2>
              <p>
                If you have questions about this Privacy Policy or your data, please use the{" "}
                <a href="/report-issue" className="text-primary hover:underline">Report Issue</a> page.
              </p>
            </section>
          </div>
        </ProsePanel>
      </PageMain>
    </PageShell>
  );
}
