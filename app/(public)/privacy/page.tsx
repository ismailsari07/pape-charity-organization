import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Gizlilik Politikası",
  description:
    "Pape Camii mobil uygulamasının gizlilik politikası. Privacy Policy for the Pape Mosque mobile application.",
  alternates: {
    canonical: "/privacy",
  },
};

/**
 * Bu sayfanın metni `docs/privacy-policy.md` dosyasının web sürümüdür.
 * Birini güncellerken diğerini de güncelle.
 */

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl lg:text-3xl font-bold mt-12">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-lg max-w-3xl">{children}</p>;
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 text-lg max-w-3xl space-y-1">{children}</ul>;
}

export default function Privacy() {
  return (
    <section className="container flex flex-col gap-3 py-8 lg:py-24">
      <nav className="flex gap-4 text-lg mb-4">
        <a href="#english" className="underline hover:text-green-500 transition-colors">
          English
        </a>
        <a href="#turkce" className="underline hover:text-green-500 transition-colors">
          Türkçe
        </a>
      </nav>

      {/* ---------- English ---------- */}
      <div id="english" className="flex flex-col gap-3 scroll-mt-24">
        <h1 className="text-4xl lg:text-6xl font-bold">Privacy Policy — Pape Mosque App</h1>
        <p className="text-lg font-bold">Last updated: 19 September 2026</p>

        <P>
          This Privacy Policy explains how the Pape Mosque mobile application (&quot;the app&quot;), provided by the
          Turkish Islamic Center Canada (Pape Camii) / Kanada Türk İslam Vakfı (&quot;we&quot;, &quot;us&quot;), handles
          your information.
        </P>
        <P>
          It describes the <span className="font-bold">mobile application</span>. If you have a question about the
          papemosque.ca website, please contact us using the details at the bottom of this page.
        </P>
        <P>
          We keep this simple: the app collects very little, does not track you, and does not share your information
          with advertisers or third parties.
        </P>

        <H2>Information we collect</H2>
        <P>
          <span className="font-bold">Only if you choose to create an account</span>, we collect and store:
        </P>
        <List>
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your phone number</li>
          <li>Your date of birth</li>
        </List>
        <P>
          This information is provided by you during sign-up and is stored securely by our service provider, Supabase.
          It is used only to create and manage your account within the app.
        </P>
        <P>
          <span className="font-bold">You can use the app without an account.</span> Prayer times, prayer reminders,
          events, and announcements are all available without signing in. An account is only needed for features tied
          to your profile.
        </P>

        <H2>Information stored on your device</H2>
        <P>The following are stored only on your device and are never sent to us:</P>
        <List>
          <li>Your prayer reminder preference (on or off)</li>
          <li>The time you last viewed announcements (used to show which announcements are new)</li>
        </List>

        <H2>Prayer reminders</H2>
        <P>
          If you enable prayer reminders, the app schedules local notifications on your device (5 minutes before each
          iqamah). These notifications are generated on your device. We do not send push notifications and we do not
          track whether or when reminders appear.
        </P>

        <H2>Information we do NOT collect</H2>
        <List>
          <li>We do not collect your location.</li>
          <li>We do not use analytics or tracking tools.</li>
          <li>We do not show advertising.</li>
          <li>We do not sell or share your personal information with third parties.</li>
          <li>We do not use your data for advertising or marketing profiling.</li>
        </List>

        <H2>Prayer time data</H2>
        <P>
          Prayer times are provided by the Turkish Presidency of Religious Affairs (Diyanet) calendar and delivered to
          the app through our own server. Retrieving prayer times does not send any personal information about you.
        </P>

        <H2>Deleting your account</H2>
        <P>
          You can permanently delete your account and all associated profile information (name, email, phone, date of
          birth) directly within the app, at any time, from{" "}
          <span className="font-bold">Profile → Settings → Delete account</span>. Deletion is immediate and cannot be
          undone.
        </P>

        <H2>Data retention</H2>
        <P>
          We keep your account information for as long as you have an account. When you delete your account, your
          profile information is permanently removed from our systems.
        </P>

        <H2>Children&apos;s privacy</H2>
        <P>
          The app is intended for a general audience and is not directed at children under 13. We do not knowingly
          collect personal information from children under 13.
        </P>

        <H2>Changes to this policy</H2>
        <P>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date above shows when it was
          last changed.
        </P>

        <H2>Contact us</H2>
        <P>If you have any questions about this Privacy Policy, contact us at:</P>
        <List>
          <li>Turkish Islamic Center Canada (Pape Camii)</li>
          <li>336 Pape Avenue, Toronto, ON M4M 2W7</li>
          <li>
            Phone: <a href="tel:6478342000">647 834 2000</a>
          </li>
          <li>
            Email: <a href="mailto:info@papecami.com">info@papecami.com</a>
          </li>
        </List>
      </div>

      <hr className="my-16 border-foreground/20" />

      {/* ---------- Türkçe ---------- */}
      <div id="turkce" className="flex flex-col gap-3 scroll-mt-24">
        <h1 className="text-4xl lg:text-6xl font-bold">Gizlilik Politikası — Pape Camii Uygulaması</h1>
        <p className="text-lg font-bold">Son güncelleme: 19 Eylül 2026</p>

        <P>
          Bu Gizlilik Politikası, Kanada Türk İslam Vakfı (Pape Camii) (&quot;biz&quot;) tarafından sağlanan Pape Camii
          mobil uygulamasının (&quot;uygulama&quot;) bilgilerinizi nasıl işlediğini açıklar.
        </P>
        <P>
          Politika <span className="font-bold">mobil uygulamayı</span> anlatır. papemosque.ca web sitesiyle ilgili bir
          sorunuz varsa, sayfanın altındaki iletişim bilgilerinden bize ulaşabilirsiniz.
        </P>
        <P>
          Basit tutuyoruz: uygulama çok az veri toplar, sizi takip etmez ve bilgilerinizi reklam verenlerle veya üçüncü
          taraflarla paylaşmaz.
        </P>

        <H2>Topladığımız bilgiler</H2>
        <P>
          <span className="font-bold">Yalnızca bir hesap oluşturmayı seçerseniz</span>, şunları toplar ve saklarız:
        </P>
        <List>
          <li>Adınız</li>
          <li>E-posta adresiniz</li>
          <li>Telefon numaranız</li>
          <li>Doğum tarihiniz</li>
        </List>
        <P>
          Bu bilgiler kayıt sırasında sizin tarafınızdan sağlanır ve hizmet sağlayıcımız Supabase tarafından güvenli
          şekilde saklanır. Yalnızca uygulama içindeki hesabınızı oluşturmak ve yönetmek için kullanılır.
        </P>
        <P>
          <span className="font-bold">Uygulamayı hesap olmadan kullanabilirsiniz.</span> Namaz vakitleri, namaz
          hatırlatmaları, etkinlikler ve duyurular giriş yapmadan da kullanılabilir. Hesap yalnızca profilinize bağlı
          özellikler için gereklidir.
        </P>

        <H2>Cihazınızda saklanan bilgiler</H2>
        <P>Aşağıdakiler yalnızca cihazınızda saklanır ve bize hiçbir zaman gönderilmez:</P>
        <List>
          <li>Namaz hatırlatma tercihiniz (açık veya kapalı)</li>
          <li>Duyuruları en son görüntülediğiniz zaman (hangi duyuruların yeni olduğunu göstermek için kullanılır)</li>
        </List>

        <H2>Namaz hatırlatmaları</H2>
        <P>
          Namaz hatırlatmalarını etkinleştirirseniz, uygulama cihazınızda yerel bildirimler planlar (her iqamet
          vaktinden 5 dakika önce). Bu bildirimler cihazınızda oluşturulur. Push bildirimi göndermiyoruz ve
          hatırlatmaların görünüp görünmediğini takip etmiyoruz.
        </P>

        <H2>Toplamadığımız bilgiler</H2>
        <List>
          <li>Konumunuzu toplamıyoruz.</li>
          <li>Analitik veya takip araçları kullanmıyoruz.</li>
          <li>Reklam göstermiyoruz.</li>
          <li>Kişisel bilgilerinizi üçüncü taraflarla satmıyor veya paylaşmıyoruz.</li>
          <li>Verilerinizi reklam veya pazarlama profillemesi için kullanmıyoruz.</li>
        </List>

        <H2>Namaz vakti verileri</H2>
        <P>
          Namaz vakitleri, Diyanet İşleri Başkanlığı takvimi tarafından sağlanır ve uygulamaya kendi sunucumuz
          aracılığıyla ulaştırılır. Namaz vakitlerini almak, sizinle ilgili herhangi bir kişisel bilgi göndermez.
        </P>

        <H2>Hesabınızı silme</H2>
        <P>
          Hesabınızı ve ilişkili tüm profil bilgilerinizi (ad, e-posta, telefon, doğum tarihi) istediğiniz zaman
          doğrudan uygulama içinden <span className="font-bold">Profil → Ayarlar → Hesabı sil</span> yolundan kalıcı
          olarak silebilirsiniz. Silme işlemi anında gerçekleşir ve geri alınamaz.
        </P>

        <H2>Veri saklama</H2>
        <P>
          Hesap bilgilerinizi hesabınız var olduğu sürece saklarız. Hesabınızı sildiğinizde, profil bilgileriniz
          sistemlerimizden kalıcı olarak kaldırılır.
        </P>

        <H2>Çocukların gizliliği</H2>
        <P>
          Uygulama genel bir kitleye yöneliktir ve 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki
          çocuklardan bilerek kişisel bilgi toplamayız.
        </P>

        <H2>Bu politikadaki değişiklikler</H2>
        <P>
          Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Yukarıdaki &quot;Son güncelleme&quot; tarihi, en son
          ne zaman değiştirildiğini gösterir.
        </P>

        <H2>Bize ulaşın</H2>
        <P>Bu Gizlilik Politikası hakkında sorularınız varsa bize ulaşın:</P>
        <List>
          <li>Kanada Türk İslam Vakfı (Pape Camii)</li>
          <li>336 Pape Avenue, Toronto, ON M4M 2W7</li>
          <li>
            Telefon: <a href="tel:6478342000">647 834 2000</a>
          </li>
          <li>
            E-posta: <a href="mailto:info@papecami.com">info@papecami.com</a>
          </li>
        </List>
      </div>
    </section>
  );
}
