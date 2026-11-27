type IconName = 'arrow' | 'book' | 'code' | 'check' | 'pause' | 'play' | 'reset' | 'drag' | 'table' | 'key' | 'link' | 'nodes' | 'rows' | 'tag' | 'moon' | 'home' | 'chart' | 'cube'

const paths: Record<IconName, string> = {
  home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3V10Z',
  chart: 'M4 3v18h17M9 16v-4m5 4V8m5 8V5',
  cube: 'm12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10L3 7m9 5 9-5m-9 5v10M7.5 4.5l9 5',
  moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  book: 'M12 5c-3-3-7-3-10-2v16c3-1 7-1 10 2m0-16c3-3 7-3 10-2v16c-3-1-7-1-10 2V5Z',
  code: 'm8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20',
  check: 'M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M8 11l4 4L22 4',
  pause: 'M8 5v14M16 5v14',
  play: 'm8 4 12 8-12 8V4Z',
  reset: 'M3 10a9 9 0 1 1 1 7M3 3v7h7',
  drag: 'M9 11V6a3 3 0 0 1 6 0v5m-6-1V8a3 3 0 0 0-6 0v7a7 7 0 0 0 14 0v-4a3 3 0 0 0-2-3',
  table: 'M3 3h18v18H3V3Zm0 6h18M3 15h18M9 3v18',
  key: 'M15 3a6 6 0 0 0-5 9L3 19v2h4v-3h3l3-3a6 6 0 1 0 2-12Zm2 4h.01',
  link: 'm10 14 4-4m-6-1-3 3a4 4 0 0 0 6 6l3-3m-4-6 3-3a4 4 0 0 1 6 6l-3 3',
  nodes: 'M12 8V4m-2 7-5 6m9-6 5 6M15 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  rows: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
  tag: 'M3 3h9l10 10-9 9L3 12V3Zm5 5h.01',
}

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={paths[name]} />
  </svg>
}

export type { IconName }
