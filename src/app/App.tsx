import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider } from 'notistack';
import { useSelector } from 'react-redux';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache, { Options } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { selectCurrentLanguageDirection } from 'app/store/i18nSlice';
import themeLayouts from 'app/theme-layouts/themeLayouts';
import { useEffect } from 'react';
import { useAppDispatch } from 'app/store/store';
import {
	fuseSettingsSlice,
	getSavedThemeMode,
	selectMainTheme,
	selectThemeMode,
	setThemeMode,
	syncSystemTheme
} from '@fuse/core/FuseSettings/store/fuseSettingsSlice';
// import MockAdapterProvider from '@mock-api/MockAdapterProvider';
import withAppProviders from './withAppProviders';
import withSlices from 'app/store/withSlices';
import { AuthRouteProvider } from './auth/AuthRouteProvider';
import ImpersonationBanner from './shared-components/ImpersonationBanner';

import './api/axiosClient';

const emotionCacheOptions = {
	rtl: {
		key: 'muirtl',
		stylisPlugins: [rtlPlugin],
		insertionPoint: document.getElementById('emotion-insertion-point')
	},
	ltr: {
		key: 'muiltr',
		stylisPlugins: [],
		insertionPoint: document.getElementById('emotion-insertion-point')
	}
};

/**
 * The main App component.
 */
function App() {
	const dispatch = useAppDispatch();
	const themeMode = useSelector(selectThemeMode);

	/**
	 * Sync theme mode on initial mount from localStorage.
	 */
	useEffect(() => {
		const savedMode = getSavedThemeMode();
		dispatch(setThemeMode(savedMode));
	}, [dispatch]);

	/**
	 * Listen for OS dark/light mode changes when system mode is selected.
	 */
	useEffect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			if (themeMode === 'system') {
				dispatch(syncSystemTheme());
			}
		};
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, [dispatch, themeMode]);

	/**
	 * The language direction from the Redux store.
	 */
	const langDirection = useSelector(selectCurrentLanguageDirection);

	/**
	 * The main theme from the Redux store.
	 */
	const mainTheme = useSelector(selectMainTheme);

	return (
		<CacheProvider value={createCache(emotionCacheOptions[langDirection] as Options)}>
			<FuseTheme
				theme={mainTheme}
				direction={langDirection}
			>
				<AuthRouteProvider>
					<SnackbarProvider
						maxSnack={5}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right'
						}}
						classes={{
							containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
						}}
					>
						<ImpersonationBanner />
						<FuseLayout layouts={themeLayouts} />
					</SnackbarProvider>
				</AuthRouteProvider>
			</FuseTheme>
		</CacheProvider>
	);
}

export default withAppProviders(App);
