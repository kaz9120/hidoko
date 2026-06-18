import { LegalPage } from "~/components/layout/legal-page";
import {
	TERMS_LAST_UPDATED,
	TermsContent,
} from "~/components/legal/terms-content";

export function meta() {
	return [
		{ title: "利用規約 | snapcrop" },
		{ name: "description", content: "snapcrop の利用規約" },
		{ property: "og:title", content: "利用規約 | snapcrop" },
		{ property: "og:description", content: "snapcrop の利用規約" },
		{ property: "og:type", content: "article" },
		{ property: "og:site_name", content: "snapcrop" },
		{ name: "twitter:card", content: "summary" },
	];
}

export default function Terms() {
	return (
		<LegalPage lastUpdated={TERMS_LAST_UPDATED} title="利用規約">
			<TermsContent />
		</LegalPage>
	);
}
