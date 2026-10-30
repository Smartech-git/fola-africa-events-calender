import Link from "next/link";

import parse, {
  domToReact,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/utils";

interface HtmlRendererProps {
  htmlString: string;
  className?: string;
}

const link =
  "text-red underline decoration-1 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-red";
const cell = "border border-ink/30 px-4 py-3 text-left align-top";


const options: HTMLReactParserOptions = {
  replace(domNode) {
    if (!(domNode instanceof Element)) return;
    const children = () => domToReact(domNode.children as DOMNode[], options);
    const id = domNode.attribs?.id;

    switch (domNode.name) {
      case "a": {
        const href = domNode.attribs?.href;
        if (!href) return;
        const external = /^https?:\/\//.test(href);
        return (
          <Link
            href={href}
            className={link}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {children()}
          </Link>
        );
      }
      case "h1":
        return (
          <h1
            id={id}
            className="font-montreal text-4xl font-medium tracking-mono sm:text-5xl"
          >
            {children()}
          </h1>
        );
      case "h2":
        return (
          <h2
            id={id}
            className="mt-6 scroll-mt-32 border-t-[1.5px] border-ink pt-8 font-montreal text-2xl font-medium tracking-mono sm:mt-10 sm:text-3xl"
          >
            {children()}
          </h2>
        );
      case "h3":
        return (
          <h3
            id={id}
            className="mt-4 scroll-mt-32 font-montreal text-xl font-medium tracking-mono sm:text-2xl"
          >
            {children()}
          </h3>
        );
      case "h4":
        return (
          <h4
            id={id}
            className="font-courier text-sm tracking-cou text-red uppercase"
          >
            {children()}
          </h4>
        );
      case "p":
        return (
          <p className="font-montreal text-xl sm:text-2xl">{children()}</p>
        );
      case "ul":
        return (
          <ul className="flex list-disc flex-col gap-2 pl-6 font-montreal text-xl marker:text-red sm:text-2xl">
            {children()}
          </ul>
        );
      case "ol":
        return (
          <ol className="flex list-decimal flex-col gap-2 pl-6 font-montreal text-xl marker:font-courier marker:text-red sm:text-2xl">
            {children()}
          </ol>
        );
      case "table":
        return (
          <div className="scrollbar-none w-full overflow-x-auto border border-ink/30">
            <table className="w-full table-auto border-collapse font-montreal text-sm sm:text-base">
              {children()}
            </table>
          </div>
        );
      case "thead":
        return <thead className="bg-cream">{children()}</thead>;
      case "th":
        return (
          <th
            className={cn(
              cell,
              "font-courier text-xs font-normal tracking-cou text-red uppercase",
            )}
          >
            {children()}
          </th>
        );
      case "td":
        return <td className={cell}>{children()}</td>;
    }
  },
};

function PortableText({ htmlString, className }: HtmlRendererProps) {
  const sanitizedHtml = DOMPurify.sanitize(htmlString, {
    ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "caption"],
  }).replace(/&nbsp;/g, " ");

  return (
    <div className={cn("flex w-full flex-col gap-4 text-ink", className)}>
      {parse(sanitizedHtml, options)}
    </div>
  );
}

export default PortableText;
