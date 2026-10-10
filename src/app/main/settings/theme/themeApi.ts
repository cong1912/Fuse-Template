import { apiService as api } from 'app/store/apiService';

export interface ThemeSettingsDto {
	storeName: string;
	slogan: string;
	logoUrl: string;
	faviconUrl: string;
	primaryColor: string;
	secondaryColor: string;
	accentColor: string;
	isDarkMode: boolean;
	heroTitle: string;
	heroSubtitle: string;
	heroBannerUrl: string;
	heroCtaText: string;
	heroCtaLink: string;
	promotionalBadge: string;
	announcementText: string;
	announcementEnabled: boolean;
	announcementLink: string;
	hotline: string;
	supportEmail: string;
	storeAddress: string;
	facebookUrl: string;
	zaloUrl: string;
	tikTokUrl: string;
	copyrightText: string;
}

export const themeApi = api
	.enhanceEndpoints({
		addTagTypes: ['theme_settings']
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getThemeSettings: build.query<ThemeSettingsDto, void>({
				query: () => ({
					url: '/api/theme/settings'
				}),
				providesTags: ['theme_settings']
			}),
			updateThemeSettings: build.mutation<ThemeSettingsDto, ThemeSettingsDto>({
				query: (settings) => ({
					url: '/api/theme/settings',
					method: 'PUT',
					data: settings
				}),
				invalidatesTags: ['theme_settings']
			})
		}),
		overrideExisting: false
	});

export const {
	useGetThemeSettingsQuery,
	useUpdateThemeSettingsMutation
} = themeApi;

export default themeApi;
