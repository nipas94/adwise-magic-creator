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
    if (!subscription) return;

    try {
      // Mock upgrade - in production this would integrate with Stripe
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan: 'monthly',
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .eq('user_id', subscription.user_id);

      if (error) throw error;

      // Update role to paid
      await supabase
        .from('user_roles')
        .update({ role: 'paid' })
        .eq('user_id', subscription.user_id);

      await refreshSubscription();

      toast({
        title: "Upgrade Successful! 🎉",
        description: "You now have access to the Weekly Content Generator!",
      });
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'active',
          expires_at: null,
        })
        .eq('user_id', subscription.user_id);

      if (error) throw error;

      // Update role to free
      await supabase
        .from('user_roles')
        .update({ role: 'free' })
        .eq('user_id', subscription.user_id);

      await refreshSubscription();

      toast({
        title: "Subscription Cancelled",
        description: "You've been downgraded to the free plan.",
      });
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
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