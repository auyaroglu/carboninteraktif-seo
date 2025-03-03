import { redirect } from 'next/navigation';

export default function Home() {
  // Tüm erişimleri engelle ve 404 sayfasına yönlendir
  redirect('/404');
}
