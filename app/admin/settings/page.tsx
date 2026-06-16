"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import {
  defaultCareGuideContent,
  defaultHomeContent,
  type HomeContent,
  defaultOurStoryContent,
  type OurStoryContent,
  defaultReturnsExchangeContent,
  defaultShippingPolicyContent,
  defaultSizeGuideContent,
  defaultTrackOrderContent,
} from "@/lib/site-defaults";

type SettingsMap = Record<string, string>;

const DEFAULT_SETTINGS: SettingsMap = {
  announcement_bar: "",
  featured_product_ids: "[]",
  whatsapp_number: "",
  hero_image: "/uploads/ombre-yellow-rust.jpg",
  site_logo_image: "/uploads/anah-logo.png",
  instagram_handle: "anahbysr",
  instagram_post_urls: "[]",
  parent_brand_text:
    "Discover our parent brand, Sindhura Reddy Official - our ethnic wear label for women.",
  parent_brand_label: "Visit on Instagram",
  parent_brand_url:
    "https://www.instagram.com/sindhurareddyofficial?igsh=MmJjbHpoenJsZ3Nt",
  home_content: JSON.stringify(defaultHomeContent, null, 2),
  our_story_content: JSON.stringify(defaultOurStoryContent, null, 2),
  size_guide_content: JSON.stringify(defaultSizeGuideContent, null, 2),
  care_guide_content: JSON.stringify(defaultCareGuideContent, null, 2),
  shipping_policy_content: JSON.stringify(defaultShippingPolicyContent, null, 2),
  returns_exchange_content: JSON.stringify(defaultReturnsExchangeContent, null, 2),
  track_order_content: JSON.stringify(defaultTrackOrderContent, null, 2),
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-sm border border-taupe/20 bg-white p-6">
      <div>
        <h3 className="text-2xl">{title}</h3>
        <p className="mt-1 font-sans text-sm text-bodytext">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SaveButton({
  onClick,
  label = "Save",
}: {
  onClick: () => void | Promise<void>;
  label?: string;
}) {
  return (
    <button onClick={() => void onClick()} className="btn-dark">
      {label}
    </button>
  );
}

function JsonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-72 w-full rounded-sm border border-taupe/30 px-3 py-2 font-mono text-sm"
    />
  );
}

function AdvancedJsonCard({
  title,
  description,
  value,
  onChange,
  onSave,
  saveLabel,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (nextValue: string) => void;
  onSave: () => void | Promise<void>;
  saveLabel: string;
}) {
  return (
    <details className="rounded-sm border border-taupe/20 bg-white p-6">
      <summary className="cursor-pointer text-2xl">{title}</summary>
      <p className="mt-2 font-sans text-sm text-bodytext">{description}</p>
      <div className="mt-4 space-y-4">
        <JsonEditor value={value} onChange={onChange} />
        <SaveButton onClick={onSave} label={saveLabel} />
      </div>
    </details>
  );
}

function parseHomeContent(value: string) {
  try {
    const parsed = JSON.parse(value) as HomeContent;
    if (parsed.reviewsSummary?.stars?.includes("?") || parsed.reviewsSummary?.stars?.includes("Ã")) {
      parsed.reviewsSummary.stars = defaultHomeContent.reviewsSummary.stars;
    }
    return parsed;
  } catch {
    return defaultHomeContent;
  }
}

