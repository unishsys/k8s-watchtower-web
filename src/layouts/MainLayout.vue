<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          K8s Manager
          <q-icon side name="star_half" clickable @click="toggleDark">

          </q-icon>
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" label="Deployments" />
        <q-route-tab to="/configmaps" label="ConfigMaps" />
        <q-route-tab to="/services" label="Services" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>

defineOptions({
  name: 'MainLayout'
})

import { useQuasar } from 'quasar'

const $q = useQuasar()


function toggleDark() {
  $q.dark.toggle()
}


</script>
