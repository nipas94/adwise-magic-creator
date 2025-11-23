import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionBanner = () => {
  const { subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    toast({
      title: "Payment Integration Coming Soon",
      description: "Secure payment processing will be added soon. Contact support to upgrade.",
    });
  };

  const handleCancel = async () => {
    toast({
      title: "Contact Support",
      description: "Please contact support to manage your subscription.",
    });
  };

  if (!subscription) return null;

  const isPaid = subscription.plan === 'monthly';

  return (
    <Card className={`shadow-elegant ${isPaid ? 'bg-gradient-primary text-primary-foreground' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`w-6 h-6 ${isPaid ? 'text-yellow-300' : 'text-muted-foreground'}`} />
            <CardTitle className={isPaid ? 'text-primary-foreground' : ''}>
              {isPaid ? 'Premium Plan' : 'Free Plan'}
            </CardTitle>
          </div>
          {isPaid && (
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              ₹99/month
            </span>
          )}
        </div>
        <CardDescription className={isPaid ? 'text-primary-foreground/90' : ''}>
          {isPaid ? 'You have access to all premium features' : 'Upgrade to unlock weekly content generation'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPaid ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Daily content generation (current feature)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Full week's content in one go</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Smart mix: Acquisition + Engagement posts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Day-wise content strategy</span>
              </div>
            </div>
            <Button onClick={handleUpgrade} className="w-full" size="lg">
              Upgrade to Premium - ₹99/month
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-primary-foreground/90">
              You're enjoying all premium features! Generate weekly content anytime.
            </p>
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="w-full bg-white/10 hover:bg-white/20 text-primary-foreground border-white/20"
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};