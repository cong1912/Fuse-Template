import { createTheme, getContrastRatio } from '@mui/material/styles';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from '@lodash';
import {
	defaultSettings,
	defaultThemeOptions,
	extendThemeWithMixins,
	getParsedQuerySettings,
	mustHaveThemeOptions
} from '@fuse/default-settings';
import settingsConfig from 'app/configs/settingsConfig';
import themeLayoutConfigs from 'app/theme-layouts/themeLayoutConfigs';
import { resetUser, setUser, setUserSettings } from 'src/app/auth/user/store/userSlice';
import { darkPaletteText, lightPaletteText, themesConfig } from 'app/configs/themesConfig';
import { AppThunk, RootStateType } from 'app/store/types';
import { FuseSettingsConfigType, FuseThemesType, FuseThemeType, ThemeModeType } from '@fuse/core/FuseSettings/FuseSettings';
import { ThemeOptions } from '@mui/material/styles/createTheme';
import { PartialDeep } from 'type-fest';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';

export type { ThemeModeType };

type AppRootStateType = RootStateType<settingsSliceType>;

export function getSavedThemeMode(): ThemeModeType {
	if (typeof window === 'undefined') return 'system';
	return (localStorage.getItem('fuse_theme_mode') as ThemeModeType) || 'system';
}

export function isSystemDark(): boolean {
	if (typeof window === 'undefined') return false;
	return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function resolveEffectiveMode(mode: ThemeModeType = 'system'): 'light' | 'dark' {
	if (mode === 'system') {
		return isSystemDark() ? 'dark' : 'light';
	}
	return mode;
}

export const setThemeMode =
	(mode: ThemeModeType): AppThunk<void> =>
	(dispatch, getState) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('fuse_theme_mode', mode);
		}

		const effective = resolveEffectiveMode(mode);
		const root = typeof document !== 'undefined' ? document.documentElement : null;
		if (root) {
			if (effective === 'dark') {
				root.classList.add('dark');
				root.classList.remove('light');
				root.style.colorScheme = 'dark';
				document.body.classList.add('dark');
				document.body.classList.remove('light');
			} else {
				root.classList.remove('dark');
				root.classList.add('light');
				root.style.colorScheme = 'light';
				document.body.classList.add('light');
				document.body.classList.remove('dark');
			}
		}

		const AppState = getState() as AppRootStateType;
		const settings = AppState.fuseSettings;

		const targetTheme =
			effective === 'dark'
				? {
						main: themesConfig.defaultDark,
						navbar: themesConfig.defaultDark,
						toolbar: themesConfig.defaultDark,
						footer: themesConfig.defaultDark
				  }
				: {
						main: themesConfig.default,
						navbar: themesConfig.defaultDark,
						toolbar: themesConfig.default,
						footer: themesConfig.defaultDark
				  };

		const newSettings: FuseSettingsConfigType = {
			...settings.current,
			themeMode: mode,
			theme: targetTheme
		};

		dispatch(setSettings(newSettings));
		dispatch(setDefaultSettings(newSettings));
	};

export const syncSystemTheme = (): AppThunk<void> => (dispatch, getState) => {
	const AppState = getState() as AppRootStateType;
	const currentMode = AppState.fuseSettings.current.themeMode || getSavedThemeMode();
	if (currentMode === 'system') {
		dispatch(setThemeMode('system'));
	}
};

export const changeFuseTheme =
	(theme: FuseThemesType): AppThunk<void> =>
	(dispatch, getState) => {
		const AppState = getState() as AppRootStateType;
		const settings = AppState.fuseSettings;

		const { navbar, footer, toolbar, main } = theme;

		const newSettings: FuseSettingsConfigType = {
			...settings.current,
			theme: {
				main,
				navbar,
				toolbar,
				footer
			}
		};

		dispatch(setDefaultSettings(newSettings)).then(() => {
			dispatch(showMessage({ message: 'User theme selection saved with the api' }));
		});
	};

type layoutProps = {
	style: string;
	config: unknown;
};

