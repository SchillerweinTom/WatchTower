import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Temperature from '@/views/Temperature.vue'
import Humidity from '@/views/Humidity.vue'
import CO2 from '@/views/CO2.vue'
import AC from '@/views/AC.vue'
import Notifications from '@/views/Notifications.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/temperature',
      name: 'temperature',
      component: Temperature,
    },
    {
      path: '/humidity',
      name: 'humidity',
      component: Humidity,
    },
    {
      path: '/co2',
      name: 'co2',
      component: CO2,
    },
    {
      path: '/access',
      name: 'access',
      component: AC,
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
    }
  ],
})

export default router
