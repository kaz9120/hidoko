import { useEffect } from "react";

export function useEmbers() {
	useEffect(() => {
		import("ui/embers").catch((error) => {
			console.error("Failed to load <hi-embers>", error);
		});
	}, []);
}
