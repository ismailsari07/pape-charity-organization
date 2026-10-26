"use client";

import { useEffect } from "react";
import { initReveal } from "@/lib/reveal";

export default function RevealOnNavigate() {
  useEffect(() => {
    initReveal();
  }, []);
  return null;
}
