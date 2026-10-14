-- Donations · drop the old funds table
--
-- Apply only AFTER the website branch fix/stripe-donations is deployed (its
-- admin list reads donation_funds, not funds). Follow-up to
-- 20261017120000_donations_consolidate.sql, which moved donations.fund_code's
-- FK to donation_funds(slug) and copied color/ramadan_only over. Nothing
-- else depends on funds (checked 2026-10-14). Its policies drop with it.

drop table public.funds;
