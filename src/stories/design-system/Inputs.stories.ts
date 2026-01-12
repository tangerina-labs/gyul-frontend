import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent, ref } from 'vue'

/**
 * Design System Form Inputs
 * 
 * Input types: text, email, password
 * States: default, disabled, focus
 * Additional: textarea, checkbox, switch, select
 */

const InputsPage = defineComponent({
  name: 'InputsPage',
  setup() {
    const checkboxChecked = ref(true)
    const switchOn = ref(true)
    const selectValue = ref('')

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Form Inputs'),

      // Text Inputs
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Text Inputs'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl' }, [
          h('div', { class: 'space-y-2' }, [
            h('label', { class: 'text-sm font-medium text-foreground', for: 'default' }, 'Default Input'),
            h('input', {
              id: 'default',
              type: 'text',
              placeholder: 'Enter text...',
              class: 'flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            }),
          ]),
          h('div', { class: 'space-y-2' }, [
            h('label', { class: 'text-sm font-medium text-foreground', for: 'email' }, 'Email Input'),
            h('input', {
              id: 'email',
              type: 'email',
              placeholder: 'email@example.com',
              class: 'flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            }),
          ]),
          h('div', { class: 'space-y-2' }, [
            h('label', { class: 'text-sm font-medium text-foreground', for: 'password' }, 'Password Input'),
            h('input', {
              id: 'password',
              type: 'password',
              placeholder: '********',
              class: 'flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            }),
          ]),
          h('div', { class: 'space-y-2' }, [
            h('label', { class: 'text-sm font-medium text-muted-foreground', for: 'disabled' }, 'Disabled Input'),
            h('input', {
              id: 'disabled',
              type: 'text',
              placeholder: 'Disabled',
              disabled: true,
              class: 'flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            }),
          ]),
        ]),
      ]),

      // Textarea
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Textarea'),
        h('div', { class: 'max-w-3xl' }, [
          h('div', { class: 'space-y-2' }, [
            h('label', { class: 'text-sm font-medium text-foreground', for: 'message' }, 'Message'),
            h('textarea', {
              id: 'message',
              placeholder: 'Type your message here...',
              rows: 4,
              class: 'flex min-h-[80px] w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            }),
          ]),
        ]),
      ]),

      // Select
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Select'),
        h('div', { class: 'max-w-xs' }, [
          h('label', { class: 'text-sm font-medium text-foreground' }, 'Choose an option'),
          h('select', {
            class: 'flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2',
          }, [
            h('option', { value: '', disabled: true, selected: true }, 'Select an option'),
            h('option', { value: 'option1' }, 'Option 1'),
            h('option', { value: 'option2' }, 'Option 2'),
            h('option', { value: 'option3' }, 'Option 3'),
            h('option', { value: 'option4' }, 'Option 4'),
          ]),
        ]),
      ]),

      // Checkboxes
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Checkboxes'),
        h('div', { class: 'space-y-4' }, [
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'checkbox',
              id: 'check1',
              class: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'check1', class: 'text-sm font-medium text-foreground' }, 'Accept terms and conditions'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'checkbox',
              id: 'check2',
              checked: true,
              class: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'check2', class: 'text-sm font-medium text-foreground' }, 'Subscribe to newsletter'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'checkbox',
              id: 'check3',
              disabled: true,
              class: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'check3', class: 'text-sm font-medium text-muted-foreground' }, 'Disabled option'),
          ]),
        ]),
      ]),

      // Radio Buttons
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Radio Buttons'),
        h('div', { class: 'space-y-4' }, [
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'radio',
              id: 'radio1',
              name: 'radio-group',
              value: 'option1',
              checked: true,
              class: 'h-4 w-4 border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'radio1', class: 'text-sm font-medium text-foreground' }, 'Option 1'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'radio',
              id: 'radio2',
              name: 'radio-group',
              value: 'option2',
              class: 'h-4 w-4 border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'radio2', class: 'text-sm font-medium text-foreground' }, 'Option 2'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('input', {
              type: 'radio',
              id: 'radio3',
              name: 'radio-group',
              value: 'option3',
              class: 'h-4 w-4 border-gray-300 text-primary focus:ring-primary',
            }),
            h('label', { for: 'radio3', class: 'text-sm font-medium text-foreground' }, 'Option 3'),
          ]),
        ]),
      ]),

      // Switches
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Switches'),
        h('div', { class: 'space-y-4' }, [
          h('div', { class: 'flex items-center space-x-2' }, [
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': 'false',
              class: 'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            }, [
              h('span', { class: 'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0' }),
            ]),
            h('label', { class: 'text-sm font-medium text-foreground' }, 'Enable notifications'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': 'true',
              class: 'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            }, [
              h('span', { class: 'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-4' }),
            ]),
            h('label', { class: 'text-sm font-medium text-foreground' }, 'Dark mode'),
          ]),
          h('div', { class: 'flex items-center space-x-2' }, [
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': 'false',
              disabled: true,
              class: 'peer inline-flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent bg-gray-200 opacity-50 transition-colors',
            }, [
              h('span', { class: 'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0' }),
            ]),
            h('label', { class: 'text-sm font-medium text-muted-foreground' }, 'Disabled switch'),
          ]),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Inputs',
  component: InputsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Form input components including text inputs, textarea, select, checkboxes, radio buttons, and switches.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllInputs: Story = {
  render: () => ({
    components: { InputsPage },
    template: '<InputsPage />',
  }),
}

export const TextInputs: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Text Inputs</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div class="space-y-2">
            <label class="text-sm font-medium" for="text">Text Input</label>
            <input
              id="text"
              type="text"
              placeholder="Enter text..."
              class="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium" for="email">Email Input</label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              class="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium" for="password">Password Input</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              class="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted-foreground" for="disabled">Disabled Input</label>
            <input
              id="disabled"
              type="text"
              placeholder="Disabled"
              disabled
              class="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    `,
  }),
}

export const Textarea: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Textarea</h3>
        <div class="max-w-xl">
          <div class="space-y-2">
            <label class="text-sm font-medium" for="message">Message</label>
            <textarea
              id="message"
              placeholder="Type your message here..."
              rows="4"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            ></textarea>
          </div>
        </div>
      </div>
    `,
  }),
}

export const SelectAndCheckbox: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h3 class="mb-6 text-lg font-medium">Select</h3>
          <div class="max-w-xs">
            <label class="text-sm font-medium">Choose an option</label>
            <select class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-2">
              <option value="" disabled selected>Select an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
          </div>
        </div>
        
        <div>
          <h3 class="mb-6 text-lg font-medium">Checkboxes</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="c1" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label for="c1" class="text-sm font-medium">Option A</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="c2" checked class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label for="c2" class="text-sm font-medium">Option B (checked)</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="c3" disabled class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label for="c3" class="text-sm font-medium text-muted-foreground">Option C (disabled)</label>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
