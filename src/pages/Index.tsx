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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.';
      // Show error toast instead of alert
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      });
    } finally {
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
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">Crafting your content…</p>
              </div>
            )}
            {!result && !isLoading && (
              <ContentForm onSubmit={handleSubmit} isLoading={isLoading} />
            )}
            {result && !isLoading && (
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
