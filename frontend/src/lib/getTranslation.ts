import loginEn from "@/messages/login.en.json";
import loginAr from "@/messages/login.ar.json";

import signupEn from "@/messages/signup.en.json";
import signupAr from "@/messages/signup.ar.json";

const translations = {
    en: {
        login: loginEn.login,
        signup: signupEn.signup,
    },
    ar: {
        login: loginAr.login,
        signup: signupAr.signup,
    },
};

export const getTranslation = (locale: string) => {
    return translations[locale as keyof typeof translations] || translations.en;
};