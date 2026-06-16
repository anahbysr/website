import { getStorefrontConfig } from "@/lib/storefront";

export default async function SizeGuidePage() {
  const config = await getStorefrontConfig();
  const sizeGuide = config.sizeGuideContent;

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-5xl font-serif text-deepbrown text-center mb-6">Size Guide</h1>
      <p className="text-center text-bodytext text-lg mb-16 max-w-2xl mx-auto">
        {sizeGuide.intro}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-taupe/20 mb-12">
          <thead>
            <tr className="bg-cream/50">
              <th className="p-4 border border-taupe/20 font-serif text-deepbrown">Size (Years)</th>
              <th className="p-4 border border-taupe/20 font-serif text-deepbrown">Chest (in)</th>
              <th className="p-4 border border-taupe/20 font-serif text-deepbrown">Waist (in)</th>
              <th className="p-4 border border-taupe/20 font-serif text-deepbrown">Length (in)</th>
            </tr>
          </thead>
          <tbody className="text-bodytext">
            {sizeGuide.rows.map((row, index) => (
              <tr key={row.size} className={index % 2 === 1 ? "bg-cream/20" : undefined}>
                <td className="p-4 border border-taupe/20 font-bold">{row.size}</td>
                <td className="p-4 border border-taupe/20">{row.chest}</td>
                <td className="p-4 border border-taupe/20">{row.waist}</td>
                <td className="p-4 border border-taupe/20">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-cream/50 p-8 border border-taupe/20 text-center">
        <h3 className="font-serif text-2xl text-deepbrown mb-4">How to Measure</h3>
        <p className="text-bodytext mb-4 text-left max-w-2xl mx-auto">
          {sizeGuide.howToMeasure.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <p className="text-sm italic text-bodytext/80">{sizeGuide.tip}</p>
      </div>

      {"customization" in sizeGuide ? (
        <div className="mt-10 border border-taupe/20 bg-white p-8 text-center">
          <h3 className="mb-4 text-2xl text-deepbrown">{sizeGuide.customization.title}</h3>
          <p className="mx-auto max-w-2xl text-bodytext">{sizeGuide.customization.body}</p>
          <p className="mt-4 text-sm italic text-bodytext/80">{sizeGuide.customization.note}</p>
        </div>
      ) : null}
    </div>
  );
}
