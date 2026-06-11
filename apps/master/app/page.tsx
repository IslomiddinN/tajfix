import { redirect } from 'next/navigation';

// The master app is served on its own domain; its root just sends users into
// the master dashboard.
export default function RootPage() {
  redirect('/master');
}
