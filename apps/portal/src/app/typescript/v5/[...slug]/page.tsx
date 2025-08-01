import notFound from "../../../not-found";
import { fetchTypeScriptDoc } from "../../../references/components/TDoc/fetchDocs/fetchTypeScriptDoc";
import { RootTDoc } from "../../../references/components/TDoc/Root";
import { getSlugToDocMap } from "../../../references/components/TDoc/utils/slugs";

type PageProps = { params: Promise<{ slug: string[] }> };

export default async function Page(props: PageProps) {
  const doc = await fetchTypeScriptDoc();
  const slugToDoc = getSlugToDocMap(doc);
  const docSlug = (await props.params).slug?.join("/");

  if (!docSlug) {
    notFound();
  }

  // API page
  const selectedDoc =
    docSlug && (slugToDoc[docSlug] || slugToDoc[`common/${docSlug}`]);

  if (selectedDoc) {
    return (
      <div>
        <RootTDoc doc={selectedDoc} />
      </div>
    );
  }

  notFound();
}
