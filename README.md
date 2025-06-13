# Orca Trade Bot

Bu proje, Telegram üzerinden gelen trading sinyallerini yöneten ve kullanıcıların bu sinyallere göre işlem yapmasını sağlayan bir web uygulamasıdır.

## Proje Yapısı

### Backend (server/)
- `index.js`: Ana sunucu dosyası, tüm API endpoint'lerini içerir
  
#### API Endpoints:

1. Kullanıcı İşlemleri:
```
POST /api/validate-telegram-auth    - Telegram doğrulaması
GET  /api/users/:telegramId        - Kullanıcı bilgileri
GET  /api/check-admin              - Admin kontrolü
```

2. API Key İşlemleri:
```
GET    /api/keys                   - Kullanıcının API anahtarları
POST   /api/keys                   - Yeni API anahtarı ekleme
PUT    /api/keys/:id              - API anahtarı güncelleme
DELETE /api/keys/:id              - API anahtarı silme
```

3. Trading İşlemleri:
```
GET /api/trades/open               - Açık işlemler (LIMIT 5)
GET /api/trades/all               - Tüm işlemler (LIMIT 5)
GET /api/signals                  - Kullanıcının sinyalleri
```

4. Admin İşlemleri:
```
GET  /api/admin/members           - Tüm üyeler
GET  /api/admin/api-settings      - API ayarları
GET  /api/admin/subscriptions     - Abonelikler
POST /api/admin-login-simple      - Admin girişi
```

### Frontend (src/)

#### Hooks:
- `useAuth.ts`: Telegram doğrulama ve kullanıcı oturumu yönetimi
  - `/api/validate-telegram-auth` ile doğrulama
  - LocalStorage ve Cookie yönetimi

#### Components:
- `ApiKeyForm`: API anahtarı yönetimi
  - `/api/keys` endpoint'leri ile haberleşme
- `TradeList`: İşlem listesi
  - `/api/trades/open` ve `/api/trades/all` sorgularını kullanır
- `Dashboard`: Ana panel
  - `/api/dashboard/:userId` ile veri çeker

### Veritabanı Yapısı

1. `users` tablosu:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegram_id VARCHAR(255),
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  login_hash VARCHAR(255),
  created_at TIMESTAMP
);
```

2. `users_api` tablosu:
```sql
CREATE TABLE users_api (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  api_name VARCHAR(255),
  api_key TEXT,
  api_secret TEXT,
  bot_room INT
);
```

3. `user_signals` tablosu:
```sql
CREATE TABLE user_signals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  api_id INT,
  symbol VARCHAR(20),
  trend VARCHAR(10),
  open DECIMAL(18,8),
  opentime DATETIME,
  close DECIMAL(18,8),
  closetime DATETIME,
  profit DECIMAL(18,8)
);
```

4. `enrolled_users` tablosu:
```sql
CREATE TABLE enrolled_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  package_id INT,
  start_date DATETIME,
  end_date DATETIME
);
```

### Güvenlik

- Her API isteği için header'da `X-Telegram-ID` ve `X-Login-Hash` kontrolü yapılır
- `/api/validate-telegram-auth` dışındaki tüm endpoint'ler auth middleware ile korunur
- Admin endpoint'leri için ek yetki kontrolü yapılır

### Debug Modu

- `debug = 1` olduğunda:
  - Tüm API istekleri loglanır
  - Request ve Response detayları renkli olarak gösterilir
  - Header bilgileri gösterilir

### Önbellek (Cache)

- In-memory cache sistemi kullanılır
- Varsayılan TTL: 5 dakika
- Dashboard, sinyal ve kullanıcı verileri için cache kullanılır

## Kurulum

1. `.env` dosyasını oluşturun:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=trading_db
DB_PORT=3306
BOT_TOKEN=your_telegram_bot_token
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Sunucuyu başlatın:
```bash
node server/index.js
```

4. Frontend'i geliştirme modunda başlatın:
```bash
npm run dev
```
