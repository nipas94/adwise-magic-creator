import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContentForm } from "@/components/ContentForm";
import { ContentResults } from "@/components/ContentResults";
import { WeeklyContentGenerator } from "@/components/WeeklyContentGenerator";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Zap, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { user, loading: authLoading, signOut, subscription } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [photoContext, setPhotoContext] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isPaidUser = subscription?.plan === 'monthly';

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setLastFormData(formData); // Store for regeneration
    
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
      setPhotoContext(data.photoContext || '');
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
    setPhotoContext('');
  };

  const handleRegenerateSection = async (section: 'captions' | 'tagline' | 'faqs') => {
    if (!lastFormData) return;
    
    setRegeneratingSection(section);
    
    try {
      // Create new FormData with section parameter
      const regenerateData = new FormData();
      regenerateData.append('business', lastFormData.get('business') as string);
      regenerateData.append('contentType', lastFormData.get('contentType') as string);
      regenerateData.append('tone', lastFormData.get('tone') as string);
      regenerateData.append('section', section);
      
      const photo = lastFormData.get('photo');
      if (photo) {
        regenerateData.append('photo', photo);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: regenerateData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate content');
      }

      const data = await response.json();
      
      // Merge the regenerated section with existing result
      setResult((prevResult: any) => ({
        ...prevResult,
        ...data.result,
      }));
    } catch (error) {
      console.error('Error regenerating section:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate. Please try again.';
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      });
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1" />
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-10 h-10 text-primary" />
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AdWise AI
                </h1>
              </div>
              <div className="flex-1 flex justify-end">
                <Button onClick={signOut} variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your business description into engaging marketing content powered by AI
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Instant Results</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Multiple Formats</span>
              </div>
            </div>
          </div>

          {/* Subscription Banner */}
          <div className="mb-8">
            <SubscriptionBanner />
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'daily' | 'weekly')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="daily">Daily Content (Free)</TabsTrigger>
              <TabsTrigger value="weekly" disabled={!isPaidUser}>
                Weekly Content {!isPaidUser && '(Premium)'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily">
              {isLoading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-lg text-muted-foreground">Crafting your content…</p>
                </div>
              ) : !result ? (
                <ContentForm onSubmit={handleSubmit} isLoading={isLoading} />
              ) : (
                <ContentResults 
                  result={result}
                  onTryAgain={handleTryAgain}
                  photoContext={photoContext}
                  onRegenerateSection={handleRegenerateSection}
                  regeneratingSection={regeneratingSection}
                />
              )}
            </TabsContent>
            
            <TabsContent value="weekly">
              {!isPaidUser ? (
                <div className="text-center py-12">
                  <div className="bg-card rounded-2xl shadow-elegant p-8">
                    <h3 className="text-2xl font-semibold mb-4">Premium Feature</h3>
                    <p className="text-muted-foreground mb-6">
                      Upgrade to the monthly plan to unlock weekly content generation with smart acquisition and engagement post mix.
                    </p>
                  </div>
                </div>
              ) : !lastFormData ? (
                <div className="text-center py-12">
                  <div className="bg-card rounded-2xl shadow-elegant p-8">
                    <h3 className="text-2xl font-semibold mb-4">Generate Daily Content First</h3>
                    <p className="text-muted-foreground mb-6">
                      Please generate daily content first in the "Daily Content" tab to set up your business details. Then come back here to generate a full week's content.
                    </p>
                  </div>
                </div>
              ) : (
                <WeeklyContentGenerator 
                  businessDescription={lastFormData.get('business') as string || ''}
                  tone={lastFormData.get('tone') as string || 'friendly'}
                  photoContext={photoContext}
                />
              )}
            </TabsContent>
          </Tabs>

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
