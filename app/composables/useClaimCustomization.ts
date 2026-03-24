import type { MemoCustomize } from "~/types/memo";

interface ClaimData {
  customize?: MemoCustomize;
}

export const useClaimCustomization = (data: Ref<ClaimData | null>) => {
  const colorMode = useColorMode();
  const defaultAccentColor = "#55F39A";

  const accentColor = computed(() => {
    const color = data.value?.customize?.accentColor;
    return color || defaultAccentColor;
  });

  watch(
    () => data.value,
    (newData) => {
      if (newData?.customize?.darkMode !== undefined) {
        colorMode.value = newData.customize.darkMode ? "dark" : "light";
      }
    },
    { immediate: true },
  );

  return { accentColor };
};
