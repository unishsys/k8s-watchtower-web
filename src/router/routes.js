const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/DeploymentsPage.vue") },
      {
        path: "/configmaps",
        component: () => import("pages/ConfigmapsPage.vue"),
      },
      {
        path: "/services",
        component: () => import("pages/ServicePage.vue"),
      },
      {
        path: "/test",
        component: () => import("pages/DepTest.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
