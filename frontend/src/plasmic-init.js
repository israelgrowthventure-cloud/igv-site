import { initPlasmicLoader } from '@plasmicapp/loader-react';

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'bq9xL5VKV11kLwvb8di8Sy',
      token: 'public', // Public token for now, will configure with proper token later
    },
  ],
  preview: true, // Enable preview mode for editing
});

// Register any custom components here
// Example:
// PLASMIC.registerComponent(MyCustomComponent, {
//   name: 'MyCustomComponent',
//   props: {...}
// });
