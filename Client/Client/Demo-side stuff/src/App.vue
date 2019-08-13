<template>
  <div id="app">
    <link href="https://fonts.googleapis.com/css?family=Germania+One" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Lato:700" rel="stylesheet">
    <span class="title-span">
      <img class="title-logo" alt="2048 Royale Logo" src="./assets/logo.svg">
      <h1 class="title-text">2048 Battle Royale</h1>
    </span>
    <Board/>
  </div>
</template>

<script>
import Board from "./components/Board.vue";

export default {
  name: "app",
  components: {
    Board
  }
};
</script>

<style>
#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  padding-top: 40px;
  padding-bottom: 50px;
}

.title-text,
.title-logo {
  display: inline-block;
  vertical-align: baseline;
}
.title-logo {
  margin-right: -150px;
}
.title-text {
  margin-top: 0px;
  margin-bottom: 20px;
}
.title-span .title-text {
  font-family: "Germania One", Helvetica, Arial, sans-serif;
  font-size: 46px;
}
</style>
