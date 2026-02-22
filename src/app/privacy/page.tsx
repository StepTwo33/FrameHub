"use client";

import { Header } from "@/components/header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mb-8">Last updated: February 15, 2026</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
              <p>Frame Hub collects minimal data necessary to operate the Service:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Account Data:</strong> If you sign in via Google OAuth, we receive your name, email address, and profile picture from Google. We do not receive or store your Google password.</li>
                <li><strong>Build Data:</strong> Weapon, warframe, and companion builds you save to the cloud are stored in our database, linked to your account.</li>
                <li><strong>Local Storage:</strong> If you use Frame Hub without signing in, builds are stored in your browser&apos;s local storage. We do not have access to this data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>To authenticate your identity and provide account features</li>
                <li>To store and retrieve your saved builds</li>
                <li>To display your profile information (name, avatar) within the app</li>
              </ul>
              <p className="mt-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Cookies and Local Storage</h2>
              <p>
                Frame Hub uses session cookies for authentication and browser local storage for saving builds offline.
                We do not use tracking cookies or third-party analytics services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Retention</h2>
              <p>
                Your account and build data are retained as long as your account is active.
                You can delete individual builds from your profile page at any time.
                If you wish to delete your entire account, please contact us via the Report Issue page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Security</h2>
              <p>
                We use industry-standard security measures including encrypted connections (HTTPS)
                and secure authentication via OAuth 2.0. However, no method of electronic transmission
                or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Third-Party Services</h2>
              <p>
                Frame Hub uses Google OAuth for authentication. Your use of Google sign-in is subject to
                Google&apos;s own Privacy Policy and Terms of Service. We only receive the profile information
                you authorize Google to share with us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Children&apos;s Privacy</h2>
              <p>
                Frame Hub is not directed at children under the age of 13. We do not knowingly collect
                personal information from children under 13. If you believe a child has provided us
                with personal information, please contact us so we can delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of significant
                changes by updating the &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact</h2>
              <p>
                If you have questions about this Privacy Policy or your data, please use the{" "}
                <a href="/report-issue" className="text-primary hover:underline">Report Issue</a> page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
