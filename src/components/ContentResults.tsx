import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContentResult {
  captions: string[];
  tagline: string;
  faqs: { q: string; a: string }[];
}

interface ContentResultsProps {
  result: ContentResult;
  onTryAgain: () => void;
  onRegenerateSection: (section: 'captions' | 'tagline' | 'faqs') => void;
  regeneratingSection: string | null;
}

export const ContentResults = ({ result, onTryAgain, onRegenerateSection, regeneratingSection }: ContentResultsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast({
      title: "Copied ✅",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = async () => {
    const allContent = [
      "CAPTIONS:",
      ...result.captions.map((c, i) => `${i + 1}. ${c}`),
      "\nTAGLINE:",
      result.tagline,
      "\nFAQs:",
      ...result.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`),
    ].join("\n\n");
    
    await navigator.clipboard.writeText(allContent);
    toast({
      title: "Copied ✅",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your content is ready ✨</h2>
        <div className="flex gap-2">
          <Button onClick={copyAll} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy All
          </Button>
          <Button onClick={onTryAgain} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>

      {result.captions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Social Media Captions</h3>
            <Button
              onClick={() => onRegenerateSection('captions')}
              disabled={regeneratingSection === 'captions'}
              variant="outline"
              size="sm"
            >
              {regeneratingSection === 'captions' ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
          {result.captions.map((caption, idx) => (
            <div
              key={idx}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm leading-relaxed">{caption}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(caption, `caption-${idx}`)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === `caption-${idx}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {result.tagline && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Brand Tagline</h3>
            <Button
              onClick={() => onRegenerateSection('tagline')}
              disabled={regeneratingSection === 'tagline'}
              variant="outline"
              size="sm"
            >
              {regeneratingSection === 'tagline' ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
          <div className="p-4 bg-gradient-primary rounded-lg shadow-glow group">
            <div className="flex items-start justify-between gap-3">
              <p className="flex-1 text-sm leading-relaxed text-primary-foreground font-medium">
                {result.tagline}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(result.tagline, "tagline")}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:bg-white/20"
              >
                {copiedIndex === "tagline" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {result.faqs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <Button
              onClick={() => onRegenerateSection('faqs')}
              disabled={regeneratingSection === 'faqs'}
              variant="outline"
              size="sm"
            >
              {regeneratingSection === 'faqs' ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
          {result.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm">{faq.q}</p>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(`${faq.q}\n${faq.a}`, `faq-${idx}`)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === `faq-${idx}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
