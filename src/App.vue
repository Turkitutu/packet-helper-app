<template>
  <span class="darkmode-text">Dark mode</span>
  <el-switch @change="toggleDark" v-model="lightMode" />
  <el-container class="app">
    <el-header class="el-header">
      <el-menu
        class="el-menu-demo"
        mode="horizontal"
        :default-active="selectedIndex"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in views"
          :key="item.index"
          :index="item.index"
          :disabled="item.disabled"
          >{{ item.name }}</el-menu-item
        >
      </el-menu>
    </el-header>
    <el-main class="el-main"> <router-view /> </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const isDark = useDark();
    const toggleDark = useToggle(isDark);
    const selectedIndex = ref("1");
    const router = useRouter();

    const lightMode = ref(true);

    router.push({ path: "/read" });

    const views = [
      { index: "1", name: "Read packet", to: "read", disabled: false },
      { index: "2", name: "Write packet", to: "write", disabled: true },
      { index: "3", name: "Tools", to: "", disabled: true },
    ];

    const handleSelect = (index: number) => {
      router.push({ path: "/" + views[index - 1].to });
    };

    return { toggleDark, selectedIndex, handleSelect, views, lightMode };
  },
});
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #0074e8;
}

.el-header {
  margin: 0 auto;
  min-width: 600px;
}

.el-main {
  margin-top: 50px;
}

.el-menu-demo {
  margin-top: 20px !important;
  font-size: 30px !important;
  text-align: center !important;
}

.el-menu--horizontal {
  display: flex !important;
  justify-content: center !important;
}

.el-menu-demo > .el-menu-item {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 18px !important;
}

.darkmode-text {
  font-size: 13px;
  margin-right: 5px;
}
</style>
