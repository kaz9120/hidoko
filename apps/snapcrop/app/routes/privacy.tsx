import { LegalPage } from "~/components/layout/legal-page";
import {
	PRIVACY_LAST_UPDATED,
	PrivacyContent,
} from "~/components/legal/privacy-content";

export function meta() {
	return [
		{ title: "プライバシーポリシー | snapcrop" },
		{
			name: "description",
			content: "snapcrop のプライバシーポリシー",
		},
	];
}

export default function Privacy() {
	return (
		<LegalPage lastUpdated={PRIVACY_LAST_UPDATED} title="プライバシーポリシー">
			<PrivacyContent />
		</LegalPage>
	);
}
