import type { Meta, StoryObj } from '@storybook/vue3'
import TweetNode from './TweetNode.vue'
import type { TweetData } from '@/types'

const meta: Meta<typeof TweetNode> = {
  title: 'Nodes/TweetNode',
  component: TweetNode,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TweetNode>

// Mock data for different states
const emptyTweet: TweetData = {
  type: 'tweet',
  flowId: 'flow-1',
  url: '',
  status: 'empty',
}

const loadingTweet: TweetData = {
  type: 'tweet',
  flowId: 'flow-1',
  url: 'https://twitter.com/OpenAI/status/123456789',
  status: 'loading',
}

const loadedTweet: TweetData = {
  type: 'tweet',
  flowId: 'flow-1',
  url: 'https://twitter.com/OpenAI/status/123456789',
  status: 'loaded',
  author: {
    name: 'OpenAI',
    handle: '@OpenAI',
    avatar: 'https://pbs.twimg.com/profile_images/1634058036934500352/b4F1eVpJ_400x400.jpg',
  },
  text: 'We are announcing GPT-5, our most capable model yet. It demonstrates remarkable reasoning abilities across mathematics, coding, and scientific domains. The model shows significant improvements in understanding complex, multi-step problems.',
  timestamp: '2024-01-15T14:30:00Z',
}

const errorTweet: TweetData = {
  type: 'tweet',
  flowId: 'flow-1',
  url: 'https://twitter.com/invalid/status/000',
  status: 'error',
  error: 'Tweet not found or is private',
}

// Individual stories
export const Empty: Story = {
  args: {
    id: 'tweet-1',
    data: emptyTweet,
    selected: false,
  },
}

export const Loading: Story = {
  args: {
    id: 'tweet-2',
    data: loadingTweet,
    selected: false,
  },
}

export const Loaded: Story = {
  args: {
    id: 'tweet-3',
    data: loadedTweet,
    selected: false,
  },
}

export const Error: Story = {
  args: {
    id: 'tweet-4',
    data: errorTweet,
    selected: false,
  },
}

export const Selected: Story = {
  args: {
    id: 'tweet-5',
    data: loadedTweet,
    selected: true,
  },
}

// ALL STATES - Shows all TweetNode states simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { TweetNode },
    setup() {
      const handleLoadTweet = (url: string) => {
        console.log('Load tweet:', url)
      }
      const handleAddChild = (position: { x: number; y: number }) => {
        console.log('Add child at:', position)
      }
      const handleDelete = () => {
        console.log('Delete node')
      }

      return {
        emptyTweet,
        loadingTweet,
        loadedTweet,
        errorTweet,
        handleLoadTweet,
        handleAddChild,
        handleDelete,
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 64px; padding: 32px;">
        <!-- Status States -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Tweet Status States</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Empty (Initial)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                User has not entered a URL yet
              </p>
              <TweetNode
                id="tweet-empty"
                :data="emptyTweet"
                :selected="false"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Loading
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Fetching tweet data from URL
              </p>
              <TweetNode
                id="tweet-loading"
                :data="loadingTweet"
                :selected="false"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Loaded (Success)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Tweet data loaded and displayed
              </p>
              <TweetNode
                id="tweet-loaded"
                :data="loadedTweet"
                :selected="false"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Error
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Failed to load tweet
              </p>
              <TweetNode
                id="tweet-error"
                :data="errorTweet"
                :selected="false"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>
          </div>
        </section>

        <!-- Interactive States -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Interactive States</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Normal
              </p>
              <TweetNode
                id="tweet-normal"
                :data="loadedTweet"
                :selected="false"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Selected
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Shows delete button on hover
              </p>
              <TweetNode
                id="tweet-selected"
                :data="loadedTweet"
                :selected="true"
                @load-tweet="handleLoadTweet"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'canvas' },
  },
}
