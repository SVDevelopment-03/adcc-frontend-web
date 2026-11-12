import { useContentSection } from "../../hooks/useContentSection";
import { textToPolicyBlocks } from "../../services/contentPages";
import { renderBlock } from "../public/RichText";

export default function PrivacyPolicy() {
  // Edited under Pages → Privacy Policy; defaults to the original policy text.
  const policy = useContentSection("privacy", "policy");
  const content = {
    intro: textToPolicyBlocks(policy.pick("intro")),
    sections: policy.list("sections").map((item) => ({
      heading: policy.pickItem(item, "heading"),
      blocks: textToPolicyBlocks(policy.pickItem(item, "body")),
    })),
  };

  return (
    <div className="privacy-policy-page bg-[#eaf4ff] text-black">
      <div className="mx-auto max-w-[1100px] px-6 pt-36 text-center sm:px-8 sm:pt-44">
        <h1 className="text-[36px] uppercase text-black sm:text-[48px]">
          {policy.pick("title")}
        </h1>
        <p className="mt-2 text-[15px] text-black sm:text-[16px]">
          {policy.pick("breadcrumb")}
        </p>
      </div>

      <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-8 md:py-16">
        <div>
          {content.intro.map((block, idx) => renderBlock(block, `intro-${idx}`))}
        </div>

        <div className="mt-8 space-y-10 sm:mt-10">
          {content.sections.map((section, sIdx) => (
            <div key={sIdx}>
              <h2 className="text-[24px] sm:text-[28px]">{section.heading}</h2>
              {section.blocks.map((block, idx) =>
                renderBlock(block, `${sIdx}-${idx}`),
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
