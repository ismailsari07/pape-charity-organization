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
  return <h2 className="mt-12 text-2xl font-extrabold tracking-[-0.5px] text-pm-text md:text-[28px]">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-[17px] leading-[1.7] text-pm-text-2">{children}</p>;
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="max-w-3xl list-disc space-y-1.5 pl-6 text-[17px] leading-[1.7] text-pm-text-2 marker:text-pm-mint">{children}</ul>;
}

export default function Privacy() {
  return (
    <section className="mx-auto flex max-w-[1248px] flex-col gap-3 px-6 pt-14">
      <nav className="mb-6 flex gap-2">
        <a href="#english" className="rounded-full border border-pm-line bg-pm-card px-4 py-2 text-[15px] font-semibold text-pm-mint transition-colors hover:text-pm-mint-hover">
          English
        </a>
        <a href="#turkce" className="rounded-full border border-pm-line bg-pm-card px-4 py-2 text-[15px] font-semibold text-pm-mint transition-colors hover:text-pm-mint-hover">
          Türkçe
        </a>
      </nav>

      {/* ---------- English ---------- */}
      <div id="english" className="flex flex-col gap-3 scroll-mt-24">
        <h1 className="text-[40px] leading-tight font-extrabold tracking-[-1px] text-pm-text md:text-[48px]">Privacy Policy — Pape Mosque App</h1>
        <p className="text-[15px] font-bold text-pm-mint">Last updated: 19 October 2026</p>

        <P>
          This Privacy Policy explains how the Pape Mosque mobile application (&quot;the app&quot;), provided by the
          Turkish Islamic Center Canada (Pape Camii) / Kanada Türk İslam Vakfı (&quot;we&quot;, &quot;us&quot;), handles
          your information.
        </P>
        <P>
          It describes the <span className="font-bold text-pm-text">mobile application</span>. If you have a question about the
          papemosque.ca website, please contact us using the details at the bottom of this page.
        </P>
        <P>
          We keep this simple: the app collects only what its features need, does not track you, does not show
          advertising, and does not sell your information.
        </P>

        <H2>Information we collect</H2>
        <P>
          <span className="font-bold text-pm-text">Only if you choose to create an account</span>, we collect and store your
          profile information:
        </P>
        <List>
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your phone number (optional)</li>
          <li>Your date of birth (optional)</li>
        </List>
        <P>
          You can sign up with an email address and password, or with Sign in with Apple. If you use Sign in with
          Apple, we receive the name and email address that Apple shares with us. If you choose to hide your email,
          this is a private relay address created by Apple.
        </P>
        <P>
          This information is stored securely by our service provider, Supabase. It is used to create and manage your
          account and to provide the features described below.
        </P>
        <P>
          <span className="font-bold text-pm-text">You can use the app without an account.</span> Prayer times, prayer reminders,
          events, and announcements are all available without signing in. An account is only needed for features tied
          to your profile.
        </P>

        <H2>Event registration</H2>
        <P>
          When you register for an event, we store your answers to that event&apos;s registration form together with
          your name, email address and phone number. Only authorized mosque administrators can see registrations, and
          they may export them to organize and run the event.
        </P>
        <P>
          Registrations cannot be cancelled in the app. To change or cancel a registration, please contact us using the
          details at the bottom of this page.
        </P>

        <H2>Marriage service</H2>
        <P>
          If you use the marriage service, you may upload a CV or other document. It is stored privately and can be
          seen only by you and authorized mosque administrators.
        </P>

        <H2>Event views</H2>
        <P>
          When you open an event, we record that it was viewed (once per user or device) so we can show an approximate
          view count for the event.
        </P>

        <H2>Information stored on your device</H2>
        <P>The following are stored only on your device and are never sent to us:</P>
        <List>
          <li>Your prayer reminder preference (on or off)</li>
          <li>The time you last viewed announcements (used to show which announcements are new)</li>
        </List>

        <H2>Push notifications</H2>
        <P>
          If you allow notifications, we store a push token for your device (from Firebase Cloud Messaging) and your
          notification settings. We use them to send you notifications about events, announcements and prayer time
          data. You can turn notifications off at any time in the app or in your device&apos;s iOS Settings.
        </P>

        <H2>Prayer reminders</H2>
        <P>
          If you enable prayer reminders, the app schedules local notifications on your device. These reminders are
          generated on your device, and we do not track whether or when they appear.
        </P>

        <H2>Donations</H2>
        <P>
          Donations are made on our website, papemosque.ca, and processed by Stripe. The app only opens the website;
          it does not collect or process any payment information itself.
        </P>

        <H2>Information we do NOT collect</H2>
        <List>
          <li>We do not collect your location.</li>
          <li>We do not track you across other companies&apos; apps or websites.</li>
          <li>We do not show advertising.</li>
          <li>We do not sell your personal information.</li>
          <li>We do not use your data for advertising or marketing profiling.</li>
        </List>

        <H2>Service providers</H2>
        <P>
          We share information only with the service providers we use to run the app, and only as needed for them to
          provide their service to us:
        </P>
        <List>
          <li>Supabase: database, sign-in and file storage</li>
          <li>Firebase Cloud Messaging (Google): push notifications</li>
          <li>Apple: Sign in with Apple</li>
          <li>Stripe: donations made on our website</li>
        </List>

        <H2>Prayer time data</H2>
        <P>
          Prayer times are provided by the Turkish Presidency of Religious Affairs (Diyanet) calendar and delivered to
          the app through our own server. Retrieving prayer times does not send any personal information about you.
        </P>

        <H2>Deleting your account</H2>
        <P>
          You can delete your account at any time directly within the app, from{" "}
          <span className="font-bold text-pm-text">Profile → Delete account</span>. This permanently deletes your account and its
          personal data. If you signed in with Apple, we also revoke the Apple sign-in token for the app. Deletion
          cannot be undone.
        </P>

        <H2>Data retention</H2>
        <P>
          We keep your account information for as long as you have an account. When you delete your account, your
          account and its personal data are permanently removed from our systems.
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
            Phone: <a href="tel:6478342000" className="text-pm-mint transition-colors hover:text-pm-mint-hover">647 834 2000</a>
          </li>
          <li>
            Email: <a href="mailto:info@papecami.com" className="text-pm-mint transition-colors hover:text-pm-mint-hover">info@papecami.com</a>
          </li>
        </List>
      </div>

      <hr className="my-16 border-pm-line" />

      {/* ---------- Türkçe ---------- */}
      <div id="turkce" className="flex flex-col gap-3 scroll-mt-24">
        <h1 className="text-[40px] leading-tight font-extrabold tracking-[-1px] text-pm-text md:text-[48px]">Gizlilik Politikası — Pape Camii Uygulaması</h1>
        <p className="text-[15px] font-bold text-pm-mint">Son güncelleme: 19 Ekim 2026</p>

        <P>
          Bu Gizlilik Politikası, Kanada Türk İslam Vakfı (Pape Camii) (&quot;biz&quot;) tarafından sağlanan Pape Camii
          mobil uygulamasının (&quot;uygulama&quot;) bilgilerinizi nasıl işlediğini açıklar.
        </P>
        <P>
          Politika <span className="font-bold text-pm-text">mobil uygulamayı</span> anlatır. papemosque.ca web sitesiyle ilgili bir
          sorunuz varsa, sayfanın altındaki iletişim bilgilerinden bize ulaşabilirsiniz.
        </P>
        <P>
          Basit tutuyoruz: uygulama yalnızca özelliklerinin ihtiyaç duyduğu bilgileri toplar, sizi takip etmez, reklam
          göstermez ve bilgilerinizi satmaz.
        </P>

        <H2>Topladığımız bilgiler</H2>
        <P>
          <span className="font-bold text-pm-text">Yalnızca bir hesap oluşturmayı seçerseniz</span>, şu profil bilgilerinizi toplar
          ve saklarız:
        </P>
        <List>
          <li>Adınız</li>
          <li>E-posta adresiniz</li>
          <li>Telefon numaranız (isteğe bağlı)</li>
          <li>Doğum tarihiniz (isteğe bağlı)</li>
        </List>
        <P>
          E-posta adresi ve şifreyle ya da Apple ile Giriş Yap (Sign in with Apple) ile kayıt olabilirsiniz. Apple ile
          giriş yaparsanız, Apple&apos;ın bizimle paylaştığı ad ve e-posta adresini alırız. E-postanızı gizlemeyi
          seçerseniz bu, Apple tarafından oluşturulan özel bir yönlendirme (private relay) adresidir.
        </P>
        <P>
          Bu bilgiler hizmet sağlayıcımız Supabase tarafından güvenli şekilde saklanır. Hesabınızı oluşturmak ve
          yönetmek ve aşağıda anlatılan özellikleri sunmak için kullanılır.
        </P>
        <P>
          <span className="font-bold text-pm-text">Uygulamayı hesap olmadan kullanabilirsiniz.</span> Namaz vakitleri, namaz
          hatırlatmaları, etkinlikler ve duyurular giriş yapmadan da kullanılabilir. Hesap yalnızca profilinize bağlı
          özellikler için gereklidir.
        </P>

        <H2>Etkinlik kaydı</H2>
        <P>
          Bir etkinliğe kayıt olduğunuzda, o etkinliğin kayıt formuna verdiğiniz cevapları adınız, e-posta adresiniz
          ve telefon numaranızla birlikte saklarız. Kayıtları yalnızca yetkili cami yöneticileri görebilir ve
          etkinliği düzenlemek ve yürütmek için dışa aktarabilirler.
        </P>
        <P>
          Kayıtlar uygulama içinden iptal edilemez. Bir kaydı değiştirmek veya iptal etmek için sayfanın altındaki
          iletişim bilgilerinden bize ulaşabilirsiniz.
        </P>

        <H2>Evlilik hizmeti</H2>
        <P>
          Evlilik hizmetini kullanırsanız bir CV veya başka bir belge yükleyebilirsiniz. Bu belge gizli olarak saklanır
          ve yalnızca siz ve yetkili cami yöneticileri tarafından görülebilir.
        </P>

        <H2>Etkinlik görüntülemeleri</H2>
        <P>
          Bir etkinliği açtığınızda, etkinlik için yaklaşık bir görüntülenme sayısı gösterebilmek amacıyla etkinliğin
          görüntülendiğini kaydederiz (kullanıcı veya cihaz başına bir kez).
        </P>

        <H2>Cihazınızda saklanan bilgiler</H2>
        <P>Aşağıdakiler yalnızca cihazınızda saklanır ve bize hiçbir zaman gönderilmez:</P>
        <List>
          <li>Namaz hatırlatma tercihiniz (açık veya kapalı)</li>
          <li>Duyuruları en son görüntülediğiniz zaman (hangi duyuruların yeni olduğunu göstermek için kullanılır)</li>
        </List>

        <H2>Anlık (push) bildirimler</H2>
        <P>
          Bildirimlere izin verirseniz, cihazınız için bir push token&apos;ı (Firebase Cloud Messaging&apos;den) ve
          bildirim ayarlarınızı saklarız. Bunları size etkinlikler, duyurular ve namaz vakti verileriyle ilgili
          bildirimler göndermek için kullanırız. Bildirimleri istediğiniz zaman uygulama içinden veya cihazınızın iOS
          Ayarları&apos;ndan kapatabilirsiniz.
        </P>

        <H2>Namaz hatırlatmaları</H2>
        <P>
          Namaz hatırlatmalarını etkinleştirirseniz, uygulama cihazınızda yerel bildirimler planlar. Bu hatırlatmalar
          cihazınızda oluşturulur ve görünüp görünmediklerini takip etmiyoruz.
        </P>

        <H2>Bağışlar</H2>
        <P>
          Bağışlar web sitemiz papemosque.ca üzerinden yapılır ve Stripe tarafından işlenir. Uygulama yalnızca web
          sitesini açar; ödeme bilgisi toplamaz veya işlemez.
        </P>

        <H2>Toplamadığımız bilgiler</H2>
        <List>
          <li>Konumunuzu toplamıyoruz.</li>
          <li>Sizi başka şirketlerin uygulamaları veya web siteleri arasında takip etmiyoruz.</li>
          <li>Reklam göstermiyoruz.</li>
          <li>Kişisel bilgilerinizi satmıyoruz.</li>
          <li>Verilerinizi reklam veya pazarlama profillemesi için kullanmıyoruz.</li>
        </List>

        <H2>Hizmet sağlayıcılar</H2>
        <P>
          Bilgilerinizi yalnızca uygulamayı çalıştırmak için kullandığımız hizmet sağlayıcılarla ve yalnızca bize
          hizmet verebilmeleri için gerektiği kadar paylaşırız:
        </P>
        <List>
          <li>Supabase: veritabanı, giriş ve dosya depolama</li>
          <li>Firebase Cloud Messaging (Google): anlık bildirimler</li>
          <li>Apple: Apple ile Giriş Yap</li>
          <li>Stripe: web sitemiz üzerinden yapılan bağışlar</li>
        </List>

        <H2>Namaz vakti verileri</H2>
        <P>
          Namaz vakitleri, Diyanet İşleri Başkanlığı takvimi tarafından sağlanır ve uygulamaya kendi sunucumuz
          aracılığıyla ulaştırılır. Namaz vakitlerini almak, sizinle ilgili herhangi bir kişisel bilgi göndermez.
        </P>

        <H2>Hesabınızı silme</H2>
        <P>
          Hesabınızı istediğiniz zaman doğrudan uygulama içinden{" "}
          <span className="font-bold text-pm-text">Profil → Hesabı sil</span> yolundan silebilirsiniz. Bu işlem hesabınızı ve
          hesabınıza ait kişisel verileri kalıcı olarak siler. Apple ile giriş yaptıysanız, uygulamaya ait Apple giriş
          token&apos;ını da iptal ederiz. Silme işlemi geri alınamaz.
        </P>

        <H2>Veri saklama</H2>
        <P>
          Hesap bilgilerinizi hesabınız var olduğu sürece saklarız. Hesabınızı sildiğinizde, hesabınız ve hesabınıza
          ait kişisel veriler sistemlerimizden kalıcı olarak kaldırılır.
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
            Telefon: <a href="tel:6478342000" className="text-pm-mint transition-colors hover:text-pm-mint-hover">647 834 2000</a>
          </li>
          <li>
            E-posta: <a href="mailto:info@papecami.com" className="text-pm-mint transition-colors hover:text-pm-mint-hover">info@papecami.com</a>
          </li>
        </List>
      </div>
    </section>
  );
}
