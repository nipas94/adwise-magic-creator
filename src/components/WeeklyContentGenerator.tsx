import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DayContent {
  day: string;
  type: 'acquire' | 'engage';
  caption: string;
}

interface WeeklyContentGeneratorProps {
  businessDescription: string;
  tone: string;
  photoContext?: string;
}

export const WeeklyContentGenerator = ({ businessDescription, tone, photoContext }: WeeklyContentGeneratorProps) => {
  const [weeklyContent, setWeeklyContent] = useState<DayContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('business', businessDescription);
      formData.append('tone', tone);
      formData.append('contentType', 'weekly');
      if (photoContext) {
        formData.append('photoContext', photoContext);
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate weekly content');
      }

      setWeeklyContent(data.result.weeklyContent || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate weekly content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {weeklyContent.length === 0 ? (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Content Generator
            </CardTitle>
            <CardDescription>
              Generate a full week of strategically balanced content - acquisition posts to attract new customers and engagement posts to nurture your community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Week's Content...
                </>
              ) : (
                'Generate Full Week'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Your Week's Content 📅</h3>
            <Button onClick={handleGenerate} variant="outline" disabled={loading}>
              Regenerate Week
            </Button>
          </div>
          
          <div className="grid gap-4">
            {weeklyContent.map((dayContent, index) => (
              <Card key={index} className={`shadow-elegant ${dayContent.type === 'acquire' ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-accent'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{dayContent.day}</CardTitle>
                      <CardDescription className="mt-1">
                        {dayContent.type === 'acquire' ? (
                          <span className="text-primary font-medium">🎯 Acquisition Post - Attract new customers</span>
                        ) : (
                          <span className="text-accent font-medium">💬 Engagement Post - Nurture your community</span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleCopy(dayContent.caption, index)}
                      variant="ghost"
                      size="icon"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{dayContent.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};