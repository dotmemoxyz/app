<template>
  <div class="bg-surface-page mx-auto min-h-screen max-w-[1400px] pb-[80px] pt-[40px]">
    <!--Profile Section -->
    <div class="mb-[50px]">
      <div
        v-if="profilePending || memosPending"
        class="relative flex w-full flex-col overflow-hidden rounded-[32px] bg-surface-card p-[24px] shadow-sm"
      >
        <div class="flex flex-col items-center gap-[24px]">
          <!-- Profile image skeleton -->
          <dot-skeleton class="h-[100px] w-[100px] rounded-full sm:h-[120px] sm:w-[120px]" />

          <!-- Title skeleton -->
          <dot-skeleton class="h-[40px] w-[240px] sm:h-[48px] sm:w-[320px]" roundness="md" />

          <!-- Address subtitle skeleton -->
          <dot-skeleton class="h-[20px] w-[200px] sm:w-[280px]" roundness="md" />

          <!-- Stats skeleton -->
          <dot-skeleton class="h-[24px] w-[260px] sm:w-[320px]" roundness="md" />
        </div>
      </div>

      <div
        v-else
        class="relative flex w-full flex-col overflow-hidden rounded-[32px] bg-surface-card shadow-sm transition-shadow"
      >
        <div class="flex grow flex-col items-center justify-center p-[48px] text-center">
          <div class="flex flex-col items-center gap-[16px]">
            <!-- Profile Image -->
            <div
              v-if="profile?.image"
              class="h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-surface-card shadow-lg"
              :class="{ 'ring-4 ring-surface-card': profile?.banner }"
            >
              <img :src="profile.image" :alt="profile.name || 'Profile'" class="h-full w-full object-cover" />
            </div>
            <div
              v-else
              class="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-surface-card bg-accent-primary/10 text-[40px] font-bold text-accent-primary shadow-lg"
            >
              {{ displayName.charAt(0).toUpperCase() }}
            </div>

            <div class="flex flex-col items-center">
              <h1 class="text-[40px] font-bold leading-[48px] text-text-primary">{{ profile?.name || address }}</h1>
              <p class="font-mono text-[16px] text-text-secondary">{{ address }}</p>
            </div>

            <div v-if="profile?.socials && profile.socials.length > 0" class="flex items-center gap-[12px]">
              <a
                v-for="social in profile.socials"
                :key="social.platform"
                :href="social.link"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-surface-page flex items-center gap-[6px] rounded-full px-[12px] py-[6px] text-[14px] text-text-secondary transition-colors hover:bg-accent-primary/10 hover:text-accent-primary"
              >
                <Icon :name="getSocialIcon(social.platform)" size="16" />
                <span>{{ social.handle || social.platform }}</span>
              </a>
            </div>

            <div v-if="memos.length" class="mt-[12px] flex items-center gap-[8px]">
              <Icon name="mdi:sparkles" class="text-accent-primary" />
              <p class="text-[16px] font-medium text-text-primary">
                <span class="font-bold">{{ memos.length }} Memos</span> collected since
                <span class="text-text-secondary">{{ firstmemoDate || "Unknown" }}</span>
              </p>
              <Icon name="mdi:sparkles" class="text-accent-primary" />
            </div>
          </div>
        </div>

        <div class="absolute right-[24px] top-[24px]">
          <button
            class="hover:bg-surface-page flex items-center gap-[8px] rounded-full border border-border-default bg-surface-white px-[16px] py-[8px] text-[14px] font-medium text-text-primary transition-colors"
            type="button"
            @click="shareProfile"
          >
            <Icon name="mdi:share-variant-outline" size="18" />
            Share
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-[48px]">
      <!--Memos Skeleton loading -->
      <div v-if="memosPending" class="grid w-full grid-cols-1 gap-[32px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <dot-skeleton v-for="i in 8" :key="i" class="min-h-[300px] w-full sm:min-h-[350px]" roundness="lg" />
      </div>

      <!-- Grouped memos -->
      <div v-else class="flex flex-col space-y-8">
        <div
          v-if="!groupedMemos.length"
          class="flex flex-col items-center justify-center px-[32px] py-[80px] text-center"
        >
          <div
            class="mb-[16px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary"
          >
            <Icon name="mdi:message-off-outline" size="32" />
          </div>
          <h3 class="text-[20px] font-semibold text-text-primary">No memos yet</h3>
          <p class="mt-[8px] max-w-[440px] text-[14px] text-text-secondary">This account hasn't collected any memos</p>
        </div>

        <template v-else>
          <div v-for="(group, index) in groupedMemos" :key="index" class="w-full">
            <div class="mb-[24px]">
              <h2 class="font-mono text-[24px] font-black uppercase text-text-primary opacity-30">{{ group.label }}</h2>
            </div>

            <div
              v-if="group.type === 'data'"
              class="grid w-full grid-cols-1 gap-[32px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <ManageDropCard
                v-for="memo in group.items"
                :key="memo.id"
                :drop="memo"
                :ownership="'collected'"
                action-label="View Memo"
                hide-heading
                @action="handleMemoAction(memo)"
              />
            </div>

            <div
              v-else
              class="relative w-full overflow-hidden rounded-[24px] border-2 border-dashed border-text-secondary/10 bg-surface-card/50 px-[24px] py-[32px]"
            >
              <div class="flex w-full flex-col items-center justify-center gap-[16px] text-center">
                <div class="mb-[8px] opacity-50">
                  <Icon name="ph:moon-stars-fill" size="48" class="text-text-secondary/40" />
                </div>
                <h3 class="font-mono text-[20px] font-black uppercase tracking-widest text-[#D8B4FE] opacity-80">
                  {{ group.count > 1 ? "SOME BORING MONTHS" : "QUITE A BORING MONTH" }}
                </h3>
                <div
                  class="absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r from-transparent via-text-secondary/5 to-transparent"
                ></div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import ManageDropCard from "~/components/manage/drop-card.vue";
