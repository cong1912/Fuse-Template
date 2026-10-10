import React, { useState, useEffect } from 'react';
import AiCopilotDrawer from 'src/app/main/dashboards/analytics/AiCopilotDrawer';

export const toggleGlobalAiCopilot = (prompt?: string) => {
	window.dispatchEvent(new CustomEvent('toggle-global-ai-copilot', { detail: { prompt } }));
};

export const openGlobalAiCopilot = (prompt?: string) => {
	window.dispatchEvent(new CustomEvent('open-global-ai-copilot', { detail: { prompt } }));
};

export default function GlobalAiCopilot() {
	const [open, setOpen] = useState(false);
	const [prompt, setPrompt] = useState<string | undefined>();

	useEffect(() => {
		const handleToggle = (e: any) => {
			setOpen((prev) => !prev);
			if (e.detail?.prompt) {
				setPrompt(e.detail.prompt);
			}
		};
		const handleOpen = (e: any) => {
			setOpen(true);
			if (e.detail?.prompt) {
				setPrompt(e.detail.prompt);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.altKey && (e.key === 'a' || e.key === 'A')) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		window.addEventListener('toggle-global-ai-copilot', handleToggle);
		window.addEventListener('open-global-ai-copilot', handleOpen);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('toggle-global-ai-copilot', handleToggle);
			window.removeEventListener('open-global-ai-copilot', handleOpen);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<AiCopilotDrawer
			open={open}
			onClose={() => setOpen(false)}
			initialPrompt={prompt}
		/>
	);
}
