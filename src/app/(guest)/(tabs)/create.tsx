import { Redirect } from 'expo-router';

/** Placeholder route for the "+" tab; the tab bar intercepts the press and opens the Create Post sheet. */
export default function CreateTab() {
  return <Redirect href="/create-post" />;
}
