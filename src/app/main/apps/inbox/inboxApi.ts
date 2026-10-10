import { apiService as api } from 'src/app/store/apiService';

export interface SupportChannelInfoDto {
	channelId: string;
	supportUserId: string;
	supportName: string;
	supportEmail: string;
	isSuperAdmin: boolean;
	isOnline: boolean;
}

export interface ChatChannelDto {
	id: string;
	otherUserId?: string;
	otherParticipantId?: string;
	otherParticipantName?: string;
	otherParticipantEmail?: string;
	listingId?: string | null;
	lastMessage?: string | null;
	lastMessageAt?: string | null;
	unreadCount: number;
	isOnline?: boolean;
	isOtherUserOnline?: boolean;
}

export interface ChatMessageDto {
	id: string;
	channelId: string;
	senderId: string;
	recipientId: string;
	content: string;
	attachmentUrl?: string | null;
	sentAt: string;
	readAt?: string | null;
	isRead: boolean;
}

export const addTagTypes = ['ChatChannels', 'ChatMessages'] as const;

export const inboxApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			initSupportChannel: build.mutation<SupportChannelInfoDto, void>({
				query: () => ({
					url: '/api/chat/support/init',
					method: 'POST'
				}),
				invalidatesTags: ['ChatChannels']
			}),
			getMyChatChannels: build.query<ChatChannelDto[], void>({
			query: () => ({
				url: '/api/chat/channels'
			}),
			providesTags: ['ChatChannels']
		}),
		getChannelMessages: build.query<ChatMessageDto[], { channelId: string; pageNumber?: number; pageSize?: number }>({
			query: ({ channelId, pageNumber = 1, pageSize = 50 }) => ({
				url: `/api/chat/channels/${channelId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`
			}),
			providesTags: (_result, _error, arg) => [{ type: 'ChatMessages', id: arg.channelId }]
		}),
		sendChatMessage: build.mutation<ChatMessageDto, { channelId: string; content: string; attachmentUrl?: string }>({
			query: ({ channelId, content, attachmentUrl }) => ({
				url: `/api/chat/channels/${channelId}/messages`,
				method: 'POST',
				data: { content, attachmentUrl }
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'ChatMessages', id: arg.channelId },
				'ChatChannels'
			]
		}),
		markChannelRead: build.mutation<void, string>({
			query: (channelId) => ({
				url: `/api/chat/channels/${channelId}/read`,
				method: 'PUT'
			}),
			invalidatesTags: ['ChatChannels']
		})
	}),
	overrideExisting: true
});

export const {
	useInitSupportChannelMutation,
	useGetMyChatChannelsQuery,
	useGetChannelMessagesQuery,
	useSendChatMessageMutation,
	useMarkChannelReadMutation
} = inboxApi;
