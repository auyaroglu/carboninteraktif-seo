import { NextRequest, NextResponse } from 'next/server';

// Çevresel değişkenlerden API anahtarlarını al
const API_KEY = process.env.API_KEY;
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

// Strateji türleri
type Strategy = 'mobile' | 'desktop';

// CORS başlıklarını ayarlamak için yardımcı fonksiyon
function setCorsHeaders(response: NextResponse) {
  // Sadece belirli domainlerden gelen isteklere izin ver
  // '*' yerine izin verilen domainleri belirtin
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// PageSpeed API'den veri çekmek için yardımcı fonksiyon
async function fetchPageSpeedData(url: string, strategy: Strategy = 'mobile') {
  if (!PAGESPEED_API_KEY) {
    throw new Error('PageSpeed API anahtarı bulunamadı. Lütfen çevresel değişkenleri kontrol edin.');
  }

  try {
    // Tüm kategorileri dahil et
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`PageSpeed API yanıt vermedi: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('PageSpeed API hatası:', error);
    throw error;
  }
}

// Metrik değerlerini çıkarmak için yardımcı fonksiyon
function extractMetrics(data: any) {
  const metrics = {
    FCP: 0,
    LCP: 0,
    TBT: 0,
    CLS: 0,
    SpeedIndex: 0,
    Performance: 0,
    Accessibility: 0,
    BestPractices: 0,
    SEO: 0
  };

  try {
    const lighthouseResult = data.lighthouseResult;
    const audits = lighthouseResult.audits;
    const categories = lighthouseResult.categories;

    // Performans metrikleri - milisaniye cinsinden
    metrics.FCP = Math.round(audits['first-contentful-paint']?.numericValue || 0);
    metrics.LCP = Math.round(audits['largest-contentful-paint']?.numericValue || 0);
    metrics.TBT = Math.round(audits['total-blocking-time']?.numericValue || 0);
    metrics.CLS = Number((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3));
    metrics.SpeedIndex = Math.round(audits['speed-index']?.numericValue || 0);

    // Kategori skorları (0-100 arasında)
    metrics.Performance = Math.round((categories.performance?.score || 0) * 100);
    metrics.Accessibility = Math.round((categories.accessibility?.score || 0) * 100);
    metrics.BestPractices = Math.round((categories['best-practices']?.score || 0) * 100);
    metrics.SEO = Math.round((categories.seo?.score || 0) * 100);
  } catch (error) {
    console.error('Metrik çıkarma hatası:', error);
  }

  return metrics;
}

// Her iki strateji için veri çekmek için yardımcı fonksiyon
async function fetchAllData(url: string) {
  const [mobileData, desktopData] = await Promise.all([
    fetchPageSpeedData(url, 'mobile'),
    fetchPageSpeedData(url, 'desktop')
  ]);

  return {
    mobile: extractMetrics(mobileData),
    desktop: extractMetrics(desktopData)
  };
}

// OPTIONS isteği için yanıt
export async function OPTIONS() {
  const response = NextResponse.json({});
  return setCorsHeaders(response);
}

export async function GET(request: NextRequest) {
  // API anahtarının çevresel değişkenden alınıp alınmadığını kontrol et
  if (!API_KEY) {
    const response = NextResponse.json(
      { error: 'API anahtarı bulunamadı. Lütfen çevresel değişkenleri kontrol edin.' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }

  // URL parametrelerini al
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const site = searchParams.get('site');
  const strategy = searchParams.get('strategy') as Strategy | null;

  // API anahtarını kontrol et
  if (token !== API_KEY) {
    const response = NextResponse.json(
      { error: 'Geçersiz API anahtarı' },
      { status: 401 }
    );
    return setCorsHeaders(response);
  }

  // Site URL'sini kontrol et
  if (!site) {
    const response = NextResponse.json(
      { error: 'Site URL\'si belirtilmedi' },
      { status: 400 }
    );
    return setCorsHeaders(response);
  }

  // URL formatını kontrol et
  try {
    new URL(site);
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Geçersiz URL formatı' },
      { status: 400 }
    );
    return setCorsHeaders(response);
  }

  try {
    let result;

    // Eğer strateji belirtilmişse sadece o strateji için veri çek
    if (strategy && (strategy === 'mobile' || strategy === 'desktop')) {
      const pageSpeedData = await fetchPageSpeedData(site, strategy);
      result = {
        [strategy]: extractMetrics(pageSpeedData)
      };
    } else {
      // Hem mobil hem de masaüstü için veri çek
      result = await fetchAllData(site);
    }
    
    // Sonuçları döndür
    const response = NextResponse.json(result);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('API hatası:', error);
    const response = NextResponse.json(
      { error: 'PageSpeed verisi alınırken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
} 