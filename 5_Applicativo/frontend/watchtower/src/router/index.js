import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Temperature from "@/views/Temperature.vue";
import Humidity from "@/views/Humidity.vue";
import CO2 from "@/views/CO2.vue";
import AC from "@/views/AC.vue";
import Notifications from "@/views/Notifications.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/temperature",
      name: "temperature",
      component: Temperature,
    },
    {
      path: "/humidity",
      name: "humidity",
      component: Humidity,
    },
    {
      path: "/co2",
      name: "co2",
      component: CO2,
    },
    {
      path: "/access",
      name: "access",
      component: AC,
      meta: { requiresRole: ["docente", "sistemista"] },
    },
    {
      path: "/notifications",
      name: "notifications",
      component: Notifications,
      meta: { requiresRole: ["docente", "sistemista"] },
    },
  ],
});

function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.role;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

function isTokenExpired() {
  const token = localStorage.getItem("token");
  if (!token) {
    return true;
  }

  const tokenExp = JSON.parse(atob(token.split(".")[1])).exp * 1000;
  return tokenExp < Date.now();
}

router.beforeEach((to, from, next) => {
  if (to.path === "/login") {
    return next();
  }
  if (isTokenExpired()) {
    router.push('/login');
  }

  const role = getUserRole();

  if (to.meta.requiresRole) {
    if (!role || !to.meta.requiresRole.includes(role)) {
      alert("Access Denied!");
      return next("/");
    }
  }

  next();
});

export default router;
