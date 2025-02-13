// router
import { createRouter, createWebHistory } from "vue-router";

// components
import App from "@/App.vue";
import Map from "@/components/Map.vue";

const routes = [
    {
        path: "/",
        component: App,
        meta: {
            title: "باشگاه یاب - وب اپ",
        },
    },
    {
        path: "/Map",
        component: Map,
        meta: {
            title: "مپ",
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router;