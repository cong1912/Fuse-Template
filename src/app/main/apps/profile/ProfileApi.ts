import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['profile_photos_videos', 'profile_timeline', 'profile_about'] as const;

const ProfileApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getProfilePhotosVideos: build.query<any, void>({
				queryFn: () => ({
					data: [
						{
							id: '1',
							name: 'Last Month',
							info: '12 Photos',
							media: []
						}
					]
				}),
				providesTags: ['profile_photos_videos']
			}),
			getProfileTimeline: build.query<any, void>({
				queryFn: () => ({
					data: {
						activities: [
							{
								id: '1',
								user: { name: 'Admin User', avatar: 'assets/images/avatars/male-04.jpg' },
								message: 'Deployed version 2.4.0 to production',
								time: '2 hours ago'
							}
						],
						posts: []
					}
				}),
				providesTags: ['profile_timeline']
			}),
			getProfileAbout: build.query<any, void>({
				queryFn: () => ({
					data: {
						general: {
							gender: 'Male',
							birthday: 'May 8, 1990',
							locations: ['London, UK', 'Tokyo, Japan'],
							about: 'Super administrator for enterprise retail platform.'
						},
						work: {
							occupation: 'Platform Administrator',
							skills: 'Cloud, Distributed Systems, E-Commerce',
							jobs: [{ company: 'Enterprise Inc', date: '2020 - Present' }]
						},
						contact: {
							address: '123 Tech Blvd, Suite 400',
							tel: ['+1 555-0199'],
							websites: ['https://enterprise.example.com'],
							emails: ['admin@ecommerce.com']
						},
						groups: [
							{ id: '1', name: 'DevOps & Cloud', category: 'Engineering', members: '43 members' }
						],
						friends: [
							{ id: '1', name: 'John Doe', avatar: 'assets/images/avatars/male-01.jpg' }
						]
					}
				}),
				providesTags: ['profile_about']
			})
		}),
		overrideExisting: false
	});

export default ProfileApi;

export type GetProfilePhotosVideosApiResponse = /** status 200 OK */ ProfilePhotosVideos[];
export type GetProfilePhotosVideosApiArg = void;

export type GetProfileTimelineApiResponse = /** status 200 OK */ ProfileTimeline;
export type GetProfileTimelineApiArg = void;

export type GetProfileAboutApiResponse = /** status 200 OK */ ProfileAbout;
export type GetProfileAboutApiArg = void;

export type ProfilePhotosVideos = {
	id?: string;
	name?: string;
	info?: string;
	media?: {
		type?: string;
		title?: string;
		preview?: string;
	}[];
};

export type Activity = {
	id?: string;
	user?: {
		name?: string;
		avatar?: string;
	};
	message?: string;
	time?: string;
};

export type Post = {
	id?: string;
	user?: {
		name?: string;
		avatar?: string;
	};
	message?: string;
	time?: string;
	type?: string;
	like?: number;
	share?: number;
	media?: {
		type?: string;
		preview?: string;
	};
	comments?: {
		id?: string;
		user?: {
			name?: string;
			avatar?: string;
		};
		time?: string;
		message?: string;
	}[];
	article?: {
		title?: string;
		subtitle?: string;
		excerpt?: string;
		media?: {
			type?: string;
			preview?: string;
		};
	};
};

export type ProfileTimeline = {
	activities?: Activity[];
	posts?: Post[];
};

export type ProfileAbout = {
	general?: {
		gender?: string;
		birthday?: string;
		locations?: string[];
		about?: string;
	};
	work?: {
		occupation?: string;
		skills?: string;
		jobs?: {
			company?: string;
			date?: string;
		}[];
	};
	contact?: {
		address?: string;
		tel?: string[];
		websites?: string[];
		emails?: string[];
	};
	groups?: {
		id?: string;
		name?: string;
		category?: string;
		members?: string;
	}[];
	friends?: {
		id?: string;
		name?: string;
		avatar?: string;
	}[];
};

export const { useGetProfilePhotosVideosQuery, useGetProfileTimelineQuery, useGetProfileAboutQuery } = ProfileApi;
