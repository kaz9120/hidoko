import { LegalPage } from "~/components/layout/legal-page";
import {
	TERMS_LAST_UPDATED,
	TermsContent,
} from "~/components/legal/terms-content";

export function meta() {
	return [
		{ title: "利用規約 | snapcrop" },
		{
			name: "description",
			content: "snapcrop の利用規約",
		},
	];
}

export default function Terms() {
	return (
		<LegalPage lastUpdated={TERMS_LAST_UPDATED} title="利用規約">
			<TermsContent />
		</LegalPage>
	);
}
