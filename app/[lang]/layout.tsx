import { getDictionary, Lang } from "@/actions/dictionaries";
import { Navigation } from "@/components/layout/navigation";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const validLang: Lang = (lang === 'es' ? 'es' : 'en');
  const dict = await getDictionary(validLang);

  return (
    <>
      <Navigation dict={{ navigation: dict.navigation, auth: dict.auth }} lang={validLang} />
      {children}
    </>
  );
}