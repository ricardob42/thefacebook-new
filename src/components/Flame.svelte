<script>
  let { lit = false } = $props();
</script>

<svg class="flame" class:lit viewBox="0 0 24 30" aria-hidden="true">
  <defs>
    <linearGradient id="flame-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: var(--flame-top)" />
      <stop offset="1" style="stop-color: var(--flame-bottom)" />
    </linearGradient>
  </defs>
  <path
    d="M13 1C14 7 20 10.5 20 18.5C20 24.2 16.5 28.5 12 28.5C7.5 28.5 4 24.4 4 19.2C4 15.6 5.8 12.8 7.6 10.8C7.8 13.2 8.8 14.8 10.2 15.6C9.6 10.6 10.6 4.6 13 1Z"
    fill="url(#flame-fill)"
  />
  <path
    d="M12.2 14.5C13 18 16 19.6 16 23.2C16 25.6 14.3 27 12.2 27C10 27 8.4 25.5 8.4 23.2C8.4 20.6 10.8 19 12.2 14.5Z"
    fill="#fff"
    fill-opacity="0.4"
  />
</svg>

<style>
  .flame {
    display: block;
    width: 26px;
    height: 32px;
    transform-origin: 50% 90%;
    transition: filter 0.4s;
  }

  .flame.lit {
    filter: drop-shadow(0 0 8px color-mix(in srgb, var(--flame-bottom) 55%, transparent));
    animation: flicker 2.4s ease-in-out infinite;
  }

  @keyframes flicker {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
    }
    30% {
      transform: scale(1.06, 1.1) rotate(-2deg);
    }
    60% {
      transform: scale(0.97, 1.03) rotate(1.5deg);
    }
  }
</style>
