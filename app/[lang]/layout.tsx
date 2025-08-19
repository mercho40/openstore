import { getDictionary, Lang } from "@/actions/dictionaries";
import { Navigation } from "@/components/layout/navigation";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navigation dict={{ navigation: dict.navigation, auth: dict.auth }} lang={lang} />
      {children}
    </>
  );
}