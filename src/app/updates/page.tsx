import Link from "next/link";
import { PageShell, PageMain, PageHero, ContentPanel } from "@/components/page-shell";
import { fetchPublishedSiteUpdates } from "@/lib/site/site-updates-server";
import { formatSiteUpdateTime } from "@/lib/site/site-updates";

export const metadata = {
  title: "What's New - Frame Hub",
  description: "Updates and announcements from the Frame Hub team.",
};

export default async function UpdatesPage() {
  const updates = await fetchPublishedSiteUpdates(50);

  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero
          title="What's"
          highlight="New"
          description="Updates and announcements from the Frame Hub team."
          iconName="megaphone"
          accent="amber"
        />

        {updates.length === 0 ? (
          <ContentPanel className="text-center py-12">
            <p className="text-sm text-muted-foreground">No updates posted yet. Check back soon.</p>
          </ContentPanel>
        ) : (
          <ul className="space-y-4">
            {updates.map((update) => (
              <li key={update.id}>
                <Link href={`/updates/${update.id}`} className="group block">
                  <ContentPanel className="transition-colors hover:border-primary/40 hover:bg-card/80">
                    <time className="text-xs text-muted-foreground">
                      {formatSiteUpdateTime(update.createdAt)}
                    </time>
                    <h2 className="mt-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {update.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {update.body}
                    </p>
                    <span className="mt-3 inline-block text-xs font-medium text-primary">
                      Read full update
                    </span>
                  </ContentPanel>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageMain>
    </PageShell>
  );
}
