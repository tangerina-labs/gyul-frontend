import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Icons
 * 
 * Icon guidelines:
 * - Sizes: 16px, 20px, 24px, 32px, 48px
 * - Colors: foreground, primary, muted, destructive, success
 * - Categories: Navigation, Communication, Files, Actions, Social, UI
 * - Source: Lucide Icons (https://lucide.dev)
 */

// SVG icon paths for demonstration
const iconPaths = {
  home: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  settings: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2',
  search: 'M19 19l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0z',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  calendar: 'M16 2v4 M8 2v4 M3 10h18 M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5z',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
  file: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6',
  image: 'M21 19l-5.5-6L12 17l-3.5-4.5L3 19 M21 5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  edit: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z M15 5l4 4',
  trash: 'M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2 M10 11v6 M14 11v6',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18 M6 6l12 12',
  heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z M7 11V7a5 5 0 0 1 10 0v4',
  unlock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z M7 11V7a5 5 0 0 1 9.9-1',
  eye: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
  eyeOff: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41',
}

const IconsPage = defineComponent({
  name: 'IconsPage',
  setup() {
    const createIcon = (paths: string[], size = 24, colorClass = 'text-foreground') => {
      return h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        class: colorClass,
      }, paths.map(d => h('path', { d })))
    }

    const iconCategories = [
      {
        title: 'Navigation',
        icons: [
          { name: 'Home', paths: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'] },
          { name: 'Menu', paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
          { name: 'Settings', paths: [iconPaths.settings, 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0'] },
          { name: 'User', paths: [iconPaths.user, 'M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'] },
          { name: 'Search', paths: ['m19 19-4-4', 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z'] },
          { name: 'ChevronRight', paths: ['m9 18 6-6-6-6'] },
        ],
      },
      {
        title: 'Communication',
        icons: [
          { name: 'Bell', paths: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'] },
          { name: 'Mail', paths: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'] },
          { name: 'Calendar', paths: ['M16 2v4', 'M8 2v4', 'M3 10h18', 'M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5z'] },
          { name: 'Share', paths: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'] },
        ],
      },
      {
        title: 'Files & Media',
        icons: [
          { name: 'FileText', paths: ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'] },
          { name: 'Image', paths: ['M21 19l-5.5-6L12 17l-3.5-4.5L3 19', 'M21 5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14z'] },
          { name: 'Download', paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'] },
          { name: 'Upload', paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'] },
        ],
      },
      {
        title: 'Actions',
        icons: [
          { name: 'Edit', paths: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'M15 5l4 4'] },
          { name: 'Trash', paths: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'] },
          { name: 'Check', paths: ['M20 6 9 17l-5-5'] },
          { name: 'Close', paths: ['M18 6 6 18', 'M6 6l12 12'] },
        ],
      },
      {
        title: 'Social & Status',
        icons: [
          { name: 'Heart', paths: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'] },
          { name: 'Star', paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'] },
          { name: 'Lock', paths: ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z', 'M7 11V7a5 5 0 0 1 10 0v4'] },
          { name: 'Unlock', paths: ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z', 'M7 11V7a5 5 0 0 1 9.9-1'] },
        ],
      },
      {
        title: 'UI Elements',
        icons: [
          { name: 'Eye', paths: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0'] },
          { name: 'EyeOff', paths: ['M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49', 'M14.084 14.158a3 3 0 0 1-4.242-4.242', 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143', 'M2 2l20 20'] },
          { name: 'Moon', paths: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9'] },
          { name: 'Sun', paths: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M6.34 17.66l-1.41 1.41', 'M19.07 4.93l-1.41 1.41'] },
        ],
      },
    ]

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Icons'),
      h('p', { class: 'text-muted-foreground mb-8' }, [
        'Icons from ',
        h('a', { 
          href: 'https://lucide.dev', 
          target: '_blank', 
          rel: 'noopener noreferrer', 
          class: 'text-primary hover:underline' 
        }, 'Lucide Icons'),
      ]),

      // Icon Sizes
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Icon Sizes'),
        h('div', { class: 'flex items-end gap-8' }, [
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 16),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, '16px'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 20),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, '20px'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 24),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, '24px'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, '32px'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 48),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, '48px'),
          ]),
        ]),
      ]),

      // Icon Colors
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Icon Colors'),
        h('div', { class: 'flex items-center gap-8' }, [
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32, 'text-foreground'),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, 'Default'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32, 'text-primary'),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, 'Primary'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32, 'text-muted-foreground'),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, 'Muted'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32, 'text-destructive'),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, 'Destructive'),
          ]),
          h('div', { class: 'text-center' }, [
            createIcon(['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'], 32, 'text-success'),
            h('p', { class: 'text-sm text-muted-foreground mt-2' }, 'Success'),
          ]),
        ]),
      ]),

      // Icon Library
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Icon Library'),
        h('div', { class: 'space-y-8' },
          iconCategories.map(category =>
            h('div', { key: category.title }, [
              h('h4', { class: 'mb-4 font-medium text-foreground' }, category.title),
              h('div', { class: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' },
                category.icons.map(icon =>
                  h('div', {
                    key: icon.name,
                    class: 'flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:border-primary hover:bg-accent transition-colors',
                  }, [
                    createIcon(icon.paths, 24),
                    h('span', { class: 'text-xs text-center mt-2' }, icon.name),
                  ])
                )
              ),
            ])
          )
        ),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Icons',
  component: IconsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Icon guidelines including sizes, colors, and a library of commonly used icons from Lucide.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllIcons: Story = {
  render: () => ({
    components: { IconsPage },
    template: '<IconsPage />',
  }),
}

export const IconSizes: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Icon Sizes</h3>
        <div class="flex items-end gap-8">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">16px</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">20px</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">24px</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">32px</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">48px</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const IconColors: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Icon Colors</h3>
        <div class="flex items-center gap-8">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-foreground">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">Default</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-primary">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">Primary</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-muted-foreground">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">Muted</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-destructive">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">Destructive</p>
          </div>
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-success">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="text-sm text-muted-foreground mt-2">Success</p>
          </div>
        </div>
      </div>
    `,
  }),
}
