-- Set explicit search_path for security definer functions
ALTER FUNCTION public.get_job_with_application_count(uuid) SET search_path TO 'public';
ALTER FUNCTION public.can_apply_to_job(uuid) SET search_path TO 'public';
ALTER FUNCTION public.create_user_wallet() SET search_path TO 'public';
ALTER FUNCTION public.expire_old_jobs() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_notifications() SET search_path TO 'public';
ALTER FUNCTION public.create_achievement_notification(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.create_job_notification(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path TO 'public';
ALTER FUNCTION public.update_user_last_login() SET search_path TO 'public';
ALTER FUNCTION public.log_user_activity(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_online_users_count() SET search_path TO 'public';
ALTER FUNCTION public.is_user_online(uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
