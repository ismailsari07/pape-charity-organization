import { Button } from "@/components/ui/button";
import { DownloadIcon, GithubIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
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
    <motion.header
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      id="header"
      className="flex flex-col items-center gap-6 lg:gap-12 text-center py-8 lg:py-32"
    >
      <div className="w-full flex flex-col md:flex-row justify-between gap-12 items-center mb-12">
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
          <h1 className="text-5xl md:text-8xl">
            <motion.span variants={item} className="text-[#E30A17]">
              Kanada Türk
            </motion.span>
            <br /> <motion.span variants={item}>İslam Vakfı</motion.span>
          </h1>
          <motion.p variants={item} className="px-0 text-center">
            Toplumumuza manevi gelişim, kültürel bağ ve hayatın her evresinde <br /> destek sunarak hizmet veriyoruz.
          </motion.p>
          <div className="flex flex-col lg:flex-row gap-4">
            <motion.div variants={item}>
              <Link href="#prayer-times">
                <Button className="max-md:text-sm">Namaz Vakitleri</Button>
              </Link>
            </motion.div>
            <motion.div variants={item}>
              <Link href="#services">
                <Button className="max-md:text-sm">Hizmetler ve Etkinlikler</Button>
              </Link>
            </motion.div>
          </div>
          <div className="flex">
            <motion.div variants={item}>
              <Button size="icon" variant="ghost" className="opacity-70">
                <InstagramIcon />
              </Button>
            </motion.div>
            <motion.div variants={item}>
              <Button size="icon" variant="ghost" className="opacity-70">
                <GithubIcon />
              </Button>
            </motion.div>
            <motion.div variants={item}>
              <Button size="icon" variant="ghost" className="opacity-70">
                <TwitterIcon />
              </Button>
            </motion.div>
            <motion.div variants={item}>
              <Button size="icon" variant="ghost" className="opacity-70">
                <YoutubeIcon />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
          <motion.div variants={item} className="flex flex-col lg:flex-row gap-4">
            <Image
              src="/imsakiye2026.jpeg"
              alt="Toronto Imsakiyesi"
              width={400}
              height={600}
              className="border border-neutral-50 rounded-xl"
            />
          </motion.div>

          <motion.div variants={item}>
            <a href="/imsakiye2026.jpeg" download="Toronto_Imsakiye_2026.jpeg">
              <Button className="max-md:text-sm w-full">
                <DownloadIcon />
                Imsakiyeyi İndir
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      <motion.video variants={item} className="w-fit rounded-xl" autoPlay muted loop>
        <source src="/media/ayasofya.webm" type="video/webm" />
        Your browser does not support the video
      </motion.video>
    </motion.header>
  );
}
