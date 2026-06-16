import { getStorefrontConfig } from "@/lib/storefront";

export default async function ShippingPolicyPage() {
  const config = await getStorefrontConfig();
  const content = config.shippingPolicyContent;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <h1 className="mb-6 text-5xl text-deepbrown">{content.title}</h1>
      <p className="mb-12 max-w-3xl font-sans text-lg font-light leading-8 text-bodytext">
        {content.intro}
      </p>

      <div className="space-y-10">
        {content.sections.map((section) => (
          <section key={section.title} className="border-b border-taupe/20 pb-10 last:border-b-0">
            <h2 className="mb-3 text-3xl text-deepbrown">{section.title}</h2>
            <p className="max-w-3xl font-sans text-[15px] font-light leading-8 text-bodytext">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
