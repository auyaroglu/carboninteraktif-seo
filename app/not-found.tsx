export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      textAlign: 'center' 
    }}>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>404 - Erişim Engellendi</h1>
        <p>Bu sayfaya erişim izniniz bulunmamaktadır.</p>
      </div>
    </div>
  );
} 