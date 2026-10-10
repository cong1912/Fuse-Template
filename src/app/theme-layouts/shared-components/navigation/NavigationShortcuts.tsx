import { useSelector } from 'react-redux';
import { useAppDispatch } from 'app/store/store';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import { selectIsUserGuest, selectUserShortcuts, setUserShortcuts } from 'src/app/auth/user/store/userSlice';
import { usePrevious } from '@fuse/hooks';
import { useEffect, useRef } from 'react';
import _ from '@lodash';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import withSlices from 'app/store/withSlices';
import { navigationSlice, selectFlatNavigation } from './store/navigationSlice';

type NavigationShortcutsProps = {
	className?: string;
	variant?: 'horizontal' | 'vertical';
};

/**
 * The navigation shortcuts.
 */
function NavigationShortcuts(props: NavigationShortcutsProps) {
	const { variant, className } = props;
	const dispatch = useAppDispatch();
	const navigation = useSelector(selectFlatNavigation);

	const userShortcuts = useSelector(selectUserShortcuts) || [];
	const isUserGuest = useSelector(selectIsUserGuest);
	const prevUserShortcuts = usePrevious(userShortcuts);

	const { updateUser: updateUserService } = useAuth();
	const isInitialMount = useRef(true);

	// Load from localStorage if redux has empty shortcuts on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem('user_shortcuts');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0 && userShortcuts.length === 0) {
					dispatch(setUserShortcuts(parsed));
				}
			}
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		if (!isUserGuest && prevUserShortcuts && !_.isEqual(userShortcuts, prevUserShortcuts)) {
			try {
				localStorage.setItem('user_shortcuts', JSON.stringify(userShortcuts));
			} catch {
				// ignore
			}
			updateUserService({ data: { shortcuts: userShortcuts } });
		}
	}, [isUserGuest, userShortcuts]);

	function handleShortcutsChange(newShortcuts: string[]) {
		try {
			localStorage.setItem('user_shortcuts', JSON.stringify(newShortcuts));
		} catch {
			// ignore
		}
		dispatch(setUserShortcuts(newShortcuts));
		if (!isUserGuest) {
			updateUserService({ data: { shortcuts: newShortcuts } });
		}
	}

	return (
		<FuseShortcuts
			className={className}
			variant={variant}
			navigation={navigation}
			shortcuts={userShortcuts}
			onChange={handleShortcutsChange}
		/>
	);
}

export default withSlices<NavigationShortcutsProps>([navigationSlice])(NavigationShortcuts);