/**
 * Gets the initial settings for the application.
 */
function getInitialSettings(): FuseSettingsConfigType {
	const defaultLayoutStyle =
		settingsConfig.layout && settingsConfig.layout.style ? settingsConfig.layout.style : 'layout1';

	const layout: layoutProps = {
		style: defaultLayoutStyle,
		config: themeLayoutConfigs[defaultLayoutStyle].defaults
	};

	const initial: FuseSettingsConfigType = _.merge(
		{},
		defaultSettings,
		{ layout },
		settingsConfig,
		getParsedQuerySettings()
	);
	const savedMode = getSavedThemeMode();
	const effective = resolveEffectiveMode(savedMode);

	initial.themeMode = savedMode;
	if (effective === 'dark') {
		initial.theme = {
			main: themesConfig.defaultDark,
			navbar: themesConfig.defaultDark,
			toolbar: themesConfig.defaultDark,
			footer: themesConfig.defaultDark
		};
	} else {
		initial.theme = {
			main: themesConfig.default,
			navbar: themesConfig.defaultDark,
			toolbar: themesConfig.default,
			footer: themesConfig.defaultDark
		};
	}

	return initial;
}

/**
 * Generates the settings object by merging the default settings with the new settings.
 */
export function generateSettings(
	_defaultSettings: PartialDeep<FuseSettingsConfigType>,
	_newSettings: FuseSettingsConfigType
) {
	const res = _.merge(
		{},
		_defaultSettings,
		{ layout: { config: themeLayoutConfigs[_newSettings?.layout?.style]?.defaults } },
		_newSettings
	);

	if (_newSettings?.theme) {
		res.theme = {
			main: _newSettings.theme.main,
			navbar: _newSettings.theme.navbar,
			toolbar: _newSettings.theme.toolbar,
			footer: _newSettings.theme.footer
		};
	}

	return res;
}

const initialSettings = getInitialSettings();

/**
 * The type definition for the initial state.
 */
type initialStateProps = {
	initial: FuseSettingsConfigType;
	defaults: FuseSettingsConfigType;
	current: FuseSettingsConfigType;
};

/**
 * The initial state.
 */
const initialState: initialStateProps = {
	initial: initialSettings,
	defaults: _.merge({}, initialSettings),
	current: _.merge({}, initialSettings)
};

/**
 * Sets the default settings for the application.
 */
export const setDefaultSettings = createAsyncThunk(
	'fuseSettings/setDefaultSettings',
	async (val: PartialDeep<FuseSettingsConfigType>, { dispatch, getState }) => {
		const AppState = getState() as AppRootStateType;

		const settings = AppState.fuseSettings;

		const defaults = generateSettings(settings.defaults, val as FuseSettingsConfigType);

		dispatch(setUserSettings(defaults));

		return {
			...settings,
			defaults: _.merge({}, defaults),
			current: _.merge({}, defaults)
		};
	}
);

/**
 * The settings slice.
 */
export const fuseSettingsSlice = createSlice({
	name: 'fuseSettings',
	initialState,
	reducers: {
		setSettings: (state, action: PayloadAction<FuseSettingsConfigType>) => {
			const current = generateSettings(state.defaults, action.payload);

			return {
				...state,
				current
			};
		},

		setInitialSettings: () => _.merge({}, initialState),
		resetSettings: (state) => ({
			...state,
			defaults: _.merge({}, state.defaults),
			current: _.merge({}, state.defaults)
		})
	},
	extraReducers: (builder) => {
		builder
			.addCase(setDefaultSettings.fulfilled, (state, action) => action.payload)
			.addCase(setUser.fulfilled, (state, action) => {
				const defaults = generateSettings(
					state.defaults,
					action.payload?.data?.settings as FuseSettingsConfigType
				);
				return {
					...state,
					defaults: _.merge({}, defaults),
					current: _.merge({}, defaults)
				};
			})
			.addCase(resetUser.fulfilled, (state) => {
				return {
					...state,
					defaults: _.merge({}, initialSettings),
					current: _.merge({}, initialSettings)
				};
			});
	}
});

