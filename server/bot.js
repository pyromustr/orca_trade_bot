// Sunucu ve bot ana dosyası 
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mysql from 'mysql2/promise';
import TelegramBot from 'node-telegram-bot-api';
import ccxt from 'ccxt';
import { exec } from 'child_process';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Modülleri import et
import { startPriceFetcher } from './PriceFetcher.js';
import { startTelegramListener } from './TelegramListener.js';
import { startNotificationSender } from './NotificationSender.js';
import { startSignalProcessor, run_signal } from './SignalProcessor.js';
import { run_user } from './SignalProcessorUser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// .env dosyasından ayarları oku
const {
    BOT_TOKEN,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    VITE_APP_URL
} = process.env;

// Veritabanı bağlantı havuzu
let pool;
let bot;

async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            timezone: '+00:00'
        });
        console.log('Veritabanı bağlantı havuzu oluşturuldu.');
        const connection = await pool.getConnection();
        console.log('Veritabanı bağlantısı başarılı.');
        connection.release();
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        process.exit(1);
    }
}

function initializeTelegramBot() {
    if (!BOT_TOKEN) {
        console.error('BOT_TOKEN bulunamadı. Lütfen .env dosyasını kontrol edin.');
        process.exit(1);
    }
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('Telegram botu başlatıldı.');
}

// Global Yardımcı Fonksiyonlar (Modüller tarafından kullanılacak)
export async function dbQuery(sql, params) {
    if (!pool) {
        console.error("Veritabanı havuzu başlatılmamış!");
        throw new Error("Veritabanı havuzu başlatılmamış!");
    }
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Veritabanı sorgu hatası:', error, 'SQL:', sql, 'Params:', params);
        throw error;
    }
}

export function formatPrice(value, precision) {
    if (precision === null || precision === undefined || isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    const factor = Math.pow(10, precision);
    const roundedValue = Math.round(value * factor) / factor;
    return parseFloat(roundedValue.toFixed(precision));
}

// Yeniden başlatma sonrası bekleyen veya aktif sinyalleri yükle ve takip et
async function resumeUnfinishedSignals() {
    console.log('Tamamlanmamış sinyaller kontrol ediliyor...');
    
    try {
        // Bekleyen veya aktif durumda olan sinyalleri al
        const pendingOrActiveSignals = await dbQuery(
            "SELECT * FROM signals WHERE status IN ('pending', 'active')"
        );
        
        console.log(`Toplam ${pendingOrActiveSignals.length} bekleyen/aktif sinyal bulundu.`);
        
        // Her bir sinyal için run_signal çalıştır
        for (const signal of pendingOrActiveSignals) {
            console.log(`Sinyal ID: ${signal.id} (${signal.symbol} ${signal.direction}) takibi yeniden başlatılıyor...`);
            run_signal(signal.id, dbQuery, bot, formatPrice, process.env);
        }
        
    } catch (error) {
        console.error('Tamamlanmamış sinyaller kontrol edilirken hata:', error);
    }
}

// Yeniden başlatma sonrası üye sinyallerini yükle ve takip et
async function resumeUserSignals() {
    console.log('Üyelere ait aktif işlemler kontrol ediliyor...');
    
    try {
        // Aktif durumdaki kullanıcı işlemlerini al (status = 0: Beklemede, status = 1: Aktif)
        const activeUserSignals = await dbQuery(
            "SELECT * FROM user_signals WHERE status IN (0, 1)"
        );
        
        console.log(`Toplam ${activeUserSignals.length} aktif üye işlemi bulundu.`);
        
        // Her bir üye işlemi için run_user çalıştır
        for (const userSignal of activeUserSignals) {
            console.log(`Üye işlemi ID: ${userSignal.id} (Kullanıcı: ${userSignal.user_id}, Sinyal: ${userSignal.signal_id}) takibi yeniden başlatılıyor...`);
            run_user(userSignal.user_id, userSignal.id, dbQuery, bot, formatPrice, process.env);
        }
        
    } catch (error) {
        console.error('Üye işlemleri kontrol edilirken hata:', error);
    }
}

// Ana Başlatma Fonksiyonu
async function main() {
    await initializeDatabase();
    initializeTelegramBot();

    // Modülleri paylaşılan kaynaklarla başlat
    startPriceFetcher(dbQuery);
    startTelegramListener(bot, dbQuery, formatPrice, process.env);
    startNotificationSender(bot, dbQuery);
    startSignalProcessor(dbQuery, bot, formatPrice, process.env);
    
    // Bot yeniden başlatıldığında yarım kalan işleri yeniden başlat
    await resumeUnfinishedSignals();
    await resumeUserSignals();

    console.log('Tüm bot görevleri başlatıldı (modüler yapı).');
}

main().catch(err => {
    console.error("Ana bot döngüsünde kritik hata:", err);
    // process.exit(1); // Hata durumunda çıkış yapmayı isteğe bağlı tutabiliriz
}); 