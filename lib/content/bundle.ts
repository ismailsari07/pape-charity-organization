// What the site needs from app_content_bundle(), parsed like the app does
// (youth-toronto lib/core/content/content_bundle.dart): parsing never throws;
// a required field that is missing or of the wrong type takes the bundled
// defaults' value (defaults.json = the app's assets/content_defaults.json);
// optional fields (links, a secondary name, coordinates) are simply absent,
// because the database omits empty keys. Pure: no I/O, unit-tested.

import defaults from "./defaults.json";

export type I18nText = Partial<Record<"tr" | "en" | "fr", string>>;

export type OpeningHours = { label: I18nText; value: I18nText };

export type MosqueInfo = {
  name: string;
  nameSecondary?: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  lat?: number;
  lng?: number;
  hours: OpeningHours[];
};

export type Features = {
  events: boolean;
  announcements: boolean;
  burialService: boolean;
  marriageService: boolean;
};

// The keys app_content_valid() allows in `links` (pape-admin migrations).
export type Links = Partial<Record<"website" | "donation" | "app_store" | "instagram" | "facebook" | "youtube" | "whatsapp", string>>;

export type Service = {
  id: string;
  kind: "marriage" | "burial" | "info";
  icon: string;
  title: I18nText;
  summary: I18nText;
  body: I18nText;
};

export type Contact = { id: string; name: string; phone: string; email?: string; group: string; position: I18nText };

export type SiteContent = {
  mosque: MosqueInfo;
  links: Links;
  features: Features;
  services: Service[];
  contacts: Contact[];
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const url = (v: unknown): string | undefined => {
  const s = str(v);
  return s && /^https?:\/\//i.test(s) ? s : undefined;
};

function i18n(v: unknown): I18nText {
  if (!isObj(v)) return {};
  const out: I18nText = {};
  for (const k of ["tr", "en", "fr"] as const) {
    const s = str(v[k]);
    if (s) out[k] = s;
  }
  return out;
}
const isEmpty = (t: I18nText) => Object.keys(t).length === 0;

function parseMosque(raw: unknown, fallback: MosqueInfo): MosqueInfo {
  if (!isObj(raw)) return fallback;
  const hours = Array.isArray(raw.hours)
    ? raw.hours
        .filter(isObj)
        .map((h) => ({ label: i18n(h.label), value: i18n(h.value) }))
        .filter((h) => !isEmpty(h.label) && !isEmpty(h.value))
    : fallback.hours;
  return {
    name: str(raw.name) ?? fallback.name,
    nameSecondary: str(raw.name_secondary),
    street: str(raw.street) ?? fallback.street,
    city: str(raw.city) ?? fallback.city,
    postalCode: str(raw.postal_code) ?? fallback.postalCode,
    phone: str(raw.phone) ?? fallback.phone,
    email: str(raw.email) ?? fallback.email,
    lat: num(raw.lat),
    lng: num(raw.lng),
    hours,
  };
}

function parseLinks(raw: unknown): Links {
  if (!isObj(raw)) return {};
  const out: Links = {};
  for (const k of ["website", "donation", "app_store", "instagram", "facebook", "youtube", "whatsapp"] as const) {
    const u = url(raw[k]);
    if (u) out[k] = u;
  }
  return out;
}

// A missing flag means "on" (as in the app's feature_flags.dart).
function parseFeatures(raw: unknown): Features {
  const f = isObj(raw) && isObj(raw.features) ? raw.features : {};
  const on = (k: string) => f[k] !== false;
  return { events: on("events"), announcements: on("announcements"), burialService: on("burial_service"), marriageService: on("marriage_service") };
}

function parseServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObj).flatMap((s) => {
    const id = str(s.id);
    const kind = s.kind === "marriage" || s.kind === "burial" || s.kind === "info" ? s.kind : null;
    if (!id || !kind) return [];
    return [{ id, kind, icon: str(s.icon) ?? "info", title: i18n(s.title), summary: i18n(s.summary), body: i18n(s.body) }];
  });
}

function parseContacts(raw: unknown): Contact[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObj).flatMap((c) => {
    const id = str(c.id);
    const name = str(c.name);
    const phone = str(c.phone);
    if (!id || !name || !phone) return [];
    return [{ id, name, phone, email: str(c.email), group: str(c.group) ?? "", position: i18n(c.position) }];
  });
}

/** Parses a bundle; anything unusable falls back to `fallback` (defaults when omitted). */
export function parseBundle(raw: unknown, fallback?: SiteContent): SiteContent {
  const base = fallback ?? DEFAULT_CONTENT;
  if (!isObj(raw)) return base;
  const content = isObj(raw.content) ? raw.content : {};
  return {
    mosque: parseMosque(content.mosque_info, base.mosque),
    links: "links" in content ? parseLinks(content.links) : base.links,
    features: "app_config" in content ? parseFeatures(content.app_config) : base.features,
    services: Array.isArray(raw.services) ? parseServices(raw.services) : base.services,
    contacts: Array.isArray(raw.contacts) ? parseContacts(raw.contacts) : base.contacts,
  };
}

const EMPTY_MOSQUE: MosqueInfo = { name: "", street: "", city: "", postalCode: "", phone: "", email: "", hours: [] };

export const DEFAULT_CONTENT: SiteContent = (() => {
  const d = defaults as Obj;
  const content = isObj(d.content) ? d.content : {};
  return {
    mosque: parseMosque(content.mosque_info, EMPTY_MOSQUE),
    links: parseLinks(content.links),
    features: parseFeatures(content.app_config),
    services: parseServices(d.services),
    contacts: parseContacts(d.contacts),
  };
})();

/** Google Maps directions to the mosque: coordinates when set, else the address. */
export function directionsUrl(m: MosqueInfo): string {
  const destination = m.lat !== undefined && m.lng !== undefined ? `${m.lat},${m.lng}` : `${m.street}, ${m.city} ${m.postalCode}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
