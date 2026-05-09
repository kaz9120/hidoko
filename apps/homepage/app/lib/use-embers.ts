import { useEffect } from "react";

export function useEmbers() {
	useEffect(() => {
		import("design-system/embers").catch((error) => {
			console.error("Failed to load <hi-embers>", error);
		});
	}, []);
}
