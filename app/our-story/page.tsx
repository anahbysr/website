import Image from "next/image";
import Link from "next/link";
import { getStorefrontConfig } from "@/lib/storefront";

export default async function OurStoryPage() {
  const config = await getStorefrontConfig();
  const story = config.ourStoryContent;
  const parentBrandHref = config.parentBrandUrl;
  const isExternalParentBrand = parentBrandHref.startsWith("http");
  const heroImages =
    story.heroImages && story.heroImages.length >= 3
      ? story.heroImages.slice(0, 3)
      : [
          story.heroImage,
          "/uploads/checks-orange.jpg",
          "/uploads/ombre-magenta-pink.jpg",
        ];

  return (
    <div>
      <div className="px-3 pt-4 md:px-6 md:pt-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-[26px] border border-taupe/20 bg-deepbrown shadow-[0_18px_60px_rgba(46,26,10,0.12)]">
        <div className="grid h-[420px] grid-cols-1 gap-[2px] bg-deepbrown md:h-[560px] md:grid-cols-3">
          {heroImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="story-hero-frame group relative min-h-[220px] overflow-hidden"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <Image
                src={src}
                alt="Anah Lifestyle"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-center opacity-80 transition-transform duration-[1400ms] group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-deepbrown/20" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="story-hero-quote max-w-5xl text-center font-serif text-5xl italic text-cream md:text-7xl">
            &quot;{story.heroTitle}&quot;
          </h1>
        </div>
      </div>
      </div>

      <div className="container mx-auto max-w-3xl space-y-24 px-6 py-24 md:px-8">
        {story.sections.map((section, index) => (
          <section
            key={section.title}
            className="story-copy-block text-left"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <h2 className="text-3xl font-serif text-deepbrown mb-6">{section.title}</h2>
            <p className="font-sans font-light text-[14px] md:text-[15px] leading-[1.85] text-bodytext max-w-[640px]">
              {section.body}
            </p>
          </section>
        ))}

        <section className="story-copy-block text-left" style={{ animationDelay: "360ms" }}>
          <h2 className="text-3xl font-serif text-deepbrown mb-6">{story.sustainability.title}</h2>
          <p className="font-sans font-light text-[14px] md:text-[15px] leading-[1.85] text-bodytext max-w-[640px] mb-6">
            {story.sustainability.body}
          </p>
          <div className="flex justify-start gap-8 pt-2 text-taupe">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Natural fabrics">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Artisan craft">
              <rect x="6" y="2" width="12" height="3" rx="1" />
              <rect x="6" y="19" width="12" height="3" rx="1" />
              <path d="M8 5v14M16 5v14" />
              <path d="M8 9h8M8 12h8M8 15h8" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Plastic-free packaging">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="m14 16-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
            </svg>
          </div>
        </section>

        <section className="story-copy-block text-left" style={{ animationDelay: "480ms" }}>
          <p className="text-lg text-bodytext italic mb-6">{config.parentBrandText}</p>
          {isExternalParentBrand ? (
            <a
              href={parentBrandHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark inline-block mt-4"
            >
              {config.parentBrandLabel}
            </a>
          ) : (
            <Link href={parentBrandHref} className="btn-dark inline-block mt-4">
              {config.parentBrandLabel}
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
