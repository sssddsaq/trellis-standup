create table if not exists clickup_settings (
  id int primary key default 1,
  workspace_id text not null,
  channel_id text not null,
  updated_at timestamptz not null default now(),
  constraint clickup_settings_single_row check (id = 1)
);

alter table clickup_settings enable row level security;

insert into clickup_settings (id, workspace_id, channel_id)
values (1, '9013744454', '6-901327476573-8')
on conflict (id) do update
set workspace_id = excluded.workspace_id,
    channel_id = excluded.channel_id,
    updated_at = now();
