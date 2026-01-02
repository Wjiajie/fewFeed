-- Migration number: 0001_add_missing_auth_fields
ALTER TABLE accounts ADD COLUMN oauth_token TEXT;
ALTER TABLE accounts ADD COLUMN oauth_token_secret TEXT;
