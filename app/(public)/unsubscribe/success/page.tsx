import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnsubscribeSuccess({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Abonelikten Çıkıldı</h1>

        {email && (
          <p className="text-neutral-600 mb-6">
            <span className="font-medium">{email}</span> adresi başarıyla duyuru listemizden çıkarıldı.
          </p>
        )}

        <p className="text-neutral-500 text-sm mb-8">
          Artık bizden email duyuruları almayacaksınız. Kararınızı değiştirirseniz, tekrar abone olabilirsiniz.
        </p>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">Ana Sayfaya Dön</Button>
          </Link>

          <Link href="/subscribe">
            <Button variant="outline" className="w-full">
              Tekrar Abone Ol
            </Button>
          </Link>
        </div>

        <p className="text-xs text-neutral-400 mt-6">
          Hatalı bir işlem olduğunu düşünüyorsanız, lütfen bizimle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
