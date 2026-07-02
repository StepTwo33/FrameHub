import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { Header } from '@/components/header';
import { buildOpenUrl } from '@/lib/build-url';
import { BuildPageVote } from '@/components/build-page-vote';
import Image from 'next/image';

// Simple interface for the expected API response
interface SharedBuild {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    type: string;
    upvoteCount: number;
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

    const builderUrl = buildOpenUrl(build.type, build.id);

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

                        <BuildPageVote
                            buildId={build.id}
                            initialUpvoteCount={build.upvoteCount ?? 0}
                            isPublic={build.isPublic}
                            builderUrl={builderUrl !== "#" ? builderUrl : undefined}
                        />
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