function parseOurStoryContent(value: string) {
  try {
    const parsed = JSON.parse(value) as OurStoryContent;
    const heroImages =
      Array.isArray(parsed.heroImages) && parsed.heroImages.length
        ? parsed.heroImages
        : defaultOurStoryContent.heroImages;

    return {
      ...defaultOurStoryContent,
      ...parsed,
      heroImages,
    } satisfies OurStoryContent;
  } catch {
    return defaultOurStoryContent;
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const [settingsRes, productsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/products"),
      ]);

      const loadedSettings = (await settingsRes.json()) as SettingsMap;
      const loadedProducts = (await productsRes.json()) as Array<{
        id: string;
        name: string;
        status: string;
      }>;

      setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
      setProducts(loadedProducts.filter((product) => product.status === "LIVE"));
    })();
  }, []);

  async function save(updates: Partial<SettingsMap>, successMessage: string) {
    const keys = Object.keys(updates);
    setSavingKey(keys.join(","));
    setMessage("");

    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    setSettings((current) => ({ ...current, ...updates }) as SettingsMap);
    setSavingKey("");
    setMessage(successMessage);
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Upload failed");
    }

    return payload.url as string;
  }

  async function handleImageSelect(key: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingKey(key);
    setMessage("");

    try {
      const url = await uploadImage(file);
      setSettings((current) => ({ ...current, [key]: url }) as SettingsMap);
      setMessage("Image uploaded. Click Save to publish it on the storefront.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSavingKey("");
      event.target.value = "";
    }
  }

  const featuredIds = JSON.parse(settings.featured_product_ids || "[]") as string[];
  const homeContent = parseHomeContent(settings.home_content);
  const ourStoryContent = parseOurStoryContent(settings.our_story_content);

  function updateHomeContent(updater: (current: HomeContent) => HomeContent) {
    const next = updater(homeContent);
    setSettings({ ...settings, home_content: JSON.stringify(next, null, 2) });
  }

  async function handleHomeContentImageSelect(
    event: ChangeEvent<HTMLInputElement>,
    updater: (url: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingKey("home_content");
    setMessage("");

    try {
      const url = await uploadImage(file);
      updater(url);
      setMessage("Image uploaded. Click Save to publish it on the storefront.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSavingKey("");
      event.target.value = "";
    }
  }

  async function handleOurStoryContentImageSelect(
    event: ChangeEvent<HTMLInputElement>,
    updater: (url: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingKey("our_story_content");
    setMessage("");

    try {
      const url = await uploadImage(file);
      updater(url);
      setMessage("Image uploaded. Click Save to publish it on the storefront.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSavingKey("");
      event.target.value = "";
    }
  }

  function updateOurStoryContent(updater: (current: OurStoryContent) => OurStoryContent) {
    const next = updater(ourStoryContent);
    setSettings({ ...settings, our_story_content: JSON.stringify(next, null, 2) });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl">Settings</h2>
        <p className="font-sans text-bodytext">
          Manage storefront text, page content, featured products, and image-driven brand assets.
        </p>
      </div>

      {message ? (
        <div className="rounded-sm border border-sage/40 bg-sage/10 px-4 py-3 font-sans text-sm text-deepbrown">
          {message}
        </div>
      ) : null}

      <SectionCard
        title="Announcement Bar"
        description="This controls the slim scrolling announcement strip shown across the storefront header."
      >
        <input
          value={settings.announcement_bar}
          onChange={(event) =>
            setSettings({ ...settings, announcement_bar: event.target.value })
          }
          className="w-full rounded-sm border border-taupe/30 px-3 py-2"
        />
        <SaveButton
          onClick={() =>
            save(
              { announcement_bar: settings.announcement_bar },
              "Announcement bar updated.",
            )
          }
          label={savingKey === "announcement_bar" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <SectionCard
        title="Brand Assets"
        description="Replace the homepage hero image and the header logo here. Upload sets the image URL for you, then Save publishes it."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            {
              key: "hero_image",
              title: "Homepage Hero Image",
              help: "Used in the main hero section on the homepage.",
            },
            {
              key: "site_logo_image",
              title: "Site Logo Image",
              help: "Used in the header navigation across the storefront.",
            },
          ].map((item) => (
            <div key={item.key} className="space-y-3 rounded-sm border border-taupe/20 p-4">
              <div>
                <h4 className="text-xl">{item.title}</h4>
                <p className="font-sans text-sm text-bodytext">{item.help}</p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-cream/50">
                <Image
                  src={settings[item.key]}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <input
                value={settings[item.key]}
                onChange={(event) =>
                  setSettings({ ...settings, [item.key]: event.target.value })
                }
                className="w-full rounded-sm border border-taupe/30 px-3 py-2 font-mono text-sm"
              />
              <div className="flex flex-wrap gap-3">
                <label className="btn-outline cursor-pointer">
                  Upload New Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => void handleImageSelect(item.key, event)}
                  />
                </label>
                <SaveButton
                  onClick={() =>
                    save({ [item.key]: settings[item.key] }, `${item.title} updated.`)
                  }
                  label={savingKey === item.key ? "Working..." : "Save"}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Featured Products"
        description="These products power the homepage featured section."
      >
        <div className="flex flex-wrap gap-2">
          {products.map((product) => {
            const active = featuredIds.includes(product.id);
            return (
              <button
                key={product.id}
                onClick={() => {
                  const next = active
                    ? featuredIds.filter((id) => id !== product.id)
                    : [...featuredIds, product.id];
                  setSettings({
                    ...settings,
                    featured_product_ids: JSON.stringify(next),
                  });
                }}
                className={`rounded-full px-3 py-2 text-sm font-sans ${
                  active ? "bg-deepbrown text-cream" : "bg-cream"
                }`}
              >
                {product.name}
              </button>
            );
          })}
        </div>
        <SaveButton
          onClick={() =>
            save(
              { featured_product_ids: settings.featured_product_ids },
              "Featured products updated.",
            )
          }
          label={savingKey === "featured_product_ids" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <SectionCard
        title="WhatsApp and Instagram"
        description="These values drive the floating WhatsApp button, footer links, and Instagram feed section."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">WhatsApp Number</label>
            <input
              value={settings.whatsapp_number}
              onChange={(event) =>
                setSettings({ ...settings, whatsapp_number: event.target.value })
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Instagram Handle</label>
            <input
              value={settings.instagram_handle}
              onChange={(event) =>
                setSettings({ ...settings, instagram_handle: event.target.value })
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-sans text-sm text-bodytext">
            Instagram Post URLs JSON array
          </label>
          <textarea
            value={settings.instagram_post_urls}
            onChange={(event) =>
              setSettings({ ...settings, instagram_post_urls: event.target.value })
            }
            className="min-h-28 w-full rounded-sm border border-taupe/30 px-3 py-2 font-mono text-sm"
          />
        </div>
        <SaveButton
          onClick={() =>
            save(
              {
                whatsapp_number: settings.whatsapp_number,
                instagram_handle: settings.instagram_handle,
                instagram_post_urls: settings.instagram_post_urls,
              },
              "Contact and Instagram settings updated.",
            )
          }
          label={
            savingKey === "whatsapp_number,instagram_handle,instagram_post_urls"
              ? "Saving..."
              : "Save"
          }
        />
      </SectionCard>

      <SectionCard
        title="Parent Brand"
        description="Shown on the Our Story page as the Sindhura Reddy Official callout."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Parent Brand Text</label>
            <textarea
              value={settings.parent_brand_text}
              onChange={(event) =>
                setSettings({ ...settings, parent_brand_text: event.target.value })
              }
              className="min-h-28 w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-sans text-sm text-bodytext">Button Label</label>
              <input
                value={settings.parent_brand_label}
                onChange={(event) =>
                  setSettings({ ...settings, parent_brand_label: event.target.value })
                }
                className="w-full rounded-sm border border-taupe/30 px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="font-sans text-sm text-bodytext">Destination URL</label>
              <input
                value={settings.parent_brand_url}
                onChange={(event) =>
                  setSettings({ ...settings, parent_brand_url: event.target.value })
                }
                className="w-full rounded-sm border border-taupe/30 px-3 py-2"
              />
            </div>
          </div>
        </div>
        <SaveButton
          onClick={() =>
            save(
              {
                parent_brand_text: settings.parent_brand_text,
                parent_brand_label: settings.parent_brand_label,
                parent_brand_url: settings.parent_brand_url,
              },
              "Parent brand block updated.",
            )
          }
          label={
            savingKey === "parent_brand_text,parent_brand_label,parent_brand_url"
              ? "Saving..."
              : "Save"
          }
        />
      </SectionCard>

      <SectionCard
        title="Shop by Age Content"
        description="Edit the homepage Shop by Age heading and the three age-card labels, links, and images without touching raw JSON."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Section Title</label>
            <input
              value={homeContent.sectionTitles.shopByAge}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  sectionTitles: { ...current.sectionTitles, shopByAge: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="grid gap-4">
            {homeContent.ageCards.map((card, index) => (
              <div key={card.id} className="rounded-sm border border-taupe/20 p-4">
                <h4 className="mb-4 text-xl">Age Card {index + 1}</h4>
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream/60">
                      <Image
                        src={card.imageUrl}
                        alt={card.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="btn-outline inline-flex cursor-pointer items-center justify-center">
                      Upload New Image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(event) =>
                          void handleHomeContentImageSelect(event, (url) =>
                            updateHomeContent((current) => ({
                              ...current,
                              ageCards: current.ageCards.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, imageUrl: url } : entry,
                              ),
                            })),
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-sans text-sm text-bodytext">Label</label>
                      <input
                        value={card.label}
                        onChange={(event) =>
                          updateHomeContent((current) => ({
                            ...current,
                            ageCards: current.ageCards.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, label: event.target.value } : entry,
                            ),
                          }))
                        }
                        className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-sans text-sm text-bodytext">Link</label>
                      <input
                        value={card.href}
                        onChange={(event) =>
                          updateHomeContent((current) => ({
                            ...current,
                            ageCards: current.ageCards.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, href: event.target.value } : entry,
                            ),
                          }))
                        }
                        className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-sans text-sm text-bodytext">Image URL</label>
                      <input
                        value={card.imageUrl}
                        onChange={(event) =>
                          updateHomeContent((current) => ({
                            ...current,
                            ageCards: current.ageCards.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, imageUrl: event.target.value } : entry,
                            ),
                          }))
                        }
                        className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SaveButton
          onClick={() => save({ home_content: settings.home_content }, "Shop by Age content updated.")}
          label={savingKey === "home_content" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <SectionCard
        title="Homepage Hero Content"
        description="Use these simple fields for the main homepage hero copy and CTA labels."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Eyebrow</label>
            <input
              value={homeContent.hero.eyebrow}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, eyebrow: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Badge</label>
            <input
              value={homeContent.hero.badge}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, badge: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-sans text-sm text-bodytext">Title</label>
            <input
              value={homeContent.hero.title}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, title: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Accent Word</label>
            <input
              value={homeContent.hero.accentWord}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, accentWord: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Primary CTA Label</label>
            <input
              value={homeContent.hero.primaryCtaLabel}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, primaryCtaLabel: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Primary CTA Link</label>
            <input
              value={homeContent.hero.primaryCtaHref}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, primaryCtaHref: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Secondary CTA Label</label>
            <input
              value={homeContent.hero.secondaryCtaLabel}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, secondaryCtaLabel: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Secondary CTA Link</label>
            <input
              value={homeContent.hero.secondaryCtaHref}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, secondaryCtaHref: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-sans text-sm text-bodytext">Short Description</label>
            <textarea
              value={homeContent.hero.description}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, description: event.target.value },
                }))
              }
              className="min-h-24 w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-sans text-sm text-bodytext">Secondary Description</label>
            <textarea
              value={homeContent.hero.secondaryDescription}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  hero: { ...current.hero, secondaryDescription: event.target.value },
                }))
              }
              className="min-h-28 w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
        </div>
        <SaveButton
          onClick={() => save({ home_content: settings.home_content }, "Homepage hero updated.")}
          label={savingKey === "home_content" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <SectionCard
        title="Our Story Hero"
        description="Edit the Our Story quote and all three collage images here. Upload sets the image URL for you, then Save publishes it."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Hero Quote</label>
            <input
              value={ourStoryContent.heroTitle}
              onChange={(event) =>
                updateOurStoryContent((current) => ({
                  ...current,
                  heroTitle: event.target.value,
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {ourStoryContent.heroImages?.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="rounded-sm border border-taupe/20 p-4">
                <h4 className="mb-4 text-xl">Story Image {index + 1}</h4>
                <div className="space-y-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream/60">
                    <Image
                      src={imageUrl}
                      alt={`Our Story Hero ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <label className="btn-outline inline-flex cursor-pointer items-center justify-center">
                    Upload New Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(event) =>
                        void handleOurStoryContentImageSelect(event, (url) =>
                          updateOurStoryContent((current) => ({
                            ...current,
                            heroImage: index === 0 ? url : current.heroImage,
                            heroImages:
                              current.heroImages?.map((entry, entryIndex) =>
                                entryIndex === index ? url : entry,
                              ) ?? current.heroImages,
                          })),
                        )
                      }
                    />
                  </label>
                  <div className="space-y-2">
                    <label className="font-sans text-sm text-bodytext">Image URL</label>
                    <input
                      value={imageUrl}
                      onChange={(event) =>
                        updateOurStoryContent((current) => ({
                          ...current,
                          heroImage: index === 0 ? event.target.value : current.heroImage,
                          heroImages:
                            current.heroImages?.map((entry, entryIndex) =>
                              entryIndex === index ? event.target.value : entry,
                            ) ?? current.heroImages,
                        }))
                      }
                      className="w-full rounded-sm border border-taupe/30 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SaveButton
          onClick={() =>
            save({ our_story_content: settings.our_story_content }, "Our Story hero updated.")
          }
          label={savingKey === "our_story_content" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <SectionCard
        title="Reviews Summary Content"
        description="Edit the homepage ratings summary without touching code or JSON."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Score</label>
            <input
              value={homeContent.reviewsSummary.score}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  reviewsSummary: { ...current.reviewsSummary, score: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">Stars</label>
            <input
              value={homeContent.reviewsSummary.stars}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  reviewsSummary: { ...current.reviewsSummary, stars: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-sans text-sm text-bodytext">Summary Text</label>
            <input
              value={homeContent.reviewsSummary.summaryText}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  reviewsSummary: { ...current.reviewsSummary, summaryText: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">CTA Label</label>
            <input
              value={homeContent.reviewsSummary.ctaLabel}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  reviewsSummary: { ...current.reviewsSummary, ctaLabel: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-bodytext">CTA Link</label>
            <input
              value={homeContent.reviewsSummary.ctaHref}
              onChange={(event) =>
                updateHomeContent((current) => ({
                  ...current,
                  reviewsSummary: { ...current.reviewsSummary, ctaHref: event.target.value },
                }))
              }
              className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            />
          </div>
        </div>
        <SaveButton
          onClick={() =>
            save({ home_content: settings.home_content }, "Homepage reviews summary updated.")
          }
          label={savingKey === "home_content" ? "Saving..." : "Save"}
        />
      </SectionCard>

      <AdvancedJsonCard
        title="Advanced Homepage JSON"
        description="Only use this if you need a homepage structure change that is not covered by the simple fields above."
        value={settings.home_content}
        onChange={(nextValue) => setSettings({ ...settings, home_content: nextValue })}
        onSave={() => save({ home_content: settings.home_content }, "Homepage content updated.")}
        saveLabel={savingKey === "home_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Our Story Content"
        description="Use this only for deeper Our Story structure changes. The parent-brand callout is already managed above."
        value={settings.our_story_content}
        onChange={(nextValue) => setSettings({ ...settings, our_story_content: nextValue })}
        onSave={() =>
          save({ our_story_content: settings.our_story_content }, "Our Story content updated.")
        }
        saveLabel={savingKey === "our_story_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Size Guide Content"
        description="Use this for detailed size-guide table or customization-note changes not covered elsewhere."
        value={settings.size_guide_content}
        onChange={(nextValue) => setSettings({ ...settings, size_guide_content: nextValue })}
        onSave={() =>
          save({ size_guide_content: settings.size_guide_content }, "Size guide updated.")
        }
        saveLabel={savingKey === "size_guide_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Care Guide Content"
        description="Use this only when you need to restructure the care guide categories or copy."
        value={settings.care_guide_content}
        onChange={(nextValue) => setSettings({ ...settings, care_guide_content: nextValue })}
        onSave={() =>
          save({ care_guide_content: settings.care_guide_content }, "Care guide updated.")
        }
        saveLabel={savingKey === "care_guide_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Shipping Policy Content"
        description="Use this only for detailed shipping-policy copy changes."
        value={settings.shipping_policy_content}
        onChange={(nextValue) => setSettings({ ...settings, shipping_policy_content: nextValue })}
        onSave={() =>
          save(
            { shipping_policy_content: settings.shipping_policy_content },
            "Shipping policy updated.",
          )
        }
        saveLabel={savingKey === "shipping_policy_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Returns & Exchange Content"
        description="Use this only for detailed returns-policy copy changes."
        value={settings.returns_exchange_content}
        onChange={(nextValue) =>
          setSettings({ ...settings, returns_exchange_content: nextValue })
        }
        onSave={() =>
          save(
            { returns_exchange_content: settings.returns_exchange_content },
            "Returns and exchange page updated.",
          )
        }
        saveLabel={savingKey === "returns_exchange_content" ? "Saving..." : "Save"}
      />

      <AdvancedJsonCard
        title="Advanced Order Support Content"
        description="Use this only for detailed /track-order support copy changes."
        value={settings.track_order_content}
        onChange={(nextValue) => setSettings({ ...settings, track_order_content: nextValue })}
        onSave={() =>
          save(
            { track_order_content: settings.track_order_content },
            "Track order page updated.",
          )
        }
        saveLabel={savingKey === "track_order_content" ? "Saving..." : "Save"}
      />
    </div>
  );
}
