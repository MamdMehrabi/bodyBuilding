<script setup>
import {
  VIcon,
  VBtn,
} from "vuetify/components";
import { ref } from "vue";
import router from "@/router";

const nav = ref(setNav())

    function setNav() {
        switch (router.currentRoute._value.fullPath) {
            case "/": return 0
        }
    }
</script>

<template>
  <v-bottom-navigation grow v-model="nav" class="mx-auto rounded-xl border" active style="bottom: 7px; background-color: rgba(255, 255, 255, .1); backdrop-filter: blur(10px);">
        <v-btn @click.stop="router.push('/'); nav =0">
            <v-icon>mdi-home-outline</v-icon>

            <span class="vazir navigation-item">خانه</span>
        </v-btn>

        <v-btn @click.stop="router.push('/map'); nav =3">
            <v-icon></v-icon>

            <span class="vazir navigation-item">نقشه</span>
        </v-btn>

        <!-- <v-btn @click.stop="router.push('/actors'); nav =3">
          <v-icon>mdi-account-box-outline</v-icon>

          <span class="vazir navigation-item">بازیگران</span>
        </v-btn> -->

        <v-btn @click.stop="router.push('/series'); nav =2">
            <v-icon>mdi-movie-roll</v-icon>

            <span class="vazir navigation-item">سریال ها</span>
        </v-btn>
        
        <v-btn @click.stop="router.push('/search'); nav =1">
            <v-icon>mdi-magnify</v-icon>

            <span class="vazir navigation-item">جستجو</span>
        </v-btn>


  </v-bottom-navigation>
</template>

<style scoped>

* {
  direction: rtl;
}
a {
  text-decoration: none;
  color: rgb(0, 0, 0);
}

.navigation-item {
  letter-spacing: 0;
}

.vazir {
  font-family: 'vazir';
}

</style>
