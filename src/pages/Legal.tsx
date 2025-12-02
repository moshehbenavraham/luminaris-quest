/* eslint-disable @typescript-eslint/no-explicit-any -- Legal page content rendering requires flexible types */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { legalContent } from '@/lib/legal-content';
import { ExternalLink } from 'lucide-react';

const renderContent = (content: any) => {
  if (typeof content === 'string') {
    // Handle markdown headers (#### **text**)
    if (content.startsWith('#### ')) {
      const headerText = content.replace(/^#### \*\*(.*)\*\*$/, '$1').replace(/^#### (.*)$/, '$1');
      return <h4 className="text-foreground mt-4 mb-2 text-lg font-semibold">{headerText}</h4>;
    }

    // Split content by markdown patterns
    const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

    return parts.map((part: string, i: number) => {
      // Handle markdown links [text](url)
      if (part.match(/\[.*\]\(.*\)/)) {
        const [text, url] = part.replace(/\[(.*)\]\((.*)\)/, '$1|||$2').split('|||');
        return (
          <a
            key={i}
            href={url}
            className="text-primary inline-flex items-center hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        );
      }

      // Handle bold text **text**
      if (part.match(/\*\*.*\*\*/)) {
        const boldText = part.replace(/\*\*(.*)\*\*/, '$1');
        return (
          <strong key={i} className="text-foreground font-semibold">
            {boldText}
          </strong>
        );
      }

      return <span key={i}>{part}</span>;
    });
  } else if (content.list) {
    return (
      <ul className="my-2 list-disc space-y-2 pl-6">
        {content.list.map((item: string, i: number) => (
          <li key={i} className="text-foreground/80">
            {renderContent(item)}
          </li>
        ))}
      </ul>
    );
  } else if (content.title && content.content) {
    // Handle nested content with title
    return (
      <div className="mt-4">
        <h5 className="text-foreground mb-2 font-medium">{content.title}</h5>
        <div className="space-y-2">
          {content.content.map((item: any, i: number) => (
            <div key={i}>{renderContent(item)}</div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const LegalSection = ({ section }: { section: any }) => (
  <section className="mb-8">
    <h3 className="text-foreground mb-3 text-xl font-semibold">{section.title}</h3>
    <div className="text-foreground/80 space-y-3">
      {section.content.map((item: any, i: number) => {
        // Check if this is a markdown header
        if (typeof item === 'string' && item.startsWith('#### ')) {
          return <div key={i}>{renderContent(item)}</div>;
        }

        return (
          <div key={i} className="leading-relaxed">
            {renderContent(item)}
          </div>
        );
      })}
    </div>
  </section>
);

export function Legal() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Legal Terms & Privacy Policy
        </h1>
        <p className="text-muted-foreground text-xl">Last Updated: {legalContent.lastUpdated}</p>
      </div>

      <Tabs defaultValue="terms" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-6">
          <h2 className="text-foreground text-3xl font-bold">
            {legalContent.termsOfService.title}
          </h2>
          {legalContent.termsOfService.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <h2 className="text-foreground text-3xl font-bold">{legalContent.privacyPolicy.title}</h2>
          {legalContent.privacyPolicy.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="cookies" className="space-y-6">
          <h2 className="text-foreground text-3xl font-bold">{legalContent.cookiePolicy.title}</h2>
          {legalContent.cookiePolicy.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <h2 className="text-foreground text-3xl font-bold">{legalContent.contact.title}</h2>
          {legalContent.contact.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>
      </Tabs>

      <div className="text-muted-foreground mt-8 border-t pt-4 text-sm">
        <p>© {new Date().getFullYear()} Luminari&apos;s Quest. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Legal;
