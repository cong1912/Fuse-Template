import { memo, lazy, Suspense } from 'react';

const QuickPanel = lazy(() => import('app/theme-layouts/shared-components/quickPanel/QuickPanel'));

const NotificationPanel = lazy(() => import('src/app/main/apps/notifications/NotificationPanel'));

const GlobalAiCopilot = lazy(() => import('app/theme-layouts/shared-components/ai/GlobalAiCopilot'));

/**
 * The right side layout 1.
 */
function RightSideLayout1() {
	return (
		<Suspense>
			<QuickPanel />

			<NotificationPanel />

			<GlobalAiCopilot />
		</Suspense>
	);
}

export default memo(RightSideLayout1);
