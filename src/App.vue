<script setup>
import { 
  VApp,
  VContainer,
 } from 'vuetify/components';

import AppBar from './components/AppBar.vue';
import { GoogleMap, Marker } from 'vue3-google-map'

const center = { lat: 33.4647, lng: 48.3390 }
</script>

<template>
  <v-app>
    <app-bar></app-bar>
    <v-container>
      <h1>Hello World</h1>
    </v-container>
  <GoogleMap
  api-key="AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao"
  style="width: 100%; height: 500px"
  :center="center"
  :zoom="15"
  >
    <Marker :options="{ position: center }" />
  </GoogleMap>
  </v-app>
</template>