import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Anah by Sindhura Reddy",
  description:
    "Learn how Anah by Sindhura Reddy collects, uses, and protects customer information across the storefront and checkout experience.",
};

const policySections = [
  {
    title: "Information We Collect",
    body:
      "When you browse, place an order, submit a review, or contact our team, we may collect details such as your name, email address, phone number, delivery address, order details, payment reference details, and any information you choose to share with us.",
  },
  {
    title: "How We Use Your Information",
    body:
      "We use your information to process orders, coordinate shipping, confirm payments, send order-related updates, respond to support requests, manage reviews, and improve the storefront experience. We may also use limited technical information to monitor site performance and prevent misuse.",
  },
  {
    title: "Payments",
    body:
      "Online payments on this storefront are processed through Razorpay. Payment card or banking details are handled by the payment provider and are not stored directly by our storefront application. We may store payment reference details such as order IDs or payment IDs for reconciliation and support.",
  },
  {
    title: "Order Communication",
    body:
      "If you place an order, we may contact you by email or phone for order confirmation, dispatch updates, delivery coordination, exchange support, review follow-up, or issue resolution related to your purchase.",
  },
  {
    title: "Reviews and Customer Submissions",
    body:
      "If you submit a product review, the information you provide may be reviewed by our admin team before it appears on the storefront. Please avoid sharing sensitive personal information in review text fields.",
  },
  {
    title: "Data Sharing",
    body:
      "We share information only as needed to run the business, such as with payment providers, shipping partners, email delivery services, website infrastructure providers, or service partners who help us operate the storefront. We do not sell customer personal information.",
  },
  {
    title: "Data Retention",
    body:
      "We retain order, support, and review records for as long as reasonably necessary for business operations, customer service, legal compliance, dispute handling, and internal record keeping.",
  },
  {
    title: "Your Choices",
    body:
      "You may contact us to request correction or deletion of information that you have shared with us, subject to any legal, accounting, operational, or fraud-prevention obligations that require retention of certain records.",
  },
  {
    title: "Policy Updates",
    body:
      "We may update this privacy policy from time to time as the storefront, business operations, or service providers change. The latest version published on this page will apply going forward.",
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <h1 className="mb-6 text-5xl text-deepbrown">Privacy Policy</h1>
      <p className="mb-4 max-w-3xl font-sans text-lg font-light leading-8 text-bodytext">
        This Privacy Policy explains how <strong>Anah by Sindhura Reddy</strong> collects,
        uses, and protects customer information across this website and checkout experience.
      </p>
      <p className="mb-12 max-w-3xl font-sans text-lg font-light leading-8 text-bodytext">
        This draft has been prepared using the business and contact details currently available
        in the codebase and can be refined later with final legal wording.
      </p>

      <div className="space-y-10">
        {policySections.map((section) => (
          <section key={section.title} className="border-b border-taupe/20 pb-10 last:border-b-0">
            <h2 className="mb-3 text-3xl text-deepbrown">{section.title}</h2>
            <p className="max-w-3xl font-sans text-[15px] font-light leading-8 text-bodytext">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-sm border border-taupe/20 bg-white p-8">
        <h2 className="mb-3 text-3xl text-deepbrown">Contact</h2>
        <p className="font-sans text-[15px] font-light leading-8 text-bodytext">
          For privacy-related questions or requests, please contact us at{" "}
          <a className="text-coral underline" href="mailto:orders@anahbysr.com">
            orders@anahbysr.com
          </a>{" "}
          or on WhatsApp/phone at{" "}
          <a className="text-coral underline" href="tel:+918801970907">
            +91 88019 70907
          </a>
          .
        </p>
      </section>
    </div>
  );
}
