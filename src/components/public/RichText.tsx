import type { PrivacyBlock } from "../../data/privacyPolicyContent";
import { textToPolicyBlocks } from "../../services/contentPages";

/*
 * Long-form text edited in the dashboard as plain text: paragraphs separated
 * by an empty line, "- " for bullets, "## " for sub-headings, web links made
 * clickable. Used by the privacy policy and dashboard-built pages.
 */

function isListBlock(block: PrivacyBlock): block is string[] {
  return Array.isArray(block);
}

function isSubheadingBlock(block: PrivacyBlock): block is { sub: string } {
  return typeof block === "object" && block !== null && "sub" in block;
}

const URL_PATTERN =
  /(https?:\/\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=%]+|(?:support\.google\.com|goo\.gle)\/[A-Za-z0-9\-_/]+)/g;

function linkifyText(text: string) {
  const parts = text.split(URL_PATTERN);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (!part) return null;
    if (URL_PATTERN.test(part)) {
      URL_PATTERN.lastIndex = 0;
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#019839] underline underline-offset-2 hover:text-black"
        >
          {part}
        </a>
      );
    }
    URL_PATTERN.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}

export function renderBlock(block: PrivacyBlock, key: string) {
  if (isListBlock(block)) {
    return (
      <ul
        key={key}
        className="mt-3 list-disc space-y-2 ps-5 marker:text-[#019839]"
      >
        {block.map((item, i) => (
          <li key={i} className="text-[15px] leading-7 sm:text-[16px]">
            {linkifyText(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (isSubheadingBlock(block)) {
    return (
      <h3 key={key} className="mt-6 text-[20px] sm:text-[22px]">
        {block.sub}
      </h3>
    );
  }
  return (
    <p key={key} className="mt-3 text-[15px] leading-7 sm:text-[16px]">
      {linkifyText(block)}
    </p>
  );
}

/** Renders dashboard text (see above) as paragraphs, bullet lists and sub-headings. */
export function RichText({ text, keyPrefix = "rt" }: { text: string; keyPrefix?: string }) {
  return <>{textToPolicyBlocks(text).map((block, i) => renderBlock(block, `${keyPrefix}-${i}`))}</>;
}