import type { Memo } from "~/types/memo";
import { fetchProfileByAddress, Socials, type Profile as _Profile } from "~/services/profile";
import { addressShortener } from "~/utils/account";
import type { Prefix } from "@kodadot1/static";

const route = useRoute();
const chain = computed(() => route.params.chain as Prefix);
const address = computed(() =>
  (route.params.address as string) ? formatAddressByPrefix(route.params.address as string, chain.value) : "",
);
const requestURL = useRequestURL();

const { data: profile, pending: profilePending } = useAsyncData(
  computed(() => `profile-${chain.value}-${address.value}`),
  () => fetchProfileByAddress(toDefaultAddress(address.value)),
  { watch: [chain, address] },
);

const { data: memosData, pending: memosPending } = useAsyncData(
  computed(() => `user-memos-${chain.value}-${address.value}`),
  () => $fetch<Memo[]>(`/api/user/${chain.value}/${address.value}/memos`),
  { watch: [chain, address], default: () => [] },
);

const memos = computed(() => memosData.value || []);
const profileUrl = computed(() => `${requestURL.origin}${route.fullPath}`);

const displayName = computed(() => (profile.value?.name ? profile.value.name : addressShortener(address.value, 6, -4)));

async function shareProfile() {
  if (!import.meta.client) return;

  const url = profileUrl.value;
  const title = profile.value?.name || displayName.value;

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (err) {
      // Fallback to clipboard on any share error (including user cancellation)
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  }
}

function handleMemoAction(memo: Memo) {
  window.open(`https://chaotic.art/${memo.chain}/collection/${memo.id}`, "_blank", "noopener,noreferrer");
}

function getSocialIcon(platform: Socials | string): string {
  switch (platform) {
    case Socials.Twitter:
      return "mdi:twitter";
    case Socials.Website:
      return "mdi:web";
    case Socials.Farcaster:
      return "simple-icons:farcaster";
    default:
      return "mdi:link";
  }
}

type GroupItem =
  | { type: "data"; label: string; items: Memo[]; date: DateTime }
  | { type: "empty"; label: string; count: number; date: DateTime };

const groupedMemos = computed(() => {
  const sorted = [...memos.value]
    .filter((d): d is Memo & { createdAt: string } => !!d.createdAt)
    .sort((a, b) => DateTime.fromISO(b.createdAt).toMillis() - DateTime.fromISO(a.createdAt).toMillis());

  if (sorted.length === 0 || !sorted[0]) return [];

  const groups: GroupItem[] = [];
  let currentGroup: Memo[] = [];
  let currentMonth = DateTime.fromISO(sorted[0].createdAt).startOf("month");

  const formatMonth = (dt: DateTime) => dt.toFormat("MMMM yyyy").toUpperCase();

  for (const memo of sorted) {
    const memoDate = DateTime.fromISO(memo.createdAt!).startOf("month");

    if (memoDate.equals(currentMonth)) {
      currentGroup.push(memo);
    } else {
      groups.push({
        type: "data",
        label: formatMonth(currentMonth),
        items: currentGroup,
        date: currentMonth,
      });

      let pointer = currentMonth.minus({ months: 1 });
      const gapStart = pointer;
      let gapCount = 0;

      while (pointer > memoDate) {
        gapCount++;
        pointer = pointer.minus({ months: 1 });
      }

      if (gapCount > 0) {
        const gapEnd = pointer.plus({ months: 1 });

        if (gapCount === 1) {
          groups.push({
            type: "empty",
            label: formatMonth(gapStart),
            count: 1,
            date: gapStart,
          });
        } else {
          const startStr = gapEnd.toFormat("MMM").toUpperCase();
          const endStr = gapStart.toFormat("MMM").toUpperCase();
          const startYear = gapEnd.toFormat("yyyy");
          const endYear = gapStart.toFormat("yyyy");
          const yearStr = endYear;

          groups.push({
            type: "empty",
            label:
              startYear !== endYear
                ? `${startStr} ${startYear} - ${endStr} ${endYear}`
                : `${startStr} - ${endStr} ${yearStr}`,
            count: gapCount,
            date: gapStart,
          });
        }
      }

      currentMonth = memoDate;
      currentGroup = [memo];
    }
  }

  if (currentGroup.length > 0) {
    groups.push({
      type: "data",
      label: formatMonth(currentMonth),
      items: currentGroup,
      date: currentMonth,
    });
  }

  return groups;
});

const firstmemoDate = computed(() => {
  if (memos.value.length === 0) return null;
  const sorted = [...memos.value]
    .filter((d): d is Memo & { createdAt: string } => !!d.createdAt)
    .sort((a, b) => DateTime.fromISO(a.createdAt).toMillis() - DateTime.fromISO(b.createdAt).toMillis());
  const first = sorted[0];
  if (!first) return null;
  return DateTime.fromISO(first.createdAt).toFormat("MMM dd, yyyy");
});
</script>
