import { prisma } from "@/lib/prisma";
import {
  defaultCareGuideContent,
  defaultHomeContent,
  defaultOurStoryContent,
  defaultReturnsExchangeContent,
  defaultShippingPolicyContent,
  defaultSizeGuideContent,
  defaultTrackOrderContent,
} from "@/lib/site-defaults";
import { parseJsonArray, parseJsonObject } from "@/lib/serializers";

function normalizeSeparators(value: string) {
  return value.replace(/Ãƒâ€šÃ‚Â·|Ã‚Â·|Â·/g, "-");
}

export async function getSettingsMap() {
  const settings = await prisma.settings.findMany();
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

export async function getSettingValue(key: string, fallback = "") {
  const setting = await prisma.settings.findUnique({ where: { key } });
  return setting?.value ?? fallback;
}

export async function getStorefrontConfig() {
  const settings = await getSettingsMap();

  const homeContent = parseJsonObject(settings.home_content, defaultHomeContent);
  const brandStory = {
    ...defaultHomeContent.brandStory,
    ...homeContent.brandStory,
    kicker: normalizeSeparators(
      homeContent.brandStory?.kicker ?? defaultHomeContent.brandStory.kicker,
    ),
  };

  const rawStars = String(
    homeContent.reviewsSummary?.stars ?? defaultHomeContent.reviewsSummary.stars,
  );
  const parsedTrackOrderContent = parseJsonObject(
    settings.track_order_content,
    defaultTrackOrderContent,
  );
  const parsedOurStoryContent = parseJsonObject(
    settings.our_story_content,
    defaultOurStoryContent,
  );
  const ourStoryContent = {
    ...defaultOurStoryContent,
    ...parsedOurStoryContent,
    heroImages:
      parsedOurStoryContent.heroImages && parsedOurStoryContent.heroImages.length >= 3
        ? parsedOurStoryContent.heroImages
        : defaultOurStoryContent.heroImages,
  };
  const reviewsSummary = {
    ...defaultHomeContent.reviewsSummary,
    ...homeContent.reviewsSummary,
    stars:
      rawStars.includes("?") || rawStars.includes("Ã")
        ? defaultHomeContent.reviewsSummary.stars
        : rawStars,
    summaryText: normalizeSeparators(
      homeContent.reviewsSummary?.summaryText ?? defaultHomeContent.reviewsSummary.summaryText,
    ),
    ctaHref:
      String(homeContent.reviewsSummary?.ctaHref ?? "") === "/track-order"
        ? "/write-review"
        : (homeContent.reviewsSummary?.ctaHref ??
          defaultHomeContent.reviewsSummary.ctaHref),
  };

  const fallbackAnnouncement =
    "Free shipping above Rs 999 - Pan-India delivery - New arrivals every fortnight - Delivery timelines 8-10 days";

  return {
    announcementBar:
      settings.announcement_bar ===
      "Free shipping above Rs 999 Â· Pan-India delivery Â· New arrivals every fortnight"
        ? fallbackAnnouncement
        : (settings.announcement_bar ?? fallbackAnnouncement),
    featuredProductIds: parseJsonArray(settings.featured_product_ids),
    heroImage: settings.hero_image ?? "/uploads/ombre-yellow-rust.jpg",
    whatsappNumber: settings.whatsapp_number ?? "918801970907",
    logoImage: settings.site_logo_image ?? "/uploads/anah-logo.png",
    instagramHandle: settings.instagram_handle ?? "anahbysr",
    instagramPostUrls: parseJsonArray(settings.instagram_post_urls),
    parentBrandText:
      settings.parent_brand_text ??
      "Discover our parent brand, Sindhura Reddy Official - our ethnic wear label for women.",
    parentBrandLabel: settings.parent_brand_label ?? "Visit on Instagram",
    parentBrandUrl:
      settings.parent_brand_url ??
      "https://www.instagram.com/sindhurareddyofficial?igsh=MmJjbHpoenJsZ3Nt",
    homeContent: {
      ...defaultHomeContent,
      ...homeContent,
      brandStory,
      reviewsSummary,
    },
    ourStoryContent,
    sizeGuideContent: parseJsonObject(settings.size_guide_content, defaultSizeGuideContent),
    careGuideContent: parseJsonObject(settings.care_guide_content, defaultCareGuideContent),
    shippingPolicyContent: parseJsonObject(
      settings.shipping_policy_content,
      defaultShippingPolicyContent,
    ),
    returnsExchangeContent: parseJsonObject(
      settings.returns_exchange_content,
      defaultReturnsExchangeContent,
    ),
    trackOrderContent:
      parsedTrackOrderContent.intro?.includes("Enter your order number")
        ? defaultTrackOrderContent
        : parsedTrackOrderContent,
  };
}
