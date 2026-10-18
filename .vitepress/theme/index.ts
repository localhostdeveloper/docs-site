// The default theme plus our own styles: custom.css (docs) and marketing.css
// (the home, Media Server, Packages, About, Contact and Order pages), and the
// Contact and Order pages' forms.
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ContactForm from "./components/ContactForm.vue";
import OrderForm from "./components/OrderForm.vue";
import "./custom.css";
import "./marketing.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ContactForm", ContactForm);
    app.component("OrderForm", OrderForm);
  },
} satisfies Theme;
