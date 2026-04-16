import { useModal } from "vue-final-modal";
import ClaimSuccessModal from "~/components/modals/claim-success-modal.vue";
import type { MemoCustomize } from "~/types/memo";

interface ClaimSuccessModalAttrs {
  sn: string;
  collection: string;
  chain: string;
  memoName: string;
  memoImage: string;
  customization?: MemoCustomize;
}

export const useClaimSuccessModal = (
  claimedItemId: Ref<string | undefined>,
  getAttrs: () => Omit<ClaimSuccessModalAttrs, "sn"> | undefined,
) => {
  const state = reactive({
    shouldOpen: false,
    hasOpened: false,
  });

  watch(claimedItemId, (itemId) => {
    const attrs = getAttrs();

    if (!itemId || !attrs || !state.shouldOpen || state.hasOpened) {
      return;
    }

    state.hasOpened = true;
    state.shouldOpen = false;

    const { open: openSuccessModal } = useModal({
      component: ClaimSuccessModal,
      attrs: {
        sn: itemId,
        ...attrs,
      },
    });

    openSuccessModal();
  });

  const arm = () => {
    state.shouldOpen = true;
    state.hasOpened = false;
  };

  const disarm = () => {
    state.shouldOpen = false;
  };

  return { arm, disarm };
};
