import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { Header } from '@/components/header';
import { buildShareUrl, ShareableBuild } from '@/lib/build-url';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Simple interface for the expected API response
interface SharedBuild {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    type: string;
    data: unknown;
    createdAt: number;
    updatedAt: number;
    author: {
        username: string;
        image?: string;
    };
}

async function getBuild(id: string): Promise<SharedBuild | null> {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
    let protocol = headerList.get('x-forwarded-proto');
    if (!protocol) {
        protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
    }
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
    const url = `${protocol}://${host}/api/builds/${id}`;
    const res = await fetch(url, {
        cache: 'no-store',
        headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const build = await getBuild(id);

    if (!build) return { title: 'Build Not Found - Overframe' };

    return {
        title: `${build.name} by ${build.author.username} - Overframe`,
        description: build.description || `A ${build.type} build by ${build.author.username}`,
    };
}

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const build = await getBuild(id);

    if (!build) {
        notFound();
    }

    // Construct the old-style URL param so the builder can load the mods/arcanes layout
    let shareable: ShareableBuild | null = null;

    if (build.type === 'weapon') {
        const d = build.data as {
            weaponId: string;
            mods: { modId: string; rank: number }[];
            arcaneIds?: (string | null)[];
        };
        shareable = {
            type: 'weapon',
            itemId: d.weaponId,
            mods: d.mods.map((m) => ({ id: m.modId, rank: m.rank })),
            arcanes: (d.arcaneIds ?? []).filter((id): id is string => Boolean(id)),
        };
    } else if (build.type === 'warframe') {
        const d = build.data as {
            warframeId: string;
            mods: { modId: string; rank: number }[];
            shards?: { shardId: string; selectedBonus: string }[] | null;
        };
        shareable = {
            type: 'warframe',
            itemId: d.warframeId,
            mods: d.mods.map((m) => ({ id: m.modId, rank: m.rank })),
            shards: d.shards?.filter(Boolean).map((s) => ({ id: s.shardId, bonus: s.selectedBonus })) || [],
        };
    } else if (build.type === 'companion') {
        const d = build.data as {
            companionId: string;
            mods: { modId: string; rank: number }[];
        };
        shareable = {
            type: 'companion',
            itemId: d.companionId,
            mods: d.mods.map((m) => ({ id: m.modId, rank: m.rank })),
        };
    } else if (build.type === 'modular') {
        const d = build.data as {
            mods?: { modId: string; rank: number; slotIndex?: number }[];
            modularType?: string;
            parts?: Record<string, string>;
            hasOrokinCatalyst?: boolean;
            isMR30?: boolean;
            slotPolarities?: Record<string, string>;
            arcaneIds?: (string | null)[];
        };
        const pol: Record<string, string> = {};
        if (d.slotPolarities && typeof d.slotPolarities === 'object') {
            for (const [k, v] of Object.entries(d.slotPolarities)) {
                if (typeof v === 'string') pol[String(k)] = v;
            }
        }
        shareable = {
            type: 'modular',
            itemId: '',
            mods: (d.mods ?? []).map((m) => ({
                id: m.modId,
                rank: m.rank,
                slotIndex: m.slotIndex,
            })),
            modularType: d.modularType,
            parts: d.parts || {},
            hasOrokinCatalyst: Boolean(d.hasOrokinCatalyst),
            isMR30: Boolean(d.isMR30),
            slotPolarities: Object.keys(pol).length ? pol : undefined,
            arcanes: (d.arcaneIds ?? []).map((id) => id || ""),
        };
    }

    const builderUrl = shareable ? buildShareUrl(shareable) : '#';

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {build.type} Build
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(build.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-foreground">{build.name}</h1>
                            <div className="flex items-center gap-2">
                                {build.author.image ? (
                                    <Image src={build.author.image} alt={build.author.username} width={20} height={20} className="w-5 h-5 rounded-full" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-[10px] text-primary">{build.author.username[0].toUpperCase()}</span>
                                    </div>
                                )}
                                <span className="text-sm font-medium text-muted-foreground">by {build.author.username}</span>
                            </div>
                        </div>

                        {shareable && (
                            <Button asChild className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                <Link href={builderUrl}>
                                    Open in Builder
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="w-full h-px bg-border mb-8" />

                    <div>
                        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">DESCRIPTION</h2>
                        {build.description ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                                {build.description}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No description provided by the author.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
