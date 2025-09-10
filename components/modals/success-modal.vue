<template>
  <vue-final-modal
    modal-id="success-modal"
    class="flex items-center justify-center overflow-hidden"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 overflow-hidden md:w-1/2 xl:w-1/3 flex-col max-h-[calc(100vh-40px)] p-6 gap-4 bg-surface-white rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex items-center justify-between pb-1">
      <h1 class="text-xl font-semibold text-text-primary">{{ t("create.success.title") }}</h1>
      <button @click="closeModal()">
        <Icon name="mdi:close" size="32" class="text-text-primary" />
      </button>
    </div>

    <hr class="-mx-6" />

    <div class="flex w-full justify-between rounded-xl border border-accent-primary bg-emerald-400/10 px-3 py-3">
      <p class="inline-flex items-center justify-center gap-2 font-medium text-accent-primary">
        <icon name="mdi:check" size="24" />
        <span>{{ t("create.success.confirmed") }}</span>
      </p>
      <a class="inline-flex items-center justify-center gap-2 text-text-primary hover:underline" :href="hashLink">
        <span>{{ t("create.success.viewTx") }}</span>
        <icon name="mdi:arrow-top-right" size="24" />
      </a>
    </div>

    <image-preview :src="imagePreviewSrc" />

    <p class="text-center text-text-primary">
      {{ t("create.success.created1") }} <span class="text-accent-primary">{{ props.name }}</span>
      {{ t("create.success.created2") }} <span class="text-accent-primary">{{ props.quantity }}</span>
      {{ t("create.success.created3") }}
    </p>

    <hr class="mx-6" />

    <div class="mb-5 flex flex-row items-center justify-center gap-5 md:gap-10">
      <a target="_blank" href="https://t.me/dotmemoxyz">
        <svg
          style="enable-background: new 0 0 512 512"
          version="1.1"
          viewBox="0 0 512 512"
          class="size-5 fill-black md:size-7 dark:fill-white"
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
          class="size-5 fill-black md:size-7 dark:fill-white"
          viewBox="0 0 24 24"
          style="enable-background: new 0 0 24 24"
          xml:space="preserve"
        >
          <path
            d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z"
          />
        </svg>
      </a>
      <button class="inline-flex items-center justify-center" @click="copyLink">
        <icon name="mdi:content-copy" class="text-lg text-black md:text-2xl dark:text-white" />
      </button>
    </div>

    <div class="flex items-center gap-3">
      <dot-button variant="tertiary" size="medium" @click="generateQR()">
        <Icon name="mdi:download" class="size-[32px] text-text-primary" />
        {{ t("create.success.qr") }}
      </dot-button>
      <dot-button variant="primary" size="medium" class="flex-1" @click="claim()">
        <span class="h-[28px]" />
        {{ t("create.success.claim") }}
      </dot-button>
    </div>
  </vue-final-modal>
</template>

<script setup lang="ts">
import { useVfm, VueFinalModal } from "vue-final-modal";
import QRCode from "qrcode";

const { t } = useI18n();

const props = defineProps<{
  quantity: number;
  name: string;
  secret: string;
  chain: string;
  image: File;
  tx: string;
}>();

const hashLink = computed(() => {
  if (props.chain === "ahp") {
    return `https://assethub-polkadot.subscan.io/extrinsic/${props.tx}`;
  }

  return `https://assethub-kusama.subscan.io/extrinsic/${props.tx}`;
});

const vfm = useVfm();
const closeModal = () => vfm.close("success-modal");

const imagePreviewSrc = ref("");

onMounted(() => {
  const reader = new FileReader();
  reader.onload = (e) => (imagePreviewSrc.value = e.target?.result as string);
  reader.readAsDataURL(props.image);
});

const copyLink = async (ev: MouseEvent) => {
  await copy(`${location.origin}/claim/${props.secret}`);

  const el = document.createElement("span");
  el.innerText = "✅";
  el.style.fontSize = "32px";
  el.style.position = "fixed";
  el.style.top = "0px";
  el.style.left = "0px";
  el.style.zIndex = "9999";
  el.style.pointerEvents = "none";
  el.style.transform = `translate(${ev.clientX - 10}px, ${ev.clientY - 10}px) scale(0)`;
  el.style.transition = "transform 1s ease, opacity 1.5s ease";
  el.style.opacity = "1";

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 1100);
  requestAnimationFrame(() => {
    const offsetX = Math.random() * 20 - 10;
    el.style.transform = `translate(${ev.clientX - 10 + offsetX * 3}px, ${ev.clientY - 10 - 100}px) scale(1.5)`;
    el.style.opacity = "0";
  });
};

const generateQR = async () => {
  const urlToEncode = `https://app.novawallet.io/open/dapp?url=${window.location.origin}/claim/${props.secret}`;
  const qrcodeDataURI = await QRCode.toDataURL(urlToEncode, {
    margin: 1,
    scale: 10,
  });

  const link = document.createElement("a");
  link.href = qrcodeDataURI;
  link.download = `${props.name.replaceAll(" ", "-")}-qrcode`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const router = useRouter();
const claim = () => (router.push(`/claim/${props.secret}`), closeModal());
</script>
