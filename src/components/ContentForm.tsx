import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export const ContentForm = ({ onSubmit, isLoading }: ContentFormProps) => {
  const [business, setBusiness] = useState("");
  const [contentType, setContentType] = useState("all");
  const [tone, setTone] = useState("friendly");
  const [photo, setPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!business.trim()) {
      toast({
        title: "Business description required",
        description: "Please describe your business to generate content.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("business", business);
    formData.append("contentType", contentType);
    formData.append("tone", tone);
    if (photo) {
      formData.append("photo", photo);
    }

    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setPhoto(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="business">Describe your business</Label>
        <Textarea
          id="business"
          placeholder="e.g., I run a boutique café in Bangalore serving artisanal coffee"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contentType">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger id="contentType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="marketing">Marketing Copy</SelectItem>
              <SelectItem value="faqs">FAQs</SelectItem>
              <SelectItem value="social">Social Posts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
              <SelectItem value="elegant">Elegant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Upload Photo (optional)</Label>
        <div className="relative">
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="photo">
            <div className="flex items-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {photo ? photo.name : "Choose an image to enhance your content"}
              </span>
            </div>
          </label>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Crafting your captions ✨...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate My Content 🚀
          </>
        )}
      </Button>
    </form>
  );
};
