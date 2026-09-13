'use client'

import { LocateIcon, LucideMailbox } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function Contact() {
    const container = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.section 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      id="contact"
      className="container flex flex-col items-start lg:items-center gap-3 py-8 lg:py-32"
    >
      <motion.p className="text-4xl lg:text-6xl font-bold" variants={item}>Bize Ulaşın</motion.p>
      <motion.p className="" variants={item}>
        Her türlü soru, öneri ve bilgi için bizimle telefon veya e-posta yoluyla
        iletişime geçebilirsiniz.
      </motion.p>

      <motion.div className="flex items-center gap-2 text-green-500 font-semibold text-lg mt-5" variants={item}>
        <LucideMailbox size={16} />{" "}
        <a href="mailto:info@papecami.com" className="underline">
          info@papecami.com
        </a>
      </motion.div>
      <motion.div className="flex items-center gap-2 text-green-500 font-semibold text-lg" variants={item}>
        <LocateIcon size={16} />{" "}
        <a href="#" className="underline">
          336 Pape Avenue, Toronto, ON M4M 2W7
        </a>
      </motion.div>
    </motion.section>
  );
}
