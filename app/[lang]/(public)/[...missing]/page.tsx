import { notFound } from "next/navigation";

// With the root layout under [lang], unknown URLs need a route to reach the 404 page.
export default function Missing() {
  notFound();
}
