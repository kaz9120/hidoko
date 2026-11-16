import { useEffect } from "react";

export function useEmbers() {
	useEffect(() => {
		import("takibi-design-system/embers").catch((error) => {
			console.error("Failed to load <takibi-embers>", error);
		});
	}, []);
}
