import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/read",
    name: "read",
    component: () => import("../views/read.vue"),
  },
  {
    path: "/write",
    name: "write",
    component: () => import("../views/write.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
