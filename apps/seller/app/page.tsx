import { redirect } from 'next/navigation';

// The seller app is served on its own domain; its root just sends users into
// the seller cabinet.
export default function RootPage() {
  redirect('/seller');
}
