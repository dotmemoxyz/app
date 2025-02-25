<template>
  <footer
    class="text-text-color absolute bottom-0 grid h-16 w-full grid-cols-3 items-center border-t border-accent-primary bg-[#0D2919]"
  >
    <a class="flex items-center gap-1 pl-5" target="_blank" href="https://github.com/dotmemoxyz/app/wiki">
      <p class="!text-white">Wiki</p>
      <Icon name="mdi:open-in-new" class="h-4 w-4 text-white" />
    </a>
    <span class="flex-1 text-center text-white">.MEMO 2024 {{ name }}</span>
    <div class="flex flex-row items-center justify-end gap-5 pr-5 md:gap-10">
      <a target="_blank" href="https://t.me/dotmemoxyz">
        <svg
          style="enable-background: new 0 0 512 512"
          version="1.1"
          viewBox="0 0 512 512"
          class="h-5 w-5 fill-white md:h-8 md:w-8"
          xml:space="preserve"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <g id="comp_x5F_335-telegram">
            <g>
              <path
                d="M484.689,98.231l-69.417,327.37c-5.237,23.105-18.895,28.854-38.304,17.972L271.2,365.631l-51.034,49.086    c-5.647,5.647-10.372,10.372-21.256,10.372l7.598-107.722L402.539,140.23c8.523-7.598-1.848-11.809-13.247-4.21L146.95,288.614    L42.619,255.96c-22.694-7.086-23.104-22.695,4.723-33.579L455.423,65.166C474.316,58.081,490.85,69.375,484.689,98.231z"
              />
            </g>
          </g>
          <g id="Layer_1" />
        </svg>
      </a>
      <a target="_blank" href="https://x.com/polkadotmemo">
        <svg
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          class="h-5 w-5 fill-white md:h-8 md:w-8"
          viewBox="0 0 24 24"
          style="enable-background: new 0 0 24 24"
          xml:space="preserve"
        >
          <path
            d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z"
          />
        </svg>
      </a>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const { prefix } = usePrefix();
const name = computed(() => (prefix.value === "ahp" ? "Polkadot" : "Kusama"));
</script>
