"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, PanelLeft } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex justify-between md:justify-evenly items-center p-6 text-lg">
      <Link href="/" className="text-bold text-2xl">
        <Image
          src={"/logo.jpeg"}
          width={75}
          height={75}
          alt="logo"
          className="rounded-2xl border-2 border-amber-50"
        />
      </Link>

      <div className="hidden md:flex items-center gap-4">
        <Link href={"/about"}>Derneğimiz</Link>
        <Link href={"/service"}>Hizmetlerimiz</Link>
        <Link href={"/announcements"}>Duyurular</Link>
        <Link href={"/donation"}>Bağış</Link>
        <Link href={"/contact"}>İletişim</Link>
      </div>

      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"ghost"}>
              <PanelLeft size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Hızlı Erişim</SheetTitle>
              <SheetDescription>
                Tüm sayfalarımıza kolayca ulaşmak için menüyü kullanın.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col items-center gap-4">
              <SheetClose asChild>
                <Link href={"/about"}>Dernegimiz</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={"/service"}>Hizmetlerimiz</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={"/announcements"}>Duyurular</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={"/donation"}>Bagis</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={"/contact"}>Iletisim</Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Link href={"/donation"} className="hidden md:block">
        <Button className="max-md:text-sm">
          Destekte Bulunun <ArrowRight size={16} />
        </Button>
      </Link>
    </nav>
  );
}
