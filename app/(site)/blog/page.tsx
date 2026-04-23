import type { Metadata } from 'next';
import { getAllCategories, getAllPosts } from '@/lib/blog';
import BlogIndex from '@/components/blog/BlogIndex';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medschooldebtcalculator.com';

export const metadata: Metadata = {
  title:
    'Doctor Finance Blog — Medical School Debt & Loan Repayment Guides',
  description:
    'Research-backed guides on medical school debt, PSLF, doctor salaries, and the best loan repayment strategies for physicians and medical students.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Doctor Finance Blog | MedDebt Calculator',
    description:
      'Guides on med school debt, PSLF, and repayment strategies for doctors.',
    type: 'website',
    url: `${SITE_URL}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doctor Finance Blog | MedDebt Calculator',
    description:
      'Guides on med school debt, PSLF, and repayment strategies for doctors.',
  },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div style={{ background: 'var(--color-off-white)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <section className="py-14 md:py-20 bg-white border-b border-[color:var(--border-subtle)]">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Guides</p>
            <h1
              className="display-section text-[color:var(--color-near-black)]"
              style={{ fontWeight: 900 }}
            >
              Med school debt, repayment, and PSLF — explained.
            </h1>
            <p className="mt-5 text-lg text-[color:var(--text-secondary)] max-w-xl leading-relaxed font-medium">
              Research-backed guides written for medical students and doctors. Every
              article links back to the free calculator so you can run your own numbers.
            </p>
          </div>
        </div>
      </section>

      <BlogIndex posts={posts} categories={categories} />
    </div>
  );
}
