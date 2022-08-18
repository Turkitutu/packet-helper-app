<template>
  <el-container>
    <el-header>
      <el-tabs class="demo-tabs">
        <el-tab-pane label="User" name="first">User</el-tab-pane>
        <el-tab-pane label="Config" name="second">Config</el-tab-pane>
        <el-tab-pane label="Role" name="third">Role</el-tab-pane>
        <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
      </el-tabs>
    </el-header>

    <el-main> <router-view /> </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useDark, useToggle } from "@vueuse/core";

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const isDark = useDark();
    const toggleDark = useToggle(isDark);
    toggleDark();
    return { toggleDark };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #545c64;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs__item {
  font-size: 20px !important;
  font-weight: 400 !important;
}
</style>
