// ============================================
// ARC TESTNET — USDC TRANSFER UYGULAMASI
// ============================================

// ethers kütüphanesini içe aktar (blockchain ile konuşmamızı sağlar)
import { ethers } from "ethers";

// ============================================
// 1. AĞ AYARLARI
// ============================================

// Arc Testnet'e bağlanmak için RPC adresi (thirdweb'in sunucusu)
const RPC_URL = "https://5042002.rpc.thirdweb.com";

// Arc Testnet'in zincir kimliği
const CHAIN_ID = 5042002;

// ============================================
// 2. CÜZDAN AYARLARI  ← BURAYA KENDİ BİLGİLERİNİ GİR
// ============================================

// MetaMask cüzdanının gizli anahtarı (private key)
// MetaMask > Hesap Detayları > Gizli Anahtarı Dışa Aktar
// UYARI: Bu anahtarı kimseyle paylaşma! Sadece testnet için kullan.
const PRIVATE_KEY = "0x3d74468e32c7b720f2dbb5b6e2ab8814ba2c2cdf7e3dcf027461a0224051abd0";

// USDC göndermek istediğin hedef cüzdan adresi
const ALICI_ADRES = "0xa58357CEf9B302d7070b6cbE9cC081f5a09be3Bb";

// Kaç USDC göndermek istiyorsun? (örnek: "0.1")
const MIKTAR = "0.1";

// ============================================
// 3. USDC KONTRAT AYARLARI
// ============================================

// Arc Testnet üzerindeki USDC'nin ERC-20 kontrat adresi
const USDC_KONTRAT_ADRESI = "0x3600000000000000000000000000000000000000";

// USDC kontratıyla konuşmak için gereken arayüz tanımı (ABI)
// Sadece "transfer" fonksiyonunu kullanacağız
const USDC_ABI = [
  // decimals: USDC'nin kaç ondalık basamak kullandığını söyler (6)
  "function decimals() view returns (uint8)",
  // balanceOf: belirli bir adresin USDC bakiyesini gösterir
  "function balanceOf(address owner) view returns (uint256)",
  // transfer: USDC gönderme fonksiyonu
  "function transfer(address to, uint256 amount) returns (bool)",
];

// ============================================
// 4. TRANSFER FONKSİYONU
// ============================================

async function usdcGonder() {
  console.log("🚀 Arc Testnet USDC Transfer başlıyor...\n");

  // Arc Testnet'e bağlan (provider = ağ bağlantısı)
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: "arc-testnet",
  });

  // Gizli anahtarla cüzdanı yükle (signer = işlemi imzalayan kişi)
  const cuzdan = new ethers.Wallet(PRIVATE_KEY, provider);

  // Cüzdan adresini ekrana yazdır (doğrulama için)
  console.log("📬 Gönderen cüzdan adresi:", cuzdan.address);

  // USDC kontratına bağlan
  const usdc = new ethers.Contract(USDC_KONTRAT_ADRESI, USDC_ABI, cuzdan);

  // USDC'nin kaç ondalık basamak kullandığını öğren (Arc'ta 6)
  const decimals = await usdc.decimals();
  console.log("🔢 USDC ondalık basamak sayısı:", decimals.toString());

  // Göndermeden önce bakiyeyi kontrol et
  const bakiye = await usdc.balanceOf(cuzdan.address);
  const bakiyeOkunabilir = ethers.formatUnits(bakiye, decimals);
  console.log("💰 Mevcut USDC bakiyesi:", bakiyeOkunabilir, "USDC");

  // Göndermek istediğimiz miktarı kontrat formatına çevir
  // Örnek: "0.1" USDC → 100000 (6 ondalık basamakla)
  const transferMiktar = ethers.parseUnits(MIKTAR, decimals);
  console.log(`\n📤 Gönderiliyor: ${MIKTAR} USDC`);
  console.log("📮 Alıcı adres:", ALICI_ADRES);

  // Transfer işlemini başlat
  const islem = await usdc.transfer(ALICI_ADRES, transferMiktar);
  console.log("\n⏳ İşlem gönderildi, onay bekleniyor...");
  console.log("🔗 İşlem hash:", islem.hash);

  // İşlemin onaylanmasını bekle
  const makbuz = await islem.wait();
  console.log("\n✅ İşlem başarıyla onaylandı!");
  console.log("📦 Blok numarası:", makbuz.blockNumber);
  console.log(
    "🔍 ArcScan'de görüntüle:",
    `https://testnet.arcscan.app/tx/${islem.hash}`
  );
}

// ============================================
// 5. ÇALIŞTIR
// ============================================

// Fonksiyonu çalıştır, hata olursa ekrana yaz
usdcGonder().catch((hata) => {
  console.error("❌ Hata oluştu:", hata.message);
});