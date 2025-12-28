<template>
  <div id="side-menu" class="flex w-full items-center justify-end">
    <button class="activator" :class="{ active: navOpen }" @click="navOpen = !navOpen">
      <span class="top"></span>
      <span class="mid"></span>
      <span class="bottom"></span>
    </button>
    <transition name="fade">
      <nav v-if="navOpen" class="backdrop-blur-sm">
        <ul>
          <li v-for="link in links" :key="link.name" class="cursor-pointer transition ease-in-out">
            <nuxt-link :to="link.href" @click="closeNav">
              <span class="flex items-center gap-2 hover:text-text-secondary">
                {{ link.name }}
              </span>
            </nuxt-link>
          </li>
          <li class="flex items-center gap-2" @click="switchMode">
            <p class="block md:hidden">Color mode</p>
            <Icon
              :name="colorMode.preference === 'light' ? 'mdi:weather-sunny' : 'mdi:weather-night'"
              class="cursor-pointer text-text-primary"
              size="24"
            />
          </li>
          <li>
            <client-only>
              <dot-connect class="w-full md:w-auto" size="small">Connect</dot-connect>
            </client-only>
          </li>
          <li v-if="showAuthenticateButton">
            <dot-button variant="primary" size="large" :disabled="isAuthenticating" @click="handleAuthenticate">
              {{ isAuthenticating ? t("common.authenticating") : t("common.authenticate") }}
            </dot-button>
          </li>
        </ul>
      </nav>
    </transition>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n();
const accountStore = useAccountStore();
const { authorize } = useAuth();

const isAuthenticating = ref(false);

// Show authenticate button when wallet is connected but user is not authenticated
const showAuthenticateButton = computed(() => {
  return accountStore.hasSelectedAccount && !accountStore.token;
});

const links = computed(() => {
  const availableLinks = [
    { name: t("common.claim"), icon: "mdi:hand-back-right", href: "/claim" },
    {
      name: t("common.create"),
      icon: "mdi:credit-card-edit-outline",
      href: "/create",
    },
  ];

  // Only show manage link if user is both connected and authenticated
  if (accountStore.hasSelectedAccount && accountStore.token) {
    availableLinks.push({ name: t("common.manage"), icon: "mdi:account-cog", href: "/manage" });
  }

  return availableLinks;
});

const handleAuthenticate = async () => {
  if (isAuthenticating.value) return;

  isAuthenticating.value = true;
  try {
    await authorize();
  } catch (error) {
    console.error("Authentication failed:", error);
    // You might want to show a toast notification here
  } finally {
    isAuthenticating.value = false;
  }
};

const colorMode = useColorMode();

const switchMode = () => {
  colorMode.preference = colorMode.preference === "light" ? "dark" : "light";
};

const navOpen = ref(false);

onMounted(() => {
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navOpen.value = true;
    } else {
      navOpen.value = false;
    }
  });

  if (window.innerWidth > 768) {
    navOpen.value = true;
  } else {
    navOpen.value = false;
  }
});

const closeNav = () => {
  if (window.innerWidth < 768) {
    navOpen.value = false;
  }
};
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

#side-menu {
  nav {
    @apply fixed left-0 top-[60px] z-10 flex w-full flex-col items-center gap-10 bg-surface-white md:relative md:top-0 md:flex-row md:justify-between md:bg-transparent;

    ul {
      @apply flex w-full flex-col items-center justify-center md:flex-row md:justify-end;
      li {
        @apply box-border flex h-[80px] w-full cursor-pointer items-center justify-start border-b px-2 md:w-auto md:cursor-auto md:border-none dark:border-white;
        a {
          @apply w-full hover:!border-white md:w-auto;

          &.router-link-exact-active {
            @apply !text-accent-primary;
          }
        }
      }
    }
  }
  button.activator {
    @apply relative z-[100] block h-[30px] w-[30px] cursor-pointer appearance-none border-none outline-none md:hidden;

    span {
      @apply absolute bottom-0 left-0 right-0 top-0 m-auto block h-[2px] w-[20px] bg-text-primary transition-all duration-300 ease-in-out;

      &.top {
        transform: translateY(-8px);
      }

      &.bottom {
        transform: translateY(8px);
      }
    }
    &.active {
      .top {
        transform: rotate(-45deg);
      }
      .mid {
        transform: translateX(-20px) rotate(360deg);
        opacity: 0;
      }
      .bottom {
        transform: rotate(45deg);
      }
    }
  }
}
</style>
