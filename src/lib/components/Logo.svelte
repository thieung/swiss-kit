<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
  }

  let { size = 24, class: className = '' }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 512 512"
  xmlns="http://www.w3.org/2000/svg"
  class={className}
>
  <defs>
    <!-- Deep Technical Blue Gradient for a subtle modern touch -->
    <linearGradient id="engBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#172554;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background: Rounded Hexagon -->
  <!-- Points calculated for a regular hexagon, slightly rounded corners for modern UI feel -->
  <path d="M256 32
           L450 144
           L450 368
           L256 480
           L62 368
           L62 144
           Z"
        fill="url(#engBlue)"
        stroke="#1e3a8a"
        stroke-width="15"
        stroke-linejoin="round"/>

  <!-- Symbol: Code Brackets </> -->
  <g transform="translate(256, 256) scale(1.2)" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Bracket < -->
    <path d="M-55 -40 L-95 0 L-55 40" />

    <!-- Forward Slash / -->
    <path d="M20 -50 L-20 50" />

    <!-- Right Bracket > -->
    <path d="M55 -40 L95 0 L55 40" />
  </g>
</svg>
