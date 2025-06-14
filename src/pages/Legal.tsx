import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { legalContent } from '@/lib/legal-content';
import { ExternalLink } from 'lucide-react';

const renderContent = (content: any) => {
  if (typeof content === 'string') {
    // Handle markdown links
    const parts = content.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part: string, i: number) => {
      if (part.match(/\[.*\]\(.*\)/)) {
        const [text, url] = part.replace(/\[(.*)\]\((.*)\)/, '$1|||$2').split('|||');
        return (
          <a
            key={i}
            href={url}
            className="inline-flex items-center text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
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
  }
  return null;
};

const LegalSection = ({ section }: { section: any }) => (
  <section className="mb-8">
    <h3 className="mb-3 text-xl font-semibold text-foreground">{section.title}</h3>
    <div className="text-foreground/80 space-y-3">
      {section.content.map((item: any, i: number) => (
        <p key={i} className="leading-relaxed">
          {renderContent(item)}
        </p>
      ))}
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
        <p className="text-xl text-muted-foreground">Last Updated: {legalContent.lastUpdated}</p>
      </div>

      <Tabs defaultValue="terms" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            {legalContent.termsOfService.title}
          </h2>
          {legalContent.termsOfService.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">{legalContent.privacyPolicy.title}</h2>
          {legalContent.privacyPolicy.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="cookies" className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">{legalContent.cookiePolicy.title}</h2>
          {legalContent.cookiePolicy.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">{legalContent.contact.title}</h2>
          {legalContent.contact.sections.map((section, i) => (
            <LegalSection key={i} section={section} />
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t pt-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Luminari's Quest. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Legal;
