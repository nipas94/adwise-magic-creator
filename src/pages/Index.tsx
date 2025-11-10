import { useState } from "react";
import { ContentForm } from "@/components/ContentForm";
import { ContentResults } from "@/components/ContentResults";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    try {
      // Placeholder for API call - will be implemented with Lovable Cloud
      // const response = await fetch('/api/generate', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // setResult(data.result);
      
      // Mock response for now
      setTimeout(() => {
        setResult({
          captions: [
            "Discover the art of coffee at our boutique café ☕✨ Every cup tells a story of craftsmanship and passion.",
            "Artisanal coffee, crafted with love in the heart of Bangalore 🌟 Your perfect cup awaits!",
            "Where coffee meets creativity ☕🎨 Experience the difference of truly artisanal brews."
          ],
          tagline: "Brewing Excellence, One Cup at a Time",
          faqs: [
            {
              q: "What makes your coffee artisanal?",
              a: "We source premium beans, roast in small batches, and craft each cup with precision and care."
            },
            {
              q: "Where are you located?",
              a: "We're nestled in the heart of Bangalore, creating a cozy space for coffee lovers."
            }
          ]
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating content:', error);
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Content Generation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AdWise AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Write smarter. Post faster. Grow bigger.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-card rounded-2xl shadow-elegant p-8 md:p-10">
            {!result ? (
              <ContentForm onSubmit={handleSubmit} isLoading={isLoading} />
            ) : (
              <ContentResults result={result} onTryAgain={handleTryAgain} />
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Powered by advanced AI to help your business shine ✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
