insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible" on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users can upload avatar images" on storage.objects
  for insert
  with check (bucket_id = 'avatars');

create policy "Users can update avatar images" on storage.objects
  for update
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');
