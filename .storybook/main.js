// Storybook config. The dist folder is served so the compiled atlas can be previewed.
export default {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.js'],
  staticDirs: ['../dist'],
}
