import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check & LAN network discovery endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'QUẢN LÝ LƯU TRỮ (LAN Server)',
      timestamp: new Date().toISOString(),
      network: {
        lanHost: req.headers.host || 'localhost:3000',
        clientIp: req.ip
      }
    });
  });

  // REST API Endpoints for Mobile Offline Companion & LAN clients
  app.get('/api/info', (req, res) => {
    res.json({
      appName: 'QUẢN LÝ LƯU TRỮ VÀ HỒ SƠ CHỨNG TỪ',
      version: '1.0.0-PROD',
      mode: 'LAN_OFFLINE_SYNC_READY',
      features: [
        'Immutable Box Code Standard',
        'Optimistic Locking Mobile Sync (v1)',
        'Destruction Strict Retention Guard',
        'Excel 4-step Validation Pipeline'
      ]
    });
  });

  // In production, serve built dist files; in dev, mount Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LAN Server] Hệ thống Quản Lý Lưu Trữ đang chạy tại: http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Lỗi khởi động máy chủ LAN:', err);
  process.exit(1);
});
