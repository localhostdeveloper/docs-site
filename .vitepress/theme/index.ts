// The default theme plus our own styles: custom.css (docs) and marketing.css
// (the home, Media Server, Packages, About and Contact pages), and the
// Contact page's form.
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ContactForm from "./components/ContactForm.vue";
import "./custom.css";
import "./marketing.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ContactForm", ContactForm);
  },
} satisfies Theme;