type directionType = 'ltr' | 'rtl';

const getDirection = (state: AppRootStateType) => state?.fuseSettings?.current?.direction;
const getMainTheme = (state: AppRootStateType) => state?.fuseSettings?.current?.theme?.main;
const getNavbarTheme = (state: AppRootStateType) => state?.fuseSettings?.current?.theme?.navbar;
const getToolbarTheme = (state: AppRootStateType) => state?.fuseSettings?.current?.theme?.toolbar;
const getFooterTheme = (state: AppRootStateType) => state?.fuseSettings?.current?.theme?.footer;

/**
 * Generates the MUI theme object.
 */
function generateMuiTheme(theme: FuseThemeType, direction: directionType) {
	const data = _.merge({}, defaultThemeOptions, theme, mustHaveThemeOptions) as ThemeOptions;

	return createTheme(
		_.merge({}, data, {
			mixins: extendThemeWithMixins(data),
			direction
		} as ThemeOptions)
	);
}

/**
 * Selects the contrast theme based on the background color.
 */
export const selectContrastMainTheme = (bgColor: string) => {
	function isDark(color: string) {
		return getContrastRatio(color, '#ffffff') >= 3;
	}
	return isDark(bgColor) ? selectMainThemeDark : selectMainThemeLight;
};

/**
 * Changes the theme mode.
 */
function changeThemeMode(theme: FuseThemeType, mode: 'dark' | 'light'): FuseThemeType {
	const modes = {
		dark: {
			palette: {
				mode: 'dark',
				divider: 'rgba(241,245,249,.12)',
				background: {
					paper: '#1E2125',
					default: '#121212'
				},
				text: darkPaletteText
			}
		},
		light: {
			palette: {
				mode: 'light',
				divider: '#e2e8f0',
				background: {
					paper: '#FFFFFF',
					default: '#F7F7F7'
				},
				text: lightPaletteText
			}
		}
	};

	return _.merge({}, theme, modes[mode]);
}

export const selectMainTheme = createSelector([getMainTheme, getDirection], (theme, direction) =>
	generateMuiTheme(theme, direction)
);

export const selectMainThemeDark = createSelector([getMainTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectMainThemeLight = createSelector([getMainTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectNavbarTheme = createSelector([getNavbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(theme, direction)
);

export const selectNavbarThemeDark = createSelector([getNavbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectNavbarThemeLight = createSelector([getNavbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectToolbarTheme = createSelector([getToolbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(theme, direction)
);

export const selectToolbarThemeDark = createSelector([getToolbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectToolbarThemeLight = createSelector([getToolbarTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectFooterTheme = createSelector([getFooterTheme, getDirection], (theme, direction) =>
	generateMuiTheme(theme, direction)
);

export const selectFooterThemeDark = createSelector([getFooterTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectFooterThemeLight = createSelector([getFooterTheme, getDirection], (theme, direction) =>
	generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectFuseCurrentSettings = (state: AppRootStateType) => state?.fuseSettings?.current;

export const selectFuseCurrentLayoutConfig = (state: AppRootStateType) =>
	state?.fuseSettings?.current?.layout?.config;

export const selectFuseDefaultSettings = (state: AppRootStateType) => state?.fuseSettings?.defaults;

export const selectCustomScrollbarsEnabled = (state: AppRootStateType) =>
	state?.fuseSettings?.current?.customScrollbars;

export const selectThemeMode = (state: AppRootStateType) =>
	state?.fuseSettings?.current?.themeMode || getSavedThemeMode();

export const selectEffectiveThemeMode = createSelector([selectThemeMode], (mode) => resolveEffectiveMode(mode));

// export const selectFuseThemesSettings = (state: RootState) => state.fuseSettings.themes;

export const { resetSettings, setInitialSettings, setSettings } = fuseSettingsSlice.actions;

export type settingsSliceType = typeof fuseSettingsSlice;

export default fuseSettingsSlice.reducer;
