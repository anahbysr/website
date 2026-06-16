import { getStorefrontConfig } from "@/lib/storefront";

function CategoryIcon({ icon }: { icon: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "droplet":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z" />
        </svg>
      );
    case "wind":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
          <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
          <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
        </svg>
      );
    case "hanger":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 8a2 2 0 1 1 2-2" />
          <path d="M12 8v2" />
          <path d="m3 18 9-6 9 6" />
          <path d="M3 18a1 1 0 0 0 .55.9l7.55 3.77a2 2 0 0 0 1.8 0l7.55-3.77A1 1 0 0 0 21 18" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </svg>
      );
  }
}

export default async function CareGuidePage() {
  const config = await getStorefrontConfig();
  const careContent = config.careGuideContent;

  return (
    <div className="bg-[#f9f6f0] min-h-screen">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-5xl text-deepbrown text-center mb-6">Care Guide</h1>
        <p className="font-sans font-light text-center text-bodytext text-[13.5px] md:text-[14px] leading-[1.8] mb-16 max-w-[640px] mx-auto">
          {careContent.intro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careContent.categories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-lg border-[0.5px] border-taupe p-6">
              <div className="text-taupe mb-4">
                <CategoryIcon icon={cat.icon} />
              </div>
              <h2 className="font-serif text-[20px] text-deepbrown mb-4">{cat.name}</h2>
              <ul className="list-disc pl-5 space-y-2">
                {cat.tips.map((tip) => (
                  <li key={tip} className="font-sans font-light text-[13.5px] md:text-[14px] leading-[1.8] text-bodytext">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg border-[0.5px] border-taupe p-6 md:p-8 text-center">
          <h3 className="font-serif text-[20px] text-deepbrown mb-4">{careContent.storageTitle}</h3>
          <p className="font-sans font-light text-[13.5px] md:text-[14px] leading-[1.8] text-bodytext max-w-[640px] mx-auto">
            {careContent.storageBody}
          </p>
        </div>
      </div>
    </div>
  );
}
