<template>
  <main class="relative flex flex-col bg-bg-persistent">
    <section v-if="!networkStatus" class="sticky top-0 z-10">
      <div class="flex items-center justify-center gap-3 bg-red-500 p-5">
        <p class="!text-white">You are offline. Please check your internet connection.</p>
      </div>
    </section>
    <section
      class="relative flex h-[75vh] flex-col items-center justify-center gap-10 bg-cover bg-left md:bg-center"
      :style="{
        backgroundImage: `url(${landingBackground})`,
        backgroundRepeat: 'no-repeat',
      }"
    >
      <div class="absolute inset-x-0 top-0 flex justify-center">
        <h1 class="mt-5 text-3xl !text-white">.MEMO</h1>
      </div>
      <p class="mt-16 text-4xl !text-white md:text-7xl">Your memories,<br />forever onchain</p>
      <div class="flex flex-row gap-5">
        <dot-button
          size="large"
          variant="primary"
          :disabled="!networkStatus"
          class="px-10 hover:!bg-white hover:!text-bg-persistent sm:px-20"
          @click="router.push('/claim')"
        >
          Claim
        </dot-button>
        <dot-button
          size="large"
          :variant="networkStatus ? 'tertiary-light' : 'primary'"
          :disabled="!networkStatus"
          class="px-10 sm:px-20"
          :class="{
            'hover:!bg-white hover:!text-bg-persistent': !networkStatus,
          }"
          @click="router.push('/create')"
        >
          Create
        </dot-button>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="!text-white">Powered by</p>
        <img :src="polkadotLogo" alt="polkadot logo" class="h-10" />
      </div>
    </section>

    <section class="mx-[10px] flex min-h-[40vh] flex-col justify-between gap-7 rounded-2xl bg-white p-10 md:mx-10">
      <p class="max-w-full text-4xl !text-bg-persistent sm:max-w-[66%] md:text-6xl">
        Capture your unforgettable moments as digital badges on the Polkadot network.
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex items-center justify-start">
          <p class="!text-black">Turn milestones into digital memories</p>
        </div>
        <div class="hidden justify-end">
          <dot-button class="w-full sm:w-auto" variant="tertiary-dark" size="large">Learn more</dot-button>
        </div>
      </div>
    </section>

    <section class="m-[10px] flex min-h-[50vh] flex-col md:m-10">
      <p class="m-6 text-3xl !text-white">How Dotmemo Works</p>

      <div class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-3xl bg-bg-card p-8 sm:p-12">
          <div class="mb-16 flex h-16 w-16 items-center justify-center rounded-full bg-k-primary">
            <img class="h-8 w-8" :src="claimIcon" />
          </div>
          <p class="text-2xl font-bold !text-white">Claim</p>
          <p class="!text-white">
            Receive a digital badge for attending or participating in special events, all securely stored on the
            Polkadot network.
          </p>
        </div>

        <div class="flex flex-col gap-2 rounded-3xl bg-bg-card p-8 sm:p-12">
          <div class="mb-16 flex h-16 w-16 items-center justify-center rounded-full bg-k-primary">
            <img class="h-8 w-8" :src="createNewIcon" />
          </div>
          <p class="text-2xl font-bold !text-white">Create</p>
          <p class="!text-white">
            Organizers can create unique badges to distribute at their events, giving attendees a tangible way to
            commemorate their experiences.
          </p>
        </div>

        <div class="flex flex-col gap-2 rounded-3xl bg-bg-card p-8 sm:p-12">
          <div class="mb-16 flex h-16 w-16 items-center justify-center rounded-full bg-k-primary">
            <img class="h-8 w-8" :src="communityIcon" />
          </div>
          <p class="text-2xl font-bold !text-white">Share & Showcase</p>
          <p class="!text-white">
            Show off your achievements by sharing your badges on social media or displaying them in your digital wallet.
          </p>
        </div>
      </div>
    </section>

    <section class="m-[10px] flex min-h-[40vh] flex-col gap-7 rounded-2xl bg-white p-10 md:m-10">
      <p class="text-4xl !text-bg-persistent md:text-6xl">Featured</p>

      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <a
          v-for="collection in collections"
          :key="collection.id"
          class="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-300"
          :href="kodaUrl(collection.id)"
          target="_blank"
        >
          <img
            :src="$purifyOne(collection.image, 'kodadot')"
            alt="collection image"
            class="h-full w-full rounded-xl object-cover"
          />

          <div class="absolute inset-x-0 bottom-0 z-20 h-full bg-gradient-to-t from-black/70 to-transparent"></div>

          <div class="absolute inset-x-0 bottom-0 z-30 overflow-hidden p-7">
            <p class="line-clamp-2 text-xl font-bold !text-white">{{ collection.name }}</p>
          </div>
        </a>
      </div>
    </section>
    <section class="m-[10px] flex min-h-[40vh] flex-col gap-7 rounded-2xl bg-bg-card p-10 md:m-10">
      <p class="text-4xl text-white md:text-6xl">Ecosystem Partners</p>

      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <a
          v-for="partner in partners"
          :key="partner.id"
          class="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-300"
          :href="partner.url"
          target="_blank"
        >
          <img :src="partner.img" alt="sponsor image" class="h-full w-full rounded-xl object-cover" />

          <div class="absolute inset-x-0 bottom-0 z-20 h-full bg-gradient-to-t from-black/70 to-transparent"></div>

          <div class="absolute inset-x-0 bottom-0 z-30 overflow-hidden p-7">
            <p class="line-clamp-2 text-xl font-bold !text-white">{{ partner.name }}</p>
          </div>
        </a>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import polkadotLogo from "@/assets/images/Polkadot.png";
import claimIcon from "@/assets/icons/claim.svg";
import createNewIcon from "@/assets/icons/create-new-from-source.svg";
import communityIcon from "@/assets/icons/community.svg";
import landingBackground from "@/assets/images/landing-background-2.png";
import { getClient } from "@kodadot1/uniquery";
import { $purifyOne } from "@kodadot1/minipfs";
definePageMeta({
  layout: "landing",
});

type Collection = {
  id: string;
  createdAt: string;
  name: string;
  image: string;
  metadata: string;
  currentOwner: string;
  issuer: string;
};

const router = useRouter();

const { prefix } = usePrefix();
const collections = ref<Collection[]>([]);

const client = getClient(prefix.value);
const ids = computed(() => (prefix.value === "ahp" ? ["107", "13", "163", "171"] : ["67", "167", "287", "477"]));
const query = client.collectionByIdIn(ids.value);
const result = await client.fetch<{ collections: Collection[] }>(query).catch((e) => {
  console.error("Error while fetching collections", e);
  return null;
});

collections.value = result?.data?.collections ?? [];

const kodaUrl = (id: string) => `https://kodadot.xyz/${prefix.value}/collection/${id}`;

const networkStatus = ref(true);
onMounted(() => {
  window.addEventListener("online", () => (networkStatus.value = true));
  window.addEventListener("offline", () => (networkStatus.value = false));
});

const partners = ref([
  {
    id: "1",
    name: "Learning Club",
    img: "/sponsors/learning-club.png",
    url: "https://x.com/gmlearningclub",
  },
  {
    id: "2",
    name: "Dot meetups",
    img: "/sponsors/dotmeetups.png",
    url: "https://dotmeetup.notion.site/Meetups-bounty-cd57b5990ba443559413dec3b339ab4a",
  },
  {
    id: "3",
    name: "Kodadot",
    img: "/sponsors/koda.png",
    url: "https://kodadot.xyz",
  },
]);
</script>
