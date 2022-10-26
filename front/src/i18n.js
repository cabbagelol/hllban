import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { detectLanguage } from './mixins/common'
import { storage } from "../src/assets/js"
import lang from "../public/conf/languages.json"
import store from './store'

import zh from 'view-design/dist/locale/zh-CN';

import zh_bfban from './lang/zh.json' // 中文

Vue.use(VueI18n)
Vue.locale = () => {};

const i18n = new VueI18n({
  locale: storage.get('language')?.data?.value ?? navigator.language,
  fallbackLocale: lang.default,
  messages:{
    'zh-CN': Object.assign(zh, zh_bfban), // 中文
  },
  silentTranslationWarn: true,
});

// 我们已經加載的语言
const loadedLanguages = []
function setI18nLanguage (lang) {
  i18n.locale = lang
  store.commit('res_lang',lang);
  return lang
}

/**
 * 延迟加载
 * @param lang
 * @returns {Promise<*>|Promise<unknown>}
 */
let loadLanguageAsync = (lang) => {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      /* webpackChunkName: "lang-[request]" */
      return import(`@/lang/${lang}`).then(msgs => {
        i18n.setLocaleMessage(lang, msgs)
        loadedLanguages.push(lang)

        return setI18nLanguage(lang)
      })
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}

i18n.loadLanguageAsync = loadLanguageAsync;
i18n.setI18nLanguage = setI18nLanguage;
export default i18n;
