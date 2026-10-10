import { request, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:5269';
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@ecommerce.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123';
export const STORAGE_STATE = path.join('e2e', '.auth', 'user.json');

// Mock fallback token with exp in year 2050
const MOCK_JWT_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGVjb21tZXJjZS5jb20iLCJyb2xlIjpbImFkbWluIiwiU3VwZXJBZG1pbiJdLCJuYW1lIjoiU3VwZXIgQWRtaW4iLCJleHAiOjI1MjQ2MDgwMDB9.signature';

async function globalSetup(config: FullConfig) {
	const baseURL = (config.projects[0]?.use?.baseURL as string) ?? 'http://localhost:3001';
	const origin = new URL(baseURL).origin;

	let accessToken: string = MOCK_JWT_TOKEN;

	try {
		const api = await request.newContext({ baseURL: API_URL, timeout: 5000 });
		const response = await api.post('/api/auth/login', {
			data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
		});

		if (response.ok()) {
			const json = await response.json();
			accessToken =
				json?.accessToken ?? json?.token ?? json?.access_token ?? json?.data?.accessToken ?? MOCK_JWT_TOKEN;
		}
		await api.dispose();
	} catch {
		console.log('[e2e global-setup] Live backend not running. Using enterprise mock JWT state.');
	}

	fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
	fs.writeFileSync(
		STORAGE_STATE,
		JSON.stringify(
			{
				cookies: [],
				origins: [
					{
						origin,
						localStorage: [
							{ name: 'jwt_access_token', value: accessToken },
							{ name: 'authService', value: 'jwt' }
						]
					}
				]
			},
			null,
			2
		)
	);
}

export default globalSetup;
