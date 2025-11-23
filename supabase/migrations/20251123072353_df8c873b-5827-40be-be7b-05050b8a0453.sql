-- Remove UPDATE policy on subscriptions table to prevent users from modifying their own subscription data
-- Subscriptions should only be modified by secure edge functions after payment verification
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;