import { getStorefrontConfig } from "@/lib/storefront";

export default async function TrackOrderPage() {
  const config = await getStorefrontConfig();
  const content = config.trackOrderContent;
  const phoneDisplay = config.whatsappNumber.startsWith("91")
    ? `+${config.whatsappNumber}`
    : config.whatsappNumber;
  const whatsappHref = `https://wa.me/${config.whatsappNumber}`;
  const telHref = `tel:+${config.whatsappNumber}`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <div className="rounded-sm border border-taupe/20 bg-white p-10 text-center shadow-sm">
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.25em] text-taupe">Order Support</p>
        <h1 className="mb-6 text-5xl text-deepbrown">{content.title}</h1>
        <p className="mx-auto mb-8 max-w-2xl font-sans text-lg font-light leading-8 text-bodytext">
          {content.intro}
        </p>
        <div className="mx-auto mb-10 max-w-2xl rounded-sm bg-cream/40 p-6 text-left">
          <ul className="space-y-3">
            {content.helpPoints.map((point) => (
              <li key={point} className="font-sans text-[15px] font-light leading-7 text-bodytext">
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a href={telHref} className="btn-dark">
            Call {phoneDisplay}
          </a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-outline">
            Message on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
