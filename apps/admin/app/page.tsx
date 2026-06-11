import { redirect } from 'next/navigation';

// The admin app is served on its own domain; its root just sends users into
// the dashboard.
export default function RootPage() {
  redirect('/admin');
}
