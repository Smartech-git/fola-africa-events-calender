"use client";
import { ReactNode } from "react";

import Image from "next/image";

import { SanityImageObject } from "@sanity/image-url";
import { PortableText as SanityPortableText } from "next-sanity";
import type {
  PortableTextBlock,
  PortableTextComponents,
  PortableTextListComponent,
  PortableTextBlockComponent,
  PortableTextListItemComponent,
} from "next-sanity";

import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";

interface PortableComponentProps {
  children: ReactNode;
}

interface PortableImageProps extends SanityImageObject {
  alt: string;
}

export interface PortableTextProps {
  content: PortableTextBlock[];
  className?: string;
  customComponents?: Partial<PortableTextComponents>;
  features?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    links?: boolean;
  };
  elementStyles?: {
    paragraph?: string;
    heading1?: string;
    heading2?: string;
    heading3?: string;
    heading4?: string;
    heading5?: string;
    heading6?: string;
    blockquote?: string;
    list?: string;
    listItem?: string;
    bold?: string;
    italic?: string;
    underline?: string;
    strikethrough?: string;
    code?: string;
    link?: string;
    image?: string;
  };
}

const defaultElementStyles = {
  paragraph: "text-inherit font-normal text-xs uppercase",
  heading1: "3xl:text-7xl sm:text-3xl text-2xl font-bold my-3 text-inherit",
  heading2: "3xl:text-6xl sm:text-2xl text-2xl font-bold my-3 text-inherit",
  heading3: "3xl:text-5xl sm:text-xl text-xl font-bold my-3 text-inherit",
  heading4: "3xl:text-5xl sm:text-xl text-lg font-bold my-3 text-inherit",
  heading5:
    "3xl:text-4xl sm:text-lg text-lg font-bold my-3 text-primary-prussian-blue",
  heading6: "3xl:text-4xl sm:text-lg font-bold my-2 text-inherit",
  blockquote:
    "border-l-4 3xl:text-4xl sm:text-lg border-gray-300 pl-4 italic text-inherit",
  list: "mb-4 mt-5 3xl:ml-12 ml-8 text-inherit",
  listItem: "mb-1 3xl:text-3xl sm:text-lg  text-inherit",
  bold: "font-bold 3xl:text-3xl sm:text-lg text-inherit",
  italic: "italic 3xl:text-3xl sm:text-lg text-inherit",
  underline: "underline 3xl:text-3xl sm:text-lg  text-inherit",
  strikethrough: "line-through 3xl:text-3xl sm:text-lg  text-inherit",
  code: "bg-gray-100 3xl:text-3xl sm:text-lg px-2 py-1 rounded text-sm font-mono text-inherit",
  link: "3xl:text-3xl sm:text-lg underline transition-colors text-inherit",
  image:
    "relative bg-primary-light-yellow aspect-[3/2] w-full rounded-lg sm:rounded-2xl overflow-hidden",
};

export function PortableText({
  content,
  className,
  customComponents = {},
  features = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    code: true,
    links: true,
  },
  elementStyles = {},
}: PortableTextProps) {
  const getElementStyles = (elementName: keyof typeof defaultElementStyles) => {
    return cn(defaultElementStyles[elementName], elementStyles[elementName]);
  };

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }: PortableComponentProps) => (
        <p className={getElementStyles("paragraph")}>{children}</p>
      ),
      h1: ({ children }: PortableComponentProps) => (
        <h1 className={getElementStyles("heading1")}>{children}</h1>
      ),
      h2: ({ children }: PortableComponentProps) => (
        <h2 className={getElementStyles("heading2")}>{children}</h2>
      ),
      h3: ({ children }: PortableComponentProps) => (
        <h3 className={getElementStyles("heading3")}>{children}</h3>
      ),
      h4: ({ children }: PortableComponentProps) => (
        <h4 className={getElementStyles("heading4")}>{children}</h4>
      ),
      h5: ({ children }: PortableComponentProps) => (
        <h5 className={getElementStyles("heading5")}>{children}</h5>
      ),
      h6: ({ children }: PortableComponentProps) => (
        <h6 className={getElementStyles("heading6")}>{children}</h6>
      ),
      blockquote: ({ children }: PortableComponentProps) => (
        <blockquote className={getElementStyles("blockquote")}>
          {children}
        </blockquote>
      ),
    } as unknown as PortableTextBlockComponent,

    list: {
      bullet: ({ children }: PortableComponentProps) => (
        <ul className={cn(getElementStyles("list"), "list-outside list-disc")}>
          {children}
        </ul>
      ),
      number: ({ children }: PortableComponentProps) => (
        <ol
          className={cn(getElementStyles("list"), "list-outside list-decimal")}
        >
          {children}
        </ol>
      ),
    } as unknown as PortableTextListComponent,

    listItem: {
      bullet: ({ children }: PortableComponentProps) => (
        <li className={getElementStyles("listItem")}>{children}</li>
      ),
      number: ({ children }: PortableComponentProps) => (
        <li className={getElementStyles("listItem")}>{children}</li>
      ),
    } as unknown as PortableTextListItemComponent,

    marks: {
      strong: features.bold
        ? ({ children }: PortableComponentProps) => (
            <strong className={getElementStyles("bold")}>{children}</strong>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,

      em: features.italic
        ? ({ children }: PortableComponentProps) => (
            <em className={getElementStyles("italic")}>{children}</em>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,

      underline: features.underline
        ? ({ children }: PortableComponentProps) => (
            <span className={getElementStyles("underline")}>{children}</span>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,

      "strike-through": features.strikethrough
        ? ({ children }: PortableComponentProps) => (
            <span className={getElementStyles("strikethrough")}>
              {children}
            </span>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,

      code: features.code
        ? ({ children }: PortableComponentProps) => (
            <code className={getElementStyles("code")}>{children}</code>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,

      link: features.links
        ? ({
            children,
            value,
          }: PortableComponentProps & { value?: { href?: string } }) => (
            <a
              href={value?.href}
              className={getElementStyles("link")}
              target={value?.href?.startsWith("http") ? "_blank" : undefined}
              rel={
                value?.href?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {children}
            </a>
          )
        : ({ children }: PortableComponentProps) => <>{children}</>,
    },
    types: {
      imageGrid: ({
        value,
      }: {
        value?: { images?: Array<PortableImageProps | null> };
      }) => {
        const images = (value?.images ?? []).filter(
          (img): img is PortableImageProps => Boolean(img?.asset?._ref),
        );

        if (images.length === 0) return null;
        const isSingle = images.length === 1 ? true : false;
        return (
          <div
            className={cn(
              "my-3 grid gap-3",
              isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
            )}
          >
            {images.slice(0, 2).map((img) => (
              <div
                key={img.asset._ref}
                className={cn(
                  getElementStyles("image"),
                  isSingle && "aspect-auto h-fit",
                )}
              >
                <Image
                  src={urlFor(img).fit("crop").url()}
                  alt={img.alt || "Wandé Esan"}
                  width={1200}
                  height={800}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 1000px, 1200px"
                  className="size-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        );
      },
    },
    ...customComponents,
  };

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <SanityPortableText value={content} components={components} />
    </div>
  );
}

export default PortableText;
