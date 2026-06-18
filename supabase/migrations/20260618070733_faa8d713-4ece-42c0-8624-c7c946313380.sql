
-- Explicit deny UPDATE on subscriptions for client roles
REVOKE UPDATE ON public.subscriptions FROM anon, authenticated, PUBLIC;

-- Explicit deny INSERT/UPDATE/DELETE on user_roles for client roles
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated, PUBLIC;

-- Lock down SECURITY DEFINER functions: remove EXECUTE from public/anon/authenticated.
-- These functions are only used by triggers (handle_new_user, update_updated_at_column)
-- or invoked server-side, not callable directly via the Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
