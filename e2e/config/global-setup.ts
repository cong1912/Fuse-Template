import { request, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const requestContext = await request.newContext();
  await requestContext.post('http://localhost:5001/api/auth/login', {
    data: {
      email: 'admin@puco.vn',
      password: '123'
    }
  });

  const authDir = path.join(__dirname, '..', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  await requestContext.storageState({ path: path.join(authDir, 'user.json') });
  await requestContext.dispose();
}

export default globalSetup;
