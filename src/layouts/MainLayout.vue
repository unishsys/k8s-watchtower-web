<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-header text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>

          <div class="row">
            <q-avatar>
              <img src="../../public/icons/logo.png" />
            </q-avatar>

            <div class="text-h5 text-weight-light self-center q-ml-sm">
              Kube Watchtower
            </div>

            <div class="self-center absolute-right q-mr-md">
              <q-icon clickable @click="toggleDark" name="img:../../public/icons/dark-mode.svg" size="1.5em" />
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" label="Overview" />
        <q-route-tab to="/deployments" label="Deployments" />
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
