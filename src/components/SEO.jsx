import { useEffect } from "react";

const SITE_URL = "https://jansetu.in";
const DEFAULT_TITLE = "JanSetu — Latest Government Jobs in India";
const DEFAULT_DESCRIPTION =
  "Discover government job vacancies across India. Explore recruitment notifications, eligibility criteria, application deadlines and official application links.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Reusable SEO component for dynamic head management across JanSetu routes.
 *
 * @param {object} props
 * @param {string} [props.title] - Page title
 * @param {string} [props.description] - Meta description
 * @param {string} [props.canonicalUrl] - Canonical URL path or full URL
 * @param {string} [props.ogType="website"] - Open Graph type
 * @param {string} [props.ogImage] - Open Graph image URL
 * @param {object} [props.schema] - Optional JSON-LD structured data object
 */
export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl = SITE_URL,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  schema = null,
  noindex = false,
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create a meta tag
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Robots Directive
    if (noindex) {
      setMetaTag("meta[name='robots']", "name", "robots", "noindex, follow");
    } else {
      setMetaTag(
        "meta[name='robots']",
        "name",
        "robots",
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
    }

    // 2. Primary Meta Tags
    setMetaTag("meta[name='description']", "name", "description", description);

    // 3. Canonical Link Tag
    const fullCanonical = canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${SITE_URL}${canonicalUrl.startsWith("/") ? "" : "/"}${canonicalUrl}`;

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonical);

    // 4. Open Graph Tags
    setMetaTag("meta[property='og:title']", "property", "og:title", title);
    setMetaTag("meta[property='og:description']", "property", "og:description", description);
    setMetaTag("meta[property='og:url']", "property", "og:url", fullCanonical);
    setMetaTag("meta[property='og:type']", "property", "og:type", ogType);
    setMetaTag("meta[property='og:image']", "property", "og:image", ogImage);
    setMetaTag("meta[property='og:site_name']", "property", "og:site_name", "JanSetu");

    // 5. Twitter Card Tags
    setMetaTag("meta[name='twitter:card']", "name", "twitter:card", "summary_large_image");
    setMetaTag("meta[name='twitter:title']", "name", "twitter:title", title);
    setMetaTag("meta[name='twitter:description']", "name", "twitter:description", description);
    setMetaTag("meta[name='twitter:image']", "name", "twitter:image", ogImage);
    setMetaTag("meta[name='twitter:url']", "name", "twitter:url", fullCanonical);

    // 6. Structured Data (Schema.org JSON-LD)
    const scriptId = "dynamic-seo-schema";
    let schemaScript = document.getElementById(scriptId);

    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.id = scriptId;
        schemaScript.type = "application/ld+json";
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, canonicalUrl, ogType, ogImage, schema, noindex]);

  return null;
}

