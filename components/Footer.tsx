import {
  FacebookIcon,
  GithubIcon,
  LocateIcon,
  MailIcon,
  PhoneCall,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex flex-col items-start gap-3 px-4 py-12 lg:p-24">
      <div className="container flex flex-col items-start gap-3">
        <Link href="/" className="text-bold text-2xl">
          <Image
            src={"/logo.jpeg"}
            width={175}
            height={175}
            alt="logo"
            className="rounded-2xl border-2 border-amber-50 mb-5"
          />
        </Link>
        <h2 className="text-5xl font-semibold">Kanada Türk İslam Vakfı</h2>
        <p className="md:w-1/3 text-lg">
          Herkes, dualarımıza, programlarımıza ve topluluk buluşmalarımıza
          katılmaya davetlidir. Kapsayıcı manevi ailemizin sıcaklığını yaşayın.
        </p>
        <Button variant={"secondary"}>
          <Link href={"donation"}>Destekte Bulunun</Link>
        </Button>
        <div className="w-full flex flex-col md:flex-row justify-between items-start max-md:gap-5 my-8">
          {/* Follow Us */}
          <div>
            <h4 className="font-semibold mb-3">Bizi Takip Edin</h4>
            <div className="flex space-x-3 text-xl text-gray-700">
              <GithubIcon />
              <TwitterIcon />
              <FacebookIcon />
              <YoutubeIcon />
            </div>

            <h4 className="font-semibold mt-6 mb-2"></h4>
            <ul className="space-y-1">
              <li className="flex gap-2">
                <LocateIcon />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=336+Pape+Avenue,+Toronto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  336 Pape Avenue, Toronto
                </a>
              </li>
              <li className="flex gap-2">
                <PhoneCall />
                <a href="tel:6478342000">647 834 2000</a>
              </li>
              <li className="flex gap-2">
                <MailIcon />
                <a href="mailto:info@papecami.com">info@papecami.com</a>
              </li>
            </ul>
          </div>

          {/* Yardım */}
          <div>
            <h4 className="font-semibold md:mb-3">Hızlı Erişim</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/about"
                  className="hover:text-green-500 transition-colors"
                >
                  Derneğimiz
                </Link>
              </li>
              <li>
                <Link
                  href="/service"
                  className="hover:text-green-500 transition-colors"
                >
                  Hizmetlerimiz
                </Link>
              </li>
              <li>
                <Link
                  href="/donation"
                  className="hover:text-green-500 transition-colors"
                >
                  Bağış
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-500 transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="font-semibold">❤️ ile yapıldı.</p>
      </div>
    </footer>
  );
}
