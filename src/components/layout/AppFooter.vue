<script setup lang="ts">
</script>

<template>
  <v-footer app class="bg-primary text-center d-flex flex-column">
    <div>
      <v-btn
        v-for="icon in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram']"
        :key="icon"
        class="mx-4"
        :icon="icon"
        variant="text"
      ></v-btn>
    </div>
    
    <div class="pt-0">
      باشگاه یاب &copy; {{ new Date().getFullYear() }}
    </div>
  </v-footer>
</template>