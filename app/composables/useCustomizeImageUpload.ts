import { readFileAsDataUrl } from "~/utils/file";

type UseCustomizeImageUploadOptions = {
  initialImage?: string;
  requiredMessage: string;
  tooLargeMessage: string;
  processingFailedMessage: string;
  errorLogLabel: string;
  maxBytes?: number;
};

export const useCustomizeImageUpload = (options: UseCustomizeImageUploadOptions) => {
  const maxBytes = options.maxBytes ?? 1024 * 1024;

  const image = ref<string | undefined>(options.initialImage);
  const isCustomImage = ref(Boolean(options.initialImage));
  const customImageFile = shallowRef<File>();
  const attemptedSubmit = ref(false);
  const uploaderPreviewSrc = ref<string | undefined>(options.initialImage);
  const imageError = ref<string>();

  const requiredImageError = computed(() => {
    if (attemptedSubmit.value && isCustomImage.value && !image.value) {
      return options.requiredMessage;
    }

    return null;
  });

  const submitImageError = computed(() => requiredImageError.value);

  const clearImageError = () => {
    imageError.value = undefined;
  };

  const resetImageState = (nextImage?: string) => {
    image.value = nextImage;
    isCustomImage.value = Boolean(nextImage);
    customImageFile.value = undefined;
    attemptedSubmit.value = false;
    uploaderPreviewSrc.value = nextImage;
    clearImageError();
  };

  const markSubmitAttempted = () => {
    attemptedSubmit.value = true;
  };

  watch(isCustomImage, (enabled) => {
    if (enabled) {
      clearImageError();
      return;
    }

    uploaderPreviewSrc.value = undefined;
    image.value = undefined;
    customImageFile.value = undefined;
    attemptedSubmit.value = false;
    clearImageError();
  });

  watch(customImageFile, async (file) => {
    if (!file) {
      return;
    }

    attemptedSubmit.value = false;
    clearImageError();
    uploaderPreviewSrc.value = undefined;

    if (file.size > maxBytes) {
      imageError.value = options.tooLargeMessage;
      customImageFile.value = undefined;
      return;
    }

    try {
      const nextImage = await readFileAsDataUrl(file);
      image.value = nextImage;
      uploaderPreviewSrc.value = nextImage;
      clearImageError();
      isCustomImage.value = true;
    } catch (error) {
      console.error(`Failed to read ${options.errorLogLabel}:`, error);
      imageError.value = options.processingFailedMessage;
    }
  });

  return {
    image,
    imageError,
    isCustomImage,
    customImageFile,
    attemptedSubmit,
    uploaderPreviewSrc,
    requiredImageError,
    submitImageError,
    clearImageError,
    resetImageState,
    markSubmitAttempted,
  };
};
