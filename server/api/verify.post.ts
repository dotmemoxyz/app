import type { SelfAppDisclosureConfig } from "@selfxyz/common";
import { countryCodes, SelfBackendVerifier, AllIds, DefaultConfigStore, type VerificationConfig } from "@selfxyz/core";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { attestationId, proof, publicSignals, userContextData } = body;

    if (!proof || !publicSignals || !attestationId || !userContextData) {
      throw createError({
        statusCode: 400,
        statusMessage: "Proof, publicSignals, attestationId and userContextData are required",
      });
    }

    const runtimeConfig = useRuntimeConfig();

    const disclosures_config: VerificationConfig = {
      excludedCountries: [],
      ofac: false,
      minimumAge: 18,
    };
    const configStore = new DefaultConfigStore(disclosures_config);

    const selfBackendVerifier = new SelfBackendVerifier(
      (runtimeConfig.public.selfScope as string) || "self-workshop",
      (runtimeConfig.public.selfEndpoint as string) || "",
      true,
      AllIds,
      configStore,
      "hex",
    );

    const result = await selfBackendVerifier.verify(attestationId, proof, publicSignals, userContextData);

    if (!result.isValidDetails.isValid) {
      throw createError({
        statusCode: 500,
        statusMessage: "Verification failed",
        data: {
          status: "error",
          result: false,
          message: "Verification failed",
          details: result.isValidDetails,
        },
      });
    }

    const saveOptions = (await configStore.getConfig(
      result.userData.userIdentifier,
    )) as unknown as SelfAppDisclosureConfig;

    if (result.isValidDetails.isValid) {
      return {
        status: "success",
        result: result.isValidDetails.isValid,
        credentialSubject: result.discloseOutput,
        verificationOptions: {
          minimumAge: saveOptions.minimumAge,
          ofac: saveOptions.ofac,
          excludedCountries: saveOptions.excludedCountries?.map((countryName) => {
            const entry = Object.entries(countryCodes).find(([_, name]) => name === countryName);
            return entry ? entry[0] : countryName;
          }),
        },
      };
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: "Verification failed",
        data: {
          status: "error",
          result: result.isValidDetails.isValid,
          message: "Verification failed",
          details: result,
        },
      });
    }
  } catch (error) {
    console.error("Error verifying proof:", error);

    // If it's already a Nuxt error, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // Otherwise, create a new error
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        status: "error",
        result: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});
